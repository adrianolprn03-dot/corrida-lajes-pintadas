import React from 'react';
import { Shield, Lock, MapPin, Mail, ExternalLink, Award, Sparkles, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onOpenRegulation: (tab?: 'terms' | 'privacy') => void;
  onOpenAthleteArea: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenRegulation,
  onOpenAthleteArea,
  onOpenAdmin,
}) => {
  return (
    <footer className="bg-[#04070D] text-slate-400 border-t border-white/10 relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-orange-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Upper Footer: Municipal Branding & Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Col 1: Institutional Brand (5 cols) */}
          <div className="md:col-span-5 space-y-5">
            <div className="flex items-center gap-3.5">
              <img
                src="/assets/brasao_lajes.webp"
                alt="Brasão Oficial do Município de Lajes Pintadas/RN"
                className="h-14 w-auto object-contain filter drop-shadow-lg brightness-105"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/30">
                    Edição Oficial 2026
                  </span>
                </div>
                <h3 className="font-display font-black text-lg uppercase tracking-wider text-white mt-1">
                  5ª Corrida de Emancipação
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Prefeitura Municipal de Lajes Pintadas / RN
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Evento esportivo e cívico em comemoração aos 63 anos de emancipação política de Lajes Pintadas/RN. Prova oficial de 5 km nas ruas da cidade, integrando atletas do Agreste Potiguar e fomentando a prática de esportes e a saúde preventiva.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-[11px]">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>LGPD (Lei 13.709/2018)</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Gateway Asaas Seguro</span>
              </div>
            </div>
          </div>

          {/* Col 2: Athlete Links (3 cols) */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white border-l-2 border-orange-500 pl-2">
              Acesso do Atleta
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button
                  onClick={onOpenAthleteArea}
                  className="hover:text-orange-400 transition font-medium text-left flex items-center gap-1.5 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 group-hover:scale-125 transition" />
                  <span>Minha Inscrição (2ª Via / Pix)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenRegulation('terms')}
                  className="hover:text-orange-400 transition font-medium text-left flex items-center gap-1.5 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-orange-500 transition" />
                  <span>Regulamento Geral da Prova</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenRegulation('privacy')}
                  className="hover:text-orange-400 transition font-medium text-left flex items-center gap-1.5 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-orange-500 transition" />
                  <span>Política de Privacidade de Dados</span>
                </button>
              </li>
              <li>
                <a 
                  href="#percurso" 
                  className="hover:text-orange-400 transition font-medium text-left flex items-center gap-1.5 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-orange-500 transition" />
                  <span>Percurso Oficial & Altimetria</span>
                </a>
              </li>
              <li>
                <a 
                  href="#camisa" 
                  className="hover:text-orange-400 transition font-medium text-left flex items-center gap-1.5 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-orange-500 transition" />
                  <span>Kit Atleta & Tabela de Tamanhos</span>
                </a>
              </li>
              <li>
                <a 
                  href="#categorias" 
                  className="hover:text-orange-400 transition font-medium text-left flex items-center gap-1.5 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-orange-500 transition" />
                  <span>Categorias & Premiação</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Contacts & Admin Access (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white border-l-2 border-cyan-400 pl-2">
              Realização & Contato
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <p className="text-white font-bold">
                Prefeitura Municipal de Lajes Pintadas
              </p>
              <p className="text-[11px] text-slate-400">
                Secretaria Municipal de Esportes, Lazer e Turismo
              </p>
              
              <div className="flex items-start gap-2 pt-1 text-slate-400">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>Praça Monsenhor Freitas, s/n - Centro, Lajes Pintadas - RN</span>
              </div>
              
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                <a href="mailto:esportes@lajespintadas.rn.gov.br" className="hover:text-white transition">
                  esportes@lajespintadas.rn.gov.br
                </a>
              </div>

              {/* Admin Button */}
              <div className="pt-3">
                <button
                  id="btn-admin-footer"
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 hover:border-orange-500/40 text-xs font-mono font-bold shadow-sm transition"
                >
                  <Lock className="w-3.5 h-3.5 text-orange-400" />
                  <span>Painel Administrativo</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#020408] border-t border-white/5 py-5 text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>© 2026 Prefeitura Municipal de Lajes Pintadas/RN. Todos os direitos reservados.</p>
          <p className="font-mono text-slate-400">
            Lote Oficial: R$ 60,00 • Pix Asaas Automático • 5 KM Aferidos
          </p>
        </div>
      </div>
    </footer>
  );
};
