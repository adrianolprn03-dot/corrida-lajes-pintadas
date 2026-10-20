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
  AlertCircle
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
    <section id="camisa" className="bg-[#101D2C] text-white py-16 sm:py-24 border-b border-white/10">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="mb-12">
          <span className="font-sans text-xs font-semibold uppercase tracking-widest text-[#FF872E] block mb-2">
            Equipamento do Atleta
          </span>
          <h2 className="font-condensed font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-white leading-none">
            Camisa Oficial da Prova
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#BBC3CE] mt-3 max-w-2xl leading-relaxed">
            Tecido tecnológico dry-fit de alto rendimento, respirabilidade máxima sob calor intenso e proteção solar UV 50+. Aprovada para corredores de alta performance e amadores.
          </p>
        </div>

        {/* 2-Column Layout: Product Display (Left) + Specifications & Sizing (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column (6 cols): Product Visual Area */}
          <div className="lg:col-span-6 bg-white rounded-[2px] p-6 sm:p-10 flex flex-col items-center justify-center relative group">
            
            {/* View Selector Controls */}
            <div className="w-full flex items-center justify-between mb-4 border-b border-[rgba(22,35,53,0.1)] pb-3">
              <span className="font-sans text-xs font-semibold uppercase tracking-wider text-[#101D2C]">
                Visualização do Modelo
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedView('both')}
                  aria-pressed={selectedView === 'both'}
                  className={`px-3 py-1 font-sans text-xs font-semibold rounded-[2px] transition ${
                    selectedView === 'both'
                      ? 'bg-[#101D2C] text-white'
                      : 'bg-black/5 text-[#5D6672] hover:text-[#101D2C]'
                  }`}
                >
                  Geral
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedView('front')}
                  aria-pressed={selectedView === 'front'}
                  className={`px-3 py-1 font-sans text-xs font-semibold rounded-[2px] transition ${
                    selectedView === 'front'
                      ? 'bg-[#101D2C] text-white'
                      : 'bg-black/5 text-[#5D6672] hover:text-[#101D2C]'
                  }`}
                >
                  Frente
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedView('back')}
                  aria-pressed={selectedView === 'back'}
                  className={`px-3 py-1 font-sans text-xs font-semibold rounded-[2px] transition ${
                    selectedView === 'back'
                      ? 'bg-[#101D2C] text-white'
                      : 'bg-black/5 text-[#5D6672] hover:text-[#101D2C]'
                  }`}
                >
                  Costas
                </button>
              </div>
            </div>

            {/* Product Image */}
            <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center my-4">
              <img
                src={getCurrentImage()}
                alt="Camisa Oficial Laranja de Corrida"
                className="max-h-full max-w-full object-contain filter drop-shadow-md transition-all duration-300"
                loading="lazy"
              />

              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                className="absolute bottom-2 right-2 p-2 bg-[#101D2C] text-white hover:bg-[#F97316] hover:text-[#101D2C] transition rounded-[2px] shadow-sm"
                title="Ampliar visualização"
                aria-label="Ampliar visualização da camisa"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Approved Design Details Note */}
            <div className="w-full pt-4 border-t border-[rgba(22,35,53,0.1)] flex items-center justify-between text-xs text-[#5D6672] font-sans">
              <span>Laranja Oficial • Logo 68 Anos</span>
              <span className="font-semibold text-[#101D2C]">Costas Lisas (Regulamento)</span>
            </div>
          </div>

          {/* Right Column (6 cols): Specifications & Live Size Selector */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 border border-white/10 bg-white/[0.03] rounded-[2px]">
                <Sun className="w-5 h-5 text-[#FF872E] mb-2" />
                <span className="font-condensed font-bold text-lg uppercase text-white block">
                  Proteção UV 50+
                </span>
                <p className="font-sans text-xs text-[#BBC3CE] mt-0.5">
                  Bloqueio eficaz contra radiação solar no percurso.
                </p>
              </div>

              <div className="p-4 border border-white/10 bg-white/[0.03] rounded-[2px]">
                <Wind className="w-5 h-5 text-[#FF872E] mb-2" />
                <span className="font-condensed font-bold text-lg uppercase text-white block">
                  Dry-Fit Tech
                </span>
                <p className="font-sans text-xs text-[#BBC3CE] mt-0.5">
                  Microperfurações para transporte rápido do suor.
                </p>
              </div>

              <div className="p-4 border border-white/10 bg-white/[0.03] rounded-[2px]">
                <ShieldCheck className="w-5 h-5 text-[#FF872E] mb-2" />
                <span className="font-condensed font-bold text-lg uppercase text-white block">
                  Sem Troca no Kit
                </span>
                <p className="font-sans text-xs text-[#BBC3CE] mt-0.5">
                  Confira suas medidas antes da finalização.
                </p>
              </div>
            </div>

            {/* Live Size Selector */}
            <div className="p-6 border border-white/10 bg-white/[0.02] rounded-[2px] space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#FF872E]">
                  Selecione seu Tamanho
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
                      className={`p-3 border rounded-[2px] transition text-center flex flex-col items-center justify-center ${
                        isSelected
                          ? 'border-[#F97316] bg-[#F97316] text-[#101D2C]'
                          : isSoldOut
                          ? 'border-white/5 bg-white/[0.01] text-white/30 cursor-not-allowed'
                          : 'border-white/10 bg-white/[0.03] text-white hover:border-white/30'
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
                    className="w-full py-3.5 px-6 font-sans font-semibold text-sm sm:text-base text-[#101D2C] bg-[#F97316] hover:bg-[#FF8D3E] rounded-[2px] transition flex items-center justify-center gap-2 uppercase tracking-wide"
                  >
                    <span>Inscrever-se com Tamanho {selectedSize}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-[2px] text-xs text-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>O tamanho {selectedSize} está esgotado no momento. Escolha outro tamanho para continuar.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Measurement Guide Table */}
            <div className="border border-white/10 bg-white/[0.02] rounded-[2px] overflow-hidden">
              <div className="p-3 bg-white/5 border-b border-white/10 text-xs font-sans font-semibold uppercase tracking-wider text-white">
                Tabela Oficial de Medidas Unissex (cm)
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
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-[2px] transition"
            aria-label="Fechar ampliação"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-2xl w-full bg-white p-6 sm:p-10 rounded-[2px]">
            <img
              src={getCurrentImage()}
              alt="Camisa Oficial Ampliada"
              className="w-full max-h-[75vh] object-contain mx-auto"
            />
            <p className="text-center font-sans text-xs text-[#5D6672] mt-4">
              Camisa Oficial 5ª Corrida de Emancipação • Lajes Pintadas/RN
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
