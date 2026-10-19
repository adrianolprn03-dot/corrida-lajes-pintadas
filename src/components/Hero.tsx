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
  ChevronRight,
  Droplets,
  Timer,
  CheckCircle2,
  Users
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
  onOpenAdmin,
  availableCapacity,
}) => {
  // Live countdown timer state targeting 2026-12-26 06:00:00
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

  const totalRegistered = settings.maxCapacity && availableCapacity !== undefined && availableCapacity !== null
    ? Math.max(0, settings.maxCapacity - availableCapacity)
    : null;

  const capacityPercent = settings.maxCapacity && totalRegistered !== null
    ? Math.min(100, Math.round((totalRegistered / settings.maxCapacity) * 100))
    : null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-orange-50/20 to-slate-50 text-slate-900 pt-4 pb-8 lg:pt-6 lg:pb-12 border-b border-slate-200/80">
      
      {/* Dynamic Background Accents (Clean, Light, High Contrast - No Ghost/Muddy Overlays) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Subtle geometric dot matrix */}
        <div className="absolute inset-0 bg-dot-pattern opacity-40" />
        
        {/* Warm athletic ambient glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-orange-400/20 to-amber-300/10 blur-3xl" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-gradient-to-tr from-sky-400/15 to-transparent blur-3xl" />
        
        {/* Angled athletic speed lines in background */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-[0.03] bg-[repeating-linear-gradient(45deg,#000_0,#000_2px,transparent_0,transparent_16px)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN (58%): High-Impact Value & Conversion Flow   */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-3.5 sm:space-y-4 text-center lg:text-left">
            
            {/* Top Micro-Badges Bar: 68 Anos History + Official 5th Edition */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-amber-600/10 border border-amber-400/40 text-amber-900 text-xs font-black uppercase tracking-wider shadow-xs">
                <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>68 Anos de História • 1958 - 2026</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-300 text-orange-700 text-xs font-bold uppercase tracking-wider shadow-xs">
                <Flame className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span>5ª Edição Oficial</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-300 text-emerald-800 text-xs font-bold uppercase tracking-wider shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Inscrições Abertas</span>
              </div>
            </div>

            {/* Display Headline */}
            <div className="space-y-1.5">
              <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-[2.9rem] xl:text-[3.25rem] tracking-tight text-slate-900 leading-[1.05] uppercase">
                5ª Corrida de <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600">
                  Emancipação Política
                </span>
              </h1>

              {/* Event Specification Pill Strip */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 sm:gap-2.5 pt-0.5 text-xs sm:text-sm font-semibold text-slate-700">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200/90 shadow-xs">
                  <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span>Lajes Pintadas/RN</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200/90 shadow-xs">
                  <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>26 de Dezembro de 2026</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200/90 shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>06:00h</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-600 text-white font-bold shadow-xs">
                  <Zap className="w-3.5 h-3.5" />
                  <span>5 KM Oficial</span>
                </span>
              </div>
            </div>

            {/* Event Description (Crisp, High Contrast) */}
            <p className="text-slate-600 text-xs sm:text-sm lg:text-[15px] leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              Celebre os <strong>68 anos de emancipação de Lajes Pintadas/RN</strong> no maior encontro esportivo do Agreste Potiguar. Prova oficial com chip de cronometragem, medalha finisher, hidratação completa e a <strong>Camisa Oficial Laranja Dry-Fit</strong> inclusa no kit.
            </p>

            {/* ======================================================== */}
            {/* UNIFIED COUNTDOWN & CAPACITY HUD (Fits inside first fold) */}
            {/* ======================================================== */}
            <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-sm max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center justify-between mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <span className="flex items-center gap-1.5 text-orange-600">
                  <Timer className="w-3.5 h-3.5" />
                  <span>Cronômetro Oficial da Prova:</span>
                </span>
                <span className="text-[11px] text-slate-400 font-semibold lowercase">
                  largada em 26/12 às 06h
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl py-1.5 sm:py-2 px-1">
                  <div className="font-display font-black text-2xl sm:text-3xl text-slate-900 leading-none">
                    {String(timeLeft.days).padStart(2, '0')}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Dias</div>
                </div>

                <div className="bg-slate-50 border border-slate-200/70 rounded-xl py-1.5 sm:py-2 px-1">
                  <div className="font-display font-black text-2xl sm:text-3xl text-slate-900 leading-none">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Horas</div>
                </div>

                <div className="bg-slate-50 border border-slate-200/70 rounded-xl py-1.5 sm:py-2 px-1">
                  <div className="font-display font-black text-2xl sm:text-3xl text-slate-900 leading-none">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Minutos</div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-xl py-1.5 sm:py-2 px-1 relative overflow-hidden">
                  <div className="font-display font-black text-2xl sm:text-3xl text-orange-600 leading-none">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-orange-600 uppercase tracking-wider mt-0.5">Segundos</div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 animate-pulse" />
                </div>
              </div>

              {/* Integrated Capacity Strip inside HUD */}
              {settings.maxCapacity && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                    <Users className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <span>Lote Atual: <strong>{availableCapacity} vagas restantes</strong> de {settings.maxCapacity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 sm:w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${capacityPercent}%` }}
                      />
                    </div>
                    <span className="font-black text-orange-600 text-[11px]">{capacityPercent}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Primary Action Buttons (CTAs) - 100% visible on First Fold */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-0.5">
              {settings.status === 'OPEN' ? (
                <button
                  id="btn-hero-register"
                  onClick={onOpenRegister}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-xl text-base font-black text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-orange-600 shadow-md shadow-orange-600/30 hover:shadow-orange-600/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <Zap className="w-5 h-5 fill-white" />
                  <span>GARANTIR MINHA INSCRIÇÃO • R$ 60</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <div className="w-full sm:w-auto p-3 rounded-xl bg-slate-50 border border-slate-200 text-center sm:text-left">
                  <div className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                    Situação das Inscrições:
                  </div>
                  <div className="font-bold text-sm text-slate-900 mt-0.5">
                    {settings.status === 'PREPARATION' && 'Em preparação regulamentar'}
                    {settings.status === 'SUSPENDED' && 'Inscrições suspensas temporariamente'}
                    {settings.status === 'CLOSED' && 'Inscrições encerradas pela organização'}
                    {settings.status === 'SOLD_OUT' && 'Vagas esgotadas'}
                  </div>
                  {settings.status === 'PREPARATION' && onOpenAdmin && (
                    <button
                      id="btn-admin-hero-setup"
                      onClick={onOpenAdmin}
                      className="text-[11px] text-orange-600 hover:text-orange-700 font-semibold underline mt-1 block cursor-pointer"
                    >
                      Painel Administrativo: Abrir Inscrições &rarr;
                    </button>
                  )}
                </div>
              )}

              <button
                id="btn-hero-lookup"
                onClick={onOpenLookup}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-all cursor-pointer"
              >
                <span>Consultar Inscrição</span>
              </button>
            </div>

            {/* Trust & Inclusions Strip */}
            <div className="pt-1.5 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1.5 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span>Camisa Dry-Fit Inclusa</span>
              </span>
              <span className="inline-flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Chip de Cronometragem</span>
              </span>
              <span className="inline-flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Medalha Finisher</span>
              </span>
              <span className="inline-flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Pagamento Seguro Asaas</span>
              </span>
            </div>

          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN (42%): Editorial Sports Magazine Showcase    */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-md lg:max-w-none space-y-2.5">
              
              {/* Main Visual Showcase Card */}
              <div className="relative group rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl bg-white transition-all duration-300 hover:shadow-2xl">
                
                {/* Real Historic Photo Container */}
                <div className="relative aspect-[16/11] sm:aspect-[4/3] w-full overflow-hidden bg-slate-900">
                  <img
                    src="/assets/corrida_2025.webp"
                    alt="Chegada da Corrida de Emancipação de Lajes Pintadas"
                    className="w-full h-full object-cover object-[center_35%] transform transition-transform duration-700 group-hover:scale-105"
                    loading="eager"
                  />
                  
                  {/* Subtle Athletic Gradient Scrim for crisp text and badge contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-slate-950/10 pointer-events-none" />

                  {/* Top-Right: Prominent 68 Anos Commemorative Emblem Badge */}
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-white/95 backdrop-blur-md border border-amber-300/80 shadow-md">
                    <img
                      src="/assets/logo_68_anos_clean.webp"
                      alt="Selo Comemorativo 68 Anos de Emancipação"
                      className="w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-xs"
                    />
                    <div className="text-left">
                      <span className="block text-[9px] font-black uppercase text-amber-700 tracking-wider leading-none">
                        Edição Histórica
                      </span>
                      <span className="block text-xs font-black text-slate-900 leading-tight">
                        68 Anos Lajes
                      </span>
                    </div>
                  </div>

                  {/* Top-Left: Distance & Timing Tag */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-600 text-white shadow-md">
                      <Flame className="w-3.5 h-3.5" />
                      5 KM Oficial
                    </span>
                  </div>

                  {/* Bottom Caption & Location Anchor */}
                  <div className="absolute bottom-3 left-3 right-3 z-10 text-white">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        Pórtico de Chegada • Lajes Pintadas/RN
                      </span>
                      <span className="text-white/80 text-[11px] font-medium bg-black/40 px-2 py-0.5 rounded-md">
                        Edição Anterior
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-white/95 leading-tight mt-1">
                      Emoção, superação e orgulho no maior evento esportivo do município.
                    </p>
                  </div>
                </div>

                {/* Sub-Card: Camisa Oficial 03 / Laranja Quick Preview & Access */}
                <div className="p-2.5 sm:p-3 bg-gradient-to-r from-orange-50/80 via-white to-amber-50/60 border-t border-slate-100 flex items-center justify-between gap-3">
                  <a href="#camisa" className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0 group/camisa">
                    <img
                      src="/assets/camisa_oficial_lajes.webp"
                      alt="Camisa Oficial Laranja - Corrida de Emancipação"
                      className="w-11 h-11 sm:w-12 sm:h-12 object-contain rounded-xl border border-orange-200/80 bg-white p-1 shrink-0 drop-shadow-xs group-hover/camisa:scale-105 transition-transform"
                    />
                    <div className="truncate">
                      <div className="flex items-center gap-1 text-xs font-black uppercase text-slate-900 group-hover/camisa:text-orange-600 transition-colors">
                        <span>Camisa Oficial 03 • Laranja</span>
                        <ChevronRight className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium truncate">
                        Tecido Dry-Fit UV50+ • Inclusa na Inscrição
                      </p>
                    </div>
                  </a>
                  
                  <a
                    href="#camisa"
                    className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold whitespace-nowrap shadow-xs transition-colors shrink-0"
                  >
                    Ver Camisa
                  </a>
                </div>

              </div>

              {/* Sub-feature badges strip */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center gap-2">
                  <Droplets className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">Hidratação Completa</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center gap-2">
                  <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">Medalha Para Todos</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
