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
    <section className="relative overflow-hidden border-b border-slate-200 text-slate-900 bg-gradient-to-b from-white via-slate-50/50 to-white pt-8 pb-14 sm:pt-12 sm:pb-18 lg:pt-14 lg:pb-20">
      
      {/* ATMOSPHERIC BACKGROUND: Degradê suave com iluminação esportiva e textura sutil */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Soft Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-32 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[140px]" />
        {/* Subtle grid pattern for technical athletic feel */}
        <div 
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(#0f172a 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* MAIN CONTAINER */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP ROW: Two-column hero layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN (7 cols): Main Typography, Pricing, CTAs & Countdown */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Event Tagline & Official Date Badge */}
            <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-orange-600 animate-pulse" />
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-orange-800">
                26 de Dezembro de 2026 • 06:00h
              </span>
              <span className="text-orange-300">•</span>
              <span className="font-sans text-xs font-semibold text-slate-600">
                Lajes Pintadas/RN
              </span>
            </div>

            {/* Monumental Headline */}
            <div>
              <h1 className="font-condensed font-extrabold text-[clamp(2.6rem,5.2vw,5.2rem)] uppercase tracking-tight leading-[0.96] text-slate-950">
                5ª CORRIDA DE<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 drop-shadow-xs">
                  EMANCIPAÇÃO POLÍTICA
                </span>
              </h1>
              
              <p className="mt-4 font-sans text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                A tradicional prova pedestre de 5 km em celebração aos 63 anos de emancipação política de Lajes Pintadas. Percurso 100% asfaltado e sinalizado, cronometragem eletrônica oficial e premiação com troféus para atletas locais e visitantes.
              </p>
            </div>

            {/* Pricing & Batch Pill */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-baseline gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200/90 shadow-sm">
                <span className="font-sans text-[11px] font-bold text-orange-700 uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                  1º Lote Oficial
                </span>
                <span className="font-condensed font-extrabold text-3xl text-slate-950 leading-none">
                  {formattedBasePrice}
                </span>
                <span className="font-sans text-xs text-slate-500 font-medium">
                  (+ 10% taxa de serviço)
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50/90 px-3 py-2 rounded-xl border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Kit Completo Oficial Incluso</span>
              </div>
            </div>

            {/* Action CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              {settings.status === 'OPEN' ? (
                <button
                  type="button"
                  onClick={onOpenRegister}
                  className="px-8 py-4 font-sans font-bold text-base text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-orange-600 rounded-xl transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 uppercase tracking-wide shadow-lg shadow-orange-600/25 cursor-pointer"
                >
                  <Zap className="w-5 h-5 fill-current" />
                  <span>Garantir Minha Vaga</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  disabled
                  className="px-8 py-4 font-sans font-bold text-base text-slate-400 bg-slate-100 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 uppercase"
                >
                  <span>Inscrições em Breve</span>
                </button>
              )}

              <button
                type="button"
                onClick={onOpenLookup}
                className="px-6 py-4 font-sans font-bold text-sm text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Ticket className="w-4 h-4 text-orange-600" />
                <span>Consultar Inscrição</span>
              </button>
            </div>

            {/* Kit Items Quick Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span>Camisa Poliamida FPU 50+</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span>Chip Eletrônico</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span>Número de Peito</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
                <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Medalha Finisher</span>
              </div>
            </div>

            {/* Live Countdown Clock */}
            <div className="pt-2">
              <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-slate-500 block mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-600" />
                <span>Contagem Regressiva para a Largada (26/12 às 06:00h)</span>
              </span>
              <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-sm">
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-center shadow-xs">
                  <span className="font-condensed font-extrabold text-2xl sm:text-3xl text-slate-950 block leading-none">
                    {timeLeft.days}
                  </span>
                  <span className="font-sans text-[10px] uppercase tracking-wider text-slate-500 mt-1 block font-semibold">
                    Dias
                  </span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-center shadow-xs">
                  <span className="font-condensed font-extrabold text-2xl sm:text-3xl text-slate-950 block leading-none">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="font-sans text-[10px] uppercase tracking-wider text-slate-500 mt-1 block font-semibold">
                    Horas
                  </span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-center shadow-xs">
                  <span className="font-condensed font-extrabold text-2xl sm:text-3xl text-slate-950 block leading-none">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="font-sans text-[10px] uppercase tracking-wider text-slate-500 mt-1 block font-semibold">
                    Min
                  </span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-center shadow-xs">
                  <span className="font-condensed font-extrabold text-2xl sm:text-3xl text-orange-600 block leading-none">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="font-sans text-[10px] uppercase tracking-wider text-slate-500 mt-1 block font-semibold">
                    Seg
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (5 cols): Destaque Fotográfico Oficial da Prova */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[460px] rounded-3xl overflow-hidden border border-slate-200/90 shadow-2xl shadow-slate-300/60 bg-slate-900 group">
              
              {/* Foto Real da Corrida em Alta Definição */}
              <div className="relative aspect-[4/5] sm:aspect-[4/5] w-full overflow-hidden">
                <img
                  src="/assets/corrida_2025.webp"
                  alt="Atletas na linha de chegada da Corrida de Emancipação de Lajes Pintadas"
                  className="w-full h-full object-cover object-[center_28%] filter contrast-[1.05] brightness-[1.02] transform group-hover:scale-105 transition duration-700 ease-out"
                  loading="eager"
                  decoding="async"
                />

                {/* Suave degradê fotográfico interno para valorizar o pórtico e os corredores */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-slate-950/40" />

                {/* Badge Superior: Foto Oficial da Prova */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-900 text-[11px] font-bold uppercase tracking-wider shadow-sm">
                    <Award className="w-3.5 h-3.5 text-orange-600" />
                    <span>Registro Oficial • 2025</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-orange-600/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    Lajes Pintadas/RN
                  </span>
                </div>

                {/* Legenda Esportiva Inferior */}
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white space-y-2 pointer-events-none">
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
                    <span>Pórtico Oficial de Chegada</span>
                    <span>•</span>
                    <span>Rua Principal</span>
                  </div>
                  <p className="font-condensed font-extrabold text-xl sm:text-2xl uppercase leading-tight text-white drop-shadow-sm">
                    A energia contagiante de quem supera limites
                  </p>
                  <p className="font-sans text-xs text-slate-300 leading-relaxed">
                    Mais de 300 atletas celebrando o esporte, a saúde e a história da nossa cidade.
                  </p>
                </div>
              </div>

              {/* Barra de Status na base do card fotográfico */}
              <div className="bg-slate-950 px-5 py-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-medium text-slate-300">Circuito Homologado</span>
                </span>
                <span className="font-semibold text-orange-400">
                  Edição Histórica 2026
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* BOTTOM TELEMETRY HIGHLIGHTS BAR */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white border border-slate-200/90 shadow-sm rounded-2xl hover:border-orange-300 transition">
            <span className="font-sans text-[11px] text-orange-700 uppercase font-bold tracking-wider block">
              Distância Oficial
            </span>
            <span className="font-condensed font-extrabold text-2xl sm:text-3xl text-slate-950 block mt-0.5">
              5 KM Aferidos
            </span>
            <span className="font-sans text-[11px] text-slate-500 block mt-0.5">
              Asfalto com sinalização completa
            </span>
          </div>
          
          <div className="p-4 bg-white border border-slate-200/90 shadow-sm rounded-2xl hover:border-orange-300 transition">
            <span className="font-sans text-[11px] text-orange-700 uppercase font-bold tracking-wider block">
              Largada Pontual
            </span>
            <span className="font-condensed font-extrabold text-2xl sm:text-3xl text-slate-950 block mt-0.5">
              06:00h Manhã
            </span>
            <span className="font-sans text-[11px] text-slate-500 block mt-0.5">
              Clima fresco no amanhecer
            </span>
          </div>

          <div className="p-4 bg-white border border-slate-200/90 shadow-sm rounded-2xl hover:border-orange-300 transition">
            <span className="font-sans text-[11px] text-orange-700 uppercase font-bold tracking-wider block">
              Concentração
            </span>
            <span className="font-condensed font-extrabold text-xl sm:text-2xl text-slate-950 truncate block mt-0.5">
              Praça Monsenhor Freitas
            </span>
            <span className="font-sans text-[11px] text-slate-500 block mt-0.5">
              Centro de Lajes Pintadas/RN
            </span>
          </div>

          <div className="p-4 bg-white border border-slate-200/90 shadow-sm rounded-2xl hover:border-orange-300 transition">
            <span className="font-sans text-[11px] text-orange-700 uppercase font-bold tracking-wider block">
              Premiação Geral
            </span>
            <span className="font-condensed font-extrabold text-xl sm:text-2xl text-slate-950 block mt-0.5">
              Troféus & Medalhas
            </span>
            <span className="font-sans text-[11px] text-slate-500 block mt-0.5">
              Finisher para 100% concluintes
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
