// ==============================================================================
// TRANSACTIONAL IN-MEMORY & DATABASE ENGINE COM CONTROLE DE CONCORRÊNCIA,
// IDEMPOTÊNCIA, FILA ATÔMICA DE RESERVA E PROTEÇÃO CONTRA OVERBOOKING
// ==============================================================================

import crypto from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

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

      if (found.password === cleanPass) {
        found.lastLoginAt = new Date().toISOString();
        return found;
      }
    }

    return null;
  }
}

export const memoryStore = new MemoryStore();

// ==============================================================================
// LOTES DE INSCRIÇÃO (REGRAS PURAS + PERSISTÊNCIA NO SERVIDOR)
// ==============================================================================

export interface RegistrationBatch {
  id: string;
  name: string;
  basePriceCents: number;
  endAt: string | null;
  capacity: number | null;
}

export type BatchStatus = 'ENDED' | 'SOLD_OUT' | 'ACTIVE' | 'UPCOMING';

export interface ResolvedBatch extends RegistrationBatch {
  position: number;
  soldCount: number;
  remaining: number | null;
  status: BatchStatus;
}

export interface BatchState {
  configured: boolean;
  batches: ResolvedBatch[];
  current: ResolvedBatch | null;
  next: ResolvedBatch | null;
}

export const LEGACY_BATCH_ID = '__sem_lote__';
export const SERVICE_FEE_PERCENT = 0.1;
export const MAX_BATCHES = 20;
export const DEFAULT_BASE_PRICE_CENTS = 5000;

const AUDIT_RESOURCE = 'REGISTRATION_BATCHES';
const ACTIVE_STATUSES = ['CONFIRMED', 'RESERVED', 'IN_REVIEW'];

export function generateBatchId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'lt_';
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export function sanitizeBatches(raw: unknown): RegistrationBatch[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const result: RegistrationBatch[] = [];

  for (const item of raw.slice(0, MAX_BATCHES)) {
    if (!item || typeof item !== 'object') continue;
    const b = item as Record<string, unknown>;

    let id = typeof b.id === 'string' && /^[A-Za-z0-9_-]{3,40}$/.test(b.id) ? b.id : generateBatchId();
    while (seen.has(id)) id = generateBatchId();
    seen.add(id);

    const name = typeof b.name === 'string' && b.name.trim() ? b.name.trim().slice(0, 60) : `${result.length + 1}º Lote`;
    const price = Math.round(Number(b.basePriceCents));
    if (!Number.isFinite(price) || price <= 0) continue;

    let endAt: string | null = null;
    if (typeof b.endAt === 'string' && b.endAt.trim()) {
      const d = new Date(b.endAt);
      if (!Number.isNaN(d.getTime())) endAt = d.toISOString();
    }

    let capacity: number | null = null;
    if (b.capacity !== null && b.capacity !== undefined && b.capacity !== '') {
      const c = Math.floor(Number(b.capacity));
      if (Number.isFinite(c) && c > 0) capacity = c;
    }

    result.push({ id, name, basePriceCents: price, endAt, capacity });
  }

  return result;
}

export function resolveBatchState(
  batches: RegistrationBatch[],
  soldByBatchId: Record<string, number>,
  now: Date = new Date()
): BatchState {
  const legacySold = soldByBatchId[LEGACY_BATCH_ID] || 0;
  let current: ResolvedBatch | null = null;
  let next: ResolvedBatch | null = null;

  const resolved: ResolvedBatch[] = batches.map((b, index) => {
    const soldCount = (soldByBatchId[b.id] || 0) + (index === 0 ? legacySold : 0);
    const ended = Boolean(b.endAt && now.getTime() > new Date(b.endAt).getTime());
    const soldOut = b.capacity !== null && soldCount >= b.capacity;

    let status: BatchStatus;
    if (ended) status = 'ENDED';
    else if (soldOut) status = 'SOLD_OUT';
    else if (!current) status = 'ACTIVE';
    else status = 'UPCOMING';

    const item: ResolvedBatch = {
      ...b,
      position: index + 1,
      soldCount,
      remaining: b.capacity === null ? null : Math.max(0, b.capacity - soldCount),
      status,
    };

    if (status === 'ACTIVE') current = item;
    else if (status === 'UPCOMING' && !next) next = item;
    return item;
  });

  return { configured: batches.length > 0, batches: resolved, current, next };
}

export function computeBatchPricing(basePriceCents: number, isPcd: boolean) {
  const baseAmountCents = isPcd ? Math.round(basePriceCents / 2) : basePriceCents;
  const feeCents = Math.round(baseAmountCents * SERVICE_FEE_PERCENT);
  return { baseAmountCents, feeCents, totalAmountCents: baseAmountCents + feeCents };
}

export function extractBatchId(row: { batch_id?: string | null; kit_notes?: string | null }): string {
  if (row.batch_id) return row.batch_id;
  const match = typeof row.kit_notes === 'string' ? row.kit_notes.match(/BATCH:([A-Za-z0-9_-]+)/) : null;
  return match ? match[1] : LEGACY_BATCH_ID;
}

export async function loadBatches(supabase: SupabaseClient | null, settingsRow?: any): Promise<RegistrationBatch[]> {
  if (!supabase) return sanitizeBatches(memoryStore.batches);

  let row = settingsRow;
  if (!row) {
    const { data } = await supabase.from('event_settings').select('*').limit(1).maybeSingle();
    row = data;
  }

  if (row && Array.isArray(row.registration_batches) && row.registration_batches.length > 0) {
    return sanitizeBatches(row.registration_batches);
  }

  const { data: logs } = await supabase
    .from('audit_logs')
    .select('details')
    .eq('resource_type', AUDIT_RESOURCE)
    .order('created_at', { ascending: false })
    .limit(1);

  if (logs && logs.length > 0 && logs[0].details) {
    return sanitizeBatches((logs[0].details as any).batches);
  }
  return [];
}

export async function saveBatches(
  supabase: SupabaseClient | null,
  raw: unknown,
  actor?: string
): Promise<RegistrationBatch[]> {
  const clean = sanitizeBatches(raw);

  if (!supabase) {
    memoryStore.batches = clean;
    return clean;
  }

  await supabase
    .from('event_settings')
    .update({ registration_batches: clean, updated_at: new Date().toISOString() })
    .eq('is_singleton', true);

  const { error } = await supabase.from('audit_logs').insert({
    actor_id: actor || 'ADMIN',
    action: 'UPDATE_BATCHES',
    resource_type: AUDIT_RESOURCE,
    details: { batches: clean },
  });
  if (error) throw new Error(`Não foi possível salvar os lotes: ${error.message}`);

  return clean;
}

export async function countSoldByBatch(supabase: SupabaseClient | null): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  const now = Date.now();
  const add = (id: string) => {
    counts[id] = (counts[id] || 0) + 1;
  };

  if (!supabase) {
    for (const reg of memoryStore.registrations.values()) {
      const active = reg.status === 'CONFIRMED' || (reg.status === 'RESERVED' && new Date(reg.reservationExpiresAt).getTime() > now);
      if (active) add(reg.batchId || LEGACY_BATCH_ID);
    }
    return counts;
  }

  const pageSize = 1000;
  let withColumn = true;
  for (let from = 0; from < 50000; from += pageSize) {
    const columns = withColumn
      ? 'batch_id, kit_notes, status, reservation_expires_at'
      : 'kit_notes, status, reservation_expires_at';
    let { data, error } = await supabase
      .from('registrations')
      .select(columns)
      .in('status', ACTIVE_STATUSES)
      .order('created_at', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error && withColumn) {
      withColumn = false;
      from -= pageSize;
      continue;
    }
    if (error) throw error;

    for (const row of (data || []) as any[]) {
      if (row.status === 'RESERVED' && row.reservation_expires_at && new Date(row.reservation_expires_at).getTime() <= now) {
        continue;
      }
      add(extractBatchId(row));
    }
    if (!data || data.length < pageSize) break;
  }
  return counts;
}

export async function getBatchState(supabase: SupabaseClient | null, settingsRow?: any): Promise<BatchState> {
  const batches = await loadBatches(supabase, settingsRow);
  if (batches.length === 0) return resolveBatchState([], {});
  const sold = await countSoldByBatch(supabase);
  return resolveBatchState(batches, sold);
}

// ==============================================================================
// ASAAS CLIENT HELPER COM CONTROLE DE RATE-LIMIT (429), RETRY COM EXPONENTIAL
// BACKOFF, JITTER, CONCILIAÇÃO PRÉVIA E PREVENÇÃO DE DUPLICIDADES
// ==============================================================================

export interface AsaasConfig {
  apiKey: string;
  environment: 'production' | 'sandbox' | 'mock';
  maxRetries?: number;
  baseDelayMs?: number;
}

export interface AsaasCustomer {
  id: string;
  name: string;
  cpfCnpj: string;
  email: string;
  mobilePhone: string;
}

export interface AsaasPayment {
  id: string;
  customer: string;
  value: number;
  netValue?: number;
  billingType: 'PIX' | 'CREDIT_CARD';
  status: string;
  dueDate: string;
  invoiceUrl?: string;
  externalReference?: string;
  creditCard?: {
    creditCardNumber?: string;
    creditCardBrand?: string;
    creditCardToken?: string;
  };
}

export interface AsaasCreditCardInput {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

export interface AsaasCreditCardHolderInfo {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  addressComplement?: string;
  phone: string;
  mobilePhone?: string;
}

export interface AsaasPixQrCode {
  encodedImage: string;
  payload: string;
  expirationDate?: string;
}

export const asaasMetrics = {
  totalCalls: 0,
  successCalls: 0,
  rateLimitHits: 0,
  retriedCalls: 0,
  failedCalls: 0,
  reconciliations: 0,
};

export class AsaasClient {
  private apiKey: string;
  private baseUrl: string;
  private isMock: boolean;
  private maxRetries: number;
  private baseDelayMs: number;

  constructor(config: AsaasConfig) {
    this.apiKey = config.apiKey;
    this.isMock = config.environment === 'mock' || !config.apiKey;
    const env = (config.environment || '').toLowerCase();
    this.baseUrl = env === 'production' || env === 'prod'
      ? 'https://api.asaas.com/v3'
      : 'https://api-sandbox.asaas.com/v3';
    this.maxRetries = config.maxRetries ?? 3;
    this.baseDelayMs = config.baseDelayMs ?? 400;
  }

  private async fetchWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt = 1
  ): Promise<T> {
    asaasMetrics.totalCalls++;

    if (this.isMock) {
      return this.handleMockResponse<T>(endpoint, options);
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'access_token': this.apiKey,
      'User-Agent': 'Corrida-LajesPintadas-Backend/1.0',
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (response.status === 429 || (response.status >= 500 && response.status <= 504)) {
        if (response.status === 429) {
          asaasMetrics.rateLimitHits++;
        }

        if (attempt <= this.maxRetries) {
          asaasMetrics.retriedCalls++;
          const delay = Math.pow(2, attempt) * this.baseDelayMs + Math.random() * 200;
          console.warn(`[AsaasClient] Status ${response.status} na chamada ${endpoint}. Tentativa ${attempt}/${this.maxRetries}. Aguardando ${delay.toFixed(0)}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.fetchWithRetry<T>(endpoint, options, attempt + 1);
        }
      }

      if (!response.ok) {
        asaasMetrics.failedCalls++;
        const contentType = response.headers.get('content-type') || '';
        let errorMsg = `Erro no processamento (${response.status})`;
        if (contentType.includes('application/json')) {
          try {
            const errJson = await response.json();
            if (errJson?.errors && Array.isArray(errJson.errors) && errJson.errors[0]?.description) {
              errorMsg = `Gateway de Pagamento: ${errJson.errors[0].description}`;
            } else if (errJson?.message) {
              errorMsg = `Gateway de Pagamento: ${errJson.message}`;
            }
          } catch {}
        } else {
          const errorBody = await response.text();
          errorMsg = `Gateway de Pagamento retornou status ${response.status}: ${errorBody.slice(0, 100)}`;
        }
        throw new Error(errorMsg);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Gateway de Pagamento retornou resposta não-JSON (${response.status}): ${text.slice(0, 100)}`);
      }

      asaasMetrics.successCalls++;
      return (await response.json()) as T;
    } catch (err: any) {
      if (attempt <= this.maxRetries && err.name !== 'AbortError') {
        asaasMetrics.retriedCalls++;
        const delay = Math.pow(2, attempt) * this.baseDelayMs + Math.random() * 200;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.fetchWithRetry<T>(endpoint, options, attempt + 1);
      }
      asaasMetrics.failedCalls++;
      throw err;
    }
  }

  private handleMockResponse<T>(endpoint: string, options: RequestInit): T {
    asaasMetrics.successCalls++;
    const method = options.method || 'GET';

    if (endpoint.startsWith('/customers')) {
      if (method === 'POST') {
        const body = JSON.parse((options.body as string) || '{}');
        return {
          id: `cus_mock_${Math.random().toString(36).substring(2, 10)}`,
          name: body.name || 'Atleta Simulado',
          cpfCnpj: body.cpfCnpj || '00000000000',
          email: body.email || 'atleta@exemplo.com',
          mobilePhone: body.mobilePhone || '84999999999',
        } as T;
      }
      return { data: [] } as T;
    }

    if (endpoint.startsWith('/payments')) {
      if (endpoint.includes('/pixQrCode')) {
        const payId = endpoint.split('/')[2];
        return {
          encodedImage: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
          payload: `00020101021226830014br.gov.bcb.pix2561asaas.com/pix/${payId}52040000530398654055.005802BR5925PREF MUNIC LAJES PINTADAS6014LAJES PINTADAS62070503***6304`,
          expirationDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        } as T;
      }

      if (method === 'POST') {
        const body = JSON.parse((options.body as string) || '{}');
        const mockPayId = `pay_mock_${Math.random().toString(36).substring(2, 12)}`;
        const isCreditCard = body.billingType === 'CREDIT_CARD' && body.creditCard;
        return {
          id: mockPayId,
          customer: body.customer,
          value: body.value,
          billingType: body.billingType,
          status: isCreditCard ? 'CONFIRMED' : 'PENDING',
          dueDate: body.dueDate,
          invoiceUrl: `https://sandbox.asaas.com/i/${mockPayId}`,
          externalReference: body.externalReference,
          creditCard: isCreditCard
            ? {
                creditCardNumber: body.creditCard?.number ? body.creditCard.number.slice(-4) : '1234',
                creditCardBrand: 'MASTERCARD',
              }
            : undefined,
        } as T;
      }

      return { data: [] } as T;
    }

    return {} as T;
  }

  async getOrCreateCustomer(params: {
    name: string;
    cpfCnpj: string;
    email: string;
    mobilePhone: string;
    postalCode?: string;
    address?: string;
    addressNumber?: string;
    complement?: string;
    province?: string;
  }): Promise<AsaasCustomer> {
    const cleanCpf = params.cpfCnpj.replace(/\D/g, '');

    try {
      const searchRes = await this.fetchWithRetry<{ data: AsaasCustomer[] }>(
        `/customers?cpfCnpj=${cleanCpf}`
      );
      if (searchRes.data && searchRes.data.length > 0) {
        asaasMetrics.reconciliations++;
        const customer = searchRes.data[0];
        try {
          await this.fetchWithRetry(`/customers/${customer.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              notificationDisabled: true,
              postalCode: params.postalCode ? params.postalCode.replace(/\D/g, '') : undefined,
              address: params.address,
              addressNumber: params.addressNumber,
              complement: params.complement,
              province: params.province,
            }),
          });
        } catch (_) {}
        return customer;
      }
    } catch (e) {
      console.warn('[AsaasClient] Consulta prévia de cliente falhou, prosseguindo com criação:', e);
    }

    return this.fetchWithRetry<AsaasCustomer>('/customers', {
      method: 'POST',
      body: JSON.stringify({
        name: params.name,
        cpfCnpj: cleanCpf,
        email: params.email,
        mobilePhone: params.mobilePhone.replace(/\D/g, ''),
        postalCode: params.postalCode ? params.postalCode.replace(/\D/g, '') : undefined,
        address: params.address,
        addressNumber: params.addressNumber,
        complement: params.complement,
        province: params.province,
        notificationDisabled: true,
      }),
    });
  }

  async getOrCreatePayment(params: {
    customerId: string;
    billingType: 'PIX' | 'CREDIT_CARD';
    value: number;
    protocol: string;
    description: string;
    remoteIp?: string;
    creditCard?: AsaasCreditCardInput;
    creditCardHolderInfo?: AsaasCreditCardHolderInfo;
  }): Promise<AsaasPayment> {
    if (!params.creditCard) {
      try {
        const searchRes = await this.fetchWithRetry<{ data: AsaasPayment[] }>(
          `/payments?externalReference=${params.protocol}`
        );
        if (searchRes.data && searchRes.data.length > 0) {
          asaasMetrics.reconciliations++;
          const existing = searchRes.data[0];
          console.log(`[AsaasClient] Cobrança conciliada existente encontrada para ${params.protocol}: ${existing.id}`);
          return existing;
        }
      } catch (e) {
        console.warn('[AsaasClient] Consulta prévia de cobrança falhou, criando nova:', e);
      }
    }

    const payload: Record<string, any> = {
      customer: params.customerId,
      billingType: params.billingType,
      value: params.value,
      dueDate: new Date().toISOString().slice(0, 10),
      description: params.description,
      externalReference: params.protocol,
      postalService: false,
    };

    if (params.billingType === 'CREDIT_CARD' && params.creditCard) {
      payload.creditCard = params.creditCard;
      if (params.creditCardHolderInfo) {
        payload.creditCardHolderInfo = params.creditCardHolderInfo;
      }
      if (params.remoteIp) {
        payload.remoteIp = params.remoteIp;
      }
    }

    return this.fetchWithRetry<AsaasPayment>('/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getPixQrCode(paymentId: string): Promise<AsaasPixQrCode> {
    return this.fetchWithRetry<AsaasPixQrCode>(`/payments/${paymentId}/pixQrCode`);
  }
}
