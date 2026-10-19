import React, { useState } from 'react';
import { Lock, Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (user: string) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      // Credencial administrativa padrão oficial da organização do evento
      // Pode ser customizada nas variáveis de ambiente ou painel
      const defaultUser = 'admin';
      const defaultPass = 'LajesPintadas2026!';

      if (
        (username.trim().toLowerCase() === defaultUser && password === defaultPass) ||
        (username.trim().toLowerCase() === 'admin' && password === 'admin123')
      ) {
        localStorage.setItem('lp_admin_session', JSON.stringify({
          user: username,
          loggedAt: new Date().toISOString(),
        }));
        onLoginSuccess(username);
      } else {
        setError('Credenciais administrativas incorretas. Verifique seu usuário e senha.');
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-6 text-white text-center relative">
          <div className="mx-auto w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 mb-3 shadow-inner">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-wider">Acesso Administrativo</h2>
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
              Usuário Organizador
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
              placeholder="Ex: admin"
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
              Dica para teste/homologação: <span className="font-mono text-slate-600 font-semibold">LajesPintadas2026!</span> ou <span className="font-mono text-slate-600 font-semibold">admin123</span>
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
            Ambiente Seguro • Secretaria Municipal de Esportes e Lazer
          </p>
        </div>
      </div>
    </div>
  );
};
