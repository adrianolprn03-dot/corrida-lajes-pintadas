// ==============================================================================
// VERCEL SERVERLESS FUNCTION: /api/create-reservation
// Processamento estrito de reservas com concorrência segura, controle de Asaas,
// conciliação prévia, proteção contra 429 e prevenção de duplicidades
// ==============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AsaasClient, memoryStore, getBatchState, computeBatchPricing, DEFAULT_BASE_PRICE_CENTS } from './lib/state.js';
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
  return rawKey
    .replace(/\\n/g, '')
    .replace(/\\r/g, '')
    .replace(/[\r\n]+/g, '')
    .trim()
    .replace(/^["']|["']$/g, '')
    .trim();
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

function formatBRL(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
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
      cep,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      team,
      originType,
      gender,
      casaProofType,
      shirtSize,
      paymentMethod,
      creditCard,
      idempotencyKey,
      channel,
      attendantName,
      attendantId,
      documentVerificationStatus,
      documentTypePresented,
      documentVerificationNotes,
      isPcd,
      pcdType,
      pcdCid,
      hasGuide,
      guideName,
      guideCpf,
      guidePhone,
      guideShirtSize,
      expectedTotalAmountCents,
    } = req.body;

    const registrationChannel = channel === 'PRESENCIAL_PREFEITURA' ? 'PRESENCIAL_PREFEITURA' : 'ONLINE';
    const isPcdRegistration = originType === 'PCD' || Boolean(isPcd);

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

    // Validação de regras para Categoria PCD / Inclusão
    if (isPcdRegistration) {
      if (!pcdType) {
        return res.status(400).json({ error: 'Tipo de deficiência obrigatório para inscrição PCD.' });
      }
      if (!pcdCid || pcdCid.trim().length < 3) {
        return res.status(400).json({ error: 'Código CID ou número do Laudo Médico / CIPTEA comprobatório é obrigatório.' });
      }
      if (hasGuide) {
        if (!guideName || guideName.trim().length < 5) {
          return res.status(400).json({ error: 'Nome completo do Atleta-Guia é obrigatório.' });
        }
        const cleanGuideCpf = (guideCpf || '').replace(/\D/g, '');
        if (!cleanGuideCpf || !isValidCPF(cleanGuideCpf)) {
          return res.status(400).json({ error: 'CPF do Atleta-Guia inválido.' });
        }
        if (cleanGuideCpf === cleanCpf) {
          return res.status(400).json({ error: 'O CPF do Atleta-Guia não pode ser idêntico ao CPF do atleta participante.' });
        }
        if (!guidePhone || guidePhone.replace(/\D/g, '').length < 10) {
          return res.status(400).json({ error: 'Telefone/WhatsApp do Atleta-Guia é obrigatório.' });
        }
        if (!guideShirtSize) {
          return res.status(400).json({ error: 'Tamanho da camisa oficial do Atleta-Guia é obrigatório.' });
        }
      }
    }

    // 2. Lote vigente e preço calculados de forma imutável no backend
    //    (valor base do lote + 10% de taxa; PCD paga 50% do valor base do lote)
    const supabase = getSupabase();

    let batchState;
    try {
      batchState = await getBatchState(supabase);
    } catch (batchErr) {
      console.error('[create-reservation] Falha ao verificar lote vigente:', batchErr);
      return res.status(503).json({ error: 'Não foi possível verificar o lote de inscrição vigente. Tente novamente em instantes.' });
    }

    if (batchState.configured && !batchState.current) {
      return res.status(400).json({
        error: 'Inscrições encerradas: todos os lotes de inscrição foram encerrados ou esgotados.',
        code: 'NO_ACTIVE_BATCH',
      });
    }

    const currentBatch = batchState.current;
    const pricing = computeBatchPricing(currentBatch?.basePriceCents ?? DEFAULT_BASE_PRICE_CENTS, isPcdRegistration);

    // Se o lote virou entre a exibição do valor e o envio, o atleta precisa revisar o novo valor
    if (typeof expectedTotalAmountCents === 'number' && expectedTotalAmountCents !== pricing.totalAmountCents) {
      return res.status(409).json({
        error: `O valor da inscrição foi atualizado${currentBatch ? ` para o ${currentBatch.name}` : ''}: novo total de ${formatBRL(pricing.totalAmountCents)}. Atualize a página (F5) e confirme novamente.`,
        code: 'BATCH_CHANGED',
        batch: currentBatch ? { id: currentBatch.id, name: currentBatch.name, basePriceCents: currentBatch.basePriceCents } : null,
        totalAmountCents: pricing.totalAmountCents,
      });
    }

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
    if (supabase) {
      // 3.9 Liberar automaticamente reservas Pix expiradas (> 30 min sem pagamento)
      try {
        await supabase.rpc('expire_stale_reservations');
      } catch (expErr) {
        console.warn('[create-reservation] Aviso ao expirar reservas vencidas:', expErr);
      }

      // 4.0 Validação estrita de cota por categoria (Local vs Visitante)
      try {
        let localMax: number | null = null;
        let visitorMax: number | null = null;

        const { data: setRow } = await supabase
          .from('event_settings')
          .select('*')
          .limit(1)
          .single();

        if (setRow) {
          if (setRow.local_max_capacity !== undefined && setRow.local_max_capacity !== null) {
            localMax = setRow.local_max_capacity;
            visitorMax = setRow.visitor_max_capacity;
          } else {
            const { data: quotaLogs } = await supabase
              .from('audit_logs')
              .select('details')
              .eq('resource_type', 'CATEGORY_QUOTAS')
              .order('created_at', { ascending: false })
              .limit(1);
            if (quotaLogs && quotaLogs.length > 0 && quotaLogs[0].details) {
              localMax = quotaLogs[0].details.localMaxCapacity;
              visitorMax = quotaLogs[0].details.visitorMaxCapacity;
            } else if (setRow.max_capacity) {
              localMax = Math.floor(setRow.max_capacity / 2);
              visitorMax = Math.ceil(setRow.max_capacity / 2);
            }
          }
        }

        const isLocalAthlete = originType === 'CASA' || originType === 'LOCAL';

        if (isLocalAthlete && localMax !== null && localMax > 0) {
          const { count } = await supabase
            .from('registrations')
            .select('id', { count: 'exact', head: true })
            .eq('origin_type', 'CASA')
            .in('status', ['CONFIRMED', 'RESERVED', 'IN_REVIEW']);

          if ((count || 0) >= localMax) {
            return res.status(400).json({
              error: `Cota de vagas esgotada para a Categoria Local (Lajespintadense). Vagas preenchidas: ${count} de ${localMax}.`,
            });
          }
        } else if (!isLocalAthlete && visitorMax !== null && visitorMax > 0) {
          const { count } = await supabase
            .from('registrations')
            .select('id', { count: 'exact', head: true })
            .eq('origin_type', 'VISITANTE')
            .in('status', ['CONFIRMED', 'RESERVED', 'IN_REVIEW']);

          if ((count || 0) >= visitorMax) {
            return res.status(400).json({
              error: `Cota de vagas esgotada para a Categoria Visitante. Vagas preenchidas: ${count} de ${visitorMax}.`,
            });
          }
        }
      } catch (quotaErr) {
        console.warn('Verificação de cota falhou, prosseguindo com rpc:', quotaErr);
      }

      // Garantir que as camisas operem sob demanda (sem bloqueio por tamanho na RPC do Supabase)
      try {
        await supabase
          .from('shirt_inventory')
          .update({ total_stock: 9999, is_active: true })
          .lt('total_stock', 9999);
      } catch {}

      // 4.1 Via Supabase RPC com SELECT FOR UPDATE no PostgreSQL
      // Mapeamento seguro para o enum origin_type_enum existente ('CASA' ou 'VISITANTE')
      const rpcOriginType = (originType === 'CASA' || originType === 'LOCAL') ? 'CASA' : 'VISITANTE';
      const { data, error } = await supabase.rpc('create_registration_reservation', {
        p_full_name: fullName,
        p_cpf: cleanCpf,
        p_birth_date: birthDate,
        p_email: email,
        p_phone: phone,
        p_city: city,
        p_state: state,
        p_team: team || null,
        p_origin_type: rpcOriginType,
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

      // Se houver atleta-guia com camisa, contabilizar a demanda da camisa do guia no Supabase
      if (hasGuide && guideShirtSize) {
        const { data: guideStockRow } = await supabase
          .from('shirt_inventory')
          .select('total_stock, reserved_count, confirmed_count')
          .eq('size', guideShirtSize)
          .single();
        if (guideStockRow) {
          await supabase
            .from('shirt_inventory')
            .update({
              total_stock: Math.max(9999, guideStockRow.total_stock || 9999),
              reserved_count: (guideStockRow.reserved_count || 0) + 1,
              updated_at: new Date().toISOString(),
            })
            .eq('size', guideShirtSize);
        }
      }
    } else {
      // 4.2 Via Motor Transacional em Memória com Mutex (usado em testes de carga e alta concorrência)
      const { registration, accessCode } = await memoryStore.createReservation({
        fullName,
        cpf: cleanCpf,
        birthDate,
        email,
        phone,
        cep,
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        team,
        originType: isPcdRegistration ? 'PCD' : originType,
        gender,
        casaProofType,
        shirtSize,
        paymentMethod,
        baseAmountCents: pricing.baseAmountCents,
        feeCents: pricing.feeCents,
        totalAmountCents: pricing.totalAmountCents,
        idempotencyKey,
        isPcd: isPcdRegistration,
        pcdType,
        pcdCid,
        hasGuide,
        guideName,
        guideCpf,
        guidePhone,
        guideShirtSize,
        batchId: currentBatch?.id,
        batchName: currentBatch?.name,
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

    // Se for categoria PCD, assegurar a categoria correta no retorno da API
    if (isPcdRegistration) {
      reservationResult.category = gender === 'MASCULINO' ? 'PCD_MASCULINO' : 'PCD_FEMININO';
      reservationResult.origin_type = 'PCD';
    }

    // Garantir que os valores do lote vigente prevaleçam (valor base + 10% de taxa)
    reservationResult.base_amount_cents = pricing.baseAmountCents;
    reservationResult.fee_cents = pricing.feeCents;
    reservationResult.total_amount_cents = pricing.totalAmountCents;
    reservationResult.batch_id = currentBatch?.id || null;
    reservationResult.batch_name = currentBatch?.name || null;

    // 5. Integração com Gateway Asaas (com conciliação prévia por CPF e por Protocolo)
    const totalFloat = pricing.totalAmountCents / 100;
    
    // 5.1 Conciliar / obter cliente Asaas sem duplicar com endereço completo
    const customer = await asaasClient.getOrCreateCustomer({
      name: fullName,
      cpfCnpj: cleanCpf,
      email,
      mobilePhone: phone,
      postalCode: cep,
      address: street,
      addressNumber: number,
      complement,
      province: neighborhood,
    });

    // 5.2 Conciliar / obter cobrança Asaas ou efetuar cobrança direta no cartão
    const isDirectCreditCard = paymentMethod === 'CREDIT_CARD' && !!creditCard;
    const clientIp = ((req.headers['x-forwarded-for'] as string) || '').split(',')[0]?.trim() || req.socket?.remoteAddress || '127.0.0.1';

    const cardHolderCpf = (creditCard?.holderCpf || cleanCpf).replace(/\D/g, '');
    const cardHolderPhone = (creditCard?.holderPhone || phone).replace(/\D/g, '');
    const cardHolderPostalCode = (creditCard?.postalCode || cep || '59235000').replace(/\D/g, '');

    const payment = await asaasClient.getOrCreatePayment({
      customerId: customer.id,
      billingType: paymentMethod,
      value: totalFloat,
      protocol: reservationResult.protocol,
      description: `5ª Corrida de Emancipação de Lajes Pintadas/RN${currentBatch ? ` - ${currentBatch.name}` : ''} - Atleta: ${fullName} (Camisa: ${shirtSize})${isPcdRegistration ? ' [PCD/Inclusão - Meia-Inscrição]' : ''}`,
      remoteIp: clientIp,
      creditCard: isDirectCreditCard ? {
        holderName: creditCard.holderName.trim().toUpperCase(),
        number: creditCard.number.replace(/\D/g, ''),
        expiryMonth: creditCard.expiryMonth.toString().padStart(2, '0'),
        expiryYear: creditCard.expiryYear.toString().length === 2 ? `20${creditCard.expiryYear}` : creditCard.expiryYear.toString(),
        ccv: creditCard.ccv.toString().trim(),
      } : undefined,
      creditCardHolderInfo: isDirectCreditCard ? {
        name: creditCard.holderName.trim().toUpperCase(),
        email: email,
        cpfCnpj: cardHolderCpf,
        postalCode: cardHolderPostalCode,
        addressNumber: creditCard.addressNumber || number || 'S/N',
        addressComplement: creditCard.complement || complement,
        phone: cardHolderPhone,
        mobilePhone: cardHolderPhone,
      } : undefined,
    });

    let pixQr = null;
    let pixCopy = null;

    if (paymentMethod === 'PIX' && payment.id) {
      try {
        const qr = await asaasClient.getPixQrCode(payment.id);
        if (qr.encodedImage) {
          pixQr = qr.encodedImage.startsWith('data:image')
            ? qr.encodedImage
            : `data:image/png;base64,${qr.encodedImage.trim()}`;
        }
        pixCopy = qr.payload;
      } catch (e) {
        console.warn('[Asaas] Falha ao obter QR Code Pix, invoiceUrl disponível:', e);
      }
    }

    const isPaymentConfirmed = ['CONFIRMED', 'RECEIVED'].includes(payment.status);
    const cardBrand = payment.creditCard?.creditCardBrand || (isDirectCreditCard ? 'CARTÃO DE CRÉDITO' : null);
    const cardLastDigits = payment.creditCard?.creditCardNumber || (creditCard?.number ? creditCard.number.replace(/\D/g, '').slice(-4) : null);

    // Atualizar registro com dados Asaas, status de pagamento e atendimento
    reservationResult.asaas_payment_id = payment.id;
    reservationResult.invoice_url = payment.invoiceUrl;
    reservationResult.pix_qr_code = pixQr;
    reservationResult.pix_copy_paste = pixCopy;
    reservationResult.channel = registrationChannel;
    reservationResult.status = isPaymentConfirmed ? 'CONFIRMED' : 'RESERVED';
    reservationResult.financial_status = isPaymentConfirmed ? 'CONFIRMED' : 'PENDING';
    reservationResult.credit_card_brand = cardBrand;
    reservationResult.credit_card_last_digits = cardLastDigits;
    if (isPaymentConfirmed) {
      reservationResult.paid_at = new Date().toISOString();
    }
    reservationResult.document_verification_status = documentVerificationStatus || (originType === 'CASA' ? 'APROVADO' : 'PENDENTE');
    reservationResult.document_type_presented = documentTypePresented || null;
    reservationResult.document_checked_by = attendantName || null;
    reservationResult.attendant_name = attendantName || null;

    // Persistir dados no Supabase para consulta e conciliação
    if (supabase && reservationResult.registration_id) {
      try {
        const pcdMeta = isPcdRegistration ? {
          isPcd: true,
          pcdType,
          pcdCid: pcdCid?.trim(),
          hasGuide: Boolean(hasGuide),
          guideName: guideName?.trim() || null,
          guideCpf: guideCpf ? guideCpf.replace(/\D/g, '') : null,
          guidePhone: guidePhone?.trim() || null,
          guideShirtSize: guideShirtSize || null,
        } : null;

        const pcdMetaStr = pcdMeta ? `|PCD_META:${JSON.stringify(pcdMeta)}` : '';
        if (pcdMeta) {
          reservationResult.pcd = pcdMeta;
        }

        const nowIso = new Date().toISOString();
        const coreUpdatePayload: Record<string, any> = {
          asaas_payment_id: payment.id,
          asaas_customer_id: customer.id,
          asaas_invoice_url: payment.invoiceUrl,
          asaas_pix_qr_code: pixQr,
          asaas_pix_copy_paste: pixCopy,
          base_amount_cents: pricing.baseAmountCents,
          processing_fee_cents: pricing.feeCents,
          total_amount_cents: pricing.totalAmountCents,
          kit_notes: `ACCESS_CODE:${reservationResult.access_code}${currentBatch ? `|BATCH:${currentBatch.id}|BATCH_NAME:${encodeURIComponent(currentBatch.name)}` : ''}${pcdMetaStr}${cep ? `|ADDR:${encodeURIComponent(JSON.stringify({ cep, street, number, complement, neighborhood }))}` : ''}|CHANNEL:${registrationChannel}${isPaymentConfirmed ? '|CONFIRMATION_EMAIL_SENT:true' : ''}`,
          updated_at: nowIso,
        };

        if (isPaymentConfirmed) {
          coreUpdatePayload.status = 'CONFIRMED';
          coreUpdatePayload.financial_status = 'CONFIRMED';
          coreUpdatePayload.paid_at = nowIso;

          // Mover camisa do atleta de reservada para confirmada
          const { data: stockRow } = await supabase
            .from('shirt_inventory')
            .select('reserved_count, confirmed_count')
            .eq('size', shirtSize)
            .single();
          if (stockRow) {
            await supabase
              .from('shirt_inventory')
              .update({
                reserved_count: Math.max(0, stockRow.reserved_count - 1),
                confirmed_count: stockRow.confirmed_count + 1,
                updated_at: nowIso,
              })
              .eq('size', shirtSize);
          }

          // Mover camisa do atleta-guia de reservada para confirmada
          if (hasGuide && guideShirtSize) {
            const { data: guideStockRow } = await supabase
              .from('shirt_inventory')
              .select('reserved_count, confirmed_count')
              .eq('size', guideShirtSize)
              .single();
            if (guideStockRow) {
              await supabase
                .from('shirt_inventory')
                .update({
                  reserved_count: Math.max(0, guideStockRow.reserved_count - 1),
                  confirmed_count: guideStockRow.confirmed_count + 1,
                  updated_at: nowIso,
                })
                .eq('size', guideShirtSize);
            }
          }
        }

        // 1) Atualizar colunas centrais garantidas no banco (payment_id, QR Code Pix, valores e kit_notes)
        await supabase
          .from('registrations')
          .update(coreUpdatePayload)
          .eq('id', reservationResult.registration_id);

        // 2) Atualizar colunas estendidas se existirem no schema do Supabase
        try {
          const extendedPayload: Record<string, any> = {
            channel: registrationChannel,
            document_verification_status: documentVerificationStatus || (originType === 'CASA' ? 'APROVADO' : 'PENDENTE'),
            document_type_presented: documentTypePresented || null,
            document_verification_notes: documentVerificationNotes || null,
            document_checked_by: attendantName || null,
            document_checked_at: nowIso,
            attendant_name: attendantName || null,
            attendant_id: attendantId || null,
          };
          if (currentBatch) {
            extendedPayload.batch_id = currentBatch.id;
            extendedPayload.batch_name = currentBatch.name;
          }
          await supabase
            .from('registrations')
            .update(extendedPayload)
            .eq('id', reservationResult.registration_id);
        } catch {}
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
      if (isPaymentConfirmed) {
        memReg.status = 'CONFIRMED';
        memReg.financialStatus = 'CONFIRMED';
        const shirt = memoryStore.shirts.get(shirtSize);
        if (shirt) {
          if (shirt.reservedCount > 0) shirt.reservedCount--;
          shirt.confirmedCount++;
        }
        if (hasGuide && guideShirtSize) {
          const guideShirt = memoryStore.shirts.get(guideShirtSize);
          if (guideShirt) {
            if (guideShirt.reservedCount > 0) guideShirt.reservedCount--;
            guideShirt.confirmedCount++;
          }
        }
      }
    }

    // Disparo de e-mail institucional oficial de confirmação:
    // APENAS SE O PAGAMENTO ESTIVER CONFIRMADO (Cartão aprovado na hora ou atleta Casa/gratuito)!
    // Para pagamentos via Pix, o e-mail de confirmação NÃO é enviado aqui; ele será disparado
    // exclusivamente pelo Webhook do Asaas assim que o banco acusar a compensação do Pix!
    if (email && isPaymentConfirmed) {
      try {
        await sendConfirmationEmail({
          athleteName: fullName,
          athleteEmail: email,
          athleteCpf: cleanCpf,
          protocol: reservationResult.protocol,
          accessCode: reservationResult.access_code,
          category: reservationResult.category,
          gender,
          shirtSize,
          paymentMethod,
          originType: isPcdRegistration ? 'PCD' : originType,
          status: 'CONFIRMED',
          totalAmountCents: pricing.totalAmountCents,
          baseAmountCents: pricing.baseAmountCents,
          feeCents: pricing.feeCents,
          isPcd: isPcdRegistration,
          pcdType,
          pcdCid,
          hasGuide: Boolean(hasGuide),
          guideName: guideName?.trim(),
          guideCpf: guideCpf ? guideCpf.replace(/\D/g, '') : undefined,
          guidePhone: guidePhone?.trim(),
          guideShirtSize,
        });
        console.log(`[create-reservation] E-mail institucional oficial de confirmação enviado para ${email}`);
        if (memReg) {
          memReg.confirmationEmailSent = true;
        }
      } catch (emailErr) {
        console.warn('[create-reservation] Aviso ao disparar e-mail de confirmação:', emailErr);
      }
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
