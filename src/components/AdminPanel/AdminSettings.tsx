import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  DollarSign, 
  Calendar, 
  MapPin, 
  FileText,
  Lock
} from 'lucide-react';
import { EventSettings, EventStatus, ShirtInventoryItem } from '../../types';

interface AdminSettingsProps {
  settings: EventSettings;
  shirts: ShirtInventoryItem[];
  onSaveSettings: (updates: Partial<EventSettings>) => Promise<void>;
  onRefresh: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings,
  shirts,
  onSaveSettings,
  onRefresh,
}) => {
  const [formData, setFormData] = useState<EventSettings>({ ...settings });
  const [statusVal, setStatusVal] = useState<EventStatus>(settings.status);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Validation function: Check if all requirements for opening registrations are met
  const validateForOpening = (data: EventSettings): string[] => {
    const errors: string[] = [];

    if (!data.maxCapacity || data.maxCapacity <= 0) {
      errors.push('Capacidade máxima do evento deve ser definida e maior que zero.');
    }
    if (!data.minAge || data.minAge <= 0) {
      errors.push('Idade mínima permitida para a prova de 5 km deve ser definida.');
    }
    if (!data.startTime.trim()) {
      errors.push('Horário oficial de largada é obrigatório.');
    }
    if (!data.startLocation.trim()) {
      errors.push('Local oficial de largada/chegada é obrigatório.');
    }
    if (!data.organizerName.trim()) {
      errors.push('Identificação do órgão organizador é obrigatória.');
    }
    if (!data.organizerContact.trim()) {
      errors.push('Canais de contato da organização do evento são obrigatórios.');
    }
    if (!data.revenueResponsible.trim()) {
      errors.push('Órgão municipal responsável pela receita da prova deve ser informado.');
    }

    const totalStock = shirts.reduce((acc, s) => acc + s.totalStock, 0);
    if (totalStock <= 0) {
      errors.push('O estoque total das camisas laranja na grade de tamanhos ainda não foi configurado.');
    }

    return errors;
  };

  const handleStatusChange = (newStatus: EventStatus) => {
    setStatusVal(newStatus);
    if (newStatus === 'OPEN') {
      const errors = validateForOpening(formData);
      setValidationErrors(errors);
    } else {
      setValidationErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    // If attempting to open, run strict validation
    if (statusVal === 'OPEN') {
      const errors = validateForOpening(formData);
      if (errors.length > 0) {
        setValidationErrors(errors);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    try {
      setIsSaving(true);
      setValidationErrors([]);
      await onSaveSettings({
        ...formData,
        status: statusVal,
      });
      setSuccessMessage('Configurações salvas com sucesso!');
      onRefresh();
    } catch (err: any) {
      setValidationErrors([err.message || 'Erro ao salvar configurações.']);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Save Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-4 z-20">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-600" />
            Parâmetros Oficiais do Evento
          </h3>
          <p className="text-xs text-slate-500">
            Regras de negócio, gateway de pagamentos e regulamento da 5ª Corrida
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full sm:w-auto px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Gravando...' : 'Salvar Alterações'}</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Validation Errors Box */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-red-900">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>Pendências Impeditivas para Abertura das Inscrições:</span>
          </div>
          <ul className="list-disc list-inside text-xs space-y-1 text-red-700 font-medium pl-2">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-orange-600" />
            Situação das Inscrições (Controle do Ciclo de Vida)
          </h4>
          <span className="text-xs font-bold text-slate-500">
            Atual: <strong className="text-orange-600">{settings.status}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            {
              id: 'PREPARATION',
              title: 'Em Preparação',
              desc: 'Configuração dos requisitos internos antes da abertura pública.',
              color: 'border-slate-300 hover:border-slate-400',
              activeColor: 'border-slate-700 bg-slate-50',
            },
            {
              id: 'OPEN',
              title: 'Inscrições Abertas',
              desc: 'Público pode se cadastrar e pagar pelo Asaas normalmente.',
              color: 'border-emerald-300 hover:border-emerald-400',
              activeColor: 'border-emerald-600 bg-emerald-50/50',
            },
            {
              id: 'SUSPENDED',
              title: 'Suspensas',
              desc: 'Interrupção temporária por decisão administrativa do evento.',
              color: 'border-amber-300 hover:border-amber-400',
              activeColor: 'border-amber-600 bg-amber-50/50',
            },
            {
              id: 'CLOSED',
              title: 'Encerradas',
              desc: 'Prazo limite atingido ou cronograma finalizado.',
              color: 'border-blue-300 hover:border-blue-400',
              activeColor: 'border-blue-600 bg-blue-50/50',
            },
            {
              id: 'SOLD_OUT',
              title: 'Vagas Esgotadas',
              desc: 'Capacidade máxima ou estoque de camisas atingido.',
              color: 'border-red-300 hover:border-red-400',
              activeColor: 'border-red-600 bg-red-50/50',
            },
          ].map((item) => (
            <label
              key={item.id}
              onClick={() => handleStatusChange(item.id as EventStatus)}
              className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                statusVal === item.id ? item.activeColor : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-slate-900">{item.title}</span>
                <input
                  type="radio"
                  name="eventStatus"
                  value={item.id}
                  checked={statusVal === item.id}
                  onChange={() => handleStatusChange(item.id as EventStatus)}
                  className="accent-orange-600"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">{item.desc}</p>
            </label>
          ))}
        </div>
      </div>

      {/* Main Parameters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
          <Calendar className="w-4 h-4 text-orange-600" />
          Datas, Vagas e Horários Oficiais
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Capacidade Máxima de Atletas
            </label>
            <input
              type="number"
              min={1}
              value={formData.maxCapacity || ''}
              onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || null })}
              placeholder="Ex: 350"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">Limite total de inscrições confirmadas + reservadas</p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Idade Mínima Permitida (Anos)
            </label>
            <input
              type="number"
              min={10}
              max={100}
              value={formData.minAge || ''}
              onChange={(e) => setFormData({ ...formData, minAge: parseInt(e.target.value) || null })}
              placeholder="Ex: 14"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">Conforme normas da Confederação de Atletismo</p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Horário Oficial da Largada
            </label>
            <input
              type="text"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              placeholder="06:00"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">Largada pontual às 06:00h</p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Local da Concentração, Largada e Chegada
            </label>
            <input
              type="text"
              value={formData.startLocation}
              onChange={(e) => setFormData({ ...formData, startLocation: e.target.value })}
              placeholder="Praça Monsenhor Freitas, Centro, Lajes Pintadas/RN"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Distância do Percurso Oficial
            </label>
            <input
              type="text"
              disabled
              value="5 km (Aferido)"
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
            Instruções e Local da Entrega dos Kits
          </label>
          <textarea
            rows={2}
            value={formData.kitPickupInfo}
            onChange={(e) => setFormData({ ...formData, kitPickupInfo: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Financial & Asaas Gateway Settings */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
          <DollarSign className="w-4 h-4 text-orange-600" />
          Gateway de Pagamentos Asaas & Tarifas Exatas
        </h4>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
          <strong>Regra Regimental Estrita:</strong> O valor base municipal da inscrição é <strong>R$ 60,00</strong>. As tarifas do Asaas são repassadas ao atleta sem parcelamento (à vista), garantindo a liquidez municipal líquida de R$ 60,00 integral por atleta.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Ambiente Asaas
            </label>
            <select
              value={formData.asaasEnvironment}
              onChange={(e) => setFormData({ ...formData, asaasEnvironment: e.target.value as 'sandbox' | 'production' })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="sandbox">Sandbox (Testes)</option>
              <option value="production">Produção Oficial</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Pix Tarifa Fixa (Centavos)
            </label>
            <input
              type="number"
              value={formData.asaasPixFixedFeeCents}
              onChange={(e) => setFormData({ ...formData, asaasPixFixedFeeCents: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">Padrão: 99 (R$ 0,99)</p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Cartão Tarifa Fixa (Centavos)
            </label>
            <input
              type="number"
              value={formData.asaasCreditFixedFeeCents}
              onChange={(e) => setFormData({ ...formData, asaasCreditFixedFeeCents: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">Padrão: 49 (R$ 0,49)</p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Cartão Tarifa Percentual
            </label>
            <input
              type="number"
              step="0.0001"
              value={formData.asaasCreditPercentFee}
              onChange={(e) => setFormData({ ...formData, asaasCreditPercentFee: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">Padrão: 0.0299 (2,99%)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Órgão Responsável pela Arrecadação
            </label>
            <input
              type="text"
              value={formData.revenueResponsible}
              onChange={(e) => setFormData({ ...formData, revenueResponsible: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Contatos da Organização (E-mail / WhatsApp)
            </label>
            <input
              type="text"
              value={formData.organizerContact}
              onChange={(e) => setFormData({ ...formData, organizerContact: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Regulations & Privacy Texts */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
          <FileText className="w-4 h-4 text-orange-600" />
          Textos Oficiais (Regulamento e Privacidade)
        </h4>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Regulamento Oficial da Prova
            </label>
            <textarea
              rows={6}
              value={formData.termsContent}
              onChange={(e) => setFormData({ ...formData, termsContent: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Política de Privacidade e Proteção de Dados (LGPD)
            </label>
            <textarea
              rows={4}
              value={formData.privacyContent}
              onChange={(e) => setFormData({ ...formData, privacyContent: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
