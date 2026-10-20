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
  Building2
} from 'lucide-react';
import { AdminOverview } from './AdminOverview';
import { AdminRegistrations } from './AdminRegistrations';
import { AdminPresentialRegistration } from './AdminPresentialRegistration';
import { AdminShirtsAndKits } from './AdminShirtsAndKits';
import { AdminSettings } from './AdminSettings';
import { AdminAuditLogs } from './AdminAuditLogs';
import { AdminLogin } from './AdminLogin';
import { storageService } from '../../services/storage';
import { AdminMetrics, EventSettings, Registration, ShirtInventoryItem, RegistrationStatus, ShirtSize } from '../../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    try {
      const sess = localStorage.getItem('lp_admin_session');
      return sess ? JSON.parse(sess).user : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'registrations' | 'presential' | 'shirts' | 'settings' | 'audit'>('overview');
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [shirts, setShirts] = useState<ShirtInventoryItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    if (isOpen && currentUser) {
      loadData();
    }
  }, [isOpen, currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('lp_admin_session');
    setCurrentUser(null);
  };

  const handleUpdateStatus = async (regId: string, newStatus: RegistrationStatus, notes?: string) => {
    if (!currentUser) return;
    await storageService.updateRegistrationStatus(regId, newStatus, currentUser, notes);
    await loadData();
  };

  const handleReconcileAsaas = async (regId: string) => {
    await storageService.simulateWebhookConfirmation(regId);
    await loadData();
  };

  const handleReissueCode = async (regId: string, reason: string): Promise<string> => {
    if (!currentUser) throw new Error('Não autenticado');
    const newCode = await storageService.reissueAccessCode(regId, currentUser, reason);
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

  if (!isOpen) return null;

  // Show login if no valid session
  if (!currentUser) {
    return <AdminLogin onLoginSuccess={(user) => setCurrentUser(user)} onCancel={onClose} />;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md flex flex-col">
      {/* Top Admin Navigation Bar */}
      <header className="bg-slate-950 border-b border-slate-800 text-white shrink-0 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/brasao_lajes.png" 
              alt="Brasão de Lajes Pintadas" 
              className="h-10 w-auto object-contain drop-shadow" 
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-sm tracking-wide text-white uppercase">
                  Painel de Gestão da Corrida
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-600 text-white">
                  Edição 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                5ª Corrida de Emancipação Política de Lajes Pintadas/RN
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Operador: <strong>{currentUser}</strong></span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-xl transition"
              title="Encerrar Sessão Administrativa"
            >
              <LogOut className="w-5 h-5" />
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>Sair do Painel</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto border-t border-slate-800/80 scrollbar-none">
          <nav className="flex space-x-2 py-2">
            {[
              { id: 'overview', label: 'Visão Geral & KPIs', icon: BarChart3 },
              { id: 'registrations', label: 'Inscrições & Atletas', icon: Users },
              { id: 'presential', label: 'Inscrição Presencial (Casa)', icon: Building2 },
              { id: 'shirts', label: 'Camisas & Entrega de Kits', icon: Shirt },
              { id: 'settings', label: 'Parâmetros & Regras', icon: Settings },
              { id: 'audit', label: 'Trilha de Auditoria', icon: History },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
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
                currentUser={currentUser}
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
