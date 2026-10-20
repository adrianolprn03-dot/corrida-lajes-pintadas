import React from 'react';
import { 
  MapPin, 
  Clock, 
  ShieldCheck, 
  PackageCheck, 
  Droplet, 
  HeartPulse,
  Navigation,
  CheckCircle2,
  ExternalLink,
  CalendarCheck,
  Building2,
  Car
} from 'lucide-react';
import { EventSettings } from '../types';

interface EventOverviewProps {
  settings: EventSettings;
}

export const EventOverview: React.FC<EventOverviewProps> = ({ settings }) => {
  return (
    <section id="evento" className="bg-[#070D18] text-white py-16 sm:py-24 border-b border-white/10">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="mb-12">
          <span className="font-sans text-xs font-semibold uppercase tracking-widest text-[#FF7A00] block mb-2">
            Infraestrutura & Logística
          </span>
          <h2 className="font-condensed font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-white leading-none">
            Retirada do Kit & Arena
          </h2>
          <p className="font-sans text-sm sm:text-base text-white/70 mt-3 max-w-2xl leading-relaxed">
            Estrutura planejada pela Prefeitura Municipal de Lajes Pintadas/RN para acolher os atletas com segurança, suporte médico de emergência e hidratação regular.
          </p>
        </div>

        {/* 2-Column Grid: Kit Pickup (Left) + Arena Infrastructure (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (7 cols): Kit Pickup Detailed Card */}
          <div className="lg:col-span-7 p-6 sm:p-8 border border-white/10 bg-[#0D1626] rounded-[4px] space-y-6 shadow-xl">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-[2px] bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-[#FF7A00] shrink-0">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-condensed font-extrabold text-2xl uppercase text-white leading-none">
                  Entrega dos Kits Oficiais
                </h3>
                <span className="font-sans text-xs text-white/60 mt-0.5 block">
                  Apresentação obrigatória para retirada do número de peito e chip
                </span>
              </div>
            </div>

            {/* Address */}
            <div className="p-4 bg-white/[0.03] border border-white/10 rounded-[2px] text-xs font-sans text-white/90 space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-white">
                <Building2 className="w-4 h-4 text-[#FF7A00]" />
                <span>Local Oficial: Centro de Convivência dos Idosos</span>
              </div>
              <p className="text-white/70">
                Rua São Francisco, s/n - Centro, Lajes Pintadas - RN, CEP 59230-000 (próximo à Praça Monsenhor Freitas).
              </p>
            </div>

            {/* Horários */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 border border-white/10 bg-white/[0.02] rounded-[2px]">
                <div className="flex items-center gap-1.5 font-sans text-xs font-bold uppercase text-[#FF9D42] mb-1">
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>25/12 (Sexta) • Véspera</span>
                </div>
                <div className="font-condensed font-extrabold text-2xl text-white">
                  14:00h às 18:00h
                </div>
                <p className="font-sans text-xs text-white/60 mt-1">
                  Recomendado para moradores locais e atletas já na cidade.
                </p>
              </div>

              <div className="p-4 border border-white/10 bg-white/[0.02] rounded-[2px]">
                <div className="flex items-center gap-1.5 font-sans text-xs font-bold uppercase text-white/90 mb-1">
                  <Clock className="w-3.5 h-3.5 text-[#FF7A00]" />
                  <span>26/12 (Sábado) • Manhã</span>
                </div>
                <div className="font-condensed font-extrabold text-2xl text-white">
                  05:00h às 05:40h
                </div>
                <p className="font-sans text-xs text-white/60 mt-1">
                  Exclusivo para atletas visitantes residentes em outros municípios.
                </p>
              </div>
            </div>

            {/* Document Checklist */}
            <div className="space-y-2">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-white block">
                Documentos Obrigatórios na Retirada:
              </span>
              <div className="flex items-start gap-2.5 text-xs font-sans text-white/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Documento Oficial com Foto:</strong> RG, CNH ou Carteira Profissional original.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs font-sans text-white/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Comprovante de Inscrição:</strong> em versão digital no celular ou impresso (Área do Atleta).</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs font-sans text-white/80">
                <CheckCircle2 className="w-4 h-4 text-[#FF7A00] shrink-0 mt-0.5" />
                <span><strong className="text-white">Comprovante de Vínculo (Cat. Casa):</strong> Certidão, Título ou Comprovante de Residência.</span>
              </div>
            </div>

            <a
              href="https://maps.google.com/?q=Lajes+Pintadas+RN"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 font-sans font-semibold text-xs text-white bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 rounded-[2px] transition"
            >
              <Navigation className="w-4 h-4 text-[#FF7A00]" />
              <span>Ver Localização no Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/60" />
            </a>
          </div>

          {/* Right Column (5 cols): Arena Services */}
          <div className="lg:col-span-5 p-6 sm:p-8 border border-white/10 bg-[#0D1626] rounded-[4px] space-y-6 shadow-xl">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-[2px] bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#FF7A00]" />
              </div>
              <div>
                <h3 className="font-condensed font-extrabold text-2xl uppercase text-white leading-none">
                  Apoio ao Corredor
                </h3>
                <span className="font-sans text-xs text-white/60 mt-0.5 block">
                  Serviços disponíveis na arena de largada e chegada
                </span>
              </div>
            </div>

            <div className="space-y-3.5 font-sans">
              <div className="p-3.5 bg-white/[0.02] border border-white/10 rounded-[2px]">
                <h4 className="font-bold text-xs uppercase text-white">
                  Guarda-Volumes Gratuito
                </h4>
                <p className="text-xs text-white/70 mt-1">
                  Depósito seguro identificado com o seu número de peito na Praça Monsenhor Freitas.
                </p>
              </div>

              <div className="p-3.5 bg-white/[0.02] border border-white/10 rounded-[2px]">
                <h4 className="font-bold text-xs uppercase text-white">
                  Ambulância UTI & Socorristas
                </h4>
                <p className="text-xs text-white/70 mt-1">
                  Equipe médica municipal de plantão com viatura de suporte avançado em todo o circuito.
                </p>
              </div>

              <div className="p-3.5 bg-white/[0.02] border border-white/10 rounded-[2px]">
                <h4 className="font-bold text-xs uppercase text-white">
                  Hidratação Gelada & Mesa de Frutas
                </h4>
                <p className="text-xs text-white/70 mt-1">
                  Água mineral aos 1,5 km, 3,8 km e reposição com frutas frescas e isotônico na chegada.
                </p>
              </div>

              <div className="p-3.5 bg-white/[0.02] border border-white/10 rounded-[2px]">
                <h4 className="font-bold text-xs uppercase text-white">
                  Cronometragem por Chip Descartável
                </h4>
                <p className="text-xs text-white/70 mt-1">
                  Aferição eletrônica oficial no pórtico de largada, ponto de retorno e chegada.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
