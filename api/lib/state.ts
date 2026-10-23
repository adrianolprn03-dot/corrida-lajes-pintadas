// ==============================================================================
// TRANSACTIONAL IN-MEMORY & DATABASE ENGINE COM CONTROLE DE CONCORRÊNCIA,
// IDEMPOTÊNCIA, FILA ATÔMICA DE RESERVA E PROTEÇÃO CONTRA OVERBOOKING
// ==============================================================================

import crypto from 'crypto';

export interface ShirtStock {
  size: string;
  totalStock: number;
  reservedCount: number;
  confirmedCount: number;
}

export interface StoredRegistration {
  id: string;
  protocol: string;
  accessCode: string;
  accessCodeHash: string;
  fullName: string;
  cpf: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  team?: string;
  gender: 'MASCULINO' | 'FEMININO';
  originType: 'CASA' | 'VISITANTE';
  casaProofType?: string;
  category: string;
  shirtSize: string;
  status: 'RESERVED' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';
  financialStatus: 'PENDING' | 'CONFIRMED' | 'RECEIVED' | 'FAILED';
  paymentMethod: 'PIX' | 'CREDIT_CARD';
  baseAmountCents: number;
  feeCents: number;
  totalAmountCents: number;
  asaasPaymentId?: string;
  asaasCustomerId?: string;
  invoiceUrl?: string;
  pixQrCode?: string;
  pixCopyPaste?: string;
  reservationExpiresAt: string;
  createdAt: string;
  updatedAt: string;
  channel?: 'ONLINE' | 'PRESENCIAL_PREFEITURA';
  documentVerificationStatus?: 'PENDENTE' | 'APROVADO' | 'PENDENTE_COMPLEMENTACAO' | 'REJEITADO';
  documentTypePresented?: string;
  documentVerificationNotes?: string;
  documentCheckedBy?: string;
  documentCheckedAt?: string;
  attendantName?: string;
  attendantId?: string;
}

// Estado singleton em memória para garantir consistência sob carga concorrente
class MemoryStore {
  public shirts: Map<string, ShirtStock> = new Map([
    ['PP', { size: 'PP', totalStock: 100, reservedCount: 0, confirmedCount: 0 }],
    ['P',  { size: 'P',  totalStock: 300, reservedCount: 0, confirmedCount: 0 }],
    ['M',  { size: 'M',  totalStock: 500, reservedCount: 0, confirmedCount: 0 }],
    ['G',  { size: 'G',  totalStock: 400, reservedCount: 0, confirmedCount: 0 }],
    ['GG', { size: 'GG', totalStock: 150, reservedCount: 0, confirmedCount: 0 }],
    ['XG', { size: 'XG', totalStock: 50,  reservedCount: 0, confirmedCount: 0 }],
  ]);

  public maxCapacity = 1500;
  public localMaxCapacity = 750;
  public visitorMaxCapacity = 750;
  public registrations: Map<string, StoredRegistration> = new Map(); // protocol -> reg
  public registrationsByCpf: Map<string, string> = new Map(); // cleanCpf -> protocol
  public idempotencyCache: Map<string, { result: any; expiresAt: number }> = new Map();
  public processedWebhooks: Set<string> = new Set();
  
  // Mutex para reservas atômicas (impede race condition / overbooking)
  private lockPromise: Promise<void> = Promise.resolve();

  // Trava de exclusão mútua atômica para operações críticas de estoque
  private async acquireLock<T>(fn: () => Promise<T>): Promise<T> {
    let releaseLock: () => void;
    const nextLock = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });

    const currentLock = this.lockPromise;
    this.lockPromise = nextLock;

    await currentLock;
    try {
      return await fn();
    } finally {
      releaseLock!();
    }
  }

  // Métricas do sistema em tempo real
  public metrics = {
    totalRequests: 0,
    successfulReservations: 0,
    rejectedOvercapacity: 0,
    rejectedOutOfStock: 0,
    rejectedDuplicateCpf: 0,
    duplicateSubmissionsPrevented: 0,
    webhookProcessed: 0,
    webhookDuplicatesIgnored: 0,
    webhookOutOfOrderIgnored: 0,
    statusLookups: 0,
    latencies: [] as number[],
  };

  recordLatency(ms: number) {
    this.metrics.latencies.push(ms);
    // Manter as últimas 1.000 latências para cálculo de percentil p95 sem consumo de memória excessivo
    if (this.metrics.latencies.length > 1000) {
      this.metrics.latencies.shift();
    }
  }

  getP95Latency(): number {
    if (this.metrics.latencies.length === 0) return 0;
    const sorted = [...this.metrics.latencies].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.95);
    return Math.round(sorted[index] || 0);
  }

  // 1. RESERVA TRANSACIONAL ATÔMICA
  async createReservation(params: {
    fullName: string;
    cpf: string;
    birthDate: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    team?: string;
    gender: 'MASCULINO' | 'FEMININO';
    originType: 'CASA' | 'VISITANTE';
    casaProofType?: string;
    shirtSize: string;
    paymentMethod: 'PIX' | 'CREDIT_CARD';
    baseAmountCents: number;
    feeCents: number;
    totalAmountCents: number;
    idempotencyKey?: string;
  }): Promise<{ registration: StoredRegistration; accessCode: string }> {
    const cleanCpf = params.cpf.replace(/\D/g, '');

    // Idempotência: verificar se a mesma requisição já foi processada recentemente
    const idemKey = params.idempotencyKey || `${cleanCpf}_${params.birthDate}`;
    const cached = this.idempotencyCache.get(idemKey);
    if (cached && cached.expiresAt > Date.now()) {
      this.metrics.duplicateSubmissionsPrevented++;
      return cached.result;
    }

    return this.acquireLock(async () => {
      // 1.1 Verificar duplicidade de CPF ativo
      const existingProtocol = this.registrationsByCpf.get(cleanCpf);
      if (existingProtocol) {
        const existing = this.registrations.get(existingProtocol);
        if (existing && ['RESERVED', 'CONFIRMED'].includes(existing.status)) {
          // Se for reserva pendente e ainda não expirou
          if (existing.status === 'CONFIRMED' || new Date(existing.reservationExpiresAt) > new Date()) {
            this.metrics.rejectedDuplicateCpf++;
            throw new Error(`Este CPF já possui uma inscrição ativa no evento (Protocolo: ${existing.protocol}).`);
          }
        }
      }

      // 1.2 Verificar Capacidade Geral do Evento e Cotas por Categoria
      let activeCount = 0;
      let localActiveCount = 0;
      let visitorActiveCount = 0;
      const now = new Date();
      for (const reg of this.registrations.values()) {
        const isActive = reg.status === 'CONFIRMED' || (reg.status === 'RESERVED' && new Date(reg.reservationExpiresAt) > now);
        if (isActive) {
          activeCount++;
          if (reg.originType === 'CASA') {
            localActiveCount++;
          } else {
            visitorActiveCount++;
          }
        }
      }

      if (activeCount >= this.maxCapacity) {
        this.metrics.rejectedOvercapacity++;
        throw new Error('Capacidade máxima do evento atingida. Inscrições encerradas.');
      }

      if (params.originType === 'CASA' && this.localMaxCapacity !== null && localActiveCount >= this.localMaxCapacity) {
        this.metrics.rejectedOvercapacity++;
        throw new Error(`Cota de vagas esgotada para a Categoria Local (Lajespintadense). Limite: ${this.localMaxCapacity} vagas.`);
      }

      if (params.originType === 'VISITANTE' && this.visitorMaxCapacity !== null && visitorActiveCount >= this.visitorMaxCapacity) {
        this.metrics.rejectedOvercapacity++;
        throw new Error(`Cota de vagas esgotada para a Categoria Visitante. Limite: ${this.visitorMaxCapacity} vagas.`);
      }

      // 1.3 Verificar Estoque da Camisa com Bloqueio Estrito
      const shirt = this.shirts.get(params.shirtSize);
      if (!shirt) {
        throw new Error(`Tamanho de camisa inválido: ${params.shirtSize}`);
      }

      const availableStock = shirt.totalStock - (shirt.reservedCount + shirt.confirmedCount);
      if (availableStock <= 0) {
        this.metrics.rejectedOutOfStock++;
        throw new Error(`O tamanho de camisa ${params.shirtSize} esgotou. Por favor, escolha outro tamanho.`);
      }

      // 1.4 Decrementar estoque / Incrementar reserva de forma atômica
      shirt.reservedCount++;

      // 1.5 Gerar Protocolo e Código de Acesso
      const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase().substring(0, 5);
      const protocol = `LP5-2612-${randomSuffix}`;
      const accessCode = crypto.randomBytes(4).toString('hex').toUpperCase().substring(0, 6);
      const accessCodeHash = crypto.createHash('sha256').update(accessCode).digest('hex');

      // Calcular categoria oficial
      let category = '';
      if (params.originType === 'CASA') {
        category = params.gender === 'MASCULINO' ? 'CASA_MASCULINO' : 'CASA_FEMININO';
      } else {
        category = params.gender === 'MASCULINO' ? 'VISITANTE_MASCULINO' : 'VISITANTE_FEMININO';
      }

      const reservation: StoredRegistration = {
        id: crypto.randomUUID(),
        protocol,
        accessCode,
        accessCodeHash,
        fullName: params.fullName.trim(),
        cpf: cleanCpf,
        email: params.email.trim().toLowerCase(),
        phone: params.phone.trim(),
        city: params.city.trim(),
        state: params.state.trim().toUpperCase(),
        team: params.team?.trim(),
        gender: params.gender,
        originType: params.originType,
        casaProofType: params.casaProofType,
        category,
        shirtSize: params.shirtSize,
        status: 'RESERVED',
        financialStatus: 'PENDING',
        paymentMethod: params.paymentMethod,
        baseAmountCents: params.baseAmountCents,
        feeCents: params.feeCents,
        totalAmountCents: params.totalAmountCents,
        reservationExpiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Registrar no estado
      this.registrations.set(protocol, reservation);
      this.registrationsByCpf.set(cleanCpf, protocol);

      const responsePayload = { registration: reservation, accessCode };

      // Guardar no cache de idempotência por 60 segundos
      this.idempotencyCache.set(idemKey, {
        result: responsePayload,
        expiresAt: Date.now() + 60 * 1000,
      });

      this.metrics.successfulReservations++;
      return responsePayload;
    });
  }

  // 2. CONFIRMAÇÃO POR WEBHOOK COM TRATAMENTO DE EVENTOS REPETIDOS E FORA DE ORDEM
  async processWebhookEvent(payload: {
    event: string;
    payment: {
      id: string;
      externalReference?: string;
      status: string;
      value: number;
      netValue?: number;
    };
  }): Promise<{ success: boolean; action: string }> {
    const { event, payment } = payload;
    const eventId = `${event}_${payment.id}_${payment.status}`;

    // 2.1 Prevenção de Eventos Repetidos (Idempotência Estrita)
    if (this.processedWebhooks.has(eventId)) {
      this.metrics.webhookDuplicatesIgnored++;
      return { success: true, action: 'IGNORED_DUPLICATE_EVENT' };
    }

    return this.acquireLock(async () => {
      // Localizar inscrição por asaasPaymentId ou externalReference (Protocolo)
      let targetReg: StoredRegistration | undefined;
      if (payment.externalReference) {
        targetReg = this.registrations.get(payment.externalReference);
      }
      if (!targetReg) {
        for (const reg of this.registrations.values()) {
          if (reg.asaasPaymentId === payment.id) {
            targetReg = reg;
            break;
          }
        }
      }

      if (!targetReg) {
        return { success: false, action: 'REGISTRATION_NOT_FOUND' };
      }

      // 2.2 Tratamento de Eventos Fora de Ordem
      // Se a inscrição já está CONFIRMADA ou RECEBIDA, ignorar eventos de status inferior
      const isAlreadyConfirmed = targetReg.status === 'CONFIRMED' || targetReg.financialStatus === 'CONFIRMED';
      if (isAlreadyConfirmed && ['PAYMENT_CREATED', 'PAYMENT_UPDATED', 'PENDING'].includes(event)) {
        this.metrics.webhookOutOfOrderIgnored++;
        this.processedWebhooks.add(eventId);
        return { success: true, action: 'IGNORED_OUT_OF_ORDER' };
      }

      // 2.3 Processamento de Pagamento Confirmado / Recebido
      if (['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED'].includes(event)) {
        targetReg.status = 'CONFIRMED';
        targetReg.financialStatus = 'CONFIRMED';
        targetReg.updatedAt = new Date().toISOString();

        // Mover camisa de reservada para confirmada
        const shirt = this.shirts.get(targetReg.shirtSize);
        if (shirt) {
          if (shirt.reservedCount > 0) shirt.reservedCount--;
          shirt.confirmedCount++;
        }

        this.processedWebhooks.add(eventId);
        this.metrics.webhookProcessed++;
        return { success: true, action: 'PAYMENT_CONFIRMED' };
      }

      // 2.4 Cancelamento / Estorno
      if (['PAYMENT_DELETED', 'PAYMENT_REFUNDED'].includes(event)) {
        targetReg.status = 'CANCELLED';
        targetReg.financialStatus = 'FAILED';
        targetReg.updatedAt = new Date().toISOString();

        const shirt = this.shirts.get(targetReg.shirtSize);
        if (shirt && shirt.confirmedCount > 0) {
          shirt.confirmedCount--;
        }

        this.processedWebhooks.add(eventId);
        this.metrics.webhookProcessed++;
        return { success: true, action: 'PAYMENT_REFUNDED' };
      }

      this.processedWebhooks.add(eventId);
      return { success: true, action: 'STATUS_UPDATED' };
    });
  }

  // 3. CONSULTA RÁPIDA DE SITUAÇÃO NO NOSSO BACKEND (SEM BATER NO ASAAS)
  lookupByProtocol(protocol: string, accessCode: string): StoredRegistration | null {
    this.metrics.statusLookups++;
    const reg = this.registrations.get(protocol.trim().toUpperCase());
    if (!reg) return null;

    // Verificar Hash do código de acesso
    const cleanCode = accessCode.trim().toUpperCase();
    const hash = crypto.createHash('sha256').update(cleanCode).digest('hex');
    if (reg.accessCodeHash !== hash && reg.accessCode !== cleanCode) {
      return null;
    }

    return reg;
  }

  // 4. LISTA PAGINADA PARA O PAINEL ADMINISTRATIVO
  getPaginatedRegistrations(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    category?: string;
    status?: string;
  }) {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(100, Math.max(10, params.pageSize || 20));
    
    let all = Array.from(this.registrations.values());

    // Filtros com índices em memória
    if (params.search) {
      const q = params.search.toLowerCase().trim();
      all = all.filter(
        (r) =>
          r.fullName.toLowerCase().includes(q) ||
          r.cpf.includes(q) ||
          r.protocol.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q)
      );
    }

    if (params.category && params.category !== 'ALL') {
      all = all.filter((r) => r.category === params.category);
    }

    if (params.status && params.status !== 'ALL') {
      all = all.filter((r) => r.status === params.status);
    }

    // Ordenar decrescente por data
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalCount = all.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const start = (page - 1) * pageSize;
    const items = all.slice(start, start + pageSize);

    return {
      items,
      totalCount,
      page,
      pageSize,
      totalPages,
    };
  }
}

export const memoryStore = new MemoryStore();
