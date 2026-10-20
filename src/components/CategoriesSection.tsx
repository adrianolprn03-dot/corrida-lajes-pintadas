import React, { useState } from 'react';
import { Home, Globe, Award, ChevronDown, ChevronUp, CheckCircle2, FileText, AlertCircle, Medal, Trophy } from 'lucide-react';

export const CategoriesSection: React.FC = () => {
  const [showProofGuide, setShowProofGuide] = useState(false);

  return (
    <section id="categorias" className="bg-[#F8FAFC] text-slate-900 py-16 sm:py-24 border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="mb-12">
          <span className="font-sans text-xs font-semibold uppercase tracking-widest text-orange-600 block mb-2">
            Classificação & Premiação Oficial
          </span>
          <h2 className="font-condensed font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-slate-900 leading-none">
            Categorias de Disputa
          </h2>
          <p className="font-sans text-sm sm:text-base text-slate-600 mt-3 max-w-2xl leading-relaxed">
            O regulamento oficial divide os atletas em três divisões independentes, com premiação em troféus do 1º ao 3º lugar para os naipes Masculino e Feminino, além da medalha finisher entregue a 100% dos concluintes.
          </p>
        </div>

        {/* 3 Visual Columns with 1px Dividers */}
        <div className="border border-slate-200 bg-white rounded-lg overflow-hidden mb-10 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            
            {/* COLUMN 1: CASA LAJESPINTADENSE */}
            <div className="p-6 sm:p-8 flex flex-col justify-between hover:bg-slate-50/60 transition">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded">
                    Divisão Municipal
                  </span>
                  <Home className="w-4 h-4 text-orange-600" />
                </div>

                <h3 className="font-condensed font-extrabold text-2xl sm:text-3xl uppercase text-slate-900 leading-none">
                  Casa Lajespintadense
                </h3>

                <p className="font-sans text-xs text-slate-600 mt-2 leading-relaxed">
                  Exclusivo para corredores que possuem vínculo formal de naturalidade ou residência comprovada em Lajes Pintadas/RN.
                </p>

                {/* Subdivisões de Pódio */}
                <div className="mt-6 pt-5 border-t border-slate-200 space-y-3">
                  <div className="font-sans text-xs font-bold uppercase tracking-wider text-orange-600">
                    Subdivisões de Pódio:
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded text-xs font-sans">
                    <span className="font-semibold text-slate-900">Casa Masculino</span>
                    <span className="text-orange-600 font-mono font-bold">1º ao 3º Lugar</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded text-xs font-sans">
                    <span className="font-semibold text-slate-900">Casa Feminino</span>
                    <span className="text-orange-600 font-mono font-bold">1º ao 3º Lugar</span>
                  </div>
                </div>

                {/* Eligibility checklist */}
                <div className="mt-5 space-y-2 text-xs font-sans text-slate-600">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Nascidos no município (inclusive residentes fora)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Moradores com residência fixa comprovada</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 text-[11px] font-sans text-orange-700 font-medium">
                * Requer ratificação documental na entrega do kit
              </div>
            </div>

            {/* COLUMN 2: VISITANTE */}
            <div className="p-6 sm:p-8 flex flex-col justify-between hover:bg-slate-50/60 transition">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
                    Divisão Geral
                  </span>
                  <Globe className="w-4 h-4 text-orange-600" />
                </div>

                <h3 className="font-condensed font-extrabold text-2xl sm:text-3xl uppercase text-slate-900 leading-none">
                  Visitante
                </h3>

                <p className="font-sans text-xs text-slate-600 mt-2 leading-relaxed">
                  Aberta a todos os praticantes do atletismo e corredores de rua de outros municípios do RN e demais estados.
                </p>

                {/* Subdivisões de Pódio */}
                <div className="mt-6 pt-5 border-t border-slate-200 space-y-3">
                  <div className="font-sans text-xs font-bold uppercase tracking-wider text-slate-900">
                    Subdivisões de Pódio:
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded text-xs font-sans">
                    <span className="font-semibold text-slate-900">Visitante Masculino</span>
                    <span className="text-orange-600 font-mono font-bold">1º ao 3º Lugar</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded text-xs font-sans">
                    <span className="font-semibold text-slate-900">Visitante Feminino</span>
                    <span className="text-orange-600 font-mono font-bold">1º ao 3º Lugar</span>
                  </div>
                </div>

                {/* Eligibility checklist */}
                <div className="mt-5 space-y-2 text-xs font-sans text-slate-600">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span>Inscrição direta sem exigência de residência</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span>Atletas de Natal, Santa Cruz, Currais Novos, etc.</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 text-[11px] font-sans text-slate-500">
                Acolhimento aos clubes e assessorias esportivas
              </div>
            </div>

            {/* COLUMN 3: PCD / INCLUSÃO */}
            <div className="p-6 sm:p-8 flex flex-col justify-between hover:bg-slate-50/60 transition">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded">
                    Divisão Inclusão
                  </span>
                  <Award className="w-4 h-4 text-sky-600" />
                </div>

                <h3 className="font-condensed font-extrabold text-2xl sm:text-3xl uppercase text-slate-900 leading-none">
                  PCD / Inclusão
                </h3>

                <p className="font-sans text-xs text-slate-600 mt-2 leading-relaxed">
                  Destinada a pessoas com deficiência física, visual ou auditiva, assegurando suporte prioritário no percurso.
                </p>

                {/* Subdivisões de Pódio */}
                <div className="mt-6 pt-5 border-t border-slate-200 space-y-3">
                  <div className="font-sans text-xs font-bold uppercase tracking-wider text-sky-700">
                    Subdivisões de Pódio:
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded text-xs font-sans">
                    <span className="font-semibold text-slate-900">PCD Masculino</span>
                    <span className="text-sky-700 font-mono font-bold">Pódio & Homenagem</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded text-xs font-sans">
                    <span className="font-semibold text-slate-900">PCD Feminino</span>
                    <span className="text-sky-700 font-mono font-bold">Pódio & Homenagem</span>
                  </div>
                </div>

                {/* Eligibility checklist */}
                <div className="mt-5 space-y-2 text-xs font-sans text-slate-600">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                    <span>Apoio logístico e área de largada prioritária</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                    <span>Apresentação de laudo comprobatório</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 text-[11px] font-sans text-sky-700">
                Direito a atleta-guia conforme o regulamento oficial
              </div>
            </div>

          </div>
        </div>

        {/* Guaranteed Finisher Medal Banner */}
        <div className="p-6 sm:p-7 border border-orange-200 bg-gradient-to-r from-orange-50 via-amber-50 to-white rounded-lg flex flex-col sm:flex-row items-center justify-between gap-5 mb-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
              <Medal className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-condensed font-extrabold text-xl sm:text-2xl uppercase text-slate-900 leading-tight">
                Medalha Finisher Garantida para 100% dos Concluintes
              </h4>
              <p className="font-sans text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                Todos os atletas que cruzarem a linha de chegada no tempo regulamentar da prova recebem a medalha pesada em metal fundido com fita oficial sublimada acetinada.
              </p>
            </div>
          </div>
          <span className="font-sans text-xs font-bold uppercase tracking-wider text-orange-700 border border-orange-300 bg-white px-3.5 py-2 rounded shrink-0 shadow-xs">
            Todas as Divisões
          </span>
        </div>

        {/* Proof Guide Accordion for Categoria Casa */}
        <div className="border border-slate-200 bg-white rounded-lg shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowProofGuide(!showProofGuide)}
            aria-expanded={showProofGuide}
            className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-orange-600 shrink-0" />
              <span className="font-sans font-semibold text-xs sm:text-sm text-slate-900">
                Quais documentos são aceitos para comprovar a Categoria Casa Lajespintadense?
              </span>
            </div>
            <div className="p-1 text-slate-500">
              {showProofGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showProofGuide && (
            <div className="px-6 pb-6 pt-2 border-t border-slate-200 font-sans text-xs text-slate-600 space-y-2 animate-in fade-in duration-150">
              <p>
                Para homologação da categoria Casa na entrega do kit oficial, o atleta deverá apresentar <strong>um</strong> dos seguintes documentos válidos com foto:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li><strong className="text-slate-900">Certidão de Nascimento ou RG:</strong> comprovando naturalidade em Lajes Pintadas/RN (inclusive para residentes fora);</li>
                <li><strong className="text-slate-900">Título de Eleitor:</strong> pertencente à Zona Eleitoral com domicílio em Lajes Pintadas/RN;</li>
                <li><strong className="text-slate-900">Comprovante de Residência Atual:</strong> conta de água ou energia elétrica em nome do atleta ou de seus genitores.</li>
              </ul>
              <div className="p-3 bg-orange-50 border border-orange-200 rounded text-orange-800 text-[11px] font-medium flex items-center gap-2 mt-3">
                <AlertCircle className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Caso o vínculo não seja comprovado no ato da entrega do kit, a inscrição será automaticamente remanejada para a categoria Visitante.</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
