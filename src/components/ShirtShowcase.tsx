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
  Eye,
  Award,
  Flame,
  CheckCircle2
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
  const availableStock = selectedSizeItem ? selectedSizeItem.availableStock : 10;
  const isAvailable = availableStock > 0;

  const sizeMeasurements: Record<ShirtSize, { chest: string; length: string; height: string }> = {
    PP: { chest: '46 cm', length: '64 cm', height: '1.50 - 1.60m' },
    P: { chest: '49 cm', length: '67 cm', height: '1.60 - 1.70m' },
    M: { chest: '52 cm', length: '70 cm', height: '1.70 - 1.78m' },
    G: { chest: '55 cm', length: '73 cm', height: '1.78 - 1.85m' },
    GG: { chest: '58 cm', length: '76 cm', height: '1.85 - 1.92m' },
    XG: { chest: '62 cm', length: '79 cm', height: '1.92m+' },
  };

  const currentMeasurements = sizeMeasurements[selectedSize];

  return (
    <section id="camisa" className="py-20 bg-[#060A11] text-white border-b border-white/10 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-black uppercase tracking-wider mb-3">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Kit Oficial do Atleta • Modelo Oficial Laranja</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white">
            Camisa Técnica <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">Oficial dos 68 Anos</span>
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
            Confeccionada com tecido esportivo dry-fit de alta respirabilidade, com proteção solar UV50+ e pigmentação especial que garante visibilidade, leveza e conforto térmico durante toda a prova.
          </p>
        </div>

        {/* Main Content Grid: Image Viewer + Live Size Selector + Tech Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Col 1: Interactive Shirt Showcase (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* View Switcher Tabs */}
            <div className="flex items-center justify-center sm:justify-start gap-2 bg-[#0B1220] p-1.5 rounded-2xl border border-white/10 w-fit mx-auto sm:mx-0 shadow-sm">
              <button
                type="button"
                onClick={() => setSelectedView('both')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  selectedView === 'both'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye size={14} />
                <span>Ambos os Lados</span>
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedView('front')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  selectedView === 'front'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Frente Detalhe</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedView('back')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  selectedView === 'back'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Costas com Logo</span>
              </button>
            </div>

            {/* Interactive Image Frame */}
            <div className="relative athletic-card rounded-3xl p-6 sm:p-10 border border-white/10 flex items-center justify-center min-h-[380px] sm:min-h-[460px] group overflow-hidden">
              <div className="absolute inset-0 bg-radial-mesh opacity-30" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

              <img
                src={getCurrentImage()}
                alt="Camisa Oficial Lajes Pintadas"
                className="relative z-10 max-h-[340px] sm:max-h-[400px] w-auto object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-[0_20px_35px_rgba(255,85,0,0.35)]"
              />

              {/* Zoom Trigger Button */}
              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-xl bg-[#060A11]/80 hover:bg-orange-500 text-slate-300 hover:text-white border border-white/10 transition-colors shadow-lg"
                title="Ampliar visualização da camisa"
              >
                <Maximize2 size={16} />
              </button>

              {/* Floating Technology Badge */}
              <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-[#060A11]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-orange-500/30 text-xs font-black text-orange-400 shadow-xl">
                <Sun size={14} className="text-amber-400" />
                <span>Fator de Proteção Solar UV50+</span>
              </div>
            </div>

            {/* 4 Technical Feature Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="athletic-card p-3 rounded-2xl border border-white/5">
                <Wind className="w-5 h-5 text-cyan-400 mb-1" />
                <div className="text-xs font-black uppercase text-white">Dry-Fit Pro</div>
                <div className="text-[10px] text-slate-400">Rápida evaporação</div>
              </div>
              <div className="athletic-card p-3 rounded-2xl border border-white/5">
                <Sun className="w-5 h-5 text-amber-400 mb-1" />
                <div className="text-xs font-black uppercase text-white">UV 50+</div>
                <div className="text-[10px] text-slate-400">Proteção solar</div>
              </div>
              <div className="athletic-card p-3 rounded-2xl border border-white/5">
                <Layers className="w-5 h-5 text-orange-400 mb-1" />
                <div className="text-xs font-black uppercase text-white">Anti-Atrito</div>
                <div className="text-[10px] text-slate-400">Costuras planas</div>
              </div>
              <div className="athletic-card p-3 rounded-2xl border border-white/5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 mb-1" />
                <div className="text-xs font-black uppercase text-white">Oficial 68 Anos</div>
                <div className="text-[10px] text-slate-400">Item de colecionador</div>
              </div>
            </div>

          </div>

          {/* Col 2: Live Size Selector & Stock Meter (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="athletic-card rounded-3xl p-6 sm:p-7 border border-white/10 space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-orange-400 block">
                    Grade Oficial de Camisas
                  </span>
                  <h3 className="font-display font-black text-xl text-white uppercase mt-0.5">
                    Escolha Seu Tamanho
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded border border-white/5 uppercase">
                  Estoque em Tempo Real
                </span>
              </div>

              {/* Interactive Size Pills Grid */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
                  Tamanho Selecionado: <span className="text-orange-400 font-black text-sm">{selectedSize}</span>
                </label>

                <div className="grid grid-cols-3 gap-2.5">
                  {(['PP', 'P', 'M', 'G', 'GG', 'XG'] as ShirtSize[]).map((size) => {
                    const item = inventory.find((s) => s.size === size);
                    const stock = item ? item.availableStock : 10;
                    const isSoldOut = stock <= 0;
                    const isCurrent = selectedSize === size;

                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`p-3 rounded-2xl text-center transition-all border flex flex-col items-center justify-center ${
                          isCurrent
                            ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/40 scale-[1.03]'
                            : isSoldOut
                            ? 'bg-white/[0.02] border-white/5 text-slate-600 opacity-60'
                            : 'bg-[#0B1220] border-white/10 text-slate-200 hover:border-orange-500/50 hover:bg-white/5'
                        }`}
                      >
                        <span className="font-display font-black text-lg block">{size}</span>
                        <span className={`text-[10px] font-bold uppercase mt-0.5 ${
                          isCurrent 
                            ? 'text-white' 
                            : isSoldOut 
                            ? 'text-red-400' 
                            : stock <= 3 
                            ? 'text-amber-400' 
                            : 'text-emerald-400'
                        }`}>
                          {isSoldOut ? 'Esgotado' : `${stock} vagas`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Dimensions Guide Box */}
              <div className="bg-[#070C15] p-4 rounded-2xl border border-white/5 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Medidas Oficiais do Tamanho {selectedSize}:
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white/[0.03] p-2 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block uppercase">Tórax</span>
                    <span className="font-bold text-white">{currentMeasurements.chest}</span>
                  </div>
                  <div className="bg-white/[0.03] p-2 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block uppercase">Comprimento</span>
                    <span className="font-bold text-white">{currentMeasurements.length}</span>
                  </div>
                  <div className="bg-white/[0.03] p-2 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block uppercase">Estatura</span>
                    <span className="font-bold text-cyan-400">{currentMeasurements.height}</span>
                  </div>
                </div>
              </div>

              {/* Action Button for Selected Size */}
              <button
                type="button"
                disabled={!isAvailable}
                onClick={() => onOpenRegisterWithSize && onOpenRegisterWithSize(selectedSize)}
                className={`w-full py-4 rounded-2xl font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl ${
                  isAvailable
                    ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-orange-950/60 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Flame size={16} />
                <span>Garantir Tamanho {selectedSize} • R$ 60,00</span>
                <ArrowRight size={16} />
              </button>

              <span className="text-[11px] text-slate-400 text-center block">
                🔒 Vaga e tamanho de camisa travados imediatamente após a geração do Pix.
              </span>

            </div>

            {/* Medalha & Kit Completo Box */}
            <div className="athletic-card rounded-3xl p-5 border border-white/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Award size={24} />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white uppercase">Medalha Finisher de Metal Inclusa</div>
                <div className="text-slate-400 mt-0.5">
                  Todos os atletas que cruzarem a linha de chegada recebem a medalha oficial em metal fundido com fita personalizada.
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* High-Resolution Zoom Modal */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-[#0A101C] rounded-3xl p-6 border border-white/20 shadow-2xl">
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 text-white hover:bg-orange-500 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="text-center mb-4">
              <h4 className="font-display font-black text-xl text-white uppercase">
                Camisa Técnica Oficial • Lajes Pintadas/RN
              </h4>
              <span className="text-xs text-orange-400 font-bold uppercase">Edição 68 Anos • Visualização em Alta Resolução</span>
            </div>
            <div className="flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={getCurrentImage()}
                alt="Detalhes da Camisa Oficial"
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
