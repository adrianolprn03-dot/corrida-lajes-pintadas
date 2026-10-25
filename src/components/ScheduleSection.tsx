import React from 'react';
import { Clock, Calendar, CheckCircle2, Flame } from 'lucide-react';

export const ScheduleSection: React.FC = () => {
  const scheduleEvents = [
    {
      time: '15:30',
      title: 'Abertura da Arena & Guarda-Volumes',
      desc: 'Acolhimento dos atletas na Feira Livre Coberta. Tenda de apoio e depósito de pertences identificado.',
    },
    {
      time: '16:15',
      title: 'Concentração Geral de Pelotões',
      desc: 'Concentração na Feira Livre Coberta, chamada dos atletas para alinhamento nas baias e ativação esportiva.',
    },
    {
      time: '16:40',
      title: 'Aquecimento Técnico & Briefing',
      desc: 'Alongamento guiado com educador físico e orientações finais da comissão de arbitragem.',
    },
    {
      time: '17:00',
      title: 'Largada Oficial 5 KM',
      desc: 'Disparo pontual da largada para todas as categorias com cronometragem eletrônica ativa.',
      isMain: true,
    },
    {
      time: '18:15',
      title: 'Cerimônia Oficial de Pódios',
      desc: 'Premiação solene com troféus para Local e Visitante (Masculino e Feminino).',
    },
    {
      time: '19:15',
      title: 'Encerramento & Confraternização',
      desc: 'Celebração cívica da emancipação de Lajes Pintadas/RN com confraternização regional e hidratação.',
    },
  ];

  return (
    <section id="cronograma" className="bg-white text-slate-900 py-16 sm:py-24 border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="mb-12">
          <span className="font-sans text-xs font-semibold uppercase tracking-widest text-orange-600 block mb-2">
            Programação do Dia 26/12/2026
          </span>
          <h2 className="font-condensed font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-slate-900 leading-none">
            Cronograma Oficial da Prova
          </h2>
          <p className="font-sans text-sm sm:text-base text-slate-600 mt-3 max-w-2xl leading-relaxed">
            Pontualidade rigorosa para garantir segurança viária com trânsito 100% bloqueado e máximo rendimento aos atletas.
          </p>
        </div>

        {/* Schedule Grid: Clean Rectangular Cards with 1px Dividers */}
        <div className="border border-slate-200 bg-white rounded-lg divide-y divide-slate-200 overflow-hidden shadow-sm">
          {scheduleEvents.map((evt, idx) => (
            <div
              key={idx}
              className={`p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-slate-50/70 ${
                evt.isMain ? 'bg-orange-50/80 border-l-4 border-l-orange-600' : ''
              }`}
            >
              <div className="flex items-start sm:items-center gap-4">
                <span className={`font-condensed font-extrabold text-2xl sm:text-3xl tracking-tight leading-none min-w-[70px] ${
                  evt.isMain ? 'text-orange-600' : 'text-slate-900'
                }`}>
                  {evt.time}h
                </span>
                <div>
                  <h4 className="font-condensed font-bold text-lg sm:text-xl uppercase text-slate-900 leading-snug">
                    {evt.title}
                  </h4>
                  <p className="font-sans text-xs sm:text-sm text-slate-600 mt-0.5">
                    {evt.desc}
                  </p>
                </div>
              </div>

              {evt.isMain && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 font-sans text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-orange-600 to-amber-600 rounded self-start sm:self-auto shrink-0 shadow-xs">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>Momento Principal</span>
                </span>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
