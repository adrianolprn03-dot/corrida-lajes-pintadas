import React from 'react';
import { Shield, Lock, MapPin, Mail, ArrowRight, Ticket, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onOpenRegulation: (tab?: 'terms' | 'privacy') => void;
  onOpenAthleteArea: () => void;
  onOpenAdmin: () => void;
  onOpenRegister?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenRegulation,
  onOpenAthleteArea,
  onOpenAdmin,
  onOpenRegister,
}) => {
  return (
    <>
      {/* CHAMADA FINAL (PRE-FOOTER CTA): Orange Background with Dark-Blue Title & Contrast Button */}
      <section className="bg-[#F97316] text-[#101D2C] py-16 sm:py-20 border-b border-[rgba(22,35,53,0.14)]">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#101D2C]/80 block mb-2">
              Inscrições Oficiais do 1º Lote
            </span>
            <h2 className="font-condensed font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-[#101D2C] leading-none">
              Garanta sua Vaga na 5ª Corrida
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#101D2C]/85 mt-2 max-w-xl">
              5 km pelas ruas de Lajes Pintadas/RN. Vagas limitadas por tamanho de camisa oficial.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {onOpenRegister && (
              <button
                type="button"
                onClick={onOpenRegister}
                className="py-4 px-8 font-sans font-semibold text-sm sm:text-base bg-[#101D2C] text-white hover:bg-[#1A2E44] rounded-[2px] transition flex items-center justify-center gap-2 uppercase tracking-wide shrink-0"
              >
                <span>Inscrever-se Agora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onOpenAthleteArea}
              className="py-4 px-6 font-sans font-semibold text-sm sm:text-base bg-white/30 hover:bg-white/40 text-[#101D2C] rounded-[2px] transition flex items-center justify-center gap-2 uppercase tracking-wide shrink-0"
            >
              <Ticket className="w-4 h-4" />
              <span>Minha Inscrição</span>
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER INSTITUCIONAL: Clean Light Background */}
      <footer className="bg-[#FCFBF7] text-[#5D6672] border-t border-[rgba(22,35,53,0.14)]">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Col 1: Institutional Brand (5 cols) */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3.5">
                <img
                  src="/assets/brasao_lajes.webp"
                  alt="Brasão Oficial de Lajes Pintadas/RN"
                  className="h-12 w-auto object-contain"
                />
                <div>
                  <h3 className="font-condensed font-extrabold text-xl uppercase tracking-tight text-[#101D2C] leading-none">
                    5ª Corrida de Emancipação
                  </h3>
                  <p className="font-sans text-xs text-[#5D6672] mt-0.5">
                    Prefeitura Municipal de Lajes Pintadas / RN
                  </p>
                </div>
              </div>

              <p className="font-sans text-xs text-[#5D6672] leading-relaxed max-w-sm">
                Evento comemorativo da emancipação política de Lajes Pintadas/RN. Prova oficial de 5 km pelas ruas da cidade, promovendo saúde, integração e incentivo ao atletismo do Agreste Potiguar.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-sans text-[#5D6672]">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>LGPD (Lei 13.709/2018)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#007CA0]" />
                  <span>Gateway Asaas Integrado</span>
                </div>
              </div>
            </div>

            {/* Col 2: Athlete Navigation (3 cols) */}
            <div className="md:col-span-3 space-y-3 font-sans">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#101D2C]">
                Área do Atleta
              </h4>
              <ul className="space-y-2 text-xs text-[#5D6672]">
                <li>
                  <button
                    onClick={onOpenAthleteArea}
                    className="hover:text-[#E5640E] transition font-medium text-left"
                  >
                    Consultar Inscrição (2ª Via / Pix)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onOpenRegulation('terms')}
                    className="hover:text-[#E5640E] transition font-medium text-left"
                  >
                    Regulamento Oficial da Prova
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onOpenRegulation('privacy')}
                    className="hover:text-[#E5640E] transition font-medium text-left"
                  >
                    Política de Privacidade de Dados
                  </button>
                </li>
                <li>
                  <a href="#percurso" className="hover:text-[#E5640E] transition font-medium">
                    Percurso & Altimetria (+45m)
                  </a>
                </li>
                <li>
                  <a href="#camisa" className="hover:text-[#E5640E] transition font-medium">
                    Camisa Oficial & Medidas
                  </a>
                </li>
                <li>
                  <a href="#categorias" className="hover:text-[#E5640E] transition font-medium">
                    Categorias & Pódios
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Realização & Contacts (4 cols) */}
            <div className="md:col-span-4 space-y-3 font-sans">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#101D2C]">
                Realização & Contato
              </h4>
              <div className="space-y-2 text-xs text-[#5D6672]">
                <p className="font-semibold text-[#101D2C]">
                  Secretaria Municipal de Esportes e Lazer
                </p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#E5640E] shrink-0 mt-0.5" />
                  <span>Praça Monsenhor Freitas, s/n - Centro, Lajes Pintadas - RN</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#E5640E] shrink-0" />
                  <a href="mailto:esportes@lajespintadas.rn.gov.br" className="hover:text-[#101D2C]">
                    esportes@lajespintadas.rn.gov.br
                  </a>
                </div>

                <div className="pt-3">
                  <button
                    id="btn-admin-footer"
                    onClick={onOpenAdmin}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[rgba(22,35,53,0.14)] hover:border-[#101D2C] text-[#101D2C] text-xs font-medium rounded-[2px] transition"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#E5640E]" />
                    <span>Painel Administrativo</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[rgba(22,35,53,0.08)] py-4 font-sans text-[11px] text-[#5D6672]">
          <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <p>© 2026 Prefeitura Municipal de Lajes Pintadas/RN. Todos os direitos reservados.</p>
            <p className="text-[#101D2C] font-medium">
              Inscrição: R$ 60,00 (+ taxa Asaas) • 5 KM • 26/12/2026
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};
