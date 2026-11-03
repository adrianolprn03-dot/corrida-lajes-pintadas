// ==============================================================================
// VERCEL SERVERLESS FUNCTION: /api/test-email
// Endpoint para validação e teste de disparo do e-mail institucional
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
    return res.status(503).json({
      error: 'Servidor SMTP não configurado. Verifique as variáveis de ambiente SMTP_HOST, SMTP_USER e SMTP_PASS.',
    });
  }

  const { toEmail, athleteName } = req.body || {};

  if (!toEmail || typeof toEmail !== 'string' || !toEmail.includes('@')) {
    return res.status(400).json({ error: 'Informe um endereço de e-mail válido (ex: seuemail@gmail.com).' });
  }

  const cleanEmail = toEmail.trim().toLowerCase();
  const name = typeof athleteName === 'string' && athleteName.trim() ? athleteName.trim() : 'Atleta de Teste';
  const protocol = `LP5-${Math.floor(100000 + Math.random() * 900000)}`;

  try {
    const sampleAccessCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const isPcd = Boolean(req.body?.isPcd);

    const success = await sendConfirmationEmail({
      athleteName: name,
      athleteEmail: cleanEmail,
      athleteCpf: '12345678900',
      protocol,
      accessCode: sampleAccessCode,
      category: isPcd ? 'PCD_MASCULINO' : 'VISITANTE_MASCULINO',
      gender: 'MASCULINO',
      shirtSize: 'M',
      status: 'CONFIRMED',
      paymentMethod: 'PIX',
      totalAmountCents: isPcd ? 2750 : 5500,
      baseAmountCents: isPcd ? 2500 : 5000,
      feeCents: isPcd ? 250 : 500,
      isPcd,
      pcdType: isPcd ? 'Deficiência Visual' : undefined,
      pcdCid: isPcd ? 'H54.0' : undefined,
      hasGuide: isPcd,
      guideName: isPcd ? 'Carlos Alberto (Atleta-Guia)' : undefined,
      guideCpf: isPcd ? '98765432100' : undefined,
      guidePhone: isPcd ? '(84) 99999-8888' : undefined,
      guideShirtSize: isPcd ? 'G' : undefined,
    });

    if (success) {
      return res.status(200).json({
        success: true,
        message: `Comprovante de confirmação oficial enviado com sucesso para ${cleanEmail}!`,
        protocol,
        recipient: cleanEmail,
        timestamp: new Date().toISOString(),
      });
    } else {
      return res.status(500).json({
        error: 'O servidor SMTP do Titan Mail recusou o envio ou ocorreu um erro de conexão.',
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      error: err.message || 'Erro interno ao disparar e-mail.',
    });
  }
}
