import React, { useState } from 'react';
import { X, FileText, Shield, Download, Printer, ExternalLink } from 'lucide-react';
import { EventSettings } from '../types';
import { formatCentsToBRL, getActiveBatchLabel, getActiveBasePriceCents } from '../lib/pricing';

export const OFFICIAL_REGULATION_PDF_URL = '/Regulamento_Corrida_Lajes_Pintadas_2026.pdf';
export const OFFICIAL_REGULATION_PDF_FILENAME = 'Regulamento_Corrida_Lajes_Pintadas_2026.pdf';

const OFFICIAL_REGULATION_FULL_TEXT = `REGULAMENTO DE PARTICIPAÇÃO — 5ª CORRIDA DE EMANCIPAÇÃO POLÍTICA DE LAJES PINTADAS/RN (EDIÇÃO 68 ANOS)

Este regulamento disciplina a inscrição, a participação, a classificação, a premiação e a retirada da camisa na corrida comemorativa dos 68 anos de emancipação política do município.

1. IDENTIFICAÇÃO E ORGANIZAÇÃO
1.1 A 5ª Corrida de Emancipação Política de Lajes Pintadas/RN será realizada em 26 de dezembro de 2026, com largada geral às 17h, em percurso de 5 km. A concentração ocorrerá na Feira Livre Coberta.
1.2 O endereço oficial da prova é https://corridadeemancipacao.lajespintadas.rn.gov.br.
1.3 Organização e arrecadação: Prefeitura Municipal de Lajes Pintadas/RN. Execução e direção técnica: Sidcley Gomes da Silva (WhatsApp: (84) 98185-8194 | E-mail: esportes@lajespintadas.rn.gov.br).

2. CATEGORIAS DE INSCRIÇÃO
• Casa Lajespintadense (Masculino e Feminino): Naturais ou moradores atuais do município.
• Visitante (Masculino e Feminino): Atletas sem enquadramento na categoria Casa.
• PCD (Masculino e Feminino): Pessoas com deficiência, de qualquer município.
• Master +55 (Masculino e Feminino): Atletas da faixa Master (+55).
• Kids (Masculino e Feminino): Participantes da prova infantil (inscrição presencial na hora do evento).

3. ENQUADRAMENTO CASA E VISITANTE
3.1 Será considerado Casa Lajespintadense o atleta que comprove pelo menos uma das condições: naturalidade em Lajes Pintadas/RN ou residência efetiva no município na data da inscrição. O natural do município que resida fora também poderá concorrer como Casa.
3.2 A naturalidade será verificada por documento oficial que indique o município de nascimento, como certidão de nascimento ou documento de identidade.
3.3 A residência poderá ser comprovada por documento idôneo e contemporâneo que demonstre o endereço.
3.5 Visitante será o atleta que não comprove naturalidade nem residência atual em Lajes Pintadas/RN. A participação na categoria PCD independe de vínculo com o município.
3.6 Cada atleta terá uma única inscrição. A regra de não acumulação de prêmios entre Local, Visitante e PCD permanece aplicável.

4. PARTICIPAÇÃO DE MENORES
4.1 A idade mínima para a prova de 5 km segue as normas técnicas vigentes. A Corrida Kids terá faixas etárias e distâncias próprias.
4.2 Atletas com menos de 18 anos deverão apresentar autorização de pai, mãe ou responsável legal, com identificação de ambos e contato para emergência, conforme Anexo II do Regulamento em PDF.
4.3 A inscrição na Corrida Kids será feita presencialmente, no local do evento, no próprio dia, antes da largada da prova infantil, acompanhada de pai, mãe ou responsável legal.

5. PARTICIPAÇÃO PCD E ACESSIBILIDADE
5.1 Poderão solicitar enquadramento PCD pessoas com deficiência na forma da legislação aplicável, inclusive pessoas com transtorno do espectro autista e outras condições legalmente reconhecidas, mediante apresentação de documento oficial e/ou relatório de profissional habilitado.
5.4 A categoria PCD terá pódios masculino e feminino.
5.7 O atleta informará a necessidade de guia no cadastro. O guia indispensável e credenciado tem inscrição gratuita, com camisa oficial, identificação própria e sem classificação ou premiação individual.

6. INSCRIÇÕES E PAGAMENTO
6.1 A inscrição da categoria Local (Casa Lajespintadense) é realizada presencialmente na sede da Prefeitura, com registro no sistema oficial. Para Visitante e PCD, o cadastro é feito no portal oficial.
6.2 O valor-base é definido pelo lote vigente, acrescido de 10% de taxa de serviço. A mudança de lote ocorre no fim do prazo ou quando se esgotam as vagas do lote, o que acontecer primeiro.
6.3 A categoria PCD tem desconto de 50% sobre o valor-base do lote, com taxa de 10% sobre o valor reduzido.
6.5 No Pix, o sistema reserva a vaga por 30 minutos. Se o pagamento não for confirmado nesse intervalo, a reserva expira.
6.6 A inscrição é pessoal e vinculada ao CPF do atleta.

7. CAMISA E RETIRADA DO KIT
7.1 A inscrição inclui uma camisa laranja com inscrições brancas, emblema comemorativo dos 68 anos e indicação de 5 km na frente, número de peito com quatro alfinetes, chip eletrônico descartável e brindes institucionais. A medalha de conclusão será entregue a quem completar o percurso.
7.3 Os kits serão entregues em 21, 22 e 23 de dezembro de 2026 na Sede da Prefeitura (Rua São Francisco, nº 275, Centro, Lajes Pintadas/RN), das 08h às 13h. Em 22 de dezembro também haverá entrega na Maré Mansa, em Santa Cruz/RN. No dia da corrida, 26 de dezembro, haverá entrega no local da prova. Para retirada, apresente documento com foto e comprovante de inscrição (Voucher QR Code).

8. PERCURSO, LARGADA E SEGURANÇA
8.1 A concentração geral está prevista para 16h15, na Feira Livre Coberta, e a largada geral para 17h.
8.2 Os participantes deverão comparecer com antecedência recomendada de 60 minutos, portar identificação e seguir a orientação de acesso aos pelotões.

9. CRONOMETRAGEM E CLASSIFICAÇÃO
9.1 A cronometragem será eletrônica, com chip descartável. O número de peito deverá permanecer visível durante toda a prova.

10. PREMIAÇÃO E RESULTADOS
10.1 Em cada naipe masculino e feminino das categorias Visitante, Local (Casa Lajespintadense) e PCD:
• 1º Lugar: R$ 300,00 + Troféu + Medalha
• 2º Lugar: R$ 200,00 + Troféu + Medalha
• 3º Lugar: R$ 100,00 + Troféu + Medalha
10.2 Na categoria Master (+55), o 1º, o 2º e o 3º lugar de cada naipe recebem Troféu. Na Corrida Kids, o 1º, o 2º e o 3º lugar de cada naipe recebem Medalha.
10.3 A medalha de conclusão da prova de 5 km é assegurada a todos que completarem o percurso.`;

interface RegulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EventSettings;
  initialTab?: 'terms' | 'privacy';
}

export const RegulationModal: React.FC<RegulationModalProps> = ({
  isOpen,
  onClose,
  settings,
  initialTab = 'terms',
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPlaceholderTerms =
    !settings.termsContent ||
    settings.termsContent.includes('será homologado e disponibilizado para download integral');
  const displayTermsContent = isPlaceholderTerms ? OFFICIAL_REGULATION_FULL_TEXT : settings.termsContent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-wider">
                Documentos Oficiais do Evento
              </h3>
              <p className="text-xs text-orange-100">
                5ª Corrida de Emancipação Política de Lajes Pintadas/RN (2026)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={OFFICIAL_REGULATION_PDF_URL}
              download={OFFICIAL_REGULATION_PDF_FILENAME}
              className="px-3 py-2 bg-white text-orange-700 hover:bg-orange-50 rounded-xl transition flex items-center gap-1.5 text-xs font-extrabold shadow-sm"
              title="Baixar Regulamento Oficial em PDF"
            >
              <Download className="w-4 h-4" />
              <span>Baixar PDF</span>
            </a>
            <button
              onClick={handlePrint}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition hidden sm:flex items-center gap-1.5 text-xs font-bold"
              title="Imprimir Documento"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('terms')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'terms'
                  ? 'bg-white text-orange-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Regulamento Geral da Corrida</span>
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'privacy'
                  ? 'bg-white text-orange-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Política de Privacidade (LGPD)</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
          {activeTab === 'terms' ? (
            <div className="space-y-4">
              {/* Card de Download do Regulamento Oficial em PDF */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md border border-slate-700">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-orange-400">
                    <FileText className="w-3.5 h-3.5" />
                    Documento Oficial Completo (PDF • 13 Páginas)
                  </span>
                  <h4 className="text-sm font-black text-white">
                    Regulamento Oficial — 5ª Corrida de Emancipação 2026
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Inclui regras completas, quadro de premiação (Anexo I), fichas de autorização de menor e declaração Casa (Anexo II) e camisa oficial (Anexo III).
                  </p>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
                  <a
                    href={OFFICIAL_REGULATION_PDF_URL}
                    download={OFFICIAL_REGULATION_PDF_FILENAME}
                    className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar Regulamento (PDF)</span>
                  </a>
                  <a
                    href={OFFICIAL_REGULATION_PDF_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Abrir PDF</span>
                  </a>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-orange-950 font-medium">
                <p>
                  <strong>Data da Prova:</strong> 26 de dezembro de 2026 (Sábado) • <strong>Largada:</strong> {settings.startTime}h
                </p>
                <p>
                  <strong>Percurso:</strong> {settings.distanceKm} km • <strong>Local:</strong> {settings.startLocation}
                </p>
                <p>
                  <strong>Inscrição Geral ({getActiveBatchLabel(settings)}):</strong> {formatCentsToBRL(getActiveBasePriceCents(settings))} (+ taxa de serviço de 10% = {formatCentsToBRL(Math.round(getActiveBasePriceCents(settings) * 1.1))}) • <strong>PCD / Inclusão (50% Meia):</strong> {formatCentsToBRL(Math.round(getActiveBasePriceCents(settings) / 2))} (+ taxa de serviço de 10% = {formatCentsToBRL(Math.round(Math.round(getActiveBasePriceCents(settings) / 2) * 1.1))}) • <strong>Atleta-Guia:</strong> Gratuito (R$ 0,00).
                </p>
              </div>

              <div className="whitespace-pre-line font-sans bg-slate-50 p-4 rounded-xl border border-slate-200">
                {displayTermsContent}
              </div>

              <div className="border-t border-slate-200 pt-3">
                <h4 className="font-bold text-slate-800 uppercase mb-1">Regras de Menores de Idade</h4>
                <p className="text-slate-600">{settings.minorRules}</p>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <h4 className="font-bold text-slate-800 uppercase mb-1">Política de Cancelamento e Reembolso</h4>
                <p className="text-slate-600">{settings.cancellationPolicy}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-950 font-medium">
                Em conformidade com a Lei Federal nº 13.709/2018 (LGPD), seus dados pessoais são coletados com finalidade estrita de identificação na prova esportiva e nunca serão expostos publicamente.
              </div>

              <div className="whitespace-pre-line font-sans bg-slate-50 p-4 rounded-xl border border-slate-200">
                {settings.privacyContent}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <span className="text-[11px] text-slate-400">
            Prefeitura Municipal de Lajes Pintadas/RN • Secretaria de Esportes
          </span>
          <div className="flex items-center gap-2">
            <a
              href={OFFICIAL_REGULATION_PDF_URL}
              download={OFFICIAL_REGULATION_PDF_FILENAME}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Regulamento PDF</span>
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
