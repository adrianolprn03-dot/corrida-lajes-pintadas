import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const uptimeSeconds = process.uptime();
  const memUsage = process.memoryUsage();

  const rawUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const rawKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SERVICE_ROLE_KEY ||
    process.env.VITE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY;
  const supaUrl = normalizeSupabaseUrl(rawUrl);
  let supaStatus = 'not_configured';

  if (supaUrl && rawKey) {
    try {
      const client = createClient(supaUrl, rawKey.trim().replace(/^["']|["']$/g, ''), {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await client.from('event_settings').select('status').limit(1);
      supaStatus = error ? `error: ${error.message}` : `connected (event status: ${data?.[0]?.status})`;
    } catch (e: any) {
      supaStatus = `exception: ${e.message}`;
    }
  }

  const asaasKey = (process.env.ASAAS_API_KEY || '').trim().replace(/^["']|["']$/g, '');
  const asaasEnv = (process.env.ASAAS_ENVIRONMENT || '').trim().replace(/^["']|["']$/g, '').toLowerCase() || 'sandbox';
  const smtpUser = (process.env.SMTP_USER || '').trim().replace(/^["']|["']$/g, '');
  const smtpHost = (process.env.SMTP_HOST || '').trim().replace(/^["']|["']$/g, '');

  return res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(uptimeSeconds),
    supabase: {
      status: supaStatus,
      url: supaUrl ? supaUrl.slice(0, 16) + '...' : null,
    },
    asaas: {
      isConfigured: Boolean(asaasKey),
      environment: asaasEnv,
      keyPrefix: asaasKey ? asaasKey.slice(0, 7) + '...' : null,
      keyLength: asaasKey.length,
    },
    email: {
      isConfigured: Boolean(smtpHost && smtpUser && process.env.SMTP_PASS),
      provider: 'HostGator SMTP',
      host: smtpHost || null,
      user: smtpUser || null,
    },
    memory: {
      rssMb: Math.round(memUsage.rss / 1024 / 1024),
      heapUsedMb: Math.round(memUsage.heapUsed / 1024 / 1024),
    },
    p95LatencyMs: memoryStore.getP95Latency(),
    activeRegistrations: memoryStore.registrations.size,
  });
}
