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
      if (window.scrollY > 400) {
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
      aria-label="Barra de ação rápida"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#070D18]/95 backdrop-blur-md border-t border-white/10 py-3 px-4 sm:px-6 shadow-[0_-6px_25px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-3 duration-200 text-white"
    >
      <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Quick Event Details */}
        <div className="flex items-center gap-3">
          <img
            src="/assets/brasao_lajes.webp"
            alt="Brasão"
            className="w-7 h-7 object-contain hidden sm:block filter drop-shadow-sm brightness-105"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-condensed font-extrabold text-sm uppercase text-white leading-none">
                5ª Corrida de Emancipação
              </span>
              <span className="hidden md:inline font-sans text-xs text-[#FF9D42]">
                • 5 KM • 26/12 • 06:00h
              </span>
            </div>
            <p className="font-sans text-[11px] text-white/70 hidden xs:block mt-0.5">
              1º Lote Oficial: <strong className="text-white">R$ 60,00</strong> (+ taxa Asaas) com Camisa e Medalha
            </p>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenLookup}
            className="px-3 py-2 font-sans font-medium text-xs text-white hover:text-[#FF7A00] border border-white/20 bg-white/5 rounded-[2px] transition flex items-center gap-1.5"
          >
            <Ticket className="w-3.5 h-3.5 text-[#FF7A00]" />
            <span className="hidden sm:inline">Minha</span> Inscrição
          </button>

          {settings.status === 'OPEN' ? (
            <button
              onClick={onOpenRegister}
              className="px-5 py-2.5 font-sans font-bold text-xs sm:text-sm text-[#070D18] bg-gradient-to-r from-[#FF7A00] to-[#FF5500] hover:from-[#FF8D24] hover:to-[#FF681A] rounded-[2px] transition flex items-center gap-1.5 uppercase tracking-wide shadow-md shadow-orange-600/30"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Inscrever-se</span>
              <ArrowRight className="w-4 h-4 hidden sm:inline" />
            </button>
          ) : (
            <button
              disabled
              className="px-4 py-2 font-sans font-medium text-xs text-white/40 bg-white/10 rounded-[2px] cursor-not-allowed"
            >
              Inscrições em Breve
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
