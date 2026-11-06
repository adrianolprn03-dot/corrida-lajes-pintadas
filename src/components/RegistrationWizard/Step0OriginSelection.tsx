import React, { useState } from 'react';
import {
  Home,
  Globe,
  Building2,
  MapPin,
  Clock,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Mail,
  Accessibility,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { EventSettings, OriginType } from '../../types';
import { formatCentsToBRL, getActiveBasePriceCents, getActiveBatchLabel } from '../../lib/pricing';

interface Step0OriginSelectionProps {
  settings?: EventSettings;
  onSelectVisitante: () => void;
  onSelectPcd: () => void;
  onClose: () => void;
}

export const Step0OriginSelection: React.FC<Step0OriginSelectionProps> = ({
  settings,
  onSelectVisitante,
  onSelectPcd,
  onClose,
}) => {
  const [view, setView] = useState<'selection' | 'casa_presential'>('selection');

  const baseCents = getActiveBasePriceCents(settings);
  const feeCents = Math.round(baseCents * 0.10);
  const totalCents = baseCents + feeCents;
  const pcdBaseCents = Math.round(baseCents / 2);
  const pcdFeeCents = Math.round(pcdBaseCents * 0.10);
  const pcdTotalCents = pcdBaseCents + pcdFeeCents;
  const batchLabel = getActiveBatchLabel(settings);

  // Tela de Orientações da Inscrição Presencial (Casa Lajespintadense)
  if (view === 'casa_presential') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Banner de Aviso Oficial */}
        <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-950 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full inline-block">
                Inscrição Exclusivamente Presencial
              </span>
              <h3 className="font-condensed font-black text-xl sm:text-2xl uppercase tracking-tight text-slate-900 leading-tight">
                Categoria Casa (Local — Lajespintadense)
              </h3>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Conforme o Regulamento Oficial da prova, as inscrições para atletas lajenses (nascidos ou residentes em Lajes Pintadas/RN) são realizadas <strong>exclusivamente de forma presencial</strong> na sede da Prefeitura Municipal.
          </p>

          <div className="text-[11px] text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200 leading-relaxed">
            💡 <strong>Por que presencial?</strong> Para assegurar a conferência presencial de documentos por servidor autorizado, garantindo que a cota exclusiva de vagas locais seja destinada 100% aos corredores da nossa cidade.
          </div>
        </div>

        {/* Informações Práticas do Local e Horário */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wide">
              <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Onde se Inscrever</span>
            </div>
            <p className="text-xs font-semibold text-slate-800">
              Sede da Prefeitura Municipal
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Rua São Francisco, nº 275, Centro, Lajes Pintadas / RN (Secretaria de Esportes e Lazer).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wide">
              <Clock className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Horário de Atendimento</span>
            </div>
            <p className="text-xs font-semibold text-slate-800">
              Segunda a Sexta-feira
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Das <strong>08h00 às 13h00</strong>. Atendimento direto por ordem de chegada.
            </p>
          </div>
        </div>

        {/* Checklist de Documentos Obrigatórios */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wide">
            <FileText className="w-4 h-4 text-orange-600 shrink-0" />
            <span>Documentos Necessários (Leve no dia):</span>
          </div>

          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Documento Oficial com Foto:</strong> RG ou CNH (original ou cópia legível) e CPF.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Comprovação de Vínculo com o Município (ao menos 1):</strong>
                <br />• Certidão de Nascimento (atestando nascimento em Lajes Pintadas/RN); <strong>OU</strong>
                <br />• Título de Eleitor com domicílio em Lajes Pintadas/RN; <strong>OU</strong>
                <br />• Comprovante de Residência recente em nome do atleta ou dos pais.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Escolha da Camisa Oficial:</strong> Seu tamanho (PP, P, M, G, GG ou XG) será registrado na hora pelo atendente no sistema oficial.</span>
            </li>
          </ul>
        </div>

        {/* Suporte Direto com a Organização */}
        <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold block text-white">Dúvidas sobre a inscrição local?</span>
            <span className="text-slate-400 text-[11px]">Fale diretamente com o coordenador Sidcley.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href="https://wa.me/5584981858194?text=Ol%C3%A1%2C+Sidcley%21+Gostaria+de+informa%C3%A7%C3%B5es+sobre+a+inscri%C3%A7%C3%A3o+presencial+da+Categoria+Local+%28Lajes+Pintadas%29."
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2m.01 1.67c4.56 0 8.25 3.69 8.25 8.24 0 2.21-.86 4.28-2.42 5.84-1.56 1.56-3.64 2.42-5.84 2.42-1.44 0-2.85-.38-4.08-1.11l-.29-.17-3.04.8 1.02-2.96-.19-.31a8.15 8.15 0 01-1.25-4.51c0-4.55 3.7-8.24 8.25-8.24m4.54 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.29 3.78.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.3z"/>
              </svg>
              <span>WhatsApp: (84) 98185-8194</span>
            </a>
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t border-slate-200">
          <button
            type="button"
            onClick={() => setView('selection')}
            className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Escolha</span>
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              type="button"
              onClick={onSelectVisitante}
              className="py-2.5 px-4 rounded-xl text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition flex items-center justify-center gap-1.5"
            >
              <span>Sou de outra cidade (Inscrição Visitante)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-black transition flex items-center justify-center"
            >
              <span>Entendido / Fechar</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tela Inicial: Seleção entre Casa (Local) e Visitante (Online)
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Cabeçalho da Escolha */}
      <div className="text-center space-y-1.5">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full inline-block">
          Passo Inicial Obrigatório
        </span>
        <h2 className="font-condensed font-black text-2xl sm:text-3xl uppercase tracking-tight text-slate-900">
          Como você vai participar da 5ª Corrida?
        </h2>
        <p className="font-sans text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Selecione sua origem para direcionarmos ao fluxo correto de inscrição: atletas da cidade se inscrevem presencialmente e visitantes se inscrevem online.
        </p>
      </div>

      {/* Cards de Opção: Casa vs Visitante */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* CARD 1: CASA (LOCAL / LAJESPINTADENSE) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setView('casa_presential')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setView('casa_presential');
            }
          }}
          className="group relative p-5 sm:p-6 rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-amber-50/70 to-orange-50/30 hover:border-amber-500 hover:shadow-lg transition-all text-left flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Home className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/80 border border-amber-300 px-2.5 py-1 rounded-full">
                🏛️ Presencial na Prefeitura
              </span>
            </div>

            <h3 className="font-condensed font-black text-xl sm:text-2xl uppercase text-slate-900 group-hover:text-amber-700 transition-colors leading-tight">
              Casa (Local — Lajespintadense)
            </h3>
            <p className="text-xs text-amber-900/80 font-medium mt-1">
              Para nascidos ou moradores de Lajes Pintadas/RN
            </p>

            <ul className="mt-4 space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Cota exclusiva de <strong>200 vagas</strong> da casa</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Pódio exclusivo Local (R$ 300, 200 e 100 + Troféu)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Camisa oficial sob demanda e chip de cronometragem</span>
              </li>
              <li className="flex items-start gap-2 font-medium text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Inscrição presencial com documento e comprovante</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-amber-200/80 flex items-center justify-between text-xs font-bold text-amber-900 group-hover:text-amber-950">
            <span>Ver Instruções Presenciais</span>
            <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* CARD 2: VISITANTE (GERAL / OUTRAS CIDADES) */}
        <div
          role="button"
          tabIndex={0}
          onClick={onSelectVisitante}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectVisitante();
            }
          }}
          className="group relative p-5 sm:p-6 rounded-2xl border-2 border-sky-300 bg-gradient-to-b from-sky-50/70 to-blue-50/30 hover:border-sky-500 hover:shadow-lg transition-all text-left flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="w-11 h-11 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-800 bg-sky-200/80 border border-sky-300 px-2.5 py-1 rounded-full">
                ⚡ Inscrição 100% Online
              </span>
            </div>

            <h3 className="font-condensed font-black text-xl sm:text-2xl uppercase text-slate-900 group-hover:text-sky-700 transition-colors leading-tight">
              Visitante (Demais Cidades)
            </h3>
            <p className="text-xs text-sky-900/80 font-medium mt-1">
              Para atletas de qualquer outro município ou estado
            </p>

            <ul className="mt-4 space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>Cota de <strong>300 vagas</strong> para atletas visitantes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>Pódio Geral Visitante (R$ 300, 200 e 100 + Troféu)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>{batchLabel}: <strong>{formatCentsToBRL(totalCents)}</strong> (com taxa Asaas)</span>
              </li>
              <li className="flex items-start gap-2 font-medium text-sky-900">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>Pagamento instantâneo via Pix ou Cartão de Crédito</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-sky-200/80 flex items-center justify-between text-xs font-bold text-sky-900 group-hover:text-sky-950">
            <span>Iniciar Inscrição Online</span>
            <div className="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>

      {/* Opção Adicional: Atleta PCD / Inclusão (Online com 50% OFF) */}
      <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
            <Accessibility className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-purple-950 text-sm">É Atleta PCD (Pessoa com Deficiência)?</span>
              <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-200/80 px-2 py-0.5 rounded">
                50% OFF • {formatCentsToBRL(pcdTotalCents)}
              </span>
            </div>
            <p className="text-slate-600 text-[11px] mt-0.5">
              Inscrição online com desconto legal de 50%, pódio exclusivo PCD e vaga gratuita para Atleta-Guia.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSelectPcd}
          className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg transition shrink-0 flex items-center justify-center gap-1.5 shadow-xs"
        >
          <span>Inscrever PCD Online</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
