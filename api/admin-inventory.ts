// ==============================================================================
// VERCEL SERVERLESS FUNCTION: /api/admin/inventory
// Atualização e leitura segura de estoque de camisas no Supabase via Service Role
// ==============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configuração CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY || process.env.VITE_SERVICE_ROLE_KEY;

  if (req.method === 'POST') {
    const { size, totalStock, items } = req.body || {};

    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Atualização em lote (batch)
        if (Array.isArray(items) && items.length > 0) {
          for (const item of items) {
            if (item.size && typeof item.totalStock === 'number') {
              await supabase
                .from('shirt_inventory')
                .update({ total_stock: item.totalStock, updated_at: new Date().toISOString() })
                .eq('size', item.size);
            }
          }
          return res.status(200).json({ success: true, count: items.length });
        }

        // Atualização individual
        if (!size || typeof totalStock !== 'number') {
          return res.status(400).json({ error: 'Campos "size" e "totalStock" são obrigatórios.' });
        }

        const { error } = await supabase
          .from('shirt_inventory')
          .update({ total_stock: totalStock, updated_at: new Date().toISOString() })
          .eq('size', size);

        if (error) {
          return res.status(500).json({ error: error.message });
        }
        return res.status(200).json({ success: true, size, totalStock });
      } catch (err: any) {
        return res.status(500).json({ error: err.message || 'Erro ao atualizar estoque no banco.' });
      }
    }

    return res.status(200).json({ success: true, localOnly: true });
  }

  // GET: Obter estoque direto do Supabase via Service Role
  if (supabaseUrl && supabaseServiceKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data, error } = await supabase
        .from('shirt_inventory')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      if (data && data.length > 0) {
        // Se todas as camisas estiverem com total_stock === 0 (como inserido no schema inicial)
        const allZero = data.every((d) => (d.total_stock || 0) === 0);
        if (allZero) {
          // Auto-inicializar com 10 unidades para cada tamanho (conforme configurado pela organização no painel)
          for (const row of data) {
            await supabase
              .from('shirt_inventory')
              .update({ total_stock: 10, updated_at: new Date().toISOString() })
              .eq('id', row.id);
          }

          const { data: refreshed } = await supabase
            .from('shirt_inventory')
            .select('*')
            .order('display_order', { ascending: true });

          return res.status(200).json({ items: refreshed || data });
        }

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
