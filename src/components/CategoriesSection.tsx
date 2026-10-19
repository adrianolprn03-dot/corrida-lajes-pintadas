import React, { useState } from 'react';
import { 
  Users, 
  Home, 
  Globe, 
  ShieldCheck, 
  Award, 
  FileText, 
  CheckCircle2, 
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const CategoriesSection: React.FC = () => {
  const [showProofGuide, setShowProofGuide] = useState(false);

  return (
    <section id="categorias" className="py-20 bg-slate-50 text-slate-900 border-b border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
            <Award className="w-3.5 h-3.5 text-sky-600" />
            <span>Classificação & Premiação Oficial</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-slate-900 uppercase tracking-tight">
            Quatro Categorias <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">Oficiais</span>
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            O regulamento divide a premiação em quatro disputas independentes, valorizando o atleta conterrâneo e abrindo as portas de Lajes Pintadas/RN para atletas visitantes de todo o estado.
          </p>
        </div>

        {/* 2 Main Divisions Grid (Casa vs Visitante) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* DIVISION 1: CATEGORIA CASA */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 border-2 border-orange-300 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-400/5 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-600 text-white shadow-md">
                  <Home className="w-3.5 h-3.5" />
                  Divisão da Casa
                </span>
                <span className="text-xs text-orange-600 font-bold">2 Categorias de Pódio</span>
              </div>

              <h3 className="font-display font-black text-2xl text-slate-900 uppercase tracking-tight">
                Casa Masculino & Casa Feminino
              </h3>

              <p className="mt-3 text-slate-600 text-xs sm:text-sm leading-relaxed">
                Destinada exclusivamente aos corredores com vínculo formal com Lajes Pintadas/RN:
              </p>

              {/* Eligibility checklist */}
              <div className="mt-4 space-y-2.5 text-xs text-slate-700">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Nascidos em Lajes Pintadas/RN:</strong> Naturais do município, inclusive os que residem atualmente em outras cidades ou estados.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Residentes em Lajes Pintadas/RN:</strong> Cidadãos que moram e fixaram residência atual comprovada no município.
                  </span>
                </div>
              </div>

              {/* Documentation Note */}
              <div className="mt-4 p-3 rounded-2xl bg-orange-50 border border-orange-200 text-orange-950 text-xs leading-relaxed">
                <strong>Homologação Obrigatória:</strong> A autodeclaração na inscrição deverá ser ratificada na entrega do kit mediante documento probatório (Certidão, Título ou Comprovante de Residência).
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Troféus para os 1º, 2º e 3º lugares</span>
              <span className="font-bold text-orange-600">Pódios Masc. e Fem.</span>
            </div>
          </div>

          {/* DIVISION 2: CATEGORIA VISITANTE */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 border-2 border-sky-300 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-48 h-48 bg-sky-400/5 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-sky-600 text-white shadow-md">
                  <Globe className="w-3.5 h-3.5" />
                  Divisão Visitante
                </span>
                <span className="text-xs text-sky-700 font-bold">2 Categorias de Pódio</span>
              </div>

              <h3 className="font-display font-black text-2xl text-slate-900 uppercase tracking-tight">
                Visitante Masculino & Feminino
              </h3>

              <p className="mt-3 text-slate-600 text-xs sm:text-sm leading-relaxed">
                Aberta aos praticantes do atletismo e corredores de rua de todas as regiões do Rio Grande do Norte e outros estados:
              </p>

              {/* Eligibility checklist */}
              <div className="mt-4 space-y-2.5 text-xs text-slate-700">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-sky-50/50 border border-sky-100">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Atletas de Outros Municípios:</strong> Corredores de Natal, Santa Cruz, Currais Novos, Tangará, São Tomé e demais cidades.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-sky-50/50 border border-sky-100">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Inscrição Simplificada:</strong> Não requer apresentação de comprovante de residência em Lajes Pintadas/RN.
                  </span>
                </div>
              </div>

              {/* General Note */}
              <div className="mt-4 p-3 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 text-xs leading-relaxed">
                <strong>Participação Aberta:</strong> Todos os concluintes recebem a Medalha Finisher oficial e concorrem aos troféus da divisão Visitante.
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Troféus para os 1º, 2º e 3º lugares</span>
              <span className="font-bold text-sky-700">Pódios Masc. e Fem.</span>
            </div>
          </div>

        </div>

        {/* Collapsible Documentation Guide for Casa */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md">
          <button
            type="button"
            onClick={() => setShowProofGuide(!showProofGuide)}
            className="w-full flex items-center justify-between text-left focus:outline-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Quais documentos são aceitos para comprovar a Categoria Casa?
                </h4>
                <p className="text-xs text-slate-500">
                  Clique para conferir as regras de comprovação documental na entrega do kit oficial.
                </p>
              </div>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              {showProofGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showProofGuide && (
            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-700 space-y-2.5 animate-in fade-in duration-200">
              <p>
                Para homologação da categoria Casa na retirada do kit, o atleta deverá apresentar <strong>um</strong> dos seguintes documentos:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li>
                  <strong>Certidão de Nascimento ou RG:</strong> Comprovando naturalidade no município de Lajes Pintadas/RN (válido inclusive para quem reside fora atualmente);
                </li>
                <li>
                  <strong>Título de Eleitor:</strong> Pertencente à Zona Eleitoral com domicílio eleitoral em Lajes Pintadas/RN;
                </li>
                <li>
                  <strong>Comprovante de Residência Atual:</strong> Conta de água, luz, telefone ou declaração formal de residência no município em nome do atleta ou de seus genitores.
                </li>
              </ul>
              <p className="text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-[11px] font-semibold mt-2">
                Caso o vínculo não seja comprovado no ato da entrega, a inscrição será automaticamente remanejada para a categoria Visitante.
              </p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
