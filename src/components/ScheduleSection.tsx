import React from 'react';
import { Clock, Calendar, Flag, Award, Sparkles, Coffee, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const ScheduleSection: React.FC = () => {
  const scheduleEvents = [
    {
      time: '05:00',
      title: 'Abertura da Arena & Guarda-Volumes',
      desc: 'Recepção dos atletas na Praça Monsenhor Freitas. Tenda de apoio, hidratação inicial e depósito de pertences.',
      badge: 'Arena Aberta',
      highlight: false,
    },
    {
      time: '05:30',
      title: 'Concentração Geral de Pelotões',
      desc: 'Chamada dos atletas para alinhamento inicial na área de transição e ativação esportiva.',
      badge: 'Alinhamento',
      highlight: false,
    },
    {
      time: '05:40',
      title: 'Aquecimento Guiado & Briefing Técnico',
      desc: 'Sessão de aquecimento e alongamento com profissional de educação física e orientações finais da arbitragem.',
      badge: 'Preparação',
      highlight: false,
    },
    {
      time: '06:00',
      title: 'LARGADA OFICIAL 5 KM',
      desc: 'Disparo pontual da buzina oficial para todas as categorias (Geral e Casa, Masculino e Feminino).',
      badge: 'Momento Principal',
      highlight: true,
    },
    {
      time: '06:50',
      title: 'Dispersão, Mesa de Frutas & Hidratação',
      desc: 'Recepção dos concluintes com entrega de água mineral, isotônicos e buffet variado de frutas tropicais.',
      badge: 'Pós-Prova',
      highlight: false,
    },
    {
      time: '07:15',
      title: 'Cerimônia Oficial de Premiação',
      desc: 'Subida ao pódio oficial dos 3 primeiros colocados de cada categoria para entrega de troféus e homenagens.',
      badge: 'Pódio & Troféus',
      highlight: false,
    },
    {
      time: '08:30',
      title: 'Encerramento das Festividades',
      desc: 'Confraternização dos atletas, comunidade e início das solenidades cívicas dos 68 anos de Lajes Pintadas.',
      badge: 'Celebração',
      highlight: false,
    },
  ];

  return (
    <section id="cronograma" className="py-20 bg-[#070C15] text-white border-b border-white/10 relative overflow-hidden">
      
      {/* Background Lighting */}
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-black uppercase tracking-wider mb-3">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Programação da Manhã Esportiva</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white">
            Cronograma do <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">Dia da Prova</span>
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
            Sábado, 26 de Dezembro de 2026. Programe-se com antecedência para aproveitar toda a arena e realizar seu aquecimento sem pressa.
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="max-w-4xl mx-auto">
          <div className="relative border-l-2 border-orange-500/30 ml-4 sm:ml-8 space-y-8 pl-6 sm:pl-10">
            {scheduleEvents.map((evt, idx) => (
              <div key={idx} className="relative group">
                
                {/* Node Dot */}
                <div className={`absolute -left-[31px] sm:-left-[47px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  evt.highlight
                    ? 'bg-orange-500 ring-4 ring-orange-500/30 text-white shadow-lg shadow-orange-500/50'
                    : 'bg-[#0B1220] border-2 border-slate-600 text-slate-400 group-hover:border-orange-500'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${evt.highlight ? 'bg-white' : 'bg-slate-400'}`}></div>
                </div>

                {/* Event Card */}
                <div className={`athletic-card p-5 sm:p-6 rounded-3xl border transition-all ${
                  evt.highlight
                    ? 'border-orange-500/40 bg-gradient-to-r from-orange-500/10 via-[#0B1322] to-amber-500/10 shadow-[0_0_25px_rgba(255,85,0,0.2)]'
                    : 'border-white/10 hover:border-white/20'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="font-display font-black text-2xl sm:text-3xl text-orange-400 tabular-nums">
                      {evt.time}h
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded border ${
                      evt.highlight
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                        : 'bg-white/5 text-slate-400 border-white/5'
                    }`}>
                      {evt.badge}
                    </span>
                  </div>

                  <h3 className="font-display font-black text-lg sm:text-xl text-white uppercase tracking-tight">
                    {evt.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                    {evt.desc}
                  </p>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Pro-Tips Callout */}
        <div className="max-w-4xl mx-auto mt-12 bg-[#090F1A] border border-cyan-500/30 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-4 text-xs">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
            <CheckCircle2 size={24} />
          </div>
          <div className="text-center sm:text-left">
            <span className="font-black text-white uppercase block text-sm">Dica de Atleta: Chegue com 45 minutos de antecedência</span>
            <span className="text-slate-400 mt-0.5 block leading-relaxed">
              O trânsito no entorno da Praça Monsenhor Freitas será interditado às 05:30h para segurança dos corredores. Estacione nas vias perpendiculares indicadas pelos fiscais de trânsito.
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
