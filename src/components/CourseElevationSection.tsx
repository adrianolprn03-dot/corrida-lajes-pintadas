import React, { useState } from 'react';
import { 
  Compass, 
  TrendingUp, 
  Gauge, 
  MapPin, 
  Droplets, 
  Timer, 
  Zap, 
  Activity, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
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
  const finishHours = Math.floor(totalSeconds / 3600);
  const finishMinutes = Math.floor((totalSeconds % 3600) / 60);
  const finishSecs = totalSeconds % 60;

  const finishFormatted = finishHours > 0
    ? `${finishHours}h ${String(finishMinutes).padStart(2, '0')}m ${String(finishSecs).padStart(2, '0')}s`
    : `${String(finishMinutes).padStart(2, '0')}min ${String(finishSecs).padStart(2, '0')}s`;

  const speedKmh = ((3600 / paceSeconds)).toFixed(1);

  const getPaceCategory = () => {
    if (paceSeconds < 240) return { label: 'Pelotão de Elite • Ritmo de Pódio', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    if (paceSeconds < 300) return { label: 'Atleta Avançado • Ritmo Forte', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' };
    if (paceSeconds < 360) return { label: 'Atleta Intermediário • Ritmo Constante', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
    return { label: 'Concluinte Participativo • Ritmo Saudável', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
  };

  const checkpoints = [
    { km: '0.0 km', title: 'Largada Oficial', desc: 'Praça Monsenhor Freitas (Centro). Piso plano, concentração e pórtico oficial.', elevation: '280m' },
    { km: '1.5 km', title: 'Retorno Norte', desc: 'Avenida Principal. Trecho rápido e retilíneo com boa fluidez para abertura de pelotão.', elevation: '292m' },
    { km: '2.5 km', title: 'Posto de Hidratação 1', desc: 'Metade da prova. Distribuição de copos lacrados de água mineral gelada.', elevation: '288m' },
    { km: '3.8 km', title: 'Curva Histórica 68 Anos', desc: 'Leve aclive (+12m) exigindo ritmo constante. Ponto com apoio e equipe médica.', elevation: '325m' },
    { km: '5.0 km', title: 'Pórtico de Chegada', desc: 'Reta final vibrante na Praça Central com tapete de cronometragem eletrônica e entrega de medalhas.', elevation: '280m' },
  ];

  return (
    <section id="percurso" className="py-20 bg-[#070C15] text-white border-b border-white/10 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -right-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-48 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-black uppercase tracking-wider mb-3">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Guia Técnico Oficial da Prova</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white">
            Percurso, Altimetria & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-orange-400">Pace</span>
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
            Percurso 100% urbano de 5.000 metros pelas principais vias históricas de Lajes Pintadas/RN. Rápido, seguro e totalmente sinalizado pela organização.
          </p>
        </div>

        {/* 4 Telemetry Spec Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-12">
          <div className="athletic-card p-4 sm:p-5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-1">
              <Zap size={14} className="text-orange-400" />
              <span>Distância Aferida</span>
            </div>
            <div className="font-display font-black text-2xl sm:text-3xl text-white">5.000 m</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Circuito único urbano rápido</span>
          </div>

          <div className="athletic-card p-4 sm:p-5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-1">
              <TrendingUp size={14} className="text-cyan-400" />
              <span>Ganho de Elevação</span>
            </div>
            <div className="font-display font-black text-2xl sm:text-3xl text-white">+45 m</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Topografia suave e progressiva</span>
          </div>

          <div className="athletic-card p-4 sm:p-5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-1">
              <Droplets size={14} className="text-blue-400" />
              <span>Pontos de Água</span>
            </div>
            <div className="font-display font-black text-2xl sm:text-3xl text-white">Km 2.5 + Fim</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Copos selados de água mineral gelada</span>
          </div>

          <div className="athletic-card p-4 sm:p-5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-1">
              <Timer size={14} className="text-amber-400" />
              <span>Cronometragem</span>
            </div>
            <div className="font-display font-black text-2xl sm:text-3xl text-white">Chip RFID</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Resultado e tempo líquido oficial</span>
          </div>
        </div>

        {/* Course Elevation Profile SVG Graphic */}
        <div className="athletic-card p-6 sm:p-8 rounded-3xl border border-white/10 mb-12 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/5">
            <div>
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block">
                Perfil Topográfico Interativo
              </span>
              <h3 className="font-display font-black text-xl text-white uppercase mt-0.5">
                Altimetria Oficial • 5 KM
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <span>Asfalto Urbano</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <span>Posto de Hidratação</span>
              </span>
            </div>
          </div>

          {/* SVG Elevation Visual */}
          <div className="relative w-full h-44 sm:h-52">
            <svg viewBox="0 0 1000 200" className="w-full h-full preserve-3d" preserveAspectRatio="none">
              <defs>
                <linearGradient id="elevationGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FF5500" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#00E5FF" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#070C15" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF5500" />
                  <stop offset="50%" stopColor="#00E5FF" />
                  <stop offset="100%" stopColor="#FF5500" />
                </linearGradient>
              </defs>

              {/* Grid guide lines */}
              <line x1="0" y1="50" x2="1000" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="1000" y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="0" y1="150" x2="1000" y2="150" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

              {/* Area fill under curve */}
              <path
                d="M 0,160 Q 150,140 300,120 T 500,135 T 750,70 T 1000,160 L 1000,200 L 0,200 Z"
                fill="url(#elevationGrad)"
              />

              {/* Elevation path curve */}
              <path
                d="M 0,160 Q 150,140 300,120 T 500,135 T 750,70 T 1000,160"
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Checkpoint Circles */}
              <circle cx="20" cy="160" r="7" fill="#FF5500" className="animate-pulse" />
              <circle cx="300" cy="120" r="5" fill="#00E5FF" />
              <circle cx="500" cy="135" r="7" fill="#38BDF8" className="animate-pulse" />
              <circle cx="760" cy="70" r="6" fill="#F59E0B" />
              <circle cx="980" cy="160" r="7" fill="#10B981" className="animate-pulse" />
            </svg>

            {/* Labels on top of SVG */}
            <div className="absolute inset-0 flex justify-between pointer-events-none text-[10px] sm:text-xs font-bold text-slate-400 px-1 pt-2">
              <div className="text-left">
                <span className="text-orange-400 block font-black">0.0 KM</span>
                <span>Largada (280m)</span>
              </div>
              <div className="text-center hidden sm:block">
                <span className="text-cyan-400 block font-black">1.5 KM</span>
                <span>Retorno Norte</span>
              </div>
              <div className="text-center">
                <span className="text-blue-400 block font-black">2.5 KM 💧</span>
                <span>Hidratação 1</span>
              </div>
              <div className="text-center hidden sm:block">
                <span className="text-amber-400 block font-black">3.8 KM ⛰️</span>
                <span>Subida Matriz (+45m)</span>
              </div>
              <div className="text-right">
                <span className="text-emerald-400 block font-black">5.0 KM 🏅</span>
                <span>Chegada (280m)</span>
              </div>
            </div>
          </div>

          {/* Interactive Checkpoints Row */}
          <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-5 gap-3">
            {checkpoints.map((cp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveCheckpoint(idx)}
                className={`p-3 rounded-2xl text-left transition-all border ${
                  activeCheckpoint === idx
                    ? 'bg-orange-500/10 border-orange-500/40 shadow-[0_0_20px_rgba(255,85,0,0.15)]'
                    : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-black mb-1">
                  <span className={activeCheckpoint === idx ? 'text-orange-400' : 'text-slate-400'}>
                    {cp.km}
                  </span>
                  <span className="text-[10px] text-slate-500">{cp.elevation}</span>
                </div>
                <div className="text-xs font-bold text-white leading-tight">{cp.title}</div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                  {cp.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Pace & Finish Time Calculator */}
        <div className="athletic-card p-6 sm:p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0B1220] via-[#070C15] to-[#0A101C] relative">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left 6 cols: Sliders and controls */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-orange-400 mb-1">
                  <Gauge size={15} />
                  <span>Calculadora de Pace Oficial</span>
                </div>
                <h3 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white">
                  Simule Seu Tempo na Prova de 5 KM
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Ajuste seu ritmo estimado por quilômetro e visualize sua previsão oficial de chegada e velocidade média.
                </p>
              </div>

              {/* Slider Component */}
              <div className="space-y-3 bg-[#060A11] p-5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Seu Ritmo Médio (Pace por Km):
                  </span>
                  <span className="font-display font-black text-2xl text-orange-400 tabular-nums">
                    {paceFormatted} <span className="text-xs text-slate-400">/km</span>
                  </span>
                </div>

                <input
                  type="range"
                  min="210" // 3:30/km
                  max="480" // 8:00/km
                  step="5"
                  value={paceSeconds}
                  onChange={(e) => setPaceSeconds(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />

                <div className="flex justify-between text-[11px] text-slate-500 font-bold uppercase">
                  <span>3:30/km (Elite)</span>
                  <span>5:00/km (Médio)</span>
                  <span>8:00/km (Caminhada)</span>
                </div>
              </div>

              {/* Category classification badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Classificação estimada:</span>
                <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${getPaceCategory().color}`}>
                  {getPaceCategory().label}
                </span>
              </div>
            </div>

            {/* Right 5 cols: Telemetry Display Result */}
            <div className="lg:col-span-5 bg-[#060A11] border border-orange-500/30 rounded-3xl p-6 text-center space-y-4 shadow-[0_0_30px_rgba(255,85,0,0.15)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-xl pointer-events-none" />
              
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                Previsão de Tempo de Conclusão (5 KM)
              </span>

              <div className="font-display font-black text-4xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-400 py-1 tabular-nums drop-shadow-[0_0_25px_rgba(255,85,0,0.4)]">
                {finishFormatted}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5 text-center">
                <div className="bg-[#0B1220] p-3 rounded-2xl border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Velocidade Média</span>
                  <span className="font-display font-black text-lg text-white tabular-nums">{speedKmh} km/h</span>
                </div>
                <div className="bg-[#0B1220] p-3 rounded-2xl border border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Parcial Km 2.5</span>
                  <span className="font-display font-black text-lg text-cyan-400 tabular-nums">
                    {Math.floor((totalSeconds / 2) / 60)}min {String((totalSeconds / 2) % 60).padStart(2, '0')}s
                  </span>
                </div>
              </div>

              <button
                onClick={onOpenRegister}
                className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-display font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-950/60 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Inscrever-se para Bater essa Meta</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
