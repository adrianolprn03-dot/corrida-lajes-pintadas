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

      const { athleteName, athleteEmail, athleteCpf, protocol, accessCode, category, gender, shirtSize, status } = req.body;
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
        gender: gender || 'MASCULINO',
        shirtSize: shirtSize || 'M',
        status: status === 'RESERVED' ? 'RESERVED' : 'CONFIRMED',
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
        if (registration?.category) regUpdate.category = registration.category;
        if (registration?.originType) regUpdate.origin_type = registration.originType;
        if (registration?.gender) regUpdate.gender = registration.gender;
        if (registration?.shirtSize) regUpdate.shirt_size = registration.shirtSize;
        if (registration?.casaProofType !== undefined) regUpdate.casa_proof_type = registration.casaProofType || null;
        if (registration?.status) regUpdate.status = registration.status;
        if (registration?.financialStatus) regUpdate.financial_status = registration.financialStatus;
        if (registration?.kitDelivered !== undefined) {
          regUpdate.kit_delivered = Boolean(registration.kitDelivered);
          if (registration.kitDelivered && !currentReg.kit_delivered_at) {
            regUpdate.kit_delivered_at = new Date().toISOString();
            regUpdate.kit_delivered_by = operator || 'Administrador Geral';
          }
        }
        if (registration?.kitNotes !== undefined) regUpdate.kit_notes = registration.kitNotes;
        if (newStatus === 'CONFIRMED' && !currentReg.paid_at) {
          regUpdate.paid_at = new Date().toISOString();
          regUpdate.financial_status = 'CONFIRMED';
        }

        const { error: regUpErr } = await supabase
          .from('registrations')
          .update(regUpdate)
          .eq('id', regId);

        if (regUpErr) throw regUpErr;

        // 5. Envio opcional de e-mail informativo ao atleta
        if (sendNotificationEmail && isEmailConfigured()) {
          const finalAthlete = athlete || currentReg.athlete;
          const targetEmail = (finalAthlete?.email || currentReg.athlete?.email || '').trim().toLowerCase();
          if (targetEmail) {
            await sendConfirmationEmail({
              athleteName: finalAthlete?.fullName || currentReg.athlete?.full_name || 'Atleta',
              athleteEmail: targetEmail,
              athleteCpf: finalAthlete?.cpf || currentReg.athlete?.cpf || '',
              protocol: currentReg.protocol,
              accessCode: accessCode || 'CONSULTE NO PAINEL',
              category: registration?.category || currentReg.category,
              gender: registration?.gender || currentReg.gender,
              shirtSize: registration?.shirtSize || currentReg.shirt_size,
              status: newStatus === 'RESERVED' ? 'RESERVED' : 'CONFIRMED',
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
          await sendConfirmationEmail({
            athleteName: currentReg.athlete.full_name,
            athleteEmail: currentReg.athlete.email.trim().toLowerCase(),
            athleteCpf: currentReg.athlete.cpf || '',
            protocol: currentReg.protocol,
            accessCode: accessCode || 'CONFIRMADO',
            category: currentReg.category,
            gender: currentReg.gender,
            shirtSize: currentReg.shirt_size,
            status: 'CONFIRMED',
          }).catch(console.error);
        }

        return res.status(200).json({
          success: true,
          message: `Inscrição ${currentReg.protocol} confirmada com sucesso!`,
        });
      }

      return res.status(200).json({ success: true, localOnly: true });
    }

    // 1.3 Entrega de Kit Oficial com baixa no Supabase
    if (req.method === 'POST' && req.body?.action === 'deliver-kit') {
      const { id, registrationId, deliveredBy, notes } = req.body;
      const regId = id || registrationId;

      if (!regId) {
        return res.status(400).json({ error: 'ID da inscrição é obrigatório.' });
      }

      if (supabase) {
        const now = new Date().toISOString();
        const { error: kitErr } = await supabase
          .from('registrations')
          .update({
            kit_delivered: true,
            kit_delivered_at: now,
            kit_delivered_by: deliveredBy || 'Mesa Oficial',
            kit_notes: notes || null,
            updated_at: now,
          })
          .eq('id', regId);

        if (kitErr) throw kitErr;

        return res.status(200).json({
          success: true,
          message: 'Baixa de kit registrada no banco com sucesso!',
        });
      }

      return res.status(200).json({ success: true, localOnly: true });
    }

    // 1. DELETE: Excluir ou cancelar inscrição específica ou limpar testes
    if (req.method === 'DELETE' || (req.method === 'POST' && req.body?.action === 'delete')) {
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

        if (foundReg && foundReg.status === 'RESERVED' && foundReg.shirt_size) {
          const { data: stock } = await supabase
            .from('shirt_inventory')
            .select('reserved_count')
            .eq('size', foundReg.shirt_size)
            .single();
          if (stock) {
            await supabase
              .from('shirt_inventory')
              .update({
                reserved_count: Math.max(0, stock.reserved_count - 1),
                updated_at: new Date().toISOString(),
              })
              .eq('size', foundReg.shirt_size);
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

      const durationMs = Date.now() - startTime;
      return res.status(200).json({
        items: data || [],
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
