import React, { useState } from 'react';
import {
  Home,
  Globe,
  Shirt,
  CreditCard,
  QrCode,
  AlertTriangle,
  Check,
  ArrowLeft,
  ArrowRight,
  Building2,
  Info,
  Ruler,
  ChevronDown,
  ChevronUp,
  Accessibility,
  Award,
  FileText,
  UserCheck,
  ShieldCheck,
  HeartHandshake,
} from 'lucide-react';
import {
  OriginType,
  AthleteGender,
  CasaProofType,
  ShirtSize,
  PaymentMethod,
  ShirtInventoryItem,
  EventSettings,
  PcdType,
} from '../../types';
import { calculatePricing, formatCentsToBRL, getActiveBatchLabel, getActiveBasePriceCents } from '../../lib/pricing';
import { isValidCPF } from '../../lib/cpf';
import { formatCPF, maskPhone } from '../../lib/masks';

const SHIRT_MEASUREMENTS: Record<ShirtSize, { backHeight: string; width: string; frontHeight: string }> = {
  PP: { backHeight: '69,5 cm', width: '49 cm', frontHeight: '65 cm' },
  P:  { backHeight: '72 cm',   width: '51,5 cm', frontHeight: '67,5 cm' },
  M:  { backHeight: '75 cm',   width: '54,5 cm', frontHeight: '71 cm' },
  G:  { backHeight: '78,5 cm', width: '58 cm', frontHeight: '74 cm' },
  GG: { backHeight: '81,5 cm', width: '60,5 cm', frontHeight: '78 cm' },
  XG: { backHeight: '85 cm',   width: '63 cm', frontHeight: '81 cm' },
};

export interface Step2Data {
  originType: OriginType;
  gender: AthleteGender;
  casaProofType?: CasaProofType;
  shirtSize: ShirtSize;
  paymentMethod: PaymentMethod;
  // PCD / Inclusão & Atleta-Guia
  isPcd?: boolean;
  pcdType?: PcdType;
  pcdCid?: string;
  hasGuide?: boolean;
  guideName?: string;
  guideCpf?: string;
  guidePhone?: string;
  guideShirtSize?: ShirtSize;
}

interface Step2CategoryAndShirtProps {
  data: Step2Data;
  city: string;
  state: string;
  athleteCpf?: string;
  inventory: ShirtInventoryItem[];
  settings: EventSettings;
  onChange: (fields: Partial<Step2Data>) => void;
  onBack: () => void;
  onNext: () => void;
}

export const Step2CategoryAndShirt: React.FC<Step2CategoryAndShirtProps> = ({
  data,
  city,
  state,
  athleteCpf,
  inventory,
  settings,
  onChange,
  onBack,
  onNext,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const scrollStepToTop = React.useCallback(() => {
    let el: HTMLElement | null = formRef.current?.parentElement || null;
    while (el) {
      el.scrollTop = 0;
      el.scrollTo?.({ top: 0, behavior: 'instant' as ScrollBehavior });
      el = el.parentElement;
    }
  }, []);

  React.useLayoutEffect(() => {
    scrollStepToTop();
  }, [scrollStepToTop]);

  React.useEffect(() => {
    if (error) {
      scrollStepToTop();
    }
  }, [error, scrollStepToTop]);

  const isPcd = data.originType === 'PCD' || Boolean(data.isPcd);
  const activeBaseCents = getActiveBasePriceCents(settings);
  const pcdBaseCents = Math.round(activeBaseCents / 2);
  const activeBatchLabel = getActiveBatchLabel(settings);

  const pixPricing = calculatePricing('PIX', {
    basePriceCents: activeBaseCents,
    pixFixedFeeCents: settings.asaasPixFixedFeeCents,
    creditFixedFeeCents: settings.asaasCreditFixedFeeCents,
    creditPercentFee: settings.asaasCreditPercentFee,
  }, { isPcd, batchName: activeBatchLabel });

  const cardPricing = calculatePricing('CREDIT_CARD', {
    basePriceCents: activeBaseCents,
    pixFixedFeeCents: settings.asaasPixFixedFeeCents,
    creditFixedFeeCents: settings.asaasCreditFixedFeeCents,
    creditPercentFee: settings.asaasCreditPercentFee,
  }, { isPcd, batchName: activeBatchLabel });

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validação Categoria Local: Exclusivamente presencial
    if (data.originType === 'CASA' || data.originType === 'LOCAL') {
      setError(
        'Local — Lajespintadense: Inscrições exclusivamente presenciais na sede da Prefeitura de Lajes Pintadas/RN. Apresente documento de identificação e comprovação do vínculo exigido pelo regulamento.'
      );
      return;
    }

    // Validação específica para categoria PCD / Inclusão
    if (data.originType === 'PCD') {
      if (!data.pcdType) {
        setError('Por favor, selecione o tipo de deficiência para a inscrição na categoria PCD.');
        return;
      }
      if (!data.pcdCid || data.pcdCid.trim().length < 3) {
        setError('Informe o código CID ou número do Laudo Médico / CIPTEA comprobatório.');
        return;
      }
      if (data.hasGuide) {
        if (!data.guideName || data.guideName.trim().length < 5) {
          setError('Informe o nome e sobrenome completos do Atleta-Guia.');
          return;
        }
        const cleanGuideCpf = (data.guideCpf || '').replace(/\D/g, '');
        if (!cleanGuideCpf || !isValidCPF(cleanGuideCpf)) {
          setError('CPF do Atleta-Guia inválido. Por favor, confira os números digitados.');
          return;
        }
        const cleanAthleteCpf = (athleteCpf || '').replace(/\D/g, '');
        if (cleanAthleteCpf && cleanGuideCpf === cleanAthleteCpf) {
          setError('O CPF do Atleta-Guia não pode ser idêntico ao CPF do atleta participante.');
          return;
        }
        if (!data.guidePhone || data.guidePhone.replace(/\D/g, '').length < 10) {
          setError('Informe um telefone ou WhatsApp válido com DDD para o Atleta-Guia.');
          return;
        }
        if (!data.guideShirtSize) {
          setError('Selecione o tamanho da camisa oficial gratuita do Atleta-Guia.');
          return;
        }
      }
    }

    onNext();
  };

  return (
    <form ref={formRef} onSubmit={handleNext} className="space-y-6">
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Origem: Local, Visitante ou PCD */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
          1. Origem da Participação <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Categoria Local */}
          <button
            type="button"
            onClick={() => {
              onChange({ originType: 'CASA', isPcd: false });
              setError(null);
            }}
            className={`p-3.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
              data.originType === 'CASA' || data.originType === 'LOCAL'
                ? 'border-orange-500 bg-orange-50/50 shadow-sm ring-2 ring-orange-200'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`p-1.5 rounded-lg ${
                  data.originType === 'CASA' || data.originType === 'LOCAL' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Home size={18} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100/70 px-2 py-0.5 rounded">
                Presencial
              </span>
            </div>
            <div>
              <div className="font-display font-bold text-slate-900 text-xs sm:text-sm">Local — Lajespintadense</div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Naturais ou moradores comprovados de Lajes Pintadas/RN.
              </p>
            </div>
          </button>

          {/* Categoria Visitante */}
          <button
            type="button"
            onClick={() => {
              onChange({ originType: 'VISITANTE', casaProofType: undefined, isPcd: false });
              setError(null);
            }}
            className={`p-3.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
              data.originType === 'VISITANTE'
                ? 'border-sky-500 bg-sky-50/50 shadow-sm ring-2 ring-sky-200'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`p-1.5 rounded-lg ${
                  data.originType === 'VISITANTE' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Globe size={18} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded">
                Geral
              </span>
            </div>
            <div>
              <div className="font-display font-bold text-slate-900 text-xs sm:text-sm">Categoria Visitante</div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Corredores e assessorias esportivas de demais cidades.
              </p>
            </div>
          </button>

          {/* Categoria PCD / Inclusão */}
          <button
            type="button"
            onClick={() => {
              onChange({
                originType: 'PCD',
                isPcd: true,
                pcdType: data.pcdType || 'FISICA',
                casaProofType: undefined,
              });
              setError(null);
            }}
            className={`p-3.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
              data.originType === 'PCD'
                ? 'border-purple-600 bg-purple-50/60 shadow-sm ring-2 ring-purple-200'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`p-1.5 rounded-lg ${
                  data.originType === 'PCD' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Accessibility size={18} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                50% OFF • {formatCentsToBRL(pcdBaseCents)} + taxa
              </span>
            </div>
            <div>
              <div className="font-display font-bold text-slate-900 text-xs sm:text-sm">PCD / Inclusão</div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Pessoas com deficiência (meia-inscrição {formatCentsToBRL(pcdBaseCents)} + taxa 10%), largada prioritária e pódio exclusivo.
              </p>
            </div>
          </button>
        </div>

        {/* Informativo Categorias Master (+55) e Kids */}
        <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <strong className="text-slate-800">Categoria Master (+55):</strong> Atletas com 55 anos ou mais concorrem automaticamente ao pódio Master (1º ao 3º Lugar: Troféu — Masc. e Fem.).
          </div>
          <div className="text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg font-semibold shrink-0">
            Categoria Kids: Inscrições na hora da prova
          </div>
        </div>
      </div>

      {/* Formulário Específico da Categoria PCD / Inclusão */}
      {data.originType === 'PCD' && (
        <div className="p-5 rounded-2xl bg-purple-50/70 border-2 border-purple-200 space-y-4">
          <div className="flex items-center justify-between border-b border-purple-200/80 pb-3">
            <div className="flex items-center gap-2">
              <Accessibility className="w-5 h-5 text-purple-700" />
              <span className="font-display font-bold text-sm text-purple-950 uppercase tracking-wide">
                Informações da Inclusão / PCD
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
              Regulamento Oficial
            </span>
          </div>

          {/* Tipo de Deficiência */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              Tipo de Deficiência <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { type: 'FISICA', label: 'Física / Motora' },
                { type: 'VISUAL', label: 'Visual' },
                { type: 'AUDITIVA', label: 'Auditiva' },
                { type: 'INTELECTUAL', label: 'Intelectual' },
                { type: 'OUTRA', label: 'Outra Deficiência' },
              ].map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => onChange({ pcdType: opt.type as PcdType })}
                  className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                    data.pcdType === opt.type
                      ? 'border-purple-600 bg-purple-600 text-white shadow-sm font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-purple-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Código CID ou Nº do Laudo Médico / CIPTEA */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Código CID ou Nº do Laudo Médico / CIPTEA <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={data.pcdCid || ''}
              onChange={(e) => onChange({ pcdCid: e.target.value })}
              placeholder="Ex: CID-10 H54.0 ou Laudo Dr. CRM 12345 / Carteira CIPTEA"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="mt-1.5 p-2.5 rounded-lg bg-purple-100/70 border border-purple-200 text-[11px] text-purple-900 flex items-start gap-1.5">
              <FileText className="w-4 h-4 shrink-0 mt-0.5 text-purple-700" />
              <span>
                <strong>Apresentação Obrigatória:</strong> O laudo médico comprobatório original ou documento oficial equivalente deverá ser apresentado presencialmente no ato da entrega do kit para validação.
              </span>
            </div>
          </div>

          {/* Atleta-Guia Toggle */}
          <div className="pt-2 border-t border-purple-200/80">
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-white border border-purple-200 hover:border-purple-300 transition">
              <input
                type="checkbox"
                checked={data.hasGuide || false}
                onChange={(e) => {
                  const checked = e.target.checked;
                  onChange({
                    hasGuide: checked,
                    guideName: checked ? data.guideName : undefined,
                    guideCpf: checked ? data.guideCpf : undefined,
                    guidePhone: checked ? data.guidePhone : undefined,
                    guideShirtSize: checked ? (data.guideShirtSize || 'M') : undefined,
                  });
                }}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 mt-0.5 cursor-pointer"
              />
              <div className="flex-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <HeartHandshake className="w-4 h-4 text-purple-600" />
                  <span>Participarei com Atleta-Guia</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded ml-1">
                    Isento (Grátis)
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  O guia não paga taxa de inscrição, tem direito ao kit oficial com camisa oficial laranja e número de peito de suporte.
                </p>
              </div>
            </label>

            {/* Dados do Atleta-Guia (se ativado) */}
            {data.hasGuide && (
              <div className="mt-3 p-4 rounded-xl bg-white border border-purple-200 space-y-3 animate-fadeIn">
                <span className="font-bold text-xs text-purple-950 uppercase tracking-wide block">
                  Dados do Atleta-Guia Oficial:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Nome Completo do Guia <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={data.guideName || ''}
                      onChange={(e) => onChange({ guideName: e.target.value })}
                      placeholder="Nome completo do guia"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      CPF do Guia <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={14}
                      value={formatCPF(data.guideCpf || '')}
                      onChange={(e) => onChange({ guideCpf: e.target.value.replace(/\D/g, '') })}
                      placeholder="000.000.000-00"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Telefone / WhatsApp do Guia <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={15}
                      value={maskPhone(data.guidePhone || '')}
                      onChange={(e) => onChange({ guidePhone: e.target.value.replace(/\D/g, '') })}
                      placeholder="(84) 99999-9999"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Camisa Oficial do Guia (Grátis • Sob Demanda) <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-6 gap-1">
                      {(['PP', 'P', 'M', 'G', 'GG', 'XG'] as ShirtSize[]).map((sz) => {
                        const isSelected = data.guideShirtSize === sz;

                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => onChange({ guideShirtSize: sz })}
                            className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'border-purple-600 bg-purple-600 text-white font-bold'
                                : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-purple-400'
                            }`}
                          >
                            <span className="text-xs uppercase">{sz}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Aviso Obrigatório e Orientação Local */}
      {(data.originType === 'CASA' || data.originType === 'LOCAL') && (
        <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-3">
          <div className="flex items-center gap-2.5 font-bold text-sm text-amber-900">
            <Building2 size={20} className="text-amber-700 shrink-0" />
            <span>Local — Lajespintadense</span>
          </div>
          <p className="text-sm font-semibold leading-relaxed text-amber-950">
            Inscrições exclusivamente presenciais na sede da Prefeitura de Lajes Pintadas/RN. Apresente documento de identificação e comprovação do vínculo exigido pelo regulamento.
          </p>
          <div className="text-xs text-amber-800 bg-amber-100/60 p-3 rounded-xl border border-amber-200">
            A inscrição da categoria Local requer conferência presencial de documentos por servidor autorizado na sede da Prefeitura Municipal. Não é permitida a finalização ou cobrança online para esta categoria.
          </div>
        </div>
      )}

      {/* Fluxo completo liberado apenas para Visitante (online) */}
      {data.originType !== 'CASA' && data.originType !== 'LOCAL' && (
        <>
          {/* 2. Gênero / Participação */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              2. Participação por Sexo / Gênero <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['MASCULINO', 'FEMININO'] as AthleteGender[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => onChange({ gender: g })}
                  className={`py-3 px-4 rounded-xl border-2 text-center font-bold text-sm transition-all ${
                    data.gender === g
                      ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {g === 'MASCULINO' ? 'Masculino' : 'Feminino'}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Apresentação da Camisa Laranja e Grade de Tamanhos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                3. Camisa Oficial do Kit (Sob Demanda) <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-emerald-700 font-semibold">✓ Garantida no tamanho escolhido</span>
            </div>

            {/* Mini Preview do Kit Oficial: Camiseta + Fita/Medalha 68 Anos */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 mb-3">
              <div className="flex items-center gap-1.5 shrink-0">
                <img
                  src="/assets/camiseta_corrida_laranja_68_anos.png"
                  alt="Camiseta Oficial Laranja 68 Anos"
                  className="w-14 h-14 object-contain rounded-lg bg-white border border-slate-200"
                />
                <img
                  src="/assets/fita_laranja_oficial.png"
                  alt="Fita e Medalha Finisher 68 Anos"
                  className="w-14 h-14 object-contain rounded-lg bg-white border border-slate-200"
                />
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-slate-900 block">Kit Oficial do Atleta • Edição 68 Anos</span>
                <span className="text-slate-500 block mt-0.5">
                  Camiseta Poliamida FPU 50+ Laranja 68 Anos + Medalha Finisher com Fita Sublimada (entregue conforme o tamanho selecionado).
                </span>
              </div>
            </div>

            {/* Grade de Tamanhos (Sob Demanda) */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(['PP', 'P', 'M', 'G', 'GG', 'XG'] as ShirtSize[]).map((sz) => {
                const isSelected = data.shirtSize === sz;

                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => onChange({ shirtSize: sz })}
                    className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-orange-500 bg-orange-500 text-white font-extrabold shadow-sm'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-orange-400'
                    }`}
                  >
                    <div className="font-display text-base uppercase">{sz}</div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-white' : 'text-emerald-600 font-semibold'}`}>
                      Disponível
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Guia de Medidas do Tamanho Selecionado */}
            {data.shirtSize && SHIRT_MEASUREMENTS[data.shirtSize] && (
              <div className="mt-2.5 p-2.5 bg-orange-50/70 border border-orange-200/80 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-slate-700">
                  <span className="font-bold text-orange-700 uppercase">Medidas Tam. {data.shirtSize}: </span>
                  <span>
                    Largura: <strong>{SHIRT_MEASUREMENTS[data.shirtSize].width}</strong> • Altura Frente: <strong>{SHIRT_MEASUREMENTS[data.shirtSize].frontHeight}</strong> • Altura Costa: <strong>{SHIRT_MEASUREMENTS[data.shirtSize].backHeight}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMeasurements(!showMeasurements)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-700 hover:text-orange-800 underline self-start sm:self-auto cursor-pointer"
                >
                  <Ruler size={13} />
                  <span>{showMeasurements ? 'Ocultar tabela' : 'Ver tabela completa'}</span>
                  {showMeasurements ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>
            )}

            {/* Tabela Completa de Medidas (Colapsável) */}
            {showMeasurements && (
              <div className="mt-2 p-3 bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Tabela Oficial de Medidas (cm)</span>
                  <span className="text-[10px] text-amber-600 font-medium">Sem troca no dia</span>
                </div>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                      <th className="py-1 px-2 uppercase">Tamanho</th>
                      <th className="py-1 px-2 uppercase">Altura Costa</th>
                      <th className="py-1 px-2 uppercase">Largura</th>
                      <th className="py-1 px-2 uppercase">Altura Frente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(['PP', 'P', 'M', 'G', 'GG', 'XG'] as ShirtSize[]).map((sz) => (
                      <tr
                        key={sz}
                        className={data.shirtSize === sz ? 'bg-orange-50 font-bold text-orange-700' : 'text-slate-700'}
                      >
                        <td className="py-1.5 px-2">{sz}</td>
                        <td className="py-1.5 px-2">{SHIRT_MEASUREMENTS[sz].backHeight}</td>
                        <td className="py-1.5 px-2">{SHIRT_MEASUREMENTS[sz].width}</td>
                        <td className="py-1.5 px-2">{SHIRT_MEASUREMENTS[sz].frontHeight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 4. Forma de Pagamento (Pix ou Cartão à vista) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              4. Forma de Pagamento (Pagamento Único) <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Opção PIX */}
              <button
                type="button"
                onClick={() => onChange({ paymentMethod: 'PIX' })}
                className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${
                  data.paymentMethod === 'PIX'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    data.paymentMethod === 'PIX' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <QrCode size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-display font-bold text-slate-900 text-sm">
                    <span>Pix Instantâneo</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                      Mais Rápido
                    </span>
                  </div>
                  <div className="text-base font-extrabold text-slate-900 mt-1">
                    {formatCentsToBRL(pixPricing.totalAmountCents)}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {formatCentsToBRL(pixPricing.baseAmountCents)} + {formatCentsToBRL(pixPricing.feeCents)} (taxa de serviço 10%)
                  </p>
                </div>
              </button>

              {/* Opção Cartão de Crédito 1x */}
              <button
                type="button"
                onClick={() => onChange({ paymentMethod: 'CREDIT_CARD' })}
                className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${
                  data.paymentMethod === 'CREDIT_CARD'
                    ? 'border-sky-500 bg-sky-50/50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    data.paymentMethod === 'CREDIT_CARD' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <CreditCard size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-display font-bold text-slate-900 text-sm">
                    <span>Cartão de Crédito</span>
                    <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded font-bold">
                      1x À Vista
                    </span>
                  </div>
                  <div className="text-base font-extrabold text-slate-900 mt-1">
                    {formatCentsToBRL(cardPricing.totalAmountCents)}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {formatCentsToBRL(cardPricing.baseAmountCents)} + {formatCentsToBRL(cardPricing.feeCents)} (taxa de serviço 10%)
                  </p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Botões de Ação */}
      <div className="pt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="py-3 px-5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 flex items-center gap-1.5"
        >
          <ArrowLeft size={16} />
          <span>Voltar</span>
        </button>

        {data.originType === 'CASA' || data.originType === 'LOCAL' ? (
          <div className="flex-1 py-3 px-4 rounded-xl text-center text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            Inscrições Categoria Local exclusivamente presenciais na sede da Prefeitura
          </div>
        ) : (
          <button
            type="submit"
            className="flex-1 py-3.5 px-6 rounded-xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Revisar Inscrição</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </form>
  );
};
