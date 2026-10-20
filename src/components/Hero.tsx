import React, { useState, useEffect } from 'react';
import { ArrowRight, Clock, ShieldCheck, Ticket, Zap, Award } from 'lucide-react';
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
  availableCapacity,
}) => {
  const formattedBasePrice = formatCentsToBRL(settings.basePriceCents);

  // Live countdown to 2026-12-26 06:00:00 (Local time Lajes Pintadas / America/Fortaleza -03:00)
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2026-12-26T06:00:00-03:00').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden border-b border-slate-200 text-slate-900 bg-white pt-8 pb-14 sm:pt-12 sm:pb-20 lg:pt-14 lg:pb-24">
      {/* BACKGROUND IMAGE: FOTO AUTÊNTICA DA CORRIDA 2025 COM DEGRADÊ SUAVE PARA BRANCO */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/assets/corrida_2025.webp"
          alt="Largada e Chegada da Corrida de Emancipação de Lajes Pintadas"
          className="w-full h-full object-cover object-[center_34%] filter brightness-[1.02] contrast-[1.04]"
          loading="eager"
          decoding="async"
        />
        {/* Layer 1: Degradê suave horizontal - Branco no lado esquerdo para leitura perfeita, revelando os corredores e pórtico à direita */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 30% via-white/70 65% to-white/30 lg:to-white/15" />
        
        {/* Layer 2: Degradê vertical - Proteção do topo e fusão suave com o rodapé da primeira dobra */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-transparent 25% via-transparent 75% to-white" />
        
        {/* Layer 3: Brilho esportivo quente sutil */}
        <div className="absolute -top-24 -left-24 w-[550px] h-[550px] bg-orange-400/10 rounded-full blur-[140px]" />
      </div>

      {/* CONTENT LAYER */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column (7 cols): Main Typography & Event Information */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Monumental Headline */}
            <div>
              <h1 className="font-condensed font-extrabold text-[clamp(2.5rem,5.2vw,5.2rem)] uppercase tracking-tight leading-[0.98] text-slate-950">
                5ª CORRIDA DE<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 drop-shadow-sm">
                  EMANCIPAÇÃO POLÍTICA
                </span>
              </h1>
              
              <p className="mt-4 font-sans text-base sm:text-lg text-slate-700 max-w-xl leading-relaxed">
                A tradicional prova de 5 km em comemoração aos 63 anos de emancipação política de Lajes Pintadas/RN. Vias asfaltadas e sinalizadas, cronometragem eletrônica por chip e premiação em troféus para atletas locais e visitantes.
              </p>
            </div>

            {/* Live Countdown Clock */}
            <div className="pt-2">
              <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-orange-700 block mb-2">
                Contagem Regressiva para a Largada (26/12 às 06:00h)
              </span>
              <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-md">
                <div className="p-3 bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-sm rounded-xl text-center">
                  <span className="font-condensed font-extrabold text-2xl sm:text-3xl text-slate-950 block leading-none">
                    {timeLeft.days}
                  </span>
                  <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 mt-1 block font-semibold">
                    Dias
                  </span>
                </div>
                <div className="p-3 bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-sm rounded-xl text-center">
                  <span className="font-condensed font-extrabold text-2xl sm:text-3xl text-slate-950 block leading-none">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 mt-1 block font-semibold">
                    Horas
                  </span>
                </div>
                <div className="p-3 bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-sm rounded-xl text-center">
                  <span className="font-condensed font-extrabold text-2xl sm:text-3xl text-slate-950 block leading-none">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 mt-1 block font-semibold">
                    Min
                  </span>
                </div>
                <div className="p-3 bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-sm rounded-xl text-center">
                  <span className="font-condensed font-extrabold text-2xl sm:text-3xl text-orange-600 block leading-none">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 mt-1 block font-semibold">
                    Seg
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (5 cols): Fast Registration Checkout Card */}
          <div className="lg:col-span-5">
            <div className="p-6 sm:p-8 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-200/60 relative overflow-hidden">
              {/* Top Accent Orange Border */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />

              <div className="flex items-center justify-between mb-4">
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                  1º Lote Oficial
                </span>
                <span className="font-sans text-xs text-slate-500 flex items-center gap-1 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-orange-600" />
                  <span>Largada 06:00h</span>
                </span>
              </div>

              {/* Price */}
              <div className="mb-4">
                <span className="font-sans text-[11px] text-slate-500 uppercase font-bold block">
                  Valor da Inscrição
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-condensed font-extrabold text-4xl sm:text-5xl text-slate-950 leading-none">
                    {formattedBasePrice}
                  </span>
                  <span className="font-sans text-xs text-slate-500 font-semibold">
                    (+ 10% taxa de serviço)
                  </span>
                </div>
              </div>

              {/* Kit Details */}
              <div className="space-y-2.5 py-4 border-y border-slate-100 text-xs font-sans text-slate-700">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Camisa Dry-Fit Oficial Laranja (Tecido Esportivo)</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Chip de Cronometragem Eletrônica Descartável</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Número de Peito Personalizado com 4 Alfinetes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Medalha Finisher em Metal para 100% dos Concluintes</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-5 space-y-3">
                {settings.status === 'OPEN' ? (
                  <button
                    type="button"
                    onClick={onOpenRegister}
                    className="w-full py-4 px-6 font-sans font-bold text-sm sm:text-base text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-600 rounded-xl transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 uppercase tracking-wide shadow-lg shadow-orange-600/25"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Garantir Minha Vaga</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-4 px-6 font-sans font-bold text-sm text-slate-400 bg-slate-100 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 uppercase"
                  >
                    <span>Inscrições em Breve</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onOpenLookup}
                  className="w-full py-2.5 px-4 font-sans font-bold text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Ticket className="w-3.5 h-3.5 text-orange-600" />
                  <span>Já me inscrevi • Consultar inscrição</span>
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-sans text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ambiente Seguro</span>
                </span>
                <span>Pix ou Cartão 1x</span>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM TELEMETRY HIGHLIGHTS BAR */}
        <div className="mt-14 pt-8 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm rounded-xl">
            <span className="font-sans text-[10px] text-orange-700 uppercase font-bold tracking-wider block">
              Distância Oficial
            </span>
            <span className="font-condensed font-extrabold text-2xl sm:text-3xl text-slate-900">
              5 KM Aferidos
            </span>
          </div>
          
          <div className="p-3 bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm rounded-xl">
            <span className="font-sans text-[10px] text-orange-700 uppercase font-bold tracking-wider block">
              Largada Pontual
            </span>
            <span className="font-condensed font-extrabold text-2xl sm:text-3xl text-slate-900">
              06:00h Manhã
            </span>
          </div>

          <div className="p-3 bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm rounded-xl">
            <span className="font-sans text-[10px] text-orange-700 uppercase font-bold tracking-wider block">
              Concentração
            </span>
            <span className="font-condensed font-extrabold text-xl sm:text-2xl text-slate-900 truncate block">
              Praça Monsenhor Freitas
            </span>
          </div>

          <div className="p-3 bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm rounded-xl">
            <span className="font-sans text-[10px] text-orange-700 uppercase font-bold tracking-wider block">
              Premiação
            </span>
            <span className="font-condensed font-extrabold text-xl sm:text-2xl text-slate-900">
              Troféus & Medalhas
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
