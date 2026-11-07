// ==============================================================================
// VERCEL SERVERLESS FUNCTION: /api/admin-operators
// Gestão segura de operadores, perfis RBAC e autenticação no painel administrativo
// ==============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { memoryStore, StoredOperator } from './lib/state.js';

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

const OPERATORS_AUDIT_RESOURCE = 'ADMIN_OPERATORS_STATE';

async function loadOperatorsFromDb(supabase: SupabaseClient | null): Promise<StoredOperator[]> {
  if (!supabase) {
    return memoryStore.getOperators();
  }
  try {
    const { data: logs } = await supabase
      .from('audit_logs')
      .select('details')
      .eq('resource_type', OPERATORS_AUDIT_RESOURCE)
      .order('created_at', { ascending: false })
      .limit(1);

    if (logs && logs.length > 0 && logs[0].details && Array.isArray((logs[0].details as any).operators)) {
      const dbOps = (logs[0].details as any).operators as StoredOperator[];
      if (dbOps.length > 0) {
        memoryStore.operators.clear();
        for (const op of dbOps) {
          if (op && op.username) {
            memoryStore.operators.set(op.username.trim().toLowerCase(), op);
          }
        }
      }
    }
  } catch (err) {
    console.warn('Falha ao carregar operadores do Supabase, usando memória:', err);
  }
  return memoryStore.getOperators();
}

async function saveOperatorsToDb(supabase: SupabaseClient | null, actor = 'ADMIN'): Promise<StoredOperator[]> {
  const all = memoryStore.getOperators();
  if (!supabase) return all;
  try {
    await supabase.from('audit_logs').insert({
      actor_id: actor,
      action: 'SYNC_OPERATORS',
      resource_type: OPERATORS_AUDIT_RESOURCE,
      details: { operators: all },
    });
  } catch (err) {
    console.warn('Falha ao persistir operadores no Supabase:', err);
  }
  return all;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabase();

  try {
    // Sempre sincronizar o estado da instância serverless com o banco antes de operar
    await loadOperatorsFromDb(supabase);

    // 1. GET: Retorna lista de operadores cadastrados
    if (req.method === 'GET') {
      const ops = memoryStore.getOperators();
      return res.status(200).json({
        success: true,
        operators: ops,
      });
    }

    if (req.method === 'POST') {
      const { action, username, password, operator, id } = req.body || {};

      // 2. Ação de Autenticação / Login
      if (action === 'auth') {
        const cleanUser = String(username || '').trim().toLowerCase().replace(/^@/, '');
        const cleanPass = String(password || '').trim();

        if (!cleanUser || !cleanPass) {
          return res.status(400).json({ success: false, error: 'Usuário e senha são obrigatórios.' });
        }

        // Autenticar com o mapa de operadores persistido do sistema
        const authenticated = memoryStore.authenticateOperator(cleanUser, cleanPass);
        if (authenticated) {
          await saveOperatorsToDb(supabase, authenticated.username);
          return res.status(200).json({
            success: true,
            operator: {
              username: authenticated.username,
              name: authenticated.name,
              role: authenticated.role,
              email: authenticated.email,
              loggedAt: new Date().toISOString(),
            },
          });
        }

        return res.status(401).json({
          success: false,
          error: 'Credenciais incorretas. Verifique o usuário e a senha digitados.',
        });
      }

      // 3. Ação de Salvar / Criar / Editar Operador
      if (action === 'save') {
        if (!operator || !operator.name || !operator.username) {
          return res.status(400).json({ success: false, error: 'Nome e usuário são obrigatórios.' });
        }

        // Se o username mudou durante edição (mesmo id, outro username), remover chave antiga
        if (operator.id) {
          for (const [k, existingOp] of memoryStore.operators.entries()) {
            if (existingOp.id === operator.id && k !== operator.username.trim().toLowerCase()) {
              memoryStore.operators.delete(k);
            }
          }
        }

        const saved = memoryStore.saveOperator(operator as StoredOperator);
        const operators = await saveOperatorsToDb(supabase, saved.username);

        return res.status(200).json({
          success: true,
          operator: saved,
          operators,
        });
      }

      // 4. Ação de Excluir Operador
      if (action === 'delete') {
        const targetId = id || username;
        if (!targetId) {
          return res.status(400).json({ success: false, error: 'ID do operador não informado.' });
        }

        const deleted = memoryStore.deleteOperator(targetId);
        const operators = deleted ? await saveOperatorsToDb(supabase, 'ADMIN') : memoryStore.getOperators();
        return res.status(200).json({
          success: deleted,
          operators,
          message: deleted ? 'Operador excluído com sucesso.' : 'Não foi possível excluir o operador principal.',
        });
      }

      // 5. Ação de Listagem
      if (action === 'list') {
        return res.status(200).json({
          success: true,
          operators: memoryStore.getOperators(),
        });
      }
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (err: any) {
    console.error('Erro na API /api/admin-operators:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Erro interno ao processar requisição de operadores.',
    });
  }
}
