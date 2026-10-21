import React, { useState } from 'react';
import { 
  Shirt, 
  PackageCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Edit3, 
  ShieldCheck, 
  X, 
  Save, 
  Clock,
  User,
  Check,
  Building2,
  Globe,
  Layers
} from 'lucide-react';
import { ShirtInventoryItem, ShirtSize, Registration } from '../../types';
import { formatCPF } from '../../lib/masks';
import { storageService } from '../../services/storage';

interface AdminShirtsAndKitsProps {
  shirts: ShirtInventoryItem[];
  registrations: Registration[];
  onUpdateStock: (size: ShirtSize, newStock: number) => Promise<void>;
  onDeliverKit: (registrationId: string, deliveredBy: string, notes?: string) => Promise<void>;
  onRefresh: () => void;
}

export const AdminShirtsAndKits: React.FC<AdminShirtsAndKitsProps> = ({
  shirts,
  registrations,
  onUpdateStock,
  onDeliverKit,
  onRefresh,
}) => {
  // Active Stock Tab: 'local' | 'visitor' | 'total'
  const [stockView, setStockView] = useState<'local' | 'visitor' | 'total'>('local');

  // Stock edit state
  const [editingSize, setEditingSize] = useState<ShirtSize | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);
  const [stockError, setStockError] = useState<string | null>(null);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  // Kit delivery station state
  const [kitSearch, setKitSearch] = useState('');
  const [selectedAthleteForKit, setSelectedAthleteForKit] = useState<Registration | null>(null);
  const [operatorName, setOperatorName] = useState('Comissão Organizadora - Mesa 1');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false);
  const [deliveryMessage, setDeliveryMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filtered registrations for delivery station
  const searchResults = React.useMemo(() => {
    if (!kitSearch.trim()) return [];
    const term = kitSearch.trim().toLowerCase();
    const cleanCpf = term.replace(/\D/g, '');

    return registrations.filter((reg) => {
      const matchProtocol = reg.protocol.toLowerCase().includes(term);
      const matchName = reg.athlete?.fullName.toLowerCase().includes(term);
      const matchCpf = cleanCpf.length > 2 && reg.athlete?.cpf.includes(cleanCpf);
      return matchProtocol || matchName || matchCpf;
    });
  }, [registrations, kitSearch]);

  const handleStartEditStock = (item: ShirtInventoryItem) => {
    setEditingSize(item.size);
    if (stockView === 'local') {
      setNewStockValue(item.localTotalStock ?? Math.round(item.totalStock / 2));
    } else if (stockView === 'visitor') {
      setNewStockValue(item.visitorTotalStock ?? Math.round(item.totalStock / 2));
    } else {
      setNewStockValue(item.totalStock);
    }
    setStockError(null);
  };

  const handleSaveStock = async (size: ShirtSize) => {
    const item = shirts.find((s) => s.size === size);
    if (!item) return;

    try {
      setIsUpdatingStock(true);
      if (stockView === 'local') {
        const minAllowed = (item.localReservedCount ?? 0) + (item.localConfirmedCount ?? 0);
        if (newStockValue < minAllowed) {
          setStockError(`O estoque Local não pode ser menor que ${minAllowed} (já existem ${item.localConfirmedCount ?? 0} confirmadas e ${item.localReservedCount ?? 0} reservadas).`);
          return;
        }
        await storageService.updateLocalShirtStock(size, newStockValue);
      } else if (stockView === 'visitor') {
        const minAllowed = (item.visitorReservedCount ?? 0) + (item.visitorConfirmedCount ?? 0);
        if (newStockValue < minAllowed) {
          setStockError(`O estoque Visitante não pode ser menor que ${minAllowed} (já existem ${item.visitorConfirmedCount ?? 0} confirmadas e ${item.visitorReservedCount ?? 0} reservadas).`);
          return;
        }
        await storageService.updateVisitorShirtStock(size, newStockValue);
      } else {
        const minAllowed = item.reservedCount + item.confirmedCount;
        if (newStockValue < minAllowed) {
          setStockError(`O estoque Total não pode ser menor que ${minAllowed} (já existem ${item.confirmedCount} confirmadas e ${item.reservedCount} reservadas).`);
          return;
        }
        await onUpdateStock(size, newStockValue);
      }

      setEditingSize(null);
      setStockError(null);
      onRefresh();
    } catch (e: any) {
      setStockError(e.message || 'Erro ao atualizar estoque.');
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const handleConfirmDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAthleteForKit) return;

    if (selectedAthleteForKit.status !== 'CONFIRMED') {
      setDeliveryMessage({
        type: 'error',
        text: 'Não é possível entregar o kit. A inscrição deve estar CONFIRMADA (paga).',
      });
      return;
    }

    if (selectedAthleteForKit.kitDelivered) {
      setDeliveryMessage({
        type: 'error',
        text: `Kit já entregue em ${selectedAthleteForKit.kitDeliveredAt} por ${selectedAthleteForKit.kitDeliveredBy}. Entrega duplicada bloqueada!`,
      });
      return;
    }

    try {
      setIsSubmittingDelivery(true);
      await onDeliverKit(selectedAthleteForKit.id, operatorName, deliveryNotes);
      setDeliveryMessage({
        type: 'success',
        text: `Kit de ${selectedAthleteForKit.athlete?.fullName} (Tamanho ${selectedAthleteForKit.shirtSize}) entregue com sucesso!`,
      });
      setSelectedAthleteForKit(null);
      setKitSearch('');
      setDeliveryNotes('');
      onRefresh();
    } catch (e: any) {
      setDeliveryMessage({ type: 'error', text: e.message || 'Erro ao registrar entrega.' });
    } finally {
      setIsSubmittingDelivery(false);
    }
  };

  // Recent deliveries list
  const recentDeliveries = registrations
    .filter((r) => r.kitDelivered)
    .sort((a, b) => new Date(b.kitDeliveredAt || '').getTime() - new Date(a.kitDeliveredAt || '').getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* SECTION 1: Shirt Inventory Management (Local vs Visitante) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Shirt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight">
                  Gestão do Estoque de Camisas
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700">
                  Grade Oficial
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Controle individual de cotas para atletas Locais (Lajes Pintadas) e Visitantes, garantindo que inscrições online não esgotem as vagas da cidade.
              </p>
            </div>
          </div>

          {/* Sub-Tabs: Local vs Visitante vs Consolidado */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0">
            <button
              onClick={() => { setStockView('local'); setEditingSize(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                stockView === 'local'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Estoque Local</span>
            </button>

            <button
              onClick={() => { setStockView('visitor'); setEditingSize(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                stockView === 'visitor'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Estoque Visitantes</span>
            </button>

            <button
              onClick={() => { setStockView('total'); setEditingSize(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                stockView === 'total'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Consolidado</span>
            </button>
          </div>
        </div>

        {/* View Description Callout */}
        <div className={`p-3 rounded-2xl border text-xs font-medium flex items-center justify-between ${
          stockView === 'local'
            ? 'bg-orange-50/70 border-orange-200 text-orange-800'
            : stockView === 'visitor'
            ? 'bg-blue-50/70 border-blue-200 text-blue-800'
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center gap-2">
            {stockView === 'local' ? (
              <Building2 className="w-4 h-4 text-orange-600 shrink-0" />
            ) : stockView === 'visitor' ? (
              <Globe className="w-4 h-4 text-blue-600 shrink-0" />
            ) : (
              <Layers className="w-4 h-4 text-slate-600 shrink-0" />
            )}
            <span>
              {stockView === 'local' && 'Visualizando cota exclusiva para moradores de Lajes Pintadas (inscrição presencial na Prefeitura).'}
              {stockView === 'visitor' && 'Visualizando cota pública para atletas visitantes de outros municípios (inscrição online via site).'}
              {stockView === 'total' && 'Visualizando capacidade somada do evento (Locais + Visitantes).'}
            </span>
          </div>

          <span className="text-[11px] font-bold">
            Clique em "Editar Cota" para ajustar o estoque
          </span>
        </div>

        {stockError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{stockError}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tamanho</th>
                <th className="py-3 px-4">
                  {stockView === 'local' ? 'Cota Local' : stockView === 'visitor' ? 'Cota Visitante' : 'Estoque Total'}
                </th>
                <th className="py-3 px-4">Confirmadas</th>
                <th className="py-3 px-4">Reservadas</th>
                <th className="py-3 px-4">Disponíveis</th>
                <th className="py-3 px-4">Situação</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shirts.map((item) => {
                const isEditing = editingSize === item.size;

                // Select metrics according to active view
                let total = item.totalStock;
                let confirmed = item.confirmedCount;
                let reserved = item.reservedCount;
                let available = item.availableStock;

                if (stockView === 'local') {
                  total = item.localTotalStock ?? Math.round(item.totalStock / 2);
                  confirmed = item.localConfirmedCount ?? 0;
                  reserved = item.localReservedCount ?? 0;
                  available = item.localAvailableStock ?? Math.max(0, total - (confirmed + reserved));
                } else if (stockView === 'visitor') {
                  total = item.visitorTotalStock ?? Math.round(item.totalStock / 2);
                  confirmed = item.visitorConfirmedCount ?? 0;
                  reserved = item.visitorReservedCount ?? 0;
                  available = item.visitorAvailableStock ?? Math.max(0, total - (confirmed + reserved));
                }

                const minAllowed = confirmed + reserved;
                const isSoldOut = available <= 0 && total > 0;
                const isLow = available <= 5 && available > 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-black text-sm text-slate-900">
                      <span className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-sm font-bold">
                        {item.size}
                      </span>
                    </td>
                    
                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={minAllowed}
                            value={newStockValue}
                            onChange={(e) => setNewStockValue(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                          <span className="text-[10px] text-slate-400">mín: {minAllowed}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-slate-800 text-sm">{total}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-emerald-600">
                      {confirmed}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-amber-600">
                      {reserved}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`font-black text-sm ${
                        isSoldOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-slate-900'
                      }`}>
                        {available}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {total === 0 ? (
                        <span className="text-slate-400 font-medium">Não configurado</span>
                      ) : isSoldOut ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                          Esgotado
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Estoque Baixo
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Disponível
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleSaveStock(item.size)}
                            disabled={isUpdatingStock}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                            title="Salvar alteração de estoque"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => { setEditingSize(null); setStockError(null); }}
                            className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition"
                            title="Cancelar edição"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEditStock(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition font-semibold"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Editar Cota</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: Kit Delivery Station */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight">
              Estação de Entrega de Kits & Camisas Oficiais
            </h3>
            <p className="text-xs text-slate-500">
              Centro de Convivência dos Idosos • Lajes Pintadas/RN. Pesquisa em tempo real com bloqueio de entregas duplicadas.
            </p>
          </div>
        </div>

        {deliveryMessage && (
          <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            deliveryMessage.type === 'success' 
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {deliveryMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{deliveryMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Search Box & Results (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Localizar Atleta para Entrega (CPF, Nome ou Protocolo)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={kitSearch}
                onChange={(e) => setKitSearch(e.target.value)}
                placeholder="Ex: 000.000.000-00, LP5-2612-..., ou Nome do Atleta"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {searchResults.length > 0 && (
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {searchResults.map((reg) => (
                  <div
                    key={reg.id}
                    onClick={() => setSelectedAthleteForKit(reg)}
                    className={`p-3 text-xs cursor-pointer transition flex items-center justify-between ${
                      selectedAthleteForKit?.id === reg.id 
                        ? 'bg-orange-50/70 border-l-4 border-orange-600' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900">{reg.athlete?.fullName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>CPF: {formatCPF(reg.athlete?.cpf || '')}</span>
                        <span>•</span>
                        <span className="font-mono text-orange-700">{reg.protocol}</span>
                        <span>•</span>
                        <span>{reg.originType === 'LOCAL' || reg.originType === 'CASA' ? 'Local' : 'Visitante'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                        {reg.shirtSize}
                      </span>
                      {reg.kitDelivered ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          Entregue
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Pendente
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delivery Form (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Formulário de Baixa e Entrega
            </h4>

            {selectedAthleteForKit ? (
              <form onSubmit={handleConfirmDelivery} className="space-y-3">
                <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="text-[11px] text-slate-500 uppercase">Atleta Selecionado:</div>
                  <div className="font-bold text-slate-900 text-sm">
                    {selectedAthleteForKit.athlete?.fullName}
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Tamanho da Camisa: <strong className="text-orange-600 font-black">{selectedAthleteForKit.shirtSize}</strong>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Status: <strong className={selectedAthleteForKit.status === 'CONFIRMED' ? 'text-emerald-600' : 'text-red-600'}>
                      {selectedAthleteForKit.status === 'CONFIRMED' ? 'Paga / Confirmada' : selectedAthleteForKit.status}
                    </strong>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Operador / Atendente Responsável
                  </label>
                  <input
                    type="text"
                    required
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Observações de Entrega (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Ex: Apresentou CNH original e comprovante de inscrição."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingDelivery || selectedAthleteForKit.status !== 'CONFIRMED' || selectedAthleteForKit.kitDelivered}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>{isSubmittingDelivery ? 'Registrando...' : 'Confirmar Entrega do Kit'}</span>
                </button>
              </form>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Pesquise e selecione um atleta na coluna ao lado para registrar a entrega do kit.
              </div>
            )}
          </div>
        </div>

        {/* Recent Deliveries */}
        {recentDeliveries.length > 0 && (
          <div className="pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Últimas Entregas Realizadas
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {recentDeliveries.map((d) => (
                <div key={d.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 truncate max-w-[160px]">{d.athlete?.fullName}</div>
                    <div className="text-[10px] text-slate-500">Tam: {d.shirtSize} • {d.kitDeliveredBy}</div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
