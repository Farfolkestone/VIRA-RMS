import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Clock,
  Filter,
  CheckCircle2,
  Lock,
  ArrowRight,
  Zap,
  Info,
  DollarSign,
  Layers,
  Database,
  Search,
} from 'lucide-react';
import { HotelAlert, RoomCategoryCode } from '../types/hotel';
import { buildCompleteHotelDataset } from '../data/mockHotelData';
import { ActiveTab } from './Header';

interface AlertsCenterViewProps {
  dataset: ReturnType<typeof buildCompleteHotelDataset>;
  initialDate?: string;
  initialAlertId?: string;
  onNavigate: (tab: ActiveTab, date?: string, category?: RoomCategoryCode) => void;
  onPrepareAction: (actionData: any) => void;
}

export const AlertsCenterView: React.FC<AlertsCenterViewProps> = ({
  dataset,
  initialDate,
  initialAlertId,
  onNavigate,
  onPrepareAction,
}) => {
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'DISPONIBILITE' | 'TARIFAIRE' | 'DONNEES'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'CRITIQUE' | 'ELEVEE' | 'MOYENNE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [alertsState, setAlertsState] = useState<HotelAlert[]>(dataset.alerts);
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(initialAlertId ?? null);

  const handleAcknowledge = (alertId: string) => {
    setAlertsState((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'ACQUITTEE' } : a))
    );
  };

  const filteredAlerts = alertsState.filter((a) => {
    if (typeFilter !== 'ALL' && a.type !== typeFilter) return false;
    if (priorityFilter !== 'ALL' && a.priority !== priorityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.triggerCondition.toLowerCase().includes(q) ||
        a.date.includes(q) ||
        (a.category && a.category.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto text-slate-100">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-950 text-red-300 border border-red-800 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              CENTRE DE TRIAGE DÉCISIONNEL
            </span>
            <span className="text-xs text-slate-400">Règles Métier Algorithmiques RMS</span>
          </div>
          <h1 className="text-lg font-bold text-white mt-1">
            Supervision des Alertes de Disponibilité, Tarifs et Qualité des Données
          </h1>
          <p className="text-xs text-slate-400">
            Chaque alerte est formellement justifiée par des observations horodatées, des règles paramétrées et un score de fiabilité.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="bg-slate-950 px-3 py-1.5 rounded border border-slate-800 text-center">
            <div className="text-slate-400 text-[10px]">Critiques</div>
            <div className="text-sm font-bold text-red-400 font-mono">
              {alertsState.filter((a) => a.priority === 'CRITIQUE').length}
            </div>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded border border-slate-800 text-center">
            <div className="text-slate-400 text-[10px]">Élevées</div>
            <div className="text-sm font-bold text-amber-400 font-mono">
              {alertsState.filter((a) => a.priority === 'ELEVEE').length}
            </div>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded border border-slate-800 text-center">
            <div className="text-slate-400 text-[10px]">Total Actives</div>
            <div className="text-sm font-bold text-white font-mono">{alertsState.length}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Type Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-slate-400 font-medium">Type d'alerte :</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-slate-800 text-white border border-slate-700 rounded px-2.5 py-1 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Tous les types (3)</option>
              <option value="DISPONIBILITE">Disponibilité & Surbooking</option>
              <option value="TARIFAIRE">Tarifaire & Écarts de prix</option>
              <option value="DONNEES">Qualité données & Obsolescence</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-slate-400 font-medium">Priorité :</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="bg-slate-800 text-white border border-slate-700 rounded px-2.5 py-1 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Toutes priorités</option>
              <option value="CRITIQUE">Critique uniquement</option>
              <option value="ELEVEE">Élevée</option>
              <option value="MOYENNE">Moyenne</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Filtrer par mot-clé, date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded pl-8 pr-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-52"
          />
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const isExpanded = expandedAlertId === alert.id;
          const isCrit = alert.priority === 'CRITIQUE';
          const isHigh = alert.priority === 'ELEVEE';

          return (
            <div
              key={alert.id}
              className={`bg-slate-900 border rounded-lg transition-all overflow-hidden ${
                isCrit
                  ? 'border-red-800/80'
                  : isHigh
                  ? 'border-amber-800/80'
                  : 'border-slate-800'
              } ${alert.status === 'ACQUITTEE' ? 'opacity-70' : ''}`}
            >
              {/* Alert Header Row */}
              <div
                onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
                className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-slate-850/60 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {alert.type === 'DISPONIBILITE' && <Layers className="w-4 h-4 text-red-400" />}
                    {alert.type === 'TARIFAIRE' && <DollarSign className="w-4 h-4 text-amber-400" />}
                    {alert.type === 'DONNEES' && <Database className="w-4 h-4 text-purple-400" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.2 rounded text-[10px] font-bold font-mono ${
                          isCrit
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : isHigh
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-blue-950 text-blue-300 border border-blue-800'
                        }`}
                      >
                        {alert.priority}
                      </span>

                      <span className="text-xs font-mono font-bold text-slate-300">
                        {alert.date}
                      </span>

                      {alert.category && (
                        <span className="text-xs font-mono font-semibold text-blue-400">
                          [{alert.category}]
                        </span>
                      )}

                      {alert.demoCaseNumber && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                          Cas Démo #{alert.demoCaseNumber}
                        </span>
                      )}

                      {alert.status === 'ACQUITTEE' && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                          Acquittée localement
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white mt-1">
                      {alert.title}
                    </h3>

                    <p className="text-xs text-slate-400 mt-0.5">
                      {alert.triggerCondition}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <div className="text-right text-[11px] font-mono text-slate-400 hidden sm:block">
                    <div>Fiabilité : <strong className="text-white">{alert.reliability}%</strong></div>
                    <div className="text-[10px] text-slate-500">ID: {alert.id.slice(0, 16)}...</div>
                  </div>

                  <span className="text-xs text-blue-400 font-medium">
                    {isExpanded ? 'Réduire' : 'Détails & Actions →'}
                  </span>
                </div>
              </div>

              {/* Expanded Details Panel */}
              {isExpanded && (
                <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
                      <div className="text-slate-400 font-semibold text-[11px]">Observations Utilisées :</div>
                      <div className="font-mono text-slate-200 text-xs">{alert.observedData}</div>
                      <div className="text-[10px] text-slate-500 pt-1">
                        Horodatage événement : {alert.timestamp.replace('T', ' ').slice(0, 16)} CET
                      </div>
                    </div>

                    <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
                      <div className="text-slate-400 font-semibold text-[11px]">Recommandation Moteur RMS :</div>
                      <div className="text-slate-200 text-xs leading-relaxed font-mono">
                        {alert.recommendation}
                      </div>
                      {alert.isBlocked && (
                        <div className="mt-2 p-2 bg-amber-950/60 border border-amber-800 rounded text-amber-300 text-[11px] flex items-center gap-1.5 font-bold">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{alert.blockedReason}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900">
                    <div className="text-[11px] text-slate-400">
                      Provenance : <strong className="text-slate-200">Règle de Supervision Automatisée v1.0</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      {alert.status === 'NOUVELLE' && (
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium transition-colors"
                        >
                          Acquitter localement (simulation)
                        </button>
                      )}

                      {alert.category && (
                        <button
                          onClick={() => onNavigate('planning', alert.date, alert.category)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold shadow transition-colors"
                        >
                          <span>Voir dans le planning</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
