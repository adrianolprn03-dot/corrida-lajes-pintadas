import React, { useState } from 'react';
import { 
  Shirt, 
  Sparkles, 
  CheckCircle, 
  ShieldAlert, 
  Maximize2, 
  X, 
  Sun, 
  Wind, 
  ShieldCheck, 
  Layers, 
  ArrowRight,
  Eye
} from 'lucide-react';
import { ShirtInventoryItem, ShirtSize } from '../types';

interface ShirtShowcaseProps {
  inventory: ShirtInventoryItem[];
  onOpenRegisterWithSize?: (size: ShirtSize) => void;
}

export const ShirtShowcase: React.FC<ShirtShowcaseProps> = ({
  inventory,
  onOpenRegisterWithSize,
}) => {
  const [selectedView, setSelectedView] = useState<'both' | 'front' | 'back'>('both');
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<ShirtSize>('M');

  const getCurrentImage = () => {
    switch (selectedView) {
      case 'front':
        return '/assets/camisa_frente.webp';
      case 'back':
        return '/assets/camisa_costas.webp';
      default:
        return '/assets/camisa_oficial_lajes.webp';
    }
  };

  const selectedSizeItem = inventory.find((s) => s.size === selectedSize);
  const isAvailable = selectedSizeItem ? selectedSizeItem.availableStock > 0 : false;

  return (
    <section id="camisa" className="py-20 bg-white text-slate-900 border-b border-slate-200/80 relative overflow-hidden">
      {/* Background Lighting Elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-sky-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Kit Oficial do Atleta • Modelo 03 / Laranja</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-slate-900 uppercase tracking-tight">
            Camisa Técnica <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">Oficial Laranja</span>
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            Desenvolvida exclusivamente para a 5ª Corrida de Emancipação Política de Lajes Pintadas/RN. Confeccionada em tecido tecnológico dry-fit de alta respirabilidade, com proteção UV50+ e estampas oficiais de alta durabilidade.
          </p>
        </div>

        {/* Main Content Grid: Image + View Switcher + Tech Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Col 1: Interactive Shirt Showcase (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* View Switcher Tabs */}
            <div className="flex items-center justify-center sm:justify-start gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-fit mx-auto sm:mx-0 shadow-sm">
              <button
                type="button"
                onClick={() => setSelectedView('both')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedView === 'both'
                    ? 'bg-white text-orange-600 shadow-md font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Frente & Costas</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedView('front')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedView === 'front'
                    ? 'bg-white text-orange-600 shadow-md font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shirt className="w-3.5 h-3.5" />
                <span>Vista Frontal</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedView('back')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedView === 'back'
                    ? 'bg-white text-orange-600 shadow-md font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shirt className="w-3.5 h-3.5 rotate-180" />
                <span>Vista Dorsal</span>
              </button>
            </div>

            {/* Image Container Card */}
            <div className="relative rounded-3xl bg-slate-50 border border-slate-200/90 p-4 sm:p-6 shadow-xl group overflow-hidden text-center">
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsZoomOpen(true)}
                  className="p-2 rounded-xl bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 border border-slate-200 transition shadow-sm"
                  title="Ampliar visualização"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              <div 
                onClick={() => setIsZoomOpen(true)}
                className="cursor-zoom-in relative min-h-[340px] sm:min-h-[420px] flex items-center justify-center"
              >
                <img
                  src={getCurrentImage()}
                  alt="Camisa Oficial Laranja - 5ª Corrida de Emancipação Política de Lajes Pintadas"
                  className="max-h-[440px] w-auto object-contain mx-auto transition-transform duration-500 group-hover:scale-105 drop-shadow-xl rounded-2xl"
                />
              </div>

              {/* Bottom Caption Pill */}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 pt-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-700">Layout Aprovado para Confecção</span>
                </div>
                <button 
                  onClick={() => setIsZoomOpen(true)}
                  className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 text-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Clique para Ampliar</span>
                </button>
              </div>
            </div>

            {/* Visual Design Callout Points */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs">
                <div className="font-bold text-orange-600 mb-0.5">Peito Esquerdo</div>
                <p className="text-[11px] text-slate-600">Brasão Oficial de Lajes Pintadas em cores plenas</p>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs">
                <div className="font-bold text-orange-600 mb-0.5">Lateral Vertical</div>
                <p className="text-[11px] text-slate-600">Grafismo estilizado "— LAJES PINTADAS"</p>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs col-span-2 sm:col-span-1">
                <div className="font-bold text-sky-700 mb-0.5">Gola Bicolor</div>
                <p className="text-[11px] text-slate-600">Debrum interno em azul celeste contrastante</p>
              </div>
            </div>
          </div>

          {/* Col 2: Fabric Specs & Live Size Selection (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Technical Highlights Box */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-lg">
              <h3 className="font-display font-black text-lg text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                Especificações de Alta Performance
              </h3>

              <div className="space-y-3.5 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-orange-100 text-orange-600 shrink-0">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Proteção Solar UV50+</h4>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">
                      Bloqueia até 98% dos raios solares durante a corrida matinal nas vias públicas de Lajes Pintadas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-sky-100 text-sky-700 shrink-0">
                    <Wind className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Respirabilidade Ativa Dry-Fit</h4>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">
                      Fibras especiais que transportam o suor para fora da peça, mantendo o corpo seco e leve do km 0 ao 5.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Modelagem Anatômica Unissex</h4>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">
                      Costuras reforçadas antialérgicas que evitam atritos indesejados durante o movimento das passadas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Size Selection & Live Stock */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Shirt className="w-4 h-4 text-orange-600" />
                  Grade de Tamanhos & Disponibilidade
                </h4>
                <span className="text-[10px] text-slate-500 font-bold">Sem troca na entrega</span>
              </div>

              {/* Size Buttons Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(['PP', 'P', 'M', 'G', 'GG', 'XG'] as ShirtSize[]).map((sz) => {
                  const item = inventory.find((i) => i.size === sz);
                  const available = item ? item.availableStock : 0;
                  const isSoldOut = available <= 0;
                  const isSelected = selectedSize === sz;

                  return (
                    <button
                      key={sz}
                      type="button"
                      disabled={isSoldOut}
                      onClick={() => setSelectedSize(sz)}
                      className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center justify-center ${
                        isSoldOut
                          ? 'border-slate-200 bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed'
                          : isSelected
                          ? 'border-orange-600 bg-orange-600 text-white shadow-md shadow-orange-600/30'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-orange-300 hover:bg-orange-50/50'
                      }`}
                    >
                      <span className="font-black text-sm">{sz}</span>
                      <span className={`text-[9px] font-bold mt-0.5 ${
                        isSoldOut ? 'text-red-500' : isSelected ? 'text-white' : 'text-slate-500'
                      }`}>
                        {isSoldOut ? 'Esgotado' : `${available} disp.`}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Size Rule Warning */}
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] leading-relaxed flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  <strong>Atenção ao Regulamento:</strong> O tamanho selecionado é confeccionado sob demanda estrita. Não será realizada troca de tamanho no ato da retirada do kit.
                </span>
              </div>

              {/* Action Button for Selected Size */}
              {onOpenRegisterWithSize && (
                <button
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => onOpenRegisterWithSize(selectedSize)}
                  className={`w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg ${
                    isAvailable
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-orange-600/25 transform hover:-translate-y-0.5'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>{isAvailable ? `Quero Minha Camisa Tam. ${selectedSize} • Inscrever-se` : `Tamanho ${selectedSize} Esgotado`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Modal Zoom Fullscreen */}
      {isZoomOpen && (
        <div 
          onClick={() => setIsZoomOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-200 cursor-zoom-out"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-5xl w-full bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-2xl text-center"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-display font-black text-base text-slate-900 uppercase tracking-wide">
                  Camisa Oficial 03 / Laranja • 5ª Corrida de Emancipação
                </h3>
                <p className="text-xs text-orange-600 font-semibold">Proposta Conceitual Aprovada • Lajes Pintadas/RN</p>
              </div>
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto flex items-center justify-center p-2 bg-slate-50 rounded-2xl">
              <img
                src="/assets/camisa_oficial_lajes.png"
                alt="Camisa Oficial Lajes Pintadas em Alta Resolução"
                className="max-h-[70vh] w-auto object-contain mx-auto rounded-2xl drop-shadow-xl"
              />
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
              <span>Frente: Brasão Lajes Pintadas + 5ª Corrida + Barra 26.12.2026</span>
              <span>Costas: Corrida de Emancipação / Lajes Pintadas / RN</span>
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition shadow-sm"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
