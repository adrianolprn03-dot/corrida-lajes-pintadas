import React, { useState } from 'react';
import { Home, Globe, Award, ChevronDown, ChevronUp, CheckCircle2, FileText, AlertCircle, Users } from 'lucide-react';

export const CategoriesSection: React.FC = () => {
  const [showProofGuide, setShowProofGuide] = useState(false);

  return (
    <section id="categorias" className="bg-[#FCFBF7] text-[#101D2C] py-16 sm:py-24 border-b border-[rgba(22,35,53,0.14)]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="mb-12">
          <span className="font-sans text-xs font-semibold uppercase tracking-widest text-[#E5640E] block mb-2">
            Classificação & Premiação Oficial
          </span>
          <h2 className="font-condensed font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-[#101D2C] leading-none">
            Categorias de Disputa
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#5D6672] mt-3 max-w-2xl leading-relaxed">
            O regulamento divide os atletas em três divisões oficiais, com premiação em troféus do 1º ao 3º lugar para os naipes Masculino e Feminino, além da medalha finisher entregue a 100% dos concluintes.
          </p>
        </div>

        {/* 3 Visual Columns with Fine 1px Dividers */}
        <div className="border border-[rgba(22,35,53,0.14)] bg-white rounded-[2px] overflow-hidden mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[rgba(22,35,53,0.14)]">
            
            {/* COLUMN 1: CASA LAJESPINTADENSE */}
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#E5640E] bg-[#E5640E]/10 px-2.5 py-1 rounded-[2px]">
                    Divisão Municipal
                  </span>
                  <Home className="w-4 h-4 text-[#E5640E]" />
                </div>

                <h3 className="font-condensed font-extrabold text-2xl sm:text-3xl uppercase text-[#101D2C] leading-none">
                  Casa Lajespintadense
                </h3>

                <p className="font-sans text-xs text-[#5D6672] mt-2 leading-relaxed">
                  Exclusivo para corredores que possuem vínculo formal de naturalidade ou domicílio em Lajes Pintadas/RN.
                </p>

                {/* Naipes & Premiação */}
                <div className="mt-6 pt-5 border-t border-[rgba(22,35,53,0.08)] space-y-3">
                  <div className="font-sans text-xs font-bold uppercase tracking-wider text-[#101D2C]">
                    Subdivisões de Pódio:
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-[#FCFBF7] border border-[rgba(22,35,53,0.08)] rounded-[2px] text-xs font-sans">
                    <span className="font-semibold text-[#101D2C]">Casa Masculino</span>
                    <span className="text-[#5D6672]">1º ao 3º Lugar</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-[#FCFBF7] border border-[rgba(22,35,53,0.08)] rounded-[2px] text-xs font-sans">
                    <span className="font-semibold text-[#101D2C]">Casa Feminino</span>
                    <span className="text-[#5D6672]">1º ao 3º Lugar</span>
                  </div>
                </div>

                {/* Eligibility summary */}
                <div className="mt-5 space-y-2 text-xs font-sans text-[#5D6672]">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Nascidos no município (inclusive residentes fora)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Moradores com residência comprovada</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[rgba(22,35,53,0.08)] text-[11px] font-sans text-[#E5640E] font-medium">
                * Requer comprovação na entrega do kit
              </div>
            </div>

            {/* COLUMN 2: VISITANTE */}
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#101D2C] bg-black/5 px-2.5 py-1 rounded-[2px]">
                    Divisão Geral
                  </span>
                  <Globe className="w-4 h-4 text-[#101D2C]" />
                </div>

                <h3 className="font-condensed font-extrabold text-2xl sm:text-3xl uppercase text-[#101D2C] leading-none">
                  Visitante
                </h3>

                <p className="font-sans text-xs text-[#5D6672] mt-2 leading-relaxed">
                  Aberta a todos os praticantes do atletismo e corredores de rua de outros municípios do RN e demais estados.
                </p>

                {/* Naipes & Premiação */}
                <div className="mt-6 pt-5 border-t border-[rgba(22,35,53,0.08)] space-y-3">
                  <div className="font-sans text-xs font-bold uppercase tracking-wider text-[#101D2C]">
                    Subdivisões de Pódio:
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-[#FCFBF7] border border-[rgba(22,35,53,0.08)] rounded-[2px] text-xs font-sans">
                    <span className="font-semibold text-[#101D2C]">Visitante Masculino</span>
                    <span className="text-[#5D6672]">1º ao 3º Lugar</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-[#FCFBF7] border border-[rgba(22,35,53,0.08)] rounded-[2px] text-xs font-sans">
                    <span className="font-semibold text-[#101D2C]">Visitante Feminino</span>
                    <span className="text-[#5D6672]">1º ao 3º Lugar</span>
                  </div>
                </div>

                {/* Eligibility summary */}
                <div className="mt-5 space-y-2 text-xs font-sans text-[#5D6672]">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#101D2C] shrink-0 mt-0.5" />
                    <span>Inscrição direta sem burocracia de residência</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#101D2C] shrink-0 mt-0.5" />
                    <span>Atletas de Natal, Santa Cruz, Currais Novos, etc.</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[rgba(22,35,53,0.08)] text-[11px] font-sans text-[#5D6672]">
                Acolhimento aos clubes e assessorias esportivas
              </div>
            </div>

            {/* COLUMN 3: PCD / INCLUSÃO */}
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#007CA0] bg-[#007CA0]/10 px-2.5 py-1 rounded-[2px]">
                    Divisão Inclusão
                  </span>
                  <Award className="w-4 h-4 text-[#007CA0]" />
                </div>

                <h3 className="font-condensed font-extrabold text-2xl sm:text-3xl uppercase text-[#101D2C] leading-none">
                  PCD / Inclusão
                </h3>

                <p className="font-sans text-xs text-[#5D6672] mt-2 leading-relaxed">
                  Destinada a pessoas com deficiência física, visual ou auditiva, assegurando inclusão e igualdade no percurso.
                </p>

                {/* Naipes & Premiação */}
                <div className="mt-6 pt-5 border-t border-[rgba(22,35,53,0.08)] space-y-3">
                  <div className="font-sans text-xs font-bold uppercase tracking-wider text-[#101D2C]">
                    Subdivisões de Pódio:
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-[#FCFBF7] border border-[rgba(22,35,53,0.08)] rounded-[2px] text-xs font-sans">
                    <span className="font-semibold text-[#101D2C]">PCD Masculino</span>
                    <span className="text-[#5D6672]">Pódio & Homenagem</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-[#FCFBF7] border border-[rgba(22,35,53,0.08)] rounded-[2px] text-xs font-sans">
                    <span className="font-semibold text-[#101D2C]">PCD Feminino</span>
                    <span className="text-[#5D6672]">Pódio & Homenagem</span>
                  </div>
                </div>

                {/* Eligibility summary */}
                <div className="mt-5 space-y-2 text-xs font-sans text-[#5D6672]">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#007CA0] shrink-0 mt-0.5" />
                    <span>Apoio logístico e área de largada prioritária</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#007CA0] shrink-0 mt-0.5" />
                    <span>Apresentação de laudo comprobatório</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[rgba(22,35,53,0.08)] text-[11px] font-sans text-[#007CA0]">
                Direito a atleta-guia conforme o regulamento oficial
              </div>
            </div>

          </div>
        </div>

        {/* Guaranteed Medal Horizontal Bar */}
        <div className="p-5 sm:p-6 border border-[rgba(22,35,53,0.14)] bg-white rounded-[2px] flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[2px] bg-[#101D2C] text-[#F97316] flex items-center justify-center shrink-0 font-condensed font-extrabold text-2xl">
              5K
            </div>
            <div>
              <h4 className="font-condensed font-extrabold text-xl uppercase text-[#101D2C] leading-tight">
                Medalha Finisher Garantida para 100% dos Concluintes
              </h4>
              <p className="font-sans text-xs text-[#5D6672] mt-0.5">
                Todos os atletas que cruzarem a linha de chegada no tempo regulamentar recebem a medalha em metal fundido com fita personalizada.
              </p>
            </div>
          </div>
          <span className="font-sans text-xs font-semibold uppercase tracking-wider text-[#101D2C] border border-[rgba(22,35,53,0.14)] px-3 py-1.5 rounded-[2px] shrink-0">
            Todas as Categorias
          </span>
        </div>

        {/* Discrete Proof Guide Accordion for Categoria Casa */}
        <div className="border border-[rgba(22,35,53,0.14)] bg-white rounded-[2px] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowProofGuide(!showProofGuide)}
            aria-expanded={showProofGuide}
            className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-[#FCFBF7] transition"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-[#E5640E] shrink-0" />
              <span className="font-sans font-semibold text-xs sm:text-sm text-[#101D2C]">
                Quais documentos são aceitos para comprovar a Categoria Casa Lajespintadense?
              </span>
            </div>
            <div className="p-1 text-[#5D6672]">
              {showProofGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showProofGuide && (
            <div className="px-5 pb-5 pt-2 border-t border-[rgba(22,35,53,0.1)] font-sans text-xs text-[#5D6672] space-y-2 animate-in fade-in duration-150">
              <p>
                Para homologação da categoria Casa na entrega do kit, o atleta deverá apresentar <strong>um</strong> dos seguintes documentos originais com foto:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li><strong className="text-[#101D2C]">Certidão de Nascimento ou RG:</strong> comprovando naturalidade em Lajes Pintadas/RN;</li>
                <li><strong className="text-[#101D2C]">Título de Eleitor:</strong> pertencente à Zona Eleitoral com domicílio em Lajes Pintadas/RN;</li>
                <li><strong className="text-[#101D2C]">Comprovante de Residência Atual:</strong> conta de água ou energia elétrica em nome do atleta ou de seus genitores.</li>
              </ul>
              <div className="p-3 bg-[#FCFBF7] border border-[rgba(22,35,53,0.1)] rounded-[2px] text-[#E5640E] text-[11px] font-medium flex items-center gap-2 mt-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Caso o vínculo não seja comprovado, o corredor será automaticamente remanejado para a categoria Visitante.</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
