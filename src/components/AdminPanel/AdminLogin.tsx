import React, { useState } from 'react';
import { 
  Lock, 
  Shield, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  UserCheck, 
  Sparkles,
  Building2,
  DollarSign,
  Shirt
} from 'lucide-react';
import { AdminRole, AdminOperator } from '../../types';
import { storageService } from '../../services/storage';

interface AdminLoginProps {
  onLoginSuccess: (operator: { username: string; role: AdminRole; name: string }) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const performLogin = (targetUser: string, targetPass: string) => {
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const trimmedUser = targetUser.trim().toLowerCase();
      const operators = storageService.getAdminOperators();
      const op = operators.find((o) => o.username.toLowerCase() === trimmedUser);

      // Check against operator list
      if (op) {
        if (!op.isActive) {
          setError('Este usuário operador foi desativado pela administração.');
          setIsLoading(false);
          return;
        }

        // Validate password (supports operator password or master passwords)
        const validPass = op.password === targetPass || targetPass === 'admin123' || targetPass === 'LajesPintadas2026!';
        if (validPass) {
          const sessionData = {
            username: op.username,
            role: op.role,
            name: op.name,
            loggedAt: new Date().toISOString(),
          };
          localStorage.setItem('lp_admin_session', JSON.stringify(sessionData));
          onLoginSuccess(sessionData);
          setIsLoading(false);
          return;
        }
      }

      // Master fallback for root admin
      if (
        (trimmedUser === 'admin' && (targetPass === 'LajesPintadas2026!' || targetPass === 'admin123'))
      ) {
        const sessionData = {
          username: 'admin',
          role: 'ADMIN_GERAL' as AdminRole,
          name: 'Administrador Geral',
          loggedAt: new Date().toISOString(),
        };
        localStorage.setItem('lp_admin_session', JSON.stringify(sessionData));
        onLoginSuccess(sessionData);
        setIsLoading(false);
        return;
      }

      setError('Credenciais incorretas. Verifique o usuário e a senha digitados.');
      setIsLoading(false);
    }, 350);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(username, password);
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    performLogin(u, p);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 px-6 py-6 text-white text-center relative">
          <div className="mx-auto w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 mb-3 shadow-inner">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-wider">Acesso ao Painel Administrativo</h2>
          <p className="text-orange-100 text-xs mt-1">
            5ª Corrida de Emancipação Política de Lajes Pintadas/RN
          </p>
        </div>

        {/* Quick Access Badges for Testing & Demo */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-6 py-3.5">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Acesso Rápido por Perfil Funcional:
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'admin123')}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-orange-500 hover:bg-orange-50/50 transition text-left group shadow-xs"
              title="Acesso completo a todas as áreas"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 group-hover:text-orange-600">
                <Shield className="w-3 h-3 text-red-500 shrink-0" />
                <span>Admin Geral</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Acesso total</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('atendimento', 'atendimento123')}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-orange-500 hover:bg-orange-50/50 transition text-left group shadow-xs"
              title="Atendimento presencial de moradores locais na Prefeitura"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 group-hover:text-orange-600">
                <Building2 className="w-3 h-3 text-blue-500 shrink-0" />
                <span>Atendimento</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Inscrição Local</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('financeiro', 'financeiro123')}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-orange-500 hover:bg-orange-50/50 transition text-left group shadow-xs"
              title="Indicadores de arrecadação, Asaas e conciliação"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 group-hover:text-orange-600">
                <DollarSign className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>Financeiro</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Asaas & KPIs</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('kit', 'kit123')}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-orange-500 hover:bg-orange-50/50 transition text-left group shadow-xs"
              title="Estação de busca e entrega de camisas"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 group-hover:text-orange-600">
                <Shirt className="w-3 h-3 text-amber-500 shrink-0" />
                <span>Entrega Kit</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Baixa rápida</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Usuário Operador
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
              placeholder="Ex: admin, atendimento, financeiro ou kit"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium pr-10"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Senha padrão de demonstração: <span className="font-mono text-slate-600 font-semibold">admin123</span> ou <span className="font-mono text-slate-600 font-semibold">LajesPintadas2026!</span>
            </p>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
            >
              Voltar ao Site
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold text-sm hover:from-orange-700 hover:to-amber-700 shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              {isLoading ? 'Autenticando...' : 'Entrar no Painel'}
            </button>
          </div>
        </form>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-medium">
            Ambiente Seguro • Prefeitura Municipal de Lajes Pintadas / RN
          </p>
        </div>
      </div>
    </div>
  );
};
