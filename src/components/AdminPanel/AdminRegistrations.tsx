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
  UserCheck,
  Building2,
  Mail,
  Edit3,
  Save,
  CheckCircle2,
  SlidersHorizontal,
  Trash2
} from 'lucide-react';
import { Registration, RegistrationStatus, Category, ShirtSize, PaymentMethod, CasaProofType, RegistrationChannel, DocumentVerificationStatus, ShirtInventoryItem } from '../../types';
import { exportRegistrationsToCSV, exportRegistrationsToExcel } from '../../lib/exportUtils';
import { formatCPF, formatPhone, formatDateTimeBR } from '../../lib/masks';
import { storageService } from '../../services/storage';

interface AdminRegistrationsProps {
  registrations: Registration[];
  shirts?: ShirtInventoryItem[];
  operatorName?: string;
  onRefresh: () => void;
  onUpdateStatus: (id: string, status: RegistrationStatus, notes?: string) => Promise<void>;
  onReconcileAsaas: (id: string) => Promise<void>;
  onReissueCode: (id: string, reason: string) => Promise<string>;
  onOpenPresential?: () => void;
}

export const AdminRegistrations: React.FC<AdminRegistrationsProps> = ({
  registrations,
  shirts = [],
  operatorName = 'Administrador Geral',
  onRefresh,
  onUpdateStatus,
  onReconcileAsaas,
  onReissueCode,
  onOpenPresential,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [genderFilter, setGenderFilter] = useState<string>('ALL');
  const [verificationFilter, setVerificationFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [sizeFilter, setSizeFilter] = useState<string>('ALL');
  const [attendantFilter, setAttendantFilter] = useState<string>('ALL');
  
  // Selected registration for details modal
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);

  // Edit registration state
  const [editingReg, setEditingReg] = useState<Registration | null>(null);
  const [editFormData, setEditFormData] = useState<{
    fullName: string;
    cpf: string;
    birthDate: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    team: string;
    category: Category;
    gender: 'MASCULINO' | 'FEMININO';
    shirtSize: ShirtSize;
    status: RegistrationStatus;
    financialStatus: string;
    casaProofType: CasaProofType | '';
    kitDelivered: boolean;
    kitNotes: string;
    documentVerificationStatus: string;
    documentVerificationNotes: string;
    sendNotificationEmail: boolean;
  }>({
    fullName: '',
    cpf: '',
    birthDate: '',
    email: '',
    phone: '',
    city: '',
    state: 'RN',
    team: '',
    category: 'LOCAL_MASCULINO',
    gender: 'MASCULINO',
    shirtSize: 'M',
    status: 'RESERVED',
    financialStatus: 'PENDING',
    casaProofType: '',
    kitDelivered: false,
    kitNotes: '',
    documentVerificationStatus: 'PENDENTE',
    documentVerificationNotes: '',
    sendNotificationEmail: true,
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editModalError, setEditModalError] = useState<string | null>(null);
  
  // Reissue code dialog state
  const [reissueReason, setReissueReason] = useState('');
  const [isReissuing, setIsReissuing] = useState(false);
  const [reissuedCodeResult, setReissuedCodeResult] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Distinct attendants list for filter
  const attendantOptions = useMemo(() => {
    const set = new Set<string>();
    registrations.forEach((r) => {
      const name = r.attendantName || r.documentCheckedBy;
      if (name) set.add(name);
    });
    return Array.from(set);
  }, [registrations]);

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

      const matchesChannel =
        channelFilter === 'ALL' ||
        (channelFilter === 'PRESENCIAL_PREFEITURA'
          ? reg.channel === 'PRESENCIAL_PREFEITURA'
          : reg.channel !== 'PRESENCIAL_PREFEITURA');

      const matchesCategory = categoryFilter === 'ALL' || reg.category === categoryFilter;

      const matchesGender =
        genderFilter === 'ALL' ||
        (genderFilter === 'MASCULINO'
          ? ['CASA_MASCULINO', 'VISITANTE_MASCULINO'].includes(reg.category) || reg.gender === 'MASCULINO'
          : ['CASA_FEMININO', 'VISITANTE_FEMININO'].includes(reg.category) || reg.gender === 'FEMININO');

      const matchesVerification =
        verificationFilter === 'ALL' ||
        reg.documentVerificationStatus === verificationFilter ||
        (verificationFilter === 'PENDENTE' && !reg.documentVerificationStatus && reg.originType === 'CASA');

      const matchesStatus = statusFilter === 'ALL' || reg.status === statusFilter;
      const matchesPayment = paymentFilter === 'ALL' || reg.paymentMethod === paymentFilter;
      const matchesSize = sizeFilter === 'ALL' || reg.shirtSize === sizeFilter;

      const matchesAttendant =
        attendantFilter === 'ALL' ||
        reg.attendantName === attendantFilter ||
        reg.documentCheckedBy === attendantFilter;

      return (
        matchesSearch &&
        matchesChannel &&
        matchesCategory &&
        matchesGender &&
        matchesVerification &&
        matchesStatus &&
        matchesPayment &&
        matchesSize &&
        matchesAttendant
      );
    });
  }, [
    registrations,
    searchTerm,
    channelFilter,
    categoryFilter,
    genderFilter,
    verificationFilter,
    statusFilter,
    paymentFilter,
    sizeFilter,
    attendantFilter,
  ]);

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

  const handleSendEmailCode = async () => {
    if (!selectedReg || !reissuedCodeResult || !selectedReg.athlete?.email) return;
    setIsSendingEmail(true);
    try {
      const res = await fetch('/api/admin-registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resend-email',
          athleteName: selectedReg.athlete.fullName,
          athleteEmail: selectedReg.athlete.email,
          athleteCpf: selectedReg.athlete.cpf,
          protocol: selectedReg.protocol,
          accessCode: reissuedCodeResult,
          category: selectedReg.category,
          gender: selectedReg.gender,
          shirtSize: selectedReg.shirtSize,
          status: selectedReg.status,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailSentSuccess(true);
        setTimeout(() => setEmailSentSuccess(false), 4000);
      } else {
        alert(data.error || 'Falha ao enviar e-mail.');
      }
    } catch (e: any) {
      alert(e.message || 'Erro ao conectar ao servidor de e-mail.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleStartEdit = (reg: Registration) => {
    setEditingReg(reg);
    setEditModalError(null);
    setEditFormData({
      fullName: reg.athlete?.fullName || '',
      cpf: reg.athlete?.cpf || '',
      birthDate: reg.athlete?.birthDate || '',
      email: reg.athlete?.email || '',
      phone: reg.athlete?.phone || '',
      city: reg.athlete?.city || 'Lajes Pintadas',
      state: reg.athlete?.state || 'RN',
      team: reg.athlete?.team || '',
      category: reg.category,
      gender: reg.gender,
      shirtSize: reg.shirtSize,
      status: reg.status,
      financialStatus: reg.financialStatus,
      casaProofType: reg.casaProofType || '',
      kitDelivered: Boolean(reg.kitDelivered),
      kitNotes: reg.kitNotes || '',
      documentVerificationStatus: reg.documentVerificationStatus || 'PENDENTE',
      documentVerificationNotes: reg.documentVerificationNotes || '',
      sendNotificationEmail: false,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReg) return;

    try {
      setIsSavingEdit(true);
      setEditModalError(null);

      const updates = {
        athlete: {
          fullName: editFormData.fullName.trim(),
          cpf: editFormData.cpf.replace(/\D/g, ''),
          birthDate: editFormData.birthDate,
          email: editFormData.email.trim().toLowerCase(),
          phone: editFormData.phone.trim(),
          city: editFormData.city.trim(),
          state: editFormData.state.trim().toUpperCase(),
          team: editFormData.team.trim() || undefined,
        },
        registration: {
          category: editFormData.category,
          gender: editFormData.gender,
          shirtSize: editFormData.shirtSize,
          status: editFormData.status,
          financialStatus: editFormData.financialStatus,
          originType: editFormData.category.startsWith('LOCAL') || editFormData.category.startsWith('CASA') ? 'CASA' : 'VISITANTE',
          casaProofType: editFormData.casaProofType || undefined,
          kitDelivered: editFormData.kitDelivered,
          kitNotes: editFormData.kitNotes,
        },
        sendNotificationEmail: editFormData.sendNotificationEmail,
        operator: operatorName,
      };

      await storageService.updateRegistration(editingReg.id, updates);

      setActionMessage({
        type: 'success',
        text: `Inscrição ${editingReg.protocol} (${editFormData.fullName}) atualizada com sucesso no banco de dados!`,
      });
      setEditingReg(null);
      if (selectedReg && selectedReg.id === editingReg.id) {
        setSelectedReg(null);
      }
      onRefresh();
    } catch (err: any) {
      setEditModalError(err.message || 'Falha ao salvar alterações da inscrição.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleQuickManualConfirm = async (reg: Registration) => {
    if (!window.confirm(`Deseja aprovar e confirmar manualmente a inscrição ${reg.protocol} (${reg.athlete?.fullName})? O estoque será atualizado para confirmado e o atleta será notificado por e-mail.`)) {
      return;
    }

    try {
      await storageService.manualConfirmRegistration(
        reg.id,
        operatorName,
        'Confirmação manual direta no painel admin',
        true
      );
      setActionMessage({
        type: 'success',
        text: `Inscrição ${reg.protocol} confirmada com sucesso!`,
      });
      onRefresh();
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.message || 'Falha ao confirmar inscrição.',
      });
    }
  };

  const categoryLabels: Record<Category, string> = {
    LOCAL_MASCULINO: 'Local Masc.',
    LOCAL_FEMININO: 'Local Fem.',
    CASA_MASCULINO: 'Local Masc.',
    CASA_FEMININO: 'Local Fem.',
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

          {/* Export & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {onOpenPresential && (
              <button
                onClick={onOpenPresential}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-orange-600/20 transition"
                title="Cadastrar atleta presencialmente na sede da Prefeitura de Lajes Pintadas"
              >
                <Building2 className="w-4 h-4" />
                <span>Nova Inscrição Presencial</span>
              </button>
            )}

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
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Canal</label>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ALL">Todos os Canais</option>
              <option value="ONLINE">Online</option>
              <option value="PRESENCIAL_PREFEITURA">Presencial — Prefeitura</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Categoria</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ALL">Todas Categorias</option>
              <option value="CASA_MASCULINO">Casa Masc.</option>
              <option value="CASA_FEMININO">Casa Fem.</option>
              <option value="VISITANTE_MASCULINO">Visit. Masc.</option>
              <option value="VISITANTE_FEMININO">Visit. Fem.</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sexo / Gênero</label>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ALL">Todos</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMININO">Feminino</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Conferência Vínculo</label>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ALL">Todos os Status</option>
              <option value="APROVADO">Aprovada</option>
              <option value="PENDENTE">Pendente</option>
              <option value="PENDENTE_COMPLEMENTACAO">Pend. Complem.</option>
              <option value="REJEITADO">Rejeitada</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Situação Inscrição</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ALL">Todos</option>
              <option value="CONFIRMED">Confirmada (Paga)</option>
              <option value="RESERVED">Reservada (Pendente)</option>
              <option value="IN_REVIEW">Em Auditoria</option>
              <option value="CANCELLED">Cancelada</option>
              <option value="REFUNDED">Reembolsada</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pagamento</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ALL">Todos</option>
              <option value="PIX">Pix Oficial</option>
              <option value="CREDIT_CARD">Cartão 1x</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Camisa</label>
            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ALL">Todas</option>
              <option value="PP">PP</option>
              <option value="P">P</option>
              <option value="M">M</option>
              <option value="G">G</option>
              <option value="GG">GG</option>
              <option value="XG">XG</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Servidor Responsável</label>
            <select
              value={attendantFilter}
              onChange={(e) => setAttendantFilter(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ALL">Todos</option>
              {attendantOptions.map((att) => (
                <option key={att} value={att}>{att}</option>
              ))}
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
            Clique em "Detalhes" para auditar categoria Casa, emitir código ou verificar pagamento
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Protocolo</th>
                <th className="py-3 px-4">Atleta</th>
                <th className="py-3 px-4">Canal</th>
                <th className="py-3 px-4">Categoria / Vínculo</th>
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
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Nenhuma inscrição encontrada para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => {
                  const isConfirmed = reg.status === 'CONFIRMED';
                  const isReserved = reg.status === 'RESERVED';
                  const isCasa = reg.originType === 'CASA';
                  const isPresential = reg.channel === 'PRESENCIAL_PREFEITURA';

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
                        {isPresential ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <Building2 className="w-3 h-3 text-amber-700" />
                            <span>Presencial</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <span>Online</span>
                          </span>
                        )}
                        {reg.attendantName && (
                          <div className="text-[9px] text-slate-400 truncate max-w-[90px]" title={reg.attendantName}>
                            Por: {reg.attendantName}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isCasa ? 'bg-orange-100 text-orange-800 border border-orange-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {categoryLabels[reg.category] || reg.category}
                        </span>
                        {isCasa && (
                          <div className="mt-0.5">
                            {reg.documentVerificationStatus === 'APROVADO' ? (
                              <span className="text-[10px] text-emerald-700 font-bold block">✓ Vínculo Aprovado</span>
                            ) : reg.documentVerificationStatus === 'PENDENTE_COMPLEMENTACAO' ? (
                              <span className="text-[10px] text-amber-700 font-bold block">⏳ Pend. Complem.</span>
                            ) : reg.documentVerificationStatus === 'REJEITADO' ? (
                              <span className="text-[10px] text-red-700 font-bold block">✕ Vínculo Rejeitado</span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium block">Pendente Conf.</span>
                            )}
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
                          {reg.paymentMethod === 'PIX' ? 'Pix (Taxa 10%)' : 'Cartão 1x (Taxa 10%)'}
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
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedReg(reg);
                              setActionMessage(null);
                              setReissuedCodeResult(null);
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 font-bold transition flex items-center gap-1"
                            title="Ver detalhes da inscrição"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Detalhes</span>
                          </button>

                          <button
                            onClick={() => handleStartEdit(reg)}
                            className="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg border border-orange-200 font-bold transition flex items-center gap-1"
                            title="Editar dados cadastrais, prova e camisa (Admin Geral)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Editar</span>
                          </button>

                          {reg.status === 'RESERVED' && (
                            <button
                              onClick={() => handleQuickManualConfirm(reg)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 font-bold transition flex items-center gap-1"
                              title="Aprovar e confirmar pagamento manualmente"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Confirmar</span>
                            </button>
                          )}
                        </div>
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

              {/* Casa Category & Presential Audit Section */}
              <div className="bg-orange-50/60 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-orange-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-orange-600" />
                    Canal de Inscrição & Elegibilidade de Categoria
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                      {selectedReg.channel === 'PRESENCIAL_PREFEITURA' ? 'Presencial — Prefeitura' : 'Online'}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-200 text-orange-800">
                      {categoryLabels[selectedReg.category] || selectedReg.category}
                    </span>
                  </div>
                </div>

                {selectedReg.originType === 'CASA' ? (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-white/70 p-3 rounded-lg border border-orange-200/80">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Vínculo Regimental:</span>
                        <strong className="text-orange-950 font-bold">
                          {selectedReg.casaProofType ? casaProofLabels[selectedReg.casaProofType] : 'Casa'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Conferência Documental:</span>
                        <strong className={`font-bold ${
                          selectedReg.documentVerificationStatus === 'APROVADO'
                            ? 'text-emerald-700'
                            : selectedReg.documentVerificationStatus === 'PENDENTE_COMPLEMENTACAO'
                            ? 'text-amber-700'
                            : 'text-slate-700'
                        }`}>
                          {selectedReg.documentVerificationStatus || 'Pendente'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Servidor Responsável:</span>
                        <strong className="text-slate-900 font-bold">
                          {selectedReg.attendantName || selectedReg.documentCheckedBy || 'Atendimento Presencial'}
                        </strong>
                      </div>
                      {selectedReg.documentTypePresented && (
                        <div className="col-span-2">
                          <span className="text-slate-400 block text-[10px]">Documento Apresentado:</span>
                          <span className="text-slate-800 font-medium">{selectedReg.documentTypePresented}</span>
                        </div>
                      )}
                      {selectedReg.documentCheckedAt && (
                        <div>
                          <span className="text-slate-400 block text-[10px]">Data da Conferência:</span>
                          <span className="text-slate-800 font-medium">{formatDateTimeBR(selectedReg.documentCheckedAt)}</span>
                        </div>
                      )}
                    </div>

                    {selectedReg.documentVerificationNotes && (
                      <div className="bg-white/90 p-2.5 rounded-lg border border-orange-200 text-[11px] text-slate-700">
                        <strong className="text-orange-900 block text-[10px] uppercase">Observações Internas da Conferência:</strong>
                        <span>{selectedReg.documentVerificationNotes}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-1">
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
                    Atleta inscrito na categoria <strong>Visitante</strong> via canal <strong>Online</strong>. Não requer comprovação de vínculo com Lajes Pintadas/RN.
                  </p>
                )}
              </div>

              {/* Financial & Online Gateway Section */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Situação Financeira & Pagamento Online
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Valor Base:</span>
                    <span className="font-semibold text-slate-800">R$ 60,00</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Taxa de Serviço:</span>
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
                    <span className="text-slate-400 block text-[11px]">ID da Cobrança:</span>
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
                      <span>Abrir Fatura Online</span>
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
                    <span>{selectedReg.status === 'CONFIRMED' ? 'Já Confirmada no Sistema' : 'Simular Confirmação de Pagamento'}</span>
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
                    <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                      <button
                        type="button"
                        onClick={copyReissuedCode}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition"
                      >
                        {codeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{codeCopied ? 'Código Copiado!' : 'Copiar Código'}</span>
                      </button>

                      {selectedReg.athlete?.email && (
                        <button
                          type="button"
                          onClick={handleSendEmailCode}
                          disabled={isSendingEmail}
                          className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>{isSendingEmail ? 'Enviando...' : emailSentSuccess ? 'E-mail Enviado!' : 'Enviar por E-mail ao Atleta'}</span>
                        </button>
                      )}
                    </div>
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
            <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const target = selectedReg;
                  setSelectedReg(null);
                  handleStartEdit(target);
                }}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Inscrição Completa</span>
              </button>

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

      {/* Complete Edit Registration Modal (Admin Geral) */}
      {editingReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 text-white px-6 py-4 flex items-center justify-between border-b border-orange-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black shadow-md">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded border border-orange-800">
                      {editingReg.protocol}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-slate-300">
                      Controle Total • Administrador Geral
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Editar Inscrição: {editingReg.athlete?.fullName}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setEditingReg(null)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit}>
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {editModalError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{editModalError}</span>
                  </div>
                )}

                {/* Section 1: Dados Pessoais do Atleta */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <UserCheck className="w-4 h-4 text-orange-600" />
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      1. Dados Cadastrais do Atleta (Tabela Athletes)
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Nome Completo</label>
                      <input
                        type="text"
                        required
                        value={editFormData.fullName}
                        onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">CPF</label>
                      <input
                        type="text"
                        required
                        value={formatCPF(editFormData.cpf)}
                        onChange={(e) => setEditFormData({ ...editFormData, cpf: e.target.value.replace(/\D/g, '') })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Data de Nascimento</label>
                      <input
                        type="date"
                        required
                        value={editFormData.birthDate}
                        onChange={(e) => setEditFormData({ ...editFormData, birthDate: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Telefone / WhatsApp</label>
                      <input
                        type="text"
                        required
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">E-mail</label>
                      <input
                        type="email"
                        required
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Cidade</label>
                      <input
                        type="text"
                        required
                        value={editFormData.city}
                        onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">UF (Estado)</label>
                      <input
                        type="text"
                        maxLength={2}
                        required
                        value={editFormData.state}
                        onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Equipe / Assessoria</label>
                      <input
                        type="text"
                        value={editFormData.team}
                        onChange={(e) => setEditFormData({ ...editFormData, team: e.target.value })}
                        placeholder="Ex: Lajes Runners"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Prova, Categoria e Camisa */}
                <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-200 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-orange-200/60">
                    <Building2 className="w-4 h-4 text-orange-600" />
                    <h4 className="text-xs font-bold text-orange-950 uppercase tracking-wider">
                      2. Modalidade, Categoria & Troca de Camisa
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Categoria da Prova</label>
                      <select
                        value={editFormData.category}
                        onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value as Category })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="LOCAL_MASCULINO">Local Masculino (5 km)</option>
                        <option value="LOCAL_FEMININO">Local Feminino (5 km)</option>
                        <option value="CASA_MASCULINO">Local Masc. (Vínculo Casa)</option>
                        <option value="CASA_FEMININO">Local Fem. (Vínculo Casa)</option>
                        <option value="VISITANTE_MASCULINO">Visitante Masculino (5 km)</option>
                        <option value="VISITANTE_FEMININO">Visitante Feminino (5 km)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Gênero</label>
                      <select
                        value={editFormData.gender}
                        onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value as any })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="MASCULINO">Masculino</option>
                        <option value="FEMININO">Feminino</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Tamanho da Camisa Oficial
                      </label>
                      <select
                        value={editFormData.shirtSize}
                        onChange={(e) => setEditFormData({ ...editFormData, shirtSize: e.target.value as ShirtSize })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-black text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        {(['PP', 'P', 'M', 'G', 'GG', 'XG'] as ShirtSize[]).map((sz) => {
                          const stockItem = shirts.find((s) => s.size === sz);
                          const avail = stockItem ? stockItem.availableStock : '-';
                          return (
                            <option key={sz} value={sz}>
                              Tamanho {sz} (Disponível: {avail})
                            </option>
                          );
                        })}
                      </select>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        O estoque entre tamanhos é reajustado atomicamente no Supabase.
                      </span>
                    </div>

                    {(editFormData.category.includes('LOCAL') || editFormData.category.includes('CASA')) && (
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Tipo de Comprovação Local</label>
                        <select
                          value={editFormData.casaProofType}
                          onChange={(e) => setEditFormData({ ...editFormData, casaProofType: e.target.value as any })}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="">Não especificado</option>
                          <option value="NATURAL">Natural de Lajes Pintadas/RN (Certidão / RG)</option>
                          <option value="RESIDENTE">Residente / Morador Atual (Comprovante Residência / Título)</option>
                          <option value="NATURAL_E_RESIDENTE">Natural e Residente Atual</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 3: Status da Inscrição & Financeiro */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      3. Situação da Inscrição, Pagamento & Kit
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Situação da Inscrição</label>
                      <select
                        value={editFormData.status}
                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as RegistrationStatus })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="CONFIRMED">CONFIRMED (Confirmada / Paga)</option>
                        <option value="RESERVED">RESERVED (Pendente de Pagamento)</option>
                        <option value="IN_REVIEW">IN_REVIEW (Em Auditoria)</option>
                        <option value="CANCELLED">CANCELLED (Cancelada / Vaga Devolvida)</option>
                        <option value="REFUNDED">REFUNDED (Reembolsada)</option>
                        <option value="EXPIRED">EXPIRED (Expirada)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Status Financeiro</label>
                      <select
                        value={editFormData.financialStatus}
                        onChange={(e) => setEditFormData({ ...editFormData, financialStatus: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="CONFIRMED">CONFIRMED (Compensado)</option>
                        <option value="RECEIVED">RECEIVED (Recebido)</option>
                        <option value="PENDING">PENDING (Aguardando)</option>
                        <option value="FAILED">FAILED (Falhou)</option>
                        <option value="REFUNDED">REFUNDED (Estornado)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Conferência Documento</label>
                      <select
                        value={editFormData.documentVerificationStatus}
                        onChange={(e) => setEditFormData({ ...editFormData, documentVerificationStatus: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="APROVADO">APROVADO</option>
                        <option value="PENDENTE">PENDENTE</option>
                        <option value="PENDENTE_COMPLEMENTACAO">PENDENTE DE COMPLEMENTAÇÃO</option>
                        <option value="REJEITADO">REJEITADO</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3 flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                      <input
                        type="checkbox"
                        id="kitDeliveredCheck"
                        checked={editFormData.kitDelivered}
                        onChange={(e) => setEditFormData({ ...editFormData, kitDelivered: e.target.checked })}
                        className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                      />
                      <label htmlFor="kitDeliveredCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                        Kit Oficial do Atleta já foi entregue (Camisa + Número de Peito + Chip)
                      </label>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Anotações / Observações Administrativas</label>
                      <input
                        type="text"
                        value={editFormData.kitNotes}
                        onChange={(e) => setEditFormData({ ...editFormData, kitNotes: e.target.value })}
                        placeholder="Ex: Atleta solicitou alteração de tamanho; comprovante verificado por operador."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Notificação por E-mail */}
                <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-sky-600 shrink-0" />
                    <div>
                      <div className="font-bold text-xs text-sky-950">
                        Notificar atleta por e-mail automaticamente
                      </div>
                      <div className="text-[11px] text-sky-700">
                        Dispara e-mail com protocolo, código de acesso e detalhes atualizados da inscrição para <strong>{editFormData.email || 'o atleta'}</strong>.
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={editFormData.sendNotificationEmail}
                    onChange={(e) => setEditFormData({ ...editFormData, sendNotificationEmail: e.target.checked })}
                    className="w-5 h-5 text-sky-600 rounded border-sky-300 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingReg(null)}
                  disabled={isSavingEdit}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingEdit ? 'Salvando no Banco...' : 'Salvar Alterações'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
