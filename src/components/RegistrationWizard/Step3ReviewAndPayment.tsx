import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  Lock,
  ArrowLeft,
  ExternalLink,
  QrCode,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  Printer,
  Shield,
  HelpCircle,
  Wifi,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Step1Data } from './Step1AthleteData';
import { Step2Data } from './Step2CategoryAndShirt';
import { EventSettings, Registration, Category, PaymentMethod, CreditCardData } from '../../types';
import { calculatePricing, formatCentsToBRL } from '../../lib/pricing';
import { formatDateBR, formatDateTimeBR, formatCPF, maskPhone } from '../../lib/masks';
import {
  detectCardBrand,
  maskCardNumber,
  maskExpiry,
  maskCVV,
  validateCardNumber,
  validateExpiry,
  CardBrand,
} from '../../lib/creditCard';
import { isValidCPF } from '../../lib/cpf';

interface Step3ReviewAndPaymentProps {
  step1: Step1Data;
  step2: Step2Data;
  settings: EventSettings;
  onBack: () => void;
  onSubmit: (params: {
    termsAccepted: boolean;
    privacyAccepted: boolean;
    paymentMethod: PaymentMethod;
    creditCard?: CreditCardData;
  }) => Promise<{
    registration: Registration;
    accessCode: string;
  }>;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
  onFinish: () => void;
  onChangePaymentMethod?: (method: PaymentMethod) => void;
}

export const Step3ReviewAndPayment: React.FC<Step3ReviewAndPaymentProps> = ({
  step1,
  step2,
  settings,
  onBack,
  onSubmit,
  onOpenTerms,
  onOpenPrivacy,
  onFinish,
  onChangePaymentMethod,
}) => {
  // Forma de pagamento selecionada (permite alternar ou manter a do Step 2)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(step2.paymentMethod || 'CREDIT_CARD');

  // Termos obrigatórios
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Campos do Cartão de Crédito
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState(step1.fullName.toUpperCase());
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [isSameHolder, setIsSameHolder] = useState(true);
  const [holderCpf, setHolderCpf] = useState(step1.cpf);
  const [holderPhone, setHolderPhone] = useState(step1.phone);
  const [postalCode, setPostalCode] = useState('59250-000');
  const [addressNumber, setAddressNumber] = useState('S/N');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [activeCardField, setActiveCardField] = useState<'number' | 'name' | 'expiry' | 'cvv' | null>(null);

  // Estado do sucesso
  const [successResult, setSuccessResult] = useState<{
    registration: Registration;
    accessCode: string;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  // Calcular Categoria Oficial
  const computedCategory: Category =
    step2.originType === 'CASA'
      ? step2.gender === 'MASCULINO'
        ? 'CASA_MASCULINO'
        : 'CASA_FEMININO'
      : step2.gender === 'MASCULINO'
      ? 'VISITANTE_MASCULINO'
      : 'VISITANTE_FEMININO';

  const categoryName =
    ({
      CASA_MASCULINO: 'Local Masculino (5 km)',
      CASA_FEMININO: 'Local Feminino (5 km)',
      LOCAL_MASCULINO: 'Local Masculino (5 km)',
      LOCAL_FEMININO: 'Local Feminino (5 km)',
      VISITANTE_MASCULINO: 'Visitante Masculino (5 km)',
      VISITANTE_FEMININO: 'Visitante Feminino (5 km)',
    } as Record<string, string>)[computedCategory] || 'Visitante Masculino (5 km)';

  const pricing = calculatePricing(paymentMethod, {
    basePriceCents: settings.basePriceCents,
    pixFixedFeeCents: settings.asaasPixFixedFeeCents,
    creditFixedFeeCents: settings.asaasCreditFixedFeeCents,
    creditPercentFee: settings.asaasCreditPercentFee,
  });

  const cardBrand = detectCardBrand(cardNumber);

  // Atualizar forma de pagamento
  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setError(null);
    setFieldErrors({});
    if (onChangePaymentMethod) {
      onChangePaymentMethod(method);
    }
  };

  // Formatação do número do cartão
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = maskCardNumber(e.target.value);
    setCardNumber(formatted);
    if (fieldErrors.cardNumber) {
      setFieldErrors((prev) => ({ ...prev, cardNumber: '' }));
    }
  };

  // Formatação da validade
  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = maskExpiry(e.target.value);
    setCardExpiry(formatted);
    if (fieldErrors.cardExpiry) {
      setFieldErrors((prev) => ({ ...prev, cardExpiry: '' }));
    }
  };

  // Formatação do CVV
  const handleCardCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = maskCVV(e.target.value, cardBrand);
    setCardCVV(formatted);
    if (fieldErrors.cardCVV) {
      setFieldErrors((prev) => ({ ...prev, cardCVV: '' }));
    }
  };

  // Submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const errors: Record<string, string> = {};

    if (!termsAccepted || !privacyAccepted) {
      setError('É obrigatório aceitar o regulamento oficial e a política de privacidade para concluir.');
      return;
    }

    // Se for Cartão de Crédito, validar campos
    if (paymentMethod === 'CREDIT_CARD') {
      const cleanNum = cardNumber.replace(/\D/g, '');
      if (cleanNum.length < 13 || cleanNum.length > 19) {
        errors.cardNumber = 'Informe um número de cartão válido com 16 dígitos.';
      } else if (!validateCardNumber(cleanNum)) {
        errors.cardNumber = 'Número de cartão inválido. Verifique os dígitos.';
      }

      if (!cardHolderName.trim() || cardHolderName.trim().length < 3) {
        errors.cardHolderName = 'Informe o nome impresso no cartão completo.';
      }

      const expiryParts = cardExpiry.split('/');
      if (expiryParts.length !== 2 || !validateExpiry(expiryParts[0], expiryParts[1])) {
        errors.cardExpiry = 'Validade inválida ou expirada (MM/AA).';
      }

      if (!cardCVV || cardCVV.length < 3) {
        errors.cardCVV = 'CVV deve ter pelo menos 3 dígitos.';
      }

      const cleanHolderCpf = (isSameHolder ? step1.cpf : holderCpf).replace(/\D/g, '');
      if (!isValidCPF(cleanHolderCpf)) {
        errors.holderCpf = 'CPF do titular inválido.';
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setError('Por favor, corrija os dados do cartão destacados abaixo para prosseguir.');
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const expiryParts = cardExpiry.split('/');
      const creditCardPayload: CreditCardData | undefined =
        paymentMethod === 'CREDIT_CARD'
          ? {
              holderName: cardHolderName.trim().toUpperCase(),
              number: cardNumber.replace(/\D/g, ''),
              expiryMonth: expiryParts[0].padStart(2, '0'),
              expiryYear: expiryParts[1].length === 2 ? `20${expiryParts[1]}` : expiryParts[1],
              ccv: cardCVV.trim(),
              holderCpf: (isSameHolder ? step1.cpf : holderCpf).replace(/\D/g, ''),
              holderPhone: (isSameHolder ? step1.phone : holderPhone).replace(/\D/g, ''),
              postalCode: postalCode.replace(/\D/g, '') || '59250000',
              addressNumber: addressNumber || 'S/N',
            }
          : undefined;

      const res = await onSubmit({
        termsAccepted,
        privacyAccepted,
        paymentMethod,
        creditCard: creditCardPayload,
      });

      setSuccessResult(res);

      // Disparar confetes esportivos de vitória
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F25807', '#0491D2', '#10B981', '#FFB703'],
        });
      } catch (cErr) {
        console.warn('Confetti error:', cErr);
      }
    } catch (err: any) {
      setError(
        err.message || 'Erro ao processar cobrança no cartão. Verifique os dados digitados ou tente outro meio.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // TELA DE SUCESSO DEFINITIVO (PAGAMENTO APROVADO - SEM NENHUMA RESERVA PENDENTE)
  // ============================================================================
  if (successResult) {
    const reg = successResult.registration;
    const isCreditCardApproved = reg.paymentMethod === 'CREDIT_CARD' || reg.status === 'CONFIRMED';
    const cardLastDigits =
      reg.creditCardLastDigits || (cardNumber ? cardNumber.replace(/\D/g, '').slice(-4) : '••••');

    return (
      <div className="space-y-6 text-center py-2 animate-fadeIn">
        {/* Ícone e Header de Confirmação */}
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md ring-8 ring-emerald-50">
          <CheckCircle2 size={44} className="stroke-[2.5]" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
            <Check size={14} className="stroke-[3]" />
            {isCreditCardApproved
              ? 'Pagamento Confirmado • Inscrição Homologada'
              : 'Código Pix Gerado com Sucesso'}
          </span>
          <h3 className="font-display font-black text-2xl sm:text-3xl text-slate-900 uppercase mt-2">
            Inscrição Confirmada com Sucesso!
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm mt-1.5 max-w-lg mx-auto leading-relaxed">
            Parabéns, <strong>{step1.fullName}</strong>!{' '}
            {isCreditCardApproved ? (
              <>
                Sua cobrança de <strong>{formatCentsToBRL(reg.totalAmountCents)}</strong> foi{' '}
                <strong className="text-emerald-700">aprovada imediatamente no cartão de crédito</strong>.
                Sua vaga oficial e a camisa tamanho <strong>{reg.shirtSize}</strong> estão 100% garantidas.
              </>
            ) : (
              <>
                Sua inscrição foi registrada. Conclua o pagamento via Pix abaixo para validar sua participação oficial.
              </>
            )}
          </p>
        </div>

        {/* Card do Protocolo e Código de Acesso */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white text-left space-y-4 shadow-xl border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                Protocolo Oficial do Atleta
              </span>
              <div className="font-mono font-black text-xl text-orange-400 tracking-wide mt-0.5">
                {reg.protocol}
              </div>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                Código de Acesso Seguro
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono font-black text-lg text-emerald-400 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                  {successResult.accessCode}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(successResult.accessCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2500);
                  }}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Copiar código de acesso"
                >
                  {copiedCode ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Comprovante de Pagamento do Cartão */}
          {isCreditCardApproved ? (
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2.5 text-xs text-slate-200">
              <div className="flex justify-between items-center text-slate-400 pb-1.5 border-b border-slate-700/60 font-semibold uppercase text-[11px]">
                <span>Comprovante de Transação</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  Transação Aprovada
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Forma de Pagamento:</span>
                <span className="font-bold text-white">Cartão de Crédito (1x à vista)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cartão Utilizado:</span>
                <span className="font-mono font-bold text-white">
                  {cardBrand.toUpperCase()} •••• {cardLastDigits}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Valor Total Pago:</span>
                <span className="font-extrabold text-orange-400 text-sm">
                  {formatCentsToBRL(reg.totalAmountCents)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Categoria Oficial:</span>
                <span className="font-bold text-white">{categoryName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kit Oficial:</span>
                <span className="font-bold text-white">Camisa Laranja Dry-Fit • Tam. {reg.shirtSize}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-700/60 text-[11px]">
                <span className="text-slate-400">Data e Hora:</span>
                <span className="text-slate-300">{formatDateTimeBR(reg.paidAt || new Date().toISOString())}</span>
              </div>
            </div>
          ) : (
            /* Fluxo Pix Instantâneo (se o atleta tiver escolhido Pix) */
            reg.paymentMethod === 'PIX' && (
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Pix Copia e Cola:</span>
                  <span className="text-orange-400 font-bold">{formatCentsToBRL(reg.totalAmountCents)}</span>
                </div>
                {reg.asaasPixCopyPaste && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={reg.asaasPixCopyPaste}
                      className="w-full text-xs font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-700 text-slate-300 truncate"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(reg.asaasPixCopyPaste!);
                        setCopiedPix(true);
                        setTimeout(() => setCopiedPix(false), 2500);
                      }}
                      className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 flex items-center gap-1.5"
                    >
                      {copiedPix ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                )}
              </div>
            )
          )}

          <div className="flex items-center gap-2.5 text-xs text-amber-200 bg-amber-950/50 p-3 rounded-xl border border-amber-800/50">
            <Shield size={18} className="shrink-0 text-amber-400" />
            <span>
              <strong>Guarde seu Protocolo e Código de Acesso:</strong> Eles serão solicitados para retirar o Kit Oficial no Centro de Convivência dos Idosos e para emitir segunda via do comprovante.
            </span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Printer size={16} />
            <span>Imprimir Comprovante de Inscrição</span>
          </button>

          <button
            type="button"
            onClick={onFinish}
            className="w-full py-3.5 px-6 rounded-xl font-extrabold text-sm text-white bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Concluir e Voltar ao Início</span>
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // TELA DE REVISÃO E COBRANÇA AUTOMÁTICA NO CARTÃO
  // ============================================================================
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 animate-shake">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <span className="leading-relaxed font-medium">{error}</span>
        </div>
      )}

      {/* Resumo Rápido do Atleta */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Atleta Inscrito</span>
            <div className="font-bold text-slate-900 text-sm sm:text-base">{step1.fullName}</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CPF</span>
            <div className="font-mono text-xs font-semibold text-slate-700">{formatCPF(step1.cpf)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-700">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium uppercase">Categoria:</span>
            <span className="font-bold text-orange-600">{categoryName}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium uppercase">Camisa Oficial:</span>
            <span className="font-bold text-slate-900">Laranja • Tam. {step2.shirtSize}</span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 block font-medium uppercase">Contato:</span>
            <span className="font-semibold text-slate-800">{step1.phone}</span>
          </div>
        </div>
      </div>

      {/* Seletor de Forma de Pagamento */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Selecione a Forma de Pagamento <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {/* Opção Cartão de Crédito */}
          <button
            type="button"
            onClick={() => handlePaymentMethodChange('CREDIT_CARD')}
            className={`p-3.5 rounded-xl border-2 text-left transition-all flex items-center gap-3 cursor-pointer ${
              paymentMethod === 'CREDIT_CARD'
                ? 'border-orange-500 bg-orange-50/60 shadow-sm ring-2 ring-orange-200'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div
              className={`p-2 rounded-lg shrink-0 ${
                paymentMethod === 'CREDIT_CARD' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <CreditCard size={20} />
            </div>
            <div>
              <div className="font-display font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                <span>Cartão de Crédito</span>
              </div>
              <span className="text-[10px] font-bold text-orange-600 bg-orange-100/80 px-1.5 py-0.5 rounded">
                Cobrança Automática 1x
              </span>
            </div>
          </button>

          {/* Opção Pix */}
          <button
            type="button"
            onClick={() => handlePaymentMethodChange('PIX')}
            className={`p-3.5 rounded-xl border-2 text-left transition-all flex items-center gap-3 cursor-pointer ${
              paymentMethod === 'PIX'
                ? 'border-emerald-500 bg-emerald-50/60 shadow-sm ring-2 ring-emerald-200'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div
              className={`p-2 rounded-lg shrink-0 ${
                paymentMethod === 'PIX' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <QrCode size={20} />
            </div>
            <div>
              <div className="font-display font-bold text-slate-900 text-xs sm:text-sm">
                <span>Pix Instantâneo</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                QR Code Dinâmico
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SEÇÃO 1: FORMULÁRIO DE CARTÃO DE CRÉDITO COM COBRANÇA AUTOMÁTICA
          ========================================================================= */}
      {paymentMethod === 'CREDIT_CARD' ? (
        <div className="space-y-4 pt-1">
          {/* Card Preview Visual Interativo */}
          <div className="relative w-full max-w-sm mx-auto h-44 rounded-2xl p-5 text-white shadow-xl bg-gradient-to-tr from-slate-950 via-slate-900 to-orange-950 border border-slate-800 flex flex-col justify-between overflow-hidden">
            {/* Efeito sutil de brilho no fundo */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-orange-600/20 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-sky-600/20 rounded-full blur-2xl pointer-events-none"></div>

            {/* Linha superior: Chip e Logo da Bandeira */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                {/* Chip Dourado */}
                <div className="w-10 h-7 rounded bg-gradient-to-br from-amber-200 via-amber-400 to-amber-500 shadow-inner border border-amber-300/60 flex items-center justify-center p-0.5">
                  <div className="w-full h-full border border-amber-600/40 rounded-xs flex items-center justify-center">
                    <div className="w-2 h-2 border-r border-amber-700/40"></div>
                  </div>
                </div>
                {/* Ícone Contactless / Wifi */}
                <Wifi size={16} className="text-slate-400 rotate-90" />
              </div>

              {/* Bandeira do Cartão */}
              <div className="text-right">
                {cardBrand === 'visa' && (
                  <span className="font-black italic text-lg tracking-wider text-sky-400 font-serif">VISA</span>
                )}
                {cardBrand === 'mastercard' && (
                  <div className="flex -space-x-2 items-center">
                    <span className="w-5 h-5 rounded-full bg-red-500 opacity-90 inline-block"></span>
                    <span className="w-5 h-5 rounded-full bg-amber-400 opacity-90 inline-block"></span>
                  </div>
                )}
                {cardBrand === 'elo' && (
                  <span className="font-extrabold text-sm tracking-widest text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-amber-400/30">
                    ELO
                  </span>
                )}
                {cardBrand === 'hipercard' && (
                  <span className="font-black text-xs text-red-400 bg-white px-1.5 py-0.5 rounded">HIPER</span>
                )}
                {cardBrand === 'amex' && (
                  <span className="font-bold text-xs text-sky-300 bg-sky-950 px-2 py-0.5 rounded border border-sky-400">
                    AMEX
                  </span>
                )}
                {cardBrand === 'unknown' && (
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                    <CreditCard size={14} />
                    Cartão
                  </span>
                )}
              </div>
            </div>

            {/* Linha central: Número do Cartão */}
            <div className="z-10 tracking-widest font-mono text-lg sm:text-xl font-bold text-slate-100 drop-shadow">
              {cardNumber || '•••• •••• •••• ••••'}
            </div>

            {/* Linha inferior: Nome do Titular e Validade */}
            <div className="flex items-center justify-between z-10 text-[10px] sm:text-xs">
              <div className="max-w-[70%]">
                <span className="text-[9px] text-slate-400 block uppercase font-semibold">Titular do Cartão</span>
                <span className="font-bold uppercase tracking-wide truncate block text-slate-200">
                  {cardHolderName || 'NOME NO CARTÃO'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-400 block uppercase font-semibold">Validade</span>
                <span className="font-mono font-bold text-slate-200">{cardExpiry || 'MM/AA'}</span>
              </div>
            </div>
          </div>

          {/* Formulário de Dados do Cartão */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Lock size={14} className="text-orange-600" />
                Dados do Cartão de Crédito
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Cobrança Automática
              </span>
            </div>

            {/* 1. Número do Cartão */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Número do Cartão <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  onFocus={() => setActiveCardField('number')}
                  onBlur={() => setActiveCardField(null)}
                  className={`w-full p-3 pl-10 pr-24 rounded-xl border text-sm font-mono tracking-wider transition-all focus:outline-none ${
                    fieldErrors.cardNumber
                      ? 'border-red-500 bg-red-50/30 focus:ring-2 focus:ring-red-200'
                      : 'border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                  }`}
                />
                <CreditCard size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <div className="absolute right-3 top-3">
                  {cardBrand !== 'unknown' ? (
                    <span className="text-[11px] font-black uppercase text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                      {cardBrand}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">16 dígitos</span>
                  )}
                </div>
              </div>
              {fieldErrors.cardNumber && (
                <p className="text-xs text-red-600 mt-1 font-medium">{fieldErrors.cardNumber}</p>
              )}
            </div>

            {/* 2. Nome Impresso no Cartão */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome Impresso no Cartão <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="EX: JOAO DA SILVA"
                value={cardHolderName}
                onChange={(e) => {
                  setCardHolderName(e.target.value.toUpperCase());
                  if (fieldErrors.cardHolderName) {
                    setFieldErrors((prev) => ({ ...prev, cardHolderName: '' }));
                  }
                }}
                onFocus={() => setActiveCardField('name')}
                onBlur={() => setActiveCardField(null)}
                className={`w-full p-3 rounded-xl border text-sm uppercase transition-all focus:outline-none ${
                  fieldErrors.cardHolderName
                    ? 'border-red-500 bg-red-50/30 focus:ring-2 focus:ring-red-200'
                    : 'border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                }`}
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Digite o nome exatamente como está impresso no cartão.
              </span>
              {fieldErrors.cardHolderName && (
                <p className="text-xs text-red-600 mt-1 font-medium">{fieldErrors.cardHolderName}</p>
              )}
            </div>

            {/* 3. Validade e CVV */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Validade (MM/AA) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  placeholder="MM/AA"
                  maxLength={5}
                  value={cardExpiry}
                  onChange={handleCardExpiryChange}
                  onFocus={() => setActiveCardField('expiry')}
                  onBlur={() => setActiveCardField(null)}
                  className={`w-full p-3 rounded-xl border text-sm font-mono transition-all focus:outline-none ${
                    fieldErrors.cardExpiry
                      ? 'border-red-500 bg-red-50/30 focus:ring-2 focus:ring-red-200'
                      : 'border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                  }`}
                />
                {fieldErrors.cardExpiry && (
                  <p className="text-xs text-red-600 mt-1 font-medium">{fieldErrors.cardExpiry}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Código CVV <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    inputMode="numeric"
                    placeholder="123"
                    maxLength={4}
                    value={cardCVV}
                    onChange={handleCardCVVChange}
                    onFocus={() => setActiveCardField('cvv')}
                    onBlur={() => setActiveCardField(null)}
                    className={`w-full p-3 pl-9 rounded-xl border text-sm font-mono tracking-widest transition-all focus:outline-none ${
                      fieldErrors.cardCVV
                        ? 'border-red-500 bg-red-50/30 focus:ring-2 focus:ring-red-200'
                        : 'border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                    }`}
                  />
                  <Lock size={16} className="absolute left-3 top-3.5 text-slate-400" />
                </div>
                {fieldErrors.cardCVV && (
                  <p className="text-xs text-red-600 mt-1 font-medium">{fieldErrors.cardCVV}</p>
                )}
              </div>
            </div>

            {/* Checkbox: Titular do cartão */}
            <div className="pt-1 border-t border-slate-100">
              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSameHolder}
                  onChange={(e) => {
                    setIsSameHolder(e.target.checked);
                    if (e.target.checked) {
                      setHolderCpf(step1.cpf);
                      setHolderPhone(step1.phone);
                    }
                  }}
                  className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4"
                />
                <span>
                  O titular do cartão é o próprio atleta (<strong>{step1.fullName}</strong>)
                </span>
              </label>
            </div>

            {/* Campos adicionais se o titular for outra pessoa */}
            {!isSameHolder && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    CPF do Titular do Cartão <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    value={holderCpf}
                    onChange={(e) => setHolderCpf(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-mono bg-white"
                  />
                  {fieldErrors.holderCpf && (
                    <p className="text-xs text-red-600 mt-0.5 font-medium">{fieldErrors.holderCpf}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    WhatsApp do Titular <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="(84) 90000-0000"
                    value={holderPhone}
                    onChange={(e) => setHolderPhone(maskPhone(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>
            )}

            {/* Selo de Segurança */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
              <span>
                Ambiente seguro 256-bit SSL com certificação bancária PCI-DSS. Cobrança imediata e segura via Asaas.
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
            SEÇÃO 2: FLUXO PIX INSTANTÂNEO
            ========================================================================= */
        <div className="p-4 rounded-2xl bg-emerald-50/70 border-2 border-emerald-200 text-left space-y-3">
          <div className="flex items-center gap-2">
            <QrCode className="text-emerald-600" size={22} />
            <span className="font-display font-bold text-slate-900 text-sm">
              Pagamento via Pix Instantâneo
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Ao confirmar, será gerado o <strong>QR Code oficial e a chave Pix Copia e Cola</strong> com confirmação automática pelo sistema bancário assim que o pagamento for concluído.
          </p>
        </div>
      )}

      {/* Discriminação de Valores */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
        <div className="flex justify-between text-xs text-slate-600">
          <span>Inscrição Oficial 5 km (Kit Oficial com Camisa):</span>
          <span className="font-semibold text-slate-900">{formatCentsToBRL(pricing.baseAmountCents)}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-600">
          <span>
            Taxa de Serviço ({paymentMethod === 'PIX' ? 'Pix' : 'Cartão 1x à vista'} - 10%):
          </span>
          <span className="font-semibold text-slate-900">{formatCentsToBRL(pricing.feeCents)}</span>
        </div>
        <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
          <span>Total da Cobrança:</span>
          <span className="text-xl text-orange-600 font-extrabold">
            {formatCentsToBRL(pricing.totalAmountCents)}
          </span>
        </div>
      </div>

      {/* Termos e Condições Obrigatórios */}
      <div className="space-y-3 pt-1">
        <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
          <input
            type="checkbox"
            required
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300"
          />
          <span className="text-xs text-slate-700 leading-relaxed">
            Li e concordo integralmente com o{' '}
            <button
              type="button"
              onClick={onOpenTerms}
              className="text-orange-600 font-bold underline hover:text-orange-700 inline-flex items-center gap-0.5"
            >
              <span>Regulamento Oficial ({settings.termsVersion})</span>
              <FileText size={12} />
            </button>
            , declarando estar em plenas condições de saúde para a prova de 5 km e ciente das regras do evento.
          </span>
        </label>

        <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
          <input
            type="checkbox"
            required
            checked={privacyAccepted}
            onChange={(e) => setPrivacyAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300"
          />
          <span className="text-xs text-slate-700 leading-relaxed">
            Estou ciente e autorizo o tratamento dos dados cadastrais nos termos da{' '}
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="text-orange-600 font-bold underline hover:text-orange-700 inline-flex items-center gap-0.5"
            >
              <span>Política de Privacidade LGPD ({settings.privacyVersion})</span>
              <ShieldCheck size={12} />
            </button>
            , exclusivamente para fins de cronometragem, seguro esportivo e organização.
          </span>
        </label>
      </div>

      {/* Botões de Ação */}
      <div className="pt-2 flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onBack}
          className="py-3.5 px-5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Voltar</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting || !termsAccepted || !privacyAccepted}
          className="flex-1 py-3.5 px-6 rounded-xl text-sm font-extrabold text-white bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>
                {paymentMethod === 'CREDIT_CARD'
                  ? 'Processando Cobrança no Cartão...'
                  : 'Gerando Pagamento Pix...'}
              </span>
            </>
          ) : (
            <>
              <Lock size={16} />
              <span>
                {paymentMethod === 'CREDIT_CARD'
                  ? `Pagar ${formatCentsToBRL(pricing.totalAmountCents)} no Cartão`
                  : `Gerar Pix (${formatCentsToBRL(pricing.totalAmountCents)})`}
              </span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
