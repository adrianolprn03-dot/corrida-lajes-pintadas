// ==============================================================================
// EMAIL DISPATCHER: HostGator SMTP & Template Oficial de Confirmação
// Prefeitura Municipal de Lajes Pintadas / RN - 5ª Corrida de Emancipação 2026
// ==============================================================================

import nodemailer from 'nodemailer';

export interface RegistrationEmailData {
  athleteName: string;
  athleteEmail: string;
  athleteCpf: string;
  protocol: string;
  category: string;
  gender: string;
  shirtSize: string;
  accessCode?: string;
  status?: 'CONFIRMED' | 'RESERVED';
  paymentMethod?: string;
  originType?: string;
  pixCopyPaste?: string;
  invoiceUrl?: string;
  // Financeiro & Valores
  totalAmountCents?: number;
  baseAmountCents?: number;
  feeCents?: number;
  paidAmountFormatted?: string;
  // PCD e Atleta-Guia
  isPcd?: boolean;
  pcdType?: string;
  pcdCid?: string;
  hasGuide?: boolean;
  guideName?: string;
  guideCpf?: string;
  guidePhone?: string;
  guideShirtSize?: string;
}

function getTransporter() {
  const host = (process.env.SMTP_HOST || '').trim().replace(/^["']|["']$/g, '').replace(/\.+$/, '');
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = (process.env.SMTP_USER || '').trim().replace(/^["']|["']$/g, '');
  const pass = (process.env.SMTP_PASS || '').trim().replace(/^["']|["']$/g, '');
  const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: {
      user,
      pass,
    },
    // Suporte flexível para certificados SSL da HostGator (evita erros de SNI em servidores compartilhados)
    tls: {
      rejectUnauthorized: false,
    },
  });
}

export function isEmailConfigured(): boolean {
  const host = (process.env.SMTP_HOST || '').trim();
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();
  return Boolean(host && user && pass);
}

export async function sendConfirmationEmail(data: RegistrationEmailData): Promise<boolean> {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn('[Email] Configurações de SMTP do HostGator não encontradas. E-mail não enviado para:', data.athleteEmail);
    return false;
  }

  const fromName = process.env.SMTP_FROM_NAME || '5ª Corrida de Emancipação de Lajes Pintadas';
  const fromEmail = (process.env.SMTP_USER || '').trim().replace(/^["']|["']$/g, '');
  const sender = `"${fromName}" <${fromEmail}>`;

  // Detecção robusta de Categoria PCD
  const isPcd = Boolean(
    data.isPcd ||
    data.originType === 'PCD' ||
    data.category?.toUpperCase().includes('PCD') ||
    (typeof data.totalAmountCents === 'number' && data.totalAmountCents > 0 && data.totalAmountCents <= 3000)
  );

  const categoryName = isPcd
    ? (data.gender === 'FEMININO' ? 'Atleta PCD / Inclusão Feminino (5 km)' : 'Atleta PCD / Inclusão Masculino (5 km)')
    : (
      data.category === 'PCD_MASCULINO' ? 'Atleta PCD / Inclusão Masculino (5 km)' :
      data.category === 'PCD_FEMININO' ? 'Atleta PCD / Inclusão Feminino (5 km)' :
      data.category === 'CASA_MASCULINO' || data.category === 'LOCAL_MASCULINO' ? 'Atleta Local Masculino (5 km)' :
      data.category === 'CASA_FEMININO' || data.category === 'LOCAL_FEMININO' ? 'Atleta Local Feminino (5 km)' :
      data.category === 'VISITANTE_MASCULINO' ? 'Atleta Visitante Geral Masculino (5 km)' :
      data.category === 'VISITANTE_FEMININO' ? 'Atleta Visitante Geral Feminino (5 km)' :
      data.category?.replace(/_/g, ' ') || 'Categoria Geral (5 km)'
    );

  // Valores financeiros
  const formatBRL = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const totalCents = typeof data.totalAmountCents === 'number' && data.totalAmountCents > 0
    ? data.totalAmountCents
    : (isPcd ? 2750 : 5500);

  const baseCents = typeof data.baseAmountCents === 'number' && data.baseAmountCents > 0
    ? data.baseAmountCents
    : (isPcd ? 2500 : 5000);

  const feeCents = typeof data.feeCents === 'number' && data.feeCents >= 0
    ? data.feeCents
    : (isPcd ? 250 : 500);

  const totalFormatted = data.paidAmountFormatted || formatBRL(totalCents);
  const baseFormatted = formatBRL(baseCents);
  const feeFormatted = formatBRL(feeCents);

  const paymentMethodLabel = 
    data.paymentMethod === 'PIX' ? 'Pix Oficial (Compensação Imediata Asaas)' :
    data.paymentMethod === 'CREDIT_CARD' ? 'Cartão de Crédito à Vista (1x)' :
    data.paymentMethod === 'ISENTO' ? 'Isenção Oficial / Cortesia' :
    data.paymentMethod ? data.paymentMethod.replace(/_/g, ' ') : 'Pix / Cartão de Crédito';

  const isReserved = data.status === 'RESERVED';
  const bannerBg = isReserved ? '#fffbeb' : '#f0fdf4';
  const bannerBorder = isReserved ? '#fef3c7' : '#bbf7d0';
  const tagBg = isReserved ? '#d97706' : '#16a34a';
  const tagText = isReserved ? '⏳ Pré-Reserva Realizada (Aguardando Pagamento)' : '✓ Inscrição Confirmada com Sucesso';
  const bannerMsg = isReserved 
    ? `Olá, ${data.athleteName}! Sua vaga na prova está pré-reservada por 30 minutos. Conclua o pagamento para garantir sua participação definitiva.`
    : `Olá, ${data.athleteName}! Sua vaga na prova está 100% garantida.`;

  const subject = isReserved
    ? `Pré-Reserva #${data.protocol} (Código de Acesso: ${data.accessCode || '---'}) - 5ª Corrida de Emancipação`
    : `Inscrição Confirmada #${data.protocol} (Código de Acesso: ${data.accessCode || '---'}) - 5ª Corrida de Emancipação`;

  const maskedCpf = data.athleteCpf 
    ? `${data.athleteCpf.replace(/\D/g, '').slice(0, 3)}.***.***-${data.athleteCpf.replace(/\D/g, '').slice(9)}`
    : '***.***.***-**';

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0b1120; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Contêiner Central -->
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
          
          <!-- Cabeçalho Institucional -->
          <tr>
            <td style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
              <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #ffedd5;">
                Prefeitura Municipal de Lajes Pintadas / RN
              </p>
              <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase; color: #ffffff; line-height: 1.2;">
                5ª Corrida de Emancipação Política
              </h1>
              <p style="margin: 0; font-size: 13px; color: #ffedd5; font-weight: 600;">
                Edição Oficial 2026 • 5 km de Tradição e Superação
              </p>
            </td>
          </tr>

          <!-- Faixa de Status -->
          <tr>
            <td style="background-color: ${bannerBg}; border-bottom: 2px solid ${bannerBorder}; padding: 16px 24px; text-align: center;">
              <span style="display: inline-block; background-color: ${tagBg}; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 6px 16px; border-radius: 9999px;">
                ${tagText}
              </span>
              <p style="margin: 10px 0 0 0; font-size: 13px; color: #0f172a; font-weight: 700;">
                ${bannerMsg}
              </p>
            </td>
          </tr>

          <!-- Corpo do Comprovante -->
          <tr>
            <td style="padding: 24px 24px;">
              
              <!-- Destaque: Protocolo Oficial e Código de Acesso Lado a Lado -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="width: 50%; padding-right: 6px; vertical-align: top;">
                    <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 14px; padding: 14px 10px; text-align: center;">
                      <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #64748b; display: block; margin-bottom: 6px;">
                        Número de Protocolo
                      </span>
                      <span style="font-family: monospace, Courier New, monospace; font-size: 18px; font-weight: 900; color: #ea580c; letter-spacing: 1.5px; display: inline-block;">
                        ${data.protocol}
                      </span>
                    </div>
                  </td>
                  <td style="width: 50%; padding-left: 6px; vertical-align: top;">
                    <div style="background-color: #0f172a; border: 2px solid #334155; border-radius: 14px; padding: 14px 10px; text-align: center; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);">
                      <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #38bdf8; display: block; margin-bottom: 6px;">
                        🔑 Código de Acesso
                      </span>
                      <span style="font-family: monospace, Courier New, monospace; font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: 3px; display: inline-block;">
                        ${data.accessCode || 'Consulte o Admin'}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Caixa Informativa de Segurança (LGPD) -->
              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px 16px; margin-bottom: 20px; font-size: 12px; color: #1e40af; line-height: 1.5;">
                🔒 <strong>Importante — Guarde este e-mail:</strong> O seu <strong>Número de Protocolo</strong> e o seu <strong>Código de Acesso</strong> acima são as suas credenciais exclusivas para consultar a inscrição, verificar o status e emitir a 2ª via do comprovante no <strong>Portal do Atleta</strong> sem expor seus dados públicos na internet (em total conformidade com a LGPD).
              </div>

              ${!isReserved ? `
              <!-- QR Code Oficial para Retirada Rápida do Kit -->
              <div style="background-color: #fff7ed; border: 2px solid #fdba74; border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: center;">
                <span style="display: inline-block; background-color: #ea580c; color: #ffffff; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 8px;">
                  🎫 Voucher Oficial • Check-in de Entrega do Kit
                </span>
                <p style="margin: 0 0 12px 0; font-size: 12px; color: #7c2d12; font-weight: 600;">
                  Apresente este QR Code na tela do celular (ou impresso) na <strong>Sede da Prefeitura (Rua São Francisco, 275, Centro)</strong>, das <strong>08h às 13h</strong> (ou em 22/12 na Maré Mansa em Santa Cruz/RN) para retirada rápida da sua camisa <strong>Tamanho ${data.shirtSize}</strong>:
                </p>
                <div style="display: inline-block; background-color: #ffffff; padding: 12px; border-radius: 14px; border: 1px solid #fed7aa; box-shadow: 0 4px 10px rgba(0,0,0,0.06);">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=190x190&margin=8&data=${encodeURIComponent(`LP5-KIT:${data.protocol}:${data.accessCode || ''}`)}"
                    width="180"
                    height="180"
                    alt="QR Code de Retirada do Kit - ${data.protocol}"
                    style="display: block; margin: 0 auto;"
                  />
                  <span style="display: block; margin-top: 8px; font-family: monospace, Courier New, monospace; font-size: 12px; font-weight: 900; color: #0f172a; letter-spacing: 1px;">
                    ${data.protocol} • TAM. ${data.shirtSize}
                  </span>
                </div>
              </div>
              ` : ''}

              <!-- Informações de Pagamento Pix (se houver Copia e Cola) -->
              ${data.pixCopyPaste ? `
              <div style="background-color: #f0fdf4; border: 2px dashed #86efac; border-radius: 14px; padding: 18px; margin-bottom: 24px; text-align: center;">
                <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #166534; display: block; margin-bottom: 8px;">
                  Pague com Pix (Copia e Cola)
                </span>
                <p style="margin: 0 0 10px 0; font-size: 12px; color: #14532d;">
                  Copie o código Pix abaixo e cole no aplicativo do seu banco para efetivar o pagamento:
                </p>
                <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; font-family: monospace, Courier New, monospace; font-size: 11px; color: #334155; word-break: break-all; margin-bottom: 12px;">
                  ${data.pixCopyPaste}
                </div>
                ${data.invoiceUrl ? `
                <a href="${data.invoiceUrl}" target="_blank" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 800; padding: 10px 20px; border-radius: 8px;">
                  Visualizar QR Code Pix no Asaas
                </a>
                ` : ''}
              </div>
              ` : ''}

              <!-- Tabela de Dados do Atleta & Pagamento -->
              <h3 style="margin: 0 0 12px 0; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; border-left: 4px solid #ea580c; padding-left: 10px;">
                Dados da Inscrição & Pagamento
              </h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="8" border="0" style="border-collapse: collapse; margin-bottom: 24px;">
                <tr style="background-color: #f8fafc;">
                  <td style="border: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; color: #475569; width: 38%;">Atleta:</td>
                  <td style="border: 1px solid #e2e8f0; font-size: 12px; font-weight: 800; color: #0f172a;">${data.athleteName}</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; color: #475569;">CPF Mascarado:</td>
                  <td style="border: 1px solid #e2e8f0; font-size: 12px; font-weight: 600; color: #0f172a;">${maskedCpf}</td>
                </tr>
                <tr style="background-color: #f8fafc;">
                  <td style="border: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; color: #475569;">Modalidade / Categoria:</td>
                  <td style="border: 1px solid #e2e8f0; font-size: 12px; font-weight: 800; color: #ea580c;">
                    ${isPcd ? `♿ ${categoryName}` : categoryName}
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; color: #475569;">Tamanho da Camiseta:</td>
                  <td style="border: 1px solid #e2e8f0; font-size: 12px; font-weight: 800; color: #0f172a;">
                    ${data.shirtSize} (Poliamida UV FPU 50+ Oficial 68 Anos)
                  </td>
                </tr>
                <tr style="background-color: #f8fafc;">
                  <td style="border: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; color: #475569;">
                    ${isReserved ? 'Valor Total a Pagar:' : 'Valor Pago / Quitado:'}
                  </td>
                  <td style="border: 1px solid #e2e8f0; font-size: 13px; font-weight: 900; color: #16a34a;">
                    ${totalFormatted}
                    <span style="font-size: 11px; font-weight: 600; color: #64748b; margin-left: 4px;">
                      (${baseFormatted} base + ${feeFormatted} taxa de serviço 10%)
                    </span>
                    ${isPcd ? `
                    <div style="font-size: 11px; font-weight: 700; color: #9333ea; margin-top: 3px;">
                      ♿ Benefício PCD Aplicado: 50% Meia-Inscrição Oficial
                    </div>
                    ` : ''}
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; color: #475569;">Forma de Pagamento:</td>
                  <td style="border: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; color: #334155;">
                    ${paymentMethodLabel}
                  </td>
                </tr>
                <tr style="background-color: #f0fdf4;">
                  <td style="border: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; color: #166534;">Código de Acesso (PIN):</td>
                  <td style="border: 1px solid #e2e8f0; font-size: 14px; font-weight: 900; font-family: monospace, Courier New, monospace; color: #0284c7; letter-spacing: 2px;">
                    ${data.accessCode || 'Disponível com a Organização'}
                  </td>
                </tr>
              </table>

              <!-- Informações PCD / Inclusão e Atleta-Guia se aplicável -->
              ${isPcd ? `
              <div style="background-color: #faf5ff; border: 2px solid #d8b4fe; border-radius: 14px; padding: 18px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 800; text-transform: uppercase; color: #6b21a8; letter-spacing: 0.5px;">
                  ♿ Categoria Oficial PCD / Inclusão (50% Meia-Inscrição)
                </h4>
                <p style="margin: 0 0 12px 0; font-size: 12px; color: #581c87; line-height: 1.5;">
                  Sua inscrição foi confirmada com sucesso na <strong>Divisão Especial PCD / Inclusão</strong> com o benefício oficial de meia-inscrição (50% de desconto no valor base).
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="6" border="0" style="font-size: 12px; background-color: #ffffff; border-radius: 10px; border: 1px solid #e9d5ff; margin-bottom: 14px;">
                  <tr>
                    <td style="color: #6b21a8; font-weight: 700; width: 40%; border-bottom: 1px solid #f3e8ff;">Tipo de Deficiência:</td>
                    <td style="color: #3b0764; font-weight: 800; border-bottom: 1px solid #f3e8ff;">${data.pcdType || 'Pessoa com Deficiência (Conforme Laudo/CIPTEA)'}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b21a8; font-weight: 700; border-bottom: 1px solid #f3e8ff;">CID / Documento / CIPTEA:</td>
                    <td style="color: #3b0764; font-weight: 800; font-family: monospace; border-bottom: 1px solid #f3e8ff;">${data.pcdCid || 'Apresentar laudo na retirada do kit'}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b21a8; font-weight: 700; border-bottom: 1px solid #f3e8ff;">Valor Pago (Meia-Inscrição):</td>
                    <td style="color: #166534; font-weight: 900; font-size: 13px; border-bottom: 1px solid #f3e8ff;">
                      ${totalFormatted} <span style="font-size: 11px; font-weight: 600; color: #6b21a8;">(${baseFormatted} base + ${feeFormatted} taxa 10%)</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #6b21a8; font-weight: 700;">Atleta-Guia de Apoio:</td>
                    <td style="color: #3b0764; font-weight: 800;">
                      ${data.hasGuide && data.guideName ? `Sim — ${data.guideName} (Camisa: ${data.guideShirtSize || 'Grade Conforme Cadastro'}, 100% Gratuito)` : 'Não solicitado / Participação Individual'}
                    </td>
                  </tr>
                </table>

                ${data.hasGuide && data.guideName ? `
                <div style="background-color: #ffffff; border: 1.5px dashed #c084fc; border-radius: 12px; padding: 14px; margin-bottom: 12px;">
                  <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #ea580c; display: block; margin-bottom: 8px;">
                    🏃‍♂️ Atleta-Guia Oficial Cadastrado (100% Gratuito)
                  </span>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="4" border="0" style="font-size: 11px; color: #334155;">
                    <tr>
                      <td style="font-weight: 700; width: 35%;">Nome do Guia:</td>
                      <td style="font-weight: 800; color: #0f172a;">${data.guideName}</td>
                    </tr>
                    ${data.guideCpf ? `
                    <tr>
                      <td style="font-weight: 700;">CPF do Guia:</td>
                      <td style="font-weight: 600;">${data.guideCpf.replace(/\D/g, '').length === 11 ? `${data.guideCpf.slice(0, 3)}.***.***-${data.guideCpf.slice(9)}` : data.guideCpf}</td>
                    </tr>
                    ` : ''}
                    ${data.guidePhone ? `
                    <tr>
                      <td style="font-weight: 700;">Telefone:</td>
                      <td style="font-weight: 600;">${data.guidePhone}</td>
                    </tr>
                    ` : ''}
                    <tr>
                      <td style="font-weight: 700;">Camiseta do Guia:</td>
                      <td style="font-weight: 800; color: #ea580c;">${data.guideShirtSize || 'Tamanho Cadastrado'} (Camiseta Oficial Laranja de Apoio - R$ 0,00)</td>
                    </tr>
                  </table>
                </div>
                ` : ''}

                <div style="margin-top: 12px; font-size: 11px; color: #7e22ce; line-height: 1.5; border-top: 1px solid #f3e8ff; padding-top: 8px;">
                  📋 <strong>Regulamento Oficial PCD:</strong> É obrigatória a apresentação do laudo médico comprobatório original (com indicação do CID emitido nos últimos 12 meses) ou carteira de identificação oficial PCD/CIPTEA no ato da retirada do kit do atleta.
                </div>
              </div>
              ` : `
              <!-- Resumo Financeiro Oficial Categoria Geral -->
              <div style="background-color: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 14px; padding: 14px 18px; margin-bottom: 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="font-size: 12px; color: #166534; font-weight: 700;">
                      💰 <strong>Valor da Inscrição Processado:</strong>
                    </td>
                    <td align="right" style="font-size: 14px; font-weight: 900; color: #15803d;">
                      ${totalFormatted}
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="font-size: 11px; color: #166534; padding-top: 4px;">
                      Valor base de ${baseFormatted} acrescido de 10% (${feeFormatted}) de taxa de serviço do gateway Asaas. Quitação bancária confirmada.
                    </td>
                  </tr>
                </table>
              </div>
              `}

              <!-- Informações Importantes do Evento -->
              <div style="background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 14px; padding: 18px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #9a3412;">
                  📅 Cronograma & Retirada de Kit
                </h4>
                <ul style="margin: 0; padding-left: 18px; font-size: 12px; line-height: 1.6; color: #7c2d12;">
                  <li><strong>Data da Prova:</strong> Sábado, 26 de Dezembro de 2026.</li>
                  <li><strong>Horário da Largada:</strong> 17h00 (Concentração a partir das 16h00).</li>
                  <li><strong>Local da Concentração & Largada:</strong> Rua João Francisco Borges, Centro, Lajes Pintadas / RN.</li>
                  <li><strong>Retirada dos Kits Oficiais:</strong>
                    <br />• <strong>Sede da Prefeitura Municipal:</strong> Rua São Francisco, nº 275, Centro, Lajes Pintadas/RN — Horário: das <strong>08h às 13h</strong> (dias 21, 22 e 23 de dezembro).
                    <br />• <strong>Santa Cruz/RN:</strong> Loja Maré Mansa (dia 22 de dezembro).
                    <br />• <strong>Dia da Prova (26/12):</strong> No local da prova (Feira Livre Coberta) antes da largada oficial.
                    <br /><em>Apresentar documento oficial com foto e este comprovante com QR Code.</em>
                  </li>
                </ul>
              </div>

              <!-- Botão de Ação -->
              <div style="text-align: center; margin: 28px 0 10px 0;">
                <a href="https://corridadeemancipacao.lajespintadas.rn.gov.br/#/atleta" target="_blank" style="display: inline-block; background-color: #ea580c; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.35);">
                  Acessar Área do Atleta & Comprovante
                </a>
              </div>
            </td>
          </tr>

          <!-- Rodapé Institucional -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px; text-align: center; color: #94a3b8; font-size: 11px; line-height: 1.6;">
              <p style="margin: 0 0 6px 0; color: #ffffff; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                Prefeitura Municipal de Lajes Pintadas / RN
              </p>
              <p style="margin: 0 0 6px 0;">
                Secretaria Municipal de Esportes e Lazer
              </p>
              <p style="margin: 0 0 10px 0; color: #cbd5e1;">
                Dúvidas ou suporte com a prova: WhatsApp: <a href="https://wa.me/5584981858194" style="color: #22c55e; font-weight: 700; text-decoration: underline;">(84) 98185-8194 (Sidcley)</a> &bull; E-mail: <a href="mailto:esportes@lajespintadas.rn.gov.br" style="color: #f97316; font-weight: 700; text-decoration: underline;">esportes@lajespintadas.rn.gov.br</a>
              </p>
              <p style="margin: 0; color: #64748b; font-size: 10px;">
                Este é um e-mail automático emitido oficialmente pelo sistema de inscrições.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = [
    `5ª CORRIDA DE EMANCIPAÇÃO POLÍTICA DE LAJES PINTADAS/RN`,
    `${tagText}`,
    ``,
    `Olá, ${data.athleteName}!`,
    `${bannerMsg}`,
    ``,
    `DADOS DA SUA INSCRIÇÃO:`,
    `- Protocolo Oficial: ${data.protocol}`,
    `- Código de Acesso (PIN): ${data.accessCode || 'Consulte a Organização'}`,
    `- Atleta: ${data.athleteName} (CPF: ${maskedCpf})`,
    `- Categoria: ${categoryName}`,
    `- Tamanho da Camisa: ${data.shirtSize}`,
    `- Valor Total: ${totalFormatted} (${paymentMethodLabel})`,
    ``,
    `CRONOGRAMA E RETIRADA DO KIT:`,
    `- Data da Prova: 26/12/2026 às 17h00`,
    `- Local da Largada: Rua João Francisco Borges, Centro, Lajes Pintadas/RN`,
    `- Retirada dos Kits: Sede da Prefeitura (Rua São Francisco, nº 275, Centro), das 08h às 13h (dias 21, 22 e 23/12). Em 22/12 também na Maré Mansa (Santa Cruz/RN) e no dia da prova 26/12 no local da prova. Apresentar documento oficial com foto e este comprovante com QR Code.`,
    ``,
    `DÚVIDAS OU SUPORTE:`,
    `- WhatsApp do Organizador: (84) 98185-8194 (Sidcley)`,
    `- E-mail Oficial: esportes@lajespintadas.rn.gov.br`,
    ``,
    `Consulte sua inscrição em: https://corridadeemancipacao.lajespintadas.rn.gov.br`,
  ].join('\n');

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const activeTransporter = attempt === 1 ? transporter : getTransporter();
      if (!activeTransporter) return false;

      const info = await activeTransporter.sendMail({
        from: sender,
        replyTo: fromEmail,
        to: data.athleteEmail.trim().toLowerCase(),
        subject,
        text,
        html,
      });

      console.log(`[Email] Confirmação enviada com sucesso para ${data.athleteEmail} na tentativa ${attempt} (ID: ${info.messageId})`);
      return true;
    } catch (error) {
      console.error(`[Email] Erro na tentativa ${attempt} ao enviar e-mail para ${data.athleteEmail}:`, error);
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 700 * attempt));
      }
    }
  }

  return false;
}
