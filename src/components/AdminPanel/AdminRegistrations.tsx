import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  FileSpreadsheet, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  X, 
  Key, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { Registration, RegistrationStatus, Category, ShirtSize, PaymentMethod, CasaProofType } from '../../types';
import { exportRegistrationsToCSV, exportRegistrationsToExcel } from '../../lib/exportUtils';
import { formatCPF, formatPhone } from '../../lib/masks';

interface AdminRegistrationsProps {
  registrations: Registration[];
  onRefresh: () => void;
  onUpdateStatus: (id: string, status: RegistrationStatus, notes?: string) => Promise<void>;
  onReconcileAsaas: (id: string) => Promise<void>;
  onReissueCode: (id: string, reason: string) => Promise<string>;
}

export const AdminRegistrations: React.FC<AdminRegistrationsProps> = ({
  registrations,
  onRefresh,
  onUpdateStatus,
  onReconcileAsaas,
  onReissueCode,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [sizeFilter, setSizeFilter] = useState<string>('ALL');
  
  // Selected registration for details modal
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  
  // Reissue code dialog state
  const [reissueReason, setReissueReason] = useState('');
  const [isReissuing, setIsReissuing] = useState(false);
  const [reissuedCodeResult, setReissuedCodeResult] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const search = searchTerm.trim().toLowerCase();
      const athleteName = reg.athlete?.fullName.toLowerCase() || '';
      const cpf = reg.athlete?.cpf || '';
      const protocol = reg.protocol.toLowerCase();
      const email = reg.athlete?.email.toLowerCase() || '';

      const matchesSearch = 
        !search ||
        athleteName.includes(search) ||
        cpf.includes(search.replace(/\D/g, '')) ||
        protocol.includes(search) ||
        email.includes(search);

      const matchesCategory = categoryFilter === 'ALL' || reg.category === categoryFilter;
      const matchesStatus = statusFilter === 'ALL' || reg.status === statusFilter;
      const matchesPayment = paymentFilter === 'ALL' || reg.paymentMethod === paymentFilter;
      const matchesSize = sizeFilter === 'ALL' || reg.shirtSize === sizeFilter;

      return matchesSearch && matchesCategory && matchesStatus && matchesPayment && matchesSize;
    });
  }, [registrations, searchTerm, categoryFilter, statusFilter, paymentFilter, sizeFilter]);

  const handleExportCSV = () => {
    exportRegistrationsToCSV(filteredRegistrations, 'Inscricoes_Corrida_LajesPintadas_2026');
  };

  const handleExportExcel = () => {
    exportRegistrationsToExcel(filteredRegistrations, 'Inscricoes_Corrida_LajesPintadas_2026');
  };

  const handleReconcile = async (regId: string) => {
    try {
      setIsReconciling(true);
      await onReconcileAsaas(regId);
      setActionMessage({ type: 'success', text: 'Inscrição reconciliada e confirmada com sucesso!' });
      // Update modal view
      if (selectedReg && selectedReg.id === regId) {
        setSelectedReg({ ...selectedReg, status: 'CONFIRMED', financialStatus: 'CONFIRMED' });
      }
    } catch (e: any) {
      setActionMessage({ type: 'error', text: e.message || 'Erro ao reconciliar.' });
    } finally {
      setIsReconciling(false);
    }
  };

  const handleReissueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReg) return;
    try {
      setIsReissuing(true);
      const newCode = await onReissueCode(selectedReg.id, reissueReason || 'Reemissão solicitada pelo atleta');
      setReissuedCodeResult(newCode);
      setReissueReason('');
      setActionMessage({ type: 'success', text: `Novo código gerado com sucesso! O código anterior foi invalidado.` });
    } catch (e: any) {
      setActionMessage({ type: 'error', text: e.message || 'Falha ao reemitir código.' });
    } finally {
      setIsReissuing(false);
    }
  };

  const copyReissuedCode = () => {
    if (reissuedCodeResult) {
      navigator.clipboard.writeText(reissuedCodeResult);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2500);
    }
  };

  const categoryLabels: Record<Category, string> = {
    CASA_MASCULINO: 'Casa Masc.',
    CASA_FEMININO: 'Casa Fem.',
    VISITANTE_MASCULINO: 'Visit. Masc.',
    VISITANTE_FEMININO: 'Visit. Fem.',
  };

  const casaProofLabels: Record<CasaProofType, string> = {
    NATURAL: 'Natural de Lajes Pintadas',
    RESIDENTE: 'Morador Atual de Lajes Pintadas',
    NATURAL_E_RESIDENTE: 'Natural e Morador Atual de Lajes Pintadas',
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, Filters & Exports */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por protocolo, nome do atleta, CPF ou e-mail..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
              title="Exportar planilha Excel sanitizada contra injeção de fórmulas (CWE-1236)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Excel (.xlsx)</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition"
              title="Exportar CSV UTF-8 com proteção de injeção"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>
            <button
              onClick={onRefresh}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition"
              title="Atualizar lista de inscrições"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Categoria</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ALL">Todas as Categorias</option>
              <option value="CASA_MASCULINO">Casa Masculino</option>
              <option value="CASA_FEMININO">Casa Feminino</option>
              <option value="VISITANTE_MASCULINO">Visitante Masculino</option>
              <option value="VISITANTE_FEMININO">Visitante Feminino</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Situação</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ALL">Todos os Status</option>
              <option value="CONFIRMED">Confirmada (Paga)</option>
              <option value="RESERVED">Reservada (Pendente)</option>
              <option value="IN_REVIEW">Em Análise / Auditoria</option>
              <option value="CANCELLED">Cancelada</option>
              <option value="REFUNDED">Reembolsada</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Pagamento</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ALL">Todos os Meios</option>
              <option value="PIX">Pix Oficial</option>
              <option value="CREDIT_CARD">Cartão de Crédito</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Camisa</label>
            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ALL">Todos os Tamanhos</option>
              <option value="PP">PP</option>
              <option value="P">P</option>
              <option value="M">M</option>
              <option value="G">G</option>
              <option value="GG">GG</option>
              <option value="XG">XG</option>
            </select>
          </div>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Mostrando {filteredRegistrations.length} de {registrations.length} inscrições
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Clique em "Detalhes" para auditar categoria Casa, emitir código ou verificar Asaas
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Protocolo</th>
                <th className="py-3 px-4">Atleta</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Camisa</th>
                <th className="py-3 px-4">Pagamento</th>
                <th className="py-3 px-4">Situação</th>
                <th className="py-3 px-4">Kit</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Nenhuma inscrição encontrada para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => {
                  const isConfirmed = reg.status === 'CONFIRMED';
                  const isReserved = reg.status === 'RESERVED';
                  const isCasa = reg.originType === 'CASA';

                  return (
                    <tr key={reg.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {reg.protocol}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{reg.athlete?.fullName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <span>{formatCPF(reg.athlete?.cpf || '')}</span>
                          <span>•</span>
                          <span>{reg.athlete?.city}/{reg.athlete?.state}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isCasa ? 'bg-orange-100 text-orange-800 border border-orange-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {categoryLabels[reg.category] || reg.category}
                        </span>
                        {isCasa && reg.casaProofType && (
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[120px]" title={casaProofLabels[reg.casaProofType]}>
                            {reg.casaProofType}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="w-6 h-6 rounded bg-slate-100 text-slate-800 font-black text-[11px] inline-flex items-center justify-center border border-slate-200">
                          {reg.shirtSize}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800">
                          {(reg.totalAmountCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {reg.paymentMethod === 'PIX' ? 'Pix (Taxa R$ 0,99)' : 'Cartão 1x'}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isConfirmed && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            Confirmada
                          </span>
                        )}
                        {isReserved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Reservada
                          </span>
                        )}
                        {reg.status === 'IN_REVIEW' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                            <AlertTriangle className="w-3 h-3 text-purple-600" />
                            Em Auditoria
                          </span>
                        )}
                        {['CANCELLED', 'EXPIRED'].includes(reg.status) && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            Cancelada
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {reg.kitDelivered ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Entregue
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">Pendente</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedReg(reg);
                            setActionMessage(null);
                            setReissuedCodeResult(null);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-700 rounded-lg border border-slate-200 font-bold transition flex items-center gap-1 mx-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detalhes</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details & Audit Modal */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-orange-400 font-bold">
                  {selectedReg.protocol}
                </span>
                <h3 className="text-base font-bold text-white">
                  {selectedReg.athlete?.fullName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReg(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {actionMessage && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  actionMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {actionMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{actionMessage.text}</span>
                </div>
              )}

              {/* Athlete Info Grid */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Dados Cadastrais do Atleta
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">CPF:</span>
                    <span className="font-semibold text-slate-800">{formatCPF(selectedReg.athlete?.cpf || '')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Nascimento:</span>
                    <span className="font-semibold text-slate-800">{selectedReg.athlete?.birthDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Telefone/WhatsApp:</span>
                    <span className="font-semibold text-slate-800">{formatPhone(selectedReg.athlete?.phone || '')}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[11px]">E-mail:</span>
                    <span className="font-semibold text-slate-800">{selectedReg.athlete?.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Cidade / UF:</span>
                    <span className="font-semibold text-slate-800">{selectedReg.athlete?.city}/{selectedReg.athlete?.state}</span>
                  </div>
                  {selectedReg.athlete?.team && (
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[11px]">Equipe/Assessoria:</span>
                      <span className="font-semibold text-slate-800">{selectedReg.athlete.team}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Casa Category Audit Section */}
              <div className="bg-orange-50/60 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-orange-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-orange-600" />
                    Auditoria de Elegibilidade da Categoria
                  </h4>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-200 text-orange-800">
                    {selectedReg.category}
                  </span>
                </div>

                {selectedReg.originType === 'CASA' ? (
                  <div className="space-y-2 text-xs">
                    <p className="text-orange-950 font-medium">
                      <strong>Declaração de Vínculo:</strong> {selectedReg.casaProofType ? casaProofLabels[selectedReg.casaProofType] : 'Não especificado'}
                    </p>
                    <p className="text-orange-800 text-[11px] leading-relaxed">
                      A comprovação formal deverá ser validada na entrega do kit através de: Certidão de Nascimento (para natural), Título Eleitoral do município ou Comprovante de Residência em nome do atleta/pais.
                    </p>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => onUpdateStatus(selectedReg.id, 'IN_REVIEW', 'Colocado em análise para validação de residência')}
                        className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg font-bold text-xs transition"
                      >
                        Marcar para Auditoria
                      </button>
                      <button
                        onClick={() => onUpdateStatus(selectedReg.id, 'CONFIRMED', 'Comprovação validada pelo organizador')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition"
                      >
                        Homologar Categoria Casa
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-600 text-xs">
                    Atleta inscrito na categoria <strong>Visitante</strong>. Não requer comprovação de vínculo com Lajes Pintadas/RN.
                  </p>
                )}
              </div>

              {/* Financial & Asaas Gateway Section */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Situação Financeira & Gateway Asaas
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Valor Base:</span>
                    <span className="font-semibold text-slate-800">R$ 60,00</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Tarifa Gateway:</span>
                    <span className="font-semibold text-slate-800">
                      {(selectedReg.processingFeeCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Total Cobrado:</span>
                    <span className="font-bold text-orange-600">
                      {(selectedReg.totalAmountCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">ID Pagamento Asaas:</span>
                    <span className="font-mono text-slate-700">{selectedReg.asaasPaymentId || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Status Financeiro:</span>
                    <span className="font-bold text-emerald-700">{selectedReg.financialStatus}</span>
                  </div>
                  {selectedReg.paidAt && (
                    <div>
                      <span className="text-slate-400 block text-[11px]">Data de Confirmação:</span>
                      <span className="font-semibold text-slate-800">{new Date(selectedReg.paidAt).toLocaleString('pt-BR')}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  {selectedReg.asaasInvoiceUrl && (
                    <a
                      href={selectedReg.asaasInvoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-lg text-xs font-bold transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir Fatura Asaas</span>
                    </a>
                  )}

                  <button
                    onClick={() => handleReconcile(selectedReg.id)}
                    disabled={isReconciling || selectedReg.status === 'CONFIRMED'}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      selectedReg.status === 'CONFIRMED'
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isReconciling ? 'animate-spin' : ''}`} />
                    <span>{selectedReg.status === 'CONFIRMED' ? 'Já Confirmada no Sistema' : 'Simular Confirmação Webhook Asaas'}</span>
                  </button>
                </div>
              </div>

              {/* Reissue Access Code Section */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-orange-600" />
                    Reemissão de Código de Acesso
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Invalida o código anterior do atleta
                  </span>
                </div>

                {reissuedCodeResult ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                    <p className="text-xs text-emerald-800 font-semibold">
                      Novo código de acesso exclusivo gerado:
                    </p>
                    <div className="text-2xl font-mono font-black text-emerald-700 tracking-widest">
                      {reissuedCodeResult}
                    </div>
                    <button
                      onClick={copyReissuedCode}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition"
                    >
                      {codeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{codeCopied ? 'Código Copiado!' : 'Copiar Código para o Atleta'}</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleReissueSubmit} className="space-y-2">
                    <input
                      type="text"
                      value={reissueReason}
                      onChange={(e) => setReissueReason(e.target.value)}
                      placeholder="Motivo da reemissão (ex: Atleta perdeu comprovante inicial)..."
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                    />
                    <button
                      type="submit"
                      disabled={isReissuing}
                      className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>{isReissuing ? 'Gerando novo código...' : 'Gerar Novo Código de Acesso e Invalidar Anterior'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedReg(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
