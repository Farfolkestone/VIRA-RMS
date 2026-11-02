import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Info,
} from 'lucide-react';
import { buildCompleteHotelDataset, RATE_PLANS, DEDGE_PRODUCTS } from '../data/mockHotelData';
import { RoomCategoryCode, ROOM_CATEGORIES } from '../types/hotel';

interface RatesViewProps {
  dataset: ReturnType<typeof buildCompleteHotelDataset>;
  initialDate?: string;
  initialCategory?: RoomCategoryCode;
}

export const RatesView: React.FC<RatesViewProps> = ({ dataset, initialDate, initialCategory }) => {
  const [selectedDate, setSelectedDate] = useState<string>(initialDate ?? '2026-11-05');
  const [selectedCategory, setSelectedCategory] = useState<RoomCategoryCode>(initialCategory ?? 'DCLA');
  const [searchQuery, setSearchQuery] = useState('');
  const [familyFilter, setFamilyFilter] = useState<string>('ALL');

  const dayData = dataset.daysByDate[selectedDate] ?? dataset.days[0];
  const refProduct = DEDGE_PRODUCTS.find((p) => p.id === 5146)!;
  const refPlan = RATE_PLANS.find((p) => p.id === 4685)!;

  // RACK RO FLEX for reference Double Classique
  const currentRefRate = dayData.rackRoFlexRef;

  // Filter rate plans
  const filteredPlans = RATE_PLANS.filter((plan) => {
    if (plan.ignoredInRoutine && familyFilter !== 'WHOLESALE') {
      // Prompt requirement: ignore TRAVCO in routine RMS dynamic surveillance
      return false;
    }
    if (familyFilter !== 'ALL' && plan.family !== familyFilter) return false;
    if (searchQuery && !plan.name.toLowerCase().includes(searchQuery.toLowerCase()) && !plan.code.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto text-slate-100">
      {/* Top Reference Rate Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-900 text-blue-200">
              RÉFÉRENCE CENTRALE PIVOT
            </span>
            <span className="text-xs text-slate-400 font-mono">D-Edge Produit ID 5146 · Plan ID 4685</span>
          </div>
          <h1 className="text-lg font-bold text-white mt-1">
            Double Classique — RACK RO FLEX
          </h1>
          <p className="text-xs text-slate-400">
            Tous les tarifs dérivés (OTA, MOBILE, BEST RATE, VIP) sont calculés dynamiquement par rapport à ce pivot.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div>
            <div className="text-[11px] text-slate-400">Tarif Pivot au {selectedDate} :</div>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {currentRefRate.toFixed(2)} €
            </div>
          </div>
          <div className="text-[10px] text-slate-500 pl-3 border-l border-slate-800">
            <div>Base : 180.00 €</div>
            <div>Week-end : 215.00 €</div>
            <div>Dernière relève : 07:30 CET</div>
          </div>
        </div>
      </div>

      {/* RACK RO FLEX 93-Day Mini Trend Line */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Évolution du RACK RO FLEX sur 93 jours</h2>
          </div>
          <span className="text-xs text-slate-400">Cliquez sur une date pour la sélectionner</span>
        </div>

        {/* SVG Sparkline */}
        <div className="h-28 w-full">
          <svg className="w-full h-full" viewBox="0 0 930 100" preserveAspectRatio="none">
            {/* Range markers */}
            <line x1="0" y1="20" x2="930" y2="20" stroke="#334155" strokeDasharray="3 3" />
            <line x1="0" y1="50" x2="930" y2="50" stroke="#334155" strokeDasharray="3 3" />
            <line x1="0" y1="80" x2="930" y2="80" stroke="#334155" strokeDasharray="3 3" />

            {/* Polyline */}
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
              points={dataset.days
                .map((day, i) => {
                  const x = i * 10;
                  // Map 175€ - 260€ to y range 85 to 15
                  const y = 85 - ((day.rackRoFlexRef - 170) / 90) * 70;
                  return `${x},${y}`;
                })
                .join(' ')}
            />

            {/* Selected Date Point */}
            {(() => {
              const selIdx = dataset.days.findIndex((d) => d.date === selectedDate);
              if (selIdx >= 0) {
                const x = selIdx * 10;
                const y = 85 - ((dayData.rackRoFlexRef - 170) / 90) * 70;
                return (
                  <g>
                    <circle cx={x} cy={y} r="5" fill="#10b981" />
                    <line x1={x} y1="0" x2={x} y2="100" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" />
                  </g>
                );
              }
              return null;
            })()}
          </svg>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800">
          <span>02 Nov 2026 (180.00 €)</span>
          <span className="text-amber-400 font-mono">Modif active 06 Nov (+20€)</span>
          <span>Fin Décembre Fêtes (225.00 €)</span>
          <span>Fashion Week Mi-Janv (250.00 €)</span>
        </div>
      </div>

      {/* Date & Category Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <label className="font-semibold text-slate-300">Date de séjour :</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-800 text-white border border-slate-700 rounded px-2.5 py-1 font-mono focus:outline-none focus:border-blue-500"
            >
              {dataset.days.slice(0, 35).map((d) => (
                <option key={d.date} value={d.date}>
                  {d.date} ({d.dayOfWeek}) — RACK {d.rackRoFlexRef.toFixed(2)} €
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-slate-400" />
            <label className="font-semibold text-slate-300">Catégorie :</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="bg-slate-800 text-white border border-slate-700 rounded px-2.5 py-1 focus:outline-none focus:border-blue-500"
            >
              {(Object.keys(ROOM_CATEGORIES) as RoomCategoryCode[]).map((c) => (
                <option key={c} value={c}>
                  {c} — {ROOM_CATEGORIES[c].name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search & Family Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Rechercher un plan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded pl-8 pr-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-44"
            />
          </div>

          <select
            value={familyFilter}
            onChange={(e) => setFamilyFilter(e.target.value)}
            className="bg-slate-800 text-white border border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Toutes familles</option>
            <option value="RACK">RACK</option>
            <option value="OTA">OTA</option>
            <option value="MOBILE">MOBILE</option>
            <option value="BEST_RATE">BEST RATE</option>
            <option value="VIP">VIP</option>
            <option value="WHOLESALE">TRAVCO Grossiste (Hors routine)</option>
          </select>
        </div>
      </div>

      {/* Comparison Table: Observed vs Calculated vs Delta */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow">
        <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Grille Tarifaire Validée vs Valeurs Observées D-Edge
            </h3>
            <p className="text-[11px] text-slate-400">
              Tolérance stricte de vérification : écart &gt; 1.00 € déclenche une alerte opérationnelle.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {filteredPlans.length} plans affichés
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] uppercase">
                <th className="p-3">Plan Tarifaire</th>
                <th className="p-3">Famille</th>
                <th className="p-3">Règle de Calcul Validée</th>
                <th className="p-3 text-right">Prix Observé D-Edge</th>
                <th className="p-3 text-right">Prix Calculé Règle</th>
                <th className="p-3 text-right">Écart (Δ)</th>
                <th className="p-3 text-center">Version Règle</th>
                <th className="p-3 text-center">Statut Plan</th>
                <th className="p-3">Fraîcheur Relève</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredPlans.map((plan) => {
                const rateKey = `${selectedCategory}_${plan.id}`;
                const rateData = dayData.rates[rateKey];

                const observedPrice = rateData?.observedPrice;
                const calculatedPrice = rateData?.calculatedPrice ?? 0;
                const delta = rateData?.delta ?? 0;
                const hasAnomaly = rateData?.hasAnomaly ?? false;
                const isReference = plan.isReference;

                return (
                  <tr
                    key={plan.id}
                    className={`hover:bg-slate-850/60 transition-colors ${
                      hasAnomaly ? 'bg-red-950/20' : isReference ? 'bg-blue-950/20' : ''
                    }`}
                  >
                    <td className="p-3">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        {isReference && <span className="w-2 h-2 rounded-full bg-blue-400" />}
                        <span>{plan.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Code: {plan.code} · ID: {plan.id}
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-slate-300">
                        {plan.family}
                      </span>
                    </td>

                    <td className="p-3 font-mono text-[11px] text-slate-300">
                      {plan.ruleFormula}
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-white">
                      {observedPrice !== null ? `${observedPrice.toFixed(2)} €` : 'Non observé'}
                    </td>

                    <td className="p-3 text-right font-mono text-slate-300">
                      {calculatedPrice.toFixed(2)} €
                    </td>

                    <td className="p-3 text-right font-mono font-bold">
                      {hasAnomaly ? (
                        <span className="px-2 py-0.5 rounded bg-red-900 text-red-200 border border-red-700 animate-pulse">
                          {delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)} €
                        </span>
                      ) : (
                        <span className="text-emerald-400">0.00 €</span>
                      )}
                    </td>

                    <td className="p-3 text-center">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {plan.ruleVersion}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rateData?.status === 'OUVERT'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-red-950 text-red-300 border border-red-800'
                        }`}
                      >
                        {rateData?.status ?? 'OUVERT'}
                      </span>
                    </td>

                    <td className="p-3 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{rateData?.lastCollectTimestamp.slice(11, 16) ?? '07:30'} CET</span>
                      </div>
                      <div className="text-[10px] text-emerald-400">Récemment relu</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
