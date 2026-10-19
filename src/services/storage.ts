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
};

// Configurações padrão do evento (Regras confirmadas do Edital)
export const INITIAL_SETTINGS: EventSettings = {
  id: 'current',
  eventName: '5ª Corrida de Emancipação Política de Lajes Pintadas/RN',
  edition: '5ª Edição',
  eventDate: '2026-12-26',
  distanceKm: 5.0,
  basePriceCents: 6000, // R$ 60,00
  status: 'PREPARATION', // Em preparação conforme edital até conclusão dos requisitos
  maxCapacity: null, // A definir no painel
  minAge: null, // A definir no painel
  minorRules: 'Participantes menores de 18 anos devem apresentar autorização formal por escrito assinada pelos responsáveis legais no ato da entrega do kit.',
  startTime: '06:00',
  startLocation: 'Praça Monsenhor Freitas, Centro, Lajes Pintadas/RN',
  registrationStartDate: null,
  registrationEndDate: null,
  kitPickupInfo: 'A entrega dos kits (camisa oficial laranja, chip e número de peito) ocorrerá no Centro de Convivência dos Idosos, mediante apresentação de documento com foto e comprovante de inscrição. Para categoria Casa, é obrigatória a comprovação documental do vínculo declarado.',
  cancellationPolicy: 'Nos termos do Art. 49 do Código de Defesa do Consumidor, o cancelamento com estorno total pode ser solicitado em até 7 dias após o pagamento.',
  organizerName: 'Prefeitura Municipal de Lajes Pintadas / Secretaria Municipal de Esportes',
  organizerContact: 'esportes@lajespintadas.rn.gov.br | WhatsApp: (84) 98800-0000',
  revenueResponsible: 'Tesouraria do Fundo Municipal de Esportes',
  asaasEnvironment: 'sandbox',
  asaasPixFixedFeeCents: 99, // R$ 0,99
  asaasCreditFixedFeeCents: 49, // R$ 0,49
  asaasCreditPercentFee: 0.0299, // 2,99%
  termsVersion: 'v1.0-2026',
  privacyVersion: 'v1.0-2026',
  termsContent: `REGULAMENTO OFICIAL - 5ª CORRIDA DE EMANCIPAÇÃO POLÍTICA DE LAJES PINTADAS/RN

1. DO EVENTO E PARTICIPAÇÃO
A 5ª Corrida de Emancipação Política de Lajes Pintadas/RN será realizada no dia 26 de dezembro de 2026, com percurso oficial aferido de 5 km, em vias públicas asfaltadas e pavimentadas do município de Lajes Pintadas/RN.

2. CATEGORIAS DE PREMIAÇÃO
2.1. O evento é dividido estritamente em quatro categorias oficiais:
    a) Casa Masculino;
    b) Casa Feminino;
    c) Visitante Masculino;
    d) Visitante Feminino.
2.2. A categoria "Casa" é privativa para quem nasceu em Lajes Pintadas/RN ou reside atualmente no município, inclusive naturais que residam em outras localidades.
2.3. A categoria "Visitante" destina-se aos participantes que não se enquadram nas condições de natural nem de residente no município.
2.4. A declaração do vínculo para a categoria Casa realizada na inscrição é uma autodeclaração prévia. A homologação definitiva do resultado e premiação dependerá da comprovação documental cabal (Certidão de Nascimento, Título Eleitoral do Município ou Comprovante de Residência idôneo).

3. DO VALOR E DO KIT
3.1. A taxa de inscrição é de R$ 60,00 (sessenta reais), acrescida exclusivamente das tarifas exatas de processamento do gateway de pagamento oficial (Asaas).
3.2. A inscrição confere direito ao Kit Oficial contendo camisa técnica dry-fit oficial laranja, chip de cronometragem eletrônica, número de peito e medalha finisher para os que concluírem o percurso dentro do tempo regulamentar.
3.3. Não será permitida troca de tamanho de camisa no ato da retirada do kit, prevalecendo estritamente a grade selecionada no ato da inscrição.

4. REGRAS GERAIS E SEGURANÇA
4.1. O atleta declara estar em plenas condições físicas e de saúde para a prática esportiva, isentando a comissão organizadora de quaisquer responsabilidades decorrentes de enfermidades pré-existentes.
4.2. A organização disponibilizará pontos de hidratação no percurso e apoio médico de emergência com ambulância municipal.`,
  privacyContent: `POLÍTICA DE PRIVACIDADE E PROTEÇÃO DE DADOS PESSOAIS (LGPD)

A Prefeitura Municipal de Lajes Pintadas e a Comissão Organizadora da 5ª Corrida de Emancipação Política reafirmam o compromisso com a privacidade e a segurança dos dados pessoais dos atletas inscritos, em estrita conformidade com a Lei Federal nº 13.709/2018 (Lei Geral de Proteção de Dados - LGPD).

1. COLETA E FINALIDADE: Os dados cadastrais coletados (Nome, CPF, Data de Nascimento, E-mail, Telefone/WhatsApp, Endereço de Residência e Equipe) destinam-se exclusivamente à identificação do participante, apuração de categorias por faixa etária e residência, segurança médica no percurso e emissão do seguro de prova.
2. SIGILO E NÃO EXPOSIÇÃO: Em nenhuma hipótese o CPF, telefone, data de nascimento ou e-mail dos inscritos serão publicados em listas públicas de largada ou murais públicos. A consulta à inscrição é protegida por protocolo e código de acesso pessoal gerado com hash criptográfico.
3. COMPARTILHAMENTO CONTROLADO: Os dados estritamente necessários para cobrança são transmitidos via conexão criptografada SSL/TLS ao gateway financeiro credenciado (Asaas Gestão Financeira).`,
  updatedAt: new Date().toISOString(),
};

export const INITIAL_SHIRTS: ShirtInventoryItem[] = [
  { id: 'shirt-1', size: 'PP', displayOrder: 1, totalStock: 0, reservedCount: 0, confirmedCount: 0, isActive: true, availableStock: 0 },
  { id: 'shirt-2', size: 'P',  displayOrder: 2, totalStock: 0, reservedCount: 0, confirmedCount: 0, isActive: true, availableStock: 0 },
  { id: 'shirt-3', size: 'M',  displayOrder: 3, totalStock: 0, reservedCount: 0, confirmedCount: 0, isActive: true, availableStock: 0 },
  { id: 'shirt-4', size: 'G',  displayOrder: 4, totalStock: 0, reservedCount: 0, confirmedCount: 0, isActive: true, availableStock: 0 },
  { id: 'shirt-5', size: 'GG', displayOrder: 5, totalStock: 0, reservedCount: 0, confirmedCount: 0, isActive: true, availableStock: 0 },
  { id: 'shirt-6', size: 'XG', displayOrder: 6, totalStock: 0, reservedCount: 0, confirmedCount: 0, isActive: true, availableStock: 0 },
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
  async getSettings(): Promise<EventSettings> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('event_settings').select('*').limit(1).single();
        if (!error && data) {
          return {
            id: data.id,
            eventName: data.event_name,
            edition: data.edition,
            eventDate: data.event_date,
            distanceKm: Number(data.distance_km),
            basePriceCents: data.base_price_cents,
            status: data.status,
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
    return this.getLocal<EventSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }

  // Atualizar Configurações (Admin)
  async updateSettings(updates: Partial<EventSettings>): Promise<EventSettings> {
    const current = await this.getSettings();
    const merged: EventSettings = { ...current, ...updates, updatedAt: new Date().toISOString() };
    this.setLocal(STORAGE_KEYS.SETTINGS, merged);

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
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('shirt_inventory')
          .select('*')
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
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
      } catch (err) {
        console.warn('Supabase shirt fetch failed, falling back to local:', err);
      }
    }

    const items = this.getLocal<ShirtInventoryItem[]>(STORAGE_KEYS.SHIRTS, INITIAL_SHIRTS);
    return items.map((item) => ({
      ...item,
      availableStock: Math.max(0, item.totalStock - (item.reservedCount + item.confirmedCount)),
    }));
  }

  // Atualizar Estoque da Camisa (Admin)
  async updateShirtStock(size: ShirtSize, newTotalStock: number): Promise<void> {
    const shirts = await this.getShirtInventory();
    const updated = shirts.map((s) => {
      if (s.size === size) {
        // Regra do edital: A redução administrativa de estoque nunca pode ficar abaixo das reservas e inscrições existentes
        const minimumAllowed = s.reservedCount + s.confirmedCount;
        if (newTotalStock < minimumAllowed) {
          throw new Error(
            `Não é permitido reduzir o estoque abaixo de ${minimumAllowed} (já existem ${s.confirmedCount} confirmadas e ${s.reservedCount} reservadas).`
          );
        }
        return { ...s, totalStock: newTotalStock };
      }
      return s;
    });

    this.setLocal(STORAGE_KEYS.SHIRTS, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('shirt_inventory')
          .update({ total_stock: newTotalStock, updated_at: new Date().toISOString() })
          .eq('size', size);
      } catch (e) {
        console.error('Supabase update shirt failed:', e);
      }
    }
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

    // 3. Validação de Regras Casa / Visitante e Consistência de Residência
    if (submission.originType === 'CASA') {
      if (!submission.casaProofType) {
        throw new Error('Para a categoria Casa, é obrigatório selecionar o tipo de vínculo com Lajes Pintadas.');
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
    if (submission.originType === 'CASA') {
      category = submission.gender === 'MASCULINO' ? 'CASA_MASCULINO' : 'CASA_FEMININO';
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

    // 8. Gerar Protocolo e Código de Acesso
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const protocol = `LP5-2612-${randomHex}`;
    const rawAccessCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // 9. Simulação da URL de fatura / Pix do Asaas
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

    const allRegistrations = this.getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, []);
    const reg = allRegistrations.find((r) => r.protocol.toUpperCase() === cleanProtocol);

    if (!reg) {
      throw new Error('Inscrição não encontrada. Verifique o número de protocolo informado.');
    }

    const settings = await this.getSettings();

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
      CASA_MASCULINO: 0,
      CASA_FEMININO: 0,
      VISITANTE_MASCULINO: 0,
      VISITANTE_FEMININO: 0,
    };

    let grossRevenueCents = 0;
    let processingFeesCents = 0;

    confirmed.forEach((r) => {
      categories[r.category] = (categories[r.category] || 0) + 1;
      grossRevenueCents += r.totalAmountCents;
      processingFeesCents += r.processingFeeCents;
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
    };
  }

  // Obter Lista Completa de Inscrições (Admin)
  async getAdminRegistrations(): Promise<Registration[]> {
    return this.getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, []);
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
        processingFeeCents: 99,
        totalAmountCents: 6099,
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
        processingFeeCents: 235,
        totalAmountCents: 6235,
        netReceivedCents: 6000,
        asaasPaymentId: 'pay_demo_002',
        asaasInvoiceUrl: 'https://asaas.com/i/pay_demo_002',
        reservationExpiresAt: new Date(Date.now() + 86400000).toISOString(),
        paidAt: '2026-10-11T10:05:00Z',
        kitDelivered: false,
        createdAt: '2026-10-11T09:50:00Z',
        updatedAt: '2026-10-11T10:05:00Z',
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
        processingFeeCents: 99,
        totalAmountCents: 6099,
        netReceivedCents: 6000,
        asaasPaymentId: 'pay_demo_003',
        asaasInvoiceUrl: 'https://asaas.com/i/pay_demo_003',
        reservationExpiresAt: new Date(Date.now() + 86400000).toISOString(),
        paidAt: '2026-10-12T16:40:00Z',
        kitDelivered: false,
        createdAt: '2026-10-12T16:30:00Z',
        updatedAt: '2026-10-12T16:40:00Z',
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
        processingFeeCents: 99,
        totalAmountCents: 6099,
        asaasPaymentId: 'pay_demo_004',
        asaasInvoiceUrl: 'https://asaas.com/i/pay_demo_004',
        asaasPixCopyPaste: '00020101021226830014br.gov.bcb.pix2561asaas.com/pix/pay_demo_00452040000530398654060.995802BR5925PREF MUNIC LAJES PINTADAS6014LAJES PINTADAS62070503***6304',
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

