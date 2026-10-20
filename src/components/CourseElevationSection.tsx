import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Droplets, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Activity
} from 'lucide-react';

interface CourseElevationSectionProps {
  onOpenRegister: () => void;
}

export const CourseElevationSection: React.FC<CourseElevationSectionProps> = ({ onOpenRegister }) => {
  // Pace slider state in seconds per km (default 5:00/km = 300s)
  const [paceSeconds, setPaceSeconds] = useState<number>(300);
  const [activeCheckpoint, setActiveCheckpoint] = useState<number>(0);

  // Formatting pace
  const paceMinutes = Math.floor(paceSeconds / 60);
  const paceRemainingSeconds = paceSeconds % 60;
  const paceFormatted = `${paceMinutes}:${String(paceRemainingSeconds).padStart(2, '0')}`;

  // 5 km calculations
  const totalSeconds = paceSeconds * 5;
  const totalHours = Math.floor(totalSeconds / 3600);
  const remainingMinutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSecs = totalSeconds % 60;

  const estimatedTimeFormatted =
    totalHours > 0
      ? `${totalHours}h ${String(remainingMinutes).padStart(2, '0')}m ${String(remainingSecs).padStart(2, '0')}s`
      : `${remainingMinutes}min ${String(remainingSecs).padStart(2, '0')}s`;

  const speedKmh = (3600 / paceSeconds).toFixed(1);

  const checkpoints = [
    {
      km: '0.0 km',
      title: 'Pórtico de Largada',
      desc: 'Praça Monsenhor Freitas. Tapete de cronometragem eletrônica inicial.',
      alt: '320m',
      type: 'start',
    },
    {
      km: '1.5 km',
      title: 'Posto de Hidratação 1',
      desc: 'Avenida Principal. Água mineral em copos lacrados.',
      alt: '335m',
      type: 'water',
    },
    {
      km: '2.5 km',
      title: 'Retorno Oficial (Ponto Mais Alto)',
      desc: 'Fiscalização eletrônica de arbitragem e batedores.',
      alt: '365m',
      type: 'turn',
    },
    {
      km: '3.8 km',
      title: 'Posto de Hidratação 2',
      desc: 'Reta final em declive favorável para aceleração.',
      alt: '340m',
      type: 'water',
    },
    {
      km: '5.0 km',
      title: 'Pórtico de Chegada & Finisher',
      desc: 'Praça Monsenhor Freitas. Medalha de metal, isotônico e frutas frescas.',
      alt: '320m',
      type: 'finish',
    },
  ];

  return (
    <section id="percurso" className="bg-[#FCFBF7] text-[#101D2C] py-16 sm:py-24 border-b border-[rgba(22,35,53,0.14)]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="mb-12">
          <span className="font-sans text-xs font-semibold uppercase tracking-widest text-[#E5640E] block mb-2">
            Circuito de 5 KM Aferidos
          </span>
          <h2 className="font-condensed font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-[#101D2C] leading-none">
            Percurso & Altimetria
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#5D6672] mt-3 max-w-2xl leading-relaxed">
            Circuito em vias pavimentadas no coração de Lajes Pintadas/RN, com largada e chegada na Praça Monsenhor Freitas. Ganho de elevação gradual de +45m e retorno oficial aos 2,5 km.
          </p>
        </div>

        {/* Course Milestones Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-10">
          {checkpoints.map((cp, idx) => (
            <div
              key={idx}
              onClick={() => setActiveCheckpoint(idx)}
              className={`p-4 border rounded-[2px] cursor-pointer transition text-left flex flex-col justify-between ${
                activeCheckpoint === idx
                  ? 'border-[#101D2C] bg-white shadow-sm ring-1 ring-[#101D2C]'
                  : 'border-[rgba(22,35,53,0.14)] bg-white/70 hover:bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-sans text-[#5D6672] mb-1">
                  <span className="font-bold text-[#E5640E]">{cp.km}</span>
                  <span>{cp.alt}</span>
                </div>
                <h4 className="font-condensed font-bold text-lg uppercase text-[#101D2C] leading-snug">
                  {cp.title}
                </h4>
                <p className="font-sans text-xs text-[#5D6672] mt-1 line-clamp-2">
                  {cp.desc}
                </p>
              </div>
              <span className="font-sans text-[10px] font-semibold uppercase tracking-wider text-[#101D2C] mt-3 pt-2 border-t border-[rgba(22,35,53,0.08)] block">
                {activeCheckpoint === idx ? '● Selecionado' : 'Ver Ponto'}
              </span>
            </div>
          ))}
        </div>

        {/* 2-Column Grid: SVG Elevation Profile (Left) + Interactive Pace Calculator (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* SVG Elevation Chart (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 border border-[rgba(22,35,53,0.14)] bg-white rounded-[2px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[rgba(22,35,53,0.08)]">
                <span className="font-sans text-xs font-semibold uppercase tracking-wider text-[#101D2C]">
                  Gráfico de Elevação (+45m Ganho)
                </span>
                <span className="font-sans text-xs text-[#5D6672]">
                  Ponto de Retorno nos 2,5 KM
                </span>
              </div>

              {/* Clean SVG Profile */}
              <div className="w-full h-48 sm:h-56 relative my-2">
                <svg
                  viewBox="0 0 600 200"
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="elevationGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#F97316" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#F97316" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal gridlines */}
                  <line x1="0" y1="40" x2="600" y2="40" stroke="rgba(22,35,53,0.08)" strokeDasharray="4 4" />
                  <line x1="0" y1="100" x2="600" y2="100" stroke="rgba(22,35,53,0.08)" strokeDasharray="4 4" />
                  <line x1="0" y1="160" x2="600" y2="160" stroke="rgba(22,35,53,0.08)" strokeDasharray="4 4" />

                  {/* Elevation Area */}
                  <path
                    d="M 0 160 Q 150 140, 300 45 T 600 160 L 600 195 L 0 195 Z"
                    fill="url(#elevationGrad)"
                  />

                  {/* Elevation Curve Line */}
                  <path
                    d="M 0 160 Q 150 140, 300 45 T 600 160"
                    fill="none"
                    stroke="#E5640E"
                    strokeWidth="3"
                  />

                  {/* Checkpoint Indicators */}
                  <circle cx="0" cy="160" r="5" fill="#101D2C" />
                  <circle cx="180" cy="120" r="5" fill="#007CA0" />
                  <circle cx="300" cy="45" r="6" fill="#F97316" stroke="#101D2C" strokeWidth="2" />
                  <circle cx="456" cy="115" r="5" fill="#007CA0" />
                  <circle cx="600" cy="160" r="5" fill="#101D2C" />
                </svg>
              </div>

              {/* Chart Axis Labels */}
              <div className="flex justify-between font-sans text-xs text-[#5D6672] pt-2 border-t border-[rgba(22,35,53,0.08)]">
                <span>0 km (320m)</span>
                <span>1.5 km</span>
                <span className="font-bold text-[#E5640E]">2.5 km Retorno (365m)</span>
                <span>3.8 km</span>
                <span>5.0 km Chegada (320m)</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[rgba(22,35,53,0.08)] text-xs text-[#5D6672] font-sans flex items-center justify-between">
              <span>Trânsito totalmente fechado pela PM e Guarda Municipal</span>
              <span className="font-semibold text-[#101D2C]">Circuito 100% Asfaltado</span>
            </div>
          </div>

          {/* Race Pace Calculator (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 border border-[rgba(22,35,53,0.14)] bg-white rounded-[2px] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-[#E5640E] mb-2">
                <Activity className="w-4 h-4" />
                <span>Simulador de Tempo da Prova</span>
              </div>
              <h3 className="font-condensed font-extrabold text-2xl sm:text-3xl uppercase text-[#101D2C] leading-none mb-4">
                Calculadora de Ritmo (Pace)
              </h3>
              <p className="font-sans text-xs text-[#5D6672] leading-relaxed mb-6">
                Arraste a barra para definir seu ritmo médio por quilômetro e veja a estimativa oficial de conclusão dos 5 km.
              </p>

              {/* Slider */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-baseline font-sans">
                  <span className="text-xs text-[#5D6672] font-semibold uppercase">Ritmo Alvo (Pace):</span>
                  <span className="font-condensed font-extrabold text-3xl text-[#101D2C]">
                    {paceFormatted} <span className="text-sm font-sans font-normal text-[#5D6672]">/km</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="210"
                  max="480"
                  step="5"
                  value={paceSeconds}
                  onChange={(e) => setPaceSeconds(Number(e.target.value))}
                  className="w-full accent-[#F97316] cursor-pointer"
                  aria-label="Ajustar ritmo em minutos por quilômetro"
                />
                <div className="flex justify-between text-[11px] font-sans text-[#5D6672]">
                  <span>3:30/km (Elite)</span>
                  <span>5:00/km (Médio)</span>
                  <span>8:00/km (Iniciante)</span>
                </div>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-[#FCFBF7] border border-[rgba(22,35,53,0.1)] rounded-[2px] mb-6">
                <div>
                  <span className="font-sans text-[11px] text-[#5D6672] uppercase font-bold block">
                    Tempo Estimado 5K
                  </span>
                  <span className="font-condensed font-extrabold text-2xl text-[#101D2C]">
                    {estimatedTimeFormatted}
                  </span>
                </div>
                <div>
                  <span className="font-sans text-[11px] text-[#5D6672] uppercase font-bold block">
                    Velocidade Média
                  </span>
                  <span className="font-condensed font-extrabold text-2xl text-[#E5640E]">
                    {speedKmh} km/h
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenRegister}
              className="w-full py-3.5 px-5 font-sans font-semibold text-sm text-[#101D2C] bg-[#F97316] hover:bg-[#FF8D3E] rounded-[2px] transition flex items-center justify-center gap-2 uppercase tracking-wide"
            >
              <span>Inscrever-se para a Prova</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
