import {
  RoomCategoryCode,
  ROOM_CATEGORIES,
  DEdgeProduct,
  RatePlan,
  DayCategoryTOPSYS,
  DayCategoryDEdge,
  DayCategoryRate,
  RMSReconciliation,
  HotelAlert,
  ReservationRecord,
  CommercialStrategy,
  PreparedAction,
  CommercialStatus,
} from '../types/hotel';
import {
  calculateRealPhysicalOccupancy,
  calculateFreePhysicalRooms,
  calculateExpectedRate,
  evaluatePriceAnomaly,
  reconcileStocks,
} from '../logic/rmsEngine';

export const DEDGE_PRODUCTS: DEdgeProduct[] = [
  { id: 5146, code: 'DCLA_STD', name: 'Double Classique (Produit Référence)', mappedCategory: 'DCLA' },
  { id: 5147, code: 'DCLA_SGL', name: 'Double Classique Single Use', mappedCategory: 'DCLA', isSingleUse: true },
  { id: 5150, code: 'TCLA_STD', name: 'Twin Classique', mappedCategory: 'TCLA' },
  { id: 5152, code: 'DDLX_STD', name: 'Double Deluxe', mappedCategory: 'DDLX' },
  { id: 5154, code: 'TDLX_STD', name: 'Twin Deluxe', mappedCategory: 'TDLX' },
  { id: 5158, code: 'TRCL_STD', name: 'Terrasse Classique', mappedCategory: 'TRCL' },
  { id: 5160, code: 'TRDL_STD', name: 'Terrasse Deluxe', mappedCategory: 'TRDL' },
  { id: 5165, code: 'DCAD_FAM', name: 'Suite Familiale Adjacente (2 unités)', mappedCategory: 'DCAD' },
  { id: 5199, code: 'PROD_UNMAPPED', name: 'Chambre Studio Executive (Non qualifiée)', mappedCategory: null },
];

export const RATE_PLANS: RatePlan[] = [
  { id: 4685, code: 'RACK_RO_FLEX', name: 'RACK RO FLEX (Référence)', family: 'RACK', ruleFormula: 'Prix Référence Base', ruleVersion: 'v2.1', isReference: true },
  { id: 4686, code: 'RACK_BB_FLEX', name: 'RACK BB FLEX', family: 'RACK', ruleFormula: 'RACK_RO + 18.00€', ruleVersion: 'v2.1' },
  { id: 4710, code: 'OTA_RO_STD', name: 'OTA RO Standard', family: 'OTA', ruleFormula: 'RACK_RO × 0.90 (-10%)', ruleVersion: 'v2.1' },
  { id: 4712, code: 'OTA_BB_STD', name: 'OTA BB Standard', family: 'OTA', ruleFormula: 'OTA_RO + 18.00€', ruleVersion: 'v2.1' },
  { id: 4720, code: 'MOBILE_RO', name: 'Tarif Mobile Exclusif', family: 'MOBILE', ruleFormula: 'OTA_RO × 0.90 (RACK × 0.81)', ruleVersion: 'v2.2' },
  { id: 4730, code: 'BEST_RATE_RO', name: 'Best Available Non-Remboursable', family: 'BEST_RATE', ruleFormula: 'RACK_RO × 0.85 (-15%)', ruleVersion: 'v2.0' },
  { id: 4732, code: 'BEST_RATE_BB', name: 'Best Available Non-Remb. Petit-Déj', family: 'BEST_RATE', ruleFormula: '(RACK_RO × 0.85) + 18.00€', ruleVersion: 'v2.0' },
  { id: 4750, code: 'VIP_CORP', name: 'VIP Partner Corporate', family: 'VIP', ruleFormula: 'RACK_RO × 0.80 (-20%)', ruleVersion: 'v1.8' },
  { id: 4799, code: 'TRAVCO_STATIC', name: 'TRAVCO Grossiste (Statique)', family: 'WHOLESALE', ruleFormula: 'Contrat Fixe 120€', ruleVersion: 'v1.0', ignoredInRoutine: true },
];

// Generate 93 consecutive dates starting 2026-11-02
export function generateDateList(startDateStr = '2026-11-02', daysCount = 93): string[] {
  const dates: string[] = [];
  const start = new Date(startDateStr);
  for (let i = 0; i < daysCount; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export const ALL_DATES = generateDateList('2026-11-02', 93);

// Generate Mock TOPSYS, D-Edge, and Rate Observations
interface DayDataSet {
  date: string;
  dayOffset: number;
  dayOfWeek: string;
  topsys: Record<RoomCategoryCode, DayCategoryTOPSYS>;
  dedge: Record<RoomCategoryCode, DayCategoryDEdge>;
  rates: Record<string, DayCategoryRate>; // key: `${cat}_${planId}`
  reconciliations: Record<RoomCategoryCode, RMSReconciliation>;
  totalPhysicalOccupied: number;
  totalFreeRooms: number;
  occupancyRate: number;
  unassignedBookings: number;
  fictitiousTotal: number;
  rackRoFlexRef: number; // For Double Classique
  alerts: HotelAlert[];
}

export function buildCompleteHotelDataset(): {
  days: DayDataSet[];
  daysByDate: Record<string, DayDataSet>;
  alerts: HotelAlert[];
  reservations: ReservationRecord[];
  strategies: CommercialStrategy[];
  actions: PreparedAction[];
} {
  const days: DayDataSet[] = [];
  const daysByDate: Record<string, DayDataSet> = {};
  const allAlerts: HotelAlert[] = [];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  ALL_DATES.forEach((dateStr, idx) => {
    const d = new Date(dateStr);
    const dayOfWeek = dayNames[d.getDay()];
    const isWeekend = d.getDay() === 5 || d.getDay() === 6;

    // Baseline reference RACK RO price for Double Classique (ID 5146 / Plan 4685)
    let baseRefPrice = isWeekend ? 215.00 : 180.00;
    // Seasonal variations / holidays
    if (dateStr >= '2026-12-23' && dateStr <= '2026-12-31') {
      baseRefPrice += 45.00; // Festive season
    }
    if (dateStr >= '2027-01-15' && dateStr <= '2027-01-22') {
      baseRefPrice += 70.00; // Paris Fashion Week
    }

    // Specific case adjustments
    if (dateStr === '2026-11-06') {
      // Case 12: Genuine observed change between 04:00 and 08:00
      baseRefPrice = 195.00; // was 175.00
    }
    if (dateStr === '2026-11-05') {
      // Case 9: Incohérence tarifaire
      baseRefPrice = 190.00;
    }

    const topsysCatMap: Record<RoomCategoryCode, DayCategoryTOPSYS> = {} as any;
    const dedgeCatMap: Record<RoomCategoryCode, DayCategoryDEdge> = {} as any;
    const ratesMap: Record<string, DayCategoryRate> = {};
    const reconMap: Record<RoomCategoryCode, RMSReconciliation> = {} as any;
    const dayAlerts: HotelAlert[] = [];

    let dayTotalOccupied = 0;
    let dayTotalCapacity = 45;
    let dayUnassignedTotal = 0;
    let dayFictitiousTotal = 0;

    const catKeys = Object.keys(ROOM_CATEGORIES) as RoomCategoryCode[];

    catKeys.forEach((cat) => {
      const config = ROOM_CATEGORIES[cat];
      const capacity = config.totalRooms;

      // Realistic occupancy profile
      let occRate = 0.65;
      if (idx < 5) occRate = 0.85; // high near term
      if (idx > 60) occRate = 0.35; // far horizon
      if (isWeekend) occRate = Math.min(0.95, occRate + 0.15);

      // Fictitious bookings simulation (1 or 2 on some dates)
      const hasFictitious = (idx % 7 === 2 && cat === 'DCLA');
      const fictitious = hasFictitious ? 1 : 0;

      let occupied = Math.min(capacity, Math.round(capacity * occRate));
      let assigned = Math.max(0, occupied - (idx % 4 === 1 ? 1 : 0));
      let unassigned = occupied - assigned;

      // SPECIFIC DEMO CASES OVERRIDES:
      let isStaleTopsys = false;
      let topsysTimestamp = `${dateStr}T07:15:00Z`;
      let dedgeTimestamp = `${dateStr}T07:30:00Z`;
      let publishedStock = Math.max(0, capacity - occupied);
      let dedgeStatus: CommercialStatus = publishedStock > 0 ? 'OUVERT' : 'EPUISE';
      let isPartialDedge = false;
      let statusChanged = false;
      let previousStatus: CommercialStatus | undefined;

      // Case 1: 2026-11-02 (Aujourd'hui) -> Clean, zero anomaly
      if (dateStr === '2026-11-02') {
        if (cat === 'DCLA') { occupied = 11; assigned = 11; unassigned = 0; publishedStock = 2; }
        if (cat === 'DDLX') { occupied = 4; assigned = 4; publishedStock = 1; }
        if (cat === 'TCLA') { occupied = 7; assigned = 7; publishedStock = 1; }
        if (cat === 'TDLX') { occupied = 2; assigned = 2; publishedStock = 0; dedgeStatus = 'EPUISE'; }
        if (cat === 'TRCL') { occupied = 2; assigned = 2; publishedStock = 0; dedgeStatus = 'EPUISE'; }
        if (cat === 'TRDL') { occupied = 1; assigned = 1; publishedStock = 0; dedgeStatus = 'EPUISE'; }
        if (cat === 'DCAD') { occupied = 14; assigned = 14; publishedStock = 0; dedgeStatus = 'EPUISE'; }
      }

      // Case 2: 2026-11-12 -> Risque de surbooking démontrable
      if (dateStr === '2026-11-12' && cat === 'DCLA') {
        occupied = 11;
        publishedStock = 5; // Physical free is 2, but D-Edge published is 5! Hazard: +3
        dedgeStatus = 'OUVERT';
      }

      // Case 3: 2026-11-18 -> Sous-commercialisation
      if (dateStr === '2026-11-18' && cat === 'TDLX') {
        occupied = 0; // 2 physical rooms free
        publishedStock = 0; // D-Edge stock 0!
        dedgeStatus = 'VENTE_FERMEE';
      }

      // Case 4: 2026-11-22 -> Tarif fermé
      if (dateStr === '2026-11-22') {
        // BEST RATE RO will be closed
      }

      // Case 5: 2026-11-08 -> Stock commercial nul
      if (dateStr === '2026-11-08' && cat === 'DCLA') {
        occupied = 9; // 4 physical free
        publishedStock = 0; // 0 published!
        dedgeStatus = 'EPUISE';
      }

      // Case 6: 2026-12-04 -> Statut tarifaire inconnu
      if (dateStr === '2026-12-04' && cat === 'DDLX') {
        dedgeStatus = 'INCONNU';
      }

      // Case 7: 2026-12-15 -> Collecte D-Edge partielle
      if (dateStr === '2026-12-15') {
        isPartialDedge = true;
      }

      // Case 8 & 15: 2026-11-28 -> Observation TOPSYS périmée (>22h)
      if (dateStr === '2026-11-28') {
        isStaleTopsys = true;
        topsysTimestamp = '2026-11-27T08:00:00Z'; // 23h old!
      }

      // Case 11: 2026-11-03 -> Première observation
      let isFirstObservation = dateStr === '2026-11-03' && cat === 'TRCL';

      // Case 12: 2026-11-06 -> Véritable changement entre 2 observations
      if (dateStr === '2026-11-06') {
        statusChanged = true;
        previousStatus = 'FERME';
        dedgeStatus = 'OUVERT';
      }

      const realPhysOcc = calculateRealPhysicalOccupancy(occupied, fictitious);
      const freePhysical = calculateFreePhysicalRooms(capacity, realPhysOcc);

      const topsysItem: DayCategoryTOPSYS = {
        date: dateStr,
        category: cat,
        totalCapacity: capacity,
        occupiedRooms: occupied,
        assignedRooms: assigned,
        unassignedRooms: unassigned,
        fictitiousBookings: fictitious,
        realPhysicalOccupancy: realPhysOcc,
        freePhysicalRooms: freePhysical,
        admissibleStockForSale: freePhysical,
        arrivals: (idx % 3 === 0) ? 2 : 1,
        departures: (idx % 4 === 0) ? 2 : 1,
        lastCollectTimestamp: topsysTimestamp,
        collectionId: isStaleTopsys ? 'COLL-TOPSYS-8400-EXPIRED' : `COLL-TOPSYS-${8800 + idx}`,
        freshness: isStaleTopsys ? 'EXPIRED' : 'FRESH',
        isStale: isStaleTopsys,
      };

      const dedgeItem: DayCategoryDEdge = {
        date: dateStr,
        productId: DEDGE_PRODUCTS.find((p) => p.mappedCategory === cat)?.id ?? 5146,
        category: cat,
        publishedStock,
        status: dedgeStatus,
        lastCollectTimestamp: dedgeTimestamp,
        collectionId: isPartialDedge ? `COLL-DEDGE-PARTIAL-${9900 + idx}` : `COLL-DEDGE-${9900 + idx}`,
        isPartial: isPartialDedge,
        statusChanged,
        previousStatus,
      };

      // Case 14: 2027-01-10 -> Unmapped product
      const isUnmappedCase = dateStr === '2027-01-10' && cat === 'TRDL';
      const recon = reconcileStocks(topsysItem, isUnmappedCase ? null : dedgeItem, !isUnmappedCase);

      topsysCatMap[cat] = topsysItem;
      dedgeCatMap[cat] = dedgeItem;
      reconMap[cat] = recon;

      dayTotalOccupied += realPhysOcc;
      dayUnassignedTotal += unassigned;
      dayFictitiousTotal += fictitious;

      // Build rate plans observations for each category
      const catBasePrice = baseRefPrice * (config.baseRackRoFlex / 180.00);

      RATE_PLANS.forEach((plan) => {
        let planStatus: CommercialStatus = dedgeStatus;
        if (dateStr === '2026-11-22' && plan.code === 'BEST_RATE_RO') {
          planStatus = 'FERME'; // Case 4
        }

        const calculatedPrice = calculateExpectedRate(catBasePrice, plan.family, plan.code);
        let observedPrice: number | null = calculatedPrice;

        // Case 9: 2026-11-05 pricing anomaly
        if (dateStr === '2026-11-05' && cat === 'DCLA' && plan.code === 'MOBILE_RO') {
          observedPrice = 140.00; // expected is ~153.90 -> delta -13.90
        }

        // Case 6: 2026-12-04 unknown status
        if (dateStr === '2026-12-04' && cat === 'DDLX' && plan.code === 'VIP_CORP') {
          observedPrice = null;
          planStatus = 'INCONNU';
        }

        const { delta, hasAnomaly } = evaluatePriceAnomaly(observedPrice, calculatedPrice, 1.00);

        ratesMap[`${cat}_${plan.id}`] = {
          date: dateStr,
          productId: dedgeItem.productId,
          planId: plan.id,
          observedPrice,
          calculatedPrice,
          delta,
          hasAnomaly,
          ruleVersion: plan.ruleVersion,
          status: planStatus,
          lastCollectTimestamp: dedgeTimestamp,
          isFirstObservation,
          previousObservedPrice: statusChanged ? calculatedPrice - 20 : undefined,
        };
      });

      // Generate Alerts for specific demo cases
      if (recon.isOverbookingRisk) {
        const alert: HotelAlert = {
          id: `ALT-SURBOOK-${dateStr}-${cat}`,
          type: 'DISPONIBILITE',
          priority: 'CRITIQUE',
          date: dateStr,
          category: cat,
          title: `Risque Surbooking Critique — ${config.name}`,
          triggerCondition: `Stock commercial publié (${recon.commercialPublished}) > Stock physique disponible (${recon.physicalFree})`,
          observedData: `TOPSYS: ${recon.physicalFree} libres (${topsysItem.lastCollectTimestamp.slice(11, 16)}) | D-Edge: ${recon.commercialPublished} en vente (${dedgeItem.lastCollectTimestamp.slice(11, 16)})`,
          reliability: 98,
          recommendation: `Réduire immédiatement le quota D-Edge de ${recon.commercialPublished} à ${recon.physicalFree} (Surcapacité: +${recon.stockDelta}).`,
          status: 'NOUVELLE',
          timestamp: dedgeTimestamp,
          demoCaseNumber: 2,
        };
        dayAlerts.push(alert);
        allAlerts.push(alert);
      }

      if (recon.isUnderCommercialized) {
        const alert: HotelAlert = {
          id: `ALT-UNDERCOMM-${dateStr}-${cat}`,
          type: 'DISPONIBILITE',
          priority: 'ELEVEE',
          date: dateStr,
          category: cat,
          title: `Sous-commercialisation détectée — ${config.name}`,
          triggerCondition: `Chambres physiques libres (${recon.physicalFree}) non commercialisées sur D-Edge (publié: ${recon.commercialPublished}, statut: ${dedgeItem.status})`,
          observedData: `TOPSYS: ${recon.physicalFree} libres | D-Edge statut: ${dedgeItem.status}`,
          reliability: 95,
          recommendation: `Ouvrir le stock commercial D-Edge à ${recon.physicalFree} pour capter la demande.`,
          status: 'NOUVELLE',
          timestamp: topsysTimestamp,
          demoCaseNumber: 3,
        };
        dayAlerts.push(alert);
        allAlerts.push(alert);
      }

      if (isStaleTopsys && cat === 'DCLA') {
        const alert: HotelAlert = {
          id: `ALT-STALE-${dateStr}`,
          type: 'DONNEES',
          priority: 'ELEVEE',
          date: dateStr,
          title: 'Données TOPSYS périmées (>18h)',
          triggerCondition: 'Dernière collecte TOPSYS antérieure au seuil de sécurité opérationnelle (23h écoulées)',
          observedData: `Horodatage TOPSYS: ${topsysTimestamp} (Échec connecteur local #8400)`,
          reliability: 100,
          recommendation: 'Relancer manuellement le collecteur TOPSYS v2.4 ou forcer la synchronisation locale.',
          isBlocked: true,
          blockedReason: 'Recommandation RMS suspendue pour éviter une décision sur stock obsolète.',
          status: 'NOUVELLE',
          timestamp: topsysTimestamp,
          demoCaseNumber: 8,
        };
        dayAlerts.push(alert);
        allAlerts.push(alert);
      }

      if (dateStr === '2026-11-05' && cat === 'DCLA') {
        const alert: HotelAlert = {
          id: `ALT-RATE-${dateStr}`,
          type: 'TARIFAIRE',
          priority: 'CRITIQUE',
          date: dateStr,
          category: cat,
          planCode: 'MOBILE_RO',
          title: 'Écart Tarifaire Anormal — MOBILE RO (-13.90€)',
          triggerCondition: '|Prix observé (140.00€) - Prix calculé règle (153.90€)| > 1.00€',
          observedData: 'RACK RO FLEX = 190.00€, Règle Mobile = -19% (153.90€), D-Edge publié = 140.00€',
          reliability: 99,
          recommendation: 'Remonter le tarif MOBILE RO à 153.90€ sur D-Edge ou auditer la grille de dérivation.',
          status: 'NOUVELLE',
          timestamp: dedgeTimestamp,
          demoCaseNumber: 9,
        };
        dayAlerts.push(alert);
        allAlerts.push(alert);
      }

      if (isPartialDedge && cat === 'DCLA') {
        const alert: HotelAlert = {
          id: `ALT-PARTIAL-${dateStr}`,
          type: 'DONNEES',
          priority: 'MOYENNE',
          date: dateStr,
          title: 'Collecte D-Edge Partielle (4/8 produits)',
          triggerCondition: 'La collecte VARA PLUS a expiré avant de scanner la totalité des produits',
          observedData: 'Produits 5146 à 5152 collectés. Produits 5154 à 5165 non rafraîchis.',
          reliability: 75,
          recommendation: 'Déclencher une collecte ciblée VARA PLUS sur les produits manquants.',
          status: 'NOUVELLE',
          timestamp: dedgeTimestamp,
          demoCaseNumber: 7,
        };
        dayAlerts.push(alert);
        allAlerts.push(alert);
      }

      if (isUnmappedCase) {
        const alert: HotelAlert = {
          id: `ALT-UNMAPPED-${dateStr}`,
          type: 'DONNEES',
          priority: 'ELEVEE',
          date: dateStr,
          category: cat,
          title: 'Correspondance PMS/D-Edge non qualifiée',
          triggerCondition: 'Code produit D-Edge sans mapping vérifié vers une catégorie physique TOPSYS',
          observedData: 'Produit D-Edge PROD-UNMAPPED (ID 5199) non rattaché',
          reliability: 30,
          recommendation: 'Qualifier le produit dans la table de correspondances VIGIE/VARA.',
          isBlocked: true,
          blockedReason: 'Rapprochement impossible sans mapping strict.',
          status: 'NOUVELLE',
          timestamp: dedgeTimestamp,
          demoCaseNumber: 14,
        };
        dayAlerts.push(alert);
        allAlerts.push(alert);
      }
    });

    const totalFree = dayTotalCapacity - dayTotalOccupied;
    const occRate = Number(((dayTotalOccupied / dayTotalCapacity) * 100).toFixed(1));

    const dayData: DayDataSet = {
      date: dateStr,
      dayOffset: idx,
      dayOfWeek,
      topsys: topsysCatMap,
      dedge: dedgeCatMap,
      rates: ratesMap,
      reconciliations: reconMap,
      totalPhysicalOccupied: dayTotalOccupied,
      totalFreeRooms: totalFree,
      occupancyRate: occRate,
      unassignedBookings: dayUnassignedTotal,
      fictitiousTotal: dayFictitiousTotal,
      rackRoFlexRef: baseRefPrice,
      alerts: dayAlerts,
    };

    days.push(dayData);
    daysByDate[dateStr] = dayData;
  });

  // Seed realistic reservations
  const reservations: ReservationRecord[] = [
    {
      id: 'RES-BK-9840',
      pmsCode: 'PMS-4011',
      dedgeCode: 'DED-8820',
      guestName: 'Alexandre Moreau',
      checkIn: '2026-11-02',
      checkOut: '2026-11-05',
      nights: 3,
      category: 'DCLA',
      roomNumber: '104',
      channel: 'Booking.com',
      ratePlanCode: 'OTA_RO_STD',
      totalAmount: 486.00,
      adr: 162.00,
      bookingDate: '2026-10-24',
      status: 'CONFIRMED',
      reconciliationStatus: 'CONFIRME',
      notes: 'Rapprochement exact nom/dates/montant vérifié',
    },
    {
      id: 'RES-BK-9841',
      pmsCode: 'PMS-4012',
      dedgeCode: 'DED-8825',
      guestName: 'Elena Rostova',
      checkIn: '2026-11-02',
      checkOut: '2026-11-04',
      nights: 2,
      category: 'DDLX',
      roomNumber: '201',
      channel: 'Direct',
      ratePlanCode: 'RACK_RO_FLEX',
      totalAmount: 480.00,
      adr: 240.00,
      bookingDate: '2026-10-28',
      status: 'CONFIRMED',
      reconciliationStatus: 'CONFIRME',
    },
    {
      id: 'RES-BK-9842', // Case 13: explicitly cancelled
      pmsCode: 'PMS-4015',
      dedgeCode: 'DED-8830',
      guestName: 'David Chen',
      checkIn: '2026-11-04',
      checkOut: '2026-11-07',
      nights: 3,
      category: 'DCLA',
      roomNumber: undefined,
      channel: 'Expedia',
      ratePlanCode: 'OTA_RO_STD',
      totalAmount: 486.00,
      adr: 162.00,
      bookingDate: '2026-10-15',
      status: 'CANCELLED',
      reconciliationStatus: 'CONFIRME',
      notes: 'Annulation explicite observée dans D-Edge le 2026-11-01 à 18:42 CET',
    },
    {
      id: 'RES-BK-9843',
      pmsCode: 'PMS-4020',
      dedgeCode: 'DED-8839',
      guestName: 'Sophie Bernard',
      checkIn: '2026-11-12',
      checkOut: '2026-11-14',
      nights: 2,
      category: 'DCLA',
      roomNumber: undefined, // unassigned
      channel: 'Booking.com',
      ratePlanCode: 'MOBILE_RO',
      totalAmount: 291.60,
      adr: 145.80,
      bookingDate: '2026-10-31',
      status: 'CONFIRMED',
      reconciliationStatus: 'CONFIRME',
      notes: 'Surbooking potentiel détecté sur cette date de séjour',
    },
    {
      id: 'RES-BK-9844',
      pmsCode: 'PMS-4025',
      dedgeCode: undefined, // Missing on D-Edge side!
      guestName: 'Marc Vasseur',
      checkIn: '2026-11-12',
      checkOut: '2026-11-13',
      nights: 1,
      category: 'DCAD',
      roomNumber: '305-306',
      channel: 'Direct',
      ratePlanCode: 'RACK_RO_FLEX',
      totalAmount: 360.00,
      adr: 360.00,
      bookingDate: '2026-11-01',
      status: 'CONFIRMED',
      reconciliationStatus: 'DONNEE_MANQUANTE',
      notes: 'Présente dans TOPSYS mais absente du flux D-Edge (réservation directe téléphone)',
    },
    {
      id: 'RES-BK-9845',
      pmsCode: undefined, // In D-Edge but unconfirmed in PMS
      dedgeCode: 'DED-8845',
      guestName: 'Lucia Ferri',
      checkIn: '2026-11-18',
      checkOut: '2026-11-21',
      nights: 3,
      category: 'TCLA',
      roomNumber: undefined,
      channel: 'Site Web',
      ratePlanCode: 'BEST_RATE_RO',
      totalAmount: 471.75,
      adr: 157.25,
      bookingDate: '2026-11-01',
      status: 'CONFIRMED',
      reconciliationStatus: 'PROBABLE_A_VERIFIER',
      notes: 'En attente d’intégration dans la base TOPSYS locale',
    },
    {
      id: 'RES-BK-9846',
      pmsCode: 'PMS-4033',
      dedgeCode: 'DED-8850',
      guestName: 'Julien Mercier (FICTIVE)',
      checkIn: '2026-11-09',
      checkOut: '2026-11-11',
      nights: 2,
      category: 'DCLA',
      roomNumber: '109',
      channel: 'Direct',
      ratePlanCode: 'RACK_RO_FLEX',
      totalAmount: 0.00,
      adr: 0.00,
      bookingDate: '2026-10-10',
      status: 'CONFIRMED',
      reconciliationStatus: 'CONFIRME',
      notes: 'Réservation fictive de blocage maintenance (exclue de l’occupation physique réelle par RMS)',
    },
    {
      id: 'RES-BK-9847',
      pmsCode: 'PMS-4040',
      dedgeCode: 'DED-8862',
      guestName: 'Klaus Schmidt',
      checkIn: '2026-11-22',
      checkOut: '2026-11-25',
      nights: 3,
      category: 'TRCL',
      roomNumber: '401',
      channel: 'VIP Corporate',
      ratePlanCode: 'VIP_CORP',
      totalAmount: 552.00,
      adr: 184.00,
      bookingDate: '2026-10-20',
      status: 'CONFIRMED',
      reconciliationStatus: 'CONFIRME',
    },
  ];

  // Default strategies
  const strategies: CommercialStrategy[] = [
    {
      id: 'STRAT-01',
      name: 'Règle Anticipation J-10 (Dynamique Stock)',
      description: 'À J-10, si stock libre > 25 ch.: ouvrir MOBILES et BEST RATE, fermer VIP. Si < 25 ch.: fermer MOBILES et BEST RATE, ouvrir VIP.',
      enabled: true,
      horizonDays: 10,
      freeRoomsThreshold: 25,
      minOccupancyRate: 50,
      targetCategories: ['DCLA', 'DDLX', 'TCLA'],
      affectedPlans: ['MOBILE_RO', 'BEST_RATE_RO', 'VIP_CORP'],
      actionsIfAboveThreshold: {
        openPlans: ['MOBILE_RO', 'BEST_RATE_RO'],
        closePlans: ['VIP_CORP'],
        priceAdjustmentPercent: 0,
      },
      actionsIfBelowThreshold: {
        openPlans: ['VIP_CORP'],
        closePlans: ['MOBILE_RO', 'BEST_RATE_RO'],
        priceAdjustmentPercent: 5,
      },
      priority: 1,
      lastModified: '2026-11-01T14:30:00Z',
    },
    {
      id: 'STRAT-02',
      name: 'Protection Haute Occupation J-3',
      description: 'À J-3, si occupation dépasse 85%, fermeture systématique des plans promotionnels et relèvement du RACK FLEX.',
      enabled: true,
      horizonDays: 3,
      freeRoomsThreshold: 7,
      minOccupancyRate: 85,
      targetCategories: ['DCLA', 'DDLX', 'TCLA', 'TDLX'],
      affectedPlans: ['MOBILE_RO', 'BEST_RATE_RO'],
      actionsIfAboveThreshold: {
        openPlans: [],
        closePlans: [],
      },
      actionsIfBelowThreshold: {
        openPlans: [],
        closePlans: ['MOBILE_RO', 'BEST_RATE_RO'],
        priceAdjustmentPercent: 10,
      },
      priority: 2,
      lastModified: '2026-10-29T10:00:00Z',
    },
  ];

  // Prepared Actions for the Actions Center
  const actions: PreparedAction[] = [
    {
      id: 'ACT-001',
      date: '2026-11-12',
      category: 'DCLA',
      productId: 5146,
      actionType: 'MODIFIER_STOCK',
      observedValue: 5,
      proposedValue: 2,
      delta: '-3 chambres',
      justifyingRule: 'Règle R-SURBOOK: Stock commercial (5) > Disponibilité physique admissible (2)',
      sourceFreshness: 'FRESH',
      riskLevel: 'ELEVE',
      authorizationLevel: 'VALIDATION_HUMAINE_REQUISE',
      status: 'PREPARE',
    },
    {
      id: 'ACT-002',
      date: '2026-11-18',
      category: 'TDLX',
      productId: 5154,
      actionType: 'MODIFIER_STOCK',
      observedValue: 0,
      proposedValue: 2,
      delta: '+2 chambres',
      justifyingRule: 'Règle R-UNDERCOMM: 2 chambres physiques libres non publiées sur D-Edge',
      sourceFreshness: 'FRESH',
      riskLevel: 'MOYEN',
      authorizationLevel: 'VALIDATION_HUMAINE_REQUISE',
      status: 'PREPARE',
    },
    {
      id: 'ACT-003',
      date: '2026-11-05',
      category: 'DCLA',
      productId: 5146,
      planCode: 'MOBILE_RO',
      actionType: 'AJUSTER_PRIX',
      observedValue: '140.00 €',
      proposedValue: '153.90 €',
      delta: '+13.90 €',
      justifyingRule: 'Règle R-PRICE-MOBILE: Déviation par rapport à la règle RACK × 0.81',
      sourceFreshness: 'FRESH',
      riskLevel: 'FAIBLE',
      authorizationLevel: 'AUTOMATIQUE_SIMULE',
      status: 'RECOMMANDE',
    },
    {
      id: 'ACT-004',
      date: '2026-11-22',
      category: 'DCLA',
      productId: 5146,
      planCode: 'BEST_RATE_RO',
      actionType: 'OUVRIR_PLAN',
      observedValue: 'FERME',
      proposedValue: 'OUVERT',
      delta: 'Statut Ouvert',
      justifyingRule: 'Règle STRAT-01: Stock libre suffisant (21 ch.) justifiant stimulation promotionnelle',
      sourceFreshness: 'FRESH',
      riskLevel: 'FAIBLE',
      authorizationLevel: 'AUTOMATIQUE_SIMULE',
      status: 'RECOMMANDE',
    },
  ];

  return {
    days,
    daysByDate,
    alerts: allAlerts,
    reservations,
    strategies,
    actions,
  };
}
