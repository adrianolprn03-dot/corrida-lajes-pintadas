import React, { useState, useMemo } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Tag, 
  CreditCard, 
  Shirt, 
  Trophy, 
  FileText,
  Mail,
  Sparkles
} from 'lucide-react';

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
    question: 'Quem tem direito a se inscrever na Categoria "Casa"?',
    answer: 'A categoria Casa destina-se estritamente aos atletas que nasceram em Lajes Pintadas/RN ou que residem atualmente no município, abrangendo também os lajenses naturais que residam em outras localidades. A veracidade da declaração deverá ser comprovada formalmente na retirada do kit através de Certidão de Nascimento, Título de Eleitor do município ou Comprovante de Residência idôneo.',
  },
  {
    id: 'faq-2',
    category: 'inscricao',
    question: 'Qual é o percurso, a data e o horário da prova?',
    answer: 'A 5ª Corrida de Emancipação Política ocorrerá no dia 26 de dezembro de 2026 (sábado), com percurso oficial de 5 km em vias pavimentadas de Lajes Pintadas/RN. A largada será pontual às 06:00 horas da manhã, com concentração na Praça Monsenhor Freitas.',
  },
  {
    id: 'faq-3',
    category: 'pagamento',
    question: 'Por que há uma taxa de gateway além dos R$ 60,00 da inscrição?',
    answer: 'O regulamento da prova fixa a taxa de inscrição no valor líquido de R$ 60,00 com direito à camisa oficial de alta performance e medalha finisher. O pequeno acréscimo operacional no checkout (R$ 0,99 no Pix) corresponde à tarifa bancária do gateway Asaas, garantindo a reserva atômica de vaga e a conciliação instantânea sem intermediários manuais.',
  },
  {
    id: 'faq-4',
    category: 'pagamento',
    question: 'Quanto tempo tenho para pagar o Pix antes de perder minha vaga?',
    answer: 'Ao concluir o formulário de inscrição, o sistema efetua uma reserva em tempo real da sua vaga e do tamanho de camisa escolhido por exatamente 30 minutos. Se o Pix não for compensado dentro desta janela, a reserva expira automaticamente e o tamanho volta a ficar disponível no estoque público para outros corredores.',
  },
  {
    id: 'faq-5',
    category: 'kit',
    question: 'O que compõe o kit oficial e posso trocar o tamanho da camisa depois?',
    answer: 'O kit oficial inclui a Camisa Oficial Laranja de tecido dry-fit esportivo tecnológico, chip eletrônico descartável, número de peito personalizado com 4 alfinetes e brindes institucionais. Não será permitida a troca de tamanho no ato da retirada do kit, valendo estritamente a grade selecionada no momento da inscrição.',
  },
  {
    id: 'faq-6',
    category: 'kit',
    question: 'Onde e quando será realizada a entrega dos kits?',
    answer: 'A entrega dos kits será realizada no Centro de Convivência dos Idosos (Rua São Francisco, Centro, Lajes Pintadas/RN). No dia 25/12 (14h às 18h) para atletas locais e antecipados, e no dia 26/12 (05h às 05h40) para atletas visitantes de outros municípios. É indispensável apresentar documento com foto e comprovante de inscrição.',
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
    { id: 'kit', label: 'Kit & Camisa' },
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
    <section id="faq" className="py-24 bg-[#080D1A] text-slate-100 border-b border-white/10 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-carbon-grid opacity-20 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold uppercase tracking-widest mb-4 backdrop-blur-md">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Central de Dúvidas Oficiais</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
            Perguntas <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400">Frequentes</span>
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
            Tire suas dúvidas sobre o regulamento, categorias, pagamento automático Asaas e retirada de kits da 5ª Corrida de Emancipação.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-8 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar dúvida por palavra-chave (ex: kit, pix, comprovante, casa)..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 backdrop-blur-md transition"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30 border border-orange-500'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/10 hover:border-white/20'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white/[0.03] border border-white/10 text-slate-400 text-sm">
              Nenhuma pergunta encontrada com o termo "{searchQuery}". Tente outra busca ou entre em contato com a organização.
            </div>
          ) : (
            filteredFaqs.map((item) => {
              const isOpen = openId === item.id;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/10 overflow-hidden backdrop-blur-xl transition hover:border-white/20"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(item.id)}
                    className="w-full px-5 py-4 sm:py-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <span className="font-bold text-white text-sm sm:text-base">
                      {item.question}
                    </span>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition ${
                      isOpen 
                        ? 'bg-orange-600 border-orange-500 text-white shadow-md shadow-orange-600/30' 
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}>
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-white/5 animate-in fade-in duration-200">
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Still Have Questions Box */}
        <div className="mt-12 p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Ainda com dúvidas sobre o regulamento?</div>
              <div className="text-xs text-slate-400">Nossa equipe esportiva está disponível para orientar os atletas.</div>
            </div>
          </div>

          <a
            href="mailto:esportes@lajespintadas.rn.gov.br"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-mono font-bold text-white transition hover:border-orange-500/50 shrink-0"
          >
            Falar com a Organização
          </a>
        </div>

      </div>
    </section>
  );
};
