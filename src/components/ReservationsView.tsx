import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  Calendar,
  Layers,
} from 'lucide-react';
import { ReservationRecord, RoomCategoryCode } from '../types/hotel';
import { buildCompleteHotelDataset } from '../data/mockHotelData';

interface ReservationsViewProps {
  dataset: ReturnType<typeof buildCompleteHotelDataset>;
}

export const ReservationsView: React.FC<ReservationsViewProps> = ({ dataset }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [reconciliationFilter, setReconciliationFilter] = useState<string>('ALL');

  const reservations = dataset.reservations;

  const filteredReservations = reservations.filter((res) => {
    if (channelFilter !== 'ALL' && res.channel !== channelFilter) return false;
    if (statusFilter !== 'ALL' && res.status !== statusFilter) return false;
    if (reconciliationFilter !== 'ALL' && res.reconciliationStatus !== reconciliationFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        res.guestName.toLowerCase().includes(q) ||
        res.id.toLowerCase().includes(q) ||
        (res.pmsCode && res.pmsCode.toLowerCase().includes(q)) ||
        (res.dedgeCode && res.dedgeCode.toLowerCase().includes(q)) ||
        res.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Pick-up summary metrics by channel
  const channelTotals = [
    { channel: 'Booking.com', count: 18, share: '38%', adr: '168.50 €' },
    { channel: 'Direct / Téléphone', count: 12, share: '25%', adr: '210.00 €' },
    { channel: 'Site Web Officiel', count: 8, share: '17%', adr: '185.00 €' },
    { channel: 'Expedia Partner', count: 5, share: '11%', adr: '162.00 €' },
    { channel: 'VIP Corporate', count: 4, share: '9%', adr: '195.00 €' },
  ];

  const getReconciliationBadge = (status: ReservationRecord['reconciliationStatus']) => {
    switch (status) {
      case 'CONFIRME':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Confirmé (100%)
          </span>
        );
      case 'PROBABLE_A_VERIFIER':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-amber-400" />
            Probable à vérifier
          </span>
        );
      case 'DONNEE_MANQUANTE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-400" />
            Manquante flux D-Edge
          </span>
        );
      case 'IMPOSSIBLE':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800 flex items-center gap-1">
            <XCircle className="w-3 h-3 text-red-400" />
            Impossible
          </span>
        );
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto text-slate-100">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-900 text-blue-200">
              RÉCONCILIATION RÉSERVATIONS & PICK-UP
            </span>
            <span className="text-xs text-slate-400">Rapprochement TOPSYS ↔ D-Edge</span>
          </div>
          <h1 className="text-lg font-bold text-white mt-1">
            Traçabilité des Dossiers de Réservation et Rythme de Vente
          </h1>
          <p className="text-xs text-slate-400">
            Distingue un rapprochement confirmé d'un rapprochement probable, et isole les réservations fictives ou annulées.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs flex-wrap">
          <div className="bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
            <span className="text-slate-400">Arrivées auj. :</span>
            <span className="font-mono text-emerald-400 font-bold ml-1">4 dossiers</span>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
            <span className="text-slate-400">Départs auj. :</span>
            <span className="font-mono text-blue-400 font-bold ml-1">2 dossiers</span>
          </div>
        </div>
      </div>

      {/* Pick-up by Channel KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {channelTotals.map((ch) => (
          <div key={ch.channel} className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
            <div className="text-[11px] text-slate-400 truncate">{ch.channel}</div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-bold text-white font-mono">{ch.count} résas</span>
              <span className="text-xs font-mono text-blue-400">{ch.share}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">ADR moyen : {ch.adr}</div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <label className="text-slate-400 font-medium">Canal :</label>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="bg-slate-800 text-white border border-slate-700 rounded px-2.5 py-1 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Tous canaux</option>
              <option value="Booking.com">Booking.com</option>
              <option value="Direct">Direct / Téléphone</option>
              <option value="Site Web">Site Web</option>
              <option value="Expedia">Expedia</option>
              <option value="VIP Corporate">VIP Corporate</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-slate-400 font-medium">Statut :</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 text-white border border-slate-700 rounded px-2.5 py-1 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Tous statuts</option>
              <option value="CONFIRMED">Confirmée</option>
              <option value="CANCELLED">Annulée (Explicite)</option>
              <option value="MODIFIED">Modifiée</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-slate-400 font-medium">Rapprochement :</label>
            <select
              value={reconciliationFilter}
              onChange={(e) => setReconciliationFilter(e.target.value)}
              className="bg-slate-800 text-white border border-slate-700 rounded px-2.5 py-1 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Tous états</option>
              <option value="CONFIRME">Confirmé</option>
              <option value="PROBABLE_A_VERIFIER">Probable à vérifier</option>
              <option value="DONNEE_MANQUANTE">Donnée manquante</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Rechercher nom, n° dossier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded pl-8 pr-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-56"
          />
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] uppercase">
                <th className="p-3">Client / Dossier</th>
                <th className="p-3">Arrivée → Départ</th>
                <th className="p-3">Catégorie / Ch.</th>
                <th className="p-3">Canal & Plan</th>
                <th className="p-3 text-right">Montant / ADR</th>
                <th className="p-3 text-center">Statut Résa</th>
                <th className="p-3">Rapprochement PMS/D-Edge</th>
                <th className="p-3">Notes & Remarques</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredReservations.map((res) => {
                const isCancelled = res.status === 'CANCELLED';
                const isFictitious = res.guestName.includes('FICTIVE');

                return (
                  <tr
                    key={res.id}
                    className={`hover:bg-slate-850/50 transition-colors ${
                      isCancelled ? 'bg-red-950/20 opacity-80' : isFictitious ? 'bg-amber-950/20' : ''
                    }`}
                  >
                    <td className="p-3">
                      <div className="font-semibold text-white">{res.guestName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {res.id} · PMS: {res.pmsCode ?? '—'} · D-Edge: {res.dedgeCode ?? '—'}
                      </div>
                    </td>

                    <td className="p-3 font-mono">
                      <div className="text-slate-200">
                        {res.checkIn} → {res.checkOut}
                      </div>
                      <div className="text-[10px] text-slate-400">{res.nights} nuits</div>
                    </td>

                    <td className="p-3">
                      <div className="font-mono font-bold text-blue-400">{res.category}</div>
                      <div className="text-[10px] text-slate-400">
                        {res.roomNumber ? `Chambre ${res.roomNumber}` : <span className="text-amber-400">Non attribuée</span>}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="text-slate-200 font-medium">{res.channel}</div>
                      <div className="text-[10px] font-mono text-slate-400">{res.ratePlanCode}</div>
                    </td>

                    <td className="p-3 text-right font-mono">
                      <div className="font-bold text-white">{res.totalAmount.toFixed(2)} €</div>
                      <div className="text-[10px] text-slate-400">ADR : {res.adr.toFixed(2)} €</div>
                    </td>

                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isCancelled
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {res.status}
                      </span>
                    </td>

                    <td className="p-3">
                      {getReconciliationBadge(res.reconciliationStatus)}
                    </td>

                    <td className="p-3 text-[11px] text-slate-400 max-w-xs">
                      {res.notes ?? '—'}
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
