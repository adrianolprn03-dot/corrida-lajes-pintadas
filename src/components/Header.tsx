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
    <header className="sticky top-0 z-40 bg-[#070D18]/95 backdrop-blur-md border-b border-white/10 text-white transition-all">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 h-20 sm:h-[90px] flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity */}
        <a href="#" className="flex items-center gap-3.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]">
          <img
            src="/assets/brasao_lajes.webp"
            alt="Brasão Oficial de Lajes Pintadas/RN"
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain filter drop-shadow-md brightness-105"
          />
          <div className="flex flex-col">
            <span className="font-condensed font-extrabold text-lg sm:text-2xl uppercase tracking-tight text-white leading-none">
              5ª Corrida de Emancipação
            </span>
            <span className="font-sans font-medium text-[11px] sm:text-xs uppercase tracking-wider text-[#FF9D42] mt-0.5">
              Lajes Pintadas • RN • 5 KM
            </span>
          </div>
        </a>

        {/* Center: Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center gap-7 font-sans font-medium text-sm text-white/80">
          <a
            href="#camisa"
            className="hover:text-[#FF7A00] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF7A00] py-1"
          >
            Camisa Oficial
          </a>
          <a
            href="#categorias"
            className="hover:text-[#FF7A00] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF7A00] py-1"
          >
            Categorias & Pódios
          </a>
          <a
            href="#cronograma"
            className="hover:text-[#FF7A00] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF7A00] py-1"
          >
            Cronograma
          </a>
          <a
            href="#evento"
            className="hover:text-[#FF7A00] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF7A00] py-1"
          >
            Entrega de Kits
          </a>
          <a
            href="#faq"
            className="hover:text-[#FF7A00] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF7A00] py-1"
          >
            Dúvidas
          </a>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenLookup}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 font-sans font-medium text-xs sm:text-sm text-white hover:text-[#FF7A00] border border-white/20 hover:border-white/50 rounded-[2px] transition bg-white/5"
          >
            <Ticket className="w-4 h-4 text-[#FF7A00]" />
            <span>Minha Inscrição</span>
          </button>

          {settings.status === 'OPEN' ? (
            <button
              onClick={onOpenRegister}
              className="px-5 sm:px-6 py-2.5 sm:py-3 font-sans font-bold text-xs sm:text-sm text-[#070D18] bg-gradient-to-r from-[#FF7A00] to-[#FF5500] hover:from-[#FF8D24] hover:to-[#FF681A] rounded-[2px] transition shadow-md shadow-orange-600/30 tracking-wide uppercase"
            >
              Inscrever-se
            </button>
          ) : (
            <button
              disabled
              className="px-5 py-2.5 font-sans font-medium text-xs sm:text-sm text-white/40 bg-white/10 rounded-[2px] cursor-not-allowed"
            >
              Inscrições em Breve
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white hover:text-[#FF7A00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#070D18] border-b border-white/10 px-5 py-6 space-y-4 font-sans animate-in slide-in-from-top-2 duration-200 text-white">
          <nav className="flex flex-col space-y-3 font-medium text-base text-white/90">
            <a
              href="#camisa"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-white/10 hover:text-[#FF7A00]"
            >
              Camisa Oficial & Medidas
            </a>
            <a
              href="#categorias"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-white/10 hover:text-[#FF7A00]"
            >
              Categorias & Pódios
            </a>
            <a
              href="#cronograma"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-white/10 hover:text-[#FF7A00]"
            >
              Cronograma do Dia
            </a>
            <a
              href="#evento"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-white/10 hover:text-[#FF7A00]"
            >
              Retirada dos Kits
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-[#FF7A00]"
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
              className="w-full py-2.5 px-4 font-sans font-medium text-sm text-white border border-white/20 rounded-[2px] flex items-center justify-center gap-2 bg-white/5"
            >
              <Ticket className="w-4 h-4 text-[#FF7A00]" />
              <span>Consultar Minha Inscrição</span>
            </button>
            {settings.status === 'OPEN' && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRegister();
                }}
                className="w-full py-3 px-4 font-sans font-bold text-sm text-[#070D18] bg-gradient-to-r from-[#FF7A00] to-[#FF5500] rounded-[2px] uppercase tracking-wide"
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
