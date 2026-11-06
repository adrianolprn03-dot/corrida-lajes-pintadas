import React from 'react';
import { Shield, Lock, MapPin, Mail, ArrowRight, Ticket, CheckCircle2, Download } from 'lucide-react';
import { EventSettings } from '../types';
import { formatCentsToBRL, getActiveBatchLabel, getActiveBasePriceCents } from '../lib/pricing';

interface FooterProps {
  settings?: EventSettings;
  onOpenRegulation: (tab?: 'terms' | 'privacy') => void;
  onOpenAthleteArea: () => void;
  onOpenAdmin: () => void;
  onOpenRegister?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenRegulation,
  onOpenAthleteArea,
  onOpenAdmin,
  onOpenRegister,
}) => {
  const batchLabel = getActiveBatchLabel(settings);
  const formattedBase = formatCentsToBRL(getActiveBasePriceCents(settings));
  return (
    <>
      {/* CHAMADA FINAL (PRE-FOOTER CTA): Radiant Orange with Dark Title & Contrast Button */}
      <section className="bg-gradient-to-r from-[#FF7A00] to-[#FF5500] text-[#070D18] py-16 sm:py-20 border-b border-white/10">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#070D18]/80 block mb-2">
              Inscrições Oficiais — {batchLabel}
            </span>
            <h2 className="font-condensed font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-[#070D18] leading-none">
              Garanta sua Vaga na 5ª Corrida
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#070D18]/90 mt-2 max-w-xl font-medium">
              5 km pelas ruas de Lajes Pintadas/RN. Vagas limitadas por tamanho de camisa oficial.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {onOpenRegister && (
              <button
                type="button"
                onClick={onOpenRegister}
                className="py-4 px-8 font-sans font-bold text-sm sm:text-base bg-[#070D18] text-white hover:bg-black rounded-[2px] transition flex items-center justify-center gap-2 uppercase tracking-wide shrink-0 shadow-xl"
              >
                <span>Inscrever-se Agora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onOpenAthleteArea}
              className="py-4 px-6 font-sans font-semibold text-sm sm:text-base bg-white/20 hover:bg-white/30 text-[#070D18] rounded-[2px] transition flex items-center justify-center gap-2 uppercase tracking-wide shrink-0"
            >
              <Ticket className="w-4 h-4" />
              <span>Minha Inscrição</span>
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER INSTITUCIONAL */}
      <footer className="bg-[#050912] text-white/60 border-t border-white/10">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Col 1: Institutional Brand (5 cols) */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3.5">
                <img
                  src="/assets/brasao_lajes.webp"
                  alt="Brasão Oficial de Lajes Pintadas/RN"
                  className="h-12 w-auto object-contain filter drop-shadow-md brightness-105"
                />
                <div>
                  <h3 className="font-condensed font-extrabold text-xl uppercase tracking-tight text-white leading-none">
                    5ª Corrida de Emancipação
                  </h3>
                  <p className="font-sans text-xs text-[#FF9D42] mt-0.5 font-medium">
                    Prefeitura Municipal de Lajes Pintadas / RN
                  </p>
                </div>
              </div>

              <p className="font-sans text-xs text-white/70 leading-relaxed max-w-sm">
                Evento esportivo oficial em comemoração aos 68 anos de emancipação política de Lajes Pintadas/RN. Prova de 5 km pelas ruas da cidade, promovendo saúde, integração e valorização do atletismo regional.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-sans text-white/60">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>LGPD (Lei 13.709/2018)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Pagamento 100% Seguro</span>
                </div>
              </div>
            </div>

            {/* Col 2: Athlete Navigation (3 cols) */}
            <div className="md:col-span-3 space-y-3 font-sans">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Área do Atleta
              </h4>
              <ul className="space-y-2 text-xs text-white/70">
                <li>
                  <button
                    onClick={onOpenAthleteArea}
                    className="hover:text-[#FF7A00] transition font-medium text-left"
                  >
                    Consultar Inscrição (2ª Via / Pix)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onOpenRegulation('terms')}
                    className="hover:text-[#FF7A00] transition font-medium text-left"
                  >
                    Regulamento Oficial da Prova (Ler na Tela)
                  </button>
                </li>
                <li>
                  <a
                    href="/Regulamento_Corrida_Lajes_Pintadas_2026.pdf"
                    download="Regulamento_Corrida_Lajes_Pintadas_2026.pdf"
                    className="inline-flex items-center gap-1.5 text-[#FF9D42] hover:text-[#FF7A00] transition font-bold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar Regulamento em PDF</span>
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => onOpenRegulation('privacy')}
                    className="hover:text-[#FF7A00] transition font-medium text-left"
                  >
                    Política de Privacidade de Dados
                  </button>
                </li>
                <li>
                  <a href="#camisa" className="hover:text-[#FF7A00] transition font-medium">
                    Camisa Oficial & Medidas
                  </a>
                </li>
                <li>
                  <a href="#categorias" className="hover:text-[#FF7A00] transition font-medium">
                    Categorias & Pódios
                  </a>
                </li>
                <li>
                  <a href="#evento" className="hover:text-[#FF7A00] transition font-medium">
                    Retirada dos Kits
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Realização & Contacts (4 cols) */}
            <div className="md:col-span-4 space-y-3 font-sans">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Realização & Contato
              </h4>
              <div className="space-y-2.5 text-xs text-white/70">
                <p className="font-semibold text-white">
                  Secretaria Municipal de Esportes e Lazer
                </p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#FF7A00] shrink-0 mt-0.5" />
                  <span>Praça Monsenhor Freitas, s/n - Centro, Lajes Pintadas - RN</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#FF7A00] shrink-0" />
                  <a href="mailto:esportes@lajespintadas.rn.gov.br" className="hover:text-white transition">
                    esportes@lajespintadas.rn.gov.br
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-[#25D366] shrink-0 fill-current" viewBox="0 0 24 24">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2m.01 1.67c4.56 0 8.25 3.69 8.25 8.24 0 2.21-.86 4.28-2.42 5.84-1.56 1.56-3.64 2.42-5.84 2.42-1.44 0-2.85-.38-4.08-1.11l-.29-.17-3.04.8 1.02-2.96-.19-.31a8.15 8.15 0 01-1.25-4.51c0-4.55 3.7-8.24 8.25-8.24m4.54 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.29 3.78.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.3z"/>
                  </svg>
                  <a
                    href="https://wa.me/5584981858194?text=Ol%C3%A1%2C+Sidcley%21+Gostaria+de+tirar+uma+d%C3%BAvida+sobre+a+5%C2%AA+Corrida+de+Emancipa%C3%A7%C3%A3o+de+Lajes+Pintadas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-400 transition font-medium text-white/90 inline-flex items-center gap-1.5"
                  >
                    <span>(84) 98185-8194</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-1.5 py-0.5 rounded font-bold">Sidcley (WhatsApp)</span>
                  </a>
                </div>

                <div className="pt-2">
                  <a
                    href="https://wa.me/5584981858194?text=Ol%C3%A1%2C+Sidcley%21+Gostaria+de+tirar+uma+d%C3%BAvida+sobre+a+5%C2%AA+Corrida+de+Emancipa%C3%A7%C3%A3o+de+Lajes+Pintadas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/50 text-[#25D366] text-xs font-bold rounded-[2px] transition"
                  >
                    <span>Falar no WhatsApp com Sidcley</span>
                  </a>
                </div>

                <div className="pt-2">
                  <button
                    id="btn-admin-footer"
                    onClick={onOpenAdmin}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/15 hover:border-white/40 text-white/80 hover:text-white text-xs font-medium rounded-[2px] transition"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#FF7A00]" />
                    <span>Painel Administrativo</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 py-4 font-sans text-[11px] text-white/50">
          <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <p>© 2026 Prefeitura Municipal de Lajes Pintadas/RN. Todos os direitos reservados.</p>
            <p className="text-white/80 font-medium">
              {batchLabel}: {formattedBase} (+ 10% taxa) • 5 KM • 26/12/2026
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};
