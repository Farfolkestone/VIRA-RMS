import { ToastNotification, ToastType, ToastAction } from '../types/toast';
import { RoomCategoryCode } from '../types/hotel';

export function createToast(params: {
  type: ToastType;
  title: string;
  message: string;
  source: string;
  category?: RoomCategoryCode;
  date?: string;
  action?: ToastAction;
  duration?: number;
}): ToastNotification {
  return {
    id: `TOAST-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: params.type,
    title: params.title,
    message: params.message,
    timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' CET',
    source: params.source,
    category: params.category,
    date: params.date,
    action: params.action,
    duration: params.duration ?? 6500,
    read: false,
  };
}

export function createStrategyRecommendationToast(
  date = '2026-11-14',
  category: RoomCategoryCode = 'DCLA'
): ToastNotification {
  return createToast({
    type: 'strategy_recommendation',
    title: 'Nouvelle Recommandation RMS',
    message: `Stratégie J-10 active : Stock physique libre élevé (28 ch.). Proposition d'ouvrir les plans MOBILE_RO et BEST_RATE_RO pour accélérer le pick-up.`,
    source: 'Moteur Stratégies RMS (Background Job #STRAT-884)',
    date,
    category,
    action: {
      label: "Examiner l'action",
      tab: 'actions',
      date,
      category,
    },
    duration: 8000,
  });
}

export function createTopsysSyncToast(roomsSynced = 45): ToastNotification {
  return createToast({
    type: 'data_sync',
    title: 'Mise à Jour Sync TOPSYS PMS',
    message: `Collecte en arrière-plan réussie. ${roomsSynced} chambres physiques synchronisées, 2 nouvelles attributions validées et résas fictives recalculées.`,
    source: 'VIGIE PLUS (Connecteur TOPSYS v2.4)',
    action: {
      label: 'Voir planning',
      tab: 'planning',
    },
    duration: 6500,
  });
}

export function createDEdgeSyncToast(productsCount = 8): ToastNotification {
  return createToast({
    type: 'data_sync',
    title: 'Mise à Jour Sync D-Edge VARA PLUS',
    message: `Collecte delta terminée sur ${productsCount} produits commerciaux. Détection de parité RACK RO FLEX (180.00 €) vérifiée sur la base locale.`,
    source: 'VARA PLUS (D-Edge v0.3.50)',
    action: {
      label: 'Voir tarifs',
      tab: 'rates',
    },
    duration: 6500,
  });
}

export function createSurbookingAlertToast(
  date = '2026-11-12',
  category: RoomCategoryCode = 'DCLA',
  delta = 3
): ToastNotification {
  return createToast({
    type: 'alert_detected',
    title: 'Alerte Critique : Risque de Surbooking',
    message: `Divergence détectée au ${date} sur [${category}] : Stock commercial D-Edge (5) > Stock physique TOPSYS (2). Écart non couvert : +${delta} ch.`,
    source: 'RMS Moniteur Temps Réel',
    date,
    category,
    action: {
      label: 'Arbitrer urgence',
      tab: 'planning',
      date,
      category,
    },
    duration: 9000,
  });
}

export function markToastAsRead(toasts: ToastNotification[], toastId: string): ToastNotification[] {
  return toasts.map((t) => (t.id === toastId ? { ...t, read: true } : t));
}

export function removeToast(toasts: ToastNotification[], toastId: string): ToastNotification[] {
  return toasts.filter((t) => t.id !== toastId);
}
