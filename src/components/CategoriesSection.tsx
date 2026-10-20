import React, { useState } from 'react';
import { Home, Globe, Award, ChevronDown, ChevronUp, CheckCircle2, FileText, AlertCircle, Medal, Trophy } from 'lucide-react';

export const CategoriesSection: React.FC = () => {
  const [showProofGuide, setShowProofGuide] = useState(false);

  return (
    <section id="categorias" className="bg-[#070D18] text-white py-16 sm:py-24 border-b border-white/10">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="mb-12">
          <span className="font-sans text-xs font-semibold uppercase tracking-widest text-[#FF7A00] block mb-2">
            Classificação & Premiação Oficial
          </span>
          <h2 className="font-condensed font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-white leading-none">
            Categorias de Disputa
          </h2>
          <p className="font-sans text-sm sm:text-base text-white/70 mt-3 max-w-2xl leading-relaxed">
            O regulamento oficial divide os atletas em três divisões independentes, com premiação em troféus do 1º ao 3º lugar para os naipes Masculino e Feminino, além da medalha finisher entregue a 100% dos concluintes.
          </p>
        </div>

        {/* 3 Visual Columns with 1px Dividers */}
        <div className="border border-white/10 bg-[#0D1626] rounded-[4px] overflow-hidden mb-10 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
            
            {/* COLUMN 1: CASA LAJESPINTADENSE */}
            <div className="p-6 sm:p-8 flex flex-col justify-between hover:bg-white/[0.02] transition">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#FF9D42] bg-orange-500/15 border border-orange-500/30 px-2.5 py-1 rounded-[2px]">
                    Divisão Municipal
                  </span>
                  <Home className="w-4 h-4 text-[#FF7A00]" />
                </div>

                <h3 className="font-condensed font-extrabold text-2xl sm:text-3xl uppercase text-white leading-none">
                  Casa Lajespintadense
                </h3>

                <p className="font-sans text-xs text-white/70 mt-2 leading-relaxed">
                  Exclusivo para corredores que possuem vínculo formal de naturalidade ou residência comprovada em Lajes Pintadas/RN.
                </p>

                {/* Subdivisões de Pódio */}
                <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
                  <div className="font-sans text-xs font-bold uppercase tracking-wider text-[#FF9D42]">
                    Subdivisões de Pódio:
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/10 rounded-[2px] text-xs font-sans">
                    <span className="font-semibold text-white">Casa Masculino</span>
                    <span className="text-[#FF9D42] font-mono font-bold">1º ao 3º Lugar</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/10 rounded-[2px] text-xs font-sans">
                    <span className="font-semibold text-white">Casa Feminino</span>
                    <span className="text-[#FF9D42] font-mono font-bold">1º ao 3º Lugar</span>
                  </div>
                </div>

                {/* Eligibility checklist */}
                <div className="mt-5 space-y-2 text-xs font-sans text-white/70">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Nascidos no município (inclusive residentes fora)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Moradores com residência fixa comprovada</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 text-[11px] font-sans text-[#FF9D42] font-medium">
                * Requer ratificação documental na entrega do kit
              </div>
            </div>

            {/* COLUMN 2: VISITANTE */}
            <div className="p-6 sm:p-8 flex flex-col justify-between hover:bg-white/[0.02] transition">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-white/90 bg-white/10 border border-white/15 px-2.5 py-1 rounded-[2px]">
                    Divisão Geral
                  </span>
                  <Globe className="w-4 h-4 text-[#FF7A00]" />
                </div>

                <h3 className="font-condensed font-extrabold text-2xl sm:text-3xl uppercase text-white leading-none">
                  Visitante
                </h3>

                <p className="font-sans text-xs text-white/70 mt-2 leading-relaxed">
                  Aberta a todos os praticantes do atletismo e corredores de rua de outros municípios do RN e demais estados.
                </p>

                {/* Subdivisões de Pódio */}
                <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
                  <div className="font-sans text-xs font-bold uppercase tracking-wider text-white">
                    Subdivisões de Pódio:
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/10 rounded-[2px] text-xs font-sans">
                    <span className="font-semibold text-white">Visitante Masculino</span>
                    <span className="text-[#FF9D42] font-mono font-bold">1º ao 3º Lugar</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/10 rounded-[2px] text-xs font-sans">
                    <span className="font-semibold text-white">Visitante Feminino</span>
                    <span className="text-[#FF9D42] font-mono font-bold">1º ao 3º Lugar</span>
                  </div>
                </div>

                {/* Eligibility checklist */}
                <div className="mt-5 space-y-2 text-xs font-sans text-white/70">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white/80 shrink-0 mt-0.5" />
                    <span>Inscrição direta sem exigência de residência</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white/80 shrink-0 mt-0.5" />
                    <span>Atletas de Natal, Santa Cruz, Currais Novos, etc.</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 text-[11px] font-sans text-white/60">
                Acolhimento aos clubes e assessorias esportivas
              </div>
            </div>

            {/* COLUMN 3: PCD / INCLUSÃO */}
            <div className="p-6 sm:p-8 flex flex-col justify-between hover:bg-white/[0.02] transition">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-1 rounded-[2px]">
                    Divisão Inclusão
                  </span>
                  <Award className="w-4 h-4 text-cyan-400" />
                </div>

                <h3 className="font-condensed font-extrabold text-2xl sm:text-3xl uppercase text-white leading-none">
                  PCD / Inclusão
                </h3>

                <p className="font-sans text-xs text-white/70 mt-2 leading-relaxed">
                  Destinada a pessoas com deficiência física, visual ou auditiva, assegurando suporte prioritário no percurso.
                </p>

                {/* Subdivisões de Pódio */}
                <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
                  <div className="font-sans text-xs font-bold uppercase tracking-wider text-cyan-300">
                    Subdivisões de Pódio:
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/10 rounded-[2px] text-xs font-sans">
                    <span className="font-semibold text-white">PCD Masculino</span>
                    <span className="text-cyan-300 font-mono font-bold">Pódio & Homenagem</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/10 rounded-[2px] text-xs font-sans">
                    <span className="font-semibold text-white">PCD Feminino</span>
                    <span className="text-cyan-300 font-mono font-bold">Pódio & Homenagem</span>
                  </div>
                </div>

                {/* Eligibility checklist */}
                <div className="mt-5 space-y-2 text-xs font-sans text-white/70">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Apoio logístico e área de largada prioritária</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Apresentação de laudo comprobatório</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 text-[11px] font-sans text-cyan-300">
                Direito a atleta-guia conforme o regulamento oficial
              </div>
            </div>

          </div>
        </div>

        {/* Guaranteed Finisher Medal Banner */}
        <div className="p-6 sm:p-7 border border-white/15 bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-transparent rounded-[4px] flex flex-col sm:flex-row items-center justify-between gap-5 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[4px] bg-gradient-to-br from-[#FF7A00] to-[#FF5500] text-[#070D18] flex items-center justify-center shrink-0 shadow-lg shadow-orange-600/30">
              <Medal className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-condensed font-extrabold text-xl sm:text-2xl uppercase text-white leading-tight">
                Medalha Finisher Garantida para 100% dos Concluintes
              </h4>
              <p className="font-sans text-xs sm:text-sm text-white/80 mt-1 max-w-2xl">
                Todos os atletas que cruzarem a linha de chegada no tempo regulamentar da prova recebem a medalha pesada em metal fundido com fita oficial sublimada acetinada.
              </p>
            </div>
          </div>
          <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#FF9D42] border border-orange-500/40 bg-orange-500/15 px-3.5 py-2 rounded-[2px] shrink-0">
            Todas as Divisões
          </span>
        </div>

        {/* Proof Guide Accordion for Categoria Casa */}
        <div className="border border-white/10 bg-[#0D1626] rounded-[4px] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowProofGuide(!showProofGuide)}
            aria-expanded={showProofGuide}
            className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-[#FF7A00] shrink-0" />
              <span className="font-sans font-semibold text-xs sm:text-sm text-white">
                Quais documentos são aceitos para comprovar a Categoria Casa Lajespintadense?
              </span>
            </div>
            <div className="p-1 text-white/60">
              {showProofGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showProofGuide && (
            <div className="px-6 pb-6 pt-2 border-t border-white/10 font-sans text-xs text-white/75 space-y-2 animate-in fade-in duration-150">
              <p>
                Para homologação da categoria Casa na entrega do kit oficial, o atleta deverá apresentar <strong>um</strong> dos seguintes documentos válidos com foto:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li><strong className="text-white">Certidão de Nascimento ou RG:</strong> comprovando naturalidade em Lajes Pintadas/RN (inclusive para residentes fora);</li>
                <li><strong className="text-white">Título de Eleitor:</strong> pertencente à Zona Eleitoral com domicílio em Lajes Pintadas/RN;</li>
                <li><strong className="text-white">Comprovante de Residência Atual:</strong> conta de água ou energia elétrica em nome do atleta ou de seus genitores.</li>
              </ul>
              <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-[2px] text-[#FF9D42] text-[11px] font-medium flex items-center gap-2 mt-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Caso o vínculo não seja comprovado no ato da entrega do kit, a inscrição será automaticamente remanejada para a categoria Visitante.</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
