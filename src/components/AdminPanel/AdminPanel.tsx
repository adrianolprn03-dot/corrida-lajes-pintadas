import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Shirt, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  History, 
  X, 
  AlertTriangle, 
  RefreshCw, 
  Building2,
  Zap,
  UserCheck,
  Globe,
  DollarSign,
  ArrowLeft,
  CheckCircle2,
  Radio,
  ExternalLink
} from 'lucide-react';
import { AdminOverview } from './AdminOverview';
import { AdminRegistrations } from './AdminRegistrations';
import { AdminPresentialRegistration } from './AdminPresentialRegistration';
import { AdminShirtsAndKits } from './AdminShirtsAndKits';
import { AdminSettings } from './AdminSettings';
import { AdminAuditLogs } from './AdminAuditLogs';
import { AdminOperators } from './AdminOperators';
import { AdminLogin } from './AdminLogin';
import { storageService } from '../../services/storage';
import { 
  AdminMetrics, 
  EventSettings, 
  Registration, 
  ShirtInventoryItem, 
  RegistrationStatus, 
  ShirtSize,
  AdminRole 
} from '../../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CurrentOperator {
  username: string;
  role: AdminRole;
  name: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [operator, setOperator] = useState<CurrentOperator | null>(() => {
    try {
      const sess = localStorage.getItem('lp_admin_session');
      if (!sess) return null;
      const parsed = JSON.parse(sess);
      return {
        username: parsed.username || parsed.user || 'admin',
        role: parsed.role || 'ADMIN_GERAL',
        name: parsed.name || 'Administrador Geral',
      };
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<
    'overview' | 'registrations' | 'presential' | 'shirts' | 'asaas' | 'operators' | 'settings' | 'audit'
  >('overview');

  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [shirts, setShirts] = useState<ShirtInventoryItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [asaasDiagnostic, setAsaasDiagnostic] = useState<{
    ok: boolean;
    environment: string;
    status: string;
    latencyMs: number;
    webhookUrl: string;
    message: string;
  } | null>(null);
  const [isPingingAsaas, setIsPingingAsaas] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [s, m, r, sh, l] = await Promise.all([
        storageService.getSettings(),
        storageService.getAdminMetrics(),
        storageService.getAdminRegistrations(),
        storageService.getShirtInventory(),
        storageService.getAuditLogs(),
      ]);
      setSettings(s);
      setMetrics(m);
      setRegistrations(r);
      setShirts(sh);
      setAuditLogs(l);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && operator) {
      loadData();
      // Set appropriate default tab based on role
      if (operator.role === 'ATENDIMENTO') {
        setActiveTab('presential');
      } else if (operator.role === 'ENTREGA_KIT') {
        setActiveTab('shirts');
      } else {
        setActiveTab('overview');
      }
    }
  }, [isOpen, operator]);

  const handleLogout = () => {
    localStorage.removeItem('lp_admin_session');
    setOperator(null);
  };

  const handleUpdateStatus = async (regId: string, newStatus: RegistrationStatus, notes?: string) => {
    if (!operator) return;
    await storageService.updateRegistrationStatus(regId, newStatus, operator.username, notes);
    await loadData();
  };

  const handleReconcileAsaas = async (regId: string) => {
    await storageService.simulateWebhookConfirmation(regId);
    await loadData();
  };

  const handleReissueCode = async (regId: string, reason: string): Promise<string> => {
    if (!operator) throw new Error('Não autenticado');
    const newCode = await storageService.reissueAccessCode(regId, operator.username, reason);
    await loadData();
    return newCode;
  };

  const handleUpdateStock = async (size: ShirtSize, newStock: number) => {
    await storageService.updateShirtStock(size, newStock);
    await loadData();
  };

  const handleDeliverKit = async (regId: string, deliveredBy: string, notes?: string) => {
    await storageService.deliverKit(regId, deliveredBy, notes);
    await loadData();
  };

  const handleSaveSettings = async (updates: Partial<EventSettings>) => {
    await storageService.updateSettings(updates);
    await loadData();
  };

  const handleSeedSampleData = async () => {
    await storageService.seedSampleData();
    await loadData();
  };

  const handlePingAsaas = async () => {
    setIsPingingAsaas(true);
    try {
      const res = await storageService.testAsaasConnection();
      setAsaasDiagnostic(res);
    } catch (err: any) {
      setAsaasDiagnostic({
        ok: false,
        environment: settings?.asaasEnvironment || 'sandbox',
        status: 'FALHA DE COMUNICAÇÃO',
        latencyMs: 0,
        webhookUrl: '/api/webhook-asaas',
        message: err.message || 'Erro ao conectar.',
      });
    } finally {
      setIsPingingAsaas(false);
    }
  };

  if (!isOpen) return null;

  // Show login if no valid session
  if (!operator) {
    return (
      <AdminLogin 
        onLoginSuccess={(newOp) => {
          setOperator(newOp);
        }} 
        onCancel={onClose} 
      />
    );
  }

  // Define tabs visible to the current operator role
  const allNavTabs = [
    { 
      id: 'overview', 
      label: 'Visão Geral & Indicadores', 
      icon: BarChart3, 
      roles: ['ADMIN_GERAL', 'FINANCEIRO'] 
    },
    { 
      id: 'registrations', 
      label: 'Inscrições & Atletas', 
      icon: Users, 
      roles: ['ADMIN_GERAL', 'ATENDIMENTO', 'FINANCEIRO', 'ENTREGA_KIT'] 
    },
    { 
      id: 'presential', 
      label: 'Inscrição Presencial (Local)', 
      icon: Building2, 
      roles: ['ADMIN_GERAL', 'ATENDIMENTO'] 
    },
    { 
      id: 'shirts', 
      label: 'Estoque Local & Kits', 
      icon: Shirt, 
      roles: ['ADMIN_GERAL', 'ENTREGA_KIT'] 
    },
    { 
      id: 'asaas', 
      label: 'Gateway Asaas & Finanças', 
      icon: Zap, 
      roles: ['ADMIN_GERAL', 'FINANCEIRO'] 
    },
    { 
      id: 'operators', 
      label: 'Operadores & Perfis', 
      icon: UserCheck, 
      roles: ['ADMIN_GERAL'] 
    },
    { 
      id: 'settings', 
      label: 'Parâmetros & Regras', 
      icon: Settings, 
      roles: ['ADMIN_GERAL'] 
    },
    { 
      id: 'audit', 
      label: 'Trilha de Auditoria', 
      icon: History, 
      roles: ['ADMIN_GERAL'] 
    },
  ];

  const visibleTabs = allNavTabs.filter((t) => t.roles.includes(operator.role));

  const roleLabels: Record<AdminRole, { label: string; badgeBg: string }> = {
    ADMIN_GERAL: { label: 'Admin Geral (Acesso Total)', badgeBg: 'bg-red-500/20 text-red-400 border-red-500/30' },
    ATENDIMENTO: { label: 'Atendimento Prefeitura (Local)', badgeBg: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    FINANCEIRO: { label: 'Gestão Financeira & Asaas', badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    ENTREGA_KIT: { label: 'Entrega de Kits & Camisas', badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Admin Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white shrink-0 sticky top-0 z-30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <img 
              src="/assets/brasao_lajes.webp" 
              alt="Brasão de Lajes Pintadas" 
              className="h-10 w-auto object-contain drop-shadow" 
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-sm tracking-wide text-white uppercase whitespace-nowrap">
                  Painel de Gestão da Corrida
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-600 text-white">
                  Edição 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Prefeitura Municipal de Lajes Pintadas / RN
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Operator Role Badge */}
            <div className="flex items-center gap-2 text-xs bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="font-bold text-white text-[11px] truncate max-w-[140px] sm:max-w-none">
                  {operator.name}
                </span>
                <span className={`px-2 py-0.2 rounded-md text-[9px] font-extrabold uppercase border ${roleLabels[operator.role]?.badgeBg || 'bg-slate-800 text-slate-300'}`}>
                  {roleLabels[operator.role]?.label || operator.role}
                </span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition"
              title="Encerrar Sessão"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Return to Site Button */}
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-orange-600/20"
              title="Voltar para a página pública da corrida"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Voltar ao Site</span>
              <span className="sm:hidden">Sair</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto border-t border-slate-800/80 scrollbar-none">
          <nav className="flex space-x-2 py-2">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {isLoading && !metrics ? (
          <div className="py-24 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-orange-500" />
            <p className="text-sm font-semibold">Carregando informações do sistema...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && metrics && settings && (
              <AdminOverview
                metrics={metrics}
                settings={settings}
                onSeedSampleData={handleSeedSampleData}
                onNavigateTab={(tab) => setActiveTab(tab as any)}
              />
            )}

            {activeTab === 'registrations' && (
              <AdminRegistrations
                registrations={registrations}
                onRefresh={loadData}
                onUpdateStatus={handleUpdateStatus}
                onReconcileAsaas={handleReconcileAsaas}
                onReissueCode={handleReissueCode}
                onOpenPresential={() => setActiveTab('presential')}
              />
            )}

            {activeTab === 'presential' && settings && (
              <AdminPresentialRegistration
                currentUser={operator.name}
                settings={settings}
                inventory={shirts}
                onRegistrationCreated={loadData}
                onGoToRegistrations={() => setActiveTab('registrations')}
              />
            )}

            {activeTab === 'shirts' && (
              <AdminShirtsAndKits
                shirts={shirts}
                registrations={registrations}
                onUpdateStock={handleUpdateStock}
                onDeliverKit={handleDeliverKit}
                onRefresh={loadData}
              />
            )}

            {/* Dedicated Asaas & Financial Diagnostics Tab */}
            {activeTab === 'asaas' && settings && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                        <Zap className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                          Gateway Asaas & Conectividade Financeira
                        </h2>
                        <p className="text-xs text-slate-400">
                          Monitoramento de transações Pix dinâmicas, conciliação e webhooks automáticos
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handlePingAsaas}
                      disabled={isPingingAsaas}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-orange-600/20"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isPingingAsaas ? 'animate-spin' : ''}`} />
                      <span>{isPingingAsaas ? 'Diagnosticando...' : 'Testar Conexão em Tempo Real'}</span>
                    </button>
                  </div>

                  {/* Asaas Diagnostics Output */}
                  {asaasDiagnostic && (
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between text-xs text-emerald-400">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span>{asaasDiagnostic.message}</span>
                      </div>
                      <span className="font-mono text-slate-400">
                        Latência: {asaasDiagnostic.latencyMs} ms
                      </span>
                    </div>
                  )}

                  {/* 3 Detail Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Status do Gateway
                      </span>
                      <div className="text-lg font-black text-emerald-400 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>ATIVO & CONECTADO</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2">
                        Ambiente: <strong className="text-white uppercase">{settings.asaasEnvironment}</strong>
                      </p>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Endpoint Webhook Oficial
                      </span>
                      <div className="text-xs font-mono font-bold text-orange-400 break-all">
                        /api/webhook-asaas
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2">
                        Eventos: PAYMENT_RECEIVED, PAYMENT_CONFIRMED
                      </p>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Estrutura de Taxas
                      </span>
                      <div className="text-lg font-black text-white">
                        10% (R$ 6,00)
                      </div>
                      <p className="text-[11px] text-emerald-400 mt-2">
                        R$ 60,00 líquido municipal preservado integralmente
                      </p>
                    </div>
                  </div>

                  {/* Webhook Verification Guide */}
                  <div className="mt-6 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl text-xs space-y-2">
                    <div className="font-bold text-white flex items-center gap-2">
                      <Radio className="w-4 h-4 text-orange-500" />
                      <span>Instruções de Configuração no Portal Asaas</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      Para homologação final ou produção, cadastre a URL 
                      <strong className="text-white font-mono bg-slate-800 px-1.5 py-0.5 rounded mx-1">
                        https://corrida-lajes-pintadas-rn.vercel.app/api/webhook-asaas
                      </strong>
                      no menu <em>Integrações &rarr; Webhooks para Cobranças</em> do painel Asaas. O sistema atualiza o status dos atletas para CONFIRMED automaticamente no momento em que o Pix é compensado.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Operators & Roles Tab */}
            {activeTab === 'operators' && (
              <AdminOperators currentUsername={operator.username} />
            )}

            {activeTab === 'settings' && settings && (
              <AdminSettings
                settings={settings}
                shirts={shirts}
                onSaveSettings={handleSaveSettings}
                onRefresh={loadData}
              />
            )}

            {activeTab === 'audit' && (
              <AdminAuditLogs logs={auditLogs} />
            )}
          </>
        )}
      </main>
    </div>
  );
};
