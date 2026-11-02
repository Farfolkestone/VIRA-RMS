import React from 'react';
import {
  Hotel,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  Activity,
  Zap,
} from 'lucide-react';
import { buildCompleteHotelDataset } from '../data/mockHotelData';
import { ActiveTab } from './Header';
import { RoomCategoryCode } from '../types/hotel';

interface CockpitViewProps {
  dataset: ReturnType<typeof buildCompleteHotelDataset>;
  onNavigate: (tab: ActiveTab, date?: string, category?: RoomCategoryCode, alertId?: string) => void;
  onOpenParcours: (parcoursId: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H') => void;
}

export const CockpitView: React.FC<CockpitViewProps> = ({ dataset, onNavigate, onOpenParcours }) => {
  const todayData = dataset.days[0]; // 2026-11-02
  const criticalAlerts = dataset.alerts.filter((a) => a.priority === 'CRITIQUE');
  const highAlerts = dataset.alerts.filter((a) => a.priority === 'ELEVEE');

  // Next 14 days preview
  const next14Days = dataset.days.slice(0, 14);

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      {/* Top Welcome / Status strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded-lg shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-tight">Cockpit Exécutif d'Exploitation</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-900/60 text-blue-300 border border-blue-700/50">
              Lundi 02 Novembre 2026
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Supervision temps réel TOPSYS PMS, Channel Manager D-Edge et Moteur d'Arbitrage RMS.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded">
            <span className="text-slate-400">TOPSYS :</span>
            <span className="text-emerald-400 font-mono font-medium">07:15 CET (Frais)</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded">
            <span className="text-slate-400">D-Edge :</span>
            <span className="text-emerald-400 font-mono font-medium">07:30 CET (Frais)</span>
          </div>
        </div>
      </div>

      {/* 10 Fundamental Questions Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Q1: Occupation Réelle */}
        <div
          onClick={() => onNavigate('planning', todayData.date)}
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/60 p-3 rounded-lg cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium group-hover:text-blue-300">1. Occupation Réelle</span>
            <Hotel className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{todayData.occupancyRate}%</span>
            <span className="text-xs text-slate-400">{todayData.totalPhysicalOccupied}/45 ch.</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Fictives exclues : {todayData.fictitiousTotal}</span>
            <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Q2: Chambres Réellement Disponibles */}
        <div
          onClick={() => onNavigate('planning', todayData.date)}
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/60 p-3 rounded-lg cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium group-hover:text-emerald-300">2. Chambres Libres</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono">{todayData.totalFreeRooms}</span>
            <span className="text-xs text-slate-400">ch. physiques</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Admissibles vente : {todayData.totalFreeRooms}</span>
            <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Q3: Stock Commercial D-Edge */}
        <div
          onClick={() => onNavigate('planning', todayData.date)}
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/60 p-3 rounded-lg cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium group-hover:text-indigo-300">3. Stock D-Edge</span>
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-300 font-mono">4</span>
            <span className="text-xs text-slate-400">quotas publiés</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span className="text-emerald-400 font-medium">Aligné à 100% auj.</span>
            <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Q4: Risque Surbooking */}
        <div
          onClick={() => onNavigate('planning', '2026-11-12', 'DCLA')}
          className="bg-slate-900 hover:bg-slate-850 border border-red-800/80 hover:border-red-500 p-3 rounded-lg cursor-pointer transition-all shadow-sm group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-12 h-12 bg-red-500/10 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-red-300 mb-1">
            <span className="font-semibold">4. Risque Surbooking</span>
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-bounce" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-400 font-mono">1</span>
            <span className="text-xs text-red-300">date critique</span>
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex items-center justify-between">
            <span className="font-medium text-red-300">12 nov. (DCLA +3)</span>
            <span className="text-[10px] bg-red-950 text-red-300 px-1 py-0.5 rounded border border-red-800">Parcours A</span>
          </div>
        </div>

        {/* Q5: Sous-commercialisation */}
        <div
          onClick={() => onNavigate('planning', '2026-11-18', 'TDLX')}
          className="bg-slate-900 hover:bg-slate-850 border border-amber-800/80 hover:border-amber-500 p-3 rounded-lg cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-xs text-amber-300 mb-1">
            <span className="font-semibold">5. Sous-vente</span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400 font-mono">2</span>
            <span className="text-xs text-slate-400">ch. non vendues</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>18 nov (TDLX stock 0)</span>
            <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Q6: Tarifs Modifiés */}
        <div
          onClick={() => onNavigate('rates', '2026-11-06')}
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/60 p-3 rounded-lg cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium group-hover:text-blue-300">6. Tarifs Changés</span>
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">+20€</span>
            <span className="text-xs text-emerald-400">RACK RO</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>6 nov. (175€ → 195€)</span>
            <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Q7: Plans Ouverts / Fermés */}
        <div
          onClick={() => onNavigate('status', '2026-11-22')}
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/60 p-3 rounded-lg cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium group-hover:text-purple-300">7. Plans Fermés</span>
            <XCircle className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-300 font-mono">1</span>
            <span className="text-xs text-slate-400">plan fermé déviant</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>BEST RATE (22 nov)</span>
            <span className="text-[10px] bg-purple-950 text-purple-300 px-1 py-0.5 rounded border border-purple-800">Parcours D</span>
          </div>
        </div>

        {/* Q8: Réservations & Mouvements */}
        <div
          onClick={() => onNavigate('reservations')}
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/60 p-3 rounded-lg cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium group-hover:text-teal-300">8. Mouvements</span>
            <UserCheck className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-teal-400 font-mono">1</span>
            <span className="text-xs text-red-400">annulation explicite</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Dossier #BK-9842</span>
            <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Q9: Alertes Décisionnelles */}
        <div
          onClick={() => onNavigate('alerts')}
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-red-500/60 p-3 rounded-lg cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium group-hover:text-red-300">9. Alertes Actives</span>
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-400 font-mono">{criticalAlerts.length}</span>
            <span className="text-xs text-amber-300">critiques / {dataset.alerts.length} tot.</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Arbitrage requis</span>
            <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Q10: Fraîcheur & Qualité */}
        <div
          onClick={() => onNavigate('alerts', '2026-11-28')}
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/60 p-3 rounded-lg cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium group-hover:text-amber-300">10. Qualité Données</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400 font-mono">1</span>
            <span className="text-xs text-slate-400">blocage sécurité</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>28 nov. (&gt;22h obsolète)</span>
            <span className="text-[10px] bg-amber-950 text-amber-300 px-1 py-0.5 rounded border border-amber-800">Parcours F</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Occupancy Pace & Quick Action Banners */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Occupancy and Pick-up next 14 days chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Courbe d'Occupation et Disponibilité (14 prochains jours)</h2>
              <p className="text-xs text-slate-400">Comparaison capacité 45 ch. vs réservations fermes</p>
            </div>
            <button
              onClick={() => onNavigate('planning')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              <span>Voir planning 93j complet</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-44 w-full">
            <svg className="w-full h-full" viewBox="0 0 650 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="0" y1="30" x2="650" y2="30" stroke="#334155" strokeDasharray="3 3" />
              <line x1="0" y1="75" x2="650" y2="75" stroke="#334155" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="650" y2="120" stroke="#334155" strokeDasharray="3 3" />

              <text x="5" y="25" fill="#64748b" fontSize="10">100% (45 ch.)</text>
              <text x="5" y="70" fill="#64748b" fontSize="10">66% (30 ch.)</text>
              <text x="5" y="115" fill="#64748b" fontSize="10">33% (15 ch.)</text>

              {next14Days.map((day, i) => {
                const barWidth = 28;
                const spacing = 44;
                const x = 70 + i * spacing;
                const height = (day.totalPhysicalOccupied / 45) * 110;
                const y = 135 - height;
                const isSurbooking = day.date === '2026-11-12';

                return (
                  <g key={day.date} className="cursor-pointer" onClick={() => onNavigate('planning', day.date)}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={height}
                      rx="3"
                      fill={isSurbooking ? 'url(#alertGrad)' : 'url(#barGrad)'}
                      className="transition-all hover:opacity-80"
                    />
                    {isSurbooking && (
                      <circle cx={x + barWidth / 2} cy={y - 8} r="4" fill="#ef4444" className="animate-ping" />
                    )}
                    <text
                      x={x + barWidth / 2}
                      y="152"
                      fill="#94a3b8"
                      fontSize="9"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {day.date.slice(8)}/{day.date.slice(5, 7)}
                    </text>
                    <text
                      x={x + barWidth / 2}
                      y={Math.max(15, y - 4)}
                      fill={isSurbooking ? '#f87171' : '#cbd5e1'}
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {day.totalPhysicalOccupied}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-blue-600 inline-block"></span>
                <span>Occupation normale</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-red-600 inline-block"></span>
                <span>Alerte surbooking (12 nov)</span>
              </span>
            </div>
            <span className="text-[11px] text-slate-500">Cliquez sur une barre pour ouvrir la date</span>
          </div>
        </div>

        {/* Priority Action Card (Surbooking 12 nov direct launcher) */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/40 border border-red-800/60 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                ACTION PRIORITAIRE IMMÉDIATE
              </span>
              <span className="text-[11px] text-slate-400">12 Nov 2026</span>
            </div>

            <h3 className="text-sm font-bold text-white mb-1">
              Risque de Surbooking Critique (+3 chambres)
            </h3>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              Catégorie <strong className="text-white">Double Classique</strong> : TOPSYS compte 11 occupées sur 13 (2 libres réelles). D-Edge publie 5 chambres en vente active.
            </p>

            <div className="bg-slate-950/80 p-2.5 rounded border border-slate-800 space-y-1 text-xs font-mono mb-3">
              <div className="flex justify-between text-slate-300">
                <span>Physique TOPSYS libre :</span>
                <span className="text-emerald-400 font-bold">2 ch.</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Commercial D-Edge publié :</span>
                <span className="text-red-400 font-bold">5 ch.</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                <span>Écart non couvert :</span>
                <span className="text-red-400 font-bold">+3 ch. (Risque 540€)</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => onNavigate('planning', '2026-11-12', 'DCLA')}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold shadow transition-colors cursor-pointer"
            >
              <span>Examiner et Corriger (Parcours A)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('actions', '2026-11-12')}
              className="w-full flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Voir dans le Centre d'Actions Simulées</span>
            </button>
          </div>
        </div>
      </div>

      {/* Priority Alerts Ticker Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Alertes Décisionnelles Détectées par le Moteur RMS</h2>
            <span className="text-xs text-slate-400">({dataset.alerts.length} anomalies actives)</span>
          </div>
          <button
            onClick={() => onNavigate('alerts')}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
          >
            <span>Centre complet des alertes</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {dataset.alerts.slice(0, 3).map((alert) => (
            <div
              key={alert.id}
              onClick={() => onNavigate('alerts', alert.date, alert.category, alert.id)}
              className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg cursor-pointer transition-all hover:bg-slate-900 group"
            >
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span
                  className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                    alert.priority === 'CRITIQUE'
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : alert.priority === 'ELEVEE'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-blue-950 text-blue-300 border border-blue-800'
                  }`}
                >
                  {alert.priority}
                </span>
                <span className="text-slate-400 font-mono">{alert.date}</span>
              </div>
              <h4 className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors mb-1">
                {alert.title}
              </h4>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {alert.triggerCondition}
              </p>
              <div className="mt-2 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
                <span>Fiabilité : {alert.reliability}%</span>
                <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  Détail <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
