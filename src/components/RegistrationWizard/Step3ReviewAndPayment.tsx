import React from 'react';
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
  Clock,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Step1Data } from './Step1AthleteData';
import { Step2Data } from './Step2CategoryAndShirt';
import { EventSettings, Registration, Category } from '../../types';
import { calculatePricing, formatCentsToBRL } from '../../lib/pricing';
import { formatDateBR } from '../../lib/masks';

interface Step3ReviewAndPaymentProps {
  step1: Step1Data;
  step2: Step2Data;
  settings: EventSettings;
  onBack: () => void;
  onSubmit: (agreements: { termsAccepted: boolean; privacyAccepted: boolean }) => Promise<{
    registration: Registration;
    accessCode: string;
  }>;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
  onFinish: () => void;
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
}) => {
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [privacyAccepted, setPrivacyAccepted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Estado do sucesso
  const [successResult, setSuccessResult] = React.useState<{
    registration: Registration;
    accessCode: string;
  } | null>(null);
  const [copiedCode, setCopiedCode] = React.useState(false);
  const [copiedPix, setCopiedPix] = React.useState(false);

  // Calcular Categoria
  const computedCategory: Category =
    step2.originType === 'CASA'
      ? step2.gender === 'MASCULINO'
        ? 'CASA_MASCULINO'
        : 'CASA_FEMININO'
      : step2.gender === 'MASCULINO'
      ? 'VISITANTE_MASCULINO'
      : 'VISITANTE_FEMININO';

  const categoryName = {
    CASA_MASCULINO: 'Casa Masculino (5 km)',
    CASA_FEMININO: 'Casa Feminino (5 km)',
    VISITANTE_MASCULINO: 'Visitante Masculino (5 km)',
    VISITANTE_FEMININO: 'Visitante Feminino (5 km)',
  }[computedCategory];

  const pricing = calculatePricing(step2.paymentMethod, {
    basePriceCents: settings.basePriceCents,
    pixFixedFeeCents: settings.asaasPixFixedFeeCents,
    creditFixedFeeCents: settings.asaasCreditFixedFeeCents,
    creditPercentFee: settings.asaasCreditPercentFee,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted || !privacyAccepted) {
      setError('É necessário aceitar os termos do regulamento e a política de privacidade para concluir.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await onSubmit({ termsAccepted, privacyAccepted });
      setSuccessResult(res);

      // Disparar confetes esportivos
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F25807', '#0491D2', '#FFFFFF', '#FFB703'],
        });
      } catch (cErr) {
        console.warn('Confetti error:', cErr);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar reserva. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // TELA DE SUCESSO E DIRECIONAMENTO AO PAGAMENTO
  if (successResult) {
    const reg = successResult.registration;
    return (
      <div className="space-y-6 text-center py-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 size={36} />
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Reserva Confirmada com Sucesso!
          </span>
          <h3 className="font-display font-black text-2xl text-slate-900 uppercase mt-1">
            Inscrição Pré-Reservada
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-md mx-auto">
            Sua vaga e a camisa tamanho <strong>{reg.shirtSize}</strong> estão reservadas por{' '}
            <strong className="text-orange-600">30 minutos</strong>. Conclua o pagamento para garantir sua participação definitiva.
          </p>
        </div>

        {/* Card do Protocolo e Código de Acesso */}
        <div className="p-5 rounded-2xl bg-slate-900 text-white text-left space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Protocolo Oficial</span>
              <div className="font-mono font-extrabold text-lg text-orange-400">{reg.protocol}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Código de Acesso</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-lg text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {successResult.accessCode}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(successResult.accessCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2500);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Copiar código de acesso"
                >
                  {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-950/40 p-2.5 rounded-lg border border-amber-800/40">
            <Clock size={16} className="shrink-0" />
            <span>
              <strong>Guarde este código:</strong> Ele será exigido para consultar sua inscrição ou emitir o comprovante sem expor seus dados públicos.
            </span>
          </div>
        </div>

        {/* Ação de Pagamento Conforme Método Escolhido */}
        <div className="p-6 rounded-2xl bg-orange-50 border-2 border-orange-200 text-left space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {reg.paymentMethod === 'PIX' ? (
                <QrCode className="text-orange-600" size={22} />
              ) : (
                <CreditCard className="text-orange-600" size={22} />
              )}
              <span className="font-display font-bold text-slate-900 text-base">
                Pagamento via {reg.paymentMethod === 'PIX' ? 'Pix Asaas' : 'Cartão de Crédito 1x'}
              </span>
            </div>
            <span className="font-display font-extrabold text-xl text-orange-600">
              {formatCentsToBRL(reg.totalAmountCents)}
            </span>
          </div>

          {reg.paymentMethod === 'PIX' && reg.asaasPixCopyPaste && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Copie o código Pix abaixo e pague no aplicativo do seu banco:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={reg.asaasPixCopyPaste}
                  className="w-full text-xs font-mono bg-white p-2.5 rounded-lg border border-slate-300 text-slate-700 truncate"
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
            </div>
          )}

          {reg.asaasInvoiceUrl && (
            <div>
              <a
                href={reg.asaasInvoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-600/30 flex items-center justify-center gap-2 text-center transition-all"
              >
                <span>Acessar Ambiente de Pagamento Asaas</span>
                <ExternalLink size={16} />
              </a>
              <p className="text-[11px] text-slate-500 text-center mt-2">
                Ambiente seguro 256-bit SSL com certificação PCI-DSS do Asaas Gestão Financeira.
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onFinish}
          className="w-full py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors"
        >
          Concluir e Voltar ao Início
        </button>
      </div>
    );
  }

  // TELA DE REVISÃO E CONFIRMAÇÃO
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Resumo da Inscrição */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
        <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Atleta</span>
            <div className="font-bold text-slate-900 text-base">{step1.fullName}</div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">CPF</span>
            <div className="font-mono text-xs text-slate-700">{step1.cpf}</div>
          </div>
        </div>

        {/* Grid de Dados Cadastrais */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block">Nascimento:</span>
            <span className="font-semibold text-slate-800">{formatDateBR(step1.birthDate)}</span>
          </div>
          <div>
            <span className="text-slate-400 block">WhatsApp:</span>
            <span className="font-semibold text-slate-800">{step1.phone}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Cidade / UF:</span>
            <span className="font-semibold text-slate-800">
              {step1.city}/{step1.state}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Equipe / Assessoria:</span>
            <span className="font-semibold text-slate-800">{step1.team || 'Individual'}</span>
          </div>
        </div>

        {/* Divisão e Categoria Calculada */}
        <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Categoria Oficial Calculada:</span>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
              {categoryName}
            </span>
          </div>

          {step2.originType === 'CASA' && (
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
              <span className="text-slate-500">Vínculo com Lajes Pintadas:</span>
              <span className="font-bold text-slate-800">
                {step2.casaProofType === 'NATURAL' && 'Natural de Lajes Pintadas'}
                {step2.casaProofType === 'RESIDENTE' && 'Morador Atual'}
                {step2.casaProofType === 'NATURAL_E_RESIDENTE' && 'Natural e Morador Atual'}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <span className="text-slate-500">Camisa Técnica do Kit:</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <span>Laranja • Tamanho {step2.shirtSize}</span>
            </div>
          </div>
        </div>

        {/* Discriminação de Valores */}
        <div className="border-t border-slate-200 pt-3 space-y-1.5">
          <div className="flex justify-between text-xs text-slate-600">
            <span>Inscrição Oficial 5 km (com direito à camisa):</span>
            <span className="font-semibold text-slate-900">{formatCentsToBRL(pricing.baseAmountCents)}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-600">
            <span>Processamento Gateway Asaas ({step2.paymentMethod === 'PIX' ? 'Pix' : 'Cartão 1x'}):</span>
            <span className="font-semibold text-slate-900">{formatCentsToBRL(pricing.feeCents)}</span>
          </div>
          <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
            <span>Total a Pagar:</span>
            <span className="text-lg text-orange-600">{formatCentsToBRL(pricing.totalAmountCents)}</span>
          </div>
          <p className="text-[10px] text-slate-400 italic text-right mt-0.5">
            {pricing.formulaDescription}
          </p>
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
            , declarando estar em plenas condições de saúde para a prova de 5 km e ciente das regras de comprovação da Categoria Casa.
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
          className="py-3 px-5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 flex items-center gap-1.5"
        >
          <ArrowLeft size={16} />
          <span>Voltar</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting || !termsAccepted || !privacyAccepted}
          className="flex-1 py-3.5 px-6 rounded-xl text-sm font-extrabold text-white bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processando Reserva...</span>
            </>
          ) : (
            <>
              <Lock size={16} />
              <span>Confirmar Inscrição & Pagar</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
