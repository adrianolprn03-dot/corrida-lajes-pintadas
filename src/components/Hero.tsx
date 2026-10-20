import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Award, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Flame, 
  Droplets, 
  Timer, 
  CheckCircle2, 
  Sparkles,
  Ticket,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { EventSettings } from '../types';

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
  // Live countdown timer targeting 2026-12-26 06:00:00
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2026-12-26T06:00:00-03:00').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#060A11] text-white pt-8 pb-16 lg:pt-12 lg:pb-24 border-b border-white/10">
      
      {/* Background Lighting Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Carbon grid pattern */}
        <div className="absolute inset-0 bg-carbon-grid opacity-30" />
        
        {/* Diagonal speed lines */}
        <div className="absolute inset-0 bg-speed-lines opacity-20" />
        
        {/* High-energy radial glows */}
        <div className="absolute -top-32 right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-orange-600/20 via-amber-500/10 to-transparent blur-3xl" />
        <div className="absolute top-1/2 -left-48 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-cyan-500/15 via-blue-600/5 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 right-10 w-[450px] h-[450px] rounded-full bg-gradient-to-t from-orange-600/15 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Floating Badge Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-6 border-b border-white/5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-black uppercase tracking-wider">
              <Flame size={14} className="text-orange-400" />
              <span>Inscrições Oficiais 2026</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10 text-xs font-bold uppercase tracking-wider">
              <Calendar size={13} className="text-cyan-400" />
              <span>26 de Dezembro de 2026 • 06:00h</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10 text-xs font-bold uppercase tracking-wider">
              <MapPin size={13} className="text-amber-400" />
              <span>Praça Monsenhor Freitas • Centro</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Gateway Asaas Ativo • Pix Instantâneo</span>
          </div>
        </div>

        {/* Main Grid: Left Column Text & Conversion + Right Column Visual Kit */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN (7 COLS): Headline, Countdown & Action Card  */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 flex flex-col space-y-6 text-center lg:text-left">
            
            {/* Athletic Title */}
            <div>
              <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-widest text-cyan-400 mb-2">
                <Activity size={16} className="text-cyan-400 animate-pulse" />
                <span>O Maior Evento Esportivo do Agreste Potiguar</span>
              </div>
              <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tighter leading-[0.95] text-white">
                5ª Corrida de <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400 drop-shadow-[0_0_35px_rgba(255,85,0,0.5)]">
                  Emancipação
                </span>
              </h1>
              <p className="mt-3 text-lg sm:text-xl font-bold uppercase tracking-wider text-slate-300">
                Lajes Pintadas • RN <span className="text-orange-400 font-black">| 5 KM OFICIAL</span>
              </p>
              <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Venha celebrar os 68 anos de história de Lajes Pintadas em uma prova rápida, com cronometragem eletrônica, camisa técnica exclusiva, hidratação de elite e troféus para Geral e Casa.
              </p>
            </div>

            {/* Athletic Digital Countdown Clock */}
            <div className="bg-[#0B1322] border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-300">
                  <Timer size={14} className="text-orange-400" />
                  <span>Contagem Regressiva para a Largada</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded border border-orange-500/20">
                  Largada 06:00h
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
                <div className="bg-[#070B13] border border-white/5 rounded-2xl p-2.5 sm:p-3 relative group">
                  <span className="font-display font-black text-2xl sm:text-4xl text-white block tabular-nums">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                    Dias
                  </span>
                </div>

                <div className="bg-[#070B13] border border-white/5 rounded-2xl p-2.5 sm:p-3 relative group">
                  <span className="font-display font-black text-2xl sm:text-4xl text-white block tabular-nums">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                    Horas
                  </span>
                </div>

                <div className="bg-[#070B13] border border-white/5 rounded-2xl p-2.5 sm:p-3 relative group">
                  <span className="font-display font-black text-2xl sm:text-4xl text-white block tabular-nums">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                    Minutos
                  </span>
                </div>

                <div className="bg-[#070B13] border border-orange-500/30 rounded-2xl p-2.5 sm:p-3 relative group shadow-[0_0_15px_rgba(255,85,0,0.15)]">
                  <span className="font-display font-black text-2xl sm:text-4xl text-orange-400 block tabular-nums animate-pulse">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-orange-400">
                    Segundos
                  </span>
                </div>
              </div>
            </div>

            {/* Fast Action Checkout Card */}
            <div className="bg-gradient-to-r from-orange-500/10 via-[#0B1322] to-amber-500/10 border border-orange-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_10px_40px_rgba(255,85,0,0.15)] relative">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                    <span>1º Lote Oficial de Inscrição</span>
                  </div>
                  <div className="flex items-baseline justify-center sm:justify-start gap-2 mt-1">
                    <span className="font-display font-black text-3xl sm:text-4xl text-white">
                      R$ 60,00
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      + taxa Pix R$ 0,99
                    </span>
                  </div>
                  <span className="text-xs text-emerald-400 font-bold block mt-0.5">
                    ✓ Com direito à Camisa Técnica Oficial Laranja + Medalha Finisher
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
                  <button
                    onClick={onOpenRegister}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white font-display font-black text-base uppercase tracking-wider shadow-[0_0_30px_rgba(255,85,0,0.5)] hover:shadow-[0_0_45px_rgba(255,85,0,0.8)] hover:scale-[1.03] active:scale-[0.98] transition-all"
                  >
                    <Flame size={18} className="text-amber-200" />
                    <span>Garantir Minha Vaga</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>

              {/* Fast Secondary Link */}
              <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <span>Reserva com trava de 30 minutos garantida no Pix</span>
                <button
                  onClick={onOpenLookup}
                  className="text-slate-300 hover:text-orange-400 font-bold flex items-center gap-1 transition-colors underline decoration-orange-500/50"
                >
                  <Ticket size={13} className="text-orange-400" />
                  <span>Já se inscreveu? Consultar comprovante / 2ª via</span>
                </button>
              </div>
            </div>

            {/* 4 Telemetry Quick Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="athletic-card p-3 rounded-2xl flex items-center gap-2.5 text-left">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20">
                  <Zap size={18} />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Distância</span>
                  <span className="text-xs font-black text-white uppercase">5.0 KM Asfalto</span>
                </div>
              </div>

              <div className="athletic-card p-3 rounded-2xl flex items-center gap-2.5 text-left">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
                  <Timer size={18} />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Cronometragem</span>
                  <span className="text-xs font-black text-white uppercase">Chip Eletrônico</span>
                </div>
              </div>

              <div className="athletic-card p-3 rounded-2xl flex items-center gap-2.5 text-left">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                  <Droplets size={18} />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Hidratação</span>
                  <span className="text-xs font-black text-white uppercase">A cada 2 km</span>
                </div>
              </div>

              <div className="athletic-card p-3 rounded-2xl flex items-center gap-2.5 text-left">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                  <Award size={18} />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Premiação</span>
                  <span className="text-xs font-black text-white uppercase">Troféus + Medalha</span>
                </div>
              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN (5 COLS): Visual Athletic Kit & Trophy Card */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-md">
              
              {/* Backlight Glow Effect */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-orange-600/40 via-amber-500/20 to-cyan-500/20 blur-xl opacity-75 animate-pulse-subtle" />
              
              {/* Main Visual Card */}
              <div className="relative bg-[#090F1A] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden">
                
                {/* Top Badge on Card */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></span>
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      Kit Oficial Exclusivo
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase">
                    Modelo 2026
                  </span>
                </div>

                {/* Hero Shirt Image with Floating Depth */}
                <div className="relative my-2 py-4 flex items-center justify-center group cursor-pointer" onClick={onOpenRegister}>
                  <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 via-transparent to-transparent rounded-2xl" />
                  <img
                    src="/assets/camisa_oficial_lajes.webp"
                    alt="Camisa Oficial Laranja da 5ª Corrida"
                    className="w-full max-h-[320px] object-contain drop-shadow-[0_20px_35px_rgba(255,85,0,0.35)] transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-1"
                  />
                  
                  {/* Floating Tags */}
                  <div className="absolute -top-1 right-2 bg-[#060A11]/90 backdrop-blur-md border border-orange-500/40 px-3 py-1 rounded-full text-[11px] font-black text-orange-400 uppercase shadow-lg">
                    Dry-Fit UV50+
                  </div>
                  
                  <div className="absolute bottom-2 left-2 bg-[#060A11]/90 backdrop-blur-md border border-cyan-500/40 px-3 py-1 rounded-full text-[11px] font-black text-cyan-300 uppercase shadow-lg">
                    Laranja Oficial
                  </div>
                </div>

                {/* Kit Breakdown Pills */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/10 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 size={14} className="text-orange-400 shrink-0" />
                    <span>Camisa Técnica Pro</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 size={14} className="text-orange-400 shrink-0" />
                    <span>Número com Chip</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 size={14} className="text-orange-400 shrink-0" />
                    <span>Medalha de Metal</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 size={14} className="text-orange-400 shrink-0" />
                    <span>Seguro Atleta Pro</span>
                  </div>
                </div>

                {/* Bottom CTA on Card */}
                <button
                  onClick={onOpenRegister}
                  className="w-full mt-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/10 transition-colors"
                >
                  <span>Ver Grade de Tamanhos (PP ao XG)</span>
                  <ChevronRight size={14} />
                </button>

              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
