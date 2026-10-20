import React, { useState } from 'react';
import {
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  Printer,
  QrCode,
  CreditCard,
  Building2,
  User,
  ShieldCheck,
  FileText,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import {
  Registration,
  EventSettings,
  ShirtInventoryItem,
  AthleteGender,
  ShirtSize,
  PaymentMethod,
  CasaProofType,
  DocumentVerificationStatus
} from '../../types';
import { storageService } from '../../services/storage';
import { isValidCPF, formatCPF, maskCPF } from '../../lib/cpf';
import { maskPhone, maskDate, formatDateBR, formatDateTimeBR } from '../../lib/masks';
import { calculatePricing, formatCentsToBRL } from '../../lib/pricing';

interface AdminPresentialRegistrationProps {
  currentUser: string;
  settings: EventSettings;
  inventory: ShirtInventoryItem[];
  onRegistrationCreated?: () => void;
  onGoToRegistrations?: () => void;
}

export const AdminPresentialRegistration: React.FC<AdminPresentialRegistrationProps> = ({
  currentUser,
  settings,
  inventory,
  onRegistrationCreated,
  onGoToRegistrations,
}) => {
  // Current active step in the 5-stage workflow
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Stage 1: CPF search
  const [cpfSearch, setCpfSearch] = useState('');
  const [isSearchingCpf, setIsSearchingCpf] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [existingReg, setExistingReg] = useState<Registration | null>(null);
  const [cpfVerified, setCpfVerified] = useState(false);

  // Stage 2: Athlete registration form data
  const [formData, setFormData] = useState({
    fullName: '',
    cpf: '',
    birthDate: '',
    email: '',
    phone: '',
    city: 'Lajes Pintadas',
    state: 'RN',
    team: '',
    gender: 'MASCULINO' as AthleteGender,
    shirtSize: 'M' as ShirtSize,
    athleteConsentGiven: false,
  });
  const [stage2Errors, setStage2Errors] = useState<Record<string, string>>({});

  // Stage 3: Vínculo check data
  const [casaProofType, setCasaProofType] = useState<CasaProofType>('NATURAL_E_RESIDENTE');
  const [documentTypePresented, setDocumentTypePresented] = useState('Documento de Identidade (RG) com naturalidade');
  const [customDocType, setCustomDocType] = useState('');
  const [verificationDecision, setVerificationDecision] = useState<DocumentVerificationStatus>('APROVADO');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [stage3Error, setStage3Error] = useState<string | null>(null);

  // Stage 4: Payment generation
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [isGeneratingPayment, setIsGeneratingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [createdRegistration, setCreatedRegistration] = useState<Registration | null>(null);
  const [accessCode, setAccessCode] = useState<string>('');
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentCheckMessage, setPaymentCheckMessage] = useState<string | null>(null);

  // Pricing calculations
  const pixPricing = calculatePricing('PIX', {
    basePriceCents: settings.basePriceCents,
    pixFixedFeeCents: settings.asaasPixFixedFeeCents,
    creditFixedFeeCents: settings.asaasCreditFixedFeeCents,
    creditPercentFee: settings.asaasCreditPercentFee,
  });

  const cardPricing = calculatePricing('CREDIT_CARD', {
    basePriceCents: settings.basePriceCents,
    pixFixedFeeCents: settings.asaasPixFixedFeeCents,
    creditFixedFeeCents: settings.asaasCreditFixedFeeCents,
    creditPercentFee: settings.asaasCreditPercentFee,
  });

  // Selected pricing for stage 4
  const activePricing = paymentMethod === 'PIX' ? pixPricing : cardPricing;

  // --------------------------------------------------------------------------
  // STAGE 1: Search CPF
  // --------------------------------------------------------------------------
  const handleSearchCpf = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    setExistingReg(null);
    setCpfVerified(false);

    const cleanCpf = cpfSearch.replace(/\D/g, '');
    if (!cleanCpf) {
      setSearchError('Por favor, informe o CPF do atleta.');
      return;
    }
    if (!isValidCPF(cleanCpf)) {
      setSearchError('CPF inválido. Verifique os números digitados.');
      return;
    }

    try {
      setIsSearchingCpf(true);
      const found = await storageService.lookupRegistrationByCpf(cleanCpf);
      if (found) {
        setExistingReg(found);
      } else {
        // No existing registration, ready to proceed
        setCpfVerified(true);
        setFormData((prev) => ({ ...prev, cpf: formatCPF(cleanCpf) }));
      }
    } catch (err: any) {
      setSearchError(err.message || 'Falha ao consultar CPF no banco.');
    } finally {
      setIsSearchingCpf(false);
    }
  };

  const handleStartNewWithCpf = () => {
    const cleanCpf = cpfSearch.replace(/\D/g, '');
    setFormData((prev) => ({
      ...prev,
      cpf: formatCPF(cleanCpf),
    }));
    setCurrentStep(2);
  };

  const handleResumeExisting = (reg: Registration) => {
    setCreatedRegistration(reg);
    if (reg.status === 'CONFIRMED') {
      setCurrentStep(5);
    } else {
      setCurrentStep(4);
    }
  };

  // --------------------------------------------------------------------------
  // STAGE 2: Validate Athlete Data
  // --------------------------------------------------------------------------
  const handleValidateStage2 = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().split(' ').length < 2) {
      errors.fullName = 'Informe o nome e sobrenome completos do atleta.';
    }

    if (!formData.birthDate) {
      errors.birthDate = 'Data de nascimento é obrigatória.';
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'E-mail válido é obrigatório.';
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      errors.phone = 'Telefone/WhatsApp com DDD é obrigatório (10 ou 11 dígitos).';
    }

    if (!formData.city.trim()) {
      errors.city = 'Cidade é obrigatória.';
    }

    if (!formData.state.trim() || formData.state.trim().length !== 2) {
      errors.state = 'UF deve ter 2 letras.';
    }

    const selectedShirt = inventory.find((s) => s.size === formData.shirtSize);
    if (!selectedShirt || selectedShirt.availableStock <= 0) {
      errors.shirtSize = `Camisa ${formData.shirtSize} sem estoque no momento. Escolha outro tamanho.`;
    }

    if (!formData.athleteConsentGiven) {
      errors.athleteConsentGiven = 'É obrigatório registrar o aceite presencial do atleta ao regulamento.';
    }

    setStage2Errors(errors);

    if (Object.keys(errors).length === 0) {
      setCurrentStep(3);
    }
  };

  // --------------------------------------------------------------------------
  // STAGE 3: Validate Vínculo
  // --------------------------------------------------------------------------
  const handleValidateStage3 = (e: React.FormEvent) => {
    e.preventDefault();
    setStage3Error(null);

    const docType = documentTypePresented === 'OUTRO' ? customDocType.trim() : documentTypePresented;
    if (!docType) {
      setStage3Error('Informe o tipo de documento apresentado para conferência.');
      return;
    }

    if (verificationDecision !== 'APROVADO') {
      setStage3Error(
        'Atenção: A geração de cobrança só pode ser liberada após a aprovação presencial do vínculo. Se o atleta possui pendência de complementação documental, a inscrição deve aguardar a apresentação dos comprovantes.'
      );
      return;
    }

    setCurrentStep(4);
  };

  // --------------------------------------------------------------------------
  // STAGE 4: Generate Asaas Payment
  // --------------------------------------------------------------------------
  const handleGeneratePayment = async () => {
    setPaymentError(null);
    setIsGeneratingPayment(true);

    try {
      const docType = documentTypePresented === 'OUTRO' ? customDocType.trim() : documentTypePresented;

      const submissionPayload = {
        fullName: formData.fullName.trim(),
        cpf: formData.cpf.replace(/\D/g, ''),
        birthDate: formData.birthDate,
        email: formData.email.trim(),
        phone: formData.phone.replace(/\D/g, ''),
        city: formData.city.trim(),
        state: formData.state.trim().toUpperCase(),
        team: formData.team.trim() || undefined,
        originType: 'CASA' as const,
        gender: formData.gender,
        casaProofType,
        shirtSize: formData.shirtSize,
        paymentMethod,
        termsAccepted: true,
        privacyAccepted: true,
        channel: 'PRESENCIAL_PREFEITURA' as const,
        documentVerificationStatus: 'APROVADO' as const,
        documentTypePresented: docType,
        documentVerificationNotes: verificationNotes.trim() || undefined,
        documentCheckedBy: currentUser,
        documentCheckedAt: new Date().toISOString(),
        attendantName: currentUser,
      };

      const result = await storageService.submitRegistration(submissionPayload as any);
      setCreatedRegistration(result.registration);
      setAccessCode(result.accessCode);
      if (onRegistrationCreated) onRegistrationCreated();
    } catch (err: any) {
      setPaymentError(err.message || 'Falha ao registrar cobrança no Asaas. Tente novamente.');
    } finally {
      setIsGeneratingPayment(false);
    }
  };

  // Check if payment was confirmed in Asaas
  const handleCheckPaymentStatus = async () => {
    if (!createdRegistration) return;
    setIsCheckingPayment(true);
    setPaymentCheckMessage(null);

    try {
      const fresh = await storageService.getRegistrationByProtocol(createdRegistration.protocol);
      if (fresh) {
        setCreatedRegistration(fresh);
        if (fresh.status === 'CONFIRMED') {
          setPaymentCheckMessage('Pagamento confirmado com sucesso pelo Asaas!');
        } else {
          setPaymentCheckMessage('Pagamento ainda aguardando compensação pelo banco.');
        }
      }
    } catch (e: any) {
      setPaymentCheckMessage('Não foi possível verificar no momento.');
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const copyPixCode = () => {
    const payload = createdRegistration?.asaasPixCopyPaste || createdRegistration?.pixPayload;
    if (payload) {
      navigator.clipboard.writeText(payload);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    }
  };

  const copyPaymentUrl = () => {
    const url = createdRegistration?.asaasInvoiceUrl || createdRegistration?.asaasPixQrCode || createdRegistration?.pixQrCodeUrl;
    if (url) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Reset to stage 1 for a new in-person attendee
  const handleResetWorkflow = () => {
    setCurrentStep(1);
    setCpfSearch('');
    setExistingReg(null);
    setCpfVerified(false);
    setSearchError(null);
    setCreatedRegistration(null);
    setAccessCode('');
    setFormData({
      fullName: '',
      cpf: '',
      birthDate: '',
      email: '',
      phone: '',
      city: 'Lajes Pintadas',
      state: 'RN',
      team: '',
      gender: 'MASCULINO',
      shirtSize: 'M',
      athleteConsentGiven: false,
    });
    setVerificationNotes('');
    setStage2Errors({});
    setStage3Error(null);
    setPaymentError(null);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-700 to-amber-700 rounded-3xl p-6 text-white shadow-lg shadow-orange-600/20 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Building2 size={220} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold text-white mb-2">
              <Building2 size={14} />
              <span>Sede da Prefeitura Municipal de Lajes Pintadas/RN</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase">
              Atendimento Presencial — Categoria Casa
            </h2>
            <p className="text-xs md:text-sm text-orange-100 mt-1 max-w-2xl">
              Módulo restrito para servidores autorizados cadastrarem atletas de Lajes Pintadas com conferência física do vínculo regimental, cobrança Asaas e controle unificado de vagas.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <span className="block text-[11px] text-orange-200">Servidor Atendente</span>
              <span className="font-extrabold text-sm">{currentUser}</span>
            </div>
            {onGoToRegistrations && (
              <button
                onClick={onGoToRegistrations}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition border border-white/20"
              >
                Voltar à Lista
              </button>
            )}
          </div>
        </div>

        {/* 5-Step Stepper Progress Bar */}
        <div className="grid grid-cols-5 gap-2 mt-6 pt-5 border-t border-white/20">
          {[
            { num: 1, label: '1. Consultar CPF' },
            { num: 2, label: '2. Dados do Atleta' },
            { num: 3, label: '3. Conferir Vínculo' },
            { num: 4, label: '4. Pagamento Asaas' },
            { num: 5, label: '5. Emitir Protocolo' },
          ].map((st) => {
            const isDone = currentStep > st.num;
            const isCurrent = currentStep === st.num;
            return (
              <div key={st.num} className="text-center">
                <div
                  className={`h-1.5 rounded-full mb-2 transition-all ${
                    isDone ? 'bg-emerald-400' : isCurrent ? 'bg-white' : 'bg-white/30'
                  }`}
                />
                <span
                  className={`text-[10px] md:text-xs font-bold block truncate ${
                    isCurrent ? 'text-white' : isDone ? 'text-emerald-200' : 'text-white/60'
                  }`}
                >
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          ETAPA 1: CONSULTAR CPF
          ========================================================================= */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase tracking-wider mb-1">
              <span>Etapa 1 de 5</span>
            </div>
            <h3 className="text-lg font-black text-slate-900">
              Consulta de CPF e Verificação de Inscrição Existente
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Informe o CPF do atleta para verificar se já existe inscrição registrada no sistema e evitar duplicidade de cobrança ou reservas.
            </p>
          </div>

          <form onSubmit={handleSearchCpf} className="max-w-xl space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                CPF do Atleta <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={cpfSearch}
                  onChange={(e) => {
                    setCpfSearch(formatCPF(e.target.value));
                    setExistingReg(null);
                    setCpfVerified(false);
                    setSearchError(null);
                  }}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  disabled={isSearchingCpf}
                  className="px-5 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                >
                  {isSearchingCpf ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span>Consultar CPF</span>
                </button>
              </div>
            </div>

            {searchError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <span>{searchError}</span>
              </div>
            )}
          </form>

          {/* Resultado: Inscrição Já Existente */}
          {existingReg && (
            <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-sm text-amber-950">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span>Inscrição Já Encontrada Para Este CPF</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    existingReg.status === 'CONFIRMED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : existingReg.status === 'RESERVED'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {existingReg.status === 'CONFIRMED'
                    ? 'Confirmada / Paga'
                    : existingReg.status === 'RESERVED'
                    ? 'Pendente de Pagamento'
                    : existingReg.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/80 p-3.5 rounded-xl border border-amber-200 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 block">Protocolo</span>
                  <strong className="font-mono text-slate-900">{existingReg.protocol}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Atleta</span>
                  <strong className="text-slate-900">{existingReg.athlete?.fullName}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Categoria</span>
                  <strong className="text-slate-900">{existingReg.category.replace('_', ' ')}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Canal</span>
                  <strong className="text-slate-900">
                    {existingReg.channel === 'PRESENCIAL_PREFEITURA' ? 'Presencial — Prefeitura' : 'Online'}
                  </strong>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                {existingReg.status === 'CONFIRMED' ? (
                  <button
                    onClick={() => handleResumeExisting(existingReg)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Visualizar Comprovante / Protocolo</span>
                  </button>
                ) : existingReg.status === 'RESERVED' ? (
                  <button
                    onClick={() => handleResumeExisting(existingReg)}
                    className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Retomar Cobrança e Emitir Protocolo</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartNewWithCpf}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                  >
                    <span>Iniciar Nova Inscrição</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Resultado: CPF Disponível para Novo Cadastro */}
          {cpfVerified && !existingReg && (
            <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>Nenhuma inscrição encontrada para o CPF {cpfSearch}</span>
              </div>
              <p className="text-xs text-emerald-800">
                O atleta está apto para iniciar o atendimento presencial da categoria Casa na sede da Prefeitura.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleStartNewWithCpf}
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm shadow-emerald-600/20"
                >
                  <span>Avançar para Cadastro dos Dados (Etapa 2)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          ETAPA 2: CADASTRAR OU CONFERIR OS DADOS
          ========================================================================= */}
      {currentStep === 2 && (
        <form onSubmit={handleValidateStage2} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <div className="text-orange-600 font-bold text-xs uppercase tracking-wider mb-1">
                Etapa 2 de 5
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Dados Cadastrais do Atleta
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Preencha os dados do participante. Os campos serão utilizados para a emissão do número de peito, seguro do atleta e apuração oficial.
              </p>
            </div>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-extrabold border border-orange-200">
              Categoria Casa — Lajespintadense
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Nome Completo */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nome Completo do Atleta <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Ex: Maria da Silva Souza"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs md:text-sm font-medium ${
                  stage2Errors.fullName ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                } focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500`}
              />
              {stage2Errors.fullName && (
                <p className="text-[11px] text-red-600 mt-1">{stage2Errors.fullName}</p>
              )}
            </div>

            {/* CPF */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                CPF (Validado na Etapa 1)
              </label>
              <input
                type="text"
                value={formData.cpf}
                readOnly
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs md:text-sm font-mono font-bold text-slate-700 cursor-not-allowed"
              />
            </div>

            {/* Data de Nascimento */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Data de Nascimento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs md:text-sm font-medium ${
                  stage2Errors.birthDate ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                } focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500`}
              />
              {stage2Errors.birthDate && (
                <p className="text-[11px] text-red-600 mt-1">{stage2Errors.birthDate}</p>
              )}
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                E-mail do Atleta <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="atleta@exemplo.com"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs md:text-sm font-medium ${
                  stage2Errors.email ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                } focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500`}
              />
              {stage2Errors.email && (
                <p className="text-[11px] text-red-600 mt-1">{stage2Errors.email}</p>
              )}
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                WhatsApp com DDD <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: maskPhone(e.target.value) })}
                placeholder="(84) 99999-9999"
                maxLength={15}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs md:text-sm font-medium ${
                  stage2Errors.phone ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                } focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500`}
              />
              {stage2Errors.phone && (
                <p className="text-[11px] text-red-600 mt-1">{stage2Errors.phone}</p>
              )}
            </div>

            {/* Cidade */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Cidade <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* UF */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                UF <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.state}
                maxLength={2}
                onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Equipe / Assessoria */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Equipe / Assessoria Esportiva
              </label>
              <input
                type="text"
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                placeholder="Opcional"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Seleção do Sexo / Categoria Casa */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Modalidade por Sexo / Gênero <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              {(['MASCULINO', 'FEMININO'] as AthleteGender[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: g })}
                  className={`py-3 px-4 rounded-xl border-2 text-center font-bold text-xs md:text-sm transition-all ${
                    formData.gender === g
                      ? 'border-orange-500 bg-orange-50 text-orange-800 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {g === 'MASCULINO' ? 'Casa Masculino (5 km)' : 'Casa Feminino (5 km)'}
                </button>
              ))}
            </div>
          </div>

          {/* Tamanho da Camisa (Estoque Compartilhado Oficial) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Tamanho da Camisa Oficial do Kit (Estoque Compartilhado) <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-orange-600 font-bold">Cor Única Oficial: Laranja Dry-Fit</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {inventory.map((item) => {
                const isAvailable = item.availableStock > 0;
                const isSelected = formData.shirtSize === item.size;

                return (
                  <button
                    key={item.size}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => setFormData({ ...formData, shirtSize: item.size })}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      !isAvailable
                        ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                        : isSelected
                        ? 'border-orange-500 bg-orange-500 text-white font-extrabold shadow-sm'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-orange-400'
                    }`}
                  >
                    <div className="font-display text-base uppercase">{item.size}</div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-white' : isAvailable ? 'text-emerald-600 font-bold' : 'text-red-500'}`}>
                      {isAvailable ? `${item.availableStock} disp.` : 'Esgotado'}
                    </div>
                  </button>
                );
              })}
            </div>
            {stage2Errors.shirtSize && (
              <p className="text-[11px] text-red-600 mt-1">{stage2Errors.shirtSize}</p>
            )}
          </div>

          {/* Aceite Presencial do Atleta aos Termos */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.athleteConsentGiven}
                onChange={(e) => setFormData({ ...formData, athleteConsentGiven: e.target.checked })}
                className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 rounded border-slate-300"
              />
              <span className="text-xs text-slate-700 leading-relaxed">
                <strong>Declaração de Consentimento do Atleta:</strong> O atleta confirmou presencialmente no ato do atendimento que está ciente e de pleno acordo com todas as regras do Regulamento Oficial da 5ª Corrida de Emancipação Política e com a Política de Privacidade. O atendimento por servidor não dispensa a anuência do participante.
              </span>
            </label>
            {stage2Errors.athleteConsentGiven && (
              <p className="text-[11px] text-red-600 font-bold ml-7">
                {stage2Errors.athleteConsentGiven}
              </p>
            )}
          </div>

          {/* Navegação da Etapa 2 */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 flex items-center gap-1.5 transition"
            >
              <ArrowLeft size={16} />
              <span>Voltar à Consulta</span>
            </button>

            <button
              type="submit"
              className="py-3 px-6 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-600/20 transition flex items-center gap-2"
            >
              <span>Avançar para Conferência de Vínculo (Etapa 3)</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          ETAPA 3: CONFERIR O VÍNCULO (CATEGORIA CASA)
          ========================================================================= */}
      {currentStep === 3 && (
        <form onSubmit={handleValidateStage3} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="text-orange-600 font-bold text-xs uppercase tracking-wider mb-1">
              Etapa 3 de 5
            </div>
            <h3 className="text-lg font-black text-slate-900">
              Conferência Presencial do Vínculo Regimental — Categoria Casa
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Conforme regulamento oficial da prova, atletas da Categoria Casa devem comprovar naturalidade ou residência no município de Lajes Pintadas/RN.
            </p>
          </div>

          {stage3Error && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <span>{stage3Error}</span>
            </div>
          )}

          {/* Critérios Aprovados no Regulamento */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Critério de Enquadramento Aprovado <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {[
                {
                  value: 'NATURAL_E_RESIDENTE',
                  title: 'Natural e Residente no Município',
                  desc: 'Atleta nascido em Lajes Pintadas/RN e com domicílio fixo no município.',
                },
                {
                  value: 'RESIDENTE',
                  title: 'Residente no Município (Morador Atual)',
                  desc: 'Atleta que reside atualmente em Lajes Pintadas/RN, comprovado por comprovante idôneo.',
                },
                {
                  value: 'NATURAL',
                  title: 'Natural de Lajes Pintadas (Reside em Outro Município)',
                  desc: 'Atleta nascido em Lajes Pintadas/RN com certidão ou RG atestando a naturalidade.',
                },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    casaProofType === opt.value
                      ? 'border-orange-500 bg-orange-50/50 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="casaProofType"
                    value={opt.value}
                    checked={casaProofType === opt.value}
                    onChange={() => setCasaProofType(opt.value as CasaProofType)}
                    className="mt-1 text-orange-600 focus:ring-orange-500"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900">{opt.title}</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Tipo de Documento Apresentado */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Tipo de Documento Apresentado no Balcão <span className="text-red-500">*</span>
            </label>
            <select
              value={documentTypePresented}
              onChange={(e) => setDocumentTypePresented(e.target.value)}
              className="w-full max-w-lg px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="Documento de Identidade (RG) com naturalidade">Documento de Identidade (RG) com naturalidade</option>
              <option value="Certidão de Nascimento">Certidão de Nascimento</option>
              <option value="Comprovante de Residência (Água / Luz / IPTU)">Comprovante de Residência (Água / Luz / IPTU)</option>
              <option value="Título de Eleitor (Zona de Lajes Pintadas/RN)">Título de Eleitor (Zona de Lajes Pintadas/RN)</option>
              <option value="Declaração de Residência com Comprovação">Declaração de Residência com Comprovação</option>
              <option value="OUTRO">Outro documento oficial...</option>
            </select>

            {documentTypePresented === 'OUTRO' && (
              <input
                type="text"
                value={customDocType}
                onChange={(e) => setCustomDocType(e.target.value)}
                placeholder="Especifique o documento apresentado..."
                className="w-full max-w-lg mt-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            )}
          </div>

          {/* Decisão do Atendente */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Resultado da Conferência Documental <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
              <label
                className={`p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  verificationDecision === 'APROVADO'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="decision"
                  checked={verificationDecision === 'APROVADO'}
                  onChange={() => setVerificationDecision('APROVADO')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-bold text-xs text-emerald-900 block flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Conferido e Aprovado
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Documentação idônea atestou o vínculo. Habilita a geração da cobrança oficial.
                  </p>
                </div>
              </label>

              <label
                className={`p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  verificationDecision === 'PENDENTE_COMPLEMENTACAO'
                    ? 'border-amber-500 bg-amber-50/50 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="decision"
                  checked={verificationDecision === 'PENDENTE_COMPLEMENTACAO'}
                  onChange={() => setVerificationDecision('PENDENTE_COMPLEMENTACAO')}
                  className="mt-1 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <span className="font-bold text-xs text-amber-900 block flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Pendente de Complementação
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    O atleta precisa apresentar comprovação adicional antes de gerar o pagamento.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Observações da Conferência */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Observações Objetivas do Atendimento (Restritas à Equipe)
            </label>
            <textarea
              rows={2}
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              placeholder="Ex: Apresentado RG original emitido pelo ITEP/RN comprovando naturalidade em Lajes Pintadas/RN."
              className="w-full max-w-xl px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Registro auditável: Servidor <strong>{currentUser}</strong> em {formatDateTimeBR(new Date().toISOString())}.
            </p>
          </div>

          {/* Navegação da Etapa 3 */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 flex items-center gap-1.5 transition"
            >
              <ArrowLeft size={16} />
              <span>Voltar aos Dados</span>
            </button>

            <button
              type="submit"
              disabled={verificationDecision !== 'APROVADO'}
              className="py-3 px-6 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-600/20 transition flex items-center gap-2"
            >
              <span>Avançar para Pagamento Asaas (Etapa 4)</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          ETAPA 4: GERAR O PAGAMENTO ASAAS
          ========================================================================= */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="text-orange-600 font-bold text-xs uppercase tracking-wider mb-1">
              Etapa 4 de 5
            </div>
            <h3 className="text-lg font-black text-slate-900">
              Pagamento da Inscrição Presencial via Asaas
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              O vínculo Casa foi validado. Gere a cobrança oficial no Asaas (Pix ou Cartão). O atleta efetua o pagamento diretamente no próprio celular.
            </p>
          </div>

          {/* Resumo Financeiro da Inscrição */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-xl space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Demonstrativo de Valores
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Inscrição Oficial 5ª Edição:</span>
                <span className="font-bold text-slate-800">R$ 60,00</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa de processamento de serviço (10%):</span>
                <span className="font-bold text-slate-800">
                  {formatCentsToBRL(activePricing.feeCents)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-extrabold text-slate-900">
                <span>Total a Pagar pelo Atleta:</span>
                <span className="text-orange-600 text-base">
                  {formatCentsToBRL(activePricing.totalAmountCents)}
                </span>
              </div>
            </div>
          </div>

          {/* Se a cobrança ainda NÃO foi gerada, seleciona a forma e clica em Gerar */}
          {!createdRegistration && (
            <div className="space-y-5 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Forma de Pagamento Escolhida pelo Atleta
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PIX')}
                    className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${
                      paymentMethod === 'PIX'
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${paymentMethod === 'PIX' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <QrCode size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Pix Instantâneo</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">QR Code na tela / Copia e Cola</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CREDIT_CARD')}
                    className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${
                      paymentMethod === 'CREDIT_CARD'
                        ? 'border-sky-500 bg-sky-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${paymentMethod === 'CREDIT_CARD' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Cartão de Crédito</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">1x À vista (Link no celular)</div>
                    </div>
                  </button>
                </div>
              </div>

              {paymentError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <span>{paymentError}</span>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                <strong>Regra de Segurança Financeira:</strong> O servidor público não deve solicitar, digitar ou anotar dados do cartão do atleta. Toda a transação é processada pelo Asaas diretamente no dispositivo do pagador.
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 flex items-center gap-1.5 transition"
                >
                  <ArrowLeft size={16} />
                  <span>Voltar à Conferência</span>
                </button>

                <button
                  type="button"
                  disabled={isGeneratingPayment}
                  onClick={handleGeneratePayment}
                  className="py-3 px-6 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-60 shadow-md shadow-orange-600/20 transition flex items-center gap-2"
                >
                  {isGeneratingPayment ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span>Confirmar e Gerar Cobrança Asaas</span>
                </button>
              </div>
            </div>
          )}

          {/* Se a cobrança JÁ FOI GERADA com sucesso */}
          {createdRegistration && (
            <div className="space-y-6 max-w-2xl animate-in fade-in">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider block">
                    Protocolo Gerado
                  </span>
                  <span className="text-lg font-mono font-black text-emerald-950">
                    {createdRegistration.protocol}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">Status Financeiro</span>
                  <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                    createdRegistration.status === 'CONFIRMED' ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {createdRegistration.status === 'CONFIRMED' ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Confirmado e Quitado</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Aguardando Pagamento</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Exibição do Pix QR Code */}
              {createdRegistration.paymentMethod === 'PIX' && (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                    <QrCode size={16} />
                    <span>Aponte a câmera do celular para pagar via Pix</span>
                  </div>

                  {(createdRegistration.asaasPixQrCode || createdRegistration.pixQrCodeUrl) ? (
                    <div className="flex justify-center my-3">
                      <img
                        src={(createdRegistration.asaasPixQrCode || createdRegistration.pixQrCodeUrl)!}
                        alt="QR Code Pix Asaas"
                        className="w-48 h-48 rounded-xl border border-slate-300 p-2 bg-white shadow-sm"
                      />
                    </div>
                  ) : (createdRegistration.asaasPixCopyPaste || createdRegistration.pixPayload) ? (
                    <div className="flex justify-center my-3">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                          (createdRegistration.asaasPixCopyPaste || createdRegistration.pixPayload)!
                        )}`}
                        alt="QR Code Pix"
                        className="w-48 h-48 rounded-xl border border-slate-300 p-2 bg-white shadow-sm"
                      />
                    </div>
                  ) : null}

                  {(createdRegistration.asaasPixCopyPaste || createdRegistration.pixPayload) && (
                    <div className="max-w-md mx-auto space-y-2">
                      <div className="text-xs font-bold text-slate-700 text-left">
                        Pix Copia e Cola:
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={(createdRegistration.asaasPixCopyPaste || createdRegistration.pixPayload)!}
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-600 truncate"
                        />
                        <button
                          onClick={copyPixCode}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition"
                        >
                          {copiedPix ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Exibição para Cartão de Crédito */}
              {createdRegistration.paymentMethod === 'CREDIT_CARD' && (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-xs font-bold">
                    <CreditCard size={16} />
                    <span>Checkout Seguro do Atleta (1x Cartão de Crédito)</span>
                  </div>

                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Solicite que o atleta acesse o link de pagamento seguro do Asaas no próprio aparelho celular para preencher os dados do cartão:
                  </p>

                  {createdRegistration.asaasInvoiceUrl && (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      <a
                        href={createdRegistration.asaasInvoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                      >
                        <ExternalLink size={16} />
                        <span>Abrir Link da Fatura Asaas</span>
                      </a>
                      <button
                        onClick={copyPaymentUrl}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition flex items-center gap-1.5"
                      >
                        {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link para o Atleta'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Verificação do Status do Pagamento em Tempo Real */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-slate-100 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Conferir Compensação Financeira no Asaas
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Clique para verificar se o atleta já realizou o pagamento pelo banco.
                  </span>
                  {paymentCheckMessage && (
                    <p className="text-xs font-bold text-orange-600 mt-1">{paymentCheckMessage}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCheckPaymentStatus}
                    disabled={isCheckingPayment}
                    className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingPayment ? 'animate-spin' : ''}`} />
                    <span>Verificar no Asaas</span>
                  </button>

                  <button
                    onClick={() => setCurrentStep(5)}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Emitir Protocolo (Etapa 5)</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          ETAPA 5: EMITIR O PROTOCOLO / COMPROVANTE DE ATENDIMENTO
          ========================================================================= */}
      {currentStep === 5 && (
        <div className="space-y-6">
          {/* Ações de Impressão e Reinício */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-600">
              Comprovante oficial pronto para impressão ou entrega ao atleta.
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={handlePrintReceipt}
                className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
              >
                <Printer size={16} />
                <span>Imprimir Comprovante de Atendimento</span>
              </button>
              <button
                onClick={handleResetWorkflow}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition flex items-center gap-2"
              >
                <RotateCcw size={16} />
                <span>Novo Atendimento Presencial</span>
              </button>
            </div>
          </div>

          {/* DOCUMENTO DO COMPROVANTE (PRINT FRIENDLY) */}
          <div
            id="comprovante-atendimento-presencial"
            className="bg-white rounded-3xl border-2 border-slate-300 shadow-md p-8 max-w-3xl mx-auto space-y-6 print:border-none print:shadow-none print:p-0"
          >
            {/* Cabeçalho Oficial do Comprovante */}
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-5">
              <div className="flex items-center gap-4">
                <img
                  src="/assets/brasao_lajes.png"
                  alt="Brasão Lajes Pintadas"
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                    ESTADO DO RIO GRANDE DO NORTE
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase">
                    PREFEITURA MUNICIPAL DE LAJES PINTADAS
                  </h3>
                  <div className="text-xs font-extrabold text-orange-600">
                    5ª Corrida de Emancipação Política — 26/12/2026
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Protocolo</span>
                <span className="text-lg font-mono font-black text-slate-900">
                  {createdRegistration?.protocol || 'LP26-0000'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {formatDateTimeBR(createdRegistration?.createdAt || new Date().toISOString())}
                </span>
              </div>
            </div>

            {/* Título do Documento */}
            <div className="text-center bg-slate-50 p-3 rounded-xl border border-slate-200">
              <h4 className="font-black text-slate-900 uppercase text-xs md:text-sm tracking-wide">
                COMPROVANTE OFICIAL DE ATENDIMENTO PRESENCIAL — CATEGORIA CASA
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Emitido pela equipe autorizada na sede da Prefeitura Municipal de Lajes Pintadas/RN
              </p>
            </div>

            {/* Quadro de Identificação do Atleta */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs border border-slate-200 p-4 rounded-xl bg-white">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Nome do Atleta</span>
                <strong className="text-slate-900 font-bold block text-sm">
                  {createdRegistration?.athlete?.fullName || formData.fullName}
                </strong>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">CPF (Protegido)</span>
                <strong className="text-slate-900 font-mono font-bold block text-sm">
                  {maskCPF(createdRegistration?.athlete?.cpf || formData.cpf)}
                </strong>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Data Nasc.</span>
                <strong className="text-slate-900 block">
                  {formatDateBR(createdRegistration?.athlete?.birthDate || formData.birthDate)}
                </strong>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Categoria</span>
                <strong className="text-slate-900 block font-bold">
                  Casa — Lajespintadense (
                  {(createdRegistration?.gender || formData.gender) === 'FEMININO' ? 'Feminino' : 'Masculino'})
                </strong>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Camisa Oficial</span>
                <strong className="text-slate-900 block">
                  Tamanho {createdRegistration?.shirtSize || formData.shirtSize} (Laranja Dry-Fit)
                </strong>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Canal de Inscrição</span>
                <strong className="text-orange-700 block font-bold">
                  Presencial — Prefeitura
                </strong>
              </div>
            </div>

            {/* Quadro de Conferência Documental do Vínculo */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
              <div className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">
                Enquadramento e Conferência Documental do Vínculo
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block">Critério Regimental:</span>
                  <span className="font-bold text-slate-800">
                    {casaProofType === 'NATURAL_E_RESIDENTE'
                      ? 'Natural e Residente'
                      : casaProofType === 'RESIDENTE'
                      ? 'Morador Atual'
                      : 'Natural de Lajes Pintadas'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Documento Apresentado:</span>
                  <span className="font-bold text-slate-800">
                    {createdRegistration?.documentTypePresented || documentTypePresented}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Servidor Responsável:</span>
                  <span className="font-bold text-slate-800">{currentUser}</span>
                </div>
              </div>
            </div>

            {/* Quadro Financeiro e Status Real */}
            <div className="p-4 rounded-xl border-2 border-slate-300 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-bold uppercase">Valor da Inscrição:</span>
                <span className="font-mono font-black text-slate-900 text-sm">
                  {formatCentsToBRL(createdRegistration?.totalAmountCents || activePricing.totalAmountCents)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Situação Financeira do Registro:
                </span>
                {createdRegistration?.status === 'CONFIRMED' ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-950 font-bold text-xs flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Inscrição confirmada e quitada com sucesso.</span>
                  </div>
                ) : (
                  <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-xl text-amber-950 text-xs space-y-1">
                    <div className="font-black text-amber-900 flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Cadastro realizado. Inscrição aguardando confirmação do pagamento.</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed pt-1">
                      * Este documento atesta a realização do atendimento e a aprovação presencial do vínculo regimental. A vaga oficial e a garantia do kit atleta estão condicionadas à compensação bancária da cobrança emitida via Asaas.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Acompanhamento Online para o Atleta */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-1 text-xs">
              <span className="font-bold text-slate-800 block">
                Acompanhamento da Inscrição e Retirada do Kit
              </span>
              <p className="text-[11px] text-slate-500">
                O atleta pode consultar o status de sua inscrição a qualquer momento no site oficial:{' '}
                <strong>https://corrida-lajes-pintadas-rn.vercel.app</strong> informando seu CPF e o número de protocolo.
              </p>
            </div>

            {/* Assinaturas */}
            <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs text-slate-600">
              <div className="border-t border-slate-400 pt-2">
                <span className="block font-bold text-slate-800">{currentUser}</span>
                <span className="text-[10px] text-slate-500 block">Servidor Autorizado / Prefeitura de Lajes Pintadas</span>
              </div>
              <div className="border-t border-slate-400 pt-2">
                <span className="block font-bold text-slate-800">
                  {createdRegistration?.athlete?.fullName || formData.fullName}
                </span>
                <span className="text-[10px] text-slate-500 block">Assinatura do Atleta Participante</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
