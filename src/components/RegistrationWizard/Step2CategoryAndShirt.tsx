import React from 'react';
import { Home, Globe, Shirt, CreditCard, QrCode, AlertTriangle, Check, ArrowLeft, ArrowRight } from 'lucide-react';
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
  const [error, setError] = React.useState<string | null>(null);

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

    // Validação Casa
    if (data.originType === 'CASA') {
      if (!data.casaProofType) {
        setError('Para categoria Casa, selecione a declaração do seu vínculo com Lajes Pintadas/RN.');
        return;
      }

      // Se declarar morador atual, validar consistência com cidade e estado da Etapa 1
      if (['RESIDENTE', 'NATURAL_E_RESIDENTE'].includes(data.casaProofType)) {
        const normCity = city.trim().toLowerCase();
        const normState = state.trim().toUpperCase();
        if (normCity !== 'lajes pintadas' || normState !== 'RN') {
          setError(
            `Inconsistência de dados: Você declarou residir em Lajes Pintadas, mas informou "${city}/${state}" na etapa anterior. Naturais que residem em outra cidade devem marcar a opção "Natural de Lajes Pintadas".`
          );
          return;
        }
      }
    }

    // Validação da Camisa
    const selectedShirt = inventory.find((s) => s.size === data.shirtSize);
    if (!selectedShirt || selectedShirt.availableStock <= 0) {
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

      {/* 1. Origem: Casa ou Visitante */}
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
              data.originType === 'CASA'
                ? 'border-orange-500 bg-orange-50/50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div
              className={`p-2 rounded-lg ${
                data.originType === 'CASA' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Home size={20} />
            </div>
            <div>
              <div className="font-display font-bold text-slate-900 text-sm">Categoria Casa</div>
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

      {/* Declaração de Vínculo Casa (Condicional) */}
      {data.originType === 'CASA' && (
        <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200/80 space-y-3">
          <label className="block text-xs font-bold text-orange-950 uppercase tracking-wide">
            Declaração do Vínculo com Lajes Pintadas/RN <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {[
              {
                value: 'NATURAL',
                label: 'Natural de Lajes Pintadas',
                desc: 'Nasci em Lajes Pintadas/RN (mesmo residindo atualmente em outro município).',
              },
              {
                value: 'RESIDENTE',
                label: 'Morador atual',
                desc: 'Resido atualmente no município de Lajes Pintadas/RN.',
              },
              {
                value: 'NATURAL_E_RESIDENTE',
                label: 'Natural e morador atual',
                desc: 'Nasci e resido atualmente em Lajes Pintadas/RN.',
              },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  data.casaProofType === opt.value
                    ? 'border-orange-500 bg-white shadow-xs'
                    : 'border-orange-100 hover:bg-white/60'
                }`}
              >
                <input
                  type="radio"
                  name="casaProofType"
                  value={opt.value}
                  checked={data.casaProofType === opt.value}
                  onChange={() => onChange({ casaProofType: opt.value as CasaProofType })}
                  className="mt-1 text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <div className="font-bold text-xs text-slate-900">{opt.label}</div>
                  <p className="text-[11px] text-slate-500">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
          <p className="text-[11px] text-orange-800 italic">
            * A autodeclaração será conferida documentalmente no ato da retirada do kit atleta.
          </p>
        </div>
      )}

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

        {/* Mini Preview da Camisa */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200 mb-3">
          <img
            src="/assets/camisa_laranja_oficial.jpg"
            alt="Camisa Oficial Laranja"
            className="w-16 h-16 object-contain rounded-lg bg-white border border-slate-200 shrink-0"
          />
          <div className="text-xs">
            <span className="font-extrabold text-slate-900 block">Camisa Oficial Dry-Fit 5ª Edição</span>
            <span className="text-slate-500 block mt-0.5">
              Laranja com silk branco em alto contraste. Escolha o seu tamanho abaixo:
            </span>
          </div>
        </div>

        {/* Grade de Tamanhos */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {inventory.map((item) => {
            const isAvailable = item.availableStock > 0;
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
                  {isAvailable ? 'Disponível' : 'Esgotado'}
                </div>
              </button>
            );
          })}
        </div>
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
                R$ 60,00 + {formatCentsToBRL(pixPricing.feeCents)} (taxa de serviço 10%)
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
                R$ 60,00 + {formatCentsToBRL(cardPricing.feeCents)} (taxa de serviço 10%)
              </p>
            </div>
          </button>
        </div>
      </div>

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

        <button
          type="submit"
          className="flex-1 py-3.5 px-6 rounded-xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-2"
        >
          <span>Revisar Inscrição</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
};
