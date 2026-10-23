// ==============================================================================
// VERCEL SERVERLESS FUNCTION: /api/admin/settings
// Atualização e leitura segura de configurações do evento via Service Role
// ==============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
    return createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabase();

  if (req.method === 'POST') {
    const updates = req.body || {};

    if (supabase) {
      try {
        const dbUpdates: any = { updated_at: new Date().toISOString() };
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.maxCapacity !== undefined) dbUpdates.max_capacity = updates.maxCapacity;
        if (updates.localMaxCapacity !== undefined) dbUpdates.local_max_capacity = updates.localMaxCapacity;
        if (updates.visitorMaxCapacity !== undefined) dbUpdates.visitor_max_capacity = updates.visitorMaxCapacity;
        if (updates.minAge !== undefined) dbUpdates.min_age = updates.minAge;
        if (updates.minorRules !== undefined) dbUpdates.minor_rules = updates.minorRules;
        if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
        if (updates.startLocation !== undefined) dbUpdates.start_location = updates.startLocation;
        if (updates.registrationStartDate !== undefined) dbUpdates.registration_start_date = updates.registrationStartDate;
        if (updates.registrationEndDate !== undefined) dbUpdates.registration_end_date = updates.registrationEndDate;
        if (updates.kitPickupInfo !== undefined) dbUpdates.kit_pickup_info = updates.kitPickupInfo;
        if (updates.cancellationPolicy !== undefined) dbUpdates.cancellation_policy = updates.cancellationPolicy;
        if (updates.organizerName !== undefined) dbUpdates.organizer_name = updates.organizerName;
        if (updates.organizerContact !== undefined) dbUpdates.organizer_contact = updates.organizerContact;
        if (updates.revenueResponsible !== undefined) dbUpdates.revenue_responsible = updates.revenueResponsible;
        if (updates.asaasEnvironment !== undefined) dbUpdates.asaas_environment = updates.asaasEnvironment;
        if (updates.asaasPixFixedFeeCents !== undefined) dbUpdates.asaas_pix_fixed_fee_cents = updates.asaasPixFixedFeeCents;
        if (updates.asaasCreditFixedFeeCents !== undefined) dbUpdates.asaas_credit_fixed_fee_cents = updates.asaasCreditFixedFeeCents;
        if (updates.asaasCreditPercentFee !== undefined) dbUpdates.asaas_credit_percent_fee = updates.asaasCreditPercentFee;
        if (updates.termsContent !== undefined) dbUpdates.terms_content = updates.termsContent;
        if (updates.privacyContent !== undefined) dbUpdates.privacy_content = updates.privacyContent;

        let { error } = await supabase
          .from('event_settings')
          .update(dbUpdates)
          .eq('is_singleton', true);

        // Se colunas de cota ainda não existirem na tabela event_settings do Postgres, salvar via audit_logs
        if (error && (error.message.includes('local_max_capacity') || error.message.includes('visitor_max_capacity') || error.code === 'PGRST204')) {
          const fallbackUpdates = { ...dbUpdates };
          delete fallbackUpdates.local_max_capacity;
          delete fallbackUpdates.visitor_max_capacity;

          const retryRes = await supabase
            .from('event_settings')
            .update(fallbackUpdates)
            .eq('is_singleton', true);

          if (retryRes.error) {
            return res.status(500).json({ error: retryRes.error.message });
          }

          // Persistir cotas no banco via audit_logs
          try {
            await supabase.from('audit_logs').insert({
              actor_id: 'ADMIN',
              action: 'UPDATE_QUOTAS',
              resource_type: 'CATEGORY_QUOTAS',
              details: {
                localMaxCapacity: updates.localMaxCapacity,
                visitorMaxCapacity: updates.visitorMaxCapacity,
              },
            });
          } catch {}
          error = null;
        }

        if (error) {
          return res.status(500).json({ error: error.message });
        }
        return res.status(200).json({ success: true });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }

    return res.status(200).json({ success: true, localOnly: true });
  }

  // GET: Obter configurações direto do Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('event_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      // Se status for PREPARATION no banco, auto-atualizar para OPEN
      if (data && data.status === 'PREPARATION') {
        await supabase
          .from('event_settings')
          .update({ status: 'OPEN', updated_at: new Date().toISOString() })
          .eq('is_singleton', true);
        data.status = 'OPEN';
      }

      // Se cotas não vierem na tabela event_settings, carregar do audit_logs
      if (data) {
        if (data.local_max_capacity === undefined || data.local_max_capacity === null) {
          try {
            const { data: quotaLogs } = await supabase
              .from('audit_logs')
              .select('details')
              .eq('resource_type', 'CATEGORY_QUOTAS')
              .order('created_at', { ascending: false })
              .limit(1);
            if (quotaLogs && quotaLogs.length > 0 && quotaLogs[0].details) {
              data.local_max_capacity = quotaLogs[0].details.localMaxCapacity;
              data.visitor_max_capacity = quotaLogs[0].details.visitorMaxCapacity;
            }
          } catch {}
        }
        if (data.local_max_capacity === undefined || data.local_max_capacity === null) {
          data.local_max_capacity = data.max_capacity ? Math.floor(data.max_capacity / 2) : 350;
          data.visitor_max_capacity = data.max_capacity ? Math.ceil(data.max_capacity / 2) : 350;
        }
      }

      return res.status(200).json({ settings: data });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(200).json({ settings: null });
}
