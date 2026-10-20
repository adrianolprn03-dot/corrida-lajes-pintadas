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
    <header className="sticky top-0 z-40 bg-[#FCFBF7] border-b border-[rgba(22,35,53,0.14)] transition-all">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 h-20 sm:h-[94px] flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity */}
        <a href="#" className="flex items-center gap-3.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007CA0]">
          <img
            src="/assets/brasao_lajes.webp"
            alt="Brasão Oficial de Lajes Pintadas/RN"
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
          />
          <div className="flex flex-col">
            <span className="font-condensed font-extrabold text-lg sm:text-2xl uppercase tracking-tight text-[#101D2C] leading-none">
              5ª Corrida de Emancipação
            </span>
            <span className="font-sans font-medium text-[11px] sm:text-xs uppercase tracking-wider text-[#5D6672] mt-0.5">
              Lajes Pintadas • RN • 5 KM
            </span>
          </div>
        </a>

        {/* Center: Editorial Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center gap-7 font-sans font-medium text-sm text-[#101D2C]">
          <a
            href="#percurso"
            className="hover:text-[#E5640E] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#007CA0] py-1"
          >
            Percurso
          </a>
          <a
            href="#camisa"
            className="hover:text-[#E5640E] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#007CA0] py-1"
          >
            Camisa Oficial
          </a>
          <a
            href="#categorias"
            className="hover:text-[#E5640E] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#007CA0] py-1"
          >
            Categorias
          </a>
          <a
            href="#cronograma"
            className="hover:text-[#E5640E] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#007CA0] py-1"
          >
            Cronograma
          </a>
          <a
            href="#faq"
            className="hover:text-[#E5640E] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#007CA0] py-1"
          >
            Dúvidas
          </a>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenLookup}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 font-sans font-medium text-xs sm:text-sm text-[#101D2C] hover:text-[#E5640E] border border-[rgba(22,35,53,0.14)] hover:border-[#101D2C] rounded-[2px] transition bg-transparent"
          >
            <Ticket className="w-4 h-4 text-[#E5640E]" />
            <span>Minha Inscrição</span>
          </button>

          {settings.status === 'OPEN' ? (
            <button
              onClick={onOpenRegister}
              className="px-5 sm:px-6 py-2.5 sm:py-3 font-sans font-semibold text-xs sm:text-sm text-[#101D2C] bg-[#F97316] hover:bg-[#FF8D3E] rounded-[2px] transition shadow-none tracking-wide uppercase"
            >
              Inscrever-se
            </button>
          ) : (
            <button
              disabled
              className="px-5 py-2.5 font-sans font-medium text-xs sm:text-sm text-[#5D6672] bg-black/5 rounded-[2px] cursor-not-allowed"
            >
              Inscrições em Breve
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#101D2C] hover:text-[#E5640E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007CA0]"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FCFBF7] border-b border-[rgba(22,35,53,0.14)] px-5 py-6 space-y-4 font-sans animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3 font-medium text-base text-[#101D2C]">
            <a
              href="#percurso"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[rgba(22,35,53,0.08)] hover:text-[#E5640E]"
            >
              Percurso Oficial
            </a>
            <a
              href="#camisa"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[rgba(22,35,53,0.08)] hover:text-[#E5640E]"
            >
              Camisa Oficial & Medidas
            </a>
            <a
              href="#categorias"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[rgba(22,35,53,0.08)] hover:text-[#E5640E]"
            >
              Categorias & Pódios
            </a>
            <a
              href="#cronograma"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[rgba(22,35,53,0.08)] hover:text-[#E5640E]"
            >
              Cronograma do Dia
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-[#E5640E]"
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
              className="w-full py-2.5 px-4 font-sans font-medium text-sm text-[#101D2C] border border-[rgba(22,35,53,0.14)] rounded-[2px] flex items-center justify-center gap-2"
            >
              <Ticket className="w-4 h-4 text-[#E5640E]" />
              <span>Consultar Minha Inscrição</span>
            </button>
            {settings.status === 'OPEN' && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRegister();
                }}
                className="w-full py-3 px-4 font-sans font-semibold text-sm text-[#101D2C] bg-[#F97316] hover:bg-[#FF8D3E] rounded-[2px] uppercase"
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
