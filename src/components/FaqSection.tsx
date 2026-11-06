import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, Mail } from 'lucide-react';
import { EventSettings } from '../types';
import { formatCentsToBRL, getActiveBatchLabel, getActiveBasePriceCents } from '../lib/pricing';

interface FaqItem {
  id: string;
  category: 'todas' | 'inscricao' | 'categoria' | 'kit' | 'pagamento';
  question: string;
  answer: string;
}

interface FaqSectionProps {
  settings?: EventSettings;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ settings }) => {
  const [openId, setOpenId] = useState<string | null>('faq-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');

  const baseCents = getActiveBasePriceCents(settings);
  const feeCents = Math.round(baseCents * 0.10);
  const totalCents = baseCents + feeCents;
  const pcdBaseCents = Math.round(baseCents / 2);
  const pcdFeeCents = Math.round(pcdBaseCents * 0.10);
  const pcdTotalCents = pcdBaseCents + pcdFeeCents;
  const batchLabel = getActiveBatchLabel(settings);

  const faqItems: FaqItem[] = useMemo(() => [
    {
      id: 'faq-1',
      category: 'categoria',
      question: 'Quem tem direito a se inscrever na Categoria "Local" (Lajespintadense)?',
      answer: 'A categoria Local destina-se estritamente aos atletas que nasceram em Lajes Pintadas/RN ou que residem atualmente no município, abrangendo também os lajenses naturais que residam em outras localidades. As inscrições são realizadas exclusivamente de forma presencial na sede da Prefeitura. A comprovação do vínculo ocorre mediante Certidão de Nascimento, Título de Eleitor do município ou Comprovante de Residência idôneo.',
    },
    {
      id: 'faq-2',
      category: 'inscricao',
      question: 'Qual é a data, o horário e a distância da prova?',
      answer: 'A 5ª Corrida de Emancipação Política ocorrerá no dia 26 de dezembro de 2026 (sábado), com percurso oficial aferido de 5 km em vias pavimentadas de Lajes Pintadas/RN. A largada será pontual às 17 horas, com concentração na Feira Livre Coberta.',
    },
    {
      id: 'faq-3',
      category: 'pagamento',
      question: 'Qual é o valor da inscrição, como funcionam os lotes e a taxa de serviço de 10%?',
      answer: `As inscrições são realizadas por lotes, que viram automaticamente por data final ou por esgotamento das vagas do lote (o que ocorrer primeiro). No lote vigente (${batchLabel}), o valor base da Categoria Geral é de ${formatCentsToBRL(baseCents)} acrescido da taxa de serviço de 10% (${formatCentsToBRL(feeCents)}), totalizando ${formatCentsToBRL(totalCents)}. Para atletas PCD / Inclusão, há 50% de desconto sobre o lote vigente: ${formatCentsToBRL(pcdBaseCents)} acrescido da taxa de 10% (${formatCentsToBRL(pcdFeeCents)}), totalizando ${formatCentsToBRL(pcdTotalCents)}. Atletas-guia acompanhantes possuem inscrição e camisa 100% gratuitas.`,
    },
    {
      id: 'faq-pcd',
      category: 'categoria',
      question: 'Como funciona a inscrição para a categoria PCD (Pessoas com Deficiência)?',
      answer: `A Categoria PCD / Inclusão possui 50% de desconto sobre o lote vigente (${formatCentsToBRL(pcdBaseCents)} + taxa de 10% = ${formatCentsToBRL(pcdTotalCents)} no ${batchLabel}), largada prioritária, suporte especializado e premiação própria Masculino e Feminino (1º Lugar: R$ 300,00 + Troféu + Medalha; 2º Lugar: R$ 200,00 + Troféu + Medalha; 3º Lugar: R$ 100,00 + Troféu + Medalha). Caso necessite de Atleta-Guia, a inscrição do guia é totalmente gratuita (R$ 0,00) com camisa oficial inclusa.`,
    },
    {
      id: 'faq-4',
      category: 'pagamento',
      question: 'Quanto tempo tenho para pagar o Pix antes de perder minha vaga?',
      answer: 'Ao concluir o formulário, o sistema efetua uma reserva em tempo real da sua vaga por exatamente 30 minutos. Se o Pix não for compensado dentro desta janela, a reserva expira automaticamente e a vaga volta a ficar disponível para outros corredores.',
    },
    {
      id: 'faq-5',
      category: 'kit',
      question: 'Como funciona a escolha do tamanho da camisa oficial?',
      answer: 'As camisas oficiais (tamanhos PP, P, M, G, GG e XG) operam sob demanda: todo atleta inscrito e confirmado tem garantida a entrega da camisa exatamente no tamanho escolhido no ato da inscrição. Por ser produzida conforme a demanda das inscrições, não haverá troca de tamanho na retirada do kit.',
    },
    {
      id: 'faq-6',
      category: 'kit',
      question: 'Onde e quando será realizada a entrega dos kits?',
      answer: 'A entrega dos kits será realizada na Sede da Prefeitura Municipal (Rua São Francisco, nº 275, Centro, Lajes Pintadas/RN), das 08h às 13h nos dias 21, 22 e 23 de dezembro. No dia 22/12 também haverá entrega na Maré Mansa em Santa Cruz/RN. No dia 26/12 haverá entrega no local da prova antes da largada oficial. É indispensável apresentar documento com foto e comprovante de inscrição com QR Code.',
    },
    {
      id: 'faq-7',
      category: 'inscricao',
      question: 'Como consultar minha inscrição ou reimprimir o comprovante?',
      answer: 'Basta clicar no botão "Minha Inscrição" no topo ou rodapé do site e digitar o seu Número de Protocolo (ex: LP5-2612-XXXXX) e o Código de Acesso gerado na finalização. Você poderá visualizar o status, efetuar o pagamento Pix pendente ou emitir seu comprovante oficial em PDF.',
    },
    {
      id: 'faq-8',
      category: 'categoria',
      question: 'Quais são as categorias e premiações oficiais da prova (incluindo Master +55 e Kids)?',
      answer: 'As categorias Visitante, Local e PCD (Masculino e Feminino) premiam: 1º Lugar R$ 300,00 + Troféu + Medalha, 2º Lugar R$ 200,00 + Troféu + Medalha e 3º Lugar R$ 100,00 + Troféu + Medalha. A Categoria Master (+55 anos, Masculino e Feminino) premia do 1º ao 3º Lugar com Troféu. A Categoria Kids (Masculino e Feminino) premia do 1º ao 3º Lugar com Medalha — atenção: a Categoria Kids não terá inscrições online, sendo realizadas presencialmente na hora da prova.',
    },
    {
      id: 'faq-contato',
      category: 'inscricao',
      question: 'Como falar com a organização ou tirar dúvidas sobre a prova?',
      answer: 'Você pode entrar em contato diretamente com o organizador Sidcley pelo WhatsApp (84) 98185-8194 ou pelo e-mail oficial esportes@lajespintadas.rn.gov.br. Nosso atendimento oferece suporte para dúvidas sobre inscrições, transferências, retirada de kits e regulamento.',
    },
  ], [batchLabel, baseCents, feeCents, totalCents, pcdBaseCents, pcdFeeCents, pcdTotalCents]);

  const categories = [
    { id: 'todas', label: 'Todas as Dúvidas' },
    { id: 'inscricao', label: 'Inscrição' },
    { id: 'categoria', label: 'Categorias & Pódios' },
    { id: 'kit', label: 'Kit & Tamanhos' },
    { id: 'pagamento', label: 'Pagamento & Pix' },
  ];

  const filteredFaqs = useMemo(() => {
    return faqItems.filter((item) => {
      const matchesCategory = selectedCategory === 'todas' || item.category === selectedCategory;
      const matchesSearch =
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [faqItems, selectedCategory, searchQuery]);

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="bg-white text-slate-900 py-16 sm:py-24 border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="mb-12">
          <span className="font-sans text-xs font-semibold uppercase tracking-widest text-orange-600 block mb-2">
            Central de Informações
          </span>
          <h2 className="font-condensed font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-slate-900 leading-none">
            Dúvidas Frequentes
          </h2>
          <p className="font-sans text-sm sm:text-base text-slate-600 mt-3 max-w-2xl leading-relaxed">
            Consulte as principais orientações sobre o regulamento, categorias de premiação, reserva temporária no Pix e entrega dos kits oficiais.
          </p>
        </div>

        {/* Filter Bar & Search */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por palavra-chave (ex: kit, comprovante, local, pix)..."
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 font-sans text-xs font-medium rounded transition ${
                  selectedCategory === cat.id
                    ? 'bg-orange-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Discrete Accordion List */}
        <div className="border border-slate-200 bg-white rounded-lg divide-y divide-slate-200 overflow-hidden shadow-sm">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Nenhuma pergunta encontrada com o termo pesquisado.
            </div>
          ) : (
            filteredFaqs.map((item) => {
              const isOpen = openId === item.id;

              return (
                <div key={item.id} className="transition-colors hover:bg-slate-50/60">
                  <button
                    type="button"
                    onClick={() => toggleFaq(item.id)}
                    aria-expanded={isOpen}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500"
                  >
                    <span className="font-sans font-semibold text-sm sm:text-base text-slate-900">
                      {item.question}
                    </span>
                    <div className="p-1 text-slate-400 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4 text-orange-600" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 font-sans text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in duration-150">
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Support Link */}
        <div className="mt-8 p-5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-sans text-slate-700">
          <div>
            <span className="font-bold text-slate-900 block text-sm">Precisa de suporte ou esclarecimentos adicionais?</span>
            <span className="text-slate-500 text-xs mt-0.5 block">Fale diretamente com o organizador Sidcley pelos nossos canais oficiais.</span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="https://wa.me/5584981858194?text=Ol%C3%A1%2C+Sidcley%21+Gostaria+de+tirar+uma+d%C3%BAvida+sobre+a+5%C2%AA+Corrida+de+Emancipa%C3%A7%C3%A3o+de+Lajes+Pintadas"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-xs transition"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2m.01 1.67c4.56 0 8.25 3.69 8.25 8.24 0 2.21-.86 4.28-2.42 5.84-1.56 1.56-3.64 2.42-5.84 2.42-1.44 0-2.85-.38-4.08-1.11l-.29-.17-3.04.8 1.02-2.96-.19-.31a8.15 8.15 0 01-1.25-4.51c0-4.55 3.7-8.24 8.25-8.24m4.54 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.29 3.78.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.3z"/>
              </svg>
              <span>WhatsApp: (84) 98185-8194 (Sidcley)</span>
            </a>
            <a
              href="mailto:esportes@lajespintadas.rn.gov.br"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded transition"
            >
              <Mail className="w-3.5 h-3.5 text-orange-600" />
              <span>esportes@lajespintadas.rn.gov.br</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
