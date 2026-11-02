import React, { useState, useEffect, useCallback } from 'react';
import { Header, ActiveTab } from './components/Header';
import { ParcoursGuideBar } from './components/ParcoursGuideBar';
import { CockpitView } from './components/CockpitView';
import { PlanningView } from './components/PlanningView';
import { RatesView } from './components/RatesView';
import { StatusMatrixView } from './components/StatusMatrixView';
import { AlertsCenterView } from './components/AlertsCenterView';
import { StrategiesView } from './components/StrategiesView';
import { ActionsCenterView } from './components/ActionsCenterView';
import { ReservationsView } from './components/ReservationsView';
import { CopilotView } from './components/CopilotView';
import { DocumentationModal } from './components/DocumentationModal';
import { GuidedJourneysModal } from './components/GuidedJourneysModal';
import { DataQualityDrawer } from './components/DataQualityDrawer';
import { ToastContainer } from './components/ToastContainer';
import { NotificationCenterDrawer } from './components/NotificationCenterDrawer';
import { buildCompleteHotelDataset } from './data/mockHotelData';
import { RoomCategoryCode, PreparedAction } from './types/hotel';
import { ToastNotification } from './types/toast';
import {
  createStrategyRecommendationToast,
  createTopsysSyncToast,
  createDEdgeSyncToast,
  createSurbookingAlertToast,
  removeToast,
} from './logic/toastManager';

export default function App() {
  const [dataset, setDataset] = useState(() => buildCompleteHotelDataset());
  const [activeTab, setActiveTab] = useState<ActiveTab>('cockpit');
  const [activeParcours, setActiveParcours] = useState<string | null>(null);
  const [targetDate, setTargetDate] = useState<string | undefined>(undefined);
  const [targetCategory, setTargetCategory] = useState<RoomCategoryCode | undefined>(undefined);
  const [targetAlertId, setTargetAlertId] = useState<string | undefined>(undefined);

  // Modals & Drawers
  const [showDocModal, setShowDocModal] = useState(false);
  const [showParcoursModal, setShowParcoursModal] = useState(false);
  const [showDataDrawer, setShowDataDrawer] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [showParcoursBar, setShowParcoursBar] = useState(true);

  // Toast Notification System State
  const [activeToasts, setActiveToasts] = useState<ToastNotification[]>([]);
  const [notificationsHistory, setNotificationsHistory] = useState<ToastNotification[]>([]);
  const [isAutoSimulating, setIsAutoSimulating] = useState(false);

  // Helper to push a new toast notification
  const pushNotification = useCallback((toast: ToastNotification) => {
    setActiveToasts((prev) => [toast, ...prev.slice(0, 3)]); // Keep max 4 active floating toasts
    setNotificationsHistory((prev) => [toast, ...prev]);
  }, []);

  const handleDismissToast = useCallback((toastId: string) => {
    setActiveToasts((prev) => removeToast(prev, toastId));
  }, []);

  const handleClearAllNotifications = useCallback(() => {
    setActiveToasts([]);
    setNotificationsHistory([]);
  }, []);

  // Quick Simulation Triggers
  const handleSimulateStrategyRecommendation = useCallback(() => {
    const dates = ['2026-11-14', '2026-11-15', '2026-11-20', '2026-11-25'];
    const randomDate = dates[Math.floor(Math.random() * dates.length)];
    const toast = createStrategyRecommendationToast(randomDate, 'DCLA');
    pushNotification(toast);
  }, [pushNotification]);

  const handleSimulateTopsysSync = useCallback(() => {
    const toast = createTopsysSyncToast(45);
    pushNotification(toast);
  }, [pushNotification]);

  const handleSimulateDEdgeSync = useCallback(() => {
    const toast = createDEdgeSyncToast(8);
    pushNotification(toast);
  }, [pushNotification]);

  const handleSimulateSurbookingAlert = useCallback(() => {
    const toast = createSurbookingAlertToast('2026-11-12', 'DCLA', 3);
    pushNotification(toast);
  }, [pushNotification]);

  // Initial welcome toast on load
  useEffect(() => {
    const initialTimer = setTimeout(() => {
      const initialToast = createTopsysSyncToast(45);
      pushNotification(initialToast);
    }, 1200);

    return () => clearTimeout(initialTimer);
  }, [pushNotification]);

  // Periodic background simulation loop if enabled
  useEffect(() => {
    if (!isAutoSimulating) return;

    const interval = setInterval(() => {
      const simChoice = Math.random();
      if (simChoice < 0.4) {
        handleSimulateStrategyRecommendation();
      } else if (simChoice < 0.7) {
        handleSimulateTopsysSync();
      } else {
        handleSimulateDEdgeSync();
      }
    }, 35000);

    return () => clearInterval(interval);
  }, [isAutoSimulating, handleSimulateStrategyRecommendation, handleSimulateTopsysSync, handleSimulateDEdgeSync]);

  // Central Navigation Handler
  const handleNavigate = (
    tab: ActiveTab,
    date?: string,
    category?: RoomCategoryCode,
    alertId?: string
  ) => {
    setActiveTab(tab);
    setTargetDate(date);
    setTargetCategory(category);
    setTargetAlertId(alertId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Launch a demo parcours
  const handleLaunchParcours = (
    parcoursId: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H',
    tab: ActiveTab,
    date?: string,
    category?: RoomCategoryCode,
    alertId?: string
  ) => {
    setActiveParcours(parcoursId);
    handleNavigate(tab, date, category, alertId);
  };

  // Prepare a simulated action from cell inspector or alerts
  const handlePrepareAction = (actionData: {
    date: string;
    category: RoomCategoryCode;
    proposedStock: number;
    actionType: 'MODIFIER_STOCK' | 'OUVRIR_PLAN' | 'FERMER_PLAN';
    justifyingRule: string;
  }) => {
    const newAction: PreparedAction = {
      id: `ACT-NEW-${Date.now().toString().slice(-4)}`,
      date: actionData.date,
      category: actionData.category,
      productId: 5146,
      actionType: actionData.actionType,
      observedValue: actionData.proposedStock === 2 ? 5 : 0,
      proposedValue: actionData.proposedStock,
      delta: `${actionData.proposedStock - (actionData.proposedStock === 2 ? 5 : 0)} ch.`,
      justifyingRule: actionData.justifyingRule,
      sourceFreshness: 'FRESH',
      riskLevel: 'ELEVE',
      authorizationLevel: 'VALIDATION_HUMAINE_REQUISE',
      status: 'PREPARE',
    };

    setDataset((prev) => ({
      ...prev,
      actions: [newAction, ...prev.actions],
    }));

    handleNavigate('actions', actionData.date, actionData.category);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'Escape') {
        setShowDocModal(false);
        setShowParcoursModal(false);
        setShowDataDrawer(false);
        setShowNotificationDrawer(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const criticalAlertsCount = dataset.alerts.filter((a) => a.priority === 'CRITIQUE').length;
  const preparedActionsCount = dataset.actions.filter((a) => a.status === 'PREPARE').length;
  const unreadNotificationsCount = activeToasts.length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Main Navigation Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => handleNavigate(tab)}
        onOpenParcours={() => setShowParcoursModal(true)}
        onOpenDoc={() => setShowDocModal(true)}
        onOpenDataLineage={() => setShowDataDrawer(true)}
        criticalAlertsCount={criticalAlertsCount}
        preparedActionsCount={preparedActionsCount}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setShowNotificationDrawer((prev) => !prev)}
        onQuickSimulateStrategy={handleSimulateStrategyRecommendation}
        onQuickSimulateSync={handleSimulateTopsysSync}
      />

      {/* Guided Journeys Quick Bar (Parcours Démo A à H) */}
      {showParcoursBar && (
        <ParcoursGuideBar
          onSelectParcours={handleLaunchParcours}
          activeParcours={activeParcours}
          onCloseParcoursBar={() => setShowParcoursBar(false)}
        />
      )}

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'cockpit' && (
          <CockpitView
            dataset={dataset}
            onNavigate={handleNavigate}
            onOpenParcours={(id) => {
              const p = PARCOURS_DEFINITIONS.find((item) => item.id === id);
              if (p) handleLaunchParcours(p.id, p.tab, p.date, p.category, p.alertId);
            }}
          />
        )}

        {activeTab === 'planning' && (
          <PlanningView
            dataset={dataset}
            initialDate={targetDate}
            initialCategory={targetCategory}
            onPrepareAction={handlePrepareAction}
          />
        )}

        {activeTab === 'rates' && (
          <RatesView
            dataset={dataset}
            initialDate={targetDate}
            initialCategory={targetCategory}
          />
        )}

        {activeTab === 'status' && (
          <StatusMatrixView
            dataset={dataset}
            initialDate={targetDate}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsCenterView
            dataset={dataset}
            initialDate={targetDate}
            initialAlertId={targetAlertId}
            onNavigate={handleNavigate}
            onPrepareAction={handlePrepareAction}
          />
        )}

        {activeTab === 'strategies' && (
          <StrategiesView dataset={dataset} />
        )}

        {activeTab === 'actions' && (
          <ActionsCenterView
            dataset={dataset}
            initialDate={targetDate}
          />
        )}

        {activeTab === 'reservations' && (
          <ReservationsView dataset={dataset} />
        )}

        {activeTab === 'copilot' && (
          <CopilotView
            dataset={dataset}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Toast Notification Container (Bottom-Right Floating Stack) */}
      <ToastContainer
        toasts={activeToasts}
        onDismiss={handleDismissToast}
        onNavigate={handleNavigate}
      />

      {/* Notification Center & Simulator Drawer */}
      {showNotificationDrawer && (
        <NotificationCenterDrawer
          notifications={notificationsHistory}
          onClose={() => setShowNotificationDrawer(false)}
          onClearAll={handleClearAllNotifications}
          onNavigate={handleNavigate}
          onSimulateStrategy={handleSimulateStrategyRecommendation}
          onSimulateTopsysSync={handleSimulateTopsysSync}
          onSimulateDEdgeSync={handleSimulateDEdgeSync}
          onSimulateSurbookingAlert={handleSimulateSurbookingAlert}
          isAutoSimulating={isAutoSimulating}
          onToggleAutoSimulating={() => setIsAutoSimulating((prev) => !prev)}
        />
      )}

      {/* Documentation & Architecture Modal */}
      {showDocModal && (
        <DocumentationModal onClose={() => setShowDocModal(false)} />
      )}

      {/* Guided Journeys Overview Modal */}
      {showParcoursModal && (
        <GuidedJourneysModal
          onClose={() => setShowParcoursModal(false)}
          onLaunchParcours={handleLaunchParcours}
        />
      )}

      {/* Data Quality & Lineage Drawer */}
      {showDataDrawer && (
        <DataQualityDrawer onClose={() => setShowDataDrawer(false)} />
      )}
    </div>
  );
}

const PARCOURS_DEFINITIONS = [
  { id: 'A' as const, tab: 'cockpit' as ActiveTab, date: '2026-11-12', category: 'DCLA' as RoomCategoryCode, alertId: 'ALT-SURBOOK-2026-11-12-DCLA' },
  { id: 'B' as const, tab: 'strategies' as ActiveTab },
  { id: 'C' as const, tab: 'rates' as ActiveTab, date: '2026-11-05', category: 'DCLA' as RoomCategoryCode },
  { id: 'D' as const, tab: 'status' as ActiveTab, date: '2026-11-22' },
  { id: 'E' as const, tab: 'copilot' as ActiveTab },
  { id: 'F' as const, tab: 'alerts' as ActiveTab, date: '2026-11-28', alertId: 'ALT-STALE-2026-11-28' },
  { id: 'G' as const, tab: 'actions' as ActiveTab, date: '2026-11-12' },
  { id: 'H' as const, tab: 'planning' as ActiveTab, date: '2026-11-02' },
];
