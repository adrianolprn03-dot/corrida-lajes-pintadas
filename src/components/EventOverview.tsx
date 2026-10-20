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
    <section id="evento" className="bg-[#F8FAFC] text-slate-900 py-16 sm:py-24 border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="mb-12">
          <span className="font-sans text-xs font-semibold uppercase tracking-widest text-orange-600 block mb-2">
            Infraestrutura & Logística
          </span>
          <h2 className="font-condensed font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-slate-900 leading-none">
            Retirada do Kit & Arena
          </h2>
          <p className="font-sans text-sm sm:text-base text-slate-600 mt-3 max-w-2xl leading-relaxed">
            Estrutura planejada pela Prefeitura Municipal de Lajes Pintadas/RN para acolher os atletas com segurança, suporte médico de emergência e hidratação regular.
          </p>
        </div>

        {/* 2-Column Grid: Kit Pickup (Left) + Arena Infrastructure (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (7 cols): Kit Pickup Detailed Card */}
          <div className="lg:col-span-7 p-6 sm:p-8 border border-slate-200 bg-white rounded-lg space-y-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
              <div className="w-10 h-10 rounded bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-condensed font-extrabold text-2xl uppercase text-slate-900 leading-none">
                  Entrega dos Kits Oficiais
                </h3>
                <span className="font-sans text-xs text-slate-500 mt-0.5 block">
                  Apresentação obrigatória para retirada do número de peito e chip
                </span>
              </div>
            </div>

            {/* Address */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded text-xs font-sans text-slate-800 space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-slate-900">
                <Building2 className="w-4 h-4 text-orange-600" />
                <span>Local Oficial: Centro de Convivência dos Idosos</span>
              </div>
              <p className="text-slate-600">
                Rua São Francisco, s/n - Centro, Lajes Pintadas - RN, CEP 59230-000 (próximo à Praça Monsenhor Freitas).
              </p>
            </div>

            {/* Horários */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 border border-slate-200 bg-slate-50/60 rounded">
                <div className="flex items-center gap-1.5 font-sans text-xs font-bold uppercase text-orange-700 mb-1">
                  <CalendarCheck className="w-3.5 h-3.5 text-orange-600" />
                  <span>25/12 (Sexta) • Véspera</span>
                </div>
                <div className="font-condensed font-extrabold text-2xl text-slate-900">
                  14:00h às 18:00h
                </div>
                <p className="font-sans text-xs text-slate-500 mt-1">
                  Recomendado para moradores locais e atletas já na cidade.
                </p>
              </div>

              <div className="p-4 border border-slate-200 bg-slate-50/60 rounded">
                <div className="flex items-center gap-1.5 font-sans text-xs font-bold uppercase text-slate-700 mb-1">
                  <Clock className="w-3.5 h-3.5 text-orange-600" />
                  <span>26/12 (Sábado) • Manhã</span>
                </div>
                <div className="font-condensed font-extrabold text-2xl text-slate-900">
                  05:00h às 05:40h
                </div>
                <p className="font-sans text-xs text-slate-500 mt-1">
                  Exclusivo para atletas visitantes residentes em outros municípios.
                </p>
              </div>
            </div>

            {/* Document Checklist */}
            <div className="space-y-2">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-slate-900 block">
                Documentos Obrigatórios na Retirada:
              </span>
              <div className="flex items-start gap-2.5 text-xs font-sans text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Documento Oficial com Foto:</strong> RG, CNH ou Carteira Profissional original.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs font-sans text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Comprovante de Inscrição:</strong> em versão digital no celular ou impresso (Área do Atleta).</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs font-sans text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Comprovante de Vínculo (Cat. Casa):</strong> Certidão, Título ou Comprovante de Residência.</span>
              </div>
            </div>

            <a
              href="https://maps.google.com/?q=Lajes+Pintadas+RN"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 font-sans font-semibold text-xs text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition"
            >
              <Navigation className="w-4 h-4 text-orange-600" />
              <span>Ver Localização no Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
          </div>

          {/* Right Column (5 cols): Arena Services */}
          <div className="lg:col-span-5 p-6 sm:p-8 border border-slate-200 bg-white rounded-lg space-y-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
              <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
                <ShieldCheck className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-condensed font-extrabold text-2xl uppercase text-slate-900 leading-none">
                  Apoio ao Corredor
                </h3>
                <span className="font-sans text-xs text-slate-500 mt-0.5 block">
                  Serviços disponíveis na arena de largada e chegada
                </span>
              </div>
            </div>

            <div className="space-y-3.5 font-sans">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded">
                <h4 className="font-bold text-xs uppercase text-slate-900">
                  Guarda-Volumes Gratuito
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Depósito seguro identificado com o seu número de peito na Praça Monsenhor Freitas.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded">
                <h4 className="font-bold text-xs uppercase text-slate-900">
                  Ambulância UTI & Socorristas
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Equipe médica municipal de plantão com viatura de suporte avançado em todo o circuito.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded">
                <h4 className="font-bold text-xs uppercase text-slate-900">
                  Hidratação Gelada & Mesa de Frutas
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Água mineral aos 1,5 km, 3,8 km e reposição com frutas frescas e isotônico na chegada.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded">
                <h4 className="font-bold text-xs uppercase text-slate-900">
                  Cronometragem por Chip Descartável
                </h4>
                <p className="text-xs text-slate-600 mt-1">
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
