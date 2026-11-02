import React, { useState } from 'react';
import {
  Sliders,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { buildCompleteHotelDataset } from '../data/mockHotelData';
import { CommercialStrategy } from '../types/hotel';
import { simulateCommercialStrategy } from '../logic/rmsEngine';

interface StrategiesViewProps {
  dataset: ReturnType<typeof buildCompleteHotelDataset>;
}

export const StrategiesView: React.FC<StrategiesViewProps> = ({ dataset }) => {
  const [strategies, setStrategies] = useState<CommercialStrategy[]>(dataset.strategies);
  const [activeStrategyId, setActiveStrategyId] = useState<string>('STRAT-01');

  // Interactive parameters for the selected strategy
  const activeStrategy = strategies.find((s) => s.id === activeStrategyId) ?? strategies[0];

  const [threshold, setThreshold] = useState<number>(activeStrategy.freeRoomsThreshold);
  const [horizon, setHorizon] = useState<number>(activeStrategy.horizonDays);
  const [simulationResults, setSimulationResults] = useState<any[] | null>(null);

  const handleRunSimulation = () => {
    const updatedStrategy: CommercialStrategy = {
      ...activeStrategy,
      freeRoomsThreshold: threshold,
      horizonDays: horizon,
    };

    const daysInput = dataset.days.map((d) => ({
      date: d.date,
      dayOffset: d.dayOffset,
      totalFreeRooms: d.totalFreeRooms,
      occupancyRate: d.occupancyRate,
    }));

    const results = simulateCommercialStrategy(updatedStrategy, daysInput);
    setSimulationResults(results);
  };

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto text-slate-100">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-900 text-indigo-200">
              MOTEUR DE STRATÉGIES COMMERCIALES
            </span>
            <span className="text-xs text-slate-400">Règles Dynamiques Conditionnelles RMS</span>
          </div>
          <h1 className="text-lg font-bold text-white mt-1">
            Définition et Simulation des Politiques Tarifaires & Disponibilités
          </h1>
          <p className="text-xs text-slate-400">
            Ajustez les seuils de stock libre et l'horizon pour simuler instantanément les arbitrages de distribution.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-amber-950/40 border border-amber-700/60 text-amber-300 px-3 py-1.5 rounded">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Moteur de simulation locale — Aucun impact sur les serveurs réels</span>
        </div>
      </div>

      {/* Main Grid: Strategy Configurator on Left, Simulation Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Visual Rule Editor (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>Éditeur Visuel de Règle</span>
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">Priorité #{activeStrategy.priority}</span>
            </div>

            {/* Strategy Title & Selector */}
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Stratégie active :</label>
              <select
                value={activeStrategyId}
                onChange={(e) => {
                  const id = e.target.value;
                  setActiveStrategyId(id);
                  const st = strategies.find((s) => s.id === id);
                  if (st) {
                    setThreshold(st.freeRoomsThreshold);
                    setHorizon(st.horizonDays);
                    setSimulationResults(null);
                  }
                }}
                className="w-full bg-slate-800 text-white border border-slate-700 rounded p-2 text-xs focus:outline-none focus:border-blue-500 font-semibold"
              >
                {strategies.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Slider 1: Horizon in Days */}
            <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">Horizon d'Application :</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">{horizon} jours</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={horizon}
                onChange={(e) => setHorizon(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>J+1 (Demain)</span>
                <span>J+10 (Recommandé)</span>
                <span>J+30</span>
              </div>
            </div>

            {/* Slider 2: Free Rooms Threshold */}
            <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">Seuil Chambres Physiques Libres :</span>
                <span className="font-mono text-blue-400 font-bold text-sm">{threshold} chambres</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>5 ch. (Tension)</span>
                <span>25 ch. (Standard Marais)</span>
                <span>40 ch.</span>
              </div>
            </div>

            {/* Condition & Action Logic Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-emerald-950/30 border border-emerald-900/60 rounded space-y-1">
                <div className="font-bold text-emerald-300 text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Si Stock Libre &gt; {threshold} chambres :</span>
                </div>
                <div className="text-[11px] text-slate-300 pl-5">
                  • <strong>Ouvrir</strong> les plans : <span className="font-mono text-white">MOBILE_RO, BEST_RATE_RO</span>
                  <br />• <strong>Fermer</strong> le plan : <span className="font-mono text-red-300">VIP_CORP</span>
                </div>
              </div>

              <div className="p-2.5 bg-blue-950/30 border border-blue-900/60 rounded space-y-1">
                <div className="font-bold text-blue-300 text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Si Stock Libre &lt; {threshold} chambres :</span>
                </div>
                <div className="text-[11px] text-slate-300 pl-5">
                  • <strong>Fermer</strong> les plans promotions : <span className="font-mono text-red-300">MOBILE_RO, BEST_RATE_RO</span>
                  <br />• <strong>Ouvrir</strong> le plan direct : <span className="font-mono text-emerald-300">VIP_CORP</span>
                </div>
              </div>
            </div>

            {/* Run Simulation Button */}
            <button
              onClick={handleRunSimulation}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded shadow transition-all cursor-pointer text-xs"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Exécuter la simulation sur 93 jours (Parcours B)</span>
            </button>
          </div>
        </div>

        {/* Right Column: Simulation Output (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h2 className="text-sm font-bold text-white">Résultats de la Simulation par Date de Séjour</h2>
              <p className="text-xs text-slate-400">
                {simulationResults
                  ? `${simulationResults.filter((r) => r.triggered).length} dates déclenchant une action automatique dans l'horizon J+${horizon}`
                  : "Cliquez sur 'Exécuter la simulation' pour évaluer la règle"}
              </p>
            </div>
            {simulationResults && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                Simulation effectuée
              </span>
            )}
          </div>

          {simulationResults ? (
            <div className="flex-1 overflow-y-auto max-h-[500px] space-y-2 pr-1 scrollbar-thin">
              {simulationResults.slice(0, horizon + 5).map((res) => {
                const dayData = dataset.daysByDate[res.date];

                return (
                  <div
                    key={res.date}
                    className={`p-3 rounded border text-xs transition-colors ${
                      res.triggered
                        ? res.actionTaken === 'ABOVE'
                          ? 'bg-emerald-950/20 border-emerald-900/60'
                          : 'bg-blue-950/20 border-blue-900/60'
                        : 'bg-slate-950/50 border-slate-800/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{res.date}</span>
                        <span className="text-slate-400 text-[10px]">({dayData?.dayOfWeek})</span>
                        <span className="text-slate-400 text-[11px]">
                          Stock libre : <strong className="text-emerald-400">{dayData?.totalFreeRooms} ch.</strong>
                        </span>
                      </div>

                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          res.triggered
                            ? res.actionTaken === 'ABOVE'
                              ? 'bg-emerald-900 text-emerald-200'
                              : 'bg-blue-900 text-blue-200'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {res.triggered ? `Action ${res.actionTaken}` : 'Hors Horizon'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 mt-1">{res.reason}</p>

                    {res.triggered && (
                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-3">
                          {res.plansOpened.length > 0 && (
                            <span className="text-emerald-400">
                              Ouvrir : <strong>{res.plansOpened.join(', ')}</strong>
                            </span>
                          )}
                          {res.plansClosed.length > 0 && (
                            <span className="text-red-400">
                              Fermer : <strong>{res.plansClosed.join(', ')}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <Sliders className="w-10 h-10 text-slate-600 mb-2" />
              <h3 className="font-bold text-white text-sm">Prêt pour la simulation</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Ajustez le seuil de chambres libres (actuellement {threshold} ch.) puis lancez la simulation pour prévisualiser les préconisations du RMS.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
