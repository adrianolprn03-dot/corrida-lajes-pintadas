import React, { useState, useEffect } from 'react';
import { ArrowRight, Ticket, Zap } from 'lucide-react';
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
      // Aparece após 450px de rolagem (quando o usuário passa do topo do hero)
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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 px-4 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] transition-all duration-300 animate-in slide-in-from-bottom-5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Quick Event Info */}
        <div className="flex items-center gap-3">
          <img
            src="/assets/brasao_lajes.webp"
            alt="Brasão"
            className="w-8 h-8 object-contain hidden sm:block drop-shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xs sm:text-sm text-slate-900 tracking-wide uppercase">
                5ª Corrida de Emancipação
              </span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                5 KM • 26/12/2026
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden xs:block">
              Inscrição: <strong className="text-slate-900 font-bold">R$ 60,00</strong> (+ taxa Asaas) com Camisa Oficial
            </p>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenLookup}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition flex items-center gap-1.5"
          >
            <Ticket className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">Minha</span> Inscrição
          </button>

          {settings.status === 'OPEN' ? (
            <button
              onClick={onOpenRegister}
              className="px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-lg shadow-orange-500/25 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Garantir Vaga</span>
              <ArrowRight className="w-4 h-4 hidden sm:inline" />
            </button>
          ) : (
            <button
              disabled
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed"
            >
              Inscrições em Breve
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
