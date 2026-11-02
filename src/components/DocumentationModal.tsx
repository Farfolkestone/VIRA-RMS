import React from 'react';
import { X, BookOpen, Layers, CheckCircle2, ShieldAlert, Cpu, Database, Sparkles } from 'lucide-react';

interface DocumentationModalProps {
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Documentation Technique & Architecture UX/UI</h2>
              <p className="text-[11px] text-slate-400">Prototype VIGIE RMS — Grand Challenge Concours</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs leading-relaxed">
          {/* Section 1: Concept UX */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-blue-900 text-blue-200 flex items-center justify-center text-xs">1</span>
              <span>Concept UX Retenu : Poste de Travail Analytique & d'Arbitrage</span>
            </h3>
            <p className="text-slate-300">
              Au lieu d'un dashboard marketing générique ou de fenêtres éclatées (VIGIE PLUS, VARA PLUS et RMS dans des onglets séparés), nous avons conçu une interface unifiée à forte densité d'information, spécialement dimensionnée pour un écran desktop de 1440px sous Windows. L'ergonomie met l'accent sur la <strong>navigation multidate (93 jours)</strong>, la <strong>visibilité immédiate des écarts d'inventaire</strong>, et un <strong>inspecteur contextuel slide-over</strong> qui permet d'auditer n'importe quelle cellule sans jamais perdre la vue d'ensemble du planning.
            </p>
          </div>

          {/* Section 2: Organisation des Modules */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-blue-900 text-blue-200 flex items-center justify-center text-xs">2</span>
              <span>Organisation des Modules & Responsabilités</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                <strong className="text-emerald-400 block font-semibold">VIGIE PLUS (TOPSYS PMS v2.4)</strong>
                <p className="text-slate-400">
                  Responsable unique des observations de l'inventaire physique (45 chambres, 7 catégories, réservations confirmées, chambres attribuées, déduction stricte des réservations fictives, contraintes DCAD 2 unités).
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                <strong className="text-blue-400 block font-semibold">VARA PLUS (D-Edge v0.3.50)</strong>
                <p className="text-slate-400">
                  Responsable unique des observations commerciales Channel Manager (8 produits, grille tarifaire pivot RACK RO FLEX ID 4685, statuts de vente, ordonnancement des scrapes SQLite jusqu'à 93 jours).
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                <strong className="text-indigo-300 block font-semibold">Moteur RMS (Arbitrage & Règles)</strong>
                <p className="text-slate-400">
                  Rapprochement sans fusion naïve : calcul des deltas, détection stricte du surbooking, sous-commercialisation, conformité tarifaire (|Δ| &gt; 1€), et blocage automatique en cas d'obsolescence (&gt; 18h).
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                <strong className="text-purple-300 block font-semibold">Copilot & Centre d'Actions (Simulation)</strong>
                <p className="text-slate-400">
                  Assistant conversationnel déterministe avec calculs en direct, justification par les sources, scores de confiance, et workflow en 4 étapes avec bac à sable sécurisé sans écriture réelle.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Composants & Interactions */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-blue-900 text-blue-200 flex items-center justify-center text-xs">3</span>
              <span>Composants Principaux & Parcours Interactifs Réalisés</span>
            </h3>
            <ul className="space-y-1.5 list-disc pl-5 text-slate-300 text-[11px]">
              <li><strong>Cockpit Unifié :</strong> Répond aux 10 questions critiques avec cartes cliquables et aperçu 14 jours.</li>
              <li><strong>Planning 93 Jours :</strong> Grille multidate avec 4 modes de lecture (Disponibilités, Tarifs, Commercial, Alertes) et sélection d'horizons 7j, 14j, 31j, 93j.</li>
              <li><strong>Inspecteur Contextuel (CellInspector) :</strong> Panneau latéral slide-over affichant l'exact comparatif TOPSYS vs D-Edge avec horodatages réels, règle appliquée et bouton d'action.</li>
              <li><strong>Vérification Tarifaire & RACK RO FLEX :</strong> Courbe 93j, formule validée, tolérance 1€, et respect rigoureux des centimes d'origine.</li>
              <li><strong>Matrice Ouvertures / Fermetures :</strong> Modes de recherche "Au moins 1 jour", "Tous les jours", "Changement".</li>
              <li><strong>Simulateur de Stratégies :</strong> Sliders interactifs (seuil chambres libres, horizon) et déclencheur en direct.</li>
              <li><strong>Parcours Démo A à H :</strong> Barre de lancement en 1 clic pour tester immédiatement chaque exigence du concours.</li>
            </ul>
          </div>

          {/* Section 4: Réutilisabilité dans la stack cible */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-blue-900 text-blue-200 flex items-center justify-center text-xs">4</span>
              <span>Éléments Réutilisables pour l'Environnement Python / SQLite</span>
            </h3>
            <div className="bg-slate-950 p-3 rounded border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
              <p>
                • <strong>Moteur de calcul découplé (<code className="text-emerald-400">src/logic/rmsEngine.ts</code>) :</strong> Fonctions pures testées par tests unitaires Node. Facilement transcriptibles en modules Python (fonctions <code className="text-slate-400">reconcile_stocks()</code>, <code className="text-slate-400">calculate_expected_rate()</code>).
              </p>
              <p>
                • <strong>Contrats d'échange JSON :</strong> Modèle de données strict (<code className="text-slate-400">DayCategoryTOPSYS</code>, <code className="text-slate-400">DayCategoryDEdge</code>) prêt pour des endpoints REST FastAPI/Flask locaux interrogeant les bases SQLite séparées.
              </p>
              <p>
                • <strong>Architecture composable :</strong> Séparation nette entre données brutes observées, données dérivées calculées, et recommandations proposées.
              </p>
            </div>
          </div>

          {/* Section 5: Limites du Prototype */}
          <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg text-amber-200 space-y-1">
            <h4 className="font-bold flex items-center gap-1.5 text-xs text-amber-300">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Limites du Prototype & Mention Légale Obligatoire</span>
            </h4>
            <p className="text-[11px] leading-relaxed">
              Ce livrable est un prototype haute fidélité d'aide à la conception UX/UI. <strong>Toutes les données sont simulées</strong> (aucun appel direct aux serveurs D-Edge ni à TOPSYS). Les validations d'actions s'exécutent en mode sandbox local et n'effectuent aucune écriture externe.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono">VIGIE RMS v1.0 Prototype</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-colors"
          >
            Fermer la documentation
          </button>
        </div>
      </div>
    </div>
  );
};
