import React from 'react';
import { Calendar, MapPin, Search, Lock, Ticket, Menu, X, Sparkles } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const getStatusBadge = () => {
    switch (settings.status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Inscrições Abertas
          </span>
        );
      case 'PREPARATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Em Preparação
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Inscrições Suspensas
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            Inscrições Encerradas
          </span>
        );
      case 'SOLD_OUT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-300">
            Vagas Esgotadas
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm transition-all">
      {/* Top Bar Institucional Compacta (Clean Light) */}
      <div className="bg-slate-100 text-slate-600 text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-[11px] truncate">
            <span className="font-bold text-slate-900 tracking-wide uppercase">
              Prefeitura Municipal de Lajes Pintadas/RN
            </span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline text-slate-600 font-medium">26 de Dezembro de 2026</span>
            <span className="hidden md:inline text-slate-400">•</span>
            <span className="hidden md:inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300 font-bold">
              ★ Edição 68 Anos de Emancipação
            </span>
            <span className="hidden md:inline text-slate-400">•</span>
            <div className="hidden md:inline-flex items-center">{getStatusBadge()}</div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="btn-admin-header"
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 transition-colors bg-white hover:bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-200 text-[11px] font-semibold shadow-xs"
              title="Acesso restrito à comissão organizadora"
            >
              <Lock size={12} className="text-orange-600" />
              <span>Painel Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar (Clean Light Athletic) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo e Identidade do Evento */}
          <div className="flex items-center gap-3 shrink-0">
            <a href="#" className="flex items-center gap-2.5 group">
              <img
                src="/assets/brasao_lajes.webp"
                alt="Brasão Oficial de Lajes Pintadas"
                className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-sm"
              />
              <div className="flex flex-col justify-center">
                <span className="font-display font-black text-sm sm:text-base text-slate-900 leading-tight tracking-tight uppercase group-hover:text-orange-600 transition-colors">
                  5ª Corrida de <span className="text-orange-600">Emancipação</span>
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-sky-700 tracking-wider uppercase leading-none mt-0.5">
                  Lajes Pintadas/RN • 5 KM
                </span>
              </div>
            </a>
          </div>

          {/* Links Desktop Centrais e Alinhados */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <a 
              href="#evento" 
              className="px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-[13px] font-semibold text-slate-600 hover:text-orange-600 hover:bg-orange-50/80 transition-all whitespace-nowrap"
            >
              O Evento
            </a>
            <a 
              href="#camisa" 
              className="px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-[13px] font-semibold text-slate-600 hover:text-orange-600 hover:bg-orange-50/80 transition-all whitespace-nowrap"
            >
              Camisa Oficial
            </a>
            <a 
              href="#categorias" 
              className="px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-[13px] font-semibold text-slate-600 hover:text-orange-600 hover:bg-orange-50/80 transition-all whitespace-nowrap"
            >
              Categorias
            </a>
            <a 
              href="#regulamento" 
              className="px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-[13px] font-semibold text-slate-600 hover:text-orange-600 hover:bg-orange-50/80 transition-all whitespace-nowrap"
            >
              Regulamento
            </a>
            <a 
              href="#faq" 
              className="px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-[13px] font-semibold text-slate-600 hover:text-orange-600 hover:bg-orange-50/80 transition-all whitespace-nowrap"
            >
              Dúvidas
            </a>
          </nav>

          {/* Desktop Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenLookup}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/90 border border-slate-200/90 transition-all active:scale-95 whitespace-nowrap shadow-sm"
              title="Consultar minha inscrição e protocolo"
            >
              <Ticket size={14} className="text-sky-600" />
              <span>Minha Inscrição</span>
            </button>

            {settings.status === 'OPEN' ? (
              <button
                onClick={onOpenRegister}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-[13px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-600 shadow-md shadow-orange-600/20 hover:shadow-orange-600/30 transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
              >
                <span>Fazer Inscrição</span>
              </button>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed whitespace-nowrap"
              >
                Inscrições em Breve
              </button>
            )}
          </div>

          {/* Mobile & Tablet Controls (< lg) */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Tablet Quick Register */}
            {settings.status === 'OPEN' ? (
              <button
                onClick={onOpenRegister}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-600 shadow-md shadow-orange-600/20 transition-all whitespace-nowrap"
              >
                <span>Inscrição</span>
              </button>
            ) : null}

            {/* Mobile Ticket Button (< sm) */}
            <button
              onClick={onOpenLookup}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              title="Consultar inscrição"
            >
              <Ticket size={18} className="text-sky-600" />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Abrir menu de navegação"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown Light */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Situação da Prova:</span>
            {getStatusBadge()}
          </div>
          <nav className="flex flex-col space-y-1">
            <a
              href="#evento"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-orange-600 hover:bg-orange-50/80 transition-colors"
            >
              O Evento
            </a>
            <a
              href="#camisa"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-orange-600 hover:bg-orange-50/80 transition-colors"
            >
              Camisa Oficial
            </a>
            <a
              href="#categorias"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-orange-600 hover:bg-orange-50/80 transition-colors"
            >
              Categorias & Premiação
            </a>
            <a
              href="#regulamento"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-orange-600 hover:bg-orange-50/80 transition-colors"
            >
              Regulamento Oficial
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-orange-600 hover:bg-orange-50/80 transition-colors"
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
              className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center gap-2 shadow-sm"
            >
              <Ticket size={15} className="text-sky-600" />
              Consultar Minha Inscrição
            </button>
            {settings.status === 'OPEN' && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRegister();
                }}
                className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-600 shadow-md shadow-orange-600/20 text-center"
              >
                Fazer Minha Inscrição • R$ 60
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
