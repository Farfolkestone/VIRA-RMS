import React, { useState } from 'react';
import {
  Layers,
  Filter,
  Search,
  Calendar,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { buildCompleteHotelDataset, RATE_PLANS, DEDGE_PRODUCTS } from '../data/mockHotelData';
import { RoomCategoryCode, ROOM_CATEGORIES, CommercialStatus } from '../types/hotel';

type SearchFilterMode = 'AU_MOINS_UN_JOUR' | 'TOUS_LES_JOURS' | 'CHANGEMENT';

interface StatusMatrixViewProps {
  dataset: ReturnType<typeof buildCompleteHotelDataset>;
  initialDate?: string;
}

export const StatusMatrixView: React.FC<StatusMatrixViewProps> = ({ dataset, initialDate }) => {
  const [selectedCategory, setSelectedCategory] = useState<RoomCategoryCode>('DCLA');
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>('ALL');
  const [targetStatus, setTargetStatus] = useState<CommercialStatus | 'ALL'>('ALL');
  const [filterMode, setFilterMode] = useState<SearchFilterMode>('AU_MOINS_UN_JOUR');
  const [horizonDays, setHorizonDays] = useState<number>(31);

  const visibleDays = dataset.days.slice(0, horizonDays);

  const displayedPlans = RATE_PLANS.filter((p) => {
    if (selectedPlanCode !== 'ALL' && p.code !== selectedPlanCode) return false;
    if (p.ignoredInRoutine) return false;
    return true;
  });

  const getStatusBadge = (status: CommercialStatus) => {
    switch (status) {
      case 'OUVERT':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">OUVERT</span>;
      case 'FERME':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800">FERMÉ</span>;
      case 'VENTE_FERMEE':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-900">V. FERMÉE</span>;
      case 'PERIODE_FERMEE':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">PÉR. FERMÉE</span>;
      case 'EPUISE':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">ÉPUISÉ</span>;
      case 'INDISPONIBLE':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">INDISPONIBLE</span>;
      case 'SUR_DEMANDE':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">SUR DEMANDE</span>;
      case 'INCONNU':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-900 text-purple-200 border border-purple-600 animate-pulse">INCONNU</span>;
      case 'NON_OBSERVE':
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-600 bg-slate-900">NON OBS.</span>;
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto text-slate-100">
      {/* Title Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-900 text-purple-200">
              CENTRE OUVERTURES & FERMETURES
            </span>
            <span className="text-xs text-slate-400">Matrice Multidate des Statuts Commerciaux</span>
          </div>
          <h1 className="text-lg font-bold text-white mt-1">
            Surveillance et Traçabilité des Statuts de Vente D-Edge
          </h1>
          <p className="text-xs text-slate-400">
            Distingue formellement un état prouvé (ouvert / fermé / épuisé) d'un état indéterminé ou non observé.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            <span className="text-slate-400">Période :</span>
            <span className="font-mono text-white font-bold">{horizonDays} jours</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            <span className="text-slate-400">Catégorie :</span>
            <span className="font-mono text-blue-300 font-bold">{selectedCategory}</span>
          </div>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Category Selector */}
            <div className="flex items-center gap-1.5">
              <label className="text-slate-400 font-medium">Catégorie :</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="bg-slate-800 text-white border border-slate-700 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
              >
                {(Object.keys(ROOM_CATEGORIES) as RoomCategoryCode[]).map((c) => (
                  <option key={c} value={c}>
                    {c} — {ROOM_CATEGORIES[c].name}
                  </option>
                ))}
              </select>
            </div>

            {/* Plan Selector */}
            <div className="flex items-center gap-1.5">
              <label className="text-slate-400 font-medium">Plan commercial :</label>
              <select
                value={selectedPlanCode}
                onChange={(e) => setSelectedPlanCode(e.target.value)}
                className="bg-slate-800 text-white border border-slate-700 rounded px-2 py-1 font-mono focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">Tous les plans ({RATE_PLANS.length - 1})</option>
                {RATE_PLANS.filter((p) => !p.ignoredInRoutine).map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Status */}
            <div className="flex items-center gap-1.5">
              <label className="text-slate-400 font-medium">Statut ciblé :</label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as any)}
                className="bg-slate-800 text-white border border-slate-700 rounded px-2 py-1 font-mono focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">Tous statuts</option>
                <option value="OUVERT">OUVERT</option>
                <option value="FERME">FERMÉ</option>
                <option value="VENTE_FERMEE">VENTE FERMÉE</option>
                <option value="EPUISE">ÉPUISÉ</option>
                <option value="INCONNU">INCONNU</option>
              </select>
            </div>
          </div>

          {/* Search Mode Toggle: Au moins un jour vs Tous les jours vs Changement */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 px-2 font-medium">Mode de recherche :</span>
            <button
              onClick={() => setFilterMode('AU_MOINS_UN_JOUR')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                filterMode === 'AU_MOINS_UN_JOUR' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Au moins un jour
            </button>
            <button
              onClick={() => setFilterMode('TOUS_LES_JOURS')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                filterMode === 'TOUS_LES_JOURS' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tous les jours
            </button>
            <button
              onClick={() => setFilterMode('CHANGEMENT')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                filterMode === 'CHANGEMENT' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Changement
            </button>
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-[11px]">
                <th className="p-3 min-w-[200px] sticky left-0 bg-slate-950 z-20 font-bold text-slate-300">
                  Plan Tarifaire ({selectedCategory})
                </th>
                {visibleDays.map((d) => (
                  <th
                    key={d.date}
                    className={`p-2 border-r border-slate-800/80 text-center min-w-[80px] ${
                      d.date === initialDate ? 'bg-blue-950/40 text-blue-200' : ''
                    }`}
                  >
                    <div className="text-[10px] text-slate-400 uppercase font-mono">{d.dayOfWeek}</div>
                    <div className="font-mono font-bold text-white">{d.date.slice(8)}/{d.date.slice(5, 7)}</div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80">
              {displayedPlans.map((plan) => {
                return (
                  <tr key={plan.code} className="hover:bg-slate-850/50 transition-colors">
                    {/* Sticky Plan Header */}
                    <td className="p-3 sticky left-0 bg-slate-950 z-10 border-r border-slate-800">
                      <div className="font-semibold text-white">{plan.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {plan.code} · Famille {plan.family}
                      </div>
                    </td>

                    {/* Status cell per date */}
                    {visibleDays.map((d) => {
                      const rateItem = d.rates[`${selectedCategory}_${plan.id}`];
                      const status = rateItem?.status ?? 'OUVERT';

                      return (
                        <td
                          key={d.date}
                          className="p-2 border-r border-slate-800/80 text-center font-mono text-[11px]"
                        >
                          {getStatusBadge(status)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explanatory Callout for Parcours D */}
      <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg flex items-start gap-3 text-xs">
        <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-white">Cas de Démonstration : Fermeture Inattendue BEST RATE (22 Novembre)</h4>
          <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
            Le 22 novembre 2026, le plan <strong className="text-white">BEST_RATE_RO</strong> est observé au statut <strong className="text-red-400">FERMÉ</strong> sur D-Edge alors que l'occupation prévisionnelle n'est que de 55.6% (20 chambres occupées sur 45). Le moteur RMS préconise la réouverture pour dynamiser le pick-up.
          </p>
        </div>
      </div>
    </div>
  );
};
