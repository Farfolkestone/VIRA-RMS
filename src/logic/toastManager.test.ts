import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createToast,
  createStrategyRecommendationToast,
  createTopsysSyncToast,
  createDEdgeSyncToast,
  createSurbookingAlertToast,
  markToastAsRead,
  removeToast,
} from './toastManager';

test('createToast generates a toast with unique id and valid timestamp', () => {
  const toast = createToast({
    type: 'system_info',
    title: 'Test Title',
    message: 'Test message body',
    source: 'Test Source',
  });

  assert.ok(toast.id.startsWith('TOAST-'));
  assert.equal(toast.type, 'system_info');
  assert.equal(toast.title, 'Test Title');
  assert.equal(toast.message, 'Test message body');
  assert.equal(toast.source, 'Test Source');
  assert.equal(toast.read, false);
});

test('createStrategyRecommendationToast formats strategy recommendation with action', () => {
  const toast = createStrategyRecommendationToast('2026-11-14', 'DCLA');
  assert.equal(toast.type, 'strategy_recommendation');
  assert.match(toast.title, /Nouvelle Recommandation RMS/);
  assert.equal(toast.category, 'DCLA');
  assert.equal(toast.date, '2026-11-14');
  assert.ok(toast.action);
  assert.equal(toast.action?.tab, 'actions');
});

test('createTopsysSyncToast creates data sync toast', () => {
  const toast = createTopsysSyncToast(45);
  assert.equal(toast.type, 'data_sync');
  assert.match(toast.message, /45 chambres/);
  assert.equal(toast.action?.tab, 'planning');
});

test('createDEdgeSyncToast creates channel manager sync toast', () => {
  const toast = createDEdgeSyncToast(8);
  assert.equal(toast.type, 'data_sync');
  assert.match(toast.message, /8 produits/);
  assert.equal(toast.action?.tab, 'rates');
});

test('markToastAsRead and removeToast manipulate toast lists immutably', () => {
  const t1 = createTopsysSyncToast();
  const t2 = createStrategyRecommendationToast();
  const list = [t1, t2];

  const updated = markToastAsRead(list, t1.id);
  assert.equal(updated[0].read, true);
  assert.equal(updated[1].read, false);

  const remaining = removeToast(updated, t1.id);
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].id, t2.id);
});
