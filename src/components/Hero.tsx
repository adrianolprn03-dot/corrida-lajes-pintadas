import React from 'react';
import { ArrowRight, MapPin, Clock, ShieldCheck, Ticket } from 'lucide-react';
import { EventSettings } from '../types';
import { formatCentsToBRL } from '../lib/pricing';

interface HeroProps {
  settings: EventSettings;
  onOpenRegister: () => void;
  onOpenLookup: () => void;
  onOpenAdmin?: () => void;
  availableCapacity?: number | null;
}

export const Hero: React.FC<HeroProps> = ({
  settings,
  onOpenRegister,
  onOpenLookup,
}) => {
  const formattedBasePrice = formatCentsToBRL(settings.basePriceCents);

  return (
    <section className="bg-[#FCFBF7] text-[#101D2C] border-b border-[rgba(22,35,53,0.14)]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 pt-8 sm:pt-14 pb-12 sm:pb-16">
        
        {/* ABERTURA: Dominant Title (Left) + Typographic Date (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-10 sm:mb-14">
          
          {/* Left Column (8 cols): Event Label + Monumental Headline */}
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-widest text-[#E5640E] mb-3">
              <span>5ª Corrida de Emancipação Política</span>
              <span>•</span>
              <span>Lajes Pintadas / RN</span>
            </div>

            <h1 className="font-condensed font-extrabold text-[clamp(3.8rem,7.5vw,7.4rem)] uppercase tracking-[-0.02em] leading-[0.88] text-[#101D2C]">
              A CIDADE<br />
              <span className="text-[#E5640E]">É SUA PISTA.</span>
            </h1>

            <p className="mt-4 font-sans text-base sm:text-lg text-[#5D6672] max-w-2xl leading-relaxed">
              Percurso oficial de 5 km pelas ruas de Lajes Pintadas/RN. Vias totalmente pavimentadas e sinalizadas, cronometragem eletrônica por chip e premiação em troféus para atletas da casa e visitantes de todo o estado.
            </p>
          </div>

          {/* Right Column (4 cols): Typographic Date Composition */}
          <div className="lg:col-span-4 flex lg:justify-end">
            <div className="w-full lg:w-auto p-5 sm:p-6 border border-[rgba(22,35,53,0.14)] bg-white/60 rounded-[2px] flex items-center gap-5">
              <span className="font-condensed font-extrabold text-7xl sm:text-8xl text-[#101D2C] leading-none">
                26
              </span>
              <div className="flex flex-col">
                <span className="font-condensed font-extrabold text-2xl uppercase text-[#101D2C] leading-none">
                  DEZEMBRO
                </span>
                <span className="font-sans font-medium text-xs text-[#5D6672] uppercase tracking-wider mt-1">
                  2026 • Sábado
                </span>
                <span className="font-sans font-bold text-xs text-[#E5640E] uppercase tracking-wider mt-1">
                  Largada 06:00h
                </span>
                <span className="font-sans text-[11px] text-[#5D6672] mt-0.5">
                  Praça Monsenhor Freitas
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* FOTOGRAFIA PANORÂMICA: Wide Running Image */}
        <div className="relative w-full h-[275px] sm:h-[365px] rounded-[2px] overflow-hidden border border-[rgba(22,35,53,0.14)] mb-0 group">
          <img
            src="/assets/corredores_banner.webp"
            alt="Corredores em percurso de rua"
            className="w-full h-full object-cover object-center brightness-[0.92] contrast-[1.05]"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101D2C]/80 via-transparent to-black/20 pointer-events-none" />

          {/* Overlaid 5 KM Monumental Typography */}
          <div className="absolute bottom-5 left-5 sm:bottom-8 sm:left-8 z-10 text-white">
            <span className="font-sans text-[11px] sm:text-xs uppercase font-bold tracking-widest text-[#FF872E] block mb-1">
              Distância Oficial
            </span>
            <div className="font-condensed font-extrabold text-5xl sm:text-7xl uppercase leading-none tracking-tight">
              5 KM <span className="text-2xl sm:text-3xl font-bold font-sans tracking-normal opacity-90">Aferidos</span>
            </div>
          </div>

          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#101D2C]/85 backdrop-blur-sm border border-white/20 text-white text-xs font-sans font-medium rounded-[2px]">
            <ShieldCheck className="w-4 h-4 text-[#FF872E]" />
            <span>Circuito 100% Fechado</span>
          </div>
        </div>

        {/* FAIXA DE INSCRIÇÃO: Horizontal on Desktop, Grid on Mobile */}
        <div className="border-x border-b border-[rgba(22,35,53,0.14)] bg-white p-5 sm:p-7 rounded-b-[2px]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Price Column (3 cols) */}
            <div className="md:col-span-3 border-b md:border-b-0 md:border-r border-[rgba(22,35,53,0.14)] pb-4 md:pb-0 md:pr-6">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#5D6672] block">
                Valor da Inscrição
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-condensed font-extrabold text-3xl sm:text-4xl text-[#101D2C] leading-none">
                  {formattedBasePrice}
                </span>
                <span className="font-sans text-xs text-[#5D6672]">
                  (+ taxa Asaas)
                </span>
              </div>
              <span className="font-sans text-[11px] font-semibold text-[#E5640E] mt-1 block">
                1º Lote Oficial Disponível
              </span>
            </div>

            {/* Essential Conditions Column (4 cols) */}
            <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-[rgba(22,35,53,0.14)] pb-4 md:pb-0 md:pr-6">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#5D6672] block mb-1">
                Kit Oficial Incluso
              </span>
              <p className="font-sans text-xs sm:text-sm text-[#101D2C] leading-snug">
                Camisa Dry-Fit Oficial Laranja, Chip de Cronometragem Eletrônica, Número de Peito e Medalha Finisher de Metal para todos os concluintes.
              </p>
            </div>

            {/* Location & Time (2 cols) */}
            <div className="md:col-span-2 hidden lg:block">
              <div className="flex items-center gap-1.5 text-xs text-[#101D2C] font-semibold mb-1">
                <Clock className="w-3.5 h-3.5 text-[#E5640E]" />
                <span>06:00h da Manhã</span>
              </div>
              <div className="flex items-start gap-1.5 text-xs text-[#5D6672]">
                <MapPin className="w-3.5 h-3.5 text-[#5D6672] shrink-0 mt-0.5" />
                <span>Praça Monsenhor Freitas, Centro</span>
              </div>
            </div>

            {/* Main Action Button (3 cols) */}
            <div className="md:col-span-5 lg:col-span-3 flex flex-col sm:flex-row md:flex-col gap-2">
              {settings.status === 'OPEN' ? (
                <button
                  onClick={onOpenRegister}
                  className="w-full py-3.5 px-6 font-sans font-semibold text-sm sm:text-base text-[#101D2C] bg-[#F97316] hover:bg-[#FF8D3E] rounded-[2px] transition flex items-center justify-center gap-2 uppercase tracking-wide"
                >
                  <span>Garantir Vaga</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3.5 px-6 font-sans font-medium text-sm text-[#5D6672] bg-black/5 rounded-[2px] cursor-not-allowed uppercase"
                >
                  Inscrições em Breve
                </button>
              )}

              <button
                onClick={onOpenLookup}
                className="w-full py-2 px-3 font-sans font-medium text-xs text-[#5D6672] hover:text-[#101D2C] text-center"
              >
                Já se inscreveu? Consultar comprovante
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
