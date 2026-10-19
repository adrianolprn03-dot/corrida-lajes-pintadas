import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Shirt, CreditCard, Award } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: 'inscricao' | 'categoria' | 'kit' | 'pagamento';
}

const FAQ_ITEMS: FaqItem[] = [
  {
    category: 'categoria',
    question: 'Quem tem direito a se inscrever na Categoria "Casa"?',
    answer: 'A categoria Casa destina-se estritamente aos atletas que nasceram em Lajes Pintadas/RN ou que residem atualmente no município, abrangendo também os lajenses naturais que residam em outras localidades. A veracidade da declaração deverá ser comprovada formalmente na retirada do kit através de Certidão de Nascimento, Título de Eleitor do município ou Comprovante de Residência idôneo.',
  },
  {
    category: 'inscricao',
    question: 'Qual é o percurso, a data e o horário da prova?',
    answer: 'A 5ª Corrida de Emancipação Política ocorrerá no dia 26 de dezembro de 2026 (sábado), com percurso oficial de 5 km em vias pavimentadas de Lajes Pintadas/RN. A largada será pontual às 06:00 horas da manhã, com concentração na Praça Monsenhor Freitas.',
  },
  {
    category: 'pagamento',
    question: 'Por que há uma taxa adicional além dos R$ 60,00?',
    answer: 'O regulamento da prova fixa a inscrição no valor líquido de R$ 60,00 com direito à camisa. O acréscimo cobrado no checkout corresponde exatamente à tarifa de processamento operacional do gateway financeiro (Asaas) para a modalidade escolhida (Pix ou Cartão de Crédito à vista em parcela única), garantindo que a receita integral seja revertida ao evento.',
  },
  {
    category: 'pagamento',
    question: 'Quanto tempo tenho para pagar o Pix antes de perder minha vaga?',
    answer: 'Ao concluir o formulário, o sistema faz uma reserva atômica da sua vaga e do tamanho de camisa escolhido por exatamente 30 minutos. Se o pagamento não for compensado dentro desta janela, a reserva expira automaticamente e o tamanho volta a ficar disponível para outros corredores.',
  },
  {
    category: 'kit',
    question: 'O que compõe o kit oficial e posso trocar o tamanho da camisa depois?',
    answer: 'O kit oficial inclui a Camisa Oficial Laranja de tecido técnico dry-fit, chip de cronometragem eletrônica, número de peito com alfinetes e brindes dos patrocinadores. Não será permitida a troca de tamanho no ato da retirada do kit, valendo estritamente a grade selecionada no momento da inscrição.',
  },
  {
    category: 'kit',
    question: 'Onde e quando será realizada a entrega dos kits?',
    answer: 'A entrega dos kits será realizada no Centro de Convivência dos Idosos, Centro, Lajes Pintadas/RN, nas datas e horários informados no edital da prova. É indispensável apresentar documento oficial com foto e o comprovante de inscrição obtido na Área do Atleta.',
  },
  {
    category: 'inscricao',
    question: 'Como consultar minha inscrição ou reimprimir o comprovante?',
    answer: 'Basta acessar a aba "Minha Inscrição" no topo do site e digitar o seu Número de Protocolo (ex: LP5-2612-XXXXX) e o Código de Acesso gerado na finalização. Lá você poderá visualizar o status, efetuar o pagamento pendente e emitir seu comprovante oficial em PDF.',
  },
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 bg-slate-50 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Tire Suas Dúvidas</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Perguntas Frequentes sobre a Prova
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Regras de inscrição, categorias, pagamento Asaas e retirada de kits da 5ª Corrida de Emancipação.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition hover:border-slate-300"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="font-bold text-slate-900 text-sm sm:text-base">
                    {item.question}
                  </span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition ${
                    isOpen ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-50 animate-in fade-in duration-200">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
