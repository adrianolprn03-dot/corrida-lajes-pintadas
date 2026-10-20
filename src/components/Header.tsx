import React, { useState } from 'react';
import { Calendar, MapPin, Search, Lock, Ticket, Menu, X, Sparkles, Flame, Shield, ArrowRight } from 'lucide-react';
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

  const getStatusBadge = () => {
    switch (settings.status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Inscrições Abertas
          </span>
        );
      case 'PREPARATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Em Preparação
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30">
            Inscrições Suspensas
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
            Encerradas
          </span>
        );
      case 'SOLD_OUT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30">
            Vagas Esgotadas
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#070C15]/90 backdrop-blur-xl border-b border-white/10 transition-all">
      {/* Top Bar Institucional Esportiva */}
      <div className="bg-[#05080E] text-slate-400 text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-[11px] truncate">
            <span className="font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              Prefeitura Municipal de Lajes Pintadas / RN
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline text-slate-300 font-medium">26 de Dezembro de 2026 • 06:00h</span>
            <span className="hidden md:inline text-slate-600">•</span>
            <span className="hidden md:inline-flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold uppercase text-[10px]">
              ★ 68 Anos de Emancipação
            </span>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:block">{getStatusBadge()}</div>
            <button
              id="btn-admin-header"
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-0.5 rounded-md border border-white/10 text-[11px] font-medium"
              title="Acesso da organização"
            >
              <Lock size={11} className="text-orange-400" />
              <span>Painel Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          
          {/* Logo e Identidade do Evento */}
          <div className="flex items-center gap-3 shrink-0">
            <a href="#" className="flex items-center gap-3 group">
              <div className="relative">
                <img
                  src="/assets/brasao_lajes.webp"
                  alt="Brasão Oficial de Lajes Pintadas"
                  className="h-11 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-[0_0_12px_rgba(255,85,0,0.3)]"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] sm:text-[11px] font-black text-orange-400 uppercase tracking-widest bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                    5ª Edição Oficial • 5 KM
                  </span>
                </div>
                <h1 className="font-display font-black text-base sm:text-lg text-white uppercase tracking-tight group-hover:text-orange-400 transition-colors leading-tight">
                  Corrida de Emancipação
                </h1>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                  Lajes Pintadas • Rio Grande do Norte
                </span>
              </div>
            </a>
          </div>

          {/* Links Centrais Desktop */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1.5 rounded-full border border-white/5">
            <a
              href="#percurso"
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all uppercase tracking-wider"
            >
              Percurso & Pace
            </a>
            <a
              href="#camisa"
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all uppercase tracking-wider"
            >
              Kit Oficial
            </a>
            <a
              href="#categorias"
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all uppercase tracking-wider"
            >
              Premiação
            </a>
            <a
              href="#cronograma"
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all uppercase tracking-wider"
            >
              Cronograma
            </a>
            <a
              href="#evento"
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all uppercase tracking-wider"
            >
              Informações
            </a>
            <a
              href="#faq"
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all uppercase tracking-wider"
            >
              FAQ
            </a>
          </nav>

          {/* Ações da Direita */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              onClick={onOpenLookup}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-xs font-bold tracking-wide uppercase transition-all shadow-sm"
              title="Consultar comprovante e status"
            >
              <Ticket size={14} className="text-orange-400" />
              <span>Minha Inscrição</span>
            </button>

            <button
              onClick={onOpenRegister}
              className="relative group overflow-hidden flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white font-display font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,85,0,0.4)] hover:shadow-[0_0_30px_rgba(255,85,0,0.7)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Flame size={14} className="text-amber-200 animate-pulse" />
              <span>Inscreva-se • R$ 60</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Botão Menu Mobile */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onOpenRegister}
              className="px-3 py-2 rounded-lg bg-orange-600 text-white font-display font-black text-xs uppercase shadow-md"
            >
              Inscrever
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 border border-white/10 transition-colors"
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#0A101C] border-b border-white/10 px-4 py-5 space-y-3 animate-fadeIn">
          <div className="pb-3 border-b border-white/10 flex items-center justify-between">
            {getStatusBadge()}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="text-xs text-slate-400 flex items-center gap-1.5"
            >
              <Lock size={12} className="text-orange-400" />
              <span>Painel Admin</span>
            </button>
          </div>

          <nav className="flex flex-col space-y-1">
            <a
              href="#percurso"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white uppercase"
            >
              Percurso & Pace
            </a>
            <a
              href="#camisa"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white uppercase"
            >
              Kit Oficial & Tamanhos
            </a>
            <a
              href="#categorias"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white uppercase"
            >
              Categorias & Premiação
            </a>
            <a
              href="#cronograma"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white uppercase"
            >
              Cronograma do Dia
            </a>
            <a
              href="#evento"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white uppercase"
            >
              Informações & Retirada de Kit
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white uppercase"
            >
              Dúvidas Frequentes
            </a>
          </nav>

          <div className="pt-3 border-t border-white/10 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLookup();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 text-slate-200 border border-white/10 font-bold text-sm uppercase"
            >
              <Ticket size={16} className="text-orange-400" />
              <span>Consultar Minha Inscrição</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRegister();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-display font-black text-sm uppercase shadow-lg shadow-orange-950/50"
            >
              <Flame size={16} />
              <span>Garantir Vaga • R$ 60,00</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
