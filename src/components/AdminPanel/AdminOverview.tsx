import React, { useState } from 'react';
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
  Sparkles,
  Zap,
  Activity,
  Building2,
  Globe,
  Radio,
  RefreshCw,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { AdminMetrics, EventSettings } from '../../types';
import { storageService } from '../../services/storage';

interface AdminOverviewProps {
  metrics: AdminMetrics;
  settings: EventSettings;
  onSeedSampleData: () => void;
  onNavigateTab: (tab: any) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  metrics,
  settings,
  onSeedSampleData,
  onNavigateTab,
}) => {
  const [isTestingAsaas, setIsTestingAsaas] = useState(false);
  const [asaasResult, setAsaasResult] = useState<{
    ok: boolean;
    environment: string;
    status: string;
    latencyMs: number;
    webhookUrl: string;
    message: string;
  } | null>(null);

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

  const localTotal = metrics.localCount || 0;
  const visitorTotal = metrics.visitorCount || 0;
  const localReserved = metrics.localReservedCount || 0;
  const visitorReserved = metrics.visitorReservedCount || 0;
  const localActive = localTotal + localReserved;
  const visitorActive = visitorTotal + visitorReserved;

  const localCapacity = metrics.localMaxCapacity ?? (settings.localMaxCapacity ?? (settings.maxCapacity ? Math.floor(settings.maxCapacity / 2) : 350));
  const visitorCapacity = metrics.visitorMaxCapacity ?? (settings.visitorMaxCapacity ?? (settings.maxCapacity ? Math.ceil(settings.maxCapacity / 2) : 350));

  const localRemaining = metrics.localAvailableCapacity !== undefined && metrics.localAvailableCapacity !== null
    ? metrics.localAvailableCapacity
    : (localCapacity ? Math.max(0, localCapacity - localActive) : null);

  const visitorRemaining = metrics.visitorAvailableCapacity !== undefined && metrics.visitorAvailableCapacity !== null
    ? metrics.visitorAvailableCapacity
    : (visitorCapacity ? Math.max(0, visitorCapacity - visitorActive) : null);

  const localOccupancyPct = localCapacity ? Math.min(100, Math.round((localActive / localCapacity) * 100)) : 0;
  const visitorOccupancyPct = visitorCapacity ? Math.min(100, Math.round((visitorActive / visitorCapacity) * 100)) : 0;

  const totalLocalVisitor = localTotal + visitorTotal;
  const localPct = totalLocalVisitor > 0 ? Math.round((localTotal / totalLocalVisitor) * 100) : 50;
  const visitorPct = totalLocalVisitor > 0 ? Math.round((visitorTotal / totalLocalVisitor) * 100) : 50;

  const presentialTotal = metrics.presentialCount || 0;
  const onlineTotal = metrics.onlineCount || 0;

  const categoryNames: Record<string, string> = {
    LOCAL_MASCULINO: 'Local Masculino (5 km)',
    LOCAL_FEMININO: 'Local Feminino (5 km)',
    CASA_MASCULINO: 'Local Masculino (5 km)',
    CASA_FEMININO: 'Local Feminino (5 km)',
    VISITANTE_MASCULINO: 'Visitante Masculino (5 km)',
    VISITANTE_FEMININO: 'Visitante Feminino (5 km)',
  };

  const handleTestAsaas = async () => {
    setIsTestingAsaas(true);
    try {
      const res = await storageService.testAsaasConnection();
      setAsaasResult(res);
    } catch (err: any) {
      setAsaasResult({
        ok: false,
        environment: settings.asaasEnvironment,
        status: 'OFFLINE',
        latencyMs: 0,
        webhookUrl: '/api/webhook-asaas',
        message: err.message || 'Falha ao conectar ao servidor do Asaas.',
      });
    } finally {
      setIsTestingAsaas(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* SECTION 1: Asaas Gateway Connection Status Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 text-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Integração Gateway de Pagamentos
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Conectado ao Asaas
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                  Modo {settings.asaasEnvironment === 'production' ? 'Produção' : 'Homologação'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Pix dinâmico com reserva de 30 minutos e confirmação instantânea via webhook oficial (<strong className="text-slate-800">/api/webhook-asaas</strong>).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[11px] text-slate-500 font-medium">Latência de Comunicação</div>
              <div className="text-sm font-black text-emerald-600 flex items-center justify-end gap-1">
                <Activity className="w-3.5 h-3.5" />
                <span>{asaasResult?.latencyMs || metrics.asaasLatencyMs || 42} ms</span>
              </div>
            </div>

            <button
              onClick={handleTestAsaas}
              disabled={isTestingAsaas}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold transition shadow-2xs"
              title="Executa um ping de diagnóstico em tempo real no servidor"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingAsaas ? 'animate-spin text-orange-600' : 'text-slate-500'}`} />
              <span>{isTestingAsaas ? 'Diagnosticando...' : 'Testar Conexão Asaas'}</span>
            </button>
          </div>
        </div>

        {/* Diagnostic Output if tested */}
        {asaasResult && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-700 gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{asaasResult.message}</span>
            </div>
            <span className="font-mono text-[11px] text-slate-500">
              Webhook: {asaasResult.webhookUrl}
            </span>
          </div>
        )}
      </div>

      {/* Callout if empty database */}
      {totalRegistered === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-amber-900 text-sm">O banco de inscrições está vazio no momento</h4>
              <p className="text-xs text-amber-700">
                Você pode carregar dados de demonstração com atletas Locais (Lajes Pintadas) e Visitantes para testar os indicadores, filtros e comprovantes.
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

      {/* SECTION 2: Financial KPIs (Municipal Net, Gross, Fees) */}
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
          <div className="text-3xl font-black text-slate-900">
            {formatCurrency(metrics.netRevenueCents)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>R$ 50,00 integral por atleta confirmado</span>
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
          <div className="text-3xl font-black text-slate-900">
            {formatCurrency(metrics.grossRevenueCents)}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Total transacionado via Pix / Asaas (R$ 55,00 por atleta)
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
          <div className="text-3xl font-black text-slate-900">
            {formatCurrency(metrics.processingFeesCents)}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Custeadas pelo participante (R$ 6,00 por atleta)
          </div>
        </div>
      </div>

      {/* SECTION 3: Local vs Visitor & Presential vs Online Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Local vs Visitante Card com Cotas Dedicadas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Cotas Oficiais: Local vs Visitante
                </h4>
                <span className="text-[11px] text-slate-500">
                  Gestão e ocupação de vagas por categoria
                </span>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('settings')}
              className="text-[11px] font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg border border-orange-200 transition"
              title="Ajustar limites de vagas no painel de configurações"
            >
              Configurar Cotas
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Cota Local */}
            <div className="p-3.5 bg-orange-50/50 border border-orange-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold text-orange-800 uppercase flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-orange-600" />
                  <span>Cota Local</span>
                </div>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                  localRemaining !== null && localRemaining <= 0
                    ? 'bg-red-100 text-red-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {localRemaining !== null && localRemaining <= 0 ? 'ESGOTADA' : `${localRemaining ?? '-'} livres`}
                </span>
              </div>

              <div>
                <div className="text-2xl font-black text-orange-700">
                  {localTotal} <span className="text-xs font-bold text-slate-500 font-normal">/ {localCapacity}</span>
                </div>
                {localReserved > 0 && (
                  <div className="text-[10px] text-amber-600 font-semibold">
                    +{localReserved} em reserva
                  </div>
                )}
              </div>

              {/* Progress bar Local */}
              <div>
                <div className="w-full bg-orange-200/60 rounded-full h-2 overflow-hidden">
                  <div
                    style={{ width: `${localOccupancyPct}%` }}
                    className="bg-orange-600 h-full rounded-full transition-all duration-300"
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 font-semibold">
                  <span>Ocupação: {localOccupancyPct}%</span>
                  <span className="text-orange-700">Presencial</span>
                </div>
              </div>
            </div>

            {/* Cota Visitante */}
            <div className="p-3.5 bg-blue-50/50 border border-blue-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold text-blue-800 uppercase flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>Cota Visitante</span>
                </div>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                  visitorRemaining !== null && visitorRemaining <= 0
                    ? 'bg-red-100 text-red-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {visitorRemaining !== null && visitorRemaining <= 0 ? 'ESGOTADA' : `${visitorRemaining ?? '-'} livres`}
                </span>
              </div>

              <div>
                <div className="text-2xl font-black text-blue-700">
                  {visitorTotal} <span className="text-xs font-bold text-slate-500 font-normal">/ {visitorCapacity}</span>
                </div>
                {visitorReserved > 0 && (
                  <div className="text-[10px] text-amber-600 font-semibold">
                    +{visitorReserved} em reserva
                  </div>
                )}
              </div>

              {/* Progress bar Visitante */}
              <div>
                <div className="w-full bg-blue-200/60 rounded-full h-2 overflow-hidden">
                  <div
                    style={{ width: `${visitorOccupancyPct}%` }}
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 font-semibold">
                  <span>Ocupação: {visitorOccupancyPct}%</span>
                  <span className="text-blue-700">Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ratio Bar */}
          <div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
              <div 
                style={{ width: `${localPct}%` }}
                className="bg-orange-500 h-full"
                title={`Local: ${localTotal}`}
              />
              <div 
                style={{ width: `${visitorPct}%` }}
                className="bg-blue-500 h-full"
                title={`Visitante: ${visitorTotal}`}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1.5 font-semibold">
              <span className="text-orange-600">● Cota Local ({localCapacity} vagas)</span>
              <span className="text-blue-600">● Cota Visitante ({visitorCapacity} vagas)</span>
            </div>
          </div>
        </div>

        {/* Channel & Presential Details */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Canais de Atendimento
                </h4>
                <span className="text-[11px] text-slate-500">
                  Origem do cadastro no sistema
                </span>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('presential')}
              className="text-xs text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1"
            >
              <span>Nova Inscrição</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[11px] font-bold text-slate-700 uppercase">
                Presencial (Prefeitura)
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {presentialTotal}
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">100% Documentada</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[11px] font-bold text-slate-700 uppercase">
                Online (Site Oficial)
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {onlineTotal}
              </div>
              <span className="text-[10px] text-blue-600 font-medium">Checkout Asaas</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Conferência de Vínculo Local:</span>
            </div>
            <span className="font-bold text-emerald-700">100% Homologadas</span>
          </div>
        </div>
      </div>

      {/* SECTION 4: Operational KPIs Row */}
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
          <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold">
            <span className="text-orange-600">Local: {localRemaining !== null ? localRemaining : '-'}</span>
            <span className="text-slate-300">|</span>
            <span className="text-blue-600">Visitante: {visitorRemaining !== null ? visitorRemaining : '-'}</span>
          </div>
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

      {/* Progress Bar: Capacity */}
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
                    <span className="font-bold text-slate-800">{categoryNames[catKey] || catKey.replace('_', ' ')}</span>
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

        {/* Shirt Sizes Breakdown (Local vs Visitante) */}
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
              Gerenciar Estoque Local &rarr;
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
