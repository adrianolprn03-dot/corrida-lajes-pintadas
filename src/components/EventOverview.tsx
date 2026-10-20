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
  AlertCircle,
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
    <section id="evento" className="py-24 bg-[#060A11] text-slate-100 border-b border-white/10 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-carbon-grid opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold uppercase tracking-widest mb-4 backdrop-blur-md">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Infraestrutura & Operação</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
            Logística & <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400">Entrega do Kit</span>
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            Uma operação planejada em detalhes pela Prefeitura Municipal para acolher mais de 250 corredores com rigor em segurança viária, apoio médico e conforto para os atletas e familiares.
          </p>
        </div>

        {/* 4 Feature Highlights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          
          <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-md hover:border-orange-500/40 transition group">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-4 border border-orange-500/30 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Largada Oficial</span>
            <h3 className="font-display font-black text-2xl text-white mt-1">{settings.startTime}h em Ponto</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Largada ao amanhecer para garantir clima ameno e máxima performance física dos participantes.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-md hover:border-cyan-500/40 transition group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 border border-cyan-500/30 group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Arena & Concentração</span>
            <h3 className="font-display font-black text-xl text-white mt-1">Praça Monsenhor Freitas</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Coração do Centro de Lajes Pintadas/RN, com pórtico de largada e chegada oficial.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-md hover:border-emerald-500/40 transition group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/30 group-hover:scale-110 transition-transform">
              <Droplet className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Pontos de Água</span>
            <h3 className="font-display font-black text-2xl text-white mt-1">A Cada 2 KM</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Copos lacrados de água mineral gelada nos postos de hidratação do percurso e na arena de dispersão.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-md hover:border-amber-500/40 transition group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/30 group-hover:scale-110 transition-transform">
              <HeartPulse className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Resgate & Saúde</span>
            <h3 className="font-display font-black text-xl text-white mt-1">Ambulância UTI</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Equipe médica de prontidão da Secretaria Municipal de Saúde em todo o circuito da prova.
            </p>
          </div>

        </div>

        {/* 2 Big Blocks: Kit Pickup Details + Arena Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Kit Pickup Detailed Card (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-orange-500/30 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="p-3 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <PackageCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-orange-400">Obrigatório</span>
                <h3 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-wider">
                  Retirada do Kit Oficial
                </h3>
              </div>
            </div>

            {/* Local info */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Building2 className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Local Oficial: Centro de Convivência dos Idosos</span>
              </div>
              <p className="text-xs text-slate-300">
                Rua São Francisco, s/n - Centro, Lajes Pintadas - RN, CEP 59230-000 (próximo à Praça Monsenhor Freitas).
              </p>
            </div>

            {/* Dates / Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-orange-400 mb-1">
                  <CalendarCheck className="w-4 h-4" />
                  <span>25/12 (Sexta) • Véspera</span>
                </div>
                <div className="text-lg font-black text-white">14:00h às 18:00h</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Recomendado para moradores locais e atletas já na cidade para evitar filas no dia da prova.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 mb-1">
                  <Clock className="w-4 h-4" />
                  <span>26/12 (Sábado) • Manhã</span>
                </div>
                <div className="text-lg font-black text-white">05:00h às 05:40h</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Exclusivo para atletas visitantes residentes em outras cidades que chegam no dia da prova.
                </p>
              </div>
            </div>

            {/* Checklist of required items */}
            <div className="space-y-2.5">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Documentos Obrigatórios na Apresentação:
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Documento Oficial com Foto:</strong> RG, CNH ou Carteira Profissional original do atleta inscrito.</span>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Comprovante de Inscrição:</strong> Apresentado no celular ou impresso (disponível na Área do Atleta).</span>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Comprovante de Vínculo (Cat. Casa):</strong> Certidão, Título ou Comprovante de Residência em Lajes Pintadas/RN.</span>
              </div>
            </div>

            {/* Maps CTA */}
            <a
              href="https://maps.google.com/?q=Lajes+Pintadas+RN"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-bold text-white transition hover:border-orange-500/50"
            >
              <Navigation className="w-4 h-4 text-orange-400" />
              <span>Ver Localização no Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>

          {/* Arena Structure & Athlete Services (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">Serviços da Arena</span>
                <h3 className="font-display font-black text-xl text-white uppercase tracking-wider">
                  Estrutura para o Atleta
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20 font-mono font-bold text-xs">
                  01
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">Guarda-Volumes Gratuito</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Depósito identificado pelo seu número de peito na arena para mochilas e itens pessoais leves.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20 font-mono font-bold text-xs">
                  02
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">Trânsito Totalmente Bloqueado</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Operação integrada com a Polícia Militar e batedores municipais garantindo circuito 100% livre.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 font-mono font-bold text-xs">
                  03
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">Mesa de Frutas & Reposição</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Bananas, melancias, maçãs frescas e isotônico servidos aos concluintes imediatamente após o pórtico.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20 font-mono font-bold text-xs">
                  04
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">Cerimônia de Pódio com Som Profissional</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Locução ao vivo, telão com resultados oficiais preliminares e entrega solene dos troféus municipais.
                  </p>
                </div>
              </div>
            </div>

            {/* Municipal Guarantee Badge */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 text-xs text-orange-200">
              <div className="font-bold text-white flex items-center gap-2 mb-1">
                <Car className="w-4 h-4 text-orange-400" />
                <span>Estacionamento Orientado</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Vagas disponíveis nas imediações da Praça Monsenhor Freitas com fiscalização de trânsito local.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
