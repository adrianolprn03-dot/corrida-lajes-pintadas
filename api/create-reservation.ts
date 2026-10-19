// ==============================================================================
// VERCEL SERVERLESS FUNCTION: /api/create-reservation
// Processamento estrito de reservas com concorrência segura, controle de Asaas,
// conciliação prévia, proteção contra 429 e prevenção de duplicidades
// ==============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { AsaasClient } from './lib/asaas';
import { memoryStore } from './lib/state';

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
  const basePriceCents = 6000; // R$ 60,00 net
  if (paymentMethod === 'PIX') {
    const feeCents = 99; // R$ 0,99
    return {
      baseAmountCents: basePriceCents,
      feeCents,
      totalAmountCents: basePriceCents + feeCents,
    };
  } else {
    // Cartão de crédito à vista em parcela única
    const fixedFee = 49;
    const percentFee = 0.0299;
    const totalCents = Math.round((basePriceCents + fixedFee) / (1 - percentFee));
    return {
      baseAmountCents: basePriceCents,
      feeCents: totalCents - basePriceCents,
      totalAmountCents: totalCents,
    };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();

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
    } = req.body;

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
    const asaasApiKey = process.env.ASAAS_API_KEY || '';
    const asaasEnv = (process.env.ASAAS_ENVIRONMENT as any) || (process.env.NODE_ENV === 'test' ? 'mock' : 'sandbox');
    const asaasClient = new AsaasClient({
      apiKey: asaasApiKey,
      environment: asaasApiKey ? asaasEnv : 'mock',
      maxRetries: 3,
      baseDelayMs: 300,
    });

    // 4. Executar Reserva Transacional Atômica
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let reservationResult: any;

    if (supabaseUrl && supabaseServiceKey) {
      // 4.1 Via Supabase RPC com SELECT FOR UPDATE no PostgreSQL
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
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

    // 5. Integração com Gateway Asaas (com conciliação prévia por CPF e por Protocolo)
    const totalFloat = reservationResult.total_amount_cents / 100;
    
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

    // Atualizar registro com dados Asaas
    reservationResult.asaas_payment_id = payment.id;
    reservationResult.invoice_url = payment.invoiceUrl;
    reservationResult.pix_qr_code = pixQr;
    reservationResult.pix_copy_paste = pixCopy;

    // Atualizar no motor em memória se ativo
    const memReg = memoryStore.registrations.get(reservationResult.protocol);
    if (memReg) {
      memReg.asaasPaymentId = payment.id;
      memReg.asaasCustomerId = customer.id;
      memReg.invoiceUrl = payment.invoiceUrl;
      memReg.pixQrCode = pixQr || undefined;
      memReg.pixCopyPaste = pixCopy || undefined;
    }

    const durationMs = Date.now() - startTime;
    memoryStore.recordLatency(durationMs);

    return res.status(200).json(reservationResult);
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    memoryStore.recordLatency(durationMs);
    console.error('[create-reservation] Erro:', err.message);
    return res.status(400).json({ error: err.message || 'Erro ao processar reserva' });
  }
}
