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
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface AdminLoginProps {
  onLoginSuccess: (operator: { username: string; role: AdminRole; name: string }) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const performLogin = async (targetUser: string, targetPass: string) => {
    setIsLoading(true);
    setError(null);

    const cleanInput = targetUser.trim().toLowerCase().replace(/^@/, '');
    const cleanPass = targetPass.trim();

    if (!cleanInput) {
      setError('Informe o usuário ou e-mail de acesso.');
      setIsLoading(false);
      return;
    }

    if (!cleanPass) {
      setError('Informe a senha de acesso.');
      setIsLoading(false);
      return;
    }

    // 1. Autenticação prioritária via API Serverless (/api/admin-operators) sincronizada com o banco
    let serverResponded = false;
    try {
      const res = await fetch('/api/admin-operators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'auth', username: cleanInput, password: cleanPass }),
      });
      serverResponded = true;
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.operator) {
          const sessionData = {
            username: json.operator.username,
            role: json.operator.role as AdminRole,
            name: json.operator.name,
            loggedAt: new Date().toISOString(),
          };
          localStorage.setItem('lp_admin_session', JSON.stringify(sessionData));
          storageService.syncOperatorsWithServer().catch(() => {});
          onLoginSuccess(sessionData);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Sem conexão com a API: prossegue para validação local
    }

    // 2. Fallback local somente quando a API estiver offline
    if (!serverResponded) {
      const operators = storageService.getAdminOperators();
      const op = operators.find(
        (o) =>
          o.username.toLowerCase() === cleanInput ||
          (o.email && o.email.toLowerCase() === cleanInput)
      );

      if (op) {
        if (!op.isActive) {
          setError('Este usuário operador foi desativado pela administração.');
          setIsLoading(false);
          return;
        }

        if (op.password === cleanPass) {
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
    }

    // 3. Tentar autenticação direta no Supabase Auth caso seja conta de e-mail do Supabase
    if (isSupabaseConfigured && supabase && cleanInput.includes('@')) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanInput,
          password: cleanPass,
        });

        if (!authError && authData.user) {
          const sessionData = {
            username: authData.user.email?.split('@')[0] || 'admin',
            role: 'ADMIN_GERAL' as AdminRole,
            name: authData.user.email?.split('@')[0] || 'Administrador',
            loggedAt: new Date().toISOString(),
          };
          localStorage.setItem('lp_admin_session', JSON.stringify(sessionData));
          onLoginSuccess(sessionData);
          setIsLoading(false);
          return;
        }
      } catch {}
    }

    setError('Credenciais incorretas. Verifique o usuário/e-mail e a senha digitados.');
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(username, password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
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
              Usuário ou E-mail Corporativo
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
              placeholder="Digite seu usuário ou e-mail"
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
                autoComplete="current-password"
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
            Ambiente Restrito e Monitorado • Prefeitura Municipal de Lajes Pintadas / RN
          </p>
        </div>
      </div>
    </div>
  );
};
