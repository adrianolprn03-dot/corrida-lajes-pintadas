// ==============================================================================
// VERCEL SERVERLESS FUNCTION: /api/lookup
// Consulta rápida de situação ao NOSSO backend, blindando o Asaas contra
// chamadas contínuas de milhares de atletas consultando status
// ==============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';
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

    // 1. Tentar busca no Supabase (fonte oficial de produção)
    const supabase = getSupabase();

    if (supabase) {
      const hash = crypto.createHash('sha256').update(cleanCode).digest('hex');

      const { data: regData } = await supabase
        .from('registrations')
        .select('*, athlete:athletes(*)')
        .eq('protocol', cleanProtocol)
        .maybeSingle();

      if (regData) {
        const notes = typeof regData.kit_notes === 'string' ? regData.kit_notes : '';
        const noteAccessMatch = notes.match(/ACCESS_CODE:([A-Za-z0-9]+)/i);
        const noteAccessCode = noteAccessMatch ? noteAccessMatch[1].toUpperCase() : null;

        const isValidCode =
          regData.access_code_hash === hash ||
          (noteAccessCode && noteAccessCode === cleanCode);

        if (!isValidCode) {
          return res.status(404).json({ error: 'Protocolo ou Código de Acesso incorreto.' });
        }

        // Conciliação em tempo real com Asaas se ainda estiver RESERVED e possuir asaas_payment_id real
        if (
          regData.status === 'RESERVED' &&
          regData.asaas_payment_id &&
          !String(regData.asaas_payment_id).startsWith('pay_mock_')
        ) {
          const asaasKey = normalizeKey(process.env.ASAAS_API_KEY || '');
          const asaasEnv = normalizeKey(process.env.ASAAS_ENVIRONMENT || '').toLowerCase();
          const baseUrl =
            asaasEnv === 'production' || asaasEnv === 'prod'
              ? 'https://api.asaas.com/v3'
              : 'https://api-sandbox.asaas.com/v3';

          if (asaasKey) {
            try {
              const payRes = await fetch(`${baseUrl}/payments/${regData.asaas_payment_id}`, {
                headers: {
                  access_token: asaasKey,
                  'User-Agent': 'Corrida-LajesPintadas-Backend/1.0',
                },
              });
              if (payRes.ok) {
                const payJson = await payRes.json();
                if (['CONFIRMED', 'RECEIVED'].includes(payJson.status)) {
                  const nowIso = new Date().toISOString();
                  regData.status = 'CONFIRMED';
                  regData.financial_status = 'CONFIRMED';
                  regData.paid_at = nowIso;

                  await supabase
                    .from('registrations')
                    .update({
                      status: 'CONFIRMED',
                      financial_status: 'CONFIRMED',
                      paid_at: nowIso,
                      updated_at: nowIso,
                    })
                    .eq('id', regData.id);

                  if (regData.shirt_size) {
                    const { data: sInv } = await supabase
                      .from('shirt_inventory')
                      .select('reserved_count, confirmed_count')
                      .eq('size', regData.shirt_size)
                      .maybeSingle();
                    if (sInv) {
                      await supabase
                        .from('shirt_inventory')
                        .update({
                          reserved_count: Math.max(0, (sInv.reserved_count || 0) - 1),
                          confirmed_count: (sInv.confirmed_count || 0) + 1,
                          updated_at: nowIso,
                        })
                        .eq('size', regData.shirt_size);
                    }
                  }

                  if (!notes.includes('CONFIRMATION_EMAIL_SENT:true') && isEmailConfigured() && regData.athlete?.email) {
                    await sendConfirmationEmail({
                      athleteName: regData.athlete.full_name || 'Atleta',
                      athleteEmail: regData.athlete.email,
                      athleteCpf: regData.athlete.cpf || '',
                      protocol: regData.protocol,
                      accessCode: cleanCode,
                      category: regData.category,
                      originType: regData.origin_type,
                      gender: regData.gender,
                      shirtSize: regData.shirt_size,
                      status: 'CONFIRMED',
                      totalAmountCents: regData.total_amount_cents,
                      baseAmountCents: regData.base_amount_cents,
                      feeCents: regData.processing_fee_cents,
                      paymentMethod: regData.payment_method,
                    }).catch(() => {});

                    await supabase
                      .from('registrations')
                      .update({
                        kit_notes: notes ? `${notes}|CONFIRMATION_EMAIL_SENT:true` : 'CONFIRMATION_EMAIL_SENT:true',
                      })
                      .eq('id', regData.id);
                  }
                }
              }
            } catch {}
          }
        }

        let pcdMeta: any = null;
        if (notes) {
          const matchPcd = notes.match(/PCD_META:(\{.*?\})/);
          if (matchPcd) {
            try {
              pcdMeta = JSON.parse(matchPcd[1]);
            } catch {}
          }
        }

        const isPcd = Boolean(
          pcdMeta?.isPcd ||
          regData.origin_type === 'PCD' ||
          (typeof regData.category === 'string' && regData.category.includes('PCD'))
        );

        const normalizedCategory = isPcd
          ? regData.gender === 'FEMININO'
            ? 'PCD_FEMININO'
            : 'PCD_MASCULINO'
          : regData.category;

        const a = regData.athlete || {};
        const cpfStr = String(a.cpf || '');
        const cpfMasked = cpfStr.length >= 11 ? `${cpfStr.slice(0, 3)}.***.***-${cpfStr.slice(9)}` : cpfStr;
        const emailParts = a.email ? String(a.email).split('@') : ['', ''];
        const emailMasked = a.email ? `${emailParts[0].slice(0, 2)}***@${emailParts[1]}` : '';

        const normalizedRegistration = {
          id: regData.id,
          athleteId: regData.athlete_id,
          protocol: regData.protocol,
          category: normalizedCategory,
          originType: isPcd ? 'PCD' : regData.origin_type,
          gender: regData.gender,
          casaProofType: regData.casa_proof_type,
          shirtSize: regData.shirt_size,
          status: regData.status,
          financialStatus: regData.financial_status,
          paymentMethod: regData.payment_method,
          baseAmountCents: regData.base_amount_cents,
          processingFeeCents: regData.processing_fee_cents,
          totalAmountCents: regData.total_amount_cents,
          asaasPaymentId: regData.asaas_payment_id,
          asaasInvoiceUrl: regData.asaas_invoice_url,
          asaasPixQrCode: regData.asaas_pix_qr_code,
          asaasPixCopyPaste: regData.asaas_pix_copy_paste,
          reservationExpiresAt: regData.reservation_expires_at,
          paidAt: regData.paid_at,
          kitDelivered: Boolean(regData.kit_delivered),
          kitDeliveredAt: regData.kit_delivered_at,
          kitDeliveredBy: regData.kit_delivered_by,
          kitNotes: regData.kit_notes,
          createdAt: regData.created_at,
          updatedAt: regData.updated_at,
          isPcd,
          pcdType: pcdMeta?.pcdType,
          pcdCid: pcdMeta?.pcdCid,
          hasGuide: Boolean(pcdMeta?.hasGuide),
          guideName: pcdMeta?.guideName || null,
          guideCpf: pcdMeta?.guideCpf || null,
          guidePhone: pcdMeta?.guidePhone || null,
          guideShirtSize: pcdMeta?.guideShirtSize || null,
        };

        const durationMs = Date.now() - startTime;
        memoryStore.recordLatency(durationMs);

        return res.status(200).json({
          registration: normalizedRegistration,
          athlete: {
            fullName: a.full_name || 'Atleta',
            cpfMasked,
            city: a.city || '',
            state: a.state || 'RN',
            team: a.team || '',
            emailMasked,
          },
          latencyMs: durationMs,
        });
      }

      return res.status(404).json({ error: 'Inscrição não encontrada ou código de acesso incorreto.' });
    }

    // 2. Fallback no motor em memória (se Supabase não configurado)
    const memReg = memoryStore.lookupByProtocol(cleanProtocol, cleanCode);
    if (memReg) {
      const durationMs = Date.now() - startTime;
      memoryStore.recordLatency(durationMs);

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

    return res.status(404).json({ error: 'Inscrição não encontrada. Verifique os dados informados.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao consultar inscrição' });
  }
}
