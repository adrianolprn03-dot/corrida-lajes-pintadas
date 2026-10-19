import React from 'react';
import { 
  MapPin, 
  Clock, 
  Compass, 
  ShieldCheck, 
  PackageCheck, 
  Droplet, 
  Flag,
  Calendar,
  HeartPulse,
  Award,
  Navigation
} from 'lucide-react';
import { EventSettings } from '../types';

interface EventOverviewProps {
  settings: EventSettings;
}

export const EventOverview: React.FC<EventOverviewProps> = ({ settings }) => {
  return (
    <section id="evento" className="py-20 bg-white text-slate-900 border-b border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
            <Compass className="w-3.5 h-3.5 text-orange-600" />
            <span>Infraestrutura da Prova</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-slate-900 uppercase tracking-tight">
            Percurso, Cronograma & <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">Estrutura</span>
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            Uma das corridas mais tradicionais do Agreste Potiguar, planejada com máxima segurança viária, cronometragem eletrônica e apoio médico municipal.
          </p>
        </div>

        {/* 4 Feature Highlights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
          
          <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Horário Oficial</span>
            <h3 className="font-display font-black text-2xl text-slate-900 mt-1">{settings.startTime}h da Manhã</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Largada pontual ao amanhecer para garantir temperatura amena e máximo rendimento dos atletas.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Concentração</span>
            <h3 className="font-display font-black text-lg text-slate-900 mt-1">Praça Monsenhor Freitas</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Coração do Centro de Lajes Pintadas/RN, com pórtico oficial de largada e chegada.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <Droplet className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Hidratação</span>
            <h3 className="font-display font-black text-2xl text-slate-900 mt-1">A Cada 2 KM</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Água mineral gelada em copos lacrados nos pontos estratégicos do percurso e na dispersão.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <HeartPulse className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Suporte Médico</span>
            <h3 className="font-display font-black text-lg text-slate-900 mt-1">Ambulância UTI</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Equipe da Secretaria Municipal de Saúde com socorristas e ambulância em todo o circuito.
            </p>
          </div>

        </div>

        {/* 2 Big Blocks: Timeline + Course Stages */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          
          {/* Cronograma do Dia (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-orange-100 text-orange-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-black text-lg text-slate-900 uppercase tracking-wider">
                  Programação do Dia 26/12
                </h3>
                <p className="text-xs text-slate-500">Cronograma oficial da manhã de emancipação</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { time: '05:00', title: 'Abertura da Arena', desc: 'Acolhimento dos corredores na Praça Monsenhor Freitas e ativação do som.' },
                { time: '05:30', title: 'Guarda-Volumes & Hidratação', desc: 'Depósito seguro de mochilas e hidratação pré-prova.' },
                { time: '05:45', title: 'Aquecimento Técnico & Briefing', desc: 'Orientação técnica de arbitragem sobre os postos e o retorno.' },
                { time: '06:00', title: 'Largada Oficial dos 5 km', desc: 'Pontualidade rigorosa com cronometragem eletrônica ativa.' },
                { time: '07:15', title: 'Cerimônia Oficial de Pódios', desc: 'Premiação com troféus para Casa e Visitante (Masc. e Fem.).' },
                { time: '08:30', title: 'Celebração da Emancipação', desc: 'Encerramento oficial com café regional e confraternização.' },
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-3.5 group">
                  <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-orange-100 text-orange-700 border border-orange-200 shrink-0">
                    {step.time}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{step.title}</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Percurso Passo a Passo (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-lg space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-black text-lg text-slate-900 uppercase tracking-wider">
                  Percurso Oficial de 5 km (Aferido)
                </h3>
                <p className="text-xs text-slate-500">Vias totalmente asfaltadas e pavimentadas com tráfego fechado</p>
              </div>
            </div>

            {/* Course Milestones Cards */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-orange-600 text-white font-black text-xs flex items-center justify-center">
                    0K
                  </span>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Pórtico de Largada</div>
                    <div className="text-[11px] text-slate-500">Praça Monsenhor Freitas • Centro</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">Tapete Chip</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-sky-600 text-white font-black text-xs flex items-center justify-center">
                    1.5K
                  </span>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Ponto de Hidratação 1</div>
                    <div className="text-[11px] text-slate-500">Avenida Principal • Água Mineral Gelada</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">Água Mineral</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-amber-600 text-white font-black text-xs flex items-center justify-center">
                    2.5K
                  </span>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Ponto de Retorno Oficial</div>
                    <div className="text-[11px] text-slate-500">Fiscalização Eletrônica & Batedores</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Checagem de Retorno</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-sky-600 text-white font-black text-xs flex items-center justify-center">
                    3.8K
                  </span>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Ponto de Hidratação 2</div>
                    <div className="text-[11px] text-slate-500">Trecho Final • Reta de Aproximação</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">Água Mineral</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-50 via-white to-amber-50 border-2 border-orange-300 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-orange-600 text-white font-black text-xs flex items-center justify-center shadow-md">
                    5K
                  </span>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Pórtico de Chegada & Finisher</div>
                    <div className="text-[11px] text-slate-600">Praça Monsenhor Freitas • Medalha & Frutas</div>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-orange-600 text-white shadow-sm">Medalha Finisher</span>
              </div>
            </div>

            {/* Kit Pickup Info Box */}
            <div className="p-4 rounded-2xl bg-orange-50/80 border border-orange-200 text-xs text-slate-800 space-y-1.5 shadow-sm">
              <div className="font-bold text-orange-900 flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-orange-600" />
                <span>Local de Entrega dos Kits Oficiais:</span>
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                {settings.kitPickupInfo}
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
