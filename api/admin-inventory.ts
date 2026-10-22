// ==============================================================================
// VERCEL SERVERLESS FUNCTION: /api/admin/inventory
// Atualização e leitura segura de estoque de camisas no Supabase via Service Role
// ==============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { memoryStore } from './lib/state.js';

function normalizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim().replace(/^["']|["']$/g, '');

  const dashboardMatch = url.match(/supabase\.com\/dashboard\/project\/([a-z0-9_-]+)/i);
  if (dashboardMatch) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

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
    return createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configuração CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabase();

  if (req.method === 'POST') {
    const { size, totalStock, items, action } = req.body || {};

    // 1. Ação de Reconciliação / Auditoria do Estoque Real
    if (action === 'reconcile') {
      if (supabase) {
        try {
          const { data: allRegs, error: regErr } = await supabase
            .from('registrations')
            .select('shirt_size, status, reservation_expires_at');

          if (regErr) throw regErr;

          const now = new Date();
          const counts: Record<string, { reserved: number; confirmed: number }> = {
            PP: { reserved: 0, confirmed: 0 },
            P: { reserved: 0, confirmed: 0 },
            M: { reserved: 0, confirmed: 0 },
            G: { reserved: 0, confirmed: 0 },
            GG: { reserved: 0, confirmed: 0 },
            XG: { reserved: 0, confirmed: 0 },
          };

          if (allRegs) {
            for (const reg of allRegs) {
              const sz = reg.shirt_size || 'M';
              if (!counts[sz]) counts[sz] = { reserved: 0, confirmed: 0 };
              if (reg.status === 'CONFIRMED') {
                counts[sz].confirmed++;
              } else if (reg.status === 'RESERVED') {
                const notExpired = !reg.reservation_expires_at || new Date(reg.reservation_expires_at) > now;
                if (notExpired) {
                  counts[sz].reserved++;
                }
              }
            }
          }

          for (const [s, c] of Object.entries(counts)) {
            await supabase
              .from('shirt_inventory')
              .update({
                reserved_count: c.reserved,
                confirmed_count: c.confirmed,
                updated_at: new Date().toISOString(),
              })
              .eq('size', s);

            const mem = memoryStore.shirts.get(s);
            if (mem) {
              mem.reservedCount = c.reserved;
              mem.confirmedCount = c.confirmed;
            }
          }

          const { data: updatedList } = await supabase
            .from('shirt_inventory')
            .select('*')
            .order('display_order', { ascending: true });

          return res.status(200).json({ 
            success: true, 
            message: 'Estoque auditado e sincronizado com sucesso com as inscrições do banco!', 
            items: updatedList 
          });
        } catch (recErr: any) {
          return res.status(500).json({ error: recErr.message || 'Erro ao reconciliar estoque.' });
        }
      }
      return res.status(200).json({ success: true, localOnly: true });
    }

    if (supabase) {
      try {
        // 2. Atualização em lote (batch)
        if (Array.isArray(items) && items.length > 0) {
          for (const item of items) {
            if (item.size && typeof item.totalStock === 'number') {
              const updateData: any = {
                total_stock: item.totalStock,
                updated_at: new Date().toISOString(),
              };
              if (typeof item.isActive === 'boolean') updateData.is_active = item.isActive;

              await supabase
                .from('shirt_inventory')
                .update(updateData)
                .eq('size', item.size);

              const mem = memoryStore.shirts.get(item.size);
              if (mem) {
                mem.totalStock = item.totalStock;
              }
            }
          }

          const { data: freshList } = await supabase
            .from('shirt_inventory')
            .select('*')
            .order('display_order', { ascending: true });

          return res.status(200).json({ success: true, count: items.length, items: freshList });
        }

        // 3. Atualização individual
        if (!size || typeof totalStock !== 'number') {
          return res.status(400).json({ error: 'Campos "size" e "totalStock" são obrigatórios.' });
        }

        const updateData: any = {
          total_stock: totalStock,
          updated_at: new Date().toISOString(),
        };
        if (typeof req.body?.isActive === 'boolean') updateData.is_active = req.body.isActive;

        const { error } = await supabase
          .from('shirt_inventory')
          .update(updateData)
          .eq('size', size);

        if (error) {
          return res.status(500).json({ error: error.message });
        }

        const mem = memoryStore.shirts.get(size);
        if (mem) {
          mem.totalStock = totalStock;
        }

        const { data: freshList } = await supabase
          .from('shirt_inventory')
          .select('*')
          .order('display_order', { ascending: true });

        return res.status(200).json({ success: true, size, totalStock, items: freshList });
      } catch (err: any) {
        return res.status(500).json({ error: err.message || 'Erro ao atualizar estoque no banco.' });
      }
    }

    return res.status(200).json({ success: true, localOnly: true });
  }

  // GET: Obter estoque direto do Supabase via Service Role
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('shirt_inventory')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      if (data && data.length > 0) {
        return res.status(200).json({ items: data });
      }

      return res.status(200).json({ items: data || [] });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Fallback se variáveis não estiverem configuradas
  return res.status(200).json({ items: [] });
}
