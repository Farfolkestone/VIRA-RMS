import React from 'react';
import {
  X,
  Bell,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2,
  Play,
  ArrowRight,
  Database,
  Sliders,
} from 'lucide-react';
import { ToastNotification } from '../types/toast';
import { ActiveTab } from './Header';
import { RoomCategoryCode } from '../types/hotel';

interface NotificationCenterDrawerProps {
  notifications: ToastNotification[];
  onClose: () => void;
  onClearAll: () => void;
  onNavigate: (tab: ActiveTab, date?: string, category?: RoomCategoryCode, alertId?: string) => void;
  onSimulateStrategy: () => void;
  onSimulateTopsysSync: () => void;
  onSimulateDEdgeSync: () => void;
  onSimulateSurbookingAlert: () => void;
  isAutoSimulating: boolean;
  onToggleAutoSimulating: () => void;
}

export const NotificationCenterDrawer: React.FC<NotificationCenterDrawerProps> = ({
  notifications,
  onClose,
  onClearAll,
  onNavigate,
  onSimulateStrategy,
  onSimulateTopsysSync,
  onSimulateDEdgeSync,
  onSimulateSurbookingAlert,
  isAutoSimulating,
  onToggleAutoSimulating,
}) => {
  return (
    <aside className="fixed top-[125px] bottom-0 right-0 w-full sm:w-[480px] bg-slate-900 border-l border-slate-800 shadow-2xl z-40 flex flex-col text-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white">Centre de Notifications & Événements</h2>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
            {notifications.length}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Simulator Controls Strip */}
      <div className="p-3.5 bg-slate-950 border-b border-slate-800 space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Play className="w-3 h-3 text-emerald-400" />
            <span>Simulateurs d'Événements d'Arrière-Plan :</span>
          </span>
          <button
            onClick={onToggleAutoSimulating}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
              isAutoSimulating
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {isAutoSimulating ? 'Auto: ACTIF (30s)' : 'Auto: INACTIF'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onSimulateStrategy}
            className="flex items-center gap-1.5 p-2 rounded bg-slate-900 hover:bg-slate-850 border border-emerald-900/60 hover:border-emerald-600 text-slate-200 text-[11px] transition-all text-left group"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <div>
              <strong className="block text-white text-[10.5px]">Recommandation RMS</strong>
              <span className="text-[9.5px] text-slate-400">Stratégie J-10 Pick-up</span>
            </div>
          </button>

          <button
            onClick={onSimulateTopsysSync}
            className="flex items-center gap-1.5 p-2 rounded bg-slate-900 hover:bg-slate-850 border border-blue-900/60 hover:border-blue-600 text-slate-200 text-[11px] transition-all text-left group"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-45 transition-transform" />
            <div>
              <strong className="block text-white text-[10.5px]">Sync TOPSYS PMS</strong>
              <span className="text-[9.5px] text-slate-400">45 ch. synchronisées</span>
            </div>
          </button>

          <button
            onClick={onSimulateDEdgeSync}
            className="flex items-center gap-1.5 p-2 rounded bg-slate-900 hover:bg-slate-850 border border-blue-900/60 hover:border-blue-600 text-slate-200 text-[11px] transition-all text-left group"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
            <div>
              <strong className="block text-white text-[10.5px]">Sync D-Edge (VARA)</strong>
              <span className="text-[9.5px] text-slate-400">8 produits & prix RACK</span>
            </div>
          </button>

          <button
            onClick={onSimulateSurbookingAlert}
            className="flex items-center gap-1.5 p-2 rounded bg-slate-900 hover:bg-slate-850 border border-red-900/60 hover:border-red-600 text-slate-200 text-[11px] transition-all text-left group"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform" />
            <div>
              <strong className="block text-white text-[10.5px]">Alerte Surbooking</strong>
              <span className="text-[9.5px] text-slate-400">Divergence commercial/physique</span>
            </div>
          </button>
        </div>
      </div>

      {/* Notifications History List */}
      <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
        <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800">
          <span>Historique des notifications de la session</span>
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 text-slate-400 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Effacer tout</span>
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
            <Bell className="w-8 h-8 text-slate-600 mb-2 opacity-40" />
            <p className="text-xs">Aucune notification pour le moment.</p>
            <p className="text-[10px] text-slate-600 mt-1">
              Utilisez les boutons ci-dessus pour simuler une recommandation ou une synchronisation.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3 rounded-lg border text-xs space-y-1.5 transition-colors ${
                n.type === 'strategy_recommendation'
                  ? 'bg-slate-950 border-emerald-900/60'
                  : n.type === 'data_sync'
                  ? 'bg-slate-950 border-blue-900/60'
                  : n.type === 'alert_detected'
                  ? 'bg-slate-950 border-red-900/60'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
                  {n.type === 'strategy_recommendation' && (
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  {n.type === 'data_sync' && (
                    <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                  )}
                  {n.type === 'alert_detected' && (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  )}
                  <span>{n.title}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{n.timestamp}</span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">{n.message}</p>

              <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 border-t border-slate-900">
                <span>{n.source}</span>
                {n.action && (
                  <button
                    onClick={() => {
                      onNavigate(n.action!.tab, n.action!.date, n.action!.category, n.action!.alertId);
                      onClose();
                    }}
                    className="flex items-center gap-1 font-bold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <span>{n.action.label}</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-end">
        <button
          onClick={onClose}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold"
        >
          Fermer
        </button>
      </div>
    </aside>
  );
};
