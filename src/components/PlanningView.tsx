import React, { useState } from 'react';
import {
  Calendar,
  Layers,
  DollarSign,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  SlidersHorizontal,
  Info,
  Maximize2,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  RoomCategoryCode,
  ROOM_CATEGORIES,
  RatePlan,
  CommercialStatus,
} from '../types/hotel';
import { buildCompleteHotelDataset } from '../data/mockHotelData';
import { CellInspector } from './CellInspector';

export type PlanningMode = 'disponibilites' | 'tarifs' | 'commercial' | 'alertes';
export type HorizonDays = 7 | 14 | 31 | 93;

interface PlanningViewProps {
  dataset: ReturnType<typeof buildCompleteHotelDataset>;
  initialDate?: string;
  initialCategory?: RoomCategoryCode;
  onPrepareAction: (actionData: any) => void;
}

export const PlanningView: React.FC<PlanningViewProps> = ({
  dataset,
  initialDate,
  initialCategory,
  onPrepareAction,
}) => {
  const [mode, setMode] = useState<PlanningMode>('disponibilites');
  const [horizon, setHorizon] = useState<HorizonDays>(14);
  const [startIndex, setStartIndex] = useState<number>(() => {
    if (initialDate) {
      const idx = dataset.days.findIndex((d) => d.date === initialDate);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  });
  const [selectedCategory, setSelectedCategory] = useState<RoomCategoryCode | 'ALL'>(
    initialCategory ?? 'ALL'
  );
  const [isCompact, setIsCompact] = useState(false);

  // Inspector state
  const [inspectCell, setInspectCell] = useState<{
    date: string;
    category: RoomCategoryCode;
  } | null>(() => {
    if (initialDate && initialCategory) {
      return { date: initialDate, category: initialCategory };
    }
    return null;
  });

  const categories = Object.keys(ROOM_CATEGORIES) as RoomCategoryCode[];
  const displayedCategories = selectedCategory === 'ALL' ? categories : [selectedCategory];

  // Slice visible dates according to horizon and startIndex
  const visibleDays = dataset.days.slice(startIndex, startIndex + horizon);

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(0, prev - 7));
  };

  const handleNext = () => {
    setStartIndex((prev) => Math.min(dataset.days.length - horizon, prev + 7));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] text-slate-100 bg-slate-950 overflow-hidden relative">
      {/* Top Toolbar */}
      <div className="p-3 border-b border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Modes */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <span className="text-[11px] text-slate-400 px-2 font-semibold">Mode :</span>
          <button
            onClick={() => setMode('disponibilites')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-colors ${
              mode === 'disponibilites' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Disponibilités</span>
          </button>
          <button
            onClick={() => setMode('tarifs')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-colors ${
              mode === 'tarifs' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Tarifs & RACK</span>
          </button>
          <button
            onClick={() => setMode('commercial')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-colors ${
              mode === 'commercial' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Commercial & Statuts</span>
          </button>
          <button
            onClick={() => setMode('alertes')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-colors ${
              mode === 'alertes' ? 'bg-red-600 text-white font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Alertes & Anomalies</span>
          </button>
        </div>

        {/* Horizon Presets */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium">Horizon :</span>
          {([7, 14, 31, 93] as HorizonDays[]).map((h) => (
            <button
              key={h}
              onClick={() => {
                setHorizon(h);
                if (startIndex + h > dataset.days.length) {
                  setStartIndex(Math.max(0, dataset.days.length - h));
                }
              }}
              className={`px-2 py-1 rounded text-xs font-mono font-bold transition-colors ${
                horizon === h
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {h}j
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Toutes catégories (7)</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c} — {ROOM_CATEGORIES[c].name} ({ROOM_CATEGORIES[c].totalRooms} ch.)
              </option>
            ))}
          </select>
        </div>

        {/* Navigation & Density */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800 rounded border border-slate-700">
            <button
              onClick={handlePrev}
              disabled={startIndex === 0}
              className="p-1 hover:bg-slate-700 disabled:opacity-40 text-slate-300 disabled:cursor-not-allowed"
              title="7 jours plus tôt"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-[11px] text-slate-300">
              {visibleDays[0]?.date} → {visibleDays[visibleDays.length - 1]?.date}
            </span>
            <button
              onClick={handleNext}
              disabled={startIndex + horizon >= dataset.days.length}
              className="p-1 hover:bg-slate-700 disabled:opacity-40 text-slate-300 disabled:cursor-not-allowed"
              title="7 jours plus tard"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsCompact(!isCompact)}
            className={`px-2 py-1 rounded border text-xs ${
              isCompact ? 'bg-slate-800 text-blue-400 border-blue-500' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Basculer la densité d'affichage"
          >
            {isCompact ? 'Compact' : 'Confort'}
          </button>
        </div>
      </div>

      {/* Legend strip */}
      <div className="px-4 py-1.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          {mode === 'disponibilites' && (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span>
                <span>TOPSYS Libre / D-Edge Publié</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800 font-bold font-mono">
                  +3
                </span>
                <span>Risque Surbooking Critique</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold font-mono">
                  Sous-vente
                </span>
                <span>Chambre libre non commercialisée</span>
              </span>
            </>
          )}

          {mode === 'tarifs' && (
            <>
              <span className="text-slate-300">Plan de référence pivot : <strong>RACK RO FLEX (Double Classique ID 5146)</strong></span>
              <span className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800 font-bold font-mono">
                  Δ &gt; 1.00 €
                </span>
                <span>Anomalie par rapport à la formule validée</span>
              </span>
            </>
          )}

          {mode === 'commercial' && (
            <>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500"></span> Ouvert</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500"></span> Fermé</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-slate-600"></span> Épuisé</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple-500"></span> Inconnu</span>
            </>
          )}

          {mode === 'alertes' && (
            <span className="text-amber-300 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Affichage prioritaire des anomalies opérationnelles et tarifaires</span>
            </span>
          )}
        </div>

        <span className="text-slate-500 italic hidden sm:inline">
          Cliquez sur une cellule pour ouvrir l'inspecteur contextuel détaillé
        </span>
      </div>

      {/* Main Grid Container with Sticky Headers */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        <table className="w-full border-collapse text-left border-spacing-0">
          <thead>
            {/* Header row 1: Dates */}
            <tr className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
              <th className="p-2.5 bg-slate-900 border-r border-slate-800 sticky left-0 z-40 min-w-[200px] text-xs font-bold text-slate-300">
                Catégorie & Inventaire
              </th>
              {visibleDays.map((day) => {
                const isWeekend = day.dayOfWeek === 'Ven' || day.dayOfWeek === 'Sam';
                const isSelectedDay = inspectCell?.date === day.date;
                const hasCriticalAlert = day.alerts.some((a) => a.priority === 'CRITIQUE');

                return (
                  <th
                    key={day.date}
                    className={`p-2 border-r border-slate-800 text-center min-w-[85px] transition-colors ${
                      hasCriticalAlert
                        ? 'bg-red-950/40 text-red-200'
                        : isWeekend
                        ? 'bg-slate-900 text-slate-200'
                        : 'bg-slate-950 text-slate-300'
                    } ${isSelectedDay ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="text-[10px] uppercase font-semibold text-slate-400">
                      {day.dayOfWeek}
                    </div>
                    <div className="font-mono text-xs font-bold text-white">
                      {day.date.slice(8)}/{day.date.slice(5, 7)}
                    </div>
                    {/* Occupancy Rate Bar */}
                    <div className="mt-1 flex items-center justify-center gap-1">
                      <span
                        className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                          day.occupancyRate >= 85
                            ? 'bg-blue-900 text-blue-200 font-bold'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {day.occupancyRate}%
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>

            {/* Header row 2: Hotel Global Totals */}
            <tr className="bg-slate-900/90 border-b border-slate-800 sticky top-[57px] z-20 text-[11px] text-slate-400 font-mono">
              <th className="p-2 bg-slate-900 border-r border-slate-800 sticky left-0 z-30 font-semibold text-slate-300">
                Total Hôtel (45 ch.)
              </th>
              {visibleDays.map((day) => (
                <th key={day.date} className="p-1.5 border-r border-slate-800 text-center">
                  <div className="text-emerald-400 font-bold">{day.totalFreeRooms} libres</div>
                  <div className="text-[9px] text-slate-500">{day.totalPhysicalOccupied} occ.</div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {displayedCategories.map((cat) => {
              const config = ROOM_CATEGORIES[cat];

              return (
                <tr
                  key={cat}
                  className="border-b border-slate-800/80 hover:bg-slate-900/50 transition-colors"
                >
                  {/* Sticky Category Info Column */}
                  <td className="p-2.5 bg-slate-950 border-r border-slate-800 sticky left-0 z-10 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-400">{cat}</span>
                      <span className="font-semibold text-slate-200 truncate">{config.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>Capacité : {config.totalRooms} ch.</span>
                      {cat === 'DCAD' && (
                        <span className="text-amber-400 font-bold">2 unités / résa</span>
                      )}
                    </div>
                  </td>

                  {/* Grid Cells for this category across visible days */}
                  {visibleDays.map((day) => {
                    const topsys = day.topsys[cat];
                    const dedge = day.dedge[cat];
                    const recon = day.reconciliations[cat];
                    const rateItem = day.rates[`${cat}_4685`]; // RACK RO FLEX
                    const mobileRate = day.rates[`${cat}_4720`]; // MOBILE RO
                    const isSelected =
                      inspectCell?.date === day.date && inspectCell?.category === cat;

                    return (
                      <td
                        key={day.date}
                        onClick={() => setInspectCell({ date: day.date, category: cat })}
                        className={`p-2 border-r border-slate-800/80 text-center cursor-pointer transition-all select-none ${
                          isSelected
                            ? 'bg-blue-900/40 ring-2 ring-blue-500'
                            : recon.isOverbookingRisk
                            ? 'bg-red-950/30 hover:bg-red-950/50'
                            : recon.isUnderCommercialized
                            ? 'bg-amber-950/30 hover:bg-amber-950/50'
                            : 'hover:bg-slate-850'
                        }`}
                      >
                        {/* MODE 1: DISPONIBILITÉS */}
                        {mode === 'disponibilites' && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-center gap-1.5 font-mono text-xs">
                              <span
                                className="font-bold text-emerald-400"
                                title={`TOPSYS Physique Libre : ${recon.physicalFree}`}
                              >
                                {recon.physicalFree}
                              </span>
                              <span className="text-slate-600">/</span>
                              <span
                                className={`font-bold ${
                                  recon.isOverbookingRisk
                                    ? 'text-red-400'
                                    : recon.isUnderCommercialized
                                    ? 'text-amber-400'
                                    : 'text-slate-300'
                                }`}
                                title={`D-Edge Commercial Publié : ${recon.commercialPublished}`}
                              >
                                {recon.commercialPublished}
                              </span>
                            </div>

                            {/* Indicator Badges */}
                            {recon.isOverbookingRisk && (
                              <div className="inline-block px-1 py-0.2 rounded bg-red-600 text-white font-bold text-[10px] animate-pulse">
                                +{recon.stockDelta} Risque
                              </div>
                            )}

                            {recon.isUnderCommercialized && (
                              <div className="inline-block px-1 py-0.2 rounded bg-amber-900/80 text-amber-200 text-[9px] font-semibold border border-amber-700">
                                Sous-vente
                              </div>
                            )}

                            {!recon.isOverbookingRisk && !recon.isUnderCommercialized && (
                              <div className="text-[9px] text-slate-500 font-mono">
                                Aligné
                              </div>
                            )}
                          </div>
                        )}

                        {/* MODE 2: TARIFS */}
                        {mode === 'tarifs' && (
                          <div className="space-y-1">
                            <div className="text-xs font-mono font-bold text-white">
                              {rateItem?.observedPrice?.toFixed(2) ?? '—'} €
                            </div>
                            <div className="text-[10px] text-slate-400">
                              RACK RO
                            </div>
                            {/* Check Mobile rate pricing anomaly (Case 9 on Nov 5) */}
                            {mobileRate?.hasAnomaly && (
                              <div className="inline-block px-1 py-0.2 rounded bg-red-950 text-red-300 border border-red-800 text-[9px] font-bold">
                                Δ {mobileRate.delta}€
                              </div>
                            )}
                          </div>
                        )}

                        {/* MODE 3: COMMERCIAL */}
                        {mode === 'commercial' && (
                          <div className="space-y-1">
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                dedge.status === 'OUVERT'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : dedge.status === 'FERME'
                                  ? 'bg-red-950 text-red-300 border border-red-800'
                                  : dedge.status === 'VENTE_FERMEE'
                                  ? 'bg-red-950 text-red-400 font-bold border border-red-900'
                                  : dedge.status === 'INCONNU'
                                  ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {dedge.status}
                            </span>
                            <div className="text-[9px] text-slate-500 font-mono">
                              Stock : {dedge.publishedStock}
                            </div>
                          </div>
                        )}

                        {/* MODE 4: ALERTES */}
                        {mode === 'alertes' && (
                          <div className="space-y-1">
                            {recon.isOverbookingRisk ? (
                              <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-bold text-[10px] block">
                                Surbooking +{recon.stockDelta}
                              </span>
                            ) : recon.isUnderCommercialized ? (
                              <span className="px-1.5 py-0.5 rounded bg-amber-600 text-white font-bold text-[10px] block">
                                Sous-vente
                              </span>
                            ) : topsys.isStale ? (
                              <span className="px-1.5 py-0.5 rounded bg-purple-600 text-white font-bold text-[10px] block">
                                TOPSYS &gt;18h
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-600 block">—</span>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Slide-over Cell Inspector */}
      {inspectCell && (
        <CellInspector
          date={inspectCell.date}
          category={inspectCell.category}
          topsys={dataset.daysByDate[inspectCell.date].topsys[inspectCell.category]}
          dedge={dataset.daysByDate[inspectCell.date].dedge[inspectCell.category]}
          reconciliation={
            dataset.daysByDate[inspectCell.date].reconciliations[inspectCell.category]
          }
          alerts={dataset.daysByDate[inspectCell.date].alerts.filter(
            (a) => a.category === inspectCell.category
          )}
          onClose={() => setInspectCell(null)}
          onPrepareAction={(actionData) => {
            onPrepareAction(actionData);
            setInspectCell(null);
          }}
        />
      )}
    </div>
  );
};
