import React, { useState } from 'react';
import {
  Zap,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldAlert,
  FileText,
  Lock,
} from 'lucide-react';
import { PreparedAction } from '../types/hotel';
import { buildCompleteHotelDataset } from '../data/mockHotelData';

interface ActionsCenterViewProps {
  dataset: ReturnType<typeof buildCompleteHotelDataset>;
  initialDate?: string;
}

export const ActionsCenterView: React.FC<ActionsCenterViewProps> = ({ dataset, initialDate }) => {
  const [actions, setActions] = useState<PreparedAction[]>(dataset.actions);
  const [auditLog, setAuditLog] = useState<{ id: string; text: string; timestamp: string }[]>([
    {
      id: 'LOG-001',
      text: 'Ordonnanceur RMS initialisé en mode bac à sable (Sandbox). Écritures externes verrouillées.',
      timestamp: '2026-11-02 07:00:00 CET',
    },
  ]);

  const handleValidateSimulation = (actionId: string) => {
    const action = actions.find((a) => a.id === actionId);
    if (!action) return;

    setActions((prev) =>
      prev.map((a) =>
        a.id === actionId
          ? {
              ...a,
              status: 'VALIDE_SIMULE',
              executedAt: new Date().toLocaleTimeString('fr-FR') + ' CET',
            }
          : a
      )
    );

    setAuditLog((prev) => [
      {
        id: `LOG-${Date.now()}`,
        text: `Validation humaine simulée pour l'action ${actionId} (${action.category} au ${action.date}) : Passage de ${action.observedValue} à ${action.proposedValue}. (Aucune écriture réelle)`,
        timestamp: new Date().toLocaleTimeString('fr-FR') + ' CET',
      },
      ...prev,
    ]);
  };

  const handleReject = (actionId: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === actionId ? { ...a, status: 'REJETE' } : a))
    );
    setAuditLog((prev) => [
      {
        id: `LOG-${Date.now()}`,
        text: `Action ${actionId} rejetée par le Revenue Manager.`,
        timestamp: new Date().toLocaleTimeString('fr-FR') + ' CET',
      },
      ...prev,
    ]);
  };

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto text-slate-100">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              CENTRE D'ACTIONS & AUTOMATISATION
            </span>
            <span className="text-xs text-slate-400">Workflow de Sécurité en 4 États</span>
          </div>
          <h1 className="text-lg font-bold text-white mt-1">
            File d'Attente des Décisions & Actions Préparées
          </h1>
          <p className="text-xs text-slate-400">
            Distingue rigoureusement : 1. Observation → 2. Recommandation → 3. Action préparée → 4. Action validée (Simulation).
          </p>
        </div>

        {/* Sandbox Disclaimer Box */}
        <div className="bg-amber-950/40 border border-amber-700/60 p-2.5 rounded text-amber-300 text-xs flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <strong className="block text-white font-semibold">Mode Simulation Uniquement</strong>
            <span>Aucune modification réelle n'est envoyée aux APIs D-Edge ou TOPSYS.</span>
          </div>
        </div>
      </div>

      {/* 4 States Explanatory Pipeline */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px]">1</span>
          <div>
            <strong className="text-white block">1. Observation</strong>
            <span className="text-slate-400 text-[10px]">Collecte D-Edge / TOPSYS</span>
          </div>
        </div>

        <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-900 text-blue-200 flex items-center justify-center font-bold text-[10px]">2</span>
          <div>
            <strong className="text-blue-300 block">2. Recommandation</strong>
            <span className="text-slate-400 text-[10px]">Calcul règles métier RMS</span>
          </div>
        </div>

        <div className="p-2.5 rounded bg-slate-900 border border-amber-800/60 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-amber-900 text-amber-200 flex items-center justify-center font-bold text-[10px]">3</span>
          <div>
            <strong className="text-amber-300 block">3. Action Préparée</strong>
            <span className="text-slate-400 text-[10px]">Contrôle différentiel & Risques</span>
          </div>
        </div>

        <div className="p-2.5 rounded bg-slate-900 border border-emerald-800/60 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-emerald-900 text-emerald-200 flex items-center justify-center font-bold text-[10px]">4</span>
          <div>
            <strong className="text-emerald-300 block">4. Exécution Simulée</strong>
            <span className="text-slate-400 text-[10px]">Audit trail & sandbox vérifiée</span>
          </div>
        </div>
      </div>

      {/* Actions List */}
      <div className="space-y-3">
        {actions.map((act) => {
          const isDone = act.status === 'VALIDE_SIMULE';
          const isRejected = act.status === 'REJETE';

          return (
            <div
              key={act.id}
              className={`bg-slate-900 border rounded-lg p-4 space-y-3 transition-colors ${
                isDone
                  ? 'border-emerald-800/80 bg-emerald-950/10'
                  : isRejected
                  ? 'border-slate-800 opacity-60'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-900 text-blue-200">
                    {act.id}
                  </span>
                  <span className="font-mono text-xs font-bold text-white">{act.date}</span>
                  <span className="text-xs font-semibold text-slate-300">[{act.category}]</span>
                  <span className="text-xs text-slate-400">· Type : <strong className="text-white">{act.actionType}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      act.riskLevel === 'ELEVE'
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : act.riskLevel === 'MOYEN'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}
                  >
                    Risque : {act.riskLevel}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isDone
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : isRejected
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {act.status}
                  </span>
                </div>
              </div>

              {/* Before / After Diff Visualizer */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950 p-3 rounded border border-slate-800/80 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">1. Valeur Observée Actuelle</div>
                  <div className="text-sm font-bold text-slate-300 mt-0.5">{act.observedValue}</div>
                  <div className="text-[10px] text-slate-500">Source D-Edge (Frais)</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase">2. Valeur Souhaitée RMS</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">{act.proposedValue}</div>
                  <div className="text-[10px] text-slate-500">Variation : {act.delta}</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase">3. Règle Justificative</div>
                  <div className="text-[11px] text-slate-200 mt-0.5 truncate" title={act.justifyingRule}>
                    {act.justifyingRule}
                  </div>
                  <div className="text-[10px] text-indigo-400">Autorisation : {act.authorizationLevel}</div>
                </div>
              </div>

              {/* Bottom Actions Buttons */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[11px] text-slate-400">
                  {isDone && (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approuvée et exécutée en sandbox à {act.executedAt}
                    </span>
                  )}
                  {isRejected && <span className="text-slate-500">Action annulée</span>}
                </span>

                {!isDone && !isRejected && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReject(act.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors"
                    >
                      Rejeter
                    </button>
                    <button
                      onClick={() => handleValidateSimulation(act.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold shadow transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Valider l'action (Simulation - Parcours G)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Audit Log Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2 text-xs">
        <h3 className="font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <span>Journal d'Audit des Actions Simulées</span>
        </h3>
        <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80 font-mono text-[11px] text-slate-300 space-y-1 max-h-36 overflow-y-auto">
          {auditLog.map((log) => (
            <div key={log.id} className="flex items-start gap-2">
              <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
              <span>{log.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
