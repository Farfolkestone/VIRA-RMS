import React from 'react';
import { PlayCircle, ChevronRight, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { ActiveTab } from './Header';
import { RoomCategoryCode } from '../types/hotel';

export interface ParcoursLauncherProps {
  onSelectParcours: (
    parcoursId: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H',
    targetTab: ActiveTab,
    targetDate?: string,
    targetCategory?: RoomCategoryCode,
    targetAlertId?: string
  ) => void;
  activeParcours: string | null;
  onCloseParcoursBar: () => void;
}

export const PARCOURS_DEFINITIONS = [
  {
    id: 'A' as const,
    title: 'Parcours A : Risque Surbooking',
    tag: 'Surbooking J+10',
    description: 'Cockpit → Alerte 12 nov → Double Classique (physique 2 vs publié 5) → Justification R-SURBOOK → Préparer correction simulée.',
    tab: 'cockpit' as ActiveTab,
    date: '2026-11-12',
    category: 'DCLA' as RoomCategoryCode,
    alertId: 'ALT-SURBOOK-2026-11-12-DCLA',
  },
  {
    id: 'B' as const,
    title: 'Parcours B : Stratégie Commerciale',
    tag: 'Simulateur J-10',
    description: 'Stratégies → Ajuster le seuil de chambres libres (25 ch.) → Lancer simulation locale → Examiner les ouvertures/fermetures de plans par date.',
    tab: 'strategies' as ActiveTab,
  },
  {
    id: 'C' as const,
    title: 'Parcours C : Vérification Tarifaire',
    tag: 'Écart RACK vs Mobile',
    description: 'Tarifs → 5 nov → RACK RO FLEX 190€ → Calcul Mobile 153.90€ vs Observé 140.00€ → Écart -13.90€ → Règle de dérivation v2.2.',
    tab: 'rates' as ActiveTab,
    date: '2026-11-05',
    category: 'DCLA' as RoomCategoryCode,
  },
  {
    id: 'D' as const,
    title: 'Parcours D : Plans Fermés',
    tag: 'Matrice des Statuts',
    description: 'Ouvertures/Fermetures → Filtrer BEST RATE → Basculer "Au moins 1 jour" vs "Tous les jours" → Identifier les dates fermées (22 nov).',
    tab: 'status' as ActiveTab,
    date: '2026-11-22',
  },
  {
    id: 'E' as const,
    title: 'Parcours E : Copilot Hôtelier',
    tag: 'Assistant IA',
    description: 'Copilot → Poser question "Quelles dates présentent un risque de surbooking ?" → Données, sources, confiance → Bouton vers planning.',
    tab: 'copilot' as ActiveTab,
  },
  {
    id: 'F' as const,
    title: 'Parcours F : Données Périmées',
    tag: 'Blocage Sécurité',
    description: 'Alertes/Planning → 28 nov (TOPSYS > 22h) → Recommandation bloquée pour données insuffisantes → Audit des raisons de blocage.',
    tab: 'alerts' as ActiveTab,
    date: '2026-11-28',
    alertId: 'ALT-STALE-2026-11-28',
  },
  {
    id: 'G' as const,
    title: 'Parcours G : Actions Simulées',
    tag: 'Workflow 4 États',
    description: 'Actions → Examiner recommandation surbooking → Diff Avant/Après → Simuler approbation humaine → Audit trail sans écriture réelle.',
    tab: 'actions' as ActiveTab,
    date: '2026-11-12',
  },
  {
    id: 'H' as const,
    title: 'Parcours H : Planning 93 Jours',
    tag: 'Matrice Complète',
    description: 'Planning → Fenêtres 7j / 14j / 31j / 93j → Basculer Disponibilités / Tarifs / Commercial / Alertes → Inspecteur contextuel.',
    tab: 'planning' as ActiveTab,
    date: '2026-11-02',
  },
];

export const ParcoursGuideBar: React.FC<ParcoursLauncherProps> = ({
  onSelectParcours,
  activeParcours,
  onCloseParcoursBar,
}) => {
  return (
    <div className="bg-slate-950 border-b border-indigo-900/60 px-4 py-2 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-2 shadow-inner sticky top-[82px] z-40">
      <div className="flex items-center gap-2 text-slate-300 shrink-0">
        <Sparkles className="w-4 h-4 text-emerald-400" />
        <span className="font-semibold text-white">Parcours Interactifs d'Évaluation :</span>
        <span className="hidden sm:inline text-slate-400">Cliquez pour tester les 8 scénarios clés du brief</span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none py-0.5">
        {PARCOURS_DEFINITIONS.map((p) => {
          const isSelected = activeParcours === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelectParcours(p.id, p.tab, p.date, p.category, p.alertId)}
              title={p.description}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-all text-[11px] whitespace-nowrap cursor-pointer border ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700/80'
              }`}
            >
              <span className="font-bold">{p.id}</span>
              <span className="text-slate-400">·</span>
              <span>{p.tag}</span>
            </button>
          );
        })}

        <button
          onClick={onCloseParcoursBar}
          title="Fermer la barre de parcours"
          className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
