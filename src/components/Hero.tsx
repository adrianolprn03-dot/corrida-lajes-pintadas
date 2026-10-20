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
    <section className="relative min-h-[720px] lg:min-h-[820px] flex items-center overflow-hidden border-b border-slate-800 text-white bg-slate-950">
      {/* BACKGROUND IMAGE: AUTHENTIC 2025 RACE PHOTO IN LAJES PINTADAS BEHIND TEXT */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/corrida_2025.webp"
          alt="Largada e Chegada da Corrida de Emancipação de Lajes Pintadas"
          className="w-full h-full object-cover object-[center_32%] filter brightness-[0.72] contrast-[1.12]"
          loading="eager"
          decoding="async"
        />
        {/* Layer 1: Left-to-right gradient ensuring text legibility while displaying the finish arch & runners */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/82 to-slate-950/45 sm:to-slate-950/25" />
        
        {/* Layer 2: Top and bottom vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/70" />
        
        {/* Layer 3: Warm subtle athletic glow */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-orange-600/15 rounded-full blur-[130px] pointer-events-none" />
      </div>

      {/* CONTENT LAYER */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column (7 cols): Main Typography & Event Information */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Monumental Headline */}
            <div>
              <h1 className="font-condensed font-extrabold text-[clamp(2.7rem,5.6vw,5.5rem)] uppercase tracking-[-0.02em] leading-[0.9] text-white">
                5ª CORRIDA DE<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] via-[#FFAE34] to-[#FF5500]">
                  EMANCIPAÇÃO POLÍTICA
                </span>
              </h1>
              
              <p className="mt-4 font-sans text-base sm:text-lg text-white/85 max-w-xl leading-relaxed">
                A tradicional prova de 5 km em comemoração aos 63 anos de emancipação política de Lajes Pintadas/RN. Vias asfaltadas e sinalizadas, cronometragem eletrônica por chip e premiação em troféus para atletas locais e visitantes.
              </p>
            </div>

            {/* Live Countdown Clock */}
            <div className="pt-2">
              <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-[#FF9D42] block mb-2">
                Contagem Regressiva para a Largada (26/12 às 06:00h)
              </span>
              <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-md">
                <div className="p-3 bg-black/40 backdrop-blur-md border border-white/15 rounded-[4px] text-center">
                  <span className="font-condensed font-extrabold text-2xl sm:text-3xl text-white block leading-none">
                    {timeLeft.days}
                  </span>
                  <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-wider text-white/60 mt-1 block">
                    Dias
                  </span>
                </div>
                <div className="p-3 bg-black/40 backdrop-blur-md border border-white/15 rounded-[4px] text-center">
                  <span className="font-condensed font-extrabold text-2xl sm:text-3xl text-white block leading-none">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-wider text-white/60 mt-1 block">
                    Horas
                  </span>
                </div>
                <div className="p-3 bg-black/40 backdrop-blur-md border border-white/15 rounded-[4px] text-center">
                  <span className="font-condensed font-extrabold text-2xl sm:text-3xl text-white block leading-none">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-wider text-white/60 mt-1 block">
                    Min
                  </span>
                </div>
                <div className="p-3 bg-black/40 backdrop-blur-md border border-white/15 rounded-[4px] text-center">
                  <span className="font-condensed font-extrabold text-2xl sm:text-3xl text-[#FF7A00] block leading-none">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-wider text-white/60 mt-1 block">
                    Seg
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (5 cols): Fast Registration Checkout Card */}
          <div className="lg:col-span-5">
            <div className="p-6 sm:p-8 bg-[#0D1626]/90 backdrop-blur-xl border border-white/20 rounded-[4px] shadow-2xl relative overflow-hidden">
              {/* Top Accent Orange Border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF7A00] via-[#FFAE34] to-[#FF5500]" />

              <div className="flex items-center justify-between mb-4">
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#FF9D42] bg-orange-500/15 px-2.5 py-1 rounded-[2px] border border-orange-500/30">
                  1º Lote Oficial
                </span>
                <span className="font-sans text-xs text-white/70 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#FF9D42]" />
                  <span>Largada 06:00h</span>
                </span>
              </div>

              {/* Price */}
              <div className="mb-4">
                <span className="font-sans text-[11px] text-white/60 uppercase font-semibold block">
                  Valor da Inscrição
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-condensed font-extrabold text-4xl sm:text-5xl text-white leading-none">
                    {formattedBasePrice}
                  </span>
                  <span className="font-sans text-xs text-white/60">
                    (+ 10% taxa de serviço)
                  </span>
                </div>
              </div>

              {/* Kit Details */}
              <div className="space-y-2 py-4 border-y border-white/10 text-xs font-sans text-white/85">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Camisa Dry-Fit Oficial Laranja (Tecido Esportivo)</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Chip de Cronometragem Eletrônica Descartável</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Número de Peito Personalizado com 4 Alfinetes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#FFAE34] shrink-0" />
                  <span>Medalha Finisher em Metal para 100% dos Concluintes</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-5 space-y-3">
                {settings.status === 'OPEN' ? (
                  <button
                    type="button"
                    onClick={onOpenRegister}
                    className="w-full py-4 px-6 font-sans font-bold text-sm sm:text-base text-[#070D18] bg-gradient-to-r from-[#FF7A00] to-[#FF5500] hover:from-[#FF8D24] hover:to-[#FF681A] rounded-[2px] transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 uppercase tracking-wide shadow-lg shadow-orange-600/30"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Garantir Minha Vaga</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-4 px-6 font-sans font-medium text-sm text-white/40 bg-white/10 rounded-[2px] cursor-not-allowed uppercase"
                  >
                    Inscrições Indisponíveis
                  </button>
                )}

                <button
                  type="button"
                  onClick={onOpenLookup}
                  className="w-full py-2.5 px-4 font-sans font-medium text-xs text-white/80 hover:text-white hover:bg-white/5 border border-white/15 rounded-[2px] transition flex items-center justify-center gap-2"
                >
                  <Ticket className="w-3.5 h-3.5 text-[#FF9D42]" />
                  <span>Já se inscreveu? Consultar comprovante</span>
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 text-center text-[11px] font-sans text-white/50">
                Pagamento seguro via Pix com reserva atômica de 30 minutos
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM TELEMETRY HIGHLIGHTS BAR */}
        <div className="mt-14 pt-8 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-white">
          <div className="p-3 bg-white/5 border border-white/10 rounded-[2px]">
            <span className="font-sans text-[10px] text-[#FF9D42] uppercase font-bold tracking-wider block">
              Distância Oficial
            </span>
            <span className="font-condensed font-extrabold text-2xl sm:text-3xl text-white">
              5 KM Aferidos
            </span>
          </div>
          
          <div className="p-3 bg-white/5 border border-white/10 rounded-[2px]">
            <span className="font-sans text-[10px] text-[#FF9D42] uppercase font-bold tracking-wider block">
              Largada Pontual
            </span>
            <span className="font-condensed font-extrabold text-2xl sm:text-3xl text-white">
              06:00h Manhã
            </span>
          </div>

          <div className="p-3 bg-white/5 border border-white/10 rounded-[2px]">
            <span className="font-sans text-[10px] text-[#FF9D42] uppercase font-bold tracking-wider block">
              Concentração
            </span>
            <span className="font-condensed font-extrabold text-xl sm:text-2xl text-white truncate block">
              Praça Monsenhor Freitas
            </span>
          </div>

          <div className="p-3 bg-white/5 border border-white/10 rounded-[2px]">
            <span className="font-sans text-[10px] text-[#FF9D42] uppercase font-bold tracking-wider block">
              Premiação
            </span>
            <span className="font-condensed font-extrabold text-xl sm:text-2xl text-white">
              Troféus & Medalhas
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
