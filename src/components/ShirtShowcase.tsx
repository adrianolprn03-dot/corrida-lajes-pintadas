import React, { useState } from 'react';
import { 
  Shirt, 
  ShieldCheck, 
  Sun, 
  Wind, 
  Maximize2, 
  X, 
  CheckCircle2, 
  ArrowRight,
  AlertCircle,
  Award,
  Sparkles
} from 'lucide-react';
import { ShirtInventoryItem, ShirtSize } from '../types';

interface ShirtShowcaseProps {
  inventory: ShirtInventoryItem[];
  onOpenRegisterWithSize?: (size: ShirtSize) => void;
}

export type ShowcaseView = 'both' | 'ribbon' | 'front' | 'back';

export const ShirtShowcase: React.FC<ShirtShowcaseProps> = ({
  inventory,
  onOpenRegisterWithSize,
}) => {
  const [selectedView, setSelectedView] = useState<ShowcaseView>('both');
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<ShirtSize>('M');

  const getCurrentImage = () => {
    switch (selectedView) {
      case 'ribbon':
        return '/assets/fita_laranja_oficial.png';
      case 'front':
        return '/assets/camisa_frente.webp';
      case 'back':
        return '/assets/camisa_costas.webp';
      case 'both':
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
    <section id="camisa" className="bg-[#101D2C] text-white py-16 sm:py-24 border-b border-white/10 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Equipamento & Premiação Oficial • Edição 68 Anos</span>
          </div>
          <h2 className="font-condensed font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-white leading-none">
            Kit Oficial do Atleta
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#BBC3CE] mt-3 max-w-3xl leading-relaxed">
            Camisa tecnológica oficial em poliamida com proteção UV fator FPU 50+ comemorativa aos 68 anos de Lajes Pintadas, e a Medalha Finisher exclusiva com fita sublimada personalizada inclusa para todos os concluintes da prova.
          </p>
        </div>

        {/* 2-Column Layout: Product Display (Left) + Specifications & Sizing (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column (6 cols): Product Visual Area */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center relative group shadow-2xl shadow-black/40 border border-white/10">
            
            {/* View Selector Controls */}
            <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-slate-100 pb-3">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Shirt className="w-3.5 h-3.5 text-orange-600" />
                <span>Visualização do Kit</span>
              </span>
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedView('both')}
                  aria-pressed={selectedView === 'both'}
                  className={`px-3 py-1.5 font-sans text-xs font-bold rounded-lg transition cursor-pointer ${
                    selectedView === 'both'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Camisa Geral
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedView('ribbon')}
                  aria-pressed={selectedView === 'ribbon'}
                  className={`px-3 py-1.5 font-sans text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer ${
                    selectedView === 'ribbon'
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200/60'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Fita & Medalha</span>
                  <span className="text-[9px] bg-orange-700 text-white px-1.5 py-0.2 rounded-full uppercase">Nova</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedView('front')}
                  aria-pressed={selectedView === 'front'}
                  className={`px-2.5 py-1.5 font-sans text-xs font-bold rounded-lg transition cursor-pointer ${
                    selectedView === 'front'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Frente
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedView('back')}
                  aria-pressed={selectedView === 'back'}
                  className={`px-2.5 py-1.5 font-sans text-xs font-bold rounded-lg transition cursor-pointer ${
                    selectedView === 'back'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Costas
                </button>
              </div>
            </div>

            {/* Product Image Area */}
            <div className="relative w-full max-w-[440px] aspect-square flex items-center justify-center my-3 bg-gradient-to-b from-slate-50/60 to-white rounded-xl p-3 border border-slate-100">
              <img
                src={getCurrentImage()}
                alt={
                  selectedView === 'ribbon'
                    ? 'Fita Laranja da Corrida de Emancipação e Medalha Finisher 68 Anos'
                    : 'Camisa Oficial Laranja de Corrida'
                }
                className="max-h-full max-w-full object-contain filter drop-shadow-md transition-all duration-300 transform group-hover:scale-[1.02]"
                loading="eager"
              />

              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                className="absolute bottom-3 right-3 p-2.5 bg-slate-900/90 hover:bg-orange-600 text-white transition rounded-xl shadow-md cursor-pointer backdrop-blur-xs"
                title="Ampliar visualização"
                aria-label="Ampliar visualização"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Interactive Thumbnail Strip */}
            <div className="w-full grid grid-cols-4 gap-2 pt-2 pb-3">
              <button
                type="button"
                onClick={() => setSelectedView('both')}
                className={`p-1.5 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                  selectedView === 'both'
                    ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/30'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <img
                  src="/assets/camisa_oficial_lajes.webp"
                  alt="Camisa Geral"
                  className="w-10 h-10 object-contain"
                />
                <span className="text-[10px] font-bold text-slate-700">Camisa</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedView('ribbon')}
                className={`p-1.5 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                  selectedView === 'ribbon'
                    ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/30'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <img
                  src="/assets/fita_laranja_oficial.png"
                  alt="Fita e Medalha"
                  className="w-10 h-10 object-contain"
                />
                <span className="text-[10px] font-bold text-orange-700 flex items-center gap-0.5">
                  <span>Medalha</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedView('front')}
                className={`p-1.5 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                  selectedView === 'front'
                    ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/30'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <img
                  src="/assets/camisa_frente.webp"
                  alt="Frente"
                  className="w-10 h-10 object-contain"
                />
                <span className="text-[10px] font-bold text-slate-700">Frente</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedView('back')}
                className={`p-1.5 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                  selectedView === 'back'
                    ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/30'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <img
                  src="/assets/camisa_costas.webp"
                  alt="Costas"
                  className="w-10 h-10 object-contain"
                />
                <span className="text-[10px] font-bold text-slate-700">Costas</span>
              </button>
            </div>

            {/* Approved Design Details Note */}
            <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-sans">
              {selectedView === 'ribbon' ? (
                <>
                  <span className="font-bold text-orange-600 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    Fita Sublimada 68 Anos Oficial
                  </span>
                  <span className="font-semibold text-slate-900">Medalha Finisher Inclusa</span>
                </>
              ) : (
                <>
                  <span className="font-medium text-slate-700">Laranja Oficial • Logo 68 Anos</span>
                  <span className="font-semibold text-slate-900">Costas Lisas (Regulamento)</span>
                </>
              )}
            </div>
          </div>

          {/* Right Column (6 cols): Specifications & Live Size Selector */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 border border-white/10 bg-white/[0.04] rounded-xl hover:border-orange-500/30 transition">
                <Sun className="w-5 h-5 text-[#FF872E] mb-2" />
                <span className="font-condensed font-bold text-lg uppercase text-white block">
                  Conforto Térmico
                </span>
                <p className="font-sans text-xs text-[#BBC3CE] mt-0.5">
                  Toque frio, leveza e alta respirabilidade no percurso.
                </p>
              </div>

              <div className="p-4 border border-white/10 bg-white/[0.04] rounded-xl hover:border-orange-500/30 transition">
                <Wind className="w-5 h-5 text-[#FF872E] mb-2" />
                <span className="font-condensed font-bold text-lg uppercase text-white block">
                  Poliamida FPU 50+
                </span>
                <p className="font-sans text-xs text-[#BBC3CE] mt-0.5">
                  A poliamida tecnológica com proteção solar UV FPU 50+.
                </p>
              </div>

              <div className="p-4 border border-white/10 bg-white/[0.04] rounded-xl hover:border-orange-500/30 transition">
                <Award className="w-5 h-5 text-[#FF872E] mb-2" />
                <span className="font-condensed font-bold text-lg uppercase text-white block">
                  Medalha Finisher
                </span>
                <p className="font-sans text-xs text-[#BBC3CE] mt-0.5">
                  Fita sublimada 68 anos e medalha inclusa no kit.
                </p>
              </div>
            </div>

            {/* Live Size Selector */}
            <div className="p-6 border border-white/10 bg-white/[0.02] rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#FF872E]">
                  Selecione seu Tamanho de Camisa
                </span>
                <span className="font-sans text-xs text-[#BBC3CE]">
                  Tórax: <strong className="text-white">{currentMeasurements.chest}</strong> • Comprimento: <strong className="text-white">{currentMeasurements.length}</strong>
                </span>
              </div>

              {/* Size Buttons Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(['PP', 'P', 'M', 'G', 'GG', 'XG'] as ShirtSize[]).map((size) => {
                  const item = inventory.find((s) => s.size === size);
                  const stock = item ? item.availableStock : 10;
                  const isSoldOut = stock <= 0;
                  const isSelected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={isSoldOut}
                      onClick={() => setSelectedSize(size)}
                      className={`p-3 border rounded-xl transition text-center flex flex-col items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'border-[#F97316] bg-[#F97316] text-[#101D2C] shadow-lg shadow-orange-500/30'
                          : isSoldOut
                          ? 'border-white/5 bg-white/[0.01] text-white/30 cursor-not-allowed'
                          : 'border-white/10 bg-white/[0.03] text-white hover:border-white/30 hover:bg-white/[0.06]'
                      }`}
                    >
                      <span className="font-condensed font-extrabold text-xl leading-none">
                        {size}
                      </span>
                      <span className={`font-sans text-[10px] mt-1 uppercase font-medium ${
                        isSelected ? 'text-[#101D2C]' : isSoldOut ? 'text-red-400' : 'text-[#BBC3CE]'
                      }`}>
                        {isSoldOut ? 'Esgotado' : `${stock} vagas`}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Direct Registration CTA with selected size */}
              <div className="pt-2">
                {isAvailable ? (
                  <button
                    type="button"
                    onClick={() => onOpenRegisterWithSize && onOpenRegisterWithSize(selectedSize)}
                    className="w-full py-4 px-6 font-sans font-bold text-sm sm:text-base text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-orange-600 rounded-xl transition flex items-center justify-center gap-2 uppercase tracking-wide shadow-lg shadow-orange-600/30 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Garantir Kit Completo com Tamanho {selectedSize}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>O tamanho {selectedSize} está esgotado no momento. Escolha outro tamanho para continuar.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Measurement Guide Table */}
            <div className="border border-white/10 bg-white/[0.02] rounded-2xl overflow-hidden shadow-sm">
              <div className="p-3 bg-white/5 border-b border-white/10 text-xs font-sans font-semibold uppercase tracking-wider text-white flex items-center justify-between">
                <span>Tabela Oficial de Medidas Unissex (cm)</span>
                <span className="text-[11px] text-orange-400 font-normal">Sem troca na entrega</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-[#BBC3CE]">
                      <th className="py-2.5 px-3 font-semibold">Tamanho</th>
                      <th className="py-2.5 px-3 font-semibold">Tórax (Largura)</th>
                      <th className="py-2.5 px-3 font-semibold">Comprimento</th>
                      <th className="py-2.5 px-3 font-semibold">Estatura Sugerida</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white">
                    {(['PP', 'P', 'M', 'G', 'GG', 'XG'] as ShirtSize[]).map((size) => (
                      <tr 
                        key={size}
                        className={selectedSize === size ? 'bg-[#F97316]/10 text-[#FF872E]' : 'hover:bg-white/[0.02]'}
                      >
                        <td className="py-2 px-3 font-bold">{size}</td>
                        <td className="py-2 px-3">{sizeMeasurements[size].chest}</td>
                        <td className="py-2 px-3">{sizeMeasurements[size].length}</td>
                        <td className="py-2 px-3 text-[#BBC3CE]">{sizeMeasurements[size].height}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Fullscreen Zoom Modal */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-50 bg-[#101D2C]/95 backdrop-blur-md flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition cursor-pointer"
            aria-label="Fechar ampliação"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-3xl w-full bg-white p-6 sm:p-10 rounded-2xl shadow-2xl">
            <img
              src={getCurrentImage()}
              alt={
                selectedView === 'ribbon'
                  ? 'Fita e Medalha Finisher 68 Anos Ampliada'
                  : 'Camisa Oficial Ampliada'
              }
              className="w-full max-h-[75vh] object-contain mx-auto"
            />
            <p className="text-center font-sans text-xs text-[#5D6672] mt-4 font-semibold">
              {selectedView === 'ribbon'
                ? 'Fita Oficial Sublimada & Medalha Finisher • 68 Anos de Emancipação • Lajes Pintadas/RN'
                : 'Camisa Oficial em Poliamida FPU 50+ • 5ª Corrida de Emancipação • Lajes Pintadas/RN'}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
