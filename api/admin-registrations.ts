// ==============================================================================
// VERCEL SERVERLESS FUNCTION: /api/admin-registrations
// Listagem paginada e otimizada de inscrições para o Painel Administrativo
// ==============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { memoryStore } from './lib/state';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();

  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const pageSize = parseInt((req.query.pageSize as string) || '20', 10);
    const search = (req.query.search as string) || '';
    const category = (req.query.category as string) || 'ALL';
    const status = (req.query.status as string) || 'ALL';

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
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
