// ==============================================================================
// VERCEL SERVERLESS FUNCTION: /api/admin-registrations
// Listagem paginada e otimizada de inscrições para o Painel Administrativo
// ==============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { memoryStore } from './lib/state.js';
import { sendConfirmationEmail, isEmailConfigured } from './lib/email.js';

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
  const supabase = getSupabase();

  try {
    // 1.0 Reenvio de e-mail com protocolo e código de acesso
    if (req.method === 'POST' && req.body?.action === 'resend-email') {
      if (!isEmailConfigured()) {
        return res.status(503).json({ error: 'Servidor de e-mail SMTP não está configurado.' });
      }

      const { athleteName, athleteEmail, athleteCpf, protocol, accessCode, category, gender, shirtSize, status } = req.body;
      if (!athleteEmail || !protocol || !accessCode) {
        return res.status(400).json({ error: 'E-mail, protocolo e código de acesso são obrigatórios.' });
      }

      const success = await sendConfirmationEmail({
        athleteName: athleteName || 'Atleta',
        athleteEmail: athleteEmail.trim().toLowerCase(),
        athleteCpf: athleteCpf || '',
        protocol: protocol.trim().toUpperCase(),
        accessCode: accessCode.trim().toUpperCase(),
        category: category || 'GERAL',
        gender: gender || 'MASCULINO',
        shirtSize: shirtSize || 'M',
        status: status === 'RESERVED' ? 'RESERVED' : 'CONFIRMED',
      });

      if (success) {
        return res.status(200).json({ success: true, message: `E-mail enviado com sucesso para ${athleteEmail}!` });
      } else {
        return res.status(500).json({ error: 'Falha ao disparar e-mail pelo servidor SMTP.' });
      }
    }

    // 1. DELETE: Excluir ou cancelar inscrição específica ou limpar testes
    if (req.method === 'DELETE' || (req.method === 'POST' && req.body?.action === 'delete')) {
      const id = (req.query.id as string) || req.body?.id;
      const protocol = (req.query.protocol as string) || req.body?.protocol;
      const action = req.body?.action || req.query.action;

      if (action === 'clear-tests') {
        if (supabase) {
          // Deletar inscrições de teste em estado RESERVED
          const { data: testRegs } = await supabase
            .from('registrations')
            .select('id, shirt_size, status')
            .eq('status', 'RESERVED');

          if (testRegs && testRegs.length > 0) {
            for (const tr of testRegs) {
              await supabase.from('registrations').delete().eq('id', tr.id);
              // Devolver estoque
              if (tr.shirt_size) {
                const { data: stock } = await supabase
                  .from('shirt_inventory')
                  .select('reserved_count')
                  .eq('size', tr.shirt_size)
                  .single();
                if (stock) {
                  await supabase
                    .from('shirt_inventory')
                    .update({
                      reserved_count: Math.max(0, stock.reserved_count - 1),
                      updated_at: new Date().toISOString(),
                    })
                    .eq('size', tr.shirt_size);
                }
              }
            }
          }
          return res.status(200).json({ success: true, cleared: testRegs?.length || 0 });
        }
        return res.status(200).json({ success: true, cleared: 0 });
      }

      if (!id && !protocol) {
        return res.status(400).json({ error: 'ID ou Protocolo da inscrição é obrigatório para exclusão.' });
      }

      if (supabase) {
        // Obter inscrição para devolver estoque se pendente
        let findQuery = supabase.from('registrations').select('id, shirt_size, status');
        if (id) findQuery = findQuery.eq('id', id);
        else if (protocol) findQuery = findQuery.eq('protocol', protocol);

        const { data: foundReg } = await findQuery.single();

        let delQuery = supabase.from('registrations').delete();
        if (id) delQuery = delQuery.eq('id', id);
        else if (protocol) delQuery = delQuery.eq('protocol', protocol);

        const { error: delErr } = await delQuery;
        if (delErr) throw delErr;

        if (foundReg && foundReg.status === 'RESERVED' && foundReg.shirt_size) {
          const { data: stock } = await supabase
            .from('shirt_inventory')
            .select('reserved_count')
            .eq('size', foundReg.shirt_size)
            .single();
          if (stock) {
            await supabase
              .from('shirt_inventory')
              .update({
                reserved_count: Math.max(0, stock.reserved_count - 1),
                updated_at: new Date().toISOString(),
              })
              .eq('size', foundReg.shirt_size);
          }
        }

        return res.status(200).json({ success: true, message: 'Inscrição removida com sucesso.' });
      }

      // MemoryStore fallback
      if (protocol) memoryStore.registrations.delete(protocol);
      return res.status(200).json({ success: true, message: 'Inscrição removida da memória.' });
    }

    // 2. GET: Listar inscrições com paginação e busca robusta
    const page = parseInt((req.query.page as string) || '1', 10);
    const pageSize = parseInt((req.query.pageSize as string) || '20', 10);
    const search = ((req.query.search as string) || '').trim();
    const category = (req.query.category as string) || 'ALL';
    const status = (req.query.status as string) || 'ALL';

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
        // Buscar atletas com match em nome ou CPF
        const { data: matchedAthletes } = await supabase
          .from('athletes')
          .select('id')
          .or(`full_name.ilike.%${search}%,cpf.ilike.%${search}%`);

        const athleteIds = (matchedAthletes || []).map((a) => a.id);
        if (athleteIds.length > 0) {
          query = query.or(`protocol.ilike.%${search}%,athlete_id.in.(${athleteIds.join(',')})`);
        } else {
          query = query.ilike('protocol', `%${search}%`);
        }
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
    return res.status(500).json({ error: err.message || 'Erro ao processar inscrições' });
  }
}
