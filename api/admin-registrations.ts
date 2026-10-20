// ==============================================================================
// VERCEL SERVERLESS FUNCTION: /api/admin-registrations
// Listagem paginada e otimizada de inscrições para o Painel Administrativo
// ==============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { memoryStore } from './lib/state.js';

function normalizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim().replace(/^["']|["']$/g, '');
  const dashboardMatch = url.match(/supabase\.com\/dashboard\/project\/([a-z0-9_-]+)/i);
  if (dashboardMatch) return `https://${dashboardMatch[1]}.supabase.co`;
  url = url.replace(/\/rest\/v1\/?$/, '');
  url = url.replace(/\/+$/, '');
  return url;
}

function normalizeKey(rawKey?: string): string {
  if (!rawKey) return '';
  return rawKey.trim().replace(/^["']|["']$/g, '');
}

function getSupabase(): SupabaseClient | null {
  const rawUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const rawKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SERVICE_ROLE_KEY ||
    process.env.VITE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;
  const url = normalizeSupabaseUrl(rawUrl);
  const key = normalizeKey(rawKey);
  if (!url || !key) return null;
  try {
    return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();

  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const pageSize = parseInt((req.query.pageSize as string) || '20', 10);
    const search = (req.query.search as string) || '';
    const category = (req.query.category as string) || 'ALL';
    const status = (req.query.status as string) || 'ALL';

    const supabase = getSupabase();

    if (supabase) {
      let query = supabase
        .from('registrations')
        .select('*, athlete:athletes(*)', { count: 'exact' });

      if (category !== 'ALL') {
        query = query.eq('category', category);
      }
      if (status !== 'ALL') {
        query = query.eq('status', status);
      }
      if (search) {
        query = query.or(`protocol.ilike.%${search}%,athlete.full_name.ilike.%${search}%`);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, count, error } = await query.range(from, to).order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const durationMs = Date.now() - startTime;
      return res.status(200).json({
        items: data || [],
        totalCount: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
        latencyMs: durationMs,
      });
    }

    // Fallback motor em memória
    const paginated = memoryStore.getPaginatedRegistrations({
      page,
      pageSize,
      search,
      category,
      status,
    });

    const durationMs = Date.now() - startTime;
    return res.status(200).json({
      ...paginated,
      latencyMs: durationMs,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao listar inscrições' });
  }
}
