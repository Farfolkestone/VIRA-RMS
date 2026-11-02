import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRealPhysicalOccupancy,
  calculateFreePhysicalRooms,
  calculateCategoryCapacity,
  reconcileStocks,
  calculateExpectedRate,
  evaluatePriceAnomaly,
  simulateCommercialStrategy,
} from './rmsEngine';
import { DayCategoryTOPSYS, DayCategoryDEdge, CommercialStrategy } from '../types/hotel';

test('calculateRealPhysicalOccupancy discounts fictitious bookings properly', () => {
  assert.equal(calculateRealPhysicalOccupancy(10, 2), 8);
  assert.equal(calculateRealPhysicalOccupancy(5, 0), 5);
  assert.equal(calculateRealPhysicalOccupancy(2, 5), 0);
});

test('calculateFreePhysicalRooms returns correct remaining capacity', () => {
  assert.equal(calculateFreePhysicalRooms(13, 8), 5);
  assert.equal(calculateFreePhysicalRooms(5, 5), 0);
  assert.equal(calculateFreePhysicalRooms(5, 7), 0);
});

test('calculateCategoryCapacity returns proper counts for hotel inventory', () => {
  assert.equal(calculateCategoryCapacity('DCLA'), 13);
  assert.equal(calculateCategoryCapacity('DDLX'), 5);
  assert.equal(calculateCategoryCapacity('TCLA'), 8);
  assert.equal(calculateCategoryCapacity('TDLX'), 2);
  assert.equal(calculateCategoryCapacity('TRCL'), 2);
  assert.equal(calculateCategoryCapacity('TRDL'), 1);
  assert.equal(calculateCategoryCapacity('DCAD'), 14);
});

test('reconcileStocks detects overbooking risk when commercial stock exceeds free rooms', () => {
  const topsys: DayCategoryTOPSYS = {
    date: '2026-11-12',
    category: 'DCLA',
    totalCapacity: 13,
    occupiedRooms: 11,
    assignedRooms: 10,
    unassignedRooms: 1,
    fictitiousBookings: 0,
    realPhysicalOccupancy: 11,
    freePhysicalRooms: 2,
    admissibleStockForSale: 2,
    arrivals: 4,
    departures: 2,
    lastCollectTimestamp: '2026-11-12T07:15:00Z',
    collectionId: 'COLL-TOPSYS-8821',
    freshness: 'FRESH',
    isStale: false,
  };

  const dedge: DayCategoryDEdge = {
    date: '2026-11-12',
    productId: 5146,
    category: 'DCLA',
    publishedStock: 5,
    status: 'OUVERT',
    lastCollectTimestamp: '2026-11-12T07:20:00Z',
    collectionId: 'COLL-DEDGE-9912',
    isPartial: false,
    statusChanged: false,
  };

  const recon = reconcileStocks(topsys, dedge, true);
  assert.equal(recon.isOverbookingRisk, true);
  assert.equal(recon.stockDelta, 3);
  assert.match(recon.recommendation || '', /Réduire d'urgence/);
});

test('reconcileStocks blocks recommendations when TOPSYS is stale', () => {
  const topsys: DayCategoryTOPSYS = {
    date: '2026-11-28',
    category: 'DDLX',
    totalCapacity: 5,
    occupiedRooms: 2,
    assignedRooms: 2,
    unassignedRooms: 0,
    fictitiousBookings: 0,
    realPhysicalOccupancy: 2,
    freePhysicalRooms: 3,
    admissibleStockForSale: 3,
    arrivals: 1,
    departures: 1,
    lastCollectTimestamp: '2026-11-27T06:00:00Z', // > 24h old
    collectionId: 'COLL-TOPSYS-8400',
    freshness: 'EXPIRED',
    isStale: true,
  };

  const dedge: DayCategoryDEdge = {
    date: '2026-11-28',
    productId: 5152,
    category: 'DDLX',
    publishedStock: 4,
    status: 'OUVERT',
    lastCollectTimestamp: '2026-11-28T07:00:00Z',
    collectionId: 'COLL-DEDGE-9950',
    isPartial: false,
    statusChanged: false,
  };

  const recon = reconcileStocks(topsys, dedge, true);
  assert.equal(recon.dataStatus, 'STALE');
  assert.equal(recon.recommendation, undefined);
  assert.match(recon.recommendationBlockedReason || '', /Données TOPSYS périmées/);
});

test('calculateExpectedRate computes cents correctly without losing precision', () => {
  const rackRo = 180.00;
  assert.equal(calculateExpectedRate(rackRo, 'RACK', 'RACK_RO'), 180.00);
  assert.equal(calculateExpectedRate(rackRo, 'RACK', 'RACK_BB'), 198.00);
  assert.equal(calculateExpectedRate(rackRo, 'OTA', 'OTA_RO'), 162.00); // 180 * 0.90
  assert.equal(calculateExpectedRate(rackRo, 'MOBILE', 'MOBILE_RO'), 145.80); // 180 * 0.81
  assert.equal(calculateExpectedRate(rackRo, 'BEST_RATE', 'BEST_RATE_RO'), 153.00); // 180 * 0.85
});

test('evaluatePriceAnomaly flags price difference exceeding tolerance', () => {
  const normal = evaluatePriceAnomaly(162.00, 162.00, 1.00);
  assert.equal(normal.hasAnomaly, false);
  assert.equal(normal.delta, 0);

  const abnormal = evaluatePriceAnomaly(140.00, 153.90, 1.00);
  assert.equal(abnormal.hasAnomaly, true);
  assert.equal(abnormal.delta, -13.90);
});

test('simulateCommercialStrategy triggers rules based on free room thresholds', () => {
  const strategy: CommercialStrategy = {
    id: 'strat-1',
    name: 'Règle J-10',
    description: 'Ouverture si > 25 chambres libres',
    enabled: true,
    horizonDays: 10,
    freeRoomsThreshold: 25,
    minOccupancyRate: 50,
    targetCategories: ['DCLA', 'DDLX'],
    affectedPlans: ['MOBILES', 'BEST_RATE', 'VIP'],
    actionsIfAboveThreshold: {
      openPlans: ['MOBILES', 'BEST_RATE'],
      closePlans: ['VIP'],
    },
    actionsIfBelowThreshold: {
      openPlans: ['VIP'],
      closePlans: ['MOBILES', 'BEST_RATE'],
    },
    priority: 1,
    lastModified: '2026-11-02T08:00:00Z',
  };

  const testDays = [
    { date: '2026-11-05', dayOffset: 3, totalFreeRooms: 28, occupancyRate: 37.7 },
    { date: '2026-11-08', dayOffset: 6, totalFreeRooms: 12, occupancyRate: 73.3 },
    { date: '2026-11-20', dayOffset: 18, totalFreeRooms: 30, occupancyRate: 33.3 },
  ];

  const results = simulateCommercialStrategy(strategy, testDays);
  assert.equal(results[0].triggered, true);
  assert.equal(results[0].actionTaken, 'ABOVE');
  assert.deepEqual(results[0].plansOpened, ['MOBILES', 'BEST_RATE']);

  assert.equal(results[1].triggered, true);
  assert.equal(results[1].actionTaken, 'BELOW');
  assert.deepEqual(results[1].plansClosed, ['MOBILES', 'BEST_RATE']);

  assert.equal(results[2].triggered, false);
  assert.equal(results[2].actionTaken, 'NONE'); // outside horizon
});
