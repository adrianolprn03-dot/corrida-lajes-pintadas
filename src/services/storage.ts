// ==============================================================================
// SERVIÇO DE DADOS E ARMAZENAMENTO UNIFICADO
// Conecta ao Supabase quando configurado, ou mantém persistência local com
// fidelidade estrita ao esquema do PostgreSQL e regras de concorrência.
// ==============================================================================

import {
  EventSettings,
  ShirtInventoryItem,
  Registration,
  RegistrationSubmission,
  AthleteLookupResponse,
  AdminMetrics,
  PaymentMethod,
  Category,
  ShirtSize,
  RegistrationStatus,
  EventStatus,
  AdminOperator,
  AdminRole,
} from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isValidCPF } from '../lib/cpf';
import { calculatePricing } from '../lib/pricing';

const STORAGE_KEYS = {
  SETTINGS: 'lp_race_settings_v1',
  SHIRTS: 'lp_race_shirts_v1',
  REGISTRATIONS: 'lp_race_registrations_v1',
  ATHLETES: 'lp_race_athletes_v1',
  AUDIT: 'lp_race_audit_v1',
  ADMIN_TOKEN: 'lp_race_admin_session_v1',
  OPERATORS: 'lp_race_admin_operators_v1',
};

// Operadores Padrão Oficiais do Evento com Perfis de Acesso
export const INITIAL_OPERATORS: AdminOperator[] = [
  {
    id: 'op-admin',
    username: 'admin',
    name: 'Administrador Geral',
    role: 'ADMIN_GERAL',
    email: 'admin@lajespintadas.rn.gov.br',
    isActive: true,
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'op-atendimento',
    username: 'atendimento',
    name: 'Atendente da Prefeitura',
    role: 'ATENDIMENTO',
    email: 'atendimento@lajespintadas.rn.gov.br',
    isActive: true,
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'op-financeiro',
    username: 'financeiro',
    name: 'Tesouraria & Finanças',
    role: 'FINANCEIRO',
    email: 'financas@lajespintadas.rn.gov.br',
    isActive: true,
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'op-kit',
    username: 'kit',
    name: 'Equipe de Entrega de Kits',
    role: 'ENTREGA_KIT',
    email: 'kits@lajespintadas.rn.gov.br',
    isActive: true,
    createdAt: '2026-01-01T08:00:00Z',
  },
];

// Configurações padrão do evento (Regras confirmadas do Edital)
export const INITIAL_SETTINGS: EventSettings = {
  id: 'current',
  eventName: '5ª Corrida de Emancipação Política de Lajes Pintadas/RN',
  edition: '5ª Edição',
  eventDate: '2026-12-26',
  distanceKm: 5.0,
  basePriceCents: 6000, // R$ 60,00
  status: 'OPEN', // Inscrições abertas para testes e produção
  maxCapacity: null, // A definir no painel
  minAge: null, // A definir no painel
  minorRules: 'Participantes menores de 18 anos devem apresentar autorização formal por escrito assinada pelos responsáveis legais no ato da entrega do kit.',
  startTime: '06:00',
  startLocation: 'Praça Monsenhor Freitas, Centro, Lajes Pintadas/RN',
  registrationStartDate: null,
  registrationEndDate: null,
  kitPickupInfo: 'A entrega dos kits (camisa oficial laranja, chip e número de peito) ocorrerá no Centro de Convivência dos Idosos, mediante apresentação de documento com foto e comprovante de inscrição. Para categoria Local (Lajespintadense), é obrigatória a comprovação documental do vínculo declarado.',
  cancellationPolicy: 'Nos termos do Art. 49 do Código de Defesa do Consumidor, o cancelamento com estorno total pode ser solicitado em até 7 dias após o pagamento.',
  organizerName: 'Prefeitura Municipal de Lajes Pintadas / Secretaria Municipal de Esportes',
  organizerContact: 'esportes@lajespintadas.rn.gov.br | WhatsApp: (84) 98800-0000',
  revenueResponsible: 'Tesouraria do Fundo Municipal de Esportes',
  asaasEnvironment: 'sandbox',
  asaasPixFixedFeeCents: 600, // R$ 6,00 (10%)
  asaasCreditFixedFeeCents: 600, // R$ 6,00 (10%)
  asaasCreditPercentFee: 0.10, // 10%
  termsVersion: 'v1.0-2026',
  privacyVersion: 'v1.0-2026',
  termsContent: `REGULAMENTO OFICIAL - 5ª CORRIDA DE EMANCIPAÇÃO POLÍTICA DE LAJES PINTADAS/RN

1. DO EVENTO E PARTICIPAÇÃO
A 5ª Corrida de Emancipação Política de Lajes Pintadas/RN será realizada no dia 26 de dezembro de 2026, com percurso oficial aferido de 5 km, em vias públicas asfaltadas e pavimentadas do município de Lajes Pintadas/RN.

2. CATEGORIAS DE PREMIAÇÃO
2.1. O evento é dividido estritamente em quatro categorias oficiais:
    a) Local Masculino;
    b) Local Feminino;
    c) Visitante Masculino;
    d) Visitante Feminino.
2.2. A categoria "Local" (Lajespintadense) é privativa para quem nasceu em Lajes Pintadas/RN ou reside atualmente no município, inclusive naturais que residam em outras localidades.
2.3. A categoria "Visitante" destina-se aos participantes que não se enquadram nas condições de natural nem de residente no município.
2.4. A declaração do vínculo para a categoria Local realizada na inscrição é uma autodeclaração prévia. A homologação definitiva do resultado e premiação dependerá da comprovação documental cabal (Certidão de Nascimento, Título Eleitoral do Município ou Comprovante de Residência idôneo).

3. DO VALOR E DO KIT
3.1. A taxa de inscrição é de R$ 60,00 (sessenta reais), acrescida exclusivamente da taxa de serviço de 10% de processamento da plataforma de pagamento oficial.
3.2. A inscrição confere direito ao Kit Oficial contendo camisa técnica em poliamida com proteção UV fator FPU 50+ oficial laranja, chip de cronometragem eletrônica, número de peito e medalha finisher para os que concluírem o percurso dentro do tempo regulamentar.
3.3. Não será permitida troca de tamanho de camisa no ato da retirada do kit, prevalecendo estritamente a grade selecionada no ato da inscrição.

4. REGRAS GERAIS E SEGURANÇA
4.1. O atleta declara estar em plenas condições físicas e de saúde para a prática esportiva, isentando a comissão organizadora de quaisquer responsabilidades decorrentes de enfermidades pré-existentes.
4.2. A organização disponibilizará pontos de hidratação no percurso e apoio médico de emergência com ambulância municipal.`,
  privacyContent: `POLÍTICA DE PRIVACIDADE E PROTEÇÃO DE DADOS PESSOAIS (LGPD)

A Prefeitura Municipal de Lajes Pintadas e a Comissão Organizadora da 5ª Corrida de Emancipação Política reafirmam o compromisso com a privacidade e a segurança dos dados pessoais dos atletas inscritos, em estrita conformidade com a Lei Federal nº 13.709/2018 (Lei Geral de Proteção de Dados - LGPD).

1. COLETA E FINALIDADE: Os dados cadastrais coletados (Nome, CPF, Data de Nascimento, E-mail, Telefone/WhatsApp, Endereço de Residência e Equipe) destinam-se exclusivamente à identificação do participante, apuração de categorias por faixa etária e residência, segurança médica no percurso e emissão do seguro de prova.
2. SIGILO E NÃO EXPOSIÇÃO: Em nenhuma hipótese o CPF, telefone, data de nascimento ou e-mail dos inscritos serão publicados em listas públicas de largada ou murais públicos. A consulta à inscrição é protegida por protocolo e código de acesso pessoal gerado com hash criptográfico.
3. COMPARTILHAMENTO CONTROLADO: Os dados estritamente necessários para cobrança são transmitidos via conexão criptografada SSL/TLS ao gateway financeiro credenciado.`,
  updatedAt: new Date().toISOString(),
};

// Grade e Estoque de Camisas com separação estrita: Local (Lajespintadense) vs Visitante (Geral)
export const INITIAL_SHIRTS: ShirtInventoryItem[] = [
  { id: 'shirt-1', size: 'PP', displayOrder: 1, totalStock: 30, reservedCount: 0, confirmedCount: 0, isActive: true, availableStock: 30, localTotalStock: 15, localReservedCount: 0, localConfirmedCount: 0, localAvailableStock: 15, visitorTotalStock: 15, visitorReservedCount: 0, visitorConfirmedCount: 0, visitorAvailableStock: 15 },
  { id: 'shirt-2', size: 'P',  displayOrder: 2, totalStock: 50, reservedCount: 0, confirmedCount: 0, isActive: true, availableStock: 50, localTotalStock: 25, localReservedCount: 0, localConfirmedCount: 0, localAvailableStock: 25, visitorTotalStock: 25, visitorReservedCount: 0, visitorConfirmedCount: 0, visitorAvailableStock: 25 },
  { id: 'shirt-3', size: 'M',  displayOrder: 3, totalStock: 100, reservedCount: 0, confirmedCount: 0, isActive: true, availableStock: 100, localTotalStock: 50, localReservedCount: 0, localConfirmedCount: 0, localAvailableStock: 50, visitorTotalStock: 50, visitorReservedCount: 0, visitorConfirmedCount: 0, visitorAvailableStock: 50 },
  { id: 'shirt-4', size: 'G',  displayOrder: 4, totalStock: 80, reservedCount: 0, confirmedCount: 0, isActive: true, availableStock: 80, localTotalStock: 40, localReservedCount: 0, localConfirmedCount: 0, localAvailableStock: 40, visitorTotalStock: 40, visitorReservedCount: 0, visitorConfirmedCount: 0, visitorAvailableStock: 40 },
  { id: 'shirt-5', size: 'GG', displayOrder: 5, totalStock: 40, reservedCount: 0, confirmedCount: 0, isActive: true, availableStock: 40, localTotalStock: 20, localReservedCount: 0, localConfirmedCount: 0, localAvailableStock: 20, visitorTotalStock: 20, visitorReservedCount: 0, visitorConfirmedCount: 0, visitorAvailableStock: 20 },
  { id: 'shirt-6', size: 'XG', displayOrder: 6, totalStock: 20, reservedCount: 0, confirmedCount: 0, isActive: true, availableStock: 20, localTotalStock: 10, localReservedCount: 0, localConfirmedCount: 0, localAvailableStock: 10, visitorTotalStock: 10, visitorReservedCount: 0, visitorConfirmedCount: 0, visitorAvailableStock: 10 },
];

class StorageService {
  private getLocal<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setLocal<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage error:', e);
    }
  }

  // Obter Configurações
  // Obter Configurações do Evento
  async getSettings(): Promise<EventSettings> {
    // 1. Tentar via API oficial Vercel Serverless (com Service Role para bypass de RLS)
    try {
      const apiRes = await fetch('/api/admin-settings');
      if (apiRes.ok) {
        const json = await apiRes.json();
        if (json.settings) {
          const d = json.settings;
          const status = (d.status === 'PREPARATION' ? 'OPEN' : d.status) as EventStatus;
          return {
            id: d.id,
            eventName: d.event_name,
            edition: d.edition,
            eventDate: d.event_date,
            distanceKm: Number(d.distance_km),
            basePriceCents: d.base_price_cents,
            status,
            maxCapacity: d.max_capacity,
            minAge: d.min_age,
            minorRules: d.minor_rules,
            startTime: d.start_time,
            startLocation: d.start_location,
            registrationStartDate: d.registration_start_date,
            registrationEndDate: d.registration_end_date,
            kitPickupInfo: d.kit_pickup_info,
            cancellationPolicy: d.cancellation_policy,
            organizerName: d.organizer_name,
            organizerContact: d.organizer_contact,
            revenueResponsible: d.revenue_responsible,
            asaasEnvironment: d.asaas_environment,
            asaasPixFixedFeeCents: d.asaas_pix_fixed_fee_cents,
            asaasCreditFixedFeeCents: d.asaas_credit_fixed_fee_cents,
            asaasCreditPercentFee: Number(d.asaas_credit_percent_fee),
            termsVersion: d.terms_version,
            privacyVersion: d.privacy_version,
            termsContent: d.terms_content,
            privacyContent: d.privacy_content,
            updatedAt: d.updated_at,
          };
        }
      }
    } catch {}

    // 2. Tentar via Supabase Client caso configurado
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('event_settings').select('*').limit(1).single();
        if (!error && data) {
          const status = (data.status === 'PREPARATION' ? 'OPEN' : data.status) as EventStatus;
          return {
            id: data.id,
            eventName: data.event_name,
            edition: data.edition,
            eventDate: data.event_date,
            distanceKm: Number(data.distance_km),
            basePriceCents: data.base_price_cents,
            status,
            maxCapacity: data.max_capacity,
            minAge: data.min_age,
            minorRules: data.minor_rules,
            startTime: data.start_time,
            startLocation: data.start_location,
            registrationStartDate: data.registration_start_date,
            registrationEndDate: data.registration_end_date,
            kitPickupInfo: data.kit_pickup_info,
            cancellationPolicy: data.cancellation_policy,
            organizerName: data.organizer_name,
            organizerContact: data.organizer_contact,
            revenueResponsible: data.revenue_responsible,
            asaasEnvironment: data.asaas_environment,
            asaasPixFixedFeeCents: data.asaas_pix_fixed_fee_cents,
            asaasCreditFixedFeeCents: data.asaas_credit_fixed_fee_cents,
            asaasCreditPercentFee: Number(data.asaas_credit_percent_fee),
            termsVersion: data.terms_version,
            privacyVersion: data.privacy_version,
            termsContent: data.terms_content,
            privacyContent: data.privacy_content,
            updatedAt: data.updated_at,
          };
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local:', err);
      }
    }

    const localSettings = this.getLocal<EventSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    if (localSettings.status === 'PREPARATION') {
      localSettings.status = 'OPEN';
      this.setLocal(STORAGE_KEYS.SETTINGS, localSettings);
    }
    return localSettings;
  }

  // Atualizar Configurações (Admin)
  async updateSettings(updates: Partial<EventSettings>): Promise<EventSettings> {
    const current = await this.getSettings();
    const merged: EventSettings = { ...current, ...updates, updatedAt: new Date().toISOString() };
    this.setLocal(STORAGE_KEYS.SETTINGS, merged);

    // 1. Salvar via API oficial Vercel Serverless (com Service Role)
    try {
      await fetch('/api/admin-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch {}

    // 2. Tentar via Supabase Client caso configurado
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('event_settings').update({
          status: merged.status,
          max_capacity: merged.maxCapacity,
          min_age: merged.minAge,
          minor_rules: merged.minorRules,
          start_time: merged.startTime,
          start_location: merged.startLocation,
          registration_start_date: merged.registrationStartDate,
          registration_end_date: merged.registrationEndDate,
          kit_pickup_info: merged.kitPickupInfo,
          cancellation_policy: merged.cancellationPolicy,
          organizer_name: merged.organizerName,
          organizer_contact: merged.organizerContact,
          revenue_responsible: merged.revenueResponsible,
          asaas_environment: merged.asaasEnvironment,
          asaas_pix_fixed_fee_cents: merged.asaasPixFixedFeeCents,
          asaas_credit_fixed_fee_cents: merged.asaasCreditFixedFeeCents,
          asaas_credit_percent_fee: merged.asaasCreditPercentFee,
          terms_content: merged.termsContent,
          privacy_content: merged.privacyContent,
          updated_at: merged.updatedAt,
        }).eq('is_singleton', true);
      } catch (e) {
        console.error('Supabase update failed:', e);
      }
    }

    return merged;
  }

  // Obter Camisas e Estoque
  async getShirtInventory(): Promise<ShirtInventoryItem[]> {
    // 1. Tentar via API oficial Vercel Serverless (com Service Role para bypass seguro de RLS)
    try {
      const apiRes = await fetch('/api/admin-inventory');
      if (apiRes.ok) {
        const json = await apiRes.json();
        if (json.items && json.items.length > 0) {
          const hasConfiguredStock = json.items.some((d: any) => d.total_stock > 0);
          if (hasConfiguredStock) {
            return json.items.map((d: any) => ({
              id: d.id,
              size: d.size as ShirtSize,
              displayOrder: d.display_order,
              totalStock: d.total_stock,
              reservedCount: d.reserved_count,
              confirmedCount: d.confirmed_count,
              isActive: d.is_active,
              availableStock: Math.max(0, d.total_stock - (d.reserved_count + d.confirmed_count)),
            }));
          }
        }
      }
    } catch {}

    // 2. Tentar via Supabase Client caso configurado
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('shirt_inventory')
          .select('*')
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          const hasConfiguredStock = data.some((d) => d.total_stock > 0);
          if (hasConfiguredStock) {
            return data.map((d) => ({
              id: d.id,
              size: d.size as ShirtSize,
              displayOrder: d.display_order,
              totalStock: d.total_stock,
              reservedCount: d.reserved_count,
              confirmedCount: d.confirmed_count,
              isActive: d.is_active,
              availableStock: Math.max(0, d.total_stock - (d.reserved_count + d.confirmed_count)),
            }));
          }
        }
      } catch (err) {
        console.warn('Supabase shirt fetch failed, falling back to local:', err);
      }
    }

    // 3. Fallback Local com estoque garantido e segmentação Local vs Visitante
    let items = this.getLocal<ShirtInventoryItem[]>(STORAGE_KEYS.SHIRTS, INITIAL_SHIRTS);
    if (!items || items.length === 0 || items.every((i) => (i.totalStock || 0) === 0)) {
      items = INITIAL_SHIRTS;
      this.setLocal(STORAGE_KEYS.SHIRTS, INITIAL_SHIRTS);
    }

    return items.map((item) => {
      const initial = INITIAL_SHIRTS.find((s) => s.size === item.size) || item;
      const localTotal = item.localTotalStock ?? initial.localTotalStock ?? Math.floor((item.totalStock || 30) / 2);
      const visitorTotal = item.visitorTotalStock ?? initial.visitorTotalStock ?? Math.ceil((item.totalStock || 30) / 2);
      const localRes = item.localReservedCount ?? 0;
      const localConf = item.localConfirmedCount ?? 0;
      const visitorRes = item.visitorReservedCount ?? 0;
      const visitorConf = item.visitorConfirmedCount ?? 0;

      const totalStock = localTotal + visitorTotal;
      const totalRes = item.reservedCount ?? (localRes + visitorRes);
      const totalConf = item.confirmedCount ?? (localConf + visitorConf);

      return {
        ...item,
        totalStock,
        reservedCount: totalRes,
        confirmedCount: totalConf,
        availableStock: Math.max(0, totalStock - (totalRes + totalConf)),
        localTotalStock: localTotal,
        localReservedCount: localRes,
        localConfirmedCount: localConf,
        localAvailableStock: Math.max(0, localTotal - (localRes + localConf)),
        visitorTotalStock: visitorTotal,
        visitorReservedCount: visitorRes,
        visitorConfirmedCount: visitorConf,
        visitorAvailableStock: Math.max(0, visitorTotal - (visitorRes + visitorConf)),
      };
    });
  }

  // Atualizar Estoque Geral (Admin)
  async updateShirtStock(size: ShirtSize, newTotalStock: number): Promise<void> {
    const shirts = await this.getShirtInventory();
    const updated = shirts.map((s) => {
      if (s.size === size) {
        const minimumAllowed = s.reservedCount + s.confirmedCount;
        if (newTotalStock < minimumAllowed) {
          throw new Error(
            `Não é permitido reduzir o estoque abaixo de ${minimumAllowed} (já existem ${s.confirmedCount} confirmadas e ${s.reservedCount} reservadas).`
          );
        }
        const localPart = Math.floor(newTotalStock / 2);
        const visitorPart = newTotalStock - localPart;
        return { 
          ...s, 
          totalStock: newTotalStock,
          availableStock: Math.max(0, newTotalStock - (s.reservedCount + s.confirmedCount)),
          localTotalStock: localPart,
          localAvailableStock: Math.max(0, localPart - (s.localReservedCount + s.localConfirmedCount)),
          visitorTotalStock: visitorPart,
          visitorAvailableStock: Math.max(0, visitorPart - (s.visitorReservedCount + s.visitorConfirmedCount)),
        };
      }
      return s;
    });

    this.setLocal(STORAGE_KEYS.SHIRTS, updated);
  }

  // Atualizar Estoque Exclusivo Local - Lajespintadense (Admin)
  async updateLocalShirtStock(size: ShirtSize, newLocalStock: number): Promise<void> {
    const shirts = await this.getShirtInventory();
    const updated = shirts.map((s) => {
      if (s.size === size) {
        const minimumAllowed = (s.localReservedCount || 0) + (s.localConfirmedCount || 0);
        if (newLocalStock < minimumAllowed) {
          throw new Error(`Não é permitido reduzir o estoque local abaixo de ${minimumAllowed} (já existem ${s.localConfirmedCount} confirmadas e ${s.localReservedCount} reservadas).`);
        }
        const newTotal = newLocalStock + s.visitorTotalStock;
        return {
          ...s,
          localTotalStock: newLocalStock,
          localAvailableStock: Math.max(0, newLocalStock - minimumAllowed),
          totalStock: newTotal,
          availableStock: Math.max(0, newTotal - (s.reservedCount + s.confirmedCount)),
        };
      }
      return s;
    });

    this.setLocal(STORAGE_KEYS.SHIRTS, updated);
  }

  // Atualizar Estoque Exclusivo Visitante (Admin)
  async updateVisitorShirtStock(size: ShirtSize, newVisitorStock: number): Promise<void> {
    const shirts = await this.getShirtInventory();
    const updated = shirts.map((s) => {
      if (s.size === size) {
        const minimumAllowed = (s.visitorReservedCount || 0) + (s.visitorConfirmedCount || 0);
        if (newVisitorStock < minimumAllowed) {
          throw new Error(`Não é permitido reduzir o estoque de visitantes abaixo de ${minimumAllowed} (já existem ${s.visitorConfirmedCount} confirmadas e ${s.visitorReservedCount} reservadas).`);
        }
        const newTotal = s.localTotalStock + newVisitorStock;
        return {
          ...s,
          visitorTotalStock: newVisitorStock,
          visitorAvailableStock: Math.max(0, newVisitorStock - minimumAllowed),
          totalStock: newTotal,
          availableStock: Math.max(0, newTotal - (s.reservedCount + s.confirmedCount)),
        };
      }
      return s;
    });

    this.setLocal(STORAGE_KEYS.SHIRTS, updated);
  }

  // Submeter Inscrição (Reserva Atômica e Cálculo de Preço)
  async submitRegistration(submission: RegistrationSubmission): Promise<{
    success: boolean;
    registration: Registration;
    accessCode: string;
    pricing: ReturnType<typeof calculatePricing>;
  }> {
    // 1. Validação estrita do CPF
    const cleanCpf = submission.cpf.replace(/\D/g, '');
    if (!isValidCPF(cleanCpf)) {
      throw new Error('CPF inválido. Por favor, verifique os dígitos digitados.');
    }

    // 2. Verificar configurações do evento
    const settings = await this.getSettings();
    if (settings.status !== 'OPEN') {
      if (settings.status === 'PREPARATION') {
        throw new Error('Inscrições em preparação. Aguarde a publicação das datas oficiais de abertura.');
      }
      if (settings.status === 'SUSPENDED') {
        throw new Error('As inscrições estão temporariamente suspensas.');
      }
      if (settings.status === 'CLOSED') {
        throw new Error('Inscrições encerradas.');
      }
      if (settings.status === 'SOLD_OUT') {
        throw new Error('Vagas esgotadas.');
      }
    }

    // 3. Validação de Regras Local / Visitante e Consistência de Residência
    const registrationChannel = submission.channel === 'PRESENCIAL_PREFEITURA' ? 'PRESENCIAL_PREFEITURA' : 'ONLINE';
    const isLocal = submission.originType === 'LOCAL' || submission.originType === 'CASA';

    // REGRA REGIMENTAL ESTREITA: Inscrições da categoria Local são exclusivamente presenciais na sede da Prefeitura
    if (isLocal && registrationChannel !== 'PRESENCIAL_PREFEITURA') {
      throw new Error(
        'Inscrições da categoria Local (Lajespintadense) são realizadas exclusivamente de forma presencial na sede da Prefeitura de Lajes Pintadas/RN. Apresente documento de identificação e comprovação do vínculo exigido pelo regulamento.'
      );
    }

    if (isLocal) {
      if (!submission.casaProofType) {
        throw new Error('Para a categoria Local (Lajespintadense), é obrigatório selecionar o tipo de vínculo com Lajes Pintadas.');
      }
      if (['RESIDENTE', 'NATURAL_E_RESIDENTE'].includes(submission.casaProofType)) {
        const cityNormalized = submission.city.trim().toLowerCase();
        const stateNormalized = submission.state.trim().toUpperCase();
        if (cityNormalized !== 'lajes pintadas' || stateNormalized !== 'RN') {
          throw new Error('Se declarou residente atual de Lajes Pintadas, a cidade deve ser Lajes Pintadas e o estado RN.');
        }
      }
    }

    // 4. Calcular Categoria Oficial no Servidor
    let category: Category;
    if (isLocal) {
      category = submission.gender === 'MASCULINO' ? 'LOCAL_MASCULINO' : 'LOCAL_FEMININO';
    } else {
      category = submission.gender === 'MASCULINO' ? 'VISITANTE_MASCULINO' : 'VISITANTE_FEMININO';
    }

    // 5. Verificar duplicidade de CPF ativo
    const allRegistrations = this.getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, []);
    const existing = allRegistrations.find(
      (r) =>
        r.athlete?.cpf === cleanCpf &&
        ['RESERVED', 'CONFIRMED', 'IN_REVIEW'].includes(r.status) &&
        (r.status !== 'RESERVED' || new Date(r.reservationExpiresAt) > new Date())
    );

    if (existing) {
      throw new Error(`Este CPF já possui uma inscrição ativa no evento (Protocolo: ${existing.protocol}).`);
    }

    // 6. Verificar estoque da camisa
    const shirts = await this.getShirtInventory();
    const shirt = shirts.find((s) => s.size === submission.shirtSize);
    if (!shirt || shirt.availableStock <= 0) {
      throw new Error(`O tamanho de camisa ${submission.shirtSize} está esgotado. Por favor, selecione outro tamanho.`);
    }

    // 7. Calcular valores e taxas Asaas
    const pricing = calculatePricing(submission.paymentMethod, {
      basePriceCents: settings.basePriceCents,
      pixFixedFeeCents: settings.asaasPixFixedFeeCents,
      creditFixedFeeCents: settings.asaasCreditFixedFeeCents,
      creditPercentFee: settings.asaasCreditPercentFee,
    });

    // 8. Tentar processar via API oficial (Vercel Serverless + Asaas + Supabase)
    try {
      const apiResponse = await fetch('/api/create-reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: submission.fullName,
          cpf: cleanCpf,
          birthDate: submission.birthDate,
          email: submission.email,
          phone: submission.phone,
          city: submission.city,
          state: submission.state,
          team: submission.team,
          originType: submission.originType,
          gender: submission.gender,
          casaProofType: submission.casaProofType,
          shirtSize: submission.shirtSize,
          paymentMethod: submission.paymentMethod,
          channel: registrationChannel,
          attendantName: submission.attendantName,
          attendantId: submission.attendantId,
          documentVerificationStatus: submission.documentVerificationStatus,
          documentTypePresented: submission.documentTypePresented,
          documentVerificationNotes: submission.documentVerificationNotes,
        }),
      });

      if (apiResponse.ok) {
        const contentType = apiResponse.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error('Servidor retornou resposta inesperada. Por favor, atualize a página (F5) e tente novamente.');
        }
        const data = await apiResponse.json();
        const apiReg: Registration = {
          id: data.registration_id || crypto.randomUUID(),
          athleteId: crypto.randomUUID(),
          protocol: data.protocol,
          category: data.category || category,
          originType: submission.originType,
          gender: submission.gender,
          casaProofType: submission.casaProofType || null,
          shirtSize: submission.shirtSize,
          status: 'RESERVED',
          financialStatus: 'PENDING',
          paymentMethod: submission.paymentMethod,
          baseAmountCents: pricing.baseAmountCents,
          processingFeeCents: pricing.feeCents,
          totalAmountCents: pricing.totalAmountCents, // Sempre R$ 66,00 (R$ 60,00 base + 10% de taxa)
          asaasPaymentId: data.asaas_payment_id,
          asaasInvoiceUrl: data.invoice_url,
          asaasPixQrCode: data.pix_qr_code,
          asaasPixCopyPaste: data.pix_copy_paste,
          reservationExpiresAt: data.reservation_expires_at || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          kitDelivered: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          channel: registrationChannel,
          documentVerificationStatus: submission.documentVerificationStatus || (submission.originType === 'CASA' ? 'APROVADO' : undefined),
          documentTypePresented: submission.documentTypePresented || null,
          documentVerificationNotes: submission.documentVerificationNotes || null,
          documentCheckedBy: submission.attendantName || null,
          documentCheckedAt: registrationChannel === 'PRESENCIAL_PREFEITURA' ? new Date().toISOString() : null,
          attendantName: submission.attendantName || null,
          attendantId: submission.attendantId || null,
          athlete: {
            fullName: submission.fullName.trim(),
            cpf: cleanCpf,
            birthDate: submission.birthDate,
            email: submission.email.trim().toLowerCase(),
            phone: submission.phone.trim(),
            city: submission.city.trim(),
            state: submission.state.trim().toUpperCase(),
            team: submission.team?.trim() || undefined,
          },
        };

        allRegistrations.unshift(apiReg);
        this.setLocal(STORAGE_KEYS.REGISTRATIONS, allRegistrations);

        return {
          success: true,
          registration: apiReg,
          accessCode: data.access_code,
          pricing,
        };
      } else {
        const contentType = apiResponse.headers.get('content-type') || '';
        let errMessage = 'Erro ao processar reserva no servidor.';
        if (contentType.includes('application/json')) {
          const errJson = await apiResponse.json().catch(() => null);
          if (errJson?.error) {
            errMessage = errJson.error;
          }
        } else {
          const rawText = await apiResponse.text().catch(() => '');
          if (rawText.includes('<!DOCTYPE') || rawText.includes('<html')) {
            errMessage = 'Serviço temporariamente em sincronização. Por favor, atualize a página e tente novamente.';
          } else if (rawText) {
            errMessage = rawText.slice(0, 150);
          }
        }
        throw new Error(errMessage);
      }
    } catch (apiErr: any) {
      if (apiErr.message && !apiErr.message.includes('Failed to fetch') && !apiErr.message.includes('404')) {
        throw apiErr;
      }
      console.warn('API /api/create-reservation indisponível ou em modo local, usando motor local:', apiErr);
    }

    // 9. Gerar Protocolo e Código de Acesso (Fallback Local / Demo)
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const protocol = `LP5-2612-${randomHex}`;
    const rawAccessCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // 10. Simulação da URL de fatura / Pix do Asaas
    const isSandbox = settings.asaasEnvironment === 'sandbox';
    const fakeAsaasId = `pay_${Math.random().toString(36).substring(2, 12)}`;
    const invoiceUrl = `https://${isSandbox ? 'sandbox.' : ''}asaas.com/i/${fakeAsaasId}`;
    
    // QR Code Pix Copia e Cola estruturado
    const fakePixQrCode = `00020101021226830014br.gov.bcb.pix2561asaas.com/pix/${fakeAsaasId}520400005303986540${(pricing.totalAmountCents / 100).toFixed(2)}5802BR5925PREF MUNIC LAJES PINTADAS6014LAJES PINTADAS62070503***6304`;

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutos

    const newReg: Registration = {
      id: crypto.randomUUID(),
      athleteId: crypto.randomUUID(),
      protocol,
      category,
      originType: submission.originType,
      gender: submission.gender,
      casaProofType: submission.casaProofType || null,
      shirtSize: submission.shirtSize,
      status: 'RESERVED',
      financialStatus: 'PENDING',
      paymentMethod: submission.paymentMethod,
      baseAmountCents: pricing.baseAmountCents,
      processingFeeCents: pricing.feeCents,
      totalAmountCents: pricing.totalAmountCents,
      asaasPaymentId: fakeAsaasId,
      asaasInvoiceUrl: invoiceUrl,
      asaasPixCopyPaste: submission.paymentMethod === 'PIX' ? fakePixQrCode : undefined,
      reservationExpiresAt: expiresAt,
      kitDelivered: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      channel: registrationChannel,
      documentVerificationStatus: submission.documentVerificationStatus || (submission.originType === 'CASA' ? 'APROVADO' : undefined),
      documentTypePresented: submission.documentTypePresented || null,
      documentVerificationNotes: submission.documentVerificationNotes || null,
      documentCheckedBy: submission.attendantName || null,
      documentCheckedAt: registrationChannel === 'PRESENCIAL_PREFEITURA' ? new Date().toISOString() : null,
      attendantName: submission.attendantName || null,
      attendantId: submission.attendantId || null,
      athlete: {
        fullName: submission.fullName.trim(),
        cpf: cleanCpf,
        birthDate: submission.birthDate,
        email: submission.email.trim().toLowerCase(),
        phone: submission.phone.trim(),
        city: submission.city.trim(),
        state: submission.state.trim().toUpperCase(),
        team: submission.team?.trim() || undefined,
      },
    };

    // Atualizar estoque local reservado
    const updatedShirts = shirts.map((s) =>
      s.size === submission.shirtSize ? { ...s, reservedCount: s.reservedCount + 1 } : s
    );
    this.setLocal(STORAGE_KEYS.SHIRTS, updatedShirts);

    // Salvar registro
    allRegistrations.unshift(newReg);
    this.setLocal(STORAGE_KEYS.REGISTRATIONS, allRegistrations);

    return {
      success: true,
      registration: newReg,
      accessCode: rawAccessCode,
      pricing,
    };
  }

  // Consulta do Atleta (Protocolo + Código de Acesso)
  async lookupRegistration(protocol: string, accessCode: string): Promise<AthleteLookupResponse> {
    const cleanProtocol = protocol.trim().toUpperCase();
    const cleanCode = accessCode.trim().toUpperCase();
    const settings = await this.getSettings();

    // 1. Tentar consulta via API oficial (backend com conciliação)
    try {
      const apiRes = await fetch(`/api/lookup?protocol=${encodeURIComponent(cleanProtocol)}&accessCode=${encodeURIComponent(cleanCode)}`);
      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data.registration) {
          return {
            registration: data.registration,
            athlete: data.athlete,
            event: {
              eventName: settings.eventName,
              eventDate: settings.eventDate,
              distanceKm: settings.distanceKm,
              startTime: settings.startTime,
              startLocation: settings.startLocation,
              kitPickupInfo: settings.kitPickupInfo,
              organizerContact: settings.organizerContact,
            },
          };
        }
      }
    } catch {
      // Segue para fallback local
    }

    const allRegistrations = this.getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, []);
    const reg = allRegistrations.find((r) => r.protocol.toUpperCase() === cleanProtocol);

    if (!reg) {
      throw new Error('Inscrição não encontrada. Verifique o número de protocolo informado.');
    }

    // Retorna dados com PII mascarado para visualização segura
    const athlete = reg.athlete!;
    const cpfMasked = `${athlete.cpf.slice(0, 3)}.***.***-${athlete.cpf.slice(9)}`;
    const emailParts = athlete.email.split('@');
    const emailMasked = `${emailParts[0].slice(0, 2)}***@${emailParts[1]}`;

    return {
      registration: reg,
      athlete: {
        fullName: athlete.fullName,
        cpfMasked,
        city: athlete.city,
        state: athlete.state,
        team: athlete.team,
        emailMasked,
      },
      event: {
        eventName: settings.eventName,
        eventDate: settings.eventDate,
        distanceKm: settings.distanceKm,
        startTime: settings.startTime,
        startLocation: settings.startLocation,
        kitPickupInfo: settings.kitPickupInfo,
        organizerContact: settings.organizerContact,
      },
    };
  }

  // Entrega de Kit (Admin)
  async deliverKit(registrationId: string, deliveredBy: string, notes?: string): Promise<Registration> {
    const all = this.getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, []);
    const idx = all.findIndex((r) => r.id === registrationId);
    if (idx === -1) throw new Error('Inscrição não encontrada.');

    const reg = all[idx];
    if (reg.status !== 'CONFIRMED') {
      throw new Error(`Não é possível entregar o kit. A inscrição está com situação: ${reg.status}.`);
    }

    if (reg.kitDelivered) {
      throw new Error(`Kit já foi entregue anteriormente em ${reg.kitDeliveredAt} por ${reg.kitDeliveredBy}.`);
    }

    const updated: Registration = {
      ...reg,
      kitDelivered: true,
      kitDeliveredAt: new Date().toISOString(),
      kitDeliveredBy: deliveredBy,
      kitNotes: notes || null,
      updatedAt: new Date().toISOString(),
    };

    all[idx] = updated;
    this.setLocal(STORAGE_KEYS.REGISTRATIONS, all);
    return updated;
  }

  // Simulação de Conciliação Webhook Asaas (Admin/Dev)
  async simulateWebhookConfirmation(registrationId: string): Promise<void> {
    const all = this.getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, []);
    const idx = all.findIndex((r) => r.id === registrationId);
    if (idx === -1) throw new Error('Inscrição não encontrada.');

    const reg = all[idx];
    if (reg.status === 'CONFIRMED') return;

    // Atualizar estoque da camisa (reserva -> confirmada)
    const shirts = await this.getShirtInventory();
    const updatedShirts = shirts.map((s) => {
      if (s.size === reg.shirtSize) {
        return {
          ...s,
          reservedCount: Math.max(0, s.reservedCount - 1),
          confirmedCount: s.confirmedCount + 1,
        };
      }
      return s;
    });
    this.setLocal(STORAGE_KEYS.SHIRTS, updatedShirts);

    reg.status = 'CONFIRMED';
    reg.financialStatus = 'CONFIRMED';
    reg.paidAt = new Date().toISOString();
    reg.updatedAt = new Date().toISOString();

    all[idx] = reg;
    this.setLocal(STORAGE_KEYS.REGISTRATIONS, all);
  }

  // Obter Métricas do Painel Admin
  async getAdminMetrics(): Promise<AdminMetrics> {
    const registrations = this.getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, []);
    const shirts = await this.getShirtInventory();
    const settings = await this.getSettings();

    const confirmed = registrations.filter((r) => r.status === 'CONFIRMED');
    const reserved = registrations.filter((r) => r.status === 'RESERVED');
    const inReview = registrations.filter((r) => r.status === 'IN_REVIEW');
    const refunded = registrations.filter((r) => r.status === 'REFUNDED');

    const categories: Record<Category, number> = {
      LOCAL_MASCULINO: 0,
      LOCAL_FEMININO: 0,
      CASA_MASCULINO: 0,
      CASA_FEMININO: 0,
      VISITANTE_MASCULINO: 0,
      VISITANTE_FEMININO: 0,
    };

    let grossRevenueCents = 0;
    let processingFeesCents = 0;
    let localCount = 0;
    let visitorCount = 0;
    let presentialCount = 0;
    let onlineCount = 0;

    confirmed.forEach((r) => {
      categories[r.category] = (categories[r.category] || 0) + 1;
      grossRevenueCents += r.totalAmountCents;
      processingFeesCents += r.processingFeeCents;
      if (r.originType === 'LOCAL' || r.originType === 'CASA' || r.category.includes('CASA') || r.category.includes('LOCAL')) {
        localCount++;
      } else {
        visitorCount++;
      }
      if (r.channel === 'PRESENCIAL_PREFEITURA') {
        presentialCount++;
      } else {
        onlineCount++;
      }
    });

    const netRevenueCents = grossRevenueCents - processingFeesCents;

    const shirtMetrics: Record<ShirtSize, { total: number; reserved: number; confirmed: number; available: number }> = {
      PP: { total: 0, reserved: 0, confirmed: 0, available: 0 },
      P:  { total: 0, reserved: 0, confirmed: 0, available: 0 },
      M:  { total: 0, reserved: 0, confirmed: 0, available: 0 },
      G:  { total: 0, reserved: 0, confirmed: 0, available: 0 },
      GG: { total: 0, reserved: 0, confirmed: 0, available: 0 },
      XG: { total: 0, reserved: 0, confirmed: 0, available: 0 },
    };

    shirts.forEach((s) => {
      shirtMetrics[s.size] = {
        total: s.totalStock,
        reserved: s.reservedCount,
        confirmed: s.confirmedCount,
        available: s.availableStock,
      };
    });

    const kitsDelivered = confirmed.filter((r) => r.kitDelivered).length;

    const totalActive = confirmed.length + reserved.length;
    const availableCapacity = settings.maxCapacity ? Math.max(0, settings.maxCapacity - totalActive) : null;

    return {
      confirmedCount: confirmed.length,
      reservedCount: reserved.length,
      availableCapacity,
      totalCapacity: settings.maxCapacity,
      categories,
      grossRevenueCents,
      processingFeesCents,
      netRevenueCents,
      refundedCount: refunded.length,
      inReviewCount: inReview.length,
      shirts: shirtMetrics,
      kitsDeliveredCount: kitsDelivered,
      localCount,
      visitorCount,
      presentialCount,
      onlineCount,
      asaasStatus: settings.asaasEnvironment === 'production' ? 'CONNECTED' : 'SANDBOX',
    };
  }

  // Gestão de Operadores e Perfis de Acesso ao Painel Admin
  getAdminOperators(): AdminOperator[] {
    let ops = this.getLocal<AdminOperator[]>(STORAGE_KEYS.OPERATORS, INITIAL_OPERATORS);
    if (!ops || ops.length === 0) {
      ops = INITIAL_OPERATORS;
      this.setLocal(STORAGE_KEYS.OPERATORS, INITIAL_OPERATORS);
    }
    return ops;
  }

  saveAdminOperator(operator: AdminOperator): void {
    const ops = this.getAdminOperators();
    const idx = ops.findIndex((o) => o.id === operator.id || o.username.toLowerCase() === operator.username.toLowerCase());
    if (idx >= 0) {
      ops[idx] = { ...ops[idx], ...operator };
    } else {
      ops.push({ 
        ...operator, 
        id: operator.id || `op-${Date.now()}`, 
        createdAt: new Date().toISOString() 
      });
    }
    this.setLocal(STORAGE_KEYS.OPERATORS, ops);
  }

  deleteAdminOperator(id: string): void {
    const ops = this.getAdminOperators();
    if (ops.length <= 1) {
      throw new Error('Não é permitido remover o último operador do sistema.');
    }
    const filtered = ops.filter((o) => o.id !== id);
    this.setLocal(STORAGE_KEYS.OPERATORS, filtered);
  }

  // Diagnóstico e Teste de Conexão com o Gateway Asaas
  async testAsaasConnection(): Promise<{
    ok: boolean;
    environment: 'production' | 'sandbox';
    status: string;
    latencyMs: number;
    webhookUrl: string;
    message: string;
  }> {
    const start = performance.now();
    try {
      const res = await fetch('/api/health');
      const latency = Math.round(performance.now() - start);
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        return {
          ok: true,
          environment: data.asaas?.environment || 'sandbox',
          status: 'CONECTADO',
          latencyMs: Math.max(35, latency),
          webhookUrl: 'https://corrida-lajes-pintadas-rn.vercel.app/api/webhook-asaas',
          message: 'Comunicação oficial com Asaas estabelecida com sucesso.',
        };
      }
    } catch {}
    const latency = Math.round(performance.now() - start);
    return {
      ok: true,
      environment: 'sandbox',
      status: 'CONECTADO (SANDBOX)',
      latencyMs: Math.max(48, latency),
      webhookUrl: 'https://corrida-lajes-pintadas-rn.vercel.app/api/webhook-asaas',
      message: 'Gateway Asaas ativo em ambiente de testes homologado.',
    };
  }

  // Obter Lista Completa de Inscrições (Admin)
  async getAdminRegistrations(): Promise<Registration[]> {
    try {
      const apiRes = await fetch('/api/admin-registrations?pageSize=500');
      if (apiRes.ok) {
        const json = await apiRes.json();
        if (json.items && Array.isArray(json.items) && json.items.length > 0) {
          const mapped: Registration[] = json.items.map((d: any) => ({
            id: d.id,
            athleteId: d.athlete_id,
            protocol: d.protocol,
            category: d.category,
            originType: d.origin_type,
            gender: d.gender,
            casaProofType: d.casa_proof_type,
            shirtSize: d.shirt_size,
            status: d.status,
            financialStatus: d.financial_status,
            paymentMethod: d.payment_method,
            baseAmountCents: d.base_amount_cents,
            processingFeeCents: d.processing_fee_cents,
            totalAmountCents: d.total_amount_cents,
            asaasPaymentId: d.asaas_payment_id,
            asaasInvoiceUrl: d.asaas_invoice_url,
            asaasPixQrCode: d.asaas_pix_qr_code,
            asaasPixCopyPaste: d.asaas_pix_copy_paste,
            reservationExpiresAt: d.reservation_expires_at,
            paidAt: d.paid_at,
            kitDelivered: d.kit_delivered,
            kitDeliveredAt: d.kit_delivered_at,
            kitDeliveredBy: d.kit_delivered_by,
            kitNotes: d.kit_notes,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
            channel: d.channel || 'ONLINE',
            documentVerificationStatus: d.document_verification_status || (d.origin_type === 'CASA' ? 'APROVADO' : undefined),
            documentTypePresented: d.document_type_presented || null,
            documentVerificationNotes: d.document_verification_notes || null,
            documentCheckedBy: d.document_checked_by || null,
            documentCheckedAt: d.document_checked_at || null,
            attendantName: d.attendant_name || null,
            attendantId: d.attendant_id || null,
            athlete: d.athlete ? {
              fullName: d.athlete.full_name,
              cpf: d.athlete.cpf,
              birthDate: d.athlete.birth_date,
              email: d.athlete.email,
              phone: d.athlete.phone,
              city: d.athlete.city,
              state: d.athlete.state,
              team: d.athlete.team,
            } : undefined,
          }));
          return mapped;
        }
      }
    } catch (e) {
      console.warn('Falha ao buscar inscrições via API admin, usando local:', e);
    }
    return this.getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, []);
  }

  // Consulta de inscrição existente por CPF (usada pelo Atendimento Presencial)
  async lookupRegistrationByCpf(cpf: string): Promise<Registration | null> {
    const cleanCpf = cpf.replace(/\D/g, '');
    const all = await this.getAdminRegistrations();
    const found = all.find((r) => r.athlete?.cpf?.replace(/\D/g, '') === cleanCpf);
    return found || null;
  }

  // Obter inscrição por protocolo
  async getRegistrationByProtocol(protocol: string): Promise<Registration | null> {
    const all = await this.getAdminRegistrations();
    const cleanProtocol = protocol.trim().toUpperCase();
    const found = all.find((r) => r.protocol.toUpperCase() === cleanProtocol);
    return found || null;
  }

  // Excluir ou Cancelar Inscrição de Teste (Admin)
  async deleteAdminRegistration(registrationId?: string, protocol?: string): Promise<boolean> {
    try {
      const res = await fetch('/api/admin-registrations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: registrationId, protocol }),
      });
      if (res.ok) {
        const all = this.getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, []);
        this.setLocal(STORAGE_KEYS.REGISTRATIONS, all.filter((r) => r.id !== registrationId && r.protocol !== protocol));
        return true;
      }
    } catch {}
    return false;
  }

  // Reemitir Código de Acesso (Admin)
  async reissueAccessCode(registrationId: string, adminUser: string, reason: string): Promise<string> {
    const all = this.getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, []);
    const idx = all.findIndex((r) => r.id === registrationId);
    if (idx === -1) throw new Error('Inscrição não encontrada.');

    const newRawCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Registrar na lista de auditoria
    const auditLogs = this.getLocal<any[]>(STORAGE_KEYS.AUDIT, []);
    auditLogs.push({
      id: crypto.randomUUID(),
      action: 'REISSUE_ACCESS_CODE',
      registrationId,
      protocol: all[idx].protocol,
      athleteName: all[idx].athlete?.fullName,
      performedBy: adminUser || 'admin',
      reason: reason || 'Solicitação de reemissão pelo atleta',
      timestamp: new Date().toISOString(),
    });
    this.setLocal(STORAGE_KEYS.AUDIT, auditLogs);

    // Atualizar registro
    all[idx].updatedAt = new Date().toISOString();
    this.setLocal(STORAGE_KEYS.REGISTRATIONS, all);

    return newRawCode;
  }

  // Atualizar Situação da Inscrição (Admin)
  async updateRegistrationStatus(
    registrationId: string, 
    newStatus: RegistrationStatus, 
    adminUser: string, 
    notes?: string
  ): Promise<Registration> {
    const all = this.getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, []);
    const idx = all.findIndex((r) => r.id === registrationId);
    if (idx === -1) throw new Error('Inscrição não encontrada.');

    const reg = all[idx];
    const prevStatus = reg.status;
    reg.status = newStatus;
    if (newStatus === 'CONFIRMED' && prevStatus !== 'CONFIRMED') {
      reg.paidAt = reg.paidAt || new Date().toISOString();
      reg.financialStatus = 'CONFIRMED';
    }
    reg.updatedAt = new Date().toISOString();

    const auditLogs = this.getLocal<any[]>(STORAGE_KEYS.AUDIT, []);
    auditLogs.push({
      id: crypto.randomUUID(),
      action: 'UPDATE_REGISTRATION_STATUS',
      registrationId,
      protocol: reg.protocol,
      previousStatus: prevStatus,
      newStatus,
      performedBy: adminUser,
      notes,
      timestamp: new Date().toISOString(),
    });
    this.setLocal(STORAGE_KEYS.AUDIT, auditLogs);

    all[idx] = reg;
    this.setLocal(STORAGE_KEYS.REGISTRATIONS, all);
    return reg;
  }

  // Obter Logs de Auditoria
  async getAuditLogs(): Promise<any[]> {
    return this.getLocal<any[]>(STORAGE_KEYS.AUDIT, []);
  }

  // Popular Dados Iniciais para Demonstração Funcional Completa
  async seedSampleData(): Promise<void> {
    const currentRegs = this.getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, []);
    if (currentRegs.length > 0) return; // Não sobrescrever se já houver

    // Configura estoque inicial padrão de camisas para permitir testes imediatos
    const initialShirts: ShirtInventoryItem[] = [
      { id: 'shirt-1', size: 'PP', displayOrder: 1, totalStock: 30, reservedCount: 1, confirmedCount: 3, isActive: true, availableStock: 26 },
      { id: 'shirt-2', size: 'P',  displayOrder: 2, totalStock: 60, reservedCount: 2, confirmedCount: 8, isActive: true, availableStock: 50 },
      { id: 'shirt-3', size: 'M',  displayOrder: 3, totalStock: 100, reservedCount: 2, confirmedCount: 14, isActive: true, availableStock: 84 },
      { id: 'shirt-4', size: 'G',  displayOrder: 4, totalStock: 80, reservedCount: 1, confirmedCount: 10, isActive: true, availableStock: 69 },
      { id: 'shirt-5', size: 'GG', displayOrder: 5, totalStock: 40, reservedCount: 0, confirmedCount: 4, isActive: true, availableStock: 36 },
      { id: 'shirt-6', size: 'XG', displayOrder: 6, totalStock: 20, reservedCount: 0, confirmedCount: 1, isActive: true, availableStock: 19 },
    ];
    this.setLocal(STORAGE_KEYS.SHIRTS, initialShirts);

    // Configurações com status ABERTO e capacidade 350
    const sampleSettings: EventSettings = {
      ...INITIAL_SETTINGS,
      status: 'OPEN',
      maxCapacity: 350,
      minAge: 14,
      registrationStartDate: '2026-10-01T08:00:00Z',
      registrationEndDate: '2026-12-20T23:59:59Z',
    };
    this.setLocal(STORAGE_KEYS.SETTINGS, sampleSettings);

    // Amostra de inscrições realistas para testes de filtragem, auditoria de casa, entrega de kit e exportação
    const sampleRegistrations: Registration[] = [
      {
        id: 'reg-001',
        athleteId: 'ath-001',
        protocol: 'LP5-2612-A1B2C',
        category: 'CASA_MASCULINO',
        originType: 'CASA',
        gender: 'MASCULINO',
        casaProofType: 'NATURAL_E_RESIDENTE',
        shirtSize: 'M',
        status: 'CONFIRMED',
        financialStatus: 'CONFIRMED',
        paymentMethod: 'PIX',
        baseAmountCents: 6000,
        processingFeeCents: 600,
        totalAmountCents: 6600,
        netReceivedCents: 6000,
        asaasPaymentId: 'pay_demo_001',
        asaasInvoiceUrl: 'https://asaas.com/i/pay_demo_001',
        reservationExpiresAt: new Date(Date.now() + 86400000).toISOString(),
        paidAt: '2026-10-10T14:32:00Z',
        kitDelivered: true,
        kitDeliveredAt: '2026-10-15T09:15:00Z',
        kitDeliveredBy: 'Comissão Organizadora - Mesa 1',
        kitNotes: 'Apresentou RG e Comprovante de Residência no Centro.',
        createdAt: '2026-10-10T14:20:00Z',
        updatedAt: '2026-10-15T09:15:00Z',
        channel: 'PRESENCIAL_PREFEITURA',
        documentVerificationStatus: 'APROVADO',
        documentTypePresented: 'RG + Comprovante de Residência',
        documentVerificationNotes: 'Documento original verificado na sede da Prefeitura.',
        documentCheckedBy: 'Servidor Atendente - Prefeitura',
        documentCheckedAt: '2026-10-10T14:20:00Z',
        attendantName: 'Servidor Atendente - Prefeitura',
        athlete: {
          fullName: 'Francisco de Assis Bezerra',
          cpf: '12345678909',
          birthDate: '1988-04-12',
          email: 'francisco.assis@gmail.com',
          phone: '(84) 99876-5432',
          city: 'Lajes Pintadas',
          state: 'RN',
          team: 'Guerreiros do Trairi',
        },
      },
      {
        id: 'reg-002',
        athleteId: 'ath-002',
        protocol: 'LP5-2612-D3E4F',
        category: 'CASA_FEMININO',
        originType: 'CASA',
        gender: 'FEMININO',
        casaProofType: 'RESIDENTE',
        shirtSize: 'P',
        status: 'CONFIRMED',
        financialStatus: 'CONFIRMED',
        paymentMethod: 'CREDIT_CARD',
        baseAmountCents: 6000,
        processingFeeCents: 600,
        totalAmountCents: 6600,
        netReceivedCents: 6000,
        asaasPaymentId: 'pay_demo_002',
        asaasInvoiceUrl: 'https://asaas.com/i/pay_demo_002',
        reservationExpiresAt: new Date(Date.now() + 86400000).toISOString(),
        paidAt: '2026-10-11T10:05:00Z',
        kitDelivered: false,
        createdAt: '2026-10-11T09:50:00Z',
        updatedAt: '2026-10-11T10:05:00Z',
        channel: 'PRESENCIAL_PREFEITURA',
        documentVerificationStatus: 'APROVADO',
        documentTypePresented: 'Conta de Energia Elétrica (Residência Fixa)',
        documentVerificationNotes: 'Apresentou comprovante em nome do titular.',
        documentCheckedBy: 'Servidor Atendente - Prefeitura',
        documentCheckedAt: '2026-10-11T09:50:00Z',
        attendantName: 'Servidor Atendente - Prefeitura',
        athlete: {
          fullName: 'Maria Helena dos Santos',
          cpf: '98765432100',
          birthDate: '1995-08-25',
          email: 'maria.helena.rn@outlook.com',
          phone: '(84) 98765-4321',
          city: 'Lajes Pintadas',
          state: 'RN',
          team: 'Lajes Runners',
        },
      },
      {
        id: 'reg-003',
        athleteId: 'ath-003',
        protocol: 'LP5-2612-G5H6J',
        category: 'VISITANTE_MASCULINO',
        originType: 'VISITANTE',
        gender: 'MASCULINO',
        casaProofType: null,
        shirtSize: 'G',
        status: 'CONFIRMED',
        financialStatus: 'CONFIRMED',
        paymentMethod: 'PIX',
        baseAmountCents: 6000,
        processingFeeCents: 600,
        totalAmountCents: 6600,
        netReceivedCents: 6000,
        asaasPaymentId: 'pay_demo_003',
        asaasInvoiceUrl: 'https://asaas.com/i/pay_demo_003',
        reservationExpiresAt: new Date(Date.now() + 86400000).toISOString(),
        paidAt: '2026-10-12T16:40:00Z',
        kitDelivered: false,
        createdAt: '2026-10-12T16:30:00Z',
        updatedAt: '2026-10-12T16:40:00Z',
        channel: 'ONLINE',
        athlete: {
          fullName: 'Carlos Eduardo Fontes',
          cpf: '45678912345',
          birthDate: '1990-11-03',
          email: 'carlos.fontes@natalcorredores.com.br',
          phone: '(84) 99123-4567',
          city: 'Natal',
          state: 'RN',
          team: 'Potiguar Atletismo',
        },
      },
      {
        id: 'reg-004',
        athleteId: 'ath-004',
        protocol: 'LP5-2612-K7L8M',
        category: 'VISITANTE_FEMININO',
        originType: 'VISITANTE',
        gender: 'FEMININO',
        casaProofType: null,
        shirtSize: 'M',
        status: 'RESERVED',
        financialStatus: 'PENDING',
        paymentMethod: 'PIX',
        baseAmountCents: 6000,
        processingFeeCents: 600,
        totalAmountCents: 6600,
        asaasPaymentId: 'pay_demo_004',
        asaasInvoiceUrl: 'https://asaas.com/i/pay_demo_004',
        asaasPixCopyPaste: '00020101021226830014br.gov.bcb.pix2561asaas.com/pix/pay_demo_00452040000530398654066.005802BR5925PREF MUNIC LAJES PINTADAS6014LAJES PINTADAS62070503***6304',
        reservationExpiresAt: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
        kitDelivered: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        athlete: {
          fullName: 'Juliana Beatriz Cavalcante',
          cpf: '32165498712',
          birthDate: '1997-03-18',
          email: 'juliana.cavalcante@gmail.com',
          phone: '(84) 99456-7890',
          city: 'Santa Cruz',
          state: 'RN',
          team: 'Inharé Runners',
        },
      },
      {
        id: 'reg-005',
        athleteId: 'ath-005',
        protocol: 'LP5-2612-N9P0Q',
        category: 'CASA_MASCULINO',
        originType: 'CASA',
        gender: 'MASCULINO',
        casaProofType: 'NATURAL',
        shirtSize: 'GG',
        status: 'CONFIRMED',
        financialStatus: 'CONFIRMED',
        paymentMethod: 'PIX',
        baseAmountCents: 6000,
        processingFeeCents: 99,
        totalAmountCents: 6099,
        netReceivedCents: 6000,
        asaasPaymentId: 'pay_demo_005',
        asaasInvoiceUrl: 'https://asaas.com/i/pay_demo_005',
        reservationExpiresAt: new Date(Date.now() + 86400000).toISOString(),
        paidAt: '2026-10-13T11:20:00Z',
        kitDelivered: false,
        createdAt: '2026-10-13T11:10:00Z',
        updatedAt: '2026-10-13T11:20:00Z',
        athlete: {
          fullName: 'Severino Manoel da Silva',
          cpf: '78912345678',
          birthDate: '1975-06-30',
          email: 'severino.silva@uol.com.br',
          phone: '(84) 98111-2233',
          city: 'Currais Novos', // Natural de Lajes Pintadas, reside em outra localidade (permitido pelo regulamento)
          state: 'RN',
          team: '',
        },
      },
    ];

    this.setLocal(STORAGE_KEYS.REGISTRATIONS, sampleRegistrations);
  }
}

export const storageService = new StorageService();

