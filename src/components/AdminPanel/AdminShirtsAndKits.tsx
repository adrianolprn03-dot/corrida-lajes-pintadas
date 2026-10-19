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
  Check
} from 'lucide-react';
import { ShirtInventoryItem, ShirtSize, Registration } from '../../types';
import { formatCPF } from '../../lib/masks';

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
    setNewStockValue(item.totalStock);
    setStockError(null);
  };

  const handleSaveStock = async (size: ShirtSize) => {
    const item = shirts.find((s) => s.size === size);
    if (!item) return;

    const minAllowed = item.reservedCount + item.confirmedCount;
    if (newStockValue < minAllowed) {
      setStockError(`O estoque não pode ser menor que ${minAllowed} (já existem ${item.confirmedCount} confirmadas e ${item.reservedCount} reservadas).`);
      return;
    }

    try {
      setIsUpdatingStock(true);
      await onUpdateStock(size, newStockValue);
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
    <div className="space-y-8">
      {/* SECTION 1: Shirt Inventory Management */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Grade de Estoque da Camisa Oficial Laranja
              </h3>
              <p className="text-xs text-slate-500">
                A redução de estoque é estritamente bloqueada abaixo das reservas e confirmações existentes.
              </p>
            </div>
          </div>
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
                <th className="py-3 px-4">Estoque Total</th>
                <th className="py-3 px-4">Pagas (Confirmadas)</th>
                <th className="py-3 px-4">Reservadas (30 min)</th>
                <th className="py-3 px-4">Disponíveis</th>
                <th className="py-3 px-4">Situação</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shirts.map((item) => {
                const isEditing = editingSize === item.size;
                const minAllowed = item.reservedCount + item.confirmedCount;
                const isSoldOut = item.availableStock <= 0 && item.totalStock > 0;
                const isLow = item.availableStock <= 5 && item.availableStock > 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-black text-sm text-slate-900">
                      <span className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center shadow-sm">
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
                        <span className="font-bold text-slate-800 text-sm">{item.totalStock}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-600">
                      {item.confirmedCount}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-amber-600">
                      {item.reservedCount}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-black text-sm ${
                        isSoldOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-slate-900'
                      }`}>
                        {item.availableStock}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.totalStock === 0 ? (
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
                            title="Salvar"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingSize(null);
                              setStockError(null);
                            }}
                            className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition"
                            title="Cancelar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEditStock(item)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-orange-100 hover:text-orange-700 text-slate-700 rounded-lg text-xs font-bold transition inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Editar</span>
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Estação de Entrega de Kits Oficiais
            </h3>
            <p className="text-xs text-slate-500">
              Entrega da camisa oficial laranja, chip e número de peito. Bloqueio automático de entrega duplicada.
            </p>
          </div>
        </div>

        {deliveryMessage && (
          <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
            deliveryMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {deliveryMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />}
            <span>{deliveryMessage.text}</span>
          </div>
        )}

        {/* Search for Athlete */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Localizar Atleta para Entrega (Protocolo, Nome ou CPF)
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={kitSearch}
              onChange={(e) => {
                setKitSearch(e.target.value);
                setSelectedAthleteForKit(null);
                setDeliveryMessage(null);
              }}
              placeholder="Digite o número de protocolo (ex: LP5-2612-...), CPF ou nome do atleta..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
        </div>

        {/* Search Results Dropdown/Cards */}
        {kitSearch.trim() && !selectedAthleteForKit && (
          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto bg-slate-50">
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                Nenhum atleta encontrado para a busca informada.
              </div>
            ) : (
              searchResults.map((reg) => (
                <div
                  key={reg.id}
                  onClick={() => setSelectedAthleteForKit(reg)}
                  className="p-3 hover:bg-white cursor-pointer transition flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-800 text-xs">
                      {reg.athlete?.fullName}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span className="font-mono font-semibold">{reg.protocol}</span>
                      <span>•</span>
                      <span>CPF: {formatCPF(reg.athlete?.cpf || '')}</span>
                      <span>•</span>
                      <span>Camisa: {reg.shirtSize}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      reg.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {reg.status === 'CONFIRMED' ? 'Confirmada' : reg.status}
                    </span>
                    {reg.kitDelivered && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        Kit Já Entregue
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Selected Athlete Delivery Card */}
        {selectedAthleteForKit && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600">
                  {selectedAthleteForKit.protocol}
                </span>
                <h4 className="text-lg font-black text-slate-900">
                  {selectedAthleteForKit.athlete?.fullName}
                </h4>
                <p className="text-xs text-slate-500">
                  CPF: {formatCPF(selectedAthleteForKit.athlete?.cpf || '')} • {selectedAthleteForKit.athlete?.city}/{selectedAthleteForKit.athlete?.state}
                </p>
              </div>
              <button
                onClick={() => setSelectedAthleteForKit(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status alerts */}
            {selectedAthleteForKit.status !== 'CONFIRMED' ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  BLOQUEIO: Inscrição não está confirmada (Situação atual: {selectedAthleteForKit.status}). O kit só pode ser entregue após confirmação de pagamento.
                </span>
              </div>
            ) : selectedAthleteForKit.kitDelivered ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>
                  KIT JÁ ENTREGUE: Este kit foi retirado em {new Date(selectedAthleteForKit.kitDeliveredAt || '').toLocaleString('pt-BR')} por {selectedAthleteForKit.kitDeliveredBy}.
                </span>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  INSCRIÇÃO CONFIRMADA: Atleta apto a receber o kit oficial.
                </span>
              </div>
            )}

            {/* Kit Items Checklist */}
            <div className="grid grid-cols-3 gap-3 text-center py-2">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="block text-[11px] text-slate-400 uppercase font-bold">Camisa Oficial</span>
                <span className="text-xl font-black text-orange-600">Tam. {selectedAthleteForKit.shirtSize}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="block text-[11px] text-slate-400 uppercase font-bold">Chip de Cronometragem</span>
                <span className="text-sm font-black text-slate-800">Descartável</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="block text-[11px] text-slate-400 uppercase font-bold">Número de Peito</span>
                <span className="text-sm font-black text-slate-800">4 Alfinetes</span>
              </div>
            </div>

            {/* Delivery Form */}
            {!selectedAthleteForKit.kitDelivered && selectedAthleteForKit.status === 'CONFIRMED' && (
              <form onSubmit={handleConfirmDelivery} className="space-y-3 pt-2 border-t border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Operador / Posto de Entrega
                    </label>
                    <input
                      type="text"
                      value={operatorName}
                      onChange={(e) => setOperatorName(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Observações / Documento Apresentado
                    </label>
                    <input
                      type="text"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="Ex: Apresentou RG original e comprovante de residência"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingDelivery}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>{isSubmittingDelivery ? 'Registrando...' : 'Confirmar e Homologar Entrega de Kit'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Recent Deliveries List */}
        {recentDeliveries.length > 0 && (
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Últimas Entregas Realizadas no Evento
            </h4>
            <div className="space-y-2">
              {recentDeliveries.map((r) => (
                <div key={r.id} className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800">{r.athlete?.fullName}</span>
                      <span className="text-slate-400 text-[11px] ml-2">({r.shirtSize} • {r.protocol})</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {new Date(r.kitDeliveredAt || '').toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {r.kitDeliveredBy}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
