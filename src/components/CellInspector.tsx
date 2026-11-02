import React from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Clock,
  ArrowRight,
  Zap,
  Info,
  CheckCircle2,
  FileText,
  TrendingDown,
  Database,
  Lock,
} from 'lucide-react';
import {
  RoomCategoryCode,
  ROOM_CATEGORIES,
  DayCategoryTOPSYS,
  DayCategoryDEdge,
  RMSReconciliation,
  HotelAlert,
} from '../types/hotel';

interface CellInspectorProps {
  date: string;
  category: RoomCategoryCode;
  topsys: DayCategoryTOPSYS;
  dedge: DayCategoryDEdge | null;
  reconciliation: RMSReconciliation;
  alerts: HotelAlert[];
  onClose: () => void;
  onPrepareAction: (actionData: {
    date: string;
    category: RoomCategoryCode;
    proposedStock: number;
    actionType: 'MODIFIER_STOCK' | 'OUVRIR_PLAN' | 'FERMER_PLAN';
    justifyingRule: string;
  }) => void;
}

export const CellInspector: React.FC<CellInspectorProps> = ({
  date,
  category,
  topsys,
  dedge,
  reconciliation,
  alerts,
  onClose,
  onPrepareAction,
}) => {
  const catConfig = ROOM_CATEGORIES[category];

  return (
    <aside className="fixed top-[125px] bottom-0 right-0 w-full sm:w-[480px] bg-slate-900 border-l border-slate-800 shadow-2xl z-30 flex flex-col text-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-900 text-blue-200 font-mono">
              {category}
            </span>
            <h2 className="text-sm font-bold text-white">{catConfig.name}</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>Date de séjour : <strong className="text-slate-200 font-mono">{date}</strong></span>
            <span>·</span>
            <span>Capacité physique : {catConfig.totalRooms} ch.</span>
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Fermer l'inspecteur"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
        {/* Status / Alert Banner if anomaly */}
        {reconciliation.isOverbookingRisk && (
          <div className="p-3 bg-red-950/80 border border-red-800 rounded-lg space-y-1.5">
            <div className="flex items-center gap-2 text-red-300 font-bold">
              <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
              <span>Risque de Surbooking Détecté (+{reconciliation.stockDelta} ch.)</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Le stock commercial publié sur D-Edge ({reconciliation.commercialPublished}) dépasse le nombre de chambres réellement libres ({reconciliation.physicalFree}).
            </p>
            <div className="pt-2">
              <button
                onClick={() =>
                  onPrepareAction({
                    date,
                    category,
                    proposedStock: reconciliation.physicalFree,
                    actionType: 'MODIFIER_STOCK',
                    justifyingRule: `R-SURBOOK: Alignement du stock D-Edge sur les ${reconciliation.physicalFree} chambres physiques admissibles`,
                  })
                }
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded shadow transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Préparer correction simulée (Stock → {reconciliation.physicalFree})</span>
              </button>
            </div>
          </div>
        )}

        {reconciliation.isUnderCommercialized && (
          <div className="p-3 bg-amber-950/80 border border-amber-800 rounded-lg space-y-1.5">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Sous-commercialisation ({reconciliation.physicalFree} ch. libres non vendues)</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              Chambres physiques libres disponibles dans TOPSYS, mais quota D-Edge fermé ou à zéro.
            </p>
            <div className="pt-2">
              <button
                onClick={() =>
                  onPrepareAction({
                    date,
                    category,
                    proposedStock: reconciliation.physicalFree,
                    actionType: 'OUVRIR_PLAN',
                    justifyingRule: `R-UNDERCOMM: Mise en vente des ${reconciliation.physicalFree} chambres physiques libres`,
                  })
                }
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded shadow transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Préparer ouverture simulée (Stock → {reconciliation.physicalFree})</span>
              </button>
            </div>
          </div>
        )}

        {topsys.isStale && (
          <div className="p-3 bg-slate-950 border border-amber-700/80 rounded-lg text-amber-300 space-y-1">
            <div className="flex items-center gap-2 font-bold text-xs">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Recommandation Suspendue (Sécurité Opérationnelle)</span>
            </div>
            <p className="text-[11px] text-slate-300">
              {reconciliation.recommendationBlockedReason}
            </p>
          </div>
        )}

        {/* Source 1: VIGIE PLUS — TOPSYS PMS */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-bold text-white">Source TOPSYS (VIGIE PLUS)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">{topsys.collectionId}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-900 p-2 rounded">
              <div className="text-slate-400">Chambres Occupées</div>
              <div className="text-sm font-bold text-white font-mono mt-0.5">{topsys.occupiedRooms} / {topsys.totalCapacity}</div>
            </div>
            <div className="bg-slate-900 p-2 rounded">
              <div className="text-slate-400">Chambres Physiques Libres</div>
              <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{topsys.freePhysicalRooms}</div>
            </div>
            <div className="bg-slate-900 p-2 rounded">
              <div className="text-slate-400">Attribuées / Non attribuées</div>
              <div className="text-xs font-semibold text-slate-200 mt-0.5">{topsys.assignedRooms} attr. / {topsys.unassignedRooms} non attr.</div>
            </div>
            <div className="bg-slate-900 p-2 rounded">
              <div className="text-slate-400">Réservations Fictives</div>
              <div className="text-xs font-semibold text-slate-200 mt-0.5">{topsys.fictitiousBookings} (déduites)</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>Collecte : {topsys.lastCollectTimestamp.replace('T', ' ').slice(0, 16)} CET</span>
            </span>
            <span className={`px-1.5 py-0.2 rounded font-mono ${topsys.isStale ? 'bg-amber-950 text-amber-300' : 'bg-emerald-950 text-emerald-300'}`}>
              {topsys.freshness}
            </span>
          </div>
        </div>

        {/* Source 2: VARA PLUS — D-EDGE CHANNEL MANAGER */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span className="font-bold text-white">Source D-Edge (VARA PLUS v0.3.50)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">{dedge?.collectionId ?? 'N/A'}</span>
          </div>

          {dedge ? (
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-900 p-2 rounded">
                <div className="text-slate-400">Stock Commercial Publié</div>
                <div className="text-sm font-bold text-white font-mono mt-0.5">{dedge.publishedStock} ch.</div>
              </div>
              <div className="bg-slate-900 p-2 rounded">
                <div className="text-slate-400">Statut Commercial</div>
                <div className="text-xs font-bold text-slate-200 mt-0.5">{dedge.status}</div>
              </div>
              <div className="bg-slate-900 p-2 rounded">
                <div className="text-slate-400">ID Produit D-Edge</div>
                <div className="text-xs font-mono text-slate-200 mt-0.5">{dedge.productId}</div>
              </div>
              <div className="bg-slate-900 p-2 rounded">
                <div className="text-slate-400">Changement d'état</div>
                <div className="text-xs font-semibold text-slate-200 mt-0.5">
                  {dedge.statusChanged ? `Oui (était ${dedge.previousStatus})` : 'Stable'}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-red-950/40 border border-red-800 rounded text-red-300 text-xs">
              Aucun produit D-Edge correspondant qualifié pour cette date.
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>Collecte : {dedge?.lastCollectTimestamp.replace('T', ' ').slice(0, 16) ?? 'N/A'} CET</span>
            </span>
            <span className="px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 font-mono">
              {dedge?.isPartial ? 'COLLECTE PARTIELLE' : 'COMPLÈTE'}
            </span>
          </div>
        </div>

        {/* Source 3: RMS Rapprochement & Traçabilité */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-indigo-900/60 space-y-2.5">
          <div className="flex items-center justify-between border-b border-indigo-900/40 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              <span className="font-bold text-indigo-200">Moteur Décisionnel RMS</span>
            </div>
            <span className="text-[10px] font-mono text-indigo-300">Score Fiabilité : {reconciliation.confidenceScore}%</span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between items-center bg-slate-900 p-2 rounded">
              <span className="text-slate-400">Écart commercial vs physique :</span>
              <span className={`font-mono font-bold ${reconciliation.stockDelta > 0 ? 'text-red-400' : reconciliation.stockDelta < 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {reconciliation.stockDelta > 0 ? `+${reconciliation.stockDelta}` : reconciliation.stockDelta} chambres
              </span>
            </div>

            <div className="bg-slate-900 p-2 rounded space-y-1">
              <div className="text-slate-400 font-medium">Recommandation Calculée :</div>
              <div className="text-slate-200 leading-relaxed font-mono text-[10.5px]">
                {reconciliation.recommendation ?? reconciliation.recommendationBlockedReason}
              </div>
            </div>

            <div className="bg-slate-900 p-2 rounded space-y-1">
              <div className="text-slate-400 font-medium">Provenance & Règles :</div>
              <div className="text-[10px] text-slate-400 space-y-0.5">
                <div>• Correspondance : Catégorie {category} ↔ Produit D-Edge {dedge?.productId ?? 'N/A'} (1:1)</div>
                <div>• Exclusion fictives : Règle R-FICTIVE active</div>
                <div>• Seuil tolérance surbooking : 0 chambre (stricte)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts list on this cell if any */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Alertes associées à cette cellule ({alerts.length})</span>
            </h3>
            {alerts.map((alt) => (
              <div key={alt.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-300">{alt.title}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{alt.priority}</span>
                </div>
                <div className="text-[11px] text-slate-400">{alt.triggerCondition}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
        <span>Fermer avec Esc ou le bouton</span>
        <button
          onClick={onClose}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded font-medium transition-colors"
        >
          Fermer
        </button>
      </div>
    </aside>
  );
};
