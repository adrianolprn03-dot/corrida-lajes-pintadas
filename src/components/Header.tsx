import React, { useState } from 'react';
import { Menu, X, Ticket } from 'lucide-react';
import { EventSettings } from '../types';

interface HeaderProps {
  settings: EventSettings;
  onOpenLookup: () => void;
  onOpenAdmin: () => void;
  onOpenRegister: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onOpenLookup,
  onOpenAdmin,
  onOpenRegister,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-sm transition-all">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[68px] flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity (Harmonious & Proportional) */}
        <a href="#" className="flex items-center gap-2.5 sm:gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg shrink-0">
          <img
            src="/assets/brasao_lajes.webp"
            alt="Brasão Oficial de Lajes Pintadas/RN"
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-sm"
          />
          <div className="flex flex-col">
            <span className="font-bold text-xs sm:text-sm text-slate-900 leading-tight group-hover:text-orange-600 transition-colors whitespace-nowrap">
              5ª Corrida de Emancipação
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 leading-tight whitespace-nowrap">
              Lajes Pintadas • RN
            </span>
          </div>
        </a>

        {/* Center: Conforming, Single-line, Elegant Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 font-semibold text-xs xl:text-[13px] text-slate-600 uppercase tracking-wider">
          <a
            href="#camisa"
            className="hover:text-orange-600 transition-colors py-1 whitespace-nowrap focus-visible:outline-none focus-visible:text-orange-600"
          >
            Camisa
          </a>
          <a
            href="#categorias"
            className="hover:text-orange-600 transition-colors py-1 whitespace-nowrap focus-visible:outline-none focus-visible:text-orange-600"
          >
            Categorias
          </a>
          <a
            href="#cronograma"
            className="hover:text-orange-600 transition-colors py-1 whitespace-nowrap focus-visible:outline-none focus-visible:text-orange-600"
          >
            Cronograma
          </a>
          <a
            href="#evento"
            className="hover:text-orange-600 transition-colors py-1 whitespace-nowrap focus-visible:outline-none focus-visible:text-orange-600"
          >
            Retirada do Kit
          </a>
          <a
            href="#faq"
            className="hover:text-orange-600 transition-colors py-1 whitespace-nowrap focus-visible:outline-none focus-visible:text-orange-600"
          >
            Dúvidas
          </a>
        </nav>

        {/* Right: Quick Action Buttons (Guaranteed Single-Line) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            onClick={onOpenLookup}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 rounded transition bg-slate-50 hover:bg-slate-100 whitespace-nowrap"
          >
            <Ticket className="w-3.5 h-3.5 text-orange-600" />
            <span>Minha Inscrição</span>
          </button>

          {settings.status === 'OPEN' ? (
            <button
              onClick={onOpenRegister}
              className="px-3.5 sm:px-4 py-1.5 sm:py-2 font-bold text-xs sm:text-xs text-white bg-orange-600 hover:bg-orange-500 active:bg-orange-700 rounded transition shadow-sm uppercase tracking-wider whitespace-nowrap"
            >
              Inscrever-se
            </button>
          ) : (
            <button
              disabled
              className="px-3.5 py-1.5 font-medium text-xs text-slate-400 bg-slate-100 rounded cursor-not-allowed whitespace-nowrap"
            >
              Em Breve
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-orange-600 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-5 py-5 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2 font-medium text-sm text-slate-700">
            <a
              href="#camisa"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-slate-100 hover:text-orange-600"
            >
              Camisa Oficial
            </a>
            <a
              href="#categorias"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-slate-100 hover:text-orange-600"
            >
              Categorias & Pódios
            </a>
            <a
              href="#cronograma"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-slate-100 hover:text-orange-600"
            >
              Cronograma do Dia
            </a>
            <a
              href="#evento"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-slate-100 hover:text-orange-600"
            >
              Retirada do Kit
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-orange-600"
            >
              Dúvidas Frequentes
            </a>
          </nav>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLookup();
              }}
              className="w-full py-2.5 px-4 font-semibold text-xs text-slate-700 border border-slate-300 rounded-md flex items-center justify-center gap-2 bg-slate-50"
            >
              <Ticket className="w-3.5 h-3.5 text-orange-600" />
              <span>Consultar Minha Inscrição</span>
            </button>
            {settings.status === 'OPEN' && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRegister();
                }}
                className="w-full py-2.5 px-4 font-bold text-xs text-white bg-orange-600 hover:bg-orange-500 rounded-md uppercase tracking-wide"
              >
                Garantir Inscrição
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
