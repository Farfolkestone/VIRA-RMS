import {
  RoomCategoryCode,
  ROOM_CATEGORIES,
  TOTAL_HOTEL_ROOMS,
  SyncFreshness,
  RMSReconciliation,
  CommercialStrategy,
  DayCategoryTOPSYS,
  DayCategoryDEdge,
  DayCategoryRate,
} from '../types/hotel';

/**
 * Calculates physical occupancy by discounting flagged fictitious reservations.
 */
export function calculateRealPhysicalOccupancy(occupiedRooms: number, fictitiousBookings: number): number {
  return Math.max(0, occupiedRooms - Math.max(0, fictitiousBookings));
}

/**
 * Computes available physical rooms for a given category.
 * Accounts for total capacity and real physical occupancy.
 */
export function calculateFreePhysicalRooms(totalCapacity: number, realPhysicalOccupancy: number): number {
  return Math.max(0, totalCapacity - realPhysicalOccupancy);
}

/**
 * Validates whether DCAD or other categories respect physical inventory limits.
 */
export function calculateCategoryCapacity(category: RoomCategoryCode): number {
  return ROOM_CATEGORIES[category]?.totalRooms ?? 0;
}

/**
 * Evaluates RMS Reconciliation between TOPSYS physical and D-Edge commercial stock.
 * Rules:
 * 1. If mapping is unreliable, confidence drops and comparison is inconclusive.
 * 2. If TOPSYS is stale (>18h), recommendation is blocked for operational safety.
 * 3. If published commercial stock exceeds admissible free stock, OVERBOOKING RISK is flagged.
 * 4. If free stock > 0 but commercial stock is 0 or closed, UNDER-COMMERCIALIZATION is flagged.
 */
export function reconcileStocks(
  topsys: DayCategoryTOPSYS,
  dedge: DayCategoryDEdge | null,
  isMappingReliable = true
): RMSReconciliation {
  const category = topsys.category;
  const physicalFree = topsys.freePhysicalRooms;

  if (!isMappingReliable || !dedge) {
    return {
      date: topsys.date,
      category,
      physicalFree,
      commercialPublished: dedge ? dedge.publishedStock : 0,
      stockDelta: 0,
      isOverbookingRisk: false,
      isUnderCommercialized: false,
      isMappingReliable: false,
      confidenceScore: 30,
      dataStatus: !dedge ? 'PARTIAL' : 'UNMAPPED',
      recommendation: 'Correspondance PMS/D-Edge non qualifiée. Rapprochement suspendu.',
      recommendationBlockedReason: 'Code produit non mappé dans le dictionnaire de correspondances TOPSYS/D-Edge.',
    };
  }

  const commercialPublished = dedge.publishedStock;
  const stockDelta = commercialPublished - physicalFree;
  const isOverbookingRisk = commercialPublished > physicalFree;
  const isUnderCommercialized = physicalFree > 0 && (commercialPublished === 0 || dedge.status === 'FERME' || dedge.status === 'VENTE_FERMEE');

  let dataStatus: RMSReconciliation['dataStatus'] = 'OK';
  let confidenceScore = 95;
  let recommendationBlockedReason: string | undefined;

  if (topsys.isStale || topsys.freshness === 'EXPIRED') {
    dataStatus = 'STALE';
    confidenceScore = 40;
    recommendationBlockedReason = 'Données TOPSYS périmées (>18h). Recommandation automatique suspendue par sécurité.';
  } else if (dedge.isPartial) {
    dataStatus = 'PARTIAL';
    confidenceScore = 60;
    recommendationBlockedReason = 'Collecte D-Edge partielle. Seuls certains plans ont été observés.';
  } else if (dedge.status === 'INCONNU') {
    dataStatus = 'UNKNOWN';
    confidenceScore = 50;
  }

  let recommendation: string | undefined;
  if (!recommendationBlockedReason) {
    if (isOverbookingRisk) {
      recommendation = `Réduire d'urgence le stock commercial D-Edge de ${commercialPublished} à ${physicalFree} (Risque surbooking: +${stockDelta}).`;
    } else if (isUnderCommercialized) {
      recommendation = `Ouvrir à la commercialisation: ${physicalFree} chambres physiques libres actuellement non vendues sur D-Edge.`;
    } else {
      recommendation = `Alignement conforme: ${commercialPublished} chambres en vente pour ${physicalFree} libres.`;
    }
  }

  return {
    date: topsys.date,
    category,
    physicalFree,
    commercialPublished,
    stockDelta,
    isOverbookingRisk,
    isUnderCommercialized,
    isMappingReliable: true,
    confidenceScore,
    dataStatus,
    recommendation,
    recommendationBlockedReason,
  };
}

/**
 * Calculates rate plan expected price based on reference RACK RO FLEX.
 * Preserves cents, does not force rounded integers.
 */
export function calculateExpectedRate(
  rackRoFlex: number,
  family: string,
  planCode: string
): number {
  switch (family) {
    case 'RACK':
      if (planCode.includes('BB')) return Number((rackRoFlex + 18.0).toFixed(2));
      return Number(rackRoFlex.toFixed(2));
    case 'OTA':
      if (planCode.includes('BB')) {
        const otaRo = rackRoFlex * 0.90;
        return Number((otaRo + 18.0).toFixed(2));
      }
      return Number((rackRoFlex * 0.90).toFixed(2));
    case 'MOBILE':
      // 10% below OTA RO = 81% of RACK RO
      return Number((rackRoFlex * 0.90 * 0.90).toFixed(2));
    case 'BEST_RATE':
      if (planCode.includes('BB')) {
        return Number((rackRoFlex * 0.85 + 18.0).toFixed(2));
      }
      return Number((rackRoFlex * 0.85).toFixed(2));
    case 'VIP':
      return Number((rackRoFlex * 0.80).toFixed(2));
    case 'PROMO':
      return Number((rackRoFlex * 0.75).toFixed(2));
    case 'EXP':
      return Number((rackRoFlex * 0.88).toFixed(2));
    default:
      return Number(rackRoFlex.toFixed(2));
  }
}

/**
 * Verifies if observed price diverges from calculated expected price by more than tolerance (default 1.00€).
 */
export function evaluatePriceAnomaly(
  observedPrice: number | null,
  calculatedPrice: number,
  tolerance = 1.00
): { delta: number; hasAnomaly: boolean } {
  if (observedPrice === null) {
    return { delta: 0, hasAnomaly: false };
  }
  const delta = Number((observedPrice - calculatedPrice).toFixed(2));
  const hasAnomaly = Math.abs(delta) > tolerance;
  return { delta, hasAnomaly };
}

/**
 * Executes a simulated strategy against an array of daily occupancy data.
 */
export function simulateCommercialStrategy(
  strategy: CommercialStrategy,
  dailyData: {
    date: string;
    dayOffset: number;
    totalFreeRooms: number;
    occupancyRate: number;
  }[]
): {
  date: string;
  triggered: boolean;
  actionTaken: 'ABOVE' | 'BELOW' | 'NONE';
  plansOpened: string[];
  plansClosed: string[];
  reason: string;
}[] {
  return dailyData.map((day) => {
    // Check horizon limit
    if (day.dayOffset > strategy.horizonDays) {
      return {
        date: day.date,
        triggered: false,
        actionTaken: 'NONE',
        plansOpened: [],
        plansClosed: [],
        reason: `Hors horizon stratégie (${day.dayOffset}j > ${strategy.horizonDays}j)`,
      };
    }

    if (day.totalFreeRooms > strategy.freeRoomsThreshold) {
      return {
        date: day.date,
        triggered: true,
        actionTaken: 'ABOVE',
        plansOpened: [...strategy.actionsIfAboveThreshold.openPlans],
        plansClosed: [...strategy.actionsIfAboveThreshold.closePlans],
        reason: `Stock libre élevé (${day.totalFreeRooms} ch. > seuil ${strategy.freeRoomsThreshold}). Ouverture pour stimuler la demande.`,
      };
    } else if (day.totalFreeRooms < strategy.freeRoomsThreshold) {
      return {
        date: day.date,
        triggered: true,
        actionTaken: 'BELOW',
        plansOpened: [...strategy.actionsIfBelowThreshold.openPlans],
        plansClosed: [...strategy.actionsIfBelowThreshold.closePlans],
        reason: `Stock libre contraint (${day.totalFreeRooms} ch. < seuil ${strategy.freeRoomsThreshold}). Fermeture des canaux à forte commission.`,
      };
    } else {
      return {
        date: day.date,
        triggered: false,
        actionTaken: 'NONE',
        plansOpened: [],
        plansClosed: [],
        reason: `Égalité avec le seuil (${day.totalFreeRooms} ch.). Aucun ajustement automatique requis.`,
      };
    }
  });
}
