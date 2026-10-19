import React from 'react';
import { Shield, Lock, MapPin, Mail, Phone, ExternalLink, Award } from 'lucide-react';

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
    <footer className="bg-slate-50 text-slate-700 border-t border-slate-200">
      {/* Upper Footer: Municipal Branding & Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Institutional */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/brasao_lajes.webp"
                alt="Brasão Oficial de Lajes Pintadas/RN"
                className="h-12 w-auto object-contain drop-shadow-sm"
              />
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider text-slate-900">
                  5ª Corrida de Emancipação Política
                </h3>
                <p className="text-xs text-orange-600 font-bold">
                  Lajes Pintadas/RN • 26 de Dezembro de 2026
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-md">
              Evento esportivo oficial comemorativo da emancipação política do município de Lajes Pintadas/RN. Percurso de 5 km pelas ruas da cidade, promovendo saúde, integração comunitária e valorização do atletismo regional.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Conformidade estrita com a LGPD (Lei Federal 13.709/2018)</span>
            </div>
          </div>

          {/* Col 2: Athlete Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Acesso Rápido do Atleta
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button
                  onClick={onOpenAthleteArea}
                  className="hover:text-orange-600 transition font-medium"
                >
                  Minha Inscrição (Consultar/Pagar)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenRegulation('terms')}
                  className="hover:text-orange-600 transition font-medium"
                >
                  Regulamento Geral da Prova
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenRegulation('privacy')}
                  className="hover:text-orange-600 transition font-medium"
                >
                  Política de Privacidade de Dados
                </button>
              </li>
              <li>
                <a href="#categorias" className="hover:text-orange-600 transition font-medium">
                  Categorias Oficiais e Premiação
                </a>
              </li>
              <li>
                <a href="#percurso" className="hover:text-orange-600 transition font-medium">
                  Percurso e Entrega dos Kits
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Contacts & Admin Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Realização & Contato
            </h4>
            <div className="space-y-2 text-xs text-slate-600">
              <p className="text-slate-800 font-bold">
                Prefeitura Municipal de Lajes Pintadas
              </p>
              <p className="text-[11px] text-slate-500">
                Secretaria Municipal de Esportes e Lazer
              </p>
              <div className="flex items-center gap-2 pt-1 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span>Praça Monsenhor Freitas, Centro</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span>esportes@lajespintadas.rn.gov.br</span>
              </div>
              <div className="pt-3">
                <button
                  id="btn-admin-footer"
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-semibold shadow-sm transition"
                >
                  <Lock className="w-3.5 h-3.5 text-orange-600" />
                  <span>Painel Administrativo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-white border-t border-slate-200 py-4 text-center text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Prefeitura Municipal de Lajes Pintadas/RN. Todos os direitos reservados.</p>
          <p className="text-slate-600 font-medium">
            Pagamentos integrados via Gateway Asaas • Inscrição R$ 60,00 + taxa à vista
          </p>
        </div>
      </div>
    </footer>
  );
};
