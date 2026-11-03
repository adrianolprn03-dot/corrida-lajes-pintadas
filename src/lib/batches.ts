// ==============================================================================
// LOTES DE INSCRIÇÃO (REGRAS PURAS, SEM DEPENDÊNCIAS)
// ------------------------------------------------------------------------------
// ATENÇÃO: este arquivo existe em DUAS cópias idênticas na parte de regras puras:
//   - src/lib/batches.ts  (frontend)
//   - api/lib/batches.ts  (funções serverless da Vercel, + persistência)
// Ao alterar a regra de virada de lote ou de preço, altere as duas.
//
// Regra de virada: os lotes são sequenciais (na ordem cadastrada). O lote vigente
// é o primeiro que ainda NÃO atingiu a data final e NÃO esgotou as vagas — o que
// acontecer primeiro encerra o lote e abre automaticamente o próximo.
//
// Preço: valor base do lote vigente + taxa de serviço de 10%.
// PCD / Inclusão paga 50% do valor base do lote vigente (+ 10% de taxa).
// ==============================================================================

export interface RegistrationBatch {
  id: string;
  name: string;
  basePriceCents: number;
  /** Data/hora final do lote (ISO 8601). null = sem data final. */
  endAt: string | null;
  /** Quantidade de vagas do lote. null = sem limite de vagas. */
  capacity: number | null;
}

export type BatchStatus = 'ENDED' | 'SOLD_OUT' | 'ACTIVE' | 'UPCOMING';

export interface ResolvedBatch extends RegistrationBatch {
  position: number; // 1, 2, 3...
  soldCount: number;
  remaining: number | null;
  status: BatchStatus;
}

export interface BatchState {
  /** true quando há pelo menos um lote cadastrado */
  configured: boolean;
  batches: ResolvedBatch[];
  current: ResolvedBatch | null;
  next: ResolvedBatch | null;
}

/** Inscrições sem lote (feitas antes da criação dos lotes) contam no 1º lote. */
export const LEGACY_BATCH_ID = '__sem_lote__';
export const SERVICE_FEE_PERCENT = 0.1;
export const MAX_BATCHES = 20;

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

/** Extrai o lote gravado na inscrição (coluna batch_id ou marcador BATCH: no kit_notes). */
export function extractBatchId(row: { batch_id?: string | null; kit_notes?: string | null }): string {
  if (row.batch_id) return row.batch_id;
  const match = typeof row.kit_notes === 'string' ? row.kit_notes.match(/BATCH:([A-Za-z0-9_-]+)/) : null;
  return match ? match[1] : LEGACY_BATCH_ID;
}

