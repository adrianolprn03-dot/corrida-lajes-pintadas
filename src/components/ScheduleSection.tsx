import React from 'react';
import { Clock, Calendar, CheckCircle2, Flame } from 'lucide-react';

export const ScheduleSection: React.FC = () => {
  const scheduleEvents = [
    {
      time: '05:00',
      title: 'Abertura da Arena & Guarda-Volumes',
      desc: 'Acolhimento dos atletas na Praça Monsenhor Freitas. Tenda de apoio e depósito de pertences identificado.',
    },
    {
      time: '05:30',
      title: 'Concentração Geral de Pelotões',
      desc: 'Chamada dos atletas para alinhamento nas baias e ativação esportiva.',
    },
    {
      time: '05:45',
      title: 'Aquecimento Técnico & Briefing',
      desc: 'Alongamento guiado com educador físico e orientações finais da comissão de arbitragem.',
    },
    {
      time: '06:00',
      title: 'Largada Oficial 5 KM',
      desc: 'Disparo pontual da largada para todas as categorias com cronometragem eletrônica ativa.',
      isMain: true,
    },
    {
      time: '07:15',
      title: 'Cerimônia Oficial de Pódios',
      desc: 'Premiação solene com troféus para Casa, Visitante e PCD (Masculino e Feminino).',
    },
    {
      time: '08:30',
      title: 'Encerramento & Café Comunitário',
      desc: 'Celebração cívica da emancipação de Lajes Pintadas/RN com café regional e hidratação.',
    },
  ];

  return (
    <section id="cronograma" className="bg-[#070D18] text-white py-16 sm:py-24 border-b border-white/10">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="mb-12">
          <span className="font-sans text-xs font-semibold uppercase tracking-widest text-[#FF7A00] block mb-2">
            Programação do Dia 26/12/2026
          </span>
          <h2 className="font-condensed font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-white leading-none">
            Cronograma da Manhã de Prova
          </h2>
          <p className="font-sans text-sm sm:text-base text-white/70 mt-3 max-w-2xl leading-relaxed">
            Pontualidade rigorosa para garantir clima fresco, segurança viária com trânsito 100% bloqueado e máximo rendimento aos atletas.
          </p>
        </div>

        {/* Schedule Grid: Clean Rectangular Cards with 1px Dividers */}
        <div className="border border-white/10 bg-[#0D1626] rounded-[4px] divide-y divide-white/10 overflow-hidden shadow-xl">
          {scheduleEvents.map((evt, idx) => (
            <div
              key={idx}
              className={`p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-white/[0.02] ${
                evt.isMain ? 'bg-orange-500/10 border-l-4 border-l-[#FF7A00]' : ''
              }`}
            >
              <div className="flex items-start sm:items-center gap-4">
                <span className={`font-condensed font-extrabold text-2xl sm:text-3xl tracking-tight leading-none min-w-[70px] ${
                  evt.isMain ? 'text-[#FF9D42]' : 'text-white'
                }`}>
                  {evt.time}h
                </span>
                <div>
                  <h4 className="font-condensed font-bold text-lg sm:text-xl uppercase text-white leading-snug">
                    {evt.title}
                  </h4>
                  <p className="font-sans text-xs sm:text-sm text-white/70 mt-0.5">
                    {evt.desc}
                  </p>
                </div>
              </div>

              {evt.isMain && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 font-sans text-xs font-bold uppercase tracking-wider text-[#070D18] bg-gradient-to-r from-[#FF7A00] to-[#FF5500] rounded-[2px] self-start sm:self-auto shrink-0 shadow-sm">
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
