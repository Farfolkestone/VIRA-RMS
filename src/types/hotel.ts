// Types for VIGIE RMS — Unified Hotel Intelligence & Revenue Management

export type RoomCategoryCode = 'DCLA' | 'DDLX' | 'TCLA' | 'TDLX' | 'TRCL' | 'TRDL' | 'DCAD';

export interface RoomCategoryConfig {
  code: RoomCategoryCode;
  name: string;
  totalRooms: number;
  physicalUnitsPerBooking: number; // DCAD = 2, others = 1
  baseRackRoFlex: number; // baseline price
  floorPrice: number; // minimum ceiling
  description: string;
}

export const ROOM_CATEGORIES: Record<RoomCategoryCode, RoomCategoryConfig> = {
  DCLA: { code: 'DCLA', name: 'Double Classique', totalRooms: 13, physicalUnitsPerBooking: 1, baseRackRoFlex: 180, floorPrice: 130, description: 'Chambre double standard 18m² avec lit queen-size' },
  DDLX: { code: 'DDLX', name: 'Double Deluxe', totalRooms: 5, physicalUnitsPerBooking: 1, baseRackRoFlex: 240, floorPrice: 175, description: 'Chambre double supérieure 24m² avec vue cour d’honneur' },
  TCLA: { code: 'TCLA', name: 'Twin Classique', totalRooms: 8, physicalUnitsPerBooking: 1, baseRackRoFlex: 185, floorPrice: 135, description: 'Chambre 2 lits simples 19m²' },
  TDLX: { code: 'TDLX', name: 'Twin Deluxe', totalRooms: 2, physicalUnitsPerBooking: 1, baseRackRoFlex: 250, floorPrice: 180, description: 'Chambre deluxe à 2 lits jumeaux 25m²' },
  TRCL: { code: 'TRCL', name: 'Terrasse Classique', totalRooms: 2, physicalUnitsPerBooking: 1, baseRackRoFlex: 230, floorPrice: 170, description: 'Chambre avec terrasse privative aménagée 20m²' },
  TRDL: { code: 'TRDL', name: 'Terrasse Deluxe', totalRooms: 1, physicalUnitsPerBooking: 1, baseRackRoFlex: 310, floorPrice: 220, description: 'Suite avec grande terrasse 32m² vue toits de Paris' },
  DCAD: { code: 'DCAD', name: 'Double Adjacentes', totalRooms: 14, physicalUnitsPerBooking: 2, baseRackRoFlex: 360, floorPrice: 260, description: 'Chambres communicantes (consomme 2 unités physiques)' },
};

export const TOTAL_HOTEL_ROOMS = 45;

export type CommercialStatus = 
  | 'OUVERT'
  | 'FERME'
  | 'VENTE_FERMEE'
  | 'PERIODE_FERMEE'
  | 'EPUISE'
  | 'INDISPONIBLE'
  | 'SUR_DEMANDE'
  | 'INCONNU'
  | 'NON_OBSERVE';

export type DataMaturity = 'EXISTANT' | 'QUALIFICATION' | 'FUTUR_SIMULE';
export type ProvenanceKind = 'OBSERVE' | 'CALCULE' | 'RECOMMANDE';
export type SyncFreshness = 'FRESH' | 'WARNING' | 'EXPIRED';

export interface DEdgeProduct {
  id: number;
  code: string;
  name: string;
  mappedCategory: RoomCategoryCode | null; // null if unmapped
  isSingleUse?: boolean;
}

export interface RatePlan {
  id: number;
  code: string;
  name: string;
  family: 'RACK' | 'OTA' | 'MOBILE' | 'BEST_RATE' | 'VIP' | 'PROMO' | 'EXP' | 'WHOLESALE';
  ruleFormula: string;
  ruleVersion: string;
  isReference?: boolean;
  ignoredInRoutine?: boolean; // e.g. TRAVCO
}

export interface DayCategoryTOPSYS {
  date: string; // YYYY-MM-DD
  category: RoomCategoryCode;
  totalCapacity: number;
  occupiedRooms: number;
  assignedRooms: number;
  unassignedRooms: number;
  fictitiousBookings: number;
  realPhysicalOccupancy: number; // occupied - fictitious
  freePhysicalRooms: number; // totalCapacity - realPhysicalOccupancy
  admissibleStockForSale: number;
  arrivals: number;
  departures: number;
  lastCollectTimestamp: string;
  collectionId: string;
  freshness: SyncFreshness;
  isStale: boolean;
}

export interface DayCategoryDEdge {
  date: string; // YYYY-MM-DD
  productId: number;
  category: RoomCategoryCode | null;
  publishedStock: number;
  status: CommercialStatus;
  lastCollectTimestamp: string;
  collectionId: string;
  isPartial: boolean;
  statusChanged: boolean;
  previousStatus?: CommercialStatus;
}

export interface DayCategoryRate {
  date: string;
  productId: number;
  planId: number;
  observedPrice: number | null; // null if missing
  calculatedPrice: number;
  delta: number; // observed - calculated
  hasAnomaly: boolean;
  ruleVersion: string;
  status: CommercialStatus;
  lastCollectTimestamp: string;
  isFirstObservation: boolean;
  previousObservedPrice?: number;
}

export interface RMSReconciliation {
  date: string;
  category: RoomCategoryCode;
  physicalFree: number;
  commercialPublished: number;
  stockDelta: number; // commercialPublished - physicalFree
  isOverbookingRisk: boolean;
  isUnderCommercialized: boolean;
  isMappingReliable: boolean;
  confidenceScore: number; // 0 - 100
  dataStatus: 'OK' | 'STALE' | 'PARTIAL' | 'UNMAPPED' | 'UNKNOWN';
  recommendation?: string;
  recommendationBlockedReason?: string;
}

export interface HotelAlert {
  id: string;
  type: 'DISPONIBILITE' | 'TARIFAIRE' | 'DONNEES';
  priority: 'CRITIQUE' | 'ELEVEE' | 'MOYENNE' | 'INFO';
  date: string;
  category?: RoomCategoryCode;
  planCode?: string;
  title: string;
  triggerCondition: string;
  observedData: string;
  reliability: number; // percentage
  recommendation: string;
  isBlocked?: boolean;
  blockedReason?: string;
  status: 'NOUVELLE' | 'ACQUITTEE' | 'TRAITEE';
  timestamp: string;
  demoCaseNumber?: number; // 1-15
}

export interface ReservationRecord {
  id: string;
  pmsCode?: string;
  dedgeCode?: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  category: RoomCategoryCode;
  roomNumber?: string;
  channel: 'Direct' | 'Booking.com' | 'Expedia' | 'Site Web' | 'VIP Corporate' | 'Travco';
  ratePlanCode: string;
  totalAmount: number;
  adr: number;
  bookingDate: string;
  status: 'CONFIRMED' | 'MODIFIED' | 'CANCELLED';
  reconciliationStatus: 'CONFIRME' | 'PROBABLE_A_VERIFIER' | 'IMPOSSIBLE' | 'DONNEE_MANQUANTE';
  notes?: string;
}

export interface CommercialStrategy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  horizonDays: number;
  freeRoomsThreshold: number;
  minOccupancyRate: number;
  targetCategories: RoomCategoryCode[];
  affectedPlans: string[];
  actionsIfAboveThreshold: {
    openPlans: string[];
    closePlans: string[];
    priceAdjustmentPercent?: number;
  };
  actionsIfBelowThreshold: {
    openPlans: string[];
    closePlans: string[];
    priceAdjustmentPercent?: number;
  };
  priority: number;
  lastModified: string;
}

export interface PreparedAction {
  id: string;
  date: string;
  category: RoomCategoryCode;
  productId: number;
  planCode?: string;
  actionType: 'MODIFIER_STOCK' | 'OUVRIR_PLAN' | 'FERMER_PLAN' | 'AJUSTER_PRIX';
  observedValue: string | number;
  proposedValue: string | number;
  delta: string;
  justifyingRule: string;
  sourceFreshness: SyncFreshness;
  riskLevel: 'FAIBLE' | 'MOYEN' | 'ELEVE';
  authorizationLevel: 'AUTOMATIQUE_SIMULE' | 'VALIDATION_HUMAINE_REQUISE';
  status: 'RECOMMANDE' | 'PREPARE' | 'VALIDE_SIMULE' | 'REJETE';
  executedAt?: string;
}

export interface CopilotQAResponse {
  question: string;
  summary: string;
  metrics: { label: string; value: string; hint?: string }[];
  period: string;
  sources: { name: string; timestamp: string; reliability: string }[];
  confidence: number; // 0-100
  limitations?: string;
  recommendation?: string;
  targetView?: 'cockpit' | 'planning' | 'rates' | 'alerts' | 'status' | 'strategies' | 'actions' | 'reservations';
  targetDate?: string;
  targetCategory?: RoomCategoryCode;
  targetAlertId?: string;
}
