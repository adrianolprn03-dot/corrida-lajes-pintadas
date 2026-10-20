import React, { useState, useEffect } from 'react';
import { ArrowRight, Ticket } from 'lucide-react';
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
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#FCFBF7] border-t border-[rgba(22,35,53,0.14)] py-3 px-4 sm:px-6 shadow-[0_-4px_20px_rgba(16,29,44,0.06)] animate-in slide-in-from-bottom-3 duration-200"
    >
      <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Quick Event Details */}
        <div className="flex items-center gap-3">
          <img
            src="/assets/brasao_lajes.webp"
            alt="Brasão"
            className="w-7 h-7 object-contain hidden sm:block"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-condensed font-extrabold text-sm uppercase text-[#101D2C] leading-none">
                5ª Corrida de Emancipação
              </span>
              <span className="hidden md:inline font-sans text-xs text-[#5D6672]">
                • 5 KM • 26/12 • 06:00h
              </span>
            </div>
            <p className="font-sans text-[11px] text-[#5D6672] hidden xs:block mt-0.5">
              1º Lote Oficial: <strong className="text-[#101D2C]">R$ 60,00</strong> (+ taxa Asaas) com Camisa e Medalha
            </p>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenLookup}
            className="px-3 py-2 font-sans font-medium text-xs text-[#101D2C] hover:text-[#E5640E] border border-[rgba(22,35,53,0.14)] rounded-[2px] transition flex items-center gap-1.5"
          >
            <Ticket className="w-3.5 h-3.5 text-[#E5640E]" />
            <span className="hidden sm:inline">Minha</span> Inscrição
          </button>

          {settings.status === 'OPEN' ? (
            <button
              onClick={onOpenRegister}
              className="px-5 py-2.5 font-sans font-semibold text-xs sm:text-sm text-[#101D2C] bg-[#F97316] hover:bg-[#FF8D3E] rounded-[2px] transition flex items-center gap-1.5 uppercase tracking-wide"
            >
              <span>Inscrever-se</span>
              <ArrowRight className="w-4 h-4 hidden sm:inline" />
            </button>
          ) : (
            <button
              disabled
              className="px-4 py-2 font-sans font-medium text-xs text-[#5D6672] bg-black/5 rounded-[2px] cursor-not-allowed"
            >
              Inscrições em Breve
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
