import React from 'react';
import { ShieldCheck, Clock, User, AlertCircle, FileText } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  action: string;
  registrationId?: string;
  protocol?: string;
  athleteName?: string;
  performedBy: string;
  reason?: string;
  notes?: string;
  previousStatus?: string;
  newStatus?: string;
  timestamp: string;
}

interface AdminAuditLogsProps {
  logs: AuditLogEntry[];
}

export const AdminAuditLogs: React.FC<AdminAuditLogsProps> = ({ logs }) => {
  const sortedLogs = [...logs].reverse();

  const actionLabels: Record<string, { label: string; color: string }> = {
    REISSUE_ACCESS_CODE: { label: 'Reemissão de Código de Acesso', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    UPDATE_REGISTRATION_STATUS: { label: 'Alteração de Situação', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    DELIVER_KIT: { label: 'Entrega de Kit Registrada', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-orange-600" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Trilha de Auditoria e Conformidade
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-semibold">
          {logs.length} registros auditados
        </span>
      </div>

      {sortedLogs.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          Nenhuma ação de auditoria registrada ainda. Ações como reemissão de códigos de acesso e mudanças de status aparecerão aqui.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
          {sortedLogs.map((log) => {
            const config = actionLabels[log.action] || { label: log.action, color: 'bg-slate-100 text-slate-700 border-slate-200' };

            return (
              <div key={log.id} className="p-4 hover:bg-slate-50 transition text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${config.color}`}>
                    {config.label}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>

                <div className="pt-1 flex items-center justify-between text-slate-800">
                  <div className="font-bold">
                    {log.protocol && <span className="font-mono text-orange-600 mr-2">{log.protocol}</span>}
                    {log.athleteName && <span>{log.athleteName}</span>}
                  </div>
                  <div className="text-slate-500 font-medium flex items-center gap-1 text-[11px]">
                    <User className="w-3.5 h-3.5" />
                    <span>Operador: <strong>{log.performedBy}</strong></span>
                  </div>
                </div>

                {log.reason && (
                  <p className="text-slate-600 text-[11px] italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                    Motivo: "{log.reason}"
                  </p>
                )}

                {log.previousStatus && log.newStatus && (
                  <p className="text-slate-600 text-[11px]">
                    Status alterado de <span className="font-bold">{log.previousStatus}</span> para <span className="font-bold text-emerald-700">{log.newStatus}</span>
                  </p>
                )}

                {log.notes && (
                  <p className="text-slate-500 text-[11px]">
                    Obs: {log.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
