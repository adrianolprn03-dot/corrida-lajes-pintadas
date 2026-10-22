// ==============================================================================
// VERCEL SERVERLESS FUNCTION: /api/create-reservation
// Processamento estrito de reservas com concorrência segura, controle de Asaas,
// conciliação prévia, proteção contra 429 e prevenção de duplicidades
// ==============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AsaasClient } from './lib/asaas.js';
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

function isValidCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11 || /^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(clean[i]) * (10 - i);
  let check = (sum * 10) % 11;
  if (check === 10 || check === 11) check = 0;
  if (check !== parseInt(clean[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(clean[i]) * (11 - i);
  check = (sum * 10) % 11;
  if (check === 10 || check === 11) check = 0;
  return check === parseInt(clean[10]);
}

function calculatePricing(paymentMethod: 'PIX' | 'CREDIT_CARD') {
  const basePriceCents = 6000; // R$ 60,00
  const feeCents = Math.round(basePriceCents * 0.10); // R$ 6,00 (10% de taxa de serviço)
  const totalAmountCents = basePriceCents + feeCents; // R$ 66,00
  return {
    baseAmountCents: basePriceCents,
    feeCents,
    totalAmountCents,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();
  let reservationResult: any = null;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      fullName,
      cpf,
      birthDate,
      email,
      phone,
      city,
      state,
      team,
      originType,
      gender,
      casaProofType,
      shirtSize,
      paymentMethod,
      idempotencyKey,
      channel,
      attendantName,
      attendantId,
      documentVerificationStatus,
      documentTypePresented,
      documentVerificationNotes,
    } = req.body;

    const registrationChannel = channel === 'PRESENCIAL_PREFEITURA' ? 'PRESENCIAL_PREFEITURA' : 'ONLINE';

    // REGRA REGIMENTAL ESTREITA: Inscrições da categoria Casa são exclusivamente presenciais na sede da Prefeitura
    if (originType === 'CASA' && registrationChannel !== 'PRESENCIAL_PREFEITURA') {
      return res.status(403).json({
        error: 'Inscrições da categoria Casa são realizadas exclusivamente de forma presencial na sede da Prefeitura de Lajes Pintadas/RN. Apresente documento de identificação e comprovação do vínculo exigido pelo regulamento.',
      });
    }

    if (registrationChannel === 'PRESENCIAL_PREFEITURA' && !attendantName) {
      return res.status(400).json({ error: 'Identificação do servidor atendente é obrigatória para inscrições presenciais.' });
    }

    // 1. Validações de entrada obrigatórias
    if (!fullName || !cpf || !birthDate || !email || !phone || !city || !state || !shirtSize || !paymentMethod) {
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    const cleanCpf = cpf.replace(/\D/g, '');
    if (!isValidCPF(cleanCpf)) {
      return res.status(400).json({ error: 'CPF inválido.' });
    }

    if (originType === 'CASA') {
      if (!casaProofType) {
        return res.status(400).json({ error: 'Declaração de vínculo obrigatória para categoria Casa.' });
      }
      if (['RESIDENTE', 'NATURAL_E_RESIDENTE'].includes(casaProofType)) {
        if (city.trim().toLowerCase() !== 'lajes pintadas' || state.trim().toUpperCase() !== 'RN') {
          return res.status(400).json({ error: 'Residentes em Lajes Pintadas devem informar Cidade: Lajes Pintadas e UF: RN.' });
        }
      }
    }

    // 2. Preço calculado de forma imutável no backend
    const pricing = calculatePricing(paymentMethod);

    // 3. Inicializar AsaasClient com tratamento de rate-limit (429), conciliação e backoff
    const asaasApiKey = normalizeKey(process.env.ASAAS_API_KEY || '');
    const asaasEnvRaw = normalizeKey(process.env.ASAAS_ENVIRONMENT || '').toLowerCase();
    const isProd = asaasEnvRaw === 'production' || asaasEnvRaw === 'prod';
    const isSandboxKey = asaasApiKey && !asaasApiKey.startsWith('$aact_prod_');
    const asaasEnv = isProd 
      ? 'production' 
      : (isSandboxKey ? 'sandbox' : 'mock');

    const asaasClient = new AsaasClient({
      apiKey: isProd || isSandboxKey ? asaasApiKey : '',
      environment: asaasEnv,
      maxRetries: 3,
      baseDelayMs: 300,
    });

    // 4. Executar Reserva Transacional Atômica
    const supabase = getSupabase();

    if (supabase) {
      // 4.1 Via Supabase RPC com SELECT FOR UPDATE no PostgreSQL
      const { data, error } = await supabase.rpc('create_registration_reservation', {
        p_full_name: fullName,
        p_cpf: cleanCpf,
        p_birth_date: birthDate,
        p_email: email,
        p_phone: phone,
        p_city: city,
        p_state: state,
        p_team: team || null,
        p_origin_type: originType,
        p_gender: gender,
        p_casa_proof_type: casaProofType || null,
        p_shirt_size: shirtSize,
        p_payment_method: paymentMethod,
        p_terms_version: 'v1.0-2026',
        p_privacy_version: 'v1.0-2026',
        p_ip_address: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
        p_user_agent: req.headers['user-agent'],
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }
      reservationResult = data;
    } else {
      // 4.2 Via Motor Transacional em Memória com Mutex (usado em testes de carga e alta concorrência)
      const { registration, accessCode } = await memoryStore.createReservation({
        fullName,
        cpf: cleanCpf,
        birthDate,
        email,
        phone,
        city,
        state,
        team,
        originType,
        gender,
        casaProofType,
        shirtSize,
        paymentMethod,
        baseAmountCents: pricing.baseAmountCents,
        feeCents: pricing.feeCents,
        totalAmountCents: pricing.totalAmountCents,
        idempotencyKey,
      });

      reservationResult = {
        registration_id: registration.id,
        protocol: registration.protocol,
        access_code: accessCode,
        category: registration.category,
        total_amount_cents: registration.totalAmountCents,
        reservation_expires_at: registration.reservationExpiresAt,
      };
    }

    // Garantir que os valores oficiais (R$ 60,00 base + 10% taxa = R$ 66,00 total) prevaleçam
    reservationResult.base_amount_cents = pricing.baseAmountCents;
    reservationResult.fee_cents = pricing.feeCents;
    reservationResult.total_amount_cents = pricing.totalAmountCents;

    // 5. Integração com Gateway Asaas (com conciliação prévia por CPF e por Protocolo)
    const totalFloat = pricing.totalAmountCents / 100; // Rigorosamente R$ 66,00
    
    // 5.1 Conciliar / obter cliente Asaas sem duplicar
    const customer = await asaasClient.getOrCreateCustomer({
      name: fullName,
      cpfCnpj: cleanCpf,
      email,
      mobilePhone: phone,
    });

    // 5.2 Conciliar / obter cobrança Asaas usando o Protocolo como chave externa
    const payment = await asaasClient.getOrCreatePayment({
      customerId: customer.id,
      billingType: paymentMethod,
      value: totalFloat,
      protocol: reservationResult.protocol,
      description: `5ª Corrida de Emancipação de Lajes Pintadas/RN - Atleta: ${fullName} (Camisa: ${shirtSize})`,
    });

    let pixQr = null;
    let pixCopy = null;

    if (paymentMethod === 'PIX' && payment.id) {
      try {
        const qr = await asaasClient.getPixQrCode(payment.id);
        pixQr = qr.encodedImage;
        pixCopy = qr.payload;
      } catch (e) {
        console.warn('[Asaas] Falha ao obter QR Code Pix, invoiceUrl disponível:', e);
      }
    }

    // Atualizar registro com dados Asaas e Atendimento
    reservationResult.asaas_payment_id = payment.id;
    reservationResult.invoice_url = payment.invoiceUrl;
    reservationResult.pix_qr_code = pixQr;
    reservationResult.pix_copy_paste = pixCopy;
    reservationResult.channel = registrationChannel;
    reservationResult.document_verification_status = documentVerificationStatus || (originType === 'CASA' ? 'APROVADO' : 'PENDENTE');
    reservationResult.document_type_presented = documentTypePresented || null;
    reservationResult.document_checked_by = attendantName || null;
    reservationResult.attendant_name = attendantName || null;

    // Persistir dados no Supabase para consulta e conciliação
    if (supabase && reservationResult.registration_id) {
      try {
        await supabase
          .from('registrations')
          .update({
            asaas_payment_id: payment.id,
            asaas_customer_id: customer.id,
            asaas_invoice_url: payment.invoiceUrl,
            asaas_pix_qr_code: pixQr,
            asaas_pix_copy_paste: pixCopy,
            base_amount_cents: pricing.baseAmountCents,
            processing_fee_cents: pricing.feeCents,
            total_amount_cents: pricing.totalAmountCents,
            channel: registrationChannel,
            document_verification_status: documentVerificationStatus || (originType === 'CASA' ? 'APROVADO' : 'PENDENTE'),
            document_type_presented: documentTypePresented || null,
            document_verification_notes: documentVerificationNotes || null,
            document_checked_by: attendantName || null,
            document_checked_at: new Date().toISOString(),
            attendant_name: attendantName || null,
            attendant_id: attendantId || null,
            kit_notes: `ACCESS_CODE:${reservationResult.access_code}`,
            updated_at: new Date().toISOString(),
          })
          .eq('id', reservationResult.registration_id);
      } catch (updateErr) {
        console.warn('[create-reservation] Aviso ao atualizar dados no Supabase:', updateErr);
      }
    }

    // Atualizar no motor em memória se ativo
    const memReg = memoryStore.registrations.get(reservationResult.protocol);
    if (memReg) {
      memReg.asaasPaymentId = payment.id;
      memReg.asaasCustomerId = customer.id;
      memReg.invoiceUrl = payment.invoiceUrl;
      memReg.pixQrCode = pixQr || undefined;
      memReg.pixCopyPaste = pixCopy || undefined;
      memReg.channel = registrationChannel;
      memReg.documentVerificationStatus = (documentVerificationStatus as any) || (originType === 'CASA' ? 'APROVADO' : 'PENDENTE');
      memReg.documentTypePresented = documentTypePresented;
      memReg.documentVerificationNotes = documentVerificationNotes;
      memReg.documentCheckedBy = attendantName;
      memReg.documentCheckedAt = new Date().toISOString();
      memReg.attendantName = attendantName;
      memReg.attendantId = attendantId;
    }

    // Disparo imediato de e-mail institucional oficial com Protocolo e Código de Acesso
    if (email) {
      sendConfirmationEmail({
        athleteName: fullName,
        athleteEmail: email,
        athleteCpf: cleanCpf,
        protocol: reservationResult.protocol,
        accessCode: reservationResult.access_code,
        category: reservationResult.category,
        gender,
        shirtSize,
        paymentMethod,
        originType,
        status: originType === 'CASA' ? 'CONFIRMED' : 'RESERVED',
        pixCopyPaste: pixCopy || undefined,
        invoiceUrl: payment.invoiceUrl || undefined,
      }).catch((emailErr) => {
        console.warn('[create-reservation] Aviso ao disparar e-mail de confirmação:', emailErr);
      });
    }

    const durationMs = Date.now() - startTime;
    memoryStore.recordLatency(durationMs);

    return res.status(200).json(reservationResult);
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    memoryStore.recordLatency(durationMs);
    console.error('[create-reservation] Erro:', err.message);

    // Se a pré-reserva já foi criada no Supabase mas o gateway falhou,
    // cancelamos/removemos a pré-reserva órfã para NÃO bloquear o CPF do atleta nem prender estoque!
    const supabase = getSupabase();
    if (supabase && reservationResult?.registration_id) {
      try {
        await supabase.from('registrations').delete().eq('id', reservationResult.registration_id);
        if (req.body?.shirtSize) {
          const { data: stockRow } = await supabase
            .from('shirt_inventory')
            .select('reserved_count')
            .eq('size', req.body.shirtSize)
            .single();
          if (stockRow) {
            await supabase
              .from('shirt_inventory')
              .update({
                reserved_count: Math.max(0, stockRow.reserved_count - 1),
                updated_at: new Date().toISOString(),
              })
              .eq('size', req.body.shirtSize);
          }
        }
      } catch (cleanErr) {
        console.error('[create-reservation] Falha na limpeza de reserva órfã:', cleanErr);
      }
    }

    return res.status(400).json({ error: err.message || 'Erro ao processar reserva' });
  }
}
