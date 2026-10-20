import React from 'react';
import { 
  DollarSign, 
  Users, 
  Shirt, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  PackageCheck, 
  ShieldCheck,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { AdminMetrics, EventSettings } from '../../types';

interface AdminOverviewProps {
  metrics: AdminMetrics;
  settings: EventSettings;
  onSeedSampleData: () => void;
  onNavigateTab: (tab: 'registrations' | 'shirts' | 'settings') => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  metrics,
  settings,
  onSeedSampleData,
  onNavigateTab,
}) => {
  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const totalRegistered = metrics.confirmedCount + metrics.reservedCount;
  const capacityPercent = settings.maxCapacity 
    ? Math.min(100, Math.round((totalRegistered / settings.maxCapacity) * 100))
    : null;

  const kitDeliveryPercent = metrics.confirmedCount > 0
    ? Math.round((metrics.kitsDeliveredCount / metrics.confirmedCount) * 100)
    : 0;

  const categoryNames = {
    CASA_MASCULINO: 'Casa Masculino',
    CASA_FEMININO: 'Casa Feminino',
    VISITANTE_MASCULINO: 'Visitante Masculino',
    VISITANTE_FEMININO: 'Visitante Feminino',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Callout if empty */}
      {totalRegistered === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-amber-900 text-sm">O banco de inscrições está vazio no momento</h4>
              <p className="text-xs text-amber-700">
                Você pode carregar dados de demonstração com atletas de Lajes Pintadas e Visitantes para testar relatórios, filtros, comprovantes e entrega de kits.
              </p>
            </div>
          </div>
          <button
            onClick={onSeedSampleData}
            className="whitespace-nowrap px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            Carregar Inscrições de Demonstração
          </button>
        </div>
      )}

      {/* Financial KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Net Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Receita Líquida Municipal
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(metrics.netRevenueCents)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>R$ 60,00 integral por atleta confirmado</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-50 rounded-full opacity-50 pointer-events-none" />
        </div>

        {/* Gross Collection */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Arrecadação Bruta Total
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(metrics.grossRevenueCents)}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Total transacionado via Pix e Cartão
          </div>
        </div>

        {/* Processing Fees */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Taxas de Serviço (10%)
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(metrics.processingFeesCents)}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Custeadas integralmente pelo atleta
          </div>
        </div>
      </div>

      {/* Operational KPIs Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Confirmed */}
        <div 
          onClick={() => onNavigateTab('registrations')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-orange-300 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Confirmadas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {metrics.confirmedCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Inscrições pagas e homologadas</p>
        </div>

        {/* Reserved */}
        <div 
          onClick={() => onNavigateTab('registrations')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-orange-300 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Reservadas</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {metrics.reservedCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Aguardando pagamento (30 min)</p>
        </div>

        {/* Capacity / Remaining */}
        <div 
          onClick={() => onNavigateTab('settings')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-orange-300 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Vagas Restantes</span>
            <Users className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-black text-slate-800">
            {metrics.availableCapacity !== null ? metrics.availableCapacity : 'Ilimitado'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Capacidade total: {settings.maxCapacity || 'Não definida'}
          </p>
        </div>

        {/* Kits Delivered */}
        <div 
          onClick={() => onNavigateTab('shirts')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-orange-300 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Kits Entregues</span>
            <PackageCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600">
            {metrics.kitsDeliveredCount} <span className="text-sm font-semibold text-slate-400">({kitDeliveryPercent}%)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {metrics.confirmedCount - metrics.kitsDeliveredCount} pendentes de retirada
          </p>
        </div>
      </div>

      {/* Progress Bars: Capacity & Kits */}
      {settings.maxCapacity && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase">
              Ocupação Geral das Vagas da Prova ({totalRegistered} de {settings.maxCapacity})
            </span>
            <span className="text-xs font-bold text-orange-600">{capacityPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
            <div 
              style={{ width: `${(metrics.confirmedCount / settings.maxCapacity) * 100}%` }}
              className="bg-emerald-500 h-full"
              title={`Confirmadas: ${metrics.confirmedCount}`}
            />
            <div 
              style={{ width: `${(metrics.reservedCount / settings.maxCapacity) * 100}%` }}
              className="bg-amber-400 h-full"
              title={`Reservadas: ${metrics.reservedCount}`}
            />
          </div>
          <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Confirmadas ({metrics.confirmedCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Reservadas ({metrics.reservedCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              <span>Disponíveis ({metrics.availableCapacity})</span>
            </div>
          </div>
        </div>
      )}

      {/* Two Columns: Categories and Shirts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-600" />
              Inscrições por Categoria Oficial
            </h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
              4 Categorias
            </span>
          </div>

          <div className="space-y-3">
            {(Object.keys(metrics.categories) as (keyof typeof metrics.categories)[]).map((catKey) => {
              const count = metrics.categories[catKey];
              const pct = metrics.confirmedCount > 0 
                ? Math.round((count / metrics.confirmedCount) * 100) 
                : 0;

              return (
                <div key={catKey} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-bold text-slate-800">{categoryNames[catKey]}</span>
                    <span className="font-bold text-orange-600">{count} atletas ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-orange-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shirt Sizes Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Shirt className="w-4 h-4 text-orange-600" />
              Estoque da Camisa Oficial Laranja
            </h3>
            <button
              onClick={() => onNavigateTab('shirts')}
              className="text-xs text-orange-600 hover:text-orange-700 font-bold"
            >
              Gerenciar Estoque &rarr;
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(Object.keys(metrics.shirts) as (keyof typeof metrics.shirts)[]).map((size) => {
              const item = metrics.shirts[size];
              const isLow = item.available <= 5 && item.total > 0;
              const isSoldOut = item.available === 0 && item.total > 0;

              return (
                <div 
                  key={size}
                  className={`p-3 rounded-xl border ${
                    isSoldOut 
                      ? 'bg-red-50/50 border-red-200' 
                      : isLow 
                      ? 'bg-amber-50/50 border-amber-200' 
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="w-7 h-7 rounded-lg bg-orange-600 text-white font-black text-xs flex items-center justify-center">
                      {size}
                    </span>
                    <span className={`text-[11px] font-bold ${
                      isSoldOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-slate-600'
                    }`}>
                      {item.available} disp.
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2 space-y-0.5">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-semibold">{item.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pagas:</span>
                      <span className="font-semibold text-emerald-600">{item.confirmed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Res.:</span>
                      <span className="font-semibold text-amber-600">{item.reserved}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
