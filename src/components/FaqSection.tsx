import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, Mail, HelpCircle } from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'todas' | 'inscricao' | 'categoria' | 'kit' | 'pagamento';
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
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
    answer: 'A 5ª Corrida de Emancipação Política ocorrerá no dia 26 de dezembro de 2026 (sábado), com percurso oficial aferido de 5 km em vias pavimentadas de Lajes Pintadas/RN. A largada será pontual às 06:00 horas da manhã, com concentração na Praça Monsenhor Freitas.',
  },
  {
    id: 'faq-3',
    category: 'pagamento',
    question: 'Por que há uma taxa de processamento além dos R$ 60,00 da inscrição?',
    answer: 'O regulamento da prova fixa a inscrição no valor base de R$ 60,00 com direito à camisa oficial e medalha finisher. O acréscimo de 10% (R$ 6,00) corresponde à taxa de processamento e serviço da plataforma, garantindo a reserva garantida da sua vaga por 30 minutos e a confirmação automática do pagamento.',
  },
  {
    id: 'faq-4',
    category: 'pagamento',
    question: 'Quanto tempo tenho para pagar o Pix antes de perder minha vaga?',
    answer: 'Ao concluir o formulário, o sistema efetua uma reserva em tempo real da sua vaga e do tamanho de camisa escolhido por exatamente 30 minutos. Se o Pix não for compensado dentro desta janela, a reserva expira automaticamente e o tamanho volta a ficar disponível no estoque público para outros corredores.',
  },
  {
    id: 'faq-5',
    category: 'kit',
    question: 'O que compõe o kit oficial e posso trocar o tamanho da camisa depois?',
    answer: 'O kit oficial inclui a Camisa Oficial Laranja de tecido dry-fit tecnológico, chip eletrônico descartável, número de peito personalizado com 4 alfinetes e brindes institucionais. Não será permitida a troca de tamanho no ato da retirada do kit, valendo estritamente a grade selecionada no momento da inscrição.',
  },
  {
    id: 'faq-6',
    category: 'kit',
    question: 'Onde e quando será realizada a entrega dos kits?',
    answer: 'A entrega dos kits será realizada no Centro de Convivência dos Idosos (Rua São Francisco, s/n, Centro, Lajes Pintadas/RN). No dia 25/12 (14h às 18h) para atletas locais e antecipados, e no dia 26/12 (05h às 05h40) para atletas visitantes de outros municípios. É indispensável apresentar documento com foto e comprovante de inscrição.',
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
    question: 'Atletas de outras cidades podem concorrer a troféus?',
    answer: 'Sim! A Categoria Visitante foi criada especificamente para atletas de outros municípios do Rio Grande do Norte e outros estados. Há troféus oficiais do 1º ao 3º lugar para a categoria Masculino e Feminino na divisão Visitante, além da medalha finisher entregue a todos os concluintes.',
  },
];

export const FaqSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');

  const categories = [
    { id: 'todas', label: 'Todas as Dúvidas' },
    { id: 'inscricao', label: 'Inscrição' },
    { id: 'categoria', label: 'Categorias & Pódios' },
    { id: 'kit', label: 'Kit & Tamanhos' },
    { id: 'pagamento', label: 'Pagamento & Pix' },
  ];

  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory = selectedCategory === 'todas' || item.category === selectedCategory;
      const matchesSearch =
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

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
        <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans text-slate-600">
          <span>Precisa de esclarecimentos adicionais sobre o edital da prova?</span>
          <a
            href="mailto:esportes@lajespintadas.rn.gov.br"
            className="font-semibold text-orange-600 hover:underline flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>esportes@lajespintadas.rn.gov.br</span>
          </a>
        </div>

      </div>
    </section>
  );
};
