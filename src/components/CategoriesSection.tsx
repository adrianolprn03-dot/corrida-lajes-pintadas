import React, { useState } from 'react';
import { 
  Home, 
  Globe, 
  Award, 
  FileText, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  Trophy,
  Medal,
  Sparkles,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export const CategoriesSection: React.FC = () => {
  const [showProofGuide, setShowProofGuide] = useState(false);

  return (
    <section id="categorias" className="py-24 bg-[#080D1A] text-slate-100 border-b border-white/10 relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-carbon-grid opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold uppercase tracking-widest mb-4 backdrop-blur-md">
            <Trophy className="w-3.5 h-3.5 text-orange-400" />
            <span>Classificação & Pódios Oficiais</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
            Quatro Disputas <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400">Independentes</span>
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            O regulamento oficial premia os melhores atletas em quatro pódios distintos, valorizando o corredor da terra lajense e acolhendo os atletas de elite e amadores de todo o Rio Grande do Norte.
          </p>
        </div>

        {/* 2 Main Divisions Grid (Casa vs Visitante) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* DIVISION 1: CATEGORIA CASA (ATLETA LOCAL) */}
          <div className="group rounded-3xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-6 sm:p-8 border-2 border-orange-500/40 hover:border-orange-500/70 shadow-2xl shadow-orange-950/30 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between transition-all duration-300">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600" />
            <div className="absolute top-4 right-4 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-orange-500/20 transition" />

            <div>
              {/* Badge & Sub-label */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-600 text-white shadow-lg shadow-orange-600/30">
                  <Home className="w-3.5 h-3.5" />
                  Divisão da Casa
                </span>
                <span className="text-xs font-mono font-bold text-orange-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Atletas Lajenses
                </span>
              </div>

              <h3 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
                Casa Masculino & Feminino
              </h3>

              <p className="mt-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
                Destinada exclusivamente aos corredores com vínculo formal de nascimento ou residência comprovada em <strong className="text-orange-400">Lajes Pintadas/RN</strong>:
              </p>

              {/* Eligibility Checklist */}
              <div className="mt-5 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-orange-500/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Nascidos em Lajes Pintadas/RN:</strong> Naturais do município, inclusive aqueles que residem atualmente em outras cidades ou estados.
                  </span>
                </div>
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-orange-500/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Residentes em Lajes Pintadas/RN:</strong> Cidadãos com domicílio e residência fixa comprovada no município.
                  </span>
                </div>
              </div>

              {/* Podium Breakdown */}
              <div className="mt-6 pt-5 border-t border-white/10">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Premiação em Troféus Oficiais (Masc. e Fem.):</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                    <div className="text-lg font-black text-amber-400">1º LUGAR</div>
                    <div className="text-[10px] text-slate-300 font-semibold mt-0.5">Troféu Dourado</div>
                    <div className="text-[9px] text-amber-400/80 uppercase font-mono mt-0.5">Campeão(ã)</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-300/10 border border-slate-300/20">
                    <div className="text-lg font-black text-slate-200">2º LUGAR</div>
                    <div className="text-[10px] text-slate-300 font-semibold mt-0.5">Troféu Prata</div>
                    <div className="text-[9px] text-slate-400 uppercase font-mono mt-0.5">Vice-Campeão</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-800/20 border border-amber-700/30">
                    <div className="text-lg font-black text-amber-600">3º LUGAR</div>
                    <div className="text-[10px] text-slate-300 font-semibold mt-0.5">Troféu Bronze</div>
                    <div className="text-[9px] text-amber-600/80 uppercase font-mono mt-0.5">3º Colocado</div>
                  </div>
                </div>
              </div>

              {/* Documentation Notice */}
              <div className="mt-5 p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-200 text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Homologação Presencial:</strong> O vínculo deve ser ratificado na entrega do kit oficial mediante documento probatório (Certidão, Título ou Comprovante de Residência).
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Cronometragem por chip eletrônico</span>
              <span className="font-mono font-bold text-orange-400">2 Pódios (Masc. & Fem.)</span>
            </div>
          </div>

          {/* DIVISION 2: CATEGORIA VISITANTE (GERAL) */}
          <div className="group rounded-3xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-6 sm:p-8 border-2 border-cyan-500/40 hover:border-cyan-500/70 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between transition-all duration-300">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600" />
            <div className="absolute top-4 right-4 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition" />

            <div>
              {/* Badge & Sub-label */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-600 text-white shadow-lg shadow-cyan-600/30">
                  <Globe className="w-3.5 h-3.5" />
                  Divisão Visitante
                </span>
                <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Geral Intermunicipal
                </span>
              </div>

              <h3 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
                Visitante Masculino & Feminino
              </h3>

              <p className="mt-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
                Aberta a todos os praticantes do atletismo e corredores de rua de todas as regiões do <strong className="text-cyan-400">Rio Grande do Norte e outros estados</strong>:
              </p>

              {/* Eligibility Checklist */}
              <div className="mt-5 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-cyan-500/20">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Corredores de Todas as Cidades:</strong> Atletas de Natal, Santa Cruz, Currais Novos, Tangará, São Tomé, Caicó e demais municípios.
                  </span>
                </div>
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-cyan-500/20">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Inscrição Direta Sem Burocracia:</strong> Não exige comprovante de domicílio em Lajes Pintadas/RN.
                  </span>
                </div>
              </div>

              {/* Podium Breakdown */}
              <div className="mt-6 pt-5 border-t border-white/10">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Trophy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Premiação em Troféus Oficiais (Masc. e Fem.):</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                    <div className="text-lg font-black text-amber-400">1º LUGAR</div>
                    <div className="text-[10px] text-slate-300 font-semibold mt-0.5">Troféu Dourado</div>
                    <div className="text-[9px] text-amber-400/80 uppercase font-mono mt-0.5">Campeão(ã)</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-300/10 border border-slate-300/20">
                    <div className="text-lg font-black text-slate-200">2º LUGAR</div>
                    <div className="text-[10px] text-slate-300 font-semibold mt-0.5">Troféu Prata</div>
                    <div className="text-[9px] text-slate-400 uppercase font-mono mt-0.5">Vice-Campeão</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-800/20 border border-amber-700/30">
                    <div className="text-lg font-black text-amber-600">3º LUGAR</div>
                    <div className="text-[10px] text-slate-300 font-semibold mt-0.5">Troféu Bronze</div>
                    <div className="text-[9px] text-amber-600/80 uppercase font-mono mt-0.5">3º Colocado</div>
                  </div>
                </div>
              </div>

              {/* Participation Guarantee */}
              <div className="mt-5 p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Acolhimento da Cidade:</strong> Infraestrutura completa com apoio aos clubes de corrida e assessorias esportivas de todo o estado.
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Cronometragem por chip eletrônico</span>
              <span className="font-mono font-bold text-cyan-400">2 Pódios (Masc. & Fem.)</span>
            </div>
          </div>

        </div>

        {/* Guaranteed Finisher Medal Banner */}
        <div className="mb-12 rounded-3xl bg-gradient-to-r from-orange-500/20 via-amber-500/15 to-cyan-500/20 border border-amber-500/30 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30">
              <Medal className="w-9 h-9" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                Garantia Oficial para 100% dos Inscritos
              </div>
              <h4 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-tight">
                Medalha Finisher Exclusiva em Metal Fundido
              </h4>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
                Todos os atletas que cruzarem a linha de chegada dentro do tempo limite da prova recebem a medalha pesada personalizada da 5ª edição com fita sublimada acetinada.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 border border-white/20 text-xs font-mono font-bold text-white">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Todos os Concluintes</span>
          </div>
        </div>

        {/* Collapsible Proof Guide Accordion */}
        <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setShowProofGuide(!showProofGuide)}
            className="w-full flex items-center justify-between text-left focus:outline-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-white">
                  Quais documentos são aceitos para comprovar a Categoria Casa?
                </h4>
                <p className="text-xs text-slate-400">
                  Clique para conferir as regras de comprovação documental na entrega do kit oficial.
                </p>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-white/10 text-slate-300">
              {showProofGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showProofGuide && (
            <div className="mt-4 pt-4 border-t border-white/10 text-xs text-slate-300 space-y-3 animate-in fade-in duration-200">
              <p>
                Para homologação da categoria Casa na retirada do kit, o atleta deverá apresentar <strong>um</strong> dos seguintes documentos válidos:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2 text-slate-300">
                <li>
                  <strong className="text-white">Certidão de Nascimento ou RG:</strong> Comprovando naturalidade no município de Lajes Pintadas/RN (válido inclusive para quem reside fora atualmente);
                </li>
                <li>
                  <strong className="text-white">Título de Eleitor:</strong> Pertencente à Zona Eleitoral com domicílio eleitoral ativo em Lajes Pintadas/RN;
                </li>
                <li>
                  <strong className="text-white">Comprovante de Residência Atual:</strong> Conta de água (CAERN), energia elétrica (Cosern/Neoenergia) ou declaração formal de residência no município em nome do atleta ou de seus genitores.
                </li>
              </ul>
              
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs mt-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Caso o vínculo não seja comprovado no ato da entrega do kit, a inscrição será automaticamente remanejada para a categoria <strong>Visitante</strong>, sem direito a reembolso da taxa.
                </span>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
