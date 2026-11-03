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
  Lock,
  Mail,
  Send,
  Loader2,
  Users,
  Building2,
  Globe,
  SlidersHorizontal,
  ArrowLeftRight,
  Layers,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { EventSettings, EventStatus, ShirtInventoryItem, RegistrationBatch } from '../../types';
import { generateBatchId, resolveBatchState } from '../../lib/batches';
import { formatCentsToBRL } from '../../lib/pricing';

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
  const [formData, setFormData] = useState<EventSettings>({
    ...settings,
    registrationBatches: settings.registrationBatches ? [...settings.registrationBatches] : [],
  });
  const [statusVal, setStatusVal] = useState<EventStatus>(settings.status);

  const batches = formData.registrationBatches || [];
  const soldByBatchMap: Record<string, number> = {};
  if (settings.batchState?.batches) {
    for (const b of settings.batchState.batches) {
      soldByBatchMap[b.id] = b.soldCount;
    }
  }
  const previewBatchState = resolveBatchState(batches, soldByBatchMap);

  const toDatetimeLocalValue = (iso: string | null | undefined): string => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleAddBatch = () => {
    const idx = batches.length + 1;
    const lastBatch = batches[batches.length - 1];
    const defaultPrice = lastBatch ? lastBatch.basePriceCents : (formData.basePriceCents || 5000);
    const newBatch: RegistrationBatch = {
      id: generateBatchId(),
      name: `${idx}º Lote Oficial`,
      basePriceCents: defaultPrice,
      endAt: null,
      capacity: null,
    };
    setFormData({
      ...formData,
      registrationBatches: [...batches, newBatch],
    });
  };

  const handleUpdateBatch = (id: string, patch: Partial<RegistrationBatch>) => {
    setFormData({
      ...formData,
      registrationBatches: batches.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    });
  };

  const handleRemoveBatch = (id: string) => {
    setFormData({
      ...formData,
      registrationBatches: batches.filter((b) => b.id !== id),
    });
  };

  const handleMoveBatch = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= batches.length) return;
    const copy = [...batches];
    const [item] = copy.splice(index, 1);
    copy.splice(target, 0, item);
    setFormData({
      ...formData,
      registrationBatches: copy,
    });
  };
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [testEmail, setTestEmail] = useState('');
  const [testName, setTestName] = useState('Atleta de Teste');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail || !testEmail.includes('@')) {
      setTestResult({ type: 'error', message: 'Digite um e-mail válido para receber o teste.' });
      return;
    }
    setIsSendingTest(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toEmail: testEmail, athleteName: testName }),
      });
      const json = await res.json();
      if (res.ok) {
        setTestResult({ type: 'success', message: json.message || 'E-mail enviado com sucesso!' });
      } else {
        setTestResult({ type: 'error', message: json.error || 'Falha ao enviar e-mail de teste.' });
      }
    } catch (err: any) {
      setTestResult({ type: 'error', message: err.message || 'Erro de conexão com a API.' });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Validation function: Check if all requirements for opening registrations are met
  const validateForOpening = (data: EventSettings): string[] => {
    const errors: string[] = [];

    if (!data.maxCapacity || data.maxCapacity <= 0) {
      errors.push('Capacidade máxima geral do evento deve ser definida e maior que zero.');
    }
    if (data.localMaxCapacity !== undefined && data.localMaxCapacity !== null && data.localMaxCapacity <= 0) {
      errors.push('A cota de vagas para a categoria Local (Lajespintadense) deve ser maior que zero.');
    }
    if (data.visitorMaxCapacity !== undefined && data.visitorMaxCapacity !== null && data.visitorMaxCapacity <= 0) {
      errors.push('A cota de vagas para a categoria Visitante deve ser maior que zero.');
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
              desc: 'Público pode se cadastrar e pagar online normalmente.',
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

      {/* SECTION: Gestão de Lotes de Inscrição (Virada Automática por Data ou Vagas) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-600" />
              Lotes de Inscrição (Valor, Prazo e Limite de Vagas por Lote)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Virada automática para o próximo lote pelo que ocorrer primeiro: <strong>data final atingida</strong> ou <strong>vagas do lote esgotadas</strong>. PCD paga <strong>50%</strong> do lote vigente (+ 10% taxa).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddBatch}
              className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Lote</span>
            </button>
          </div>
        </div>

        {/* Resumo do Lote Vigente */}
        {previewBatchState.configured ? (
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            previewBatchState.current
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-red-50/70 border-red-200 text-red-950'
          }`}>
            {previewBatchState.current ? (
              <>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    Lote Vigente no Site
                  </span>
                  <div className="mt-1.5 font-black text-sm sm:text-base">
                    {previewBatchState.current.name} — Base {formatCentsToBRL(previewBatchState.current.basePriceCents)}{' '}
                    <span className="text-xs font-semibold text-emerald-800">
                      (Total c/ 10%: {formatCentsToBRL(Math.round(previewBatchState.current.basePriceCents * 1.1))} • PCD 50%: {formatCentsToBRL(Math.round(Math.round(previewBatchState.current.basePriceCents / 2) * 1.1))})
                    </span>
                  </div>
                </div>
                <div className="text-xs font-bold text-emerald-900">
                  {previewBatchState.current.capacity !== null
                    ? `${previewBatchState.current.soldCount} / ${previewBatchState.current.capacity} vagas preenchidas (${previewBatchState.current.remaining} restantes)`
                    : `${previewBatchState.current.soldCount} inscrições ativas neste lote`}
                </div>
              </>
            ) : (
              <div className="text-xs font-bold">
                Todos os lotes cadastrados estão encerrados por data ou com vagas esgotadas. Adicione um novo lote ou amplie o prazo/vagas para reabrir as inscrições.
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Modo Lote Único (sem divisão de lotes cadastrada)
              </span>
              <span className="text-[11px] text-slate-500">
                Enquanto nenhum lote for adicionado, o site aplica o valor base abaixo (com 50% para PCD e +10% de taxa de serviço).
              </span>
            </div>
            <div className="w-full sm:w-52 shrink-0">
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Valor Base Geral (R$)
              </label>
              <input
                type="number"
                min={1}
                step="0.50"
                value={((formData.basePriceCents || 5000) / 100).toFixed(2)}
                onChange={(e) => {
                  const reais = parseFloat(e.target.value);
                  const cents = Number.isFinite(reais) && reais > 0 ? Math.round(reais * 100) : 5000;
                  setFormData({
                    ...formData,
                    basePriceCents: cents,
                    asaasPixFixedFeeCents: Math.round(cents * 0.10),
                    asaasCreditFixedFeeCents: Math.round(cents * 0.10),
                  });
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        )}

        {/* Lista de Lotes Configurados */}
        {batches.length > 0 && (
          <div className="space-y-3">
            {batches.map((batch, index) => {
              const resolved = previewBatchState.batches[index];
              const baseCents = batch.basePriceCents || 5000;
              const feeCents = Math.round(baseCents * 0.10);
              const totalGeneralCents = baseCents + feeCents;
              const pcdBaseCents = Math.round(baseCents / 2);
              const pcdTotalCents = pcdBaseCents + Math.round(pcdBaseCents * 0.10);

              const statusBadge =
                resolved?.status === 'ACTIVE'
                  ? { label: 'LOTE VIGENTE', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
                  : resolved?.status === 'SOLD_OUT'
                  ? { label: 'ESGOTADO POR VAGAS', cls: 'bg-red-100 text-red-800 border-red-300' }
                  : resolved?.status === 'ENDED'
                  ? { label: 'ENCERRADO POR DATA', cls: 'bg-slate-200 text-slate-700 border-slate-300' }
                  : { label: 'EM ESPERA (PRÓXIMO)', cls: 'bg-amber-50 text-amber-800 border-amber-200' };

              return (
                <div
                  key={batch.id}
                  className={`p-4 rounded-2xl border transition ${
                    resolved?.status === 'ACTIVE'
                      ? 'bg-orange-50/40 border-orange-300 shadow-2xs'
                      : 'bg-slate-50/60 border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                        {index + 1}º
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${statusBadge.cls}`}>
                        {statusBadge.label}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        • {resolved?.soldCount || 0} inscrito(s) neste lote
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveBatch(index, -1)}
                        disabled={index === 0}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg disabled:opacity-30"
                        title="Subir ordem do lote"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveBatch(index, 1)}
                        disabled={index === batches.length - 1}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg disabled:opacity-30"
                        title="Descer ordem do lote"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveBatch(batch.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                        title="Remover lote"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Nome do Lote
                      </label>
                      <input
                        type="text"
                        value={batch.name}
                        onChange={(e) => handleUpdateBatch(batch.id, { name: e.target.value })}
                        placeholder="Ex: 1º Lote Promocional"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Valor Base (R$)
                      </label>
                      <input
                        type="number"
                        min={1}
                        step="0.50"
                        value={(baseCents / 100).toFixed(2)}
                        onChange={(e) => {
                          const reais = parseFloat(e.target.value);
                          if (Number.isFinite(reais) && reais > 0) {
                            handleUpdateBatch(batch.id, { basePriceCents: Math.round(reais * 100) });
                          }
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Data/Hora Limite (Opcional)
                      </label>
                      <input
                        type="datetime-local"
                        value={toDatetimeLocalValue(batch.endAt)}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleUpdateBatch(batch.id, {
                            endAt: val ? new Date(val).toISOString() : null,
                          });
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Vagas do Lote (Opcional)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={batch.capacity !== null && batch.capacity !== undefined ? batch.capacity : ''}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          handleUpdateBatch(batch.id, { capacity: Number.isFinite(v) && v > 0 ? v : null });
                        }}
                        placeholder="Sem limite por lote"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                    <div>
                      <strong>Geral:</strong> {formatCentsToBRL(baseCents)} + 10% ({formatCentsToBRL(feeCents)}) ={' '}
                      <strong className="text-slate-900">{formatCentsToBRL(totalGeneralCents)}</strong>
                    </div>
                    <div>
                      <strong>PCD / Inclusão (50%):</strong> {formatCentsToBRL(pcdBaseCents)} + 10% ={' '}
                      <strong className="text-purple-800">{formatCentsToBRL(pcdTotalCents)}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION: Divisão de Vagas por Categoria (Cotas Oficiais) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-600" />
              Divisão de Inscrições: Cota Local (Lajespintadense) vs Cota Visitante
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Defina a quantidade de vagas exclusivas para atletas locais e vagas para atletas de outros municípios.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const total = formData.maxCapacity || 700;
                const half = Math.floor(total / 2);
                setFormData({
                  ...formData,
                  localMaxCapacity: half,
                  visitorMaxCapacity: total - half,
                });
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition flex items-center gap-1.5"
              title="Dividir vagas igualmente (50% local / 50% visitante)"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
              <span>Dividir 50% / 50%</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const local = formData.localMaxCapacity || 0;
                const visitor = formData.visitorMaxCapacity || 0;
                setFormData({
                  ...formData,
                  maxCapacity: local + visitor,
                });
              }}
              className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-[11px] font-bold rounded-lg border border-orange-200 transition flex items-center gap-1.5"
              title="Ajustar capacidade geral para a soma exata das duas cotas"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-orange-600" />
              <span>Sincronizar Total Geral</span>
            </button>
          </div>
        </div>

        {/* 2-Column Quota Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card Cota Local */}
          <div className="p-4 bg-orange-50/40 border border-orange-200/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-orange-950 uppercase tracking-wide block">
                    Cota Categoria Local (Lajespintadense)
                  </span>
                  <span className="text-[10px] font-semibold text-orange-600">
                    Atendimento Presencial na Prefeitura
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-orange-700 border border-orange-200">
                LOCAL
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Limite Máximo de Vagas Locais
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  value={formData.localMaxCapacity !== undefined && formData.localMaxCapacity !== null ? formData.localMaxCapacity : ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setFormData({ ...formData, localMaxCapacity: val > 0 ? val : null });
                  }}
                  placeholder="Ex: 350"
                  className="w-full px-3 py-2.5 bg-white border border-orange-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">vagas</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
                Privativo para quem nasceu em Lajes Pintadas/RN ou reside atualmente no município.
              </p>
            </div>

            {/* Presets rápidos */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Sugestões:</span>
              {[150, 200, 250, 300, 350, 400].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setFormData({ ...formData, localMaxCapacity: val })}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition ${
                    formData.localMaxCapacity === val
                      ? 'bg-orange-600 text-white'
                      : 'bg-white hover:bg-orange-100 text-slate-600 border border-orange-200/60'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Card Cota Visitante */}
          <div className="p-4 bg-blue-50/40 border border-blue-200/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-950 uppercase tracking-wide block">
                    Cota Categoria Visitante (Geral)
                  </span>
                  <span className="text-[10px] font-semibold text-blue-600">
                    Inscrições Online no Site Oficial
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700 border border-blue-200">
                VISITANTE
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Limite Máximo de Vagas para Visitantes
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  value={formData.visitorMaxCapacity !== undefined && formData.visitorMaxCapacity !== null ? formData.visitorMaxCapacity : ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setFormData({ ...formData, visitorMaxCapacity: val > 0 ? val : null });
                  }}
                  placeholder="Ex: 350"
                  className="w-full px-3 py-2.5 bg-white border border-blue-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">vagas</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
                Destinado para participantes de outros municípios cadastrados via checkout online.
              </p>
            </div>

            {/* Presets rápidos */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Sugestões:</span>
              {[150, 200, 250, 300, 350, 400].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setFormData({ ...formData, visitorMaxCapacity: val })}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition ${
                    formData.visitorMaxCapacity === val
                      ? 'bg-blue-600 text-white'
                      : 'bg-white hover:bg-blue-100 text-slate-600 border border-blue-200/60'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Balance Bar */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-4 font-bold">
              <span className="text-orange-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                Cota Local: {formData.localMaxCapacity || 0} vagas ({Math.round(((formData.localMaxCapacity || 0) / ((formData.localMaxCapacity || 0) + (formData.visitorMaxCapacity || 0) || 1)) * 100)}%)
              </span>
              <span className="text-blue-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                Cota Visitante: {formData.visitorMaxCapacity || 0} vagas ({Math.round(((formData.visitorMaxCapacity || 0) / ((formData.localMaxCapacity || 0) + (formData.visitorMaxCapacity || 0) || 1)) * 100)}%)
              </span>
            </div>

            <div className="text-slate-600 text-[11px] font-medium">
              Soma das Cotas: <strong className="text-slate-900 font-black">{(formData.localMaxCapacity || 0) + (formData.visitorMaxCapacity || 0)}</strong> vagas | Teto Geral Atual: <strong className="text-slate-900 font-black">{formData.maxCapacity || 'Não definido'}</strong>
            </div>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden flex">
            <div
              style={{
                width: `${Math.round(((formData.localMaxCapacity || 0) / ((formData.localMaxCapacity || 0) + (formData.visitorMaxCapacity || 0) || 1)) * 100)}%`,
              }}
              className="bg-orange-500 h-full transition-all duration-300"
              title={`Local: ${formData.localMaxCapacity || 0}`}
            />
            <div
              style={{
                width: `${Math.round(((formData.visitorMaxCapacity || 0) / ((formData.localMaxCapacity || 0) + (formData.visitorMaxCapacity || 0) || 1)) * 100)}%`,
              }}
              className="bg-blue-500 h-full transition-all duration-300"
              title={`Visitante: ${formData.visitorMaxCapacity || 0}`}
            />
          </div>
        </div>
      </div>

      {/* Main Parameters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
          <Calendar className="w-4 h-4 text-orange-600" />
          Datas, Horários e Capacidade Geral
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Capacidade Máxima Geral do Evento
            </label>
            <input
              type="number"
              min={1}
              value={formData.maxCapacity || ''}
              onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || null })}
              placeholder="Ex: 700"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">Teto total máximo de atletas (confirmados + reservados)</p>
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
              placeholder="17:00"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">Largada pontual às 17:00h</p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Local da Concentração, Largada e Chegada
            </label>
            <input
              type="text"
              value={formData.startLocation}
              onChange={(e) => setFormData({ ...formData, startLocation: e.target.value })}
              placeholder="Feira Livre Coberta, Centro, Lajes Pintadas/RN"
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
          Gateway de Pagamentos & Tarifas da Taxa de Serviço
        </h4>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
          <strong>Regra de Precificação por Lote:</strong> O valor base segue automaticamente o <strong>lote vigente</strong> configurado acima (ou o valor base geral quando em lote único), acrescido da taxa de serviço de <strong>10%</strong>. Atletas PCD pagam <strong>50%</strong> do valor base do lote vigente + 10% de taxa.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Ambiente do Gateway
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
            <p className="text-[10px] text-slate-400 mt-1">Padrão: 500 (R$ 5,00 - 10%)</p>
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
            <p className="text-[10px] text-slate-400 mt-1">Padrão: 500 (R$ 5,00 - 10%)</p>
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
            <p className="text-[10px] text-slate-400 mt-1">Padrão: 0.10 (10%)</p>
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

      {/* Institutional Email (HostGator Titan) & Live Test Dispatch */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Mail className="w-4 h-4 text-orange-600" />
            E-mail Institucional Oficial & Teste de Disparo
          </h4>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            HostGator Titan SMTP Conectado
          </span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
          <p>
            <strong>Servidor:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-slate-800">smtp.titan.email:465 (SSL)</code>
          </p>
          <p>
            <strong>Remetente Oficial:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-slate-800">contato@lajespintadas.rn.gov.br</code>
          </p>
          <p className="text-[11px] text-slate-500 pt-1">
            Quando um atleta tiver a inscrição quitada no Asaas, o sistema envia automaticamente o comprovante oficial com número de protocolo, dados da inscrição e informações de retirada do kit.
          </p>
        </div>

        {testResult && (
          <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
            testResult.type === 'success' 
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {testResult.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        <div className="bg-orange-50/50 border border-orange-200/80 rounded-xl p-4">
          <h5 className="text-[11px] font-bold uppercase tracking-wider text-orange-950 mb-3 flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-orange-600" />
            Disparar Teste de Comprovante Agora:
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-6">
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                E-mail para Receber o Teste
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Ex: seuemail@gmail.com ou contato@..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-slate-400"
              />
            </div>
            <div className="sm:col-span-4">
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Nome do Atleta Simulado
              </label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Ex: Adriano Silva"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-slate-400"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={isSendingTest}
                className="w-full py-2 px-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
              >
                {isSendingTest ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Disparar</span>
                  </>
                )}
              </button>
            </div>
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
