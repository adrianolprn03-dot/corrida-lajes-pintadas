// ==============================================================================
// VERCEL SERVERLESS FUNCTION: /api/resend-access-email
// Endpoint para envio ou reenvio do e-mail com Protocolo e Código de Acesso
// ==============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendConfirmationEmail, isEmailConfigured } from './lib/email.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  if (!isEmailConfigured()) {
    return res.status(503).json({ error: 'Servidor de e-mail SMTP não está configurado.' });
  }

  const { athleteName, athleteEmail, athleteCpf, protocol, accessCode, category, gender, shirtSize, status } = req.body || {};

  if (!athleteEmail || !protocol || !accessCode) {
    return res.status(400).json({ error: 'E-mail, protocolo e código de acesso são obrigatórios.' });
  }

  try {
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
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro interno ao reenviar e-mail.' });
  }
}
