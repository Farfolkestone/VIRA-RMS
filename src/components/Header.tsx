import React from 'react';
import {
  Hotel,
  Calendar,
  AlertTriangle,
  Sliders,
  DollarSign,
  Layers,
  BookOpen,
  MessageSquare,
  ShieldAlert,
  Zap,
  Info,
  Database,
  ArrowRight,
  Sparkles,
  Bell,
  RefreshCw,
} from 'lucide-react';

export type ActiveTab =
  | 'cockpit'
  | 'planning'
  | 'rates'
  | 'status'
  | 'alerts'
  | 'strategies'
  | 'actions'
  | 'reservations'
  | 'copilot';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenParcours: () => void;
  onOpenDoc: () => void;
  onOpenDataLineage: () => void;
  criticalAlertsCount: number;
  preparedActionsCount: number;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onQuickSimulateStrategy: () => void;
  onQuickSimulateSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenParcours,
  onOpenDoc,
  onOpenDataLineage,
  criticalAlertsCount,
  preparedActionsCount,
  unreadNotificationsCount,
  onOpenNotifications,
  onQuickSimulateStrategy,
  onQuickSimulateSync,
}) => {
  const navTabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    { id: 'cockpit', label: 'Cockpit Unifié', icon: <Hotel className="w-4 h-4" /> },
    { id: 'planning', label: 'Planning 93j', icon: <Calendar className="w-4 h-4" /> },
    { id: 'rates', label: 'Tarifs & Dérivés', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'status', label: 'Ouvertures / Fermetures', icon: <Layers className="w-4 h-4" /> },
    {
      id: 'alerts',
      label: 'Alertes RMS',
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: criticalAlertsCount,
      badgeColor: 'bg-red-500 text-white',
    },
    { id: 'strategies', label: 'Stratégies', icon: <Sliders className="w-4 h-4" /> },
    {
      id: 'actions',
      label: 'Actions & Automatisation',
      icon: <Zap className="w-4 h-4" />,
      badge: preparedActionsCount,
      badgeColor: 'bg-amber-500 text-slate-900',
    },
    { id: 'reservations', label: 'Réservations & Pick-up', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'copilot', label: 'Copilot Hôtelier', icon: <Sparkles className="w-4 h-4 text-emerald-400" /> },
  ];

  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 select-none sticky top-0 z-50">
      {/* Top Banner: Hotel info, live collectors status, simulation disclaimer */}
      <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2.5 py-1 rounded shadow-sm">
            <Hotel className="w-4 h-4" />
            <span className="font-bold tracking-tight text-sm">VIGIE RMS</span>
          </div>
          <div className="text-xs">
            <span className="font-semibold text-slate-200">Hôtel Opéra Marais, Paris</span>
            <span className="text-slate-400 ml-2">| 45 chambres physiques (7 catégories)</span>
          </div>
        </div>

        {/* System Sources Status */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <button
            onClick={onOpenDataLineage}
            title="Inspecter l'état des connecteurs et bases SQLite locales"
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-[11px] font-medium">VIGIE PLUS</span>
            <span className="text-[10px] text-slate-400">TOPSYS v2.4 (07:15)</span>
          </button>

          <button
            onClick={onOpenDataLineage}
            title="Inspecter les collectes D-Edge"
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-[11px] font-medium">VARA PLUS</span>
            <span className="text-[10px] text-slate-400">D-Edge v0.3.50 (07:30)</span>
          </button>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-700/60 text-indigo-300">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span className="font-mono text-[11px] font-medium">RMS DECISION</span>
            <span className="text-[10px] text-indigo-200">v1.0-alpha</span>
          </div>

          {/* Mandatory Prototype Sandbox Disclaimer */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-950/40 border border-amber-600/60 text-amber-300 font-medium text-[11px]">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Prototype VIGIE RMS — données fictives — aucune connexion ni écriture réelle</span>
          </div>
        </div>

        {/* Quick action buttons & Notifications */}
        <div className="flex items-center gap-2">
          {/* Quick Simulation Trigger Buttons */}
          <button
            onClick={onQuickSimulateStrategy}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/80 text-emerald-300 rounded text-xs transition-colors cursor-pointer"
            title="Simuler l'arrivée d'une recommandation de stratégie d'arrière-plan"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Reco RMS</span>
          </button>

          <button
            onClick={onQuickSimulateSync}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-blue-950/80 hover:bg-blue-900 border border-blue-700/80 text-blue-300 rounded text-xs transition-colors cursor-pointer"
            title="Simuler l'arrivée d'une synchronisation connecteur"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            <span>+ Sync</span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-xs transition-colors cursor-pointer"
            title="Ouvrir le centre de notifications et simulation"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-slate-200" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenParcours}
            className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded text-xs font-semibold shadow transition-all hover:shadow-emerald-900/30 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Parcours Démo A à H</span>
          </button>

          <button
            onClick={onOpenDoc}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-xs transition-colors cursor-pointer"
            title="Documentation et concepts UX"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Doc & Recommandations</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="px-4 flex items-center gap-1 overflow-x-auto scrollbar-none py-1.5 bg-slate-900">
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/90'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${tab.badgeColor ?? 'bg-slate-700 text-white'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
