import React, { useState } from 'react';
import { Home, Globe, Award, ChevronDown, ChevronUp, CheckCircle2, FileText, AlertCircle, Medal, Trophy, Building2, Users, Sparkles } from 'lucide-react';
import { EventSettings } from '../types';
import { formatCentsToBRL, getActiveBasePriceCents } from '../lib/pricing';

interface CategoriesSectionProps {
  settings?: EventSettings;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({ settings }) => {
  const [showProofGuide, setShowProofGuide] = useState(false);
  const baseCents = getActiveBasePriceCents(settings);
  const pcdBaseCents = Math.round(baseCents / 2);
  const pcdTotalCents = pcdBaseCents + Math.round(pcdBaseCents * 0.10);

  return (
    <section id="categorias" className="bg-[#F8FAFC] text-slate-900 py-16 sm:py-24 border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="mb-12">
          <span className="font-sans text-xs font-semibold uppercase tracking-widest text-orange-600 block mb-2">
            Classificação & Premiação Oficial
          </span>
          <h2 className="font-condensed font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-slate-900 leading-none">
            Categorias & Premiações
          </h2>
          <p className="font-sans text-sm sm:text-base text-slate-600 mt-3 max-w-3xl leading-relaxed">
            Confira as categorias oficiais da 5ª Corrida de Emancipação Política de Lajes Pintadas/RN (Masculino e Feminino) e a premiação completa em dinheiro, troféus e medalhas do 1º ao 3º lugar.
          </p>
        </div>

        {/* Main 3 Categories Grid: VISITANTE, LOCAL, PCD */}
        <div className="border border-slate-200 bg-white rounded-xl overflow-hidden mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            
            {/* COLUMN 1: CATEGORIA VISITANTE */}
            <div className="p-6 sm:p-8 flex flex-col justify-between hover:bg-slate-50/60 transition">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded">
                    Masculino e Feminino
                  </span>
                  <Globe className="w-4 h-4 text-sky-600" />
                </div>

                <h3 className="font-condensed font-extrabold text-2xl sm:text-3xl uppercase text-slate-900 leading-none">
                  Categoria Visitante
                </h3>

                <p className="font-sans text-xs text-slate-600 mt-2 leading-relaxed">
                  Aberta aos corredores e assessorias esportivas de outros municípios do RN e demais estados (inscrição online pelo site).
                </p>

                {/* Premiação Visitante */}
                <div className="mt-5 pt-4 border-t border-slate-200 space-y-2.5">
                  <div className="font-sans text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>Premiação (Masculino e Feminino):</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs font-sans">
                    <span className="font-extrabold text-slate-900">1º Lugar</span>
                    <span className="text-orange-700 font-bold">R$ 300,00 + Troféu + Medalha</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans">
                    <span className="font-extrabold text-slate-900">2º Lugar</span>
                    <span className="text-slate-800 font-bold">R$ 200,00 + Troféu + Medalha</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans">
                    <span className="font-extrabold text-slate-900">3º Lugar</span>
                    <span className="text-slate-800 font-bold">R$ 100,00 + Troféu + Medalha</span>
                  </div>
                </div>

                {/* Eligibility checklist */}
                <div className="mt-5 space-y-2 text-xs font-sans text-slate-600">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                    <span>Pódios independentes para Masculino e Feminino</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                    <span>Inscrição direta online sem exigência de residência</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 text-[11px] font-sans text-slate-500 font-medium">
                Percurso Oficial de 5 km • Cronometragem por Chip
              </div>
            </div>

            {/* COLUMN 2: CATEGORIA LOCAL */}
            <div className="p-6 sm:p-8 flex flex-col justify-between hover:bg-slate-50/60 transition">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded">
                    Masculino e Feminino
                  </span>
                  <Home className="w-4 h-4 text-orange-600" />
                </div>

                <h3 className="font-condensed font-extrabold text-2xl sm:text-3xl uppercase text-slate-900 leading-none">
                  Categoria Local
                </h3>

                <p className="font-sans text-xs text-slate-600 mt-2 leading-relaxed">
                  Exclusiva para corredores naturais ou com residência comprovada no município de Lajes Pintadas/RN.
                </p>

                {/* Premiação Local */}
                <div className="mt-5 pt-4 border-t border-slate-200 space-y-2.5">
                  <div className="font-sans text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-orange-600" />
                    <span>Premiação (Masculino e Feminino):</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs font-sans">
                    <span className="font-extrabold text-slate-900">1º Lugar</span>
                    <span className="text-orange-700 font-bold">R$ 300,00 + Troféu + Medalha</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans">
                    <span className="font-extrabold text-slate-900">2º Lugar</span>
                    <span className="text-slate-800 font-bold">R$ 200,00 + Troféu + Medalha</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans">
                    <span className="font-extrabold text-slate-900">3º Lugar</span>
                    <span className="text-slate-800 font-bold">R$ 100,00 + Troféu + Medalha</span>
                  </div>
                </div>

                {/* Aviso Oficial de Inscrição Presencial */}
                <div className="mt-4 p-3 bg-orange-50/90 border border-orange-200 rounded-lg text-xs font-sans text-orange-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-orange-700">
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span>Atendimento Presencial na Prefeitura</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-orange-900">
                    Inscrições presenciais na sede da Prefeitura de Lajes Pintadas/RN mediante apresentação de documento e comprovante de vínculo.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 text-[11px] font-sans text-orange-700 font-medium">
                * Pódios independentes para Masculino e Feminino
              </div>
            </div>

            {/* COLUMN 3: CATEGORIA PCD */}
            <div className="p-6 sm:p-8 flex flex-col justify-between hover:bg-slate-50/60 transition bg-purple-50/20">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 border border-purple-200 px-2.5 py-1 rounded">
                    Masculino e Feminino • 50% OFF
                  </span>
                  <Award className="w-4 h-4 text-purple-600" />
                </div>

                <h3 className="font-condensed font-extrabold text-2xl sm:text-3xl uppercase text-slate-900 leading-none">
                  Categoria PCD
                </h3>

                <p className="font-sans text-xs text-slate-600 mt-2 leading-relaxed">
                  Destinada a pessoas com deficiência física, visual, auditiva ou intelectual, com meia-inscrição ({formatCentsToBRL(pcdBaseCents)} + taxa 10% = {formatCentsToBRL(pcdTotalCents)}) e Atleta-Guia gratuito.
                </p>

                {/* Premiação PCD */}
                <div className="mt-5 pt-4 border-t border-purple-200 space-y-2.5">
                  <div className="font-sans text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-purple-600" />
                    <span>Premiação (Masculino e Feminino):</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white border border-purple-200 rounded-lg text-xs font-sans shadow-2xs">
                    <span className="font-extrabold text-slate-900">1º Lugar</span>
                    <span className="text-purple-700 font-bold">R$ 300,00 + Troféu + Medalha</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white border border-purple-200 rounded-lg text-xs font-sans shadow-2xs">
                    <span className="font-extrabold text-slate-900">2º Lugar</span>
                    <span className="text-purple-700 font-bold">R$ 200,00 + Troféu + Medalha</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white border border-purple-200 rounded-lg text-xs font-sans shadow-2xs">
                    <span className="font-extrabold text-slate-900">3º Lugar</span>
                    <span className="text-purple-700 font-bold">R$ 100,00 + Troféu + Medalha</span>
                  </div>
                </div>

                {/* Eligibility checklist */}
                <div className="mt-4 space-y-1.5 text-xs font-sans text-slate-600">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                    <span><strong>Atleta-Guia Gratuito:</strong> Inscrição e camisa 100% grátis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                    <span>Apresentação de laudo comprobatório ou carteira CIPTEA</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-purple-200 text-[11px] font-sans text-purple-700 font-medium">
                Largada prioritária e suporte especializado no percurso
              </div>
            </div>

          </div>
        </div>

        {/* Secondary 2 Categories Grid: MASTER (+55) and KIDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          
          {/* CARD 4: CATEGORIA MASTER (+55) */}
          <div className="p-6 sm:p-8 border border-slate-200 bg-white rounded-xl shadow-sm flex flex-col justify-between hover:bg-slate-50/60 transition">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                  Masculino e Feminino • 55 Anos ou Mais
                </span>
                <Trophy className="w-5 h-5 text-emerald-600" />
              </div>

              <h3 className="font-condensed font-extrabold text-2xl sm:text-3xl uppercase text-slate-900 leading-none">
                Categoria Master (+55)
              </h3>

              <p className="font-sans text-xs text-slate-600 mt-2 leading-relaxed">
                Destinada aos atletas masculinos e femininos com idade igual ou superior a 55 anos, valorizando a longevidade esportiva na prova de 5 km.
              </p>

              <div className="mt-5 pt-4 border-t border-slate-200 space-y-2.5">
                <div className="font-sans text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-emerald-600" />
                  <span>Premiação (Masculino e Feminino):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg text-center">
                    <span className="block font-extrabold text-xs text-slate-900">1º Lugar</span>
                    <span className="block text-emerald-700 font-bold text-xs mt-1">Troféu</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                    <span className="block font-extrabold text-xs text-slate-900">2º Lugar</span>
                    <span className="block text-slate-800 font-bold text-xs mt-1">Troféu</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                    <span className="block font-extrabold text-xs text-slate-900">3º Lugar</span>
                    <span className="block text-slate-800 font-bold text-xs mt-1">Troféu</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200 text-[11px] font-sans text-slate-600 flex items-center justify-between">
              <span>Classificação automática pela data de nascimento (+55 anos)</span>
              <span className="font-bold text-emerald-700">+ Medalha Finisher</span>
            </div>
          </div>

          {/* CARD 5: CATEGORIA KIDS */}
          <div className="p-6 sm:p-8 border-2 border-amber-300 bg-gradient-to-br from-amber-50/50 via-white to-orange-50/40 rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded">
                  Masculino e Feminino • Infantil
                </span>
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>

              <h3 className="font-condensed font-extrabold text-2xl sm:text-3xl uppercase text-slate-900 leading-none">
                Categoria Kids
              </h3>

              <p className="font-sans text-xs text-slate-600 mt-2 leading-relaxed">
                Bateria especial de incentivo ao esporte infantil na programação oficial da 5ª Corrida de Emancipação Política.
              </p>

              <div className="mt-5 pt-4 border-t border-amber-200 space-y-2.5">
                <div className="font-sans text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <Medal className="w-4 h-4 text-amber-600" />
                  <span>Premiação (Masculino e Feminino):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 bg-amber-100/70 border border-amber-300 rounded-lg text-center">
                    <span className="block font-extrabold text-xs text-slate-900">1º Lugar</span>
                    <span className="block text-amber-900 font-bold text-xs mt-1">Medalha</span>
                  </div>
                  <div className="p-3 bg-white border border-amber-200 rounded-lg text-center">
                    <span className="block font-extrabold text-xs text-slate-900">2º Lugar</span>
                    <span className="block text-amber-800 font-bold text-xs mt-1">Medalha</span>
                  </div>
                  <div className="p-3 bg-white border border-amber-200 rounded-lg text-center">
                    <span className="block font-extrabold text-xs text-slate-900">3º Lugar</span>
                    <span className="block text-amber-800 font-bold text-xs mt-1">Medalha</span>
                  </div>
                </div>
              </div>

              {/* Aviso Importante: Categoria Kids sem inscrição online */}
              <div className="mt-4 p-3.5 bg-amber-100/90 border-2 border-amber-300 rounded-lg text-xs font-sans text-amber-950 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block text-amber-900 uppercase">
                    Atenção — Inscrições na Hora da Prova:
                  </span>
                  <span className="text-[11px] font-medium leading-relaxed block mt-0.5">
                    A <strong>Categoria Kids não terá inscrições online</strong>. As inscrições serão realizadas presencialmente na hora da prova.
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-amber-200 text-[11px] font-sans text-amber-800 font-bold">
              * Inscrições realizadas exclusivamente no local e horário do evento
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

        {/* Proof Guide Accordion for Categoria Local */}
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
                Quais documentos são aceitos para comprovar a Categoria Local Lajespintadense?
              </span>
            </div>
            <div className="p-1 text-slate-500">
              {showProofGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showProofGuide && (
            <div className="px-6 pb-6 pt-2 border-t border-slate-200 font-sans text-xs text-slate-600 space-y-2 animate-in fade-in duration-150">
              <p>
                Para homologação da categoria Local na entrega do kit oficial, o atleta deverá apresentar <strong>um</strong> dos seguintes documentos válidos com foto:
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
