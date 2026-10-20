import React from 'react';
import {
  X,
  Search,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  ExternalLink,
  QrCode,
  MapPin,
  Calendar,
  AlertCircle,
  HelpCircle,
  Phone,
  Mail,
  Shirt,
  Award,
} from 'lucide-react';
import { storageService } from '../services/storage';
import { AthleteLookupResponse, RegistrationStatus, FinancialStatus } from '../types';
import { formatCentsToBRL } from '../lib/pricing';
import { formatDateBR, formatDateTimeBR } from '../lib/masks';

interface AthleteAreaProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AthleteArea: React.FC<AthleteAreaProps> = ({ isOpen, onClose }) => {
  const [protocol, setProtocol] = React.useState('');
  const [accessCode, setAccessCode] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<AthleteLookupResponse | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!protocol.trim() || !accessCode.trim()) {
      setError('Informe o número de Protocolo e o Código de Acesso.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await storageService.lookupRegistration(protocol, accessCode);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Inscrição não encontrada. Verifique os dados digitados.');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: RegistrationStatus, finStatus: FinancialStatus) => {
    if (status === 'CONFIRMED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 size={14} className="text-emerald-600" />
          Inscrição Confirmada
        </span>
      );
    }
    if (status === 'RESERVED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <Clock size={14} className="text-amber-600 animate-spin" />
          Aguardando Pagamento
        </span>
      );
    }
    if (status === 'IN_REVIEW') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
          Em Conferência Administrativa
        </span>
      );
    }
    if (status === 'EXPIRED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
          Reserva Expirada
        </span>
      );
    }
    if (status === 'REFUNDED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
          Reembolsada
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
        Cancelada
      </span>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/assets/brasao_lajes.png"
              alt="Brasão Lajes Pintadas"
              className="h-10 w-auto object-contain"
            />
            <div>
              <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">
                Portal do Corredor
              </span>
              <h3 className="font-display font-black text-lg sm:text-xl text-white uppercase leading-tight">
                Consultar Minha Inscrição
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Formulário de Busca Seguro (Protocolo + Código) */}
          {!result && (
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200/70 text-xs text-sky-900 flex items-start gap-2.5">
                <ShieldAlert size={18} className="text-sky-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Acesso Seguro:</strong> Em conformidade com a LGPD e para proteção da sua privacidade, a consulta exige o <strong>Protocolo</strong> e o <strong>Código de Acesso</strong> emitidos no momento da inscrição. Nunca permitimos busca aberta de dados cadastrais apenas pelo CPF.
                </span>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Número de Protocolo
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ex: LP5-2612-ABCDE"
                    value={protocol}
                    onChange={(e) => setProtocol(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono uppercase bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Código de Acesso (6 caracteres)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="Ex: X9Y7Z2"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono uppercase bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Consultando Sistema...</span>
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    <span>Acessar Minha Inscrição</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">
                  Perdeu seu código de acesso? Entre em contato com a organização informando seu nome e CPF para validação de identidade.
                </span>
              </div>
            </form>
          )}

          {/* Resultado da Inscrição Encontrada (Voucher Oficial) */}
          {result && (
            <div className="space-y-6">
              
              {/* Botões de Ação Topo */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <button
                  onClick={() => setResult(null)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  ← Consultar Outro Protocolo
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5"
                  >
                    <Printer size={14} />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>

              {/* Status Header */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Protocolo Oficial
                  </span>
                  <div className="font-mono font-extrabold text-xl text-slate-900">
                    {result.registration.protocol}
                  </div>
                </div>
                <div>{getStatusBadge(result.registration.status, result.registration.financialStatus)}</div>
              </div>

              {/* Voucher Card Oficial do Atleta */}
              <div className="p-6 rounded-2xl bg-white border-2 border-orange-500/40 shadow-lg space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">
                      Comprovante de Inscrição Oficial
                    </span>
                    <h4 className="font-display font-black text-xl text-slate-900 uppercase">
                      {result.athlete.fullName}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-400">CPF Mascarado:</span>
                    <div className="font-mono text-xs font-bold text-slate-700">{result.athlete.cpfMasked}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Categoria:</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {result.registration.category.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block">Camisa Oficial:</span>
                    <span className="font-bold text-orange-600 text-sm">
                      Laranja • Tamanho {result.registration.shirtSize}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block">Distância:</span>
                    <span className="font-bold text-slate-800 text-sm">5 km</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block">Cidade / UF:</span>
                    <span className="font-semibold text-slate-700">
                      {result.athlete.city}/{result.athlete.state}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block">Equipe / Assessoria:</span>
                    <span className="font-semibold text-slate-700">
                      {result.athlete.team || 'Individual'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block">Data da Inscrição:</span>
                    <span className="font-semibold text-slate-700">
                      {formatDateTimeBR(result.registration.createdAt)}
                    </span>
                  </div>
                </div>

                {result.registration.casaProofType && (
                  <div className="p-3 rounded-xl bg-orange-50 text-xs text-orange-900 border border-orange-200">
                    <strong>Vínculo Declarado (Categoria Casa):</strong>{' '}
                    {result.registration.casaProofType === 'NATURAL' && 'Natural de Lajes Pintadas/RN'}
                    {result.registration.casaProofType === 'RESIDENTE' && 'Morador Atual de Lajes Pintadas/RN'}
                    {result.registration.casaProofType === 'NATURAL_E_RESIDENTE' && 'Natural e Morador Atual'}
                  </div>
                )}

                {/* Situação da Retirada do Kit */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        result.registration.kitDelivered
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <Shirt size={22} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Situação do Kit Atleta</span>
                      <span className="text-xs text-slate-500">
                        {result.registration.kitDelivered
                          ? `Entregue em ${formatDateTimeBR(result.registration.kitDeliveredAt)}`
                          : 'Pendente de retirada no local oficial'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      result.registration.kitDelivered
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {result.registration.kitDelivered ? 'Kit Entregue' : 'Aguardando Retirada'}
                  </span>
                </div>
              </div>

              {/* Botão de Continuar Pagamento (se RESERVED) */}
              {result.registration.status === 'RESERVED' && result.registration.asaasInvoiceUrl && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5">
                      <Clock size={16} />
                      Pagamento Pendente
                    </span>
                    <span className="font-extrabold text-amber-900 text-sm">
                      {formatCentsToBRL(result.registration.totalAmountCents)}
                    </span>
                  </div>
                  <p className="text-xs text-amber-800">
                    Sua reserva ainda está ativa. Conclua o pagamento via Pix ou Cartão para não perder a vaga e o tamanho da camisa.
                  </p>
                  <a
                    href={result.registration.asaasInvoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <span>Concluir Pagamento Online</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}

              {/* Orientações para a Prova */}
              <div className="p-4 rounded-xl bg-slate-900 text-slate-300 text-xs space-y-2">
                <div className="font-bold text-white uppercase tracking-wide">
                  Orientações para o Dia da Corrida (26/12/2026):
                </div>
                <p>• Horário da Largada: <strong>{result.event.startTime}h</strong> na {result.event.startLocation}.</p>
                <p>• Chegue com no mínimo 45 minutos de antecedência para aquecimento e posicionamento no funil.</p>
                <p>• O número de peito com chip deve ser fixado visivelmente na altura do abdômen na camisa oficial laranja.</p>
              </div>

              {/* Contato do Atendimento */}
              <div className="pt-2 text-center text-xs text-slate-500">
                <span>Dúvidas ou suporte? Contato da organização: </span>
                <strong className="text-slate-700">{result.event.organizerContact}</strong>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
