// ==============================================================================
// VERCEL SERVERLESS FUNCTION: /api/lookup
// Consulta rápida de situação ao NOSSO backend, blindando o Asaas contra
// chamadas contínuas de milhares de atletas consultando status
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

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const protocol = (req.query.protocol as string) || req.body?.protocol;
    const accessCode = (req.query.accessCode as string) || req.body?.accessCode;

    if (!protocol || !accessCode) {
      return res.status(400).json({ error: 'Protocolo e código de acesso são obrigatórios.' });
    }

    const cleanProtocol = protocol.trim().toUpperCase();
    const cleanCode = accessCode.trim().toUpperCase();

    // 1. Tentar busca no motor em memória (resposta em sub-milissegundos)
    const memReg = memoryStore.lookupByProtocol(cleanProtocol, cleanCode);
    if (memReg) {
      const durationMs = Date.now() - startTime;
      memoryStore.recordLatency(durationMs);

      // Mascarar PII para exibição segura
      const cpfMasked = `${memReg.cpf.slice(0, 3)}.***.***-${memReg.cpf.slice(9)}`;
      const emailParts = memReg.email.split('@');
      const emailMasked = `${emailParts[0].slice(0, 2)}***@${emailParts[1]}`;

      return res.status(200).json({
        registration: memReg,
        athlete: {
          fullName: memReg.fullName,
          cpfMasked,
          city: memReg.city,
          state: memReg.state,
          team: memReg.team,
          emailMasked,
        },
        cached: true,
        latencyMs: durationMs,
      });
    }

    // 2. Tentar busca no Supabase se configurado
    const supabase = getSupabase();

    if (supabase) {
      const { data, error } = await supabase.rpc('lookup_registration_by_protocol', {
        p_protocol: cleanProtocol,
        p_raw_access_code: cleanCode,
      });

      if (error || !data) {
        return res.status(404).json({ error: 'Inscrição não encontrada ou código incorreto.' });
      }

      const durationMs = Date.now() - startTime;
      memoryStore.recordLatency(durationMs);
      return res.status(200).json({
        registration: data.registration,
        athlete: data.athlete,
        event: data.event,
        latencyMs: durationMs,
      });
    }

    return res.status(404).json({ error: 'Inscrição não encontrada. Verifique os dados informados.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao consultar inscrição' });
  }
}
