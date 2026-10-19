import React from 'react';
import { User, Mail, Phone, MapPin, Calendar, Users, AlertCircle } from 'lucide-react';
import { isValidCPF, formatCPF } from '../../lib/cpf';
import { maskPhone, maskDate } from '../../lib/masks';

export interface Step1Data {
  fullName: string;
  cpf: string;
  birthDate: string; // YYYY-MM-DD
  email: string;
  phone: string;
  city: string;
  state: string;
  team: string;
}

interface Step1AthleteDataProps {
  data: Step1Data;
  onChange: (fields: Partial<Step1Data>) => void;
  onNext: () => void;
}

export const Step1AthleteData: React.FC<Step1AthleteDataProps> = ({
  data,
  onChange,
  onNext,
}) => {
  const [errors, setErrors] = React.useState<Record<string, string>>({});

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

    if (!data.city.trim()) {
      newErrors.city = 'Cidade de residência é obrigatória.';
    }

    if (!data.state.trim() || data.state.trim().length !== 2) {
      newErrors.state = 'UF (2 letras).';
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
          <div className="relative">
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
          </div>
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

      {/* Cidade e UF de Residência */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        <div className="sm:col-span-8">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
            Cidade de Residência Atual <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MapPin size={16} />
            </div>
            <input
              type="text"
              required
              placeholder="Ex: Lajes Pintadas, Natal, Santa Cruz..."
              value={data.city}
              onChange={(e) => onChange({ city: e.target.value })}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.city
                  ? 'border-red-400 focus:ring-red-400/20'
                  : 'border-slate-300 focus:border-orange-500 focus:ring-orange-500/20'
              }`}
            />
          </div>
          {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
        </div>

        <div className="sm:col-span-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
            UF <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={2}
            placeholder="RN"
            value={data.state}
            onChange={(e) => onChange({ state: e.target.value.toUpperCase() })}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 text-center uppercase placeholder-slate-400 bg-white focus:outline-none focus:ring-2 transition-all ${
              errors.state
                ? 'border-red-400 focus:ring-red-400/20'
                : 'border-slate-300 focus:border-orange-500 focus:ring-orange-500/20'
            }`}
          />
          {errors.state && <p className="text-xs text-red-600 mt-1">{errors.state}</p>}
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
            value={data.team}
            onChange={(e) => onChange({ team: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
          />
        </div>
      </div>

      {/* Botão de Avanço */}
      <div className="pt-4">
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
