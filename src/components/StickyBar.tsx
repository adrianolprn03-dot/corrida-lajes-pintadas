import React, { useState, useEffect } from 'react';
import { ArrowRight, Ticket, Zap, ShieldCheck } from 'lucide-react';
import { EventSettings } from '../types';

interface StickyBarProps {
  settings: EventSettings;
  onOpenRegister: () => void;
  onOpenLookup: () => void;
}

export const StickyBar: React.FC<StickyBarProps> = ({
  settings,
  onOpenRegister,
  onOpenLookup,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling past 450px
      if (window.scrollY > 450) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <aside 
      aria-label="Barra rápida de inscrição"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#060A11]/92 backdrop-blur-xl border-t border-white/10 py-3 px-4 shadow-[0_-10px_35px_rgba(0,0,0,0.6)] transition-all duration-300 animate-in slide-in-from-bottom-5"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Quick Event Info */}
        <div className="flex items-center gap-3">
          <img
            src="/assets/brasao_lajes.webp"
            alt="Brasão de Lajes Pintadas"
            className="w-8 h-8 object-contain hidden sm:block drop-shadow-md filter brightness-105"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-xs sm:text-sm text-white tracking-wide uppercase">
                5ª Corrida de Emancipação
              </span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                5 KM • 26/12 • 06:00H
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden xs:block">
              1º Lote Oficial: <strong className="text-white font-mono font-bold">R$ 60,00</strong> (+ R$ 0,99 Pix) • Camisa & Medalha Inclusas
            </p>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenLookup}
            className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center gap-1.5"
          >
            <Ticket className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Minha</span> Inscrição
          </button>

          {settings.status === 'OPEN' ? (
            <button
              onClick={onOpenRegister}
              className="px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-display font-black uppercase tracking-wider text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-lg shadow-orange-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Garantir Vaga</span>
              <ArrowRight className="w-4 h-4 hidden sm:inline" />
            </button>
          ) : (
            <button
              disabled
              className="px-4 py-2 rounded-xl text-xs font-mono font-semibold text-slate-500 bg-white/5 border border-white/10 cursor-not-allowed"
            >
              Inscrições Indisponíveis
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
