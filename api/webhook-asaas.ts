// ==============================================================================
// VERCEL SERVERLESS FUNCTION: /api/webhook-asaas
// Endpoint de recebimento com validação de token, idempotência estrita
// e proteção contra eventos fora de ordem
// ==============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { memoryStore } from './lib/state';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Validação do Token de Autenticação do Webhook
    const expectedToken = process.env.ASAAS_WEBHOOK_SECRET;
    const incomingToken = req.headers['asaas-access-token'] as string;

    if (expectedToken && incomingToken !== expectedToken) {
      console.warn('[Webhook] Tentativa de webhook com token inválido.');
      return res.status(401).json({ error: 'Unauthorized webhook token' });
    }

    const payload = req.body;
    const eventType = payload?.event;
    const payment = payload?.payment;

    if (!eventType || !payment) {
      return res.status(400).json({ error: 'Invalid Asaas webhook payload' });
    }

    // 2. Atualizar no motor em memória (idempotente e imune a desordem)
    const memResult = await memoryStore.processWebhookEvent({
      event: eventType,
      payment: {
        id: payment.id,
        externalReference: payment.externalReference,
        status: payment.status,
        value: payment.value,
        netValue: payment.netValue,
      },
    });

    // 3. Atualizar no Supabase caso configurado
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const valueCents = Math.round(payment.value * 100);
      const netValueCents = payment.netValue ? Math.round(payment.netValue * 100) : null;

      await supabase.rpc('process_asaas_webhook_event', {
        p_event_type: eventType,
        p_payment_id: payment.id,
        p_status: payment.status,
        p_value_cents: valueCents,
        p_net_value_cents: netValueCents,
        p_payload: payload,
      });
    }

    const durationMs = Date.now() - startTime;
    memoryStore.recordLatency(durationMs);

    return res.status(200).json({
      success: true,
      action: memResult.action,
      processedInMs: durationMs,
    });
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    memoryStore.recordLatency(durationMs);
    console.error('[Webhook] Erro:', err.message);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
