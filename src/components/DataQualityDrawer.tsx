import React from 'react';
import { X, Database, Clock, ShieldCheck, CheckCircle2, Lock, AlertTriangle, Layers, Layers3 } from 'lucide-react';

interface DataQualityDrawerProps {
  onClose: () => void;
}

export const DataQualityDrawer: React.FC<DataQualityDrawerProps> = ({ onClose }) => {
  return (
    <aside className="fixed top-[125px] bottom-0 right-0 w-full sm:w-[500px] bg-slate-900 border-l border-slate-800 shadow-2xl z-40 flex flex-col text-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white">Provenance, Connecteurs & Qualité des Données</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
        {/* Status distinction overview */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
          <h3 className="font-bold text-white text-xs">Distinction Fondamentale des 3 États de Données</h3>
          <div className="space-y-1.5 text-[11px]">
            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-start gap-2">
              <span className="px-1.5 py-0.2 rounded font-bold font-mono text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                [OBSERVÉ]
              </span>
              <span className="text-slate-300">
                Donnée brute extraite directement de TOPSYS ou D-Edge via les connecteurs locaux (prix affichés, stocks saisis, chambres physiques).
              </span>
            </div>

            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-start gap-2">
              <span className="px-1.5 py-0.2 rounded font-bold font-mono text-[9px] bg-blue-950 text-blue-300 border border-blue-800">
                [CALCULÉ]
              </span>
              <span className="text-slate-300">
                Valeur dérivée d'une règle déterministe validée (grille de dérivation RACK × 0.81, déduction des fictives, écarts Δ).
              </span>
            </div>

            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-start gap-2">
              <span className="px-1.5 py-0.2 rounded font-bold font-mono text-[9px] bg-amber-950 text-amber-300 border border-amber-800">
                [RECOMMANDÉ]
              </span>
              <span className="text-slate-300">
                Préconisation décisionnelle du RMS soumise à validation humaine ou suspension en cas de données périmées.
              </span>
            </div>
          </div>
        </div>

        {/* Subsystem 1: VIGIE PLUS (TOPSYS) */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-emerald-400">VIGIE PLUS — TOPSYS PMS v2.4</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              EXISTANT EN PRODUCTION
            </span>
          </div>
          <div className="text-[11px] text-slate-300 space-y-1">
            <div>• Base locale : <code className="text-slate-400">topsys_cache.sqlite3</code></div>
            <div>• Connecteur : Extracteur de réservations et inventaire physique</div>
            <div>• Dernière synchronisation réussie : 02 nov 2026 à 07:15 CET</div>
            <div>• Règle de fraîcheur : Alerte si obsolescence &gt; 4h, blocage strict si &gt; 18h</div>
          </div>
        </div>

        {/* Subsystem 2: VARA PLUS (D-Edge) */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-blue-400">VARA PLUS — D-Edge v0.3.50</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
              QUALIFICATION OPÉRATIONNELLE
            </span>
          </div>
          <div className="text-[11px] text-slate-300 space-y-1">
            <div>• Base locale : <code className="text-slate-400">vara_observations.sqlite3</code></div>
            <div>• Période couverte : 93 jours d'historique et tarifs futurs</div>
            <div>• Ordonnanceur : Scrape et API versionnée toutes les 30 minutes</div>
            <div>• Détection de variations : RACK RO FLEX (ID 4685) surveillé à chaque cycle</div>
          </div>
        </div>

        {/* Subsystem 3: RMS Decision & Execution Engine */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-indigo-900/60 space-y-2">
          <div className="flex items-center justify-between border-b border-indigo-900/40 pb-2">
            <span className="font-bold text-indigo-300">Moteur RMS & Copilot</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
              FUTUR / EXPÉRIMENTAL (SIMULATION)
            </span>
          </div>
          <div className="text-[11px] text-slate-300 space-y-1">
            <div>• Rapprochement : Algorithme de réconciliation de capacité physique</div>
            <div>• Règles commerciales : Configurable (Stratégies J-10, J-3, surbooking)</div>
            <div>• Mode d'exécution : <strong>Sandbox local sécurisé</strong> (zéro écriture réelle)</div>
            <div>• Sécurité : Verrouillage strict en cas de données incomplètes</div>
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-slate-800 bg-slate-950 text-right">
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
