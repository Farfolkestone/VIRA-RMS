import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  ArrowRight,
  ShieldCheck,
  Clock,
  Layers,
  Database,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { buildCompleteHotelDataset } from '../data/mockHotelData';
import { queryCopilot } from '../logic/copilotEngine';
import { CopilotQAResponse, RoomCategoryCode } from '../types/hotel';
import { ActiveTab } from './Header';

interface CopilotViewProps {
  dataset: ReturnType<typeof buildCompleteHotelDataset>;
  onNavigate: (tab: ActiveTab, date?: string, category?: RoomCategoryCode, alertId?: string) => void;
}

const PRESET_QUESTIONS = [
  "Quelles dates présentent un risque de surbooking ?",
  "Quelles chambres sont libres dans TOPSYS mais non disponibles à la vente ?",
  "Quels plans VIP sont encore ouverts alors que notre stratégie demande leur fermeture ?",
  "Quels tarifs présentent un écart supérieur à 1 € ?",
  "Quelle est l'évolution du RACK RO FLEX ?",
  "Quelles réservations ont été annulées depuis la dernière collecte complète ?",
  "Quelles dates des 30 prochains jours ont un faible taux d'occupation ?",
  "Quelles actions me recommandes-tu pour demain ?",
  "Pourquoi cette alerte de disponibilité a-t-elle été déclenchée ?",
  "Prépare les changements recommandés, sans les appliquer.",
];

export const CopilotView: React.FC<CopilotViewProps> = ({ dataset, onNavigate }) => {
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text?: string; response?: CopilotQAResponse }[]
  >([
    {
      role: 'assistant',
      response: queryCopilot('Quelles dates présentent un risque de surbooking ?', dataset),
    },
  ]);

  const handleSend = (queryText: string) => {
    if (!queryText.trim()) return;
    const response = queryCopilot(queryText, dataset);
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: queryText },
      { role: 'assistant', response },
    ]);
    setInputQuery('');
  };

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto text-slate-100 flex flex-col h-[calc(100vh-110px)]">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 shadow-sm flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white">Copilot Hôtelier Décisionnel</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                Moteur Analytique Déterministe
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interrogez en langage naturel les données unifiées TOPSYS, D-Edge et les algorithmes RMS.
            </p>
          </div>
        </div>

        <div className="text-right text-[11px] text-slate-400 font-mono hidden sm:block">
          <div>Données analysées : 93 jours</div>
          <div className="text-emerald-400">Calculs 100% locaux</div>
        </div>
      </div>

      {/* Preset Questions Chips Carousel */}
      <div className="shrink-0 space-y-1.5">
        <div className="text-[11px] text-slate-400 font-medium">Questions métier fréquentes :</div>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {PRESET_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500 text-slate-300 hover:text-white text-xs whitespace-nowrap transition-all cursor-pointer shadow-sm text-left"
            >
              <span>{q}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {messages.map((msg, i) => {
          if (msg.role === 'user') {
            return (
              <div key={i} className="flex justify-end">
                <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 max-w-xl text-xs font-medium shadow">
                  {msg.text}
                </div>
              </div>
            );
          }

          const resp = msg.response!;
          return (
            <div key={i} className="flex justify-start">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-4 max-w-2xl text-xs space-y-3 shadow-lg">
                {/* Header & Confidence Bar */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white text-xs">Synthèse Décisionnelle RMS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Score de Confiance :</span>
                    <span className="font-mono font-bold text-emerald-400">{resp.confidence}%</span>
                  </div>
                </div>

                {/* Synthesis summary */}
                <p className="text-slate-200 text-xs leading-relaxed font-medium">
                  {resp.summary}
                </p>

                {/* Metrics Grid */}
                {resp.metrics.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                    {resp.metrics.map((m, idx) => (
                      <div key={idx} className="p-1.5">
                        <div className="text-[10px] text-slate-400 truncate">{m.label}</div>
                        <div className="text-xs font-bold text-white font-mono mt-0.5">{m.value}</div>
                        {m.hint && <div className="text-[9px] text-red-400 font-semibold">{m.hint}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Sources & Lineage */}
                <div className="space-y-1 text-[11px] text-slate-400 pt-1">
                  <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-blue-400" />
                    <span>Sources & Horodatages d'Observation :</span>
                  </div>
                  <div className="space-y-0.5 pl-5">
                    {resp.sources.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-300">• {s.name}</span>
                        <span className="font-mono text-slate-500">{s.timestamp} ({s.reliability})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Limitations */}
                {resp.limitations && (
                  <div className="p-2 bg-slate-950 rounded border border-slate-800/60 text-[10.5px] text-slate-400">
                    <strong className="text-slate-300">Limites opérationnelles : </strong>
                    <span>{resp.limitations}</span>
                  </div>
                )}

                {/* Recommendation & Navigation button */}
                <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-[11px] text-emerald-300 font-semibold">
                    {resp.recommendation && `Préconisation : ${resp.recommendation}`}
                  </div>

                  {resp.targetView && (
                    <button
                      onClick={() =>
                        onNavigate(
                          resp.targetView!,
                          resp.targetDate,
                          resp.targetCategory,
                          resp.targetAlertId
                        )
                      }
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs shadow transition-colors cursor-pointer self-start sm:self-auto whitespace-nowrap"
                    >
                      <span>Ouvrir l'observation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input query bar */}
      <div className="shrink-0 bg-slate-900 border border-slate-800 p-2 rounded-lg flex items-center gap-2 shadow-lg">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(inputQuery)}
          placeholder="Posez une question sur le stock, les tarifs, le surbooking..."
          className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          onClick={() => handleSend(inputQuery)}
          disabled={!inputQuery.trim()}
          className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded font-bold transition-colors cursor-pointer"
          title="Envoyer la question"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
