import React, { useState, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Users,
  AlertCircle,
  Search,
  Loader2,
  CheckCircle2,
  Navigation,
  ExternalLink,
  Home,
} from 'lucide-react';
import { isValidCPF, formatCPF } from '../../lib/cpf';
import { maskPhone, maskCEP } from '../../lib/masks';

export interface Step1Data {
  fullName: string;
  cpf: string;
  birthDate: string; // YYYY-MM-DD
  email: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  team: string;
}

interface Step1AthleteDataProps {
  data: Step1Data;
  onChange: (fields: Partial<Step1Data>) => void;
  onNext: () => void;
}

const BRAZILIAN_UFS = [
  { uf: 'RN', name: 'RN - Rio Grande do Norte' },
  { uf: 'PB', name: 'PB - Paraíba' },
  { uf: 'CE', name: 'CE - Ceará' },
  { uf: 'PE', name: 'PE - Pernambuco' },
  { uf: 'AL', name: 'AL - Alagoas' },
  { uf: 'BA', name: 'BA - Bahia' },
  { uf: 'MA', name: 'MA - Maranhão' },
  { uf: 'PI', name: 'PI - Piauí' },
  { uf: 'SE', name: 'SE - Sergipe' },
  { uf: 'AC', name: 'AC - Acre' },
  { uf: 'AP', name: 'AP - Amapá' },
  { uf: 'AM', name: 'AM - Amazonas' },
  { uf: 'DF', name: 'DF - Distrito Federal' },
  { uf: 'ES', name: 'ES - Espírito Santo' },
  { uf: 'GO', name: 'GO - Goiás' },
  { uf: 'MT', name: 'MT - Mato Grosso' },
  { uf: 'MS', name: 'MS - Mato Grosso do Sul' },
  { uf: 'MG', name: 'MG - Minas Gerais' },
  { uf: 'PA', name: 'PA - Pará' },
  { uf: 'PR', name: 'PR - Paraná' },
  { uf: 'RJ', name: 'RJ - Rio de Janeiro' },
  { uf: 'RS', name: 'RS - Rio Grande do Sul' },
  { uf: 'RO', name: 'RO - Rondônia' },
  { uf: 'RR', name: 'RR - Roraima' },
  { uf: 'SC', name: 'SC - Santa Catarina' },
  { uf: 'SP', name: 'SP - São Paulo' },
  { uf: 'TO', name: 'TO - Tocantins' },
];

export const Step1AthleteData: React.FC<Step1AthleteDataProps> = ({
  data,
  onChange,
  onNext,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepFound, setCepFound] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  const numberInputRef = useRef<HTMLInputElement>(null);

  // Busca inteligente de CEP (ViaCEP com fallback para BrasilAPI)
  const lookupCEP = async (rawCep: string) => {
    const clean = rawCep.replace(/\D/g, '');
    if (clean.length !== 8) return;

    setIsSearchingCep(true);
    setCepError(null);
    setCepFound(false);

    try {
      // 1. Tentar ViaCEP primeiro
      const viaCepRes = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      if (viaCepRes.ok) {
        const viaCepData = await viaCepRes.json();
        if (!viaCepData.erro) {
          onChange({
            street: viaCepData.logradouro || data.street || '',
            neighborhood: viaCepData.bairro || data.neighborhood || '',
            city: viaCepData.localidade || data.city || '',
            state: viaCepData.uf || data.state || 'RN',
          });
          setCepFound(true);
          // Auto-focus no campo de número para fluidez máxima
          setTimeout(() => {
            numberInputRef.current?.focus();
          }, 120);
          return;
        }
      }

      // 2. Fallback de alta disponibilidade via BrasilAPI
      const brasilApiRes = await fetch(`https://brasilapi.com.br/api/cep/v1/${clean}`);
      if (brasilApiRes.ok) {
        const fbData = await brasilApiRes.json();
        onChange({
          street: fbData.street || data.street || '',
          neighborhood: fbData.neighborhood || data.neighborhood || '',
          city: fbData.city || data.city || '',
          state: fbData.state || data.state || 'RN',
        });
        setCepFound(true);
        setTimeout(() => {
          numberInputRef.current?.focus();
        }, 120);
        return;
      }

      // Se ambas as APIs não encontrarem o CEP específico (ex: novo loteamento ou zona rural)
      setCepError('CEP não encontrado na base dos Correios. Por favor, preencha rua, bairro e cidade manualmente abaixo.');
    } catch {
      setCepError('Consulta automática indisponível no momento. Preencha os campos de endereço manualmente.');
    } finally {
      setIsSearchingCep(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = maskCEP(e.target.value);
    onChange({ cep: formatted });
    const clean = formatted.replace(/\D/g, '');
    if (clean.length === 8) {
      lookupCEP(clean);
    } else {
      setCepFound(false);
      setCepError(null);
    }
  };

  // Atalho Rápido para Residentes de Lajes Pintadas/RN
  const handleFillLajesPintadas = () => {
    onChange({
      cep: '59235-000',
      street: data.street || 'Centro',
      neighborhood: data.neighborhood || 'Centro',
      city: 'Lajes Pintadas',
      state: 'RN',
    });
    setCepFound(true);
    setCepError(null);
    setTimeout(() => {
      numberInputRef.current?.focus();
    }, 120);
  };

  const handleToggleNoNumber = (checked: boolean) => {
    if (checked) {
      onChange({ number: 'S/N' });
    } else {
      onChange({ number: '' });
      setTimeout(() => {
        numberInputRef.current?.focus();
      }, 50);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.fullName.trim() || data.fullName.trim().split(' ').length < 2) {
      newErrors.fullName = 'Informe o nome e sobrenome completos.';
    }

    const cleanCpf = data.cpf.replace(/\D/g, '');
    if (!cleanCpf) {
      newErrors.cpf = 'CPF é obrigatório.';
    } else if (!isValidCPF(cleanCpf)) {
      newErrors.cpf = 'CPF inválido (verifique os números digitados).';
    }

    if (!data.birthDate) {
      newErrors.birthDate = 'Data de nascimento obrigatória.';
    } else {
      const birth = new Date(data.birthDate);
      const now = new Date();
      if (birth >= now || birth.getFullYear() < 1920) {
        newErrors.birthDate = 'Data de nascimento inválida.';
      }
    }

    if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'E-mail válido é obrigatório para envio do comprovante.';
    }

    const cleanPhone = data.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      newErrors.phone = 'WhatsApp com DDD é obrigatório (10 ou 11 dígitos).';
    }

    // Validações do Endereço
    const cleanCep = (data.cep || '').replace(/\D/g, '');
    if (!cleanCep || cleanCep.length !== 8) {
      newErrors.cep = 'Informe o CEP válido (8 dígitos).';
    }

    if (!data.street?.trim()) {
      newErrors.street = 'Logradouro / Rua é obrigatório.';
    }

    if (!data.number?.trim()) {
      newErrors.number = 'Número obrigatório (ou marque S/N).';
    }

    if (!data.neighborhood?.trim()) {
      newErrors.neighborhood = 'Bairro ou comunidade é obrigatório.';
    }

    if (!data.city?.trim()) {
      newErrors.city = 'Cidade de residência é obrigatória.';
    }

    if (!data.state?.trim() || data.state.trim().length !== 2) {
      newErrors.state = 'Selecione a UF.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  const isNoNumber = data.number === 'S/N';

  return (
    <form onSubmit={handleNext} className="space-y-5">
      <div className="bg-orange-50/70 p-3.5 rounded-xl border border-orange-200/60 text-xs text-orange-800 flex items-start gap-2">
        <AlertCircle size={16} className="text-orange-600 shrink-0 mt-0.5" />
        <span>
          Preencha com atenção os dados do corredor. Os dados cadastrais serão utilizados para a emissão do número de peito, seguro do atleta e apuração oficial.
        </span>
      </div>

      {/* Nome Completo */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
          Nome Completo do Atleta <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <User size={16} />
          </div>
          <input
            type="text"
            required
            placeholder="Ex: Maria da Silva Santos"
            value={data.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 transition-all ${
              errors.fullName
                ? 'border-red-400 focus:ring-red-400/20'
                : 'border-slate-300 focus:border-orange-500 focus:ring-orange-500/20'
            }`}
          />
        </div>
        {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
      </div>

      {/* CPF & Data de Nascimento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
            CPF <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="000.000.000-00"
            maxLength={14}
            value={data.cpf}
            onChange={(e) => onChange({ cpf: formatCPF(e.target.value) })}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 transition-all ${
              errors.cpf
                ? 'border-red-400 focus:ring-red-400/20'
                : 'border-slate-300 focus:border-orange-500 focus:ring-orange-500/20'
            }`}
          />
          {errors.cpf && <p className="text-xs text-red-600 mt-1">{errors.cpf}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
            Data de Nascimento <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={data.birthDate}
            onChange={(e) => onChange({ birthDate: e.target.value })}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 transition-all ${
              errors.birthDate
                ? 'border-red-400 focus:ring-red-400/20'
                : 'border-slate-300 focus:border-orange-500 focus:ring-orange-500/20'
            }`}
          />
          {errors.birthDate && <p className="text-xs text-red-600 mt-1">{errors.birthDate}</p>}
        </div>
      </div>

      {/* E-mail & WhatsApp */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
            E-mail para Confirmação <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail size={16} />
            </div>
            <input
              type="email"
              required
              placeholder="seuemail@exemplo.com"
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value.toLowerCase() })}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.email
                  ? 'border-red-400 focus:ring-red-400/20'
                  : 'border-slate-300 focus:border-orange-500 focus:ring-orange-500/20'
              }`}
            />
          </div>
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
            WhatsApp com DDD <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Phone size={16} />
            </div>
            <input
              type="tel"
              required
              placeholder="(84) 98888-0000"
              maxLength={15}
              value={data.phone}
              onChange={(e) => onChange({ phone: maskPhone(e.target.value) })}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.phone
                  ? 'border-red-400 focus:ring-red-400/20'
                  : 'border-slate-300 focus:border-orange-500 focus:ring-orange-500/20'
              }`}
            />
          </div>
          {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
        </div>
      </div>

      {/* =======================================================================
          SEÇÃO DE ENDEREÇO RESIDENCIAL (MELHORES PRÁTICAS BRASILEIRAS)
          ======================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-4">
        {/* Cabeçalho da Seção */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
              <MapPin size={17} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Endereço Residencial do Atleta
              </h4>
              <p className="text-[11px] text-slate-500">
                Necessário para emissão do seguro esportivo e conferência cadastral
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFillLajesPintadas}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-orange-800 bg-orange-100 hover:bg-orange-200 border border-orange-300 transition-all shadow-sm active:scale-95"
              title="Preencher automaticamente dados de Lajes Pintadas/RN"
            >
              <Navigation size={13} className="text-orange-600 shrink-0" />
              <span>Sou de Lajes Pintadas/RN</span>
            </button>
          </div>
        </div>

        {/* Linha 1: CEP com Busca Automática e Link dos Correios */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
          <div className="sm:col-span-5">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                CEP <span className="text-red-500">*</span>
              </label>
              <a
                href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-orange-600 hover:text-orange-700 hover:underline inline-flex items-center gap-1 font-medium"
              >
                <span>Não sei meu CEP</span>
                <ExternalLink size={10} />
              </a>
            </div>

            <div className="relative">
              <input
                type="text"
                required
                placeholder="00000-000"
                maxLength={9}
                value={data.cep || ''}
                onChange={handleCepChange}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.cep
                    ? 'border-red-400 focus:ring-red-400/20'
                    : 'border-slate-300 focus:border-orange-500 focus:ring-orange-500/20'
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {isSearchingCep ? (
                  <Loader2 size={16} className="animate-spin text-orange-600" />
                ) : cepFound ? (
                  <CheckCircle2 size={16} className="text-emerald-600" />
                ) : (
                  <Search size={15} className="text-slate-400" />
                )}
              </div>
            </div>

            {errors.cep && <p className="text-xs text-red-600 mt-1">{errors.cep}</p>}
            {cepFound && !errors.cep && (
              <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 size={12} className="inline" /> Endereço localizado via CEP
              </p>
            )}
            {cepError && (
              <p className="text-[11px] text-amber-700 font-medium mt-1">
                {cepError}
              </p>
            )}
          </div>

          <div className="sm:col-span-7">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Logradouro (Rua, Av., Travessa, Comunidade) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Home size={15} />
              </div>
              <input
                type="text"
                required
                placeholder="Ex: Rua São Sebastião, Av. Central, Sítio..."
                value={data.street || ''}
                onChange={(e) => onChange({ street: e.target.value })}
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.street
                    ? 'border-red-400 focus:ring-red-400/20'
                    : 'border-slate-300 focus:border-orange-500 focus:ring-orange-500/20'
                }`}
              />
            </div>
            {errors.street && <p className="text-xs text-red-600 mt-1">{errors.street}</p>}
          </div>
        </div>

        {/* Linha 2: Número, Checkbox Sem Número e Complemento */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
          <div className="sm:col-span-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Número <span className="text-red-500">*</span>
              </label>
              <label className="inline-flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer font-medium select-none">
                <input
                  type="checkbox"
                  checked={isNoNumber}
                  onChange={(e) => handleToggleNoNumber(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 h-3.5 w-3.5"
                />
                <span>Sem Nº (S/N)</span>
              </label>
            </div>

            <input
              ref={numberInputRef}
              type="text"
              required={!isNoNumber}
              disabled={isNoNumber}
              placeholder={isNoNumber ? 'S/N' : 'Ex: 120'}
              value={data.number || ''}
              onChange={(e) => onChange({ number: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 transition-all ${
                isNoNumber
                  ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed font-medium'
                  : errors.number
                  ? 'bg-white border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/20'
                  : 'bg-white border-slate-300 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
              }`}
            />
            {errors.number && <p className="text-xs text-red-600 mt-1">{errors.number}</p>}
          </div>

          <div className="sm:col-span-8">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Complemento <span className="text-slate-400 font-normal">(Opcional)</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Apto 102, Bloco B, Casa, Próximo ao posto..."
              value={data.complement || ''}
              onChange={(e) => onChange({ complement: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
          </div>
        </div>

        {/* Linha 3: Bairro, Cidade e UF */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
          <div className="sm:col-span-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Bairro / Comunidade <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Centro, Cohab, Zona Rural..."
              value={data.neighborhood || ''}
              onChange={(e) => onChange({ neighborhood: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.neighborhood
                  ? 'border-red-400 focus:ring-red-400/20'
                  : 'border-slate-300 focus:border-orange-500 focus:ring-orange-500/20'
              }`}
            />
            {errors.neighborhood && <p className="text-xs text-red-600 mt-1">{errors.neighborhood}</p>}
          </div>

          <div className="sm:col-span-5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Cidade de Residência <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Lajes Pintadas, Natal, Santa Cruz..."
              value={data.city || ''}
              onChange={(e) => onChange({ city: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.city
                  ? 'border-red-400 focus:ring-red-400/20'
                  : 'border-slate-300 focus:border-orange-500 focus:ring-orange-500/20'
              }`}
            />
            {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Estado (UF) <span className="text-red-500">*</span>
            </label>
            <select
              value={data.state || 'RN'}
              onChange={(e) => onChange({ state: e.target.value })}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 transition-all font-medium ${
                errors.state
                  ? 'border-red-400 focus:ring-red-400/20'
                  : 'border-slate-300 focus:border-orange-500 focus:ring-orange-500/20'
              }`}
            >
              <optgroup label="Mais Frequentes">
                <option value="RN">RN - Rio Grande do Norte</option>
                <option value="PB">PB - Paraíba</option>
                <option value="CE">CE - Ceará</option>
                <option value="PE">PE - Pernambuco</option>
              </optgroup>
              <optgroup label="Todos os Estados">
                {BRAZILIAN_UFS.map((item) => (
                  <option key={item.uf} value={item.uf}>
                    {item.name}
                  </option>
                ))}
              </optgroup>
            </select>
            {errors.state && <p className="text-xs text-red-600 mt-1">{errors.state}</p>}
          </div>
        </div>
      </div>

      {/* Equipe ou Assessoria Esportiva (Opcional) */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
          Equipe / Assessoria Esportiva <span className="text-slate-400 font-normal">(Opcional)</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Users size={16} />
          </div>
          <input
            type="text"
            placeholder="Ex: Os Trairi Runners, Equipe Santa Cruz..."
            value={data.team || ''}
            onChange={(e) => onChange({ team: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
          />
        </div>
      </div>

      {/* Botão de Avanço */}
      <div className="pt-2">
        <button
          type="submit"
          className="w-full py-3.5 px-6 rounded-xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-600/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <span>Avançar para Categoria e Camisa</span>
        </button>
      </div>
    </form>
  );
};
