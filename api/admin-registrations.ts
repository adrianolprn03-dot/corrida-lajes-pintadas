// ==============================================================================
// VERCEL SERVERLESS FUNCTION: /api/admin-registrations
// Listagem paginada e otimizada de inscrições para o Painel Administrativo
// ==============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
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
  const supabase = getSupabase();

  try {
    // 1.0 Reenvio de e-mail com protocolo e código de acesso
    if (req.method === 'POST' && req.body?.action === 'resend-email') {
      if (!isEmailConfigured()) {
        return res.status(503).json({ error: 'Servidor de e-mail SMTP não está configurado.' });
      }

      const { 
        athleteName, 
        athleteEmail, 
        athleteCpf, 
        protocol, 
        accessCode, 
        category, 
        gender, 
        shirtSize, 
        status,
        totalAmountCents,
        baseAmountCents,
        feeCents,
        paymentMethod,
        isPcd,
        pcdType,
        pcdCid,
        hasGuide,
        guideName,
        guideCpf,
        guidePhone,
        guideShirtSize,
        originType
      } = req.body;
      if (!athleteEmail || !protocol || !accessCode) {
        return res.status(400).json({ error: 'E-mail, protocolo e código de acesso são obrigatórios.' });
      }

      const success = await sendConfirmationEmail({
        athleteName: athleteName || 'Atleta',
        athleteEmail: athleteEmail.trim().toLowerCase(),
        athleteCpf: athleteCpf || '',
        protocol: protocol.trim().toUpperCase(),
        accessCode: accessCode.trim().toUpperCase(),
        category: category || 'GERAL',
        originType,
        gender: gender || 'MASCULINO',
        shirtSize: shirtSize || 'M',
        status: status === 'RESERVED' ? 'RESERVED' : 'CONFIRMED',
        totalAmountCents: typeof totalAmountCents === 'number' ? totalAmountCents : undefined,
        baseAmountCents: typeof baseAmountCents === 'number' ? baseAmountCents : undefined,
        feeCents: typeof feeCents === 'number' ? feeCents : undefined,
        paymentMethod,
        isPcd: Boolean(isPcd),
        pcdType,
        pcdCid,
        hasGuide: Boolean(hasGuide),
        guideName,
        guideCpf,
        guidePhone,
        guideShirtSize,
      });

      if (success) {
        return res.status(200).json({ success: true, message: `E-mail enviado com sucesso para ${athleteEmail}!` });
      } else {
        return res.status(500).json({ error: 'Falha ao disparar e-mail pelo servidor SMTP.' });
      }
    }

    // 1.1 Atualização / Edição Completa da Inscrição (Admin Geral)
    if (req.method === 'POST' && req.body?.action === 'update') {
      const { id, registrationId, athlete, registration, sendNotificationEmail, accessCode, operator } = req.body;
      const regId = id || registrationId;

      if (!regId) {
        return res.status(400).json({ error: 'ID da inscrição é obrigatório.' });
      }

      if (supabase) {
        // Buscar dados atuais para cálculo de troca de tamanho de camisa e status
        const { data: currentReg, error: fetchErr } = await supabase
          .from('registrations')
          .select('*, athlete:athletes(*)')
          .eq('id', regId)
          .single();

        if (fetchErr || !currentReg) {
          return res.status(404).json({ error: 'Inscrição não encontrada no banco.' });
        }

        const athleteId = currentReg.athlete_id;
        const oldSize = currentReg.shirt_size;
        const newSize = registration?.shirtSize || oldSize;
        const oldStatus = currentReg.status;
        const newStatus = registration?.status || oldStatus;

        // 1. Atualizar dados do atleta se fornecidos
        if (athlete && athleteId) {
          const athleteUpdate: any = {
            updated_at: new Date().toISOString(),
          };
          if (athlete.fullName) athleteUpdate.full_name = athlete.fullName.trim();
          if (athlete.cpf) athleteUpdate.cpf = athlete.cpf.replace(/\D/g, '');
          if (athlete.birthDate) athleteUpdate.birth_date = athlete.birthDate;
          if (athlete.email) athleteUpdate.email = athlete.email.trim().toLowerCase();
          if (athlete.phone) athleteUpdate.phone = athlete.phone.trim();
          if (athlete.city) athleteUpdate.city = athlete.city.trim();
          if (athlete.state) athleteUpdate.state = athlete.state.trim().toUpperCase();
          if (athlete.team !== undefined) athleteUpdate.team = athlete.team ? athlete.team.trim() : null;

          const { error: athErr } = await supabase
            .from('athletes')
            .update(athleteUpdate)
            .eq('id', athleteId);

          if (athErr) throw athErr;
        }

        // 2. Troca de tamanho de camisa (shirt inventory swap)
        if (oldSize !== newSize) {
          if (oldStatus === 'CONFIRMED') {
            const { data: oldStock } = await supabase.from('shirt_inventory').select('confirmed_count').eq('size', oldSize).single();
            const { data: newStock } = await supabase.from('shirt_inventory').select('confirmed_count').eq('size', newSize).single();
            if (oldStock) {
              await supabase.from('shirt_inventory').update({
                confirmed_count: Math.max(0, oldStock.confirmed_count - 1),
                updated_at: new Date().toISOString(),
              }).eq('size', oldSize);
            }
            if (newStock) {
              await supabase.from('shirt_inventory').update({
                confirmed_count: (newStock.confirmed_count || 0) + 1,
                updated_at: new Date().toISOString(),
              }).eq('size', newSize);
            }
          } else if (oldStatus === 'RESERVED') {
            const { data: oldStock } = await supabase.from('shirt_inventory').select('reserved_count').eq('size', oldSize).single();
            const { data: newStock } = await supabase.from('shirt_inventory').select('reserved_count').eq('size', newSize).single();
            if (oldStock) {
              await supabase.from('shirt_inventory').update({
                reserved_count: Math.max(0, oldStock.reserved_count - 1),
                updated_at: new Date().toISOString(),
              }).eq('size', oldSize);
            }
            if (newStock) {
              await supabase.from('shirt_inventory').update({
                reserved_count: (newStock.reserved_count || 0) + 1,
                updated_at: new Date().toISOString(),
              }).eq('size', newSize);
            }
          }
        }

        // 3. Mudança de status da inscrição
        if (oldStatus !== newStatus) {
          const effectiveSize = newSize;
          if (newStatus === 'CONFIRMED' && oldStatus !== 'CONFIRMED') {
            const { data: stock } = await supabase.from('shirt_inventory').select('reserved_count, confirmed_count').eq('size', effectiveSize).single();
            if (stock) {
              await supabase.from('shirt_inventory').update({
                reserved_count: Math.max(0, stock.reserved_count - 1),
                confirmed_count: (stock.confirmed_count || 0) + 1,
                updated_at: new Date().toISOString(),
              }).eq('size', effectiveSize);
            }
          } else if (['CANCELLED', 'REFUNDED', 'EXPIRED'].includes(newStatus)) {
            const { data: stock } = await supabase.from('shirt_inventory').select('reserved_count, confirmed_count').eq('size', effectiveSize).single();
            if (stock) {
              if (oldStatus === 'CONFIRMED') {
                await supabase.from('shirt_inventory').update({
                  confirmed_count: Math.max(0, stock.confirmed_count - 1),
                  updated_at: new Date().toISOString(),
                }).eq('size', effectiveSize);
              } else if (oldStatus === 'RESERVED') {
                await supabase.from('shirt_inventory').update({
                  reserved_count: Math.max(0, stock.reserved_count - 1),
                  updated_at: new Date().toISOString(),
                }).eq('size', effectiveSize);
              }
            }
          }
        }

        // 4. Atualizar registro da inscrição
        const regUpdate: any = {
          updated_at: new Date().toISOString(),
        };

        // Gênero alvo normalizado (garante MASCULINO ou FEMININO)
        const targetGender: 'MASCULINO' | 'FEMININO' = 
          (registration?.gender || currentReg.gender || 'MASCULINO').toUpperCase() === 'FEMININO'
            ? 'FEMININO'
            : 'MASCULINO';

        // Origem alvo normalizada (CASA ou VISITANTE)
        let targetOrigin = (registration?.originType || currentReg.origin_type || 'VISITANTE').toUpperCase();
        if (targetOrigin === 'LOCAL') targetOrigin = 'CASA';

        const rawCat = String(registration?.category || currentReg.category || '').toUpperCase();
        const isLocal = targetOrigin === 'CASA' || rawCat.includes('LOCAL') || rawCat.includes('CASA');

        // Categoria rigorosamente alinhada com o Gênero e a Origem
        let sanitizedCategory: 'CASA_MASCULINO' | 'CASA_FEMININO' | 'VISITANTE_MASCULINO' | 'VISITANTE_FEMININO';
        if (isLocal) {
          sanitizedCategory = targetGender === 'FEMININO' ? 'CASA_FEMININO' : 'CASA_MASCULINO';
        } else {
          sanitizedCategory = targetGender === 'FEMININO' ? 'VISITANTE_FEMININO' : 'VISITANTE_MASCULINO';
        }

        regUpdate.category = sanitizedCategory;
        regUpdate.gender = targetGender;
        regUpdate.origin_type = isLocal ? 'CASA' : 'VISITANTE';

        if (registration?.shirtSize) regUpdate.shirt_size = registration.shirtSize;
        if (registration?.casaProofType !== undefined) {
          regUpdate.casa_proof_type = isLocal ? (registration.casaProofType || null) : null;
        }
        if (registration?.status) regUpdate.status = registration.status;
        if (registration?.financialStatus) regUpdate.financial_status = registration.financialStatus;
        if (registration?.kitDelivered !== undefined) {
          regUpdate.kit_delivered = Boolean(registration.kitDelivered);
          if (registration.kitDelivered && !currentReg.kit_delivered_at) {
            regUpdate.kit_delivered_at = new Date().toISOString();
            regUpdate.kit_delivered_by = operator || 'Administrador Geral';
          }
        }

        // Atualizar PCD_META em kit_notes se fornecido
        let baseNotes = typeof registration?.kitNotes === 'string' 
          ? registration.kitNotes 
          : (typeof currentReg.kit_notes === 'string' ? currentReg.kit_notes : '');

        if (registration?.isPcd !== undefined) {
          baseNotes = baseNotes.replace(/\|?PCD_META:\{.*?\}/g, '').trim();
          if (registration.isPcd) {
            const pcdMeta = {
              isPcd: true,
              pcdType: registration.pcdType || 'OUTRA',
              pcdCid: registration.pcdCid ? registration.pcdCid.trim() : '',
              hasGuide: Boolean(registration.hasGuide),
              guideName: registration.guideName ? registration.guideName.trim() : null,
              guideCpf: registration.guideCpf ? registration.guideCpf.replace(/\D/g, '') : null,
              guidePhone: registration.guidePhone ? registration.guidePhone.trim() : null,
              guideShirtSize: registration.guideShirtSize || null,
            };
            baseNotes = baseNotes ? `${baseNotes}|PCD_META:${JSON.stringify(pcdMeta)}` : `PCD_META:${JSON.stringify(pcdMeta)}`;
          }
          regUpdate.kit_notes = baseNotes;
        } else if (registration?.kitNotes !== undefined) {
          regUpdate.kit_notes = registration.kitNotes;
        }

        if (newStatus === 'CONFIRMED' && !currentReg.paid_at) {
          regUpdate.paid_at = new Date().toISOString();
          regUpdate.financial_status = 'CONFIRMED';
        }

        const { error: regUpErr } = await supabase
          .from('registrations')
          .update(regUpdate)
          .eq('id', regId);

        if (regUpErr) throw regUpErr;

        // 5. Envio opcional de e-mail informativo ao atleta com dados atualizados
        if (sendNotificationEmail && isEmailConfigured()) {
          const finalAthlete = athlete || currentReg.athlete;
          const targetEmail = (finalAthlete?.email || currentReg.athlete?.email || '').trim().toLowerCase();
          if (targetEmail) {
            let pcdMeta: any = null;
            const effectiveNotes = regUpdate.kit_notes || currentReg.kit_notes;
            if (effectiveNotes && typeof effectiveNotes === 'string') {
              const matchPcd = effectiveNotes.match(/PCD_META:(\{.*?\})/);
              if (matchPcd) {
                try { pcdMeta = JSON.parse(matchPcd[1]); } catch {}
              }
            }
            const isPcd = Boolean(
              registration?.isPcd ?? (
                pcdMeta?.isPcd ||
                currentReg.origin_type === 'PCD' ||
                currentReg.category?.includes('PCD') ||
                (currentReg.total_amount_cents && currentReg.total_amount_cents <= 3000)
              )
            );

            // Extrair accessCode de kit_notes se não tiver sido passado explicitamente
            let effectiveAccessCode = accessCode;
            if (!effectiveAccessCode && effectiveNotes) {
              const matchCode = effectiveNotes.match(/ACCESS_CODE:([A-Za-z0-9]+)/i);
              if (matchCode) effectiveAccessCode = matchCode[1].toUpperCase();
            }

            await sendConfirmationEmail({
              athleteName: finalAthlete?.fullName || currentReg.athlete?.full_name || 'Atleta',
              athleteEmail: targetEmail,
              athleteCpf: finalAthlete?.cpf || currentReg.athlete?.cpf || '',
              protocol: currentReg.protocol,
              accessCode: effectiveAccessCode || 'CONSULTE NO PAINEL',
              category: isPcd ? (targetGender === 'FEMININO' ? 'PCD_FEMININO' : 'PCD_MASCULINO') : sanitizedCategory,
              originType: isLocal ? 'CASA' : 'VISITANTE',
              gender: targetGender,
              shirtSize: registration?.shirtSize || currentReg.shirt_size,
              status: newStatus === 'RESERVED' ? 'RESERVED' : 'CONFIRMED',
              totalAmountCents: currentReg.total_amount_cents,
              baseAmountCents: currentReg.base_amount_cents,
              feeCents: currentReg.processing_fee_cents,
              paymentMethod: currentReg.payment_method,
              isPcd,
              pcdType: registration?.pcdType || pcdMeta?.pcdType,
              pcdCid: registration?.pcdCid || pcdMeta?.pcdCid,
              hasGuide: Boolean(registration?.hasGuide ?? pcdMeta?.hasGuide),
              guideName: registration?.guideName || pcdMeta?.guideName,
              guideCpf: registration?.guideCpf || pcdMeta?.guideCpf,
              guidePhone: registration?.guidePhone || pcdMeta?.guidePhone,
              guideShirtSize: registration?.guideShirtSize || pcdMeta?.guideShirtSize,
            }).catch(console.error);
          }
        }

        // Buscar registro consolidado atualizado
        const { data: updatedReg } = await supabase
          .from('registrations')
          .select('*, athlete:athletes(*)')
          .eq('id', regId)
          .single();

        return res.status(200).json({
          success: true,
          message: 'Inscrição e dados do atleta atualizados com sucesso!',
          item: updatedReg,
        });
      }

      return res.status(200).json({ success: true, localOnly: true });
    }

    // 1.2 Confirmação Manual Rápida (Admin Geral / Financeiro)
    if (req.method === 'POST' && req.body?.action === 'manual-confirm') {
      const { id, registrationId, operator, notes, sendEmail = true, accessCode } = req.body;
      const regId = id || registrationId;

      if (!regId) {
        return res.status(400).json({ error: 'ID da inscrição é obrigatório.' });
      }

      if (supabase) {
        const { data: currentReg, error: fetchErr } = await supabase
          .from('registrations')
          .select('*, athlete:athletes(*)')
          .eq('id', regId)
          .single();

        if (fetchErr || !currentReg) {
          return res.status(404).json({ error: 'Inscrição não encontrada.' });
        }

        if (currentReg.status !== 'CONFIRMED') {
          const sz = currentReg.shirt_size || 'M';
          const { data: stock } = await supabase
            .from('shirt_inventory')
            .select('reserved_count, confirmed_count')
            .eq('size', sz)
            .single();

          if (stock) {
            await supabase
              .from('shirt_inventory')
              .update({
                reserved_count: Math.max(0, stock.reserved_count - 1),
                confirmed_count: (stock.confirmed_count || 0) + 1,
                updated_at: new Date().toISOString(),
              })
              .eq('size', sz);
          }
        }

        const now = new Date().toISOString();
        const { error: upErr } = await supabase
          .from('registrations')
          .update({
            status: 'CONFIRMED',
            financial_status: 'CONFIRMED',
            paid_at: currentReg.paid_at || now,
            kit_notes: notes ? `${currentReg.kit_notes ? currentReg.kit_notes + ' | ' : ''}Confirmação Manual: ${notes} (por ${operator || 'Admin'})` : currentReg.kit_notes,
            updated_at: now,
          })
          .eq('id', regId);

        if (upErr) throw upErr;

        if (sendEmail && isEmailConfigured() && currentReg.athlete?.email) {
          let pcdMeta: any = null;
          if (currentReg.kit_notes && typeof currentReg.kit_notes === 'string') {
            const matchPcd = currentReg.kit_notes.match(/PCD_META:(\{.*?\})/);
            if (matchPcd) {
              try { pcdMeta = JSON.parse(matchPcd[1]); } catch {}
            }
          }
          const isPcd = Boolean(
            pcdMeta?.isPcd ||
            currentReg.origin_type === 'PCD' ||
            currentReg.category?.includes('PCD') ||
            (currentReg.total_amount_cents && currentReg.total_amount_cents <= 3000)
          );

          await sendConfirmationEmail({
            athleteName: currentReg.athlete.full_name,
            athleteEmail: currentReg.athlete.email.trim().toLowerCase(),
            athleteCpf: currentReg.athlete.cpf || '',
            protocol: currentReg.protocol,
            accessCode: accessCode || 'CONFIRMADO',
            category: isPcd ? (currentReg.gender === 'FEMININO' ? 'PCD_FEMININO' : 'PCD_MASCULINO') : currentReg.category,
            originType: currentReg.origin_type || (isPcd ? 'PCD' : undefined),
            gender: currentReg.gender,
            shirtSize: currentReg.shirt_size,
            status: 'CONFIRMED',
            totalAmountCents: currentReg.total_amount_cents,
            baseAmountCents: currentReg.base_amount_cents,
            feeCents: currentReg.processing_fee_cents,
            paymentMethod: currentReg.payment_method,
            isPcd,
            pcdType: pcdMeta?.pcdType,
            pcdCid: pcdMeta?.pcdCid,
            hasGuide: Boolean(pcdMeta?.hasGuide),
            guideName: pcdMeta?.guideName,
            guideCpf: pcdMeta?.guideCpf,
            guidePhone: pcdMeta?.guidePhone,
            guideShirtSize: pcdMeta?.guideShirtSize,
          }).catch(console.error);
        }

        return res.status(200).json({
          success: true,
          message: `Inscrição ${currentReg.protocol} confirmada com sucesso!`,
        });
      }

      return res.status(200).json({ success: true, localOnly: true });
    }

    // 1.3 Entrega de Kit Oficial com baixa segura no Supabase (preservando metadados de kit_notes e suportando Número de Peito)
    if (req.method === 'POST' && req.body?.action === 'deliver-kit') {
      const { id, registrationId, deliveredBy, notes, bibNumber } = req.body;
      const regId = id || registrationId;

      if (!regId) {
        return res.status(400).json({ error: 'ID da inscrição é obrigatório.' });
      }

      if (supabase) {
        const { data: existingReg, error: findErr } = await supabase
          .from('registrations')
          .select('id, protocol, status, kit_delivered, kit_delivered_at, kit_delivered_by, kit_notes, shirt_size')
          .eq('id', regId)
          .single();

        if (findErr || !existingReg) {
          return res.status(404).json({ error: 'Inscrição não encontrada no banco de dados.' });
        }

        if (existingReg.status !== 'CONFIRMED') {
          return res.status(400).json({
            error: `Não é permitido entregar o kit: a inscrição ${existingReg.protocol} está com status "${existingReg.status}" (não quitada).`,
          });
        }

        if (existingReg.kit_delivered) {
          return res.status(409).json({
            error: `Kit da inscrição ${existingReg.protocol} já foi entregue anteriormente por ${existingReg.kit_delivered_by || 'Atendente'}!`,
          });
        }

        const now = new Date().toISOString();
        let preservedNotes = typeof existingReg.kit_notes === 'string' ? existingReg.kit_notes : '';
        preservedNotes = preservedNotes
          .replace(/\|?BIB:[^|]+/g, '')
          .replace(/\|?KIT_DELIVERY_NOTE:[^|]+/g, '');

        if (bibNumber && String(bibNumber).trim()) {
          const cleanBib = encodeURIComponent(String(bibNumber).trim());
          preservedNotes = preservedNotes ? `${preservedNotes}|BIB:${cleanBib}` : `BIB:${cleanBib}`;
        }
        if (notes && String(notes).trim()) {
          const cleanNote = encodeURIComponent(String(notes).trim());
          preservedNotes = preservedNotes ? `${preservedNotes}|KIT_DELIVERY_NOTE:${cleanNote}` : `KIT_DELIVERY_NOTE:${cleanNote}`;
        }

        const { error: kitErr } = await supabase
          .from('registrations')
          .update({
            kit_delivered: true,
            kit_delivered_at: now,
            kit_delivered_by: deliveredBy || 'Mesa Oficial',
            kit_notes: preservedNotes || null,
            updated_at: now,
          })
          .eq('id', regId);

        if (kitErr) throw kitErr;

        return res.status(200).json({
          success: true,
          kitDeliveredAt: now,
          kitDeliveredBy: deliveredBy || 'Mesa Oficial',
          kitNotes: preservedNotes || null,
          message: 'Baixa de kit registrada no banco com sucesso!',
        });
      }

      return res.status(200).json({ success: true, localOnly: true });
    }

    // 1.3b Estorno / Reversão de Baixa de Kit (caso entregue por engano)
    if (req.method === 'POST' && req.body?.action === 'undo-deliver-kit') {
      const { id, registrationId } = req.body;
      const regId = id || registrationId;

      if (!regId) {
        return res.status(400).json({ error: 'ID da inscrição é obrigatório.' });
      }

      if (supabase) {
        const { data: existingReg } = await supabase
          .from('registrations')
          .select('id, kit_notes')
          .eq('id', regId)
          .single();

        let preservedNotes = typeof existingReg?.kit_notes === 'string' ? existingReg.kit_notes : '';
        preservedNotes = preservedNotes
          .replace(/\|?BIB:[^|]+/g, '')
          .replace(/\|?KIT_DELIVERY_NOTE:[^|]+/g, '');

        const now = new Date().toISOString();
        const { error: undoErr } = await supabase
          .from('registrations')
          .update({
            kit_delivered: false,
            kit_delivered_at: null,
            kit_delivered_by: null,
            kit_notes: preservedNotes || null,
            updated_at: now,
          })
          .eq('id', regId);

        if (undoErr) throw undoErr;

        return res.status(200).json({
          success: true,
          kitNotes: preservedNotes || null,
          message: 'Baixa de kit estornada com sucesso. O kit voltou para o status Pendente de Retirada.',
        });
      }

      return res.status(200).json({ success: true, localOnly: true });
    }

    // 1.4 Limpeza completa para início da Fase de Produção Real (zera inscrições de teste, atletas de teste e contadores)
    if (req.method === 'POST' && req.body?.action === 'reset-production') {
      if (supabase) {
        const { data: allRegs } = await supabase.from('registrations').select('id');
        const regCount = allRegs?.length || 0;

        // 1. Limpar eventos de pagamento se existirem
        try {
          await supabase.from('payment_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        } catch {}

        // 2. Limpar todas as inscrições de teste
        await supabase.from('registrations').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // 3. Limpar todos os atletas de teste
        await supabase.from('athletes').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // 4. Zerar contadores de camisas mantendo modo Sob Demanda (9999)
        const nowIso = new Date().toISOString();
        await supabase
          .from('shirt_inventory')
          .update({
            total_stock: 9999,
            reserved_count: 0,
            confirmed_count: 0,
            is_active: true,
            updated_at: nowIso,
          })
          .gt('display_order', 0);

        // 5. Limpar estado em memória
        memoryStore.registrations.clear();
        memoryStore.registrationsByCpf.clear();
        for (const s of memoryStore.shirts.values()) {
          s.totalStock = 9999;
          s.reservedCount = 0;
          s.confirmedCount = 0;
        }

        return res.status(200).json({
          success: true,
          clearedRegistrations: regCount,
          message: 'Base de dados limpa e preparada para produção oficial!',
        });
      }

      return res.status(200).json({ success: true, clearedRegistrations: 0 });
    }

    // 1. DELETE: Excluir ou cancelar inscrição específica ou limpar testes
    if (req.method === 'DELETE' || (req.method === 'POST' && (req.body?.action === 'delete' || req.body?.action === 'clear-tests'))) {
      const id = (req.query.id as string) || req.body?.id;
      const protocol = (req.query.protocol as string) || req.body?.protocol;
      const action = req.body?.action || req.query.action;

      if (action === 'clear-tests') {
        if (supabase) {
          // Deletar inscrições de teste em estado RESERVED
          const { data: testRegs } = await supabase
            .from('registrations')
            .select('id, shirt_size, status')
            .eq('status', 'RESERVED');

          if (testRegs && testRegs.length > 0) {
            for (const tr of testRegs) {
              await supabase.from('registrations').delete().eq('id', tr.id);
              // Devolver estoque
              if (tr.shirt_size) {
                const { data: stock } = await supabase
                  .from('shirt_inventory')
                  .select('reserved_count')
                  .eq('size', tr.shirt_size)
                  .single();
                if (stock) {
                  await supabase
                    .from('shirt_inventory')
                    .update({
                      reserved_count: Math.max(0, stock.reserved_count - 1),
                      updated_at: new Date().toISOString(),
                    })
                    .eq('size', tr.shirt_size);
                }
              }
            }
          }
          return res.status(200).json({ success: true, cleared: testRegs?.length || 0 });
        }
        return res.status(200).json({ success: true, cleared: 0 });
      }

      if (!id && !protocol) {
        return res.status(400).json({ error: 'ID ou Protocolo da inscrição é obrigatório para exclusão.' });
      }

      if (supabase) {
        // Obter inscrição para devolver estoque se pendente
        let findQuery = supabase.from('registrations').select('id, shirt_size, status');
        if (id) findQuery = findQuery.eq('id', id);
        else if (protocol) findQuery = findQuery.eq('protocol', protocol);

        const { data: foundReg } = await findQuery.single();

        let delQuery = supabase.from('registrations').delete();
        if (id) delQuery = delQuery.eq('id', id);
        else if (protocol) delQuery = delQuery.eq('protocol', protocol);

        const { error: delErr } = await delQuery;
        if (delErr) throw delErr;

        if (foundReg && foundReg.shirt_size) {
          const { data: stock } = await supabase
            .from('shirt_inventory')
            .select('reserved_count, confirmed_count')
            .eq('size', foundReg.shirt_size)
            .single();
          if (stock) {
            if (foundReg.status === 'RESERVED') {
              await supabase
                .from('shirt_inventory')
                .update({
                  reserved_count: Math.max(0, (stock.reserved_count || 0) - 1),
                  updated_at: new Date().toISOString(),
                })
                .eq('size', foundReg.shirt_size);
            } else if (foundReg.status === 'CONFIRMED') {
              await supabase
                .from('shirt_inventory')
                .update({
                  confirmed_count: Math.max(0, (stock.confirmed_count || 0) - 1),
                  updated_at: new Date().toISOString(),
                })
                .eq('size', foundReg.shirt_size);
            }
          }
        }

        return res.status(200).json({ success: true, message: 'Inscrição removida com sucesso.' });
      }

      // MemoryStore fallback
      if (protocol) memoryStore.registrations.delete(protocol);
      return res.status(200).json({ success: true, message: 'Inscrição removida da memória.' });
    }

    // 2. GET: Listar inscrições com paginação e busca robusta
    const page = parseInt((req.query.page as string) || '1', 10);
    const pageSize = parseInt((req.query.pageSize as string) || '20', 10);
    const search = ((req.query.search as string) || '').trim();
    const category = (req.query.category as string) || 'ALL';
    const status = (req.query.status as string) || 'ALL';

    if (supabase) {
      let query = supabase
        .from('registrations')
        .select('*, athlete:athletes(*)', { count: 'exact' });

      if (category !== 'ALL') {
        query = query.eq('category', category);
      }
      if (status !== 'ALL') {
        query = query.eq('status', status);
      }
      if (search) {
        // Buscar atletas com match em nome ou CPF
        const { data: matchedAthletes } = await supabase
          .from('athletes')
          .select('id')
          .or(`full_name.ilike.%${search}%,cpf.ilike.%${search}%`);

        const athleteIds = (matchedAthletes || []).map((a) => a.id);
        if (athleteIds.length > 0) {
          query = query.or(`protocol.ilike.%${search}%,athlete_id.in.(${athleteIds.join(',')})`);
        } else {
          query = query.ilike('protocol', `%${search}%`);
        }
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, count, error } = await query.range(from, to).order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Conciliação automática em tempo real com Asaas para reservas Pix pendentes recentes
      const asaasKey = normalizeKey(process.env.ASAAS_API_KEY || '');
      const asaasEnv = normalizeKey(process.env.ASAAS_ENVIRONMENT || '').toLowerCase();
      const isProdAsaas =
        asaasEnv === 'production' ||
        asaasEnv === 'prod' ||
        asaasKey.startsWith('$aact_prod_');
      const asaasBaseUrl = isProdAsaas
        ? 'https://api.asaas.com/v3'
        : 'https://api-sandbox.asaas.com/v3';

      const pendingRows = (data || [])
        .filter((r: any) => r.status === 'RESERVED' && r.asaas_payment_id && !String(r.asaas_payment_id).startsWith('pay_mock_'))
        .slice(0, 8);

      if (asaasKey && pendingRows.length > 0) {
        await Promise.all(
          pendingRows.map(async (row: any) => {
            try {
              const payRes = await fetch(`${asaasBaseUrl}/payments/${row.asaas_payment_id}`, {
                headers: {
                  access_token: asaasKey,
                  'User-Agent': 'Corrida-LajesPintadas-Backend/1.0',
                },
              });
              if (!payRes.ok) return;
              const payJson = await payRes.json();
              if (!['CONFIRMED', 'RECEIVED'].includes(payJson.status)) return;

              const nowIso = new Date().toISOString();
              row.status = 'CONFIRMED';
              row.financial_status = payJson.status === 'RECEIVED' ? 'RECEIVED' : 'CONFIRMED';
              row.paid_at = nowIso;

              await supabase
                .from('registrations')
                .update({
                  status: 'CONFIRMED',
                  financial_status: row.financial_status,
                  paid_at: nowIso,
                  updated_at: nowIso,
                })
                .eq('id', row.id);

              if (row.shirt_size) {
                const { data: sInv } = await supabase
                  .from('shirt_inventory')
                  .select('reserved_count, confirmed_count')
                  .eq('size', row.shirt_size)
                  .maybeSingle();
                if (sInv) {
                  await supabase
                    .from('shirt_inventory')
                    .update({
                      reserved_count: Math.max(0, (sInv.reserved_count || 0) - 1),
                      confirmed_count: (sInv.confirmed_count || 0) + 1,
                      updated_at: nowIso,
                    })
                    .eq('size', row.shirt_size);
                }
              }

              const rawNotes = typeof row.kit_notes === 'string' ? row.kit_notes : '';
              const sendingMatch = rawNotes.match(/EMAIL_SENDING:(\d+)/);
              const isSending = sendingMatch && Date.now() - Number(sendingMatch[1]) < 20000;
              if (!rawNotes.includes('CONFIRMATION_EMAIL_SENT:true') && !isSending && isEmailConfigured() && row.athlete?.email) {
                const codeMatch = rawNotes.match(/ACCESS_CODE:([A-Za-z0-9]+)/i);
                const extractedCode = codeMatch ? codeMatch[1].toUpperCase() : 'CONFIRMADO';
                const cleanNotes = rawNotes.replace(/\|?EMAIL_SENDING:\d+/g, '');
                await supabase
                  .from('registrations')
                  .update({
                    kit_notes: cleanNotes ? `${cleanNotes}|EMAIL_SENDING:${Date.now()}` : `EMAIL_SENDING:${Date.now()}`,
                  })
                  .eq('id', row.id);

                const sentOk = await sendConfirmationEmail({
                  athleteName: row.athlete.full_name || 'Atleta',
                  athleteEmail: row.athlete.email,
                  athleteCpf: row.athlete.cpf || '',
                  protocol: row.protocol,
                  accessCode: extractedCode,
                  category: row.category,
                  originType: row.origin_type,
                  gender: row.gender,
                  shirtSize: row.shirt_size,
                  status: 'CONFIRMED',
                  totalAmountCents: row.total_amount_cents,
                  baseAmountCents: row.base_amount_cents,
                  feeCents: row.processing_fee_cents,
                  paymentMethod: row.payment_method,
                });

                if (sentOk) {
                  const updatedNotes = cleanNotes ? `${cleanNotes}|CONFIRMATION_EMAIL_SENT:true` : 'CONFIRMATION_EMAIL_SENT:true';
                  row.kit_notes = updatedNotes;
                  await supabase
                    .from('registrations')
                    .update({ kit_notes: updatedNotes, updated_at: nowIso })
                    .eq('id', row.id);
                } else {
                  await supabase
                    .from('registrations')
                    .update({ kit_notes: cleanNotes })
                    .eq('id', row.id);
                }
              }
            } catch {}
          })
        );
      }

      const enrichedItems = (data || []).map((row: any) => {
        const notes = typeof row.kit_notes === 'string' ? row.kit_notes : '';
        if (!row.access_code && notes) {
          const m = notes.match(/ACCESS_CODE:([A-Za-z0-9]+)/);
          if (m) row.access_code = m[1];
        }
        if (!row.batch_id && notes) {
          const m = notes.match(/\|BATCH:([A-Za-z0-9_-]+)/);
          if (m) row.batch_id = m[1];
        }
        if (!row.batch_name && notes) {
          const m = notes.match(/\|BATCH_NAME:([^|]+)/);
          if (m) {
            try { row.batch_name = decodeURIComponent(m[1]); } catch { row.batch_name = m[1]; }
          }
        }
        if (!row.channel && notes) {
          const m = notes.match(/\|CHANNEL:([A-Za-z0-9_-]+)/);
          if (m) row.channel = m[1];
        }
        return row;
      });

      const durationMs = Date.now() - startTime;
      return res.status(200).json({
        items: enrichedItems,
        totalCount: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
        latencyMs: durationMs,
      });
    }

    // Fallback motor em memória
    const paginated = memoryStore.getPaginatedRegistrations({
      page,
      pageSize,
      search,
      category,
      status,
    });

    const durationMs = Date.now() - startTime;
    return res.status(200).json({
      ...paginated,
      latencyMs: durationMs,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao processar inscrições' });
  }
}
