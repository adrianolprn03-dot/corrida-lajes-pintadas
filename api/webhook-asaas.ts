// ==============================================================================
// VERCEL SERVERLESS FUNCTION: /api/webhook-asaas
// Endpoint de recebimento com validação de token, idempotência estrita
// e proteção contra eventos fora de ordem
// ==============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { memoryStore } from './lib/state.js';
import { sendConfirmationEmail } from './lib/email.js';

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
    const supabase = getSupabase();

    if (supabase) {
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

    // 4. Disparar e-mail institucional oficial de confirmação se o pagamento foi concluído
    if (['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED', 'CHECKOUT_PAID'].includes(eventType)) {
      try {
        let athleteData: any = null;
        let regId: string | null = null;
        let alreadySentInDb = false;

        // Buscar dados da inscrição na memória ou no Supabase
        const targetProtocol = payment.externalReference;
        const memoryReg = targetProtocol ? memoryStore.registrations.get(targetProtocol) : null;

        if (memoryReg) {
          const memIsPcd = Boolean(
            memoryReg.isPcd || 
            memoryReg.originType === 'PCD' || 
            memoryReg.category?.includes('PCD') ||
            (memoryReg.totalAmountCents && memoryReg.totalAmountCents <= 3000)
          );

          athleteData = {
            athleteName: memoryReg.fullName || 'Atleta',
            athleteEmail: memoryReg.email,
            athleteCpf: memoryReg.cpf || '',
            protocol: memoryReg.protocol,
            accessCode: memoryReg.accessCode,
            category: memIsPcd 
              ? (memoryReg.gender === 'FEMININO' ? 'PCD_FEMININO' : 'PCD_MASCULINO')
              : memoryReg.category,
            originType: memoryReg.originType || (memIsPcd ? 'PCD' : undefined),
            gender: memoryReg.gender,
            shirtSize: memoryReg.shirtSize,
            status: 'CONFIRMED',
            paymentMethod: memoryReg.paymentMethod || payment.billingType || 'PIX',
            totalAmountCents: memoryReg.totalAmountCents || (memIsPcd ? 2750 : 5500),
            baseAmountCents: memoryReg.baseAmountCents || (memIsPcd ? 2500 : 5000),
            feeCents: memoryReg.feeCents || (memIsPcd ? 250 : 500),
            isPcd: memIsPcd,
            pcdType: memoryReg.pcdType,
            pcdCid: memoryReg.pcdCid,
            hasGuide: memoryReg.hasGuide,
            guideName: memoryReg.guideName,
            guideCpf: memoryReg.guideCpf,
            guidePhone: memoryReg.guidePhone,
            guideShirtSize: memoryReg.guideShirtSize,
          };

          if (memoryReg.hasGuide && memoryReg.guideShirtSize) {
            const guideShirt = memoryStore.shirts.get(memoryReg.guideShirtSize);
            if (guideShirt) {
              if (guideShirt.reservedCount > 0) guideShirt.reservedCount--;
              guideShirt.confirmedCount++;
            }
          }
        }

        if (supabase) {
          let regQuery = supabase
            .from('registrations')
            .select(`
              id,
              protocol,
              category,
              origin_type,
              gender,
              shirt_size,
              kit_notes,
              status,
              financial_status,
              total_amount_cents,
              base_amount_cents,
              processing_fee_cents,
              payment_method,
              athletes (
                full_name,
                email,
                cpf
              )
            `);

          if (targetProtocol) {
            regQuery = regQuery.or(`asaas_payment_id.eq.${payment.id},protocol.eq.${targetProtocol}`);
          } else {
            regQuery = regQuery.eq('asaas_payment_id', payment.id);
          }

          const { data: reg } = await regQuery.maybeSingle();

          if (reg) {
            regId = reg.id;
            const rawNotes = typeof reg.kit_notes === 'string' ? reg.kit_notes : '';
            if (rawNotes.includes('CONFIRMATION_EMAIL_SENT:true')) {
              alreadySentInDb = true;
            } else {
              const sendingMatch = rawNotes.match(/EMAIL_SENDING:(\d+)/);
              if (sendingMatch && Date.now() - Number(sendingMatch[1]) < 20000) {
                alreadySentInDb = true;
              }
            }

            // Garantir confirmação explícita no banco caso a RPC não tenha localizado por payment_id ou tenha divergência de lote/PCD
            if (reg.status !== 'CONFIRMED') {
              try {
                const nowIso = new Date().toISOString();
                if (reg.shirt_size && (reg.status === 'RESERVED' || reg.status === 'IN_REVIEW')) {
                  const { data: sInv } = await supabase
                    .from('shirt_inventory')
                    .select('reserved_count, confirmed_count')
                    .eq('size', reg.shirt_size)
                    .maybeSingle();
                  if (sInv) {
                    await supabase
                      .from('shirt_inventory')
                      .update({
                        reserved_count: Math.max(0, (sInv.reserved_count || 0) - 1),
                        confirmed_count: (sInv.confirmed_count || 0) + 1,
                        updated_at: nowIso,
                      })
                      .eq('size', reg.shirt_size);
                  }
                }

                await supabase
                  .from('registrations')
                  .update({
                    status: 'CONFIRMED',
                    financial_status: eventType === 'PAYMENT_RECEIVED' ? 'RECEIVED' : 'CONFIRMED',
                    paid_at: nowIso,
                    asaas_payment_id: payment.id,
                    updated_at: nowIso,
                  })
                  .eq('id', reg.id);
              } catch (confirmFallbackErr) {
                console.warn('[Webhook] Aviso ao confirmar inscrição via fallback:', confirmFallbackErr);
              }
            }

            let pcdMeta: any = null;
            if (reg.kit_notes && typeof reg.kit_notes === 'string') {
              const matchPcd = reg.kit_notes.match(/PCD_META:(\{.*?\})/);
              if (matchPcd) {
                try {
                  pcdMeta = JSON.parse(matchPcd[1]);
                } catch {}
              }
            }

            if (!pcdMeta && memoryReg && memoryReg.isPcd) {
              pcdMeta = {
                isPcd: true,
                pcdType: memoryReg.pcdType,
                pcdCid: memoryReg.pcdCid,
                hasGuide: memoryReg.hasGuide,
                guideName: memoryReg.guideName,
                guideCpf: memoryReg.guideCpf,
                guidePhone: memoryReg.guidePhone,
                guideShirtSize: memoryReg.guideShirtSize,
              };
            }

            const isPcd = Boolean(
              pcdMeta?.isPcd ||
              reg.origin_type === 'PCD' ||
              reg.category?.includes('PCD') ||
              (reg.total_amount_cents && reg.total_amount_cents <= 3000)
            );

            if (pcdMeta?.hasGuide && pcdMeta?.guideShirtSize) {
              try {
                const { data: gInv } = await supabase
                  .from('shirt_inventory')
                  .select('reserved_count, confirmed_count')
                  .eq('size', pcdMeta.guideShirtSize)
                  .maybeSingle();

                if (gInv) {
                  const newRes = Math.max(0, (gInv.reserved_count || 0) - 1);
                  const newConf = (gInv.confirmed_count || 0) + 1;
                  await supabase
                    .from('shirt_inventory')
                    .update({
                      reserved_count: newRes,
                      confirmed_count: newConf,
                      updated_at: new Date().toISOString(),
                    })
                    .eq('size', pcdMeta.guideShirtSize);
                }
              } catch (gErr) {
                console.warn('[Webhook] Aviso ao atualizar estoque camiseta do guia no Supabase:', gErr);
              }
            }

            if (reg.athletes && !athleteData) {
              const athlete = Array.isArray(reg.athletes) ? reg.athletes[0] : reg.athletes;
              let accessCode: string | undefined = undefined;
              if (reg.kit_notes && typeof reg.kit_notes === 'string') {
                const match = reg.kit_notes.match(/ACCESS_CODE:([A-Za-z0-9]+)/);
                if (match) accessCode = match[1];
              }
              if (!accessCode && memoryReg) {
                accessCode = memoryReg.accessCode;
              }

              const resolvedCategory = isPcd 
                ? (reg.gender === 'FEMININO' ? 'PCD_FEMININO' : 'PCD_MASCULINO')
                : reg.category;

              const totalAmountCents = reg.total_amount_cents || (payment.value ? Math.round(payment.value * 100) : (isPcd ? 2750 : 5500));
              const baseAmountCents = reg.base_amount_cents || (isPcd ? 2500 : 5000);
              const feeCents = reg.processing_fee_cents || (isPcd ? 250 : 500);
              const paymentMethod = reg.payment_method || payment.billingType || 'PIX';

              athleteData = {
                athleteName: athlete?.full_name || 'Atleta',
                athleteEmail: athlete?.email,
                athleteCpf: athlete?.cpf || '',
                protocol: reg.protocol,
                accessCode,
                category: resolvedCategory,
                originType: reg.origin_type || (isPcd ? 'PCD' : undefined),
                gender: reg.gender,
                shirtSize: reg.shirt_size,
                status: 'CONFIRMED',
                paymentMethod,
                totalAmountCents,
                baseAmountCents,
                feeCents,
                isPcd,
                pcdType: pcdMeta?.pcdType,
                pcdCid: pcdMeta?.pcdCid,
                hasGuide: Boolean(pcdMeta?.hasGuide),
                guideName: pcdMeta?.guideName,
                guideCpf: pcdMeta?.guideCpf,
                guidePhone: pcdMeta?.guidePhone,
                guideShirtSize: pcdMeta?.guideShirtSize,
              };
            }
          }
        }

        const alreadySentInMemory = Boolean(memoryReg?.confirmationEmailSent);

        if (!alreadySentInDb && !alreadySentInMemory && athleteData && athleteData.athleteEmail) {
          try {
            if (supabase && regId) {
              const { data: preReg } = await supabase
                .from('registrations')
                .select('kit_notes')
                .eq('id', regId)
                .single();
              const preNotes = preReg?.kit_notes || '';
              if (preNotes.includes('CONFIRMATION_EMAIL_SENT:true')) {
                return res.status(200).json({
                  success: true,
                  action: memResult.action,
                  processedInMs: Date.now() - startTime,
                });
              }
              const cleanPreNotes = preNotes.replace(/\|?EMAIL_SENDING:\d+/g, '');
              await supabase
                .from('registrations')
                .update({
                  kit_notes: cleanPreNotes ? `${cleanPreNotes}|EMAIL_SENDING:${Date.now()}` : `EMAIL_SENDING:${Date.now()}`,
                })
                .eq('id', regId);
            }

            const emailSent = await sendConfirmationEmail(athleteData);

            if (emailSent) {
              console.log(`[Webhook] E-mail institucional de confirmação enviado com sucesso para ${athleteData.athleteEmail}`);
              if (memoryReg) {
                memoryReg.confirmationEmailSent = true;
              }
              if (supabase && regId) {
                const { data: existingReg } = await supabase
                  .from('registrations')
                  .select('kit_notes')
                  .eq('id', regId)
                  .single();

                const currentNotes = (existingReg?.kit_notes || '').replace(/\|?EMAIL_SENDING:\d+/g, '');
                if (!currentNotes.includes('CONFIRMATION_EMAIL_SENT:true')) {
                  await supabase
                    .from('registrations')
                    .update({
                      kit_notes: currentNotes ? `${currentNotes}|CONFIRMATION_EMAIL_SENT:true` : 'CONFIRMATION_EMAIL_SENT:true',
                      updated_at: new Date().toISOString(),
                    })
                    .eq('id', regId);
                }
              }
            } else {
              console.warn(`[Webhook] Envio de e-mail para ${athleteData.athleteEmail} retornou false; liberando lock para retentativa automática.`);
              if (supabase && regId) {
                const { data: existingReg } = await supabase
                  .from('registrations')
                  .select('kit_notes')
                  .eq('id', regId)
                  .single();
                const cleanNotes = (existingReg?.kit_notes || '').replace(/\|?EMAIL_SENDING:\d+/g, '');
                await supabase
                  .from('registrations')
                  .update({ kit_notes: cleanNotes })
                  .eq('id', regId);
              }
            }
          } catch (e) {
            console.error('[Webhook] Falha no disparo de e-mail institucional:', e);
          }
        } else if (alreadySentInDb || alreadySentInMemory) {
          console.log(`[Webhook] E-mail institucional já havia sido enviado para ${payment.externalReference || payment.id}, pulando envio duplicado.`);
        }
      } catch (emailErr) {
        console.warn('[Webhook] Falha ao coletar dados para envio de e-mail:', emailErr);
      }
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
