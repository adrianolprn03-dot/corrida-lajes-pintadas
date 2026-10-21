import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  KeyRound, 
  Trash2, 
  Check, 
  X, 
  AlertCircle, 
  ShieldAlert,
  Sparkles,
  Lock,
  UserCheck
} from 'lucide-react';
import { AdminOperator, AdminRole } from '../../types';
import { storageService } from '../../services/storage';

interface AdminOperatorsProps {
  currentUsername: string;
}

const ROLE_DETAILS: Record<AdminRole, { label: string; badgeColor: string; description: string; permissions: string[] }> = {
  ADMIN_GERAL: {
    label: 'Administrador Geral',
    badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20',
    description: 'Acesso irrestrito a todos os módulos do sistema, finanças municipais, gateway Asaas, configurações da prova e gestão de operadores.',
    permissions: [
      'Visão Geral & Indicadores Completos',
      'Gestão de Inscrições & Conciliação Asaas',
      'Inscrição Presencial Local na Prefeitura',
      'Controle de Estoque Local e Visitante',
      'Gestão de Operadores & Perfis de Acesso',
      'Configuração de Lotes, Prazos e Vagas',
      'Trilha de Auditoria & Segurança',
    ],
  },
  ATENDIMENTO: {
    label: 'Atendimento Prefeitura (Local)',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    description: 'Perfil exclusivo para servidores autorizados na sede da Prefeitura de Lajes Pintadas/RN para realizar inscrições de atletas locais.',
    permissions: [
      'Inscrição Presencial da Categoria Local',
      'Conferência Documental Obrigatória (Certidão/Residência)',
      'Consulta de Atletas Cadastrados',
      'Impressão do Comprovante Individual',
    ],
  },
  FINANCEIRO: {
    label: 'Controladoria & Financeiro',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    description: 'Focado em indicadores de arrecadação, taxas de processamento Asaas, receita líquida municipal e exportação de relatórios contábeis.',
    permissions: [
      'Visão Geral & KPIs Financeiros',
      'Auditoria de Faturas & Pagamentos Pix/Cartão',
      'Diagnóstico de Conexão com Gateway Asaas',
      'Exportação de Relatórios Financeiros (CSV/Excel)',
    ],
  },
  ENTREGA_KIT: {
    label: 'Entrega de Kits & Camisas',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    description: 'Estação de trabalho no Centro de Convivência dos Idosos para busca rápida do atleta por CPF ou protocolo e baixa do kit oficial.',
    permissions: [
      'Consulta Rápida por CPF e Protocolo',
      'Conferência do Tamanho da Camisa',
      'Registro de Baixa de Entrega com Data e Operador',
      'Bloqueio Automático de Entregas Duplicadas',
    ],
  },
};

export const AdminOperators: React.FC<AdminOperatorsProps> = ({ currentUsername }) => {
  const [operators, setOperators] = useState<AdminOperator[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState<AdminOperator | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('ATENDIMENTO');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadOperators = () => {
    try {
      const list = storageService.getAdminOperators();
      setOperators(list);
    } catch (err: any) {
      setError('Erro ao carregar lista de operadores.');
    }
  };

  useEffect(() => {
    loadOperators();
  }, []);

  const openNewModal = () => {
    setEditingOperator(null);
    setName('');
    setUsername('');
    setEmail('');
    setRole('ATENDIMENTO');
    setPassword('');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (op: AdminOperator) => {
    setEditingOperator(op);
    setName(op.name);
    setUsername(op.username);
    setEmail(op.email || '');
    setRole(op.role);
    setPassword('');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !username.trim()) {
      setError('Nome e nome de usuário são obrigatórios.');
      return;
    }

    if (!editingOperator && !password.trim()) {
      setError('Informe uma senha inicial para o novo operador.');
      return;
    }

    try {
      storageService.saveAdminOperator({
        id: editingOperator ? editingOperator.id : `op-${Date.now()}`,
        username: username.trim().toLowerCase(),
        name: name.trim(),
        role,
        email: email.trim() || '',
        password: password.trim() || undefined,
        isActive: editingOperator ? editingOperator.isActive : true,
        createdAt: editingOperator ? editingOperator.createdAt : new Date().toISOString(),
      });

      setSuccessMessage(
        editingOperator 
          ? `Operador "${name}" atualizado com sucesso.` 
          : `Novo operador "${name}" criado com sucesso com o perfil ${ROLE_DETAILS[role].label}.`
      );
      setTimeout(() => setSuccessMessage(null), 4000);
      setIsModalOpen(false);
      loadOperators();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar operador.');
    }
  };

  const handleToggleStatus = (op: AdminOperator) => {
    if (op.username === currentUsername) {
      alert('Você não pode desativar seu próprio usuário logado.');
      return;
    }
    try {
      storageService.saveAdminOperator({
        ...op,
        isActive: !op.isActive,
      });
      loadOperators();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = (op: AdminOperator) => {
    if (op.username === currentUsername) {
      alert('Você não pode excluir seu próprio usuário logado.');
      return;
    }
    if (confirm(`Tem certeza que deseja excluir o operador "${op.name}" (${op.username})?`)) {
      try {
        storageService.deleteAdminOperator(op.id);
        loadOperators();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
              Controle de Acesso RBAC
            </span>
            <span className="text-xs text-slate-400">• 4 Perfis de Segurança</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            Operadores & Perfis Administrativos
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Configure credenciais e permissões personalizadas para a equipe municipal. O acesso é restrito estritamente às atribuições de cada perfil funcional da corrida.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-600/20 transition whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" />
          <span>Novo Operador</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Roles Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(ROLE_DETAILS) as AdminRole[]).map((r) => {
          const detail = ROLE_DETAILS[r];
          const count = operators.filter((o) => o.role === r && o.isActive).length;

          return (
            <div 
              key={r}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${detail.badgeColor}`}>
                    {detail.label}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {count} {count === 1 ? 'ativo' : 'ativos'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {detail.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Permissões Principais:
                </span>
                <ul className="space-y-1">
                  {detail.permissions.slice(0, 3).map((perm, idx) => (
                    <li key={idx} className="text-[10px] text-slate-300 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500/60" />
                      <span className="truncate">{perm}</span>
                    </li>
                  ))}
                  {detail.permissions.length > 3 && (
                    <li className="text-[10px] text-orange-400 font-semibold pl-3">
                      +{detail.permissions.length - 3} recursos
                    </li>
                  )}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Operators Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Equipe Cadastrada ({operators.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {operators.filter((o) => o.isActive).length} operadores habilitados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Operador</th>
                <th className="py-3 px-4">Usuário</th>
                <th className="py-3 px-4">Perfil Funcional</th>
                <th className="py-3 px-4">Último Acesso</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {operators.map((op) => {
                const detail = ROLE_DETAILS[op.role] || ROLE_DETAILS.ATENDIMENTO;
                const isSelf = op.username === currentUsername;

                return (
                  <tr key={op.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold shrink-0">
                          {op.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{op.name}</span>
                            {isSelf && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                Você
                              </span>
                            )}
                          </div>
                          {op.email && (
                            <span className="text-[11px] text-slate-400">{op.email}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-slate-300">
                      @{op.username}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${detail.badgeColor}`}>
                        <ShieldCheck className="w-3 h-3" />
                        <span>{detail.label}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-400">
                      {op.lastLoginAt ? new Date(op.lastLoginAt).toLocaleString('pt-BR') : 'Nunca acessou'}
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(op)}
                        disabled={isSelf}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition ${
                          op.isActive 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                        } ${isSelf ? 'cursor-not-allowed opacity-80' : ''}`}
                        title={isSelf ? 'Não é possível desativar a si próprio' : 'Clique para alterar status'}
                      >
                        {op.isActive ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(op)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                          title="Editar operador e senha"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        {!isSelf && (
                          <button
                            onClick={() => handleDelete(op)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                            title="Excluir operador"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New / Edit Operator */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingOperator ? 'Editar Operador' : 'Novo Operador do Sistema'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Defina credenciais e o perfil de acesso funcional
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nome Completo / Identificação
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: João Silva - Atendimento Prefeitura"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Nome de Usuário (Login)
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                    placeholder="Ex: joao.atendimento"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Corporativo
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operador@lajespintadas.rn.gov.br"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Perfil de Acesso (Papel do Usuário)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(Object.keys(ROLE_DETAILS) as AdminRole[]).map((rKey) => {
                    const detail = ROLE_DETAILS[rKey];
                    const isSelected = role === rKey;

                    return (
                      <button
                        key={rKey}
                        type="button"
                        onClick={() => setRole(rKey)}
                        className={`p-3 text-left rounded-xl border transition ${
                          isSelected
                            ? 'bg-orange-500/15 border-orange-500 text-white shadow-sm'
                            : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <div className="font-bold text-xs flex items-center justify-between mb-1">
                          <span>{detail.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-orange-400" />}
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2">
                          {detail.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  {editingOperator ? 'Nova Senha (deixe em branco para manter a atual)' : 'Senha de Acesso'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={editingOperator ? '••••••••••••' : 'Mínimo 6 caracteres'}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/20 transition flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Salvar Operador</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
