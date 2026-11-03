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

import type { SupabaseClient } from '@supabase/supabase-js';
import { memoryStore } from './state.js';

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

// ==============================================================================
// PERSISTÊNCIA E CONTAGEM (SOMENTE SERVIDOR)
// ==============================================================================

/** Valor base usado quando nenhum lote foi cadastrado (Lote Único). */
export const DEFAULT_BASE_PRICE_CENTS = 5000;

const AUDIT_RESOURCE = 'REGISTRATION_BATCHES';
const ACTIVE_STATUSES = ['CONFIRMED', 'RESERVED', 'IN_REVIEW'];

/**
 * Lê os lotes cadastrados.
 * 1º coluna event_settings.registration_batches (migração supabase/migration_lotes.sql);
 * 2º último registro em audit_logs (funciona mesmo antes da migração).
 */
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

  // Coluna dedicada (ignora erro caso a migração ainda não tenha sido executada)
  await supabase
    .from('event_settings')
    .update({ registration_batches: clean, updated_at: new Date().toISOString() })
    .eq('is_singleton', true);

  // Trilha de auditoria + fallback de leitura
  const { error } = await supabase.from('audit_logs').insert({
    actor_id: actor || 'ADMIN',
    action: 'UPDATE_BATCHES',
    resource_type: AUDIT_RESOURCE,
    details: { batches: clean },
  });
  if (error) throw new Error(`Não foi possível salvar os lotes: ${error.message}`);

  return clean;
}

/** Conta inscrições ativas (confirmadas + reservas não expiradas) por lote. */
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
      // Coluna batch_id ainda não existe: usa o marcador no kit_notes
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
