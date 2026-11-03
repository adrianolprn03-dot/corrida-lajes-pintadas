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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabase();

  try {
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

        // Tentar autenticação via Supabase Auth se configurado
        if (supabase && cleanUser.includes('@')) {
          try {
            const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
              email: cleanUser,
              password: cleanPass,
            });
            if (!authErr && authData?.user) {
              // Buscar perfil em admin_users se existir
              const { data: adminUser } = await supabase
                .from('admin_users')
                .select('*')
                .eq('id', authData.user.id)
                .maybeSingle();

              const sessionData = {
                username: adminUser?.email?.split('@')[0] || cleanUser.split('@')[0],
                name: adminUser?.full_name || authData.user.email?.split('@')[0] || 'Administrador',
                role: (adminUser?.role === 'OPERATOR' ? 'ATENDIMENTO' : 'ADMIN_GERAL'),
                email: authData.user.email || cleanUser,
                loggedAt: new Date().toISOString(),
              };

              return res.status(200).json({
                success: true,
                operator: sessionData,
              });
            }
          } catch (e) {
            // Continua para o fallback de operadores em memória
          }
        }

        // Autenticar com o mapa de operadores do sistema
        const authenticated = memoryStore.authenticateOperator(cleanUser, cleanPass);
        if (authenticated) {
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

      // 3. Ação de Salvar / Criar Operador
      if (action === 'save') {
        if (!operator || !operator.name || !operator.username) {
          return res.status(400).json({ success: false, error: 'Nome e usuário são obrigatórios.' });
        }

        const saved = memoryStore.saveOperator(operator as StoredOperator);

        // Se Supabase estiver ativo e a tabela admin_users existir, tentar sincronizar
        if (supabase && saved.email) {
          try {
            await supabase.from('admin_users').upsert({
              email: saved.email,
              full_name: saved.name,
              role: saved.role === 'ADMIN_GERAL' ? 'ADMIN' : 'OPERATOR',
              is_active: saved.isActive,
            }, { onConflict: 'email' });
          } catch {}
        }

        return res.status(200).json({
          success: true,
          operator: saved,
        });
      }

      // 4. Ação de Excluir Operador
      if (action === 'delete') {
        const targetId = id || username;
        if (!targetId) {
          return res.status(400).json({ success: false, error: 'ID do operador não informado.' });
        }

        const deleted = memoryStore.deleteOperator(targetId);
        return res.status(200).json({
          success: deleted,
          message: deleted ? 'Operador excluído com sucesso.' : 'Não foi possível excluir o operador.',
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
