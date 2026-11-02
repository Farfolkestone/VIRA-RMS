import React from 'react';
import { X, Sparkles, ArrowRight, CheckCircle2, PlayCircle } from 'lucide-react';
import { PARCOURS_DEFINITIONS } from './ParcoursGuideBar';
import { ActiveTab } from './Header';
import { RoomCategoryCode } from '../types/hotel';

interface GuidedJourneysModalProps {
  onClose: () => void;
  onLaunchParcours: (
    parcoursId: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H',
    tab: ActiveTab,
    date?: string,
    category?: RoomCategoryCode,
    alertId?: string
  ) => void;
}

export const GuidedJourneysModal: React.FC<GuidedJourneysModalProps> = ({
  onClose,
  onLaunchParcours,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Guide des 8 Parcours Interactifs d'Évaluation</h2>
              <p className="text-[11px] text-slate-400">Cliquez sur un parcours pour le tester directement dans l'application</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Journeys */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
          {PARCOURS_DEFINITIONS.map((p) => (
            <div
              key={p.id}
              className="p-3.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center justify-center font-bold text-xs">
                    {p.id}
                  </span>
                  <h3 className="font-bold text-white text-xs">{p.title}</h3>
                  <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                    Onglet : {p.tab}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed pl-8">
                  {p.description}
                </p>
              </div>

              <button
                onClick={() => {
                  onLaunchParcours(p.id, p.tab, p.date, p.category, p.alertId);
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs shadow transition-colors cursor-pointer self-start sm:self-auto shrink-0"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Tester</span>
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-semibold text-xs"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
