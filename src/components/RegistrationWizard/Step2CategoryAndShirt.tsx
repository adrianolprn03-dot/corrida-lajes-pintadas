import React, { useState } from 'react';
import { Home, Globe, Shirt, CreditCard, QrCode, AlertTriangle, Check, ArrowLeft, ArrowRight, Building2, Info, Ruler, ChevronDown, ChevronUp } from 'lucide-react';
import {
  OriginType,
  AthleteGender,
  CasaProofType,
  ShirtSize,
  PaymentMethod,
  ShirtInventoryItem,
  EventSettings,
} from '../../types';
import { calculatePricing, formatCentsToBRL } from '../../lib/pricing';

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
}

interface Step2CategoryAndShirtProps {
  data: Step2Data;
  city: string;
  state: string;
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
  inventory,
  settings,
  onChange,
  onBack,
  onNext,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [showMeasurements, setShowMeasurements] = useState(false);

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

    // Validação da Camisa
    const selectedShirt = inventory.find((s) => s.size === data.shirtSize);
    const stockCount = selectedShirt?.visitorAvailableStock !== undefined ? selectedShirt.visitorAvailableStock : selectedShirt?.availableStock;
    if (!selectedShirt || (stockCount !== undefined && stockCount <= 0)) {
      setError(`O tamanho de camisa ${data.shirtSize} está esgotado no momento. Escolha outro tamanho disponível.`);
      return;
    }

    onNext();
  };

  return (
    <form onSubmit={handleNext} className="space-y-6">
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Origem: Local ou Visitante */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
          1. Origem da Participação <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              onChange({ originType: 'CASA' });
              setError(null);
            }}
            className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${
              data.originType === 'CASA' || data.originType === 'LOCAL'
                ? 'border-orange-500 bg-orange-50/50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div
              className={`p-2 rounded-lg ${
                data.originType === 'CASA' || data.originType === 'LOCAL' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Home size={20} />
            </div>
            <div>
              <div className="font-display font-bold text-slate-900 text-sm">Categoria Local</div>
              <p className="text-xs text-slate-500 mt-0.5">
                Naturais de Lajes Pintadas/RN ou moradores atuais da cidade.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              onChange({ originType: 'VISITANTE', casaProofType: undefined });
              setError(null);
            }}
            className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${
              data.originType === 'VISITANTE'
                ? 'border-sky-500 bg-sky-50/50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div
              className={`p-2 rounded-lg ${
                data.originType === 'VISITANTE' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Globe size={20} />
            </div>
            <div>
              <div className="font-display font-bold text-slate-900 text-sm">Categoria Visitante</div>
              <p className="text-xs text-slate-500 mt-0.5">
                Atletas que não nasceram e não residem em Lajes Pintadas/RN.
              </p>
            </div>
          </button>
        </div>
      </div>

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
                3. Camisa Oficial do Kit <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-orange-600 font-semibold">Cor única oficial: Laranja</span>
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
                  Camiseta Poliamida FPU 50+ Laranja 68 Anos + Medalha Finisher com Fita Sublimada.
                </span>
              </div>
            </div>

            {/* Grade de Tamanhos */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {inventory.map((item) => {
                const stockCount = item.visitorAvailableStock !== undefined ? item.visitorAvailableStock : item.availableStock;
                const isAvailable = stockCount > 0;
                const isSelected = data.shirtSize === item.size;

                return (
                  <button
                    key={item.size}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => onChange({ shirtSize: item.size })}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      !isAvailable
                        ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                        : isSelected
                        ? 'border-orange-500 bg-orange-500 text-white font-extrabold shadow-sm'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-orange-400'
                    }`}
                  >
                    <div className="font-display text-base uppercase">{item.size}</div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-white' : isAvailable ? 'text-emerald-600' : 'text-red-500'}`}>
                      {isAvailable ? `${stockCount} disp.` : 'Esgotado'}
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
                    R$ 50,00 + {formatCentsToBRL(pixPricing.feeCents)} (taxa de serviço 10%)
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
                    R$ 50,00 + {formatCentsToBRL(cardPricing.feeCents)} (taxa de serviço 10%)
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
