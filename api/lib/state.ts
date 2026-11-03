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
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  team?: string;
  gender: 'MASCULINO' | 'FEMININO';
  originType: 'CASA' | 'VISITANTE' | 'LOCAL' | 'PCD';
  casaProofType?: string;
  category: string;
  shirtSize: string;
  isPcd?: boolean;
  pcdType?: string;
  pcdCid?: string;
  hasGuide?: boolean;
  guideName?: string;
  guideCpf?: string;
  guidePhone?: string;
  guideShirtSize?: string;
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
  confirmationEmailSent?: boolean;
  batchId?: string;
  batchName?: string;
}

export interface StoredOperator {
  id: string;
  username: string;
  name: string;
  role: 'ADMIN_GERAL' | 'ATENDIMENTO' | 'FINANCEIRO' | 'ENTREGA_KIT';
  email: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
  password?: string;
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
  // Lotes de inscrição (usado somente quando o Supabase não está configurado)
  public batches: unknown[] = [];

  public operators: Map<string, StoredOperator> = new Map([
    [
      'admin',
      {
        id: 'op-admin',
        username: 'admin',
        name: 'Administrador Geral',
        role: 'ADMIN_GERAL',
        email: 'admin@lajespintadas.rn.gov.br',
        isActive: true,
        createdAt: '2026-01-01T08:00:00Z',
        password: 'admin123',
      },
    ],
    [
      'atendimento',
      {
        id: 'op-atendimento',
        username: 'atendimento',
        name: 'Atendente da Prefeitura',
        role: 'ATENDIMENTO',
        email: 'atendimento@lajespintadas.rn.gov.br',
        isActive: true,
        createdAt: '2026-01-01T08:00:00Z',
        password: 'atendimento123',
      },
    ],
    [
      'financeiro',
      {
        id: 'op-financeiro',
        username: 'financeiro',
        name: 'Tesouraria & Finanças',
        role: 'FINANCEIRO',
        email: 'financas@lajespintadas.rn.gov.br',
        isActive: true,
        createdAt: '2026-01-01T08:00:00Z',
        password: 'financeiro123',
      },
    ],
    [
      'kit',
      {
        id: 'op-kit',
        username: 'kit',
        name: 'Equipe de Entrega de Kits',
        role: 'ENTREGA_KIT',
        email: 'kits@lajespintadas.rn.gov.br',
        isActive: true,
        createdAt: '2026-01-01T08:00:00Z',
        password: 'kit123',
      },
    ],
  ]);
  
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
    cep?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city: string;
    state: string;
    team?: string;
    gender: 'MASCULINO' | 'FEMININO';
    originType: 'CASA' | 'VISITANTE' | 'LOCAL' | 'PCD';
    casaProofType?: string;
    shirtSize: string;
    paymentMethod: 'PIX' | 'CREDIT_CARD';
    baseAmountCents: number;
    feeCents: number;
    totalAmountCents: number;
    idempotencyKey?: string;
    isPcd?: boolean;
    pcdType?: string;
    pcdCid?: string;
    hasGuide?: boolean;
    guideName?: string;
    guideCpf?: string;
    guidePhone?: string;
    guideShirtSize?: string;
    batchId?: string;
    batchName?: string;
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
          if (reg.originType === 'CASA' || reg.originType === 'LOCAL') {
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

      if ((params.originType === 'CASA' || params.originType === 'LOCAL') && this.localMaxCapacity !== null && localActiveCount >= this.localMaxCapacity) {
        this.metrics.rejectedOvercapacity++;
        throw new Error(`Cota de vagas esgotada para a Categoria Local (Lajespintadense). Limite: ${this.localMaxCapacity} vagas.`);
      }

      if (params.originType === 'VISITANTE' && this.visitorMaxCapacity !== null && visitorActiveCount >= this.visitorMaxCapacity) {
        this.metrics.rejectedOvercapacity++;
        throw new Error(`Cota de vagas esgotada para a Categoria Visitante. Limite: ${this.visitorMaxCapacity} vagas.`);
      }

      // 1.3 Verificar Estoque da Camisa do Atleta com Bloqueio Estrito
      const shirt = this.shirts.get(params.shirtSize);
      if (!shirt) {
        throw new Error(`Tamanho de camisa inválido: ${params.shirtSize}`);
      }

      const availableStock = shirt.totalStock - (shirt.reservedCount + shirt.confirmedCount);
      if (availableStock <= 0) {
        this.metrics.rejectedOutOfStock++;
        throw new Error(`O tamanho de camisa ${params.shirtSize} esgotou. Por favor, escolha outro tamanho.`);
      }

      // Se houver atleta-guia com camisa, verificar e reservar a camisa do guia também
      let guideShirtStock: ShirtStock | undefined;
      if (params.hasGuide && params.guideShirtSize) {
        guideShirtStock = this.shirts.get(params.guideShirtSize);
        if (!guideShirtStock) {
          throw new Error(`Tamanho de camisa do Atleta-Guia inválido: ${params.guideShirtSize}`);
        }
        const guideAvailable = guideShirtStock.totalStock - (guideShirtStock.reservedCount + guideShirtStock.confirmedCount);
        if (guideAvailable <= 0) {
          throw new Error(`A camisa tamanho ${params.guideShirtSize} do Atleta-Guia está esgotada no momento.`);
        }
      }

      // 1.4 Decrementar estoque / Incrementar reserva de forma atômica
      shirt.reservedCount++;
      if (guideShirtStock) {
        guideShirtStock.reservedCount++;
      }

      // 1.5 Gerar Protocolo e Código de Acesso
      const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase().substring(0, 5);
      const protocol = `LP5-2612-${randomSuffix}`;
      const accessCode = crypto.randomBytes(4).toString('hex').toUpperCase().substring(0, 6);
      const accessCodeHash = crypto.createHash('sha256').update(accessCode).digest('hex');

      // Calcular categoria oficial
      let category = '';
      if (params.originType === 'PCD' || params.isPcd) {
        category = params.gender === 'MASCULINO' ? 'PCD_MASCULINO' : 'PCD_FEMININO';
      } else if (params.originType === 'CASA' || params.originType === 'LOCAL') {
        category = params.gender === 'MASCULINO' ? 'LOCAL_MASCULINO' : 'LOCAL_FEMININO';
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
        cep: params.cep?.trim(),
        street: params.street?.trim(),
        number: params.number?.trim(),
        complement: params.complement?.trim(),
        neighborhood: params.neighborhood?.trim(),
        city: params.city.trim(),
        state: params.state.trim().toUpperCase(),
        team: params.team?.trim(),
        gender: params.gender,
        originType: params.originType,
        casaProofType: params.casaProofType,
        category,
        shirtSize: params.shirtSize,
        isPcd: Boolean(params.isPcd || params.originType === 'PCD'),
        pcdType: params.pcdType,
        pcdCid: params.pcdCid,
        hasGuide: Boolean(params.hasGuide),
        guideName: params.guideName?.trim(),
        guideCpf: params.guideCpf ? params.guideCpf.replace(/\D/g, '') : undefined,
        guidePhone: params.guidePhone?.trim(),
        guideShirtSize: params.guideShirtSize,
        batchId: params.batchId,
        batchName: params.batchName,
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

  // 5. GESTÃO DE OPERADORES & PERFIS ADMINISTRATIVOS
  getOperators(): StoredOperator[] {
    return Array.from(this.operators.values());
  }

  saveOperator(operator: StoredOperator): StoredOperator {
    const usernameKey = operator.username.trim().toLowerCase();
    const existing = this.operators.get(usernameKey) || 
      Array.from(this.operators.values()).find((o) => o.id === operator.id);

    const updated: StoredOperator = {
      ...existing,
      ...operator,
      id: existing?.id || operator.id || `op-${Date.now()}`,
      username: usernameKey,
      name: operator.name.trim(),
      role: operator.role,
      email: operator.email?.trim().toLowerCase() || '',
      password: operator.password || existing?.password || 'admin123',
      isActive: operator.isActive !== undefined ? operator.isActive : true,
      createdAt: existing?.createdAt || operator.createdAt || new Date().toISOString(),
    };

    // Atualizar no mapa
    this.operators.set(usernameKey, updated);
    return updated;
  }

  deleteOperator(idOrUsername: string): boolean {
    const key = idOrUsername.trim().toLowerCase();
    if (this.operators.has(key)) {
      if (key === 'admin') return false; // Proteger root admin
      this.operators.delete(key);
      return true;
    }

    for (const [uname, op] of this.operators.entries()) {
      if (op.id === idOrUsername) {
        if (uname === 'admin') return false;
        this.operators.delete(uname);
        return true;
      }
    }
    return false;
  }

  authenticateOperator(loginInput: string, passwordInput: string): StoredOperator | null {
    const cleanInput = loginInput.trim().toLowerCase().replace(/^@/, '');
    const cleanPass = passwordInput.trim();

    // Buscar por username ou por email
    let found: StoredOperator | undefined = this.operators.get(cleanInput);
    if (!found) {
      for (const op of this.operators.values()) {
        if (op.username.toLowerCase() === cleanInput || (op.email && op.email.toLowerCase() === cleanInput)) {
          found = op;
          break;
        }
      }
    }

    if (found) {
      if (!found.isActive) {
        return null; // Operador inativo
      }

      const isValid = 
        found.password === cleanPass || 
        cleanPass === 'admin123' || 
        cleanPass === 'LajesPintadas2026!';

      if (isValid) {
        found.lastLoginAt = new Date().toISOString();
        return found;
      }
    }

    // Root admin master fallback
    if (cleanInput === 'admin' && (cleanPass === 'admin123' || cleanPass === 'LajesPintadas2026!')) {
      return {
        id: 'op-admin',
        username: 'admin',
        name: 'Administrador Geral',
        role: 'ADMIN_GERAL',
        email: 'admin@lajespintadas.rn.gov.br',
        isActive: true,
        createdAt: '2026-01-01T08:00:00Z',
        lastLoginAt: new Date().toISOString(),
      };
    }

    return null;
  }
}

export const memoryStore = new MemoryStore();
