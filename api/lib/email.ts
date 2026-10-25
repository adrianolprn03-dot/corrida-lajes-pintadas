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

  const categoryName = 
    data.category === 'CASA_MASCULINO' || data.category === 'LOCAL_MASCULINO' ? 'Atleta Local Masculino (5 km)' :
    data.category === 'CASA_FEMININO' || data.category === 'LOCAL_FEMININO' ? 'Atleta Local Feminino (5 km)' :
    data.category === 'VISITANTE_MASCULINO' ? 'Atleta Visitante Geral Masculino (5 km)' :
    data.category === 'VISITANTE_FEMININO' ? 'Atleta Visitante Geral Feminino (5 km)' :
    data.category;

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
              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px 16px; margin-bottom: 24px; font-size: 12px; color: #1e40af; line-height: 1.5;">
                🔒 <strong>Importante — Guarde este e-mail:</strong> O seu <strong>Número de Protocolo</strong> e o seu <strong>Código de Acesso</strong> acima são as suas credenciais exclusivas para consultar a inscrição, verificar o status e emitir a 2ª via do comprovante no <strong>Portal do Atleta</strong> sem expor seus dados públicos na internet (em total conformidade com a LGPD).
              </div>

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

              <!-- Tabela de Dados do Atleta -->
              <h3 style="margin: 0 0 12px 0; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; border-left: 4px solid #ea580c; padding-left: 10px;">
                Dados da Inscrição
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
                  <td style="border: 1px solid #e2e8f0; font-size: 12px; font-weight: 800; color: #ea580c;">${categoryName}</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; color: #475569;">Tamanho da Camiseta:</td>
                  <td style="border: 1px solid #e2e8f0; font-size: 12px; font-weight: 800; color: #0f172a;">
                    ${data.shirtSize} (Poliamida UV FPU 50+)
                  </td>
                </tr>
                <tr style="background-color: #f0fdf4;">
                  <td style="border: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; color: #166534;">Código de Acesso (PIN):</td>
                  <td style="border: 1px solid #e2e8f0; font-size: 14px; font-weight: 900; font-family: monospace, Courier New, monospace; color: #0284c7; letter-spacing: 2px;">
                    ${data.accessCode || 'Disponível com a Organização'}
                  </td>
                </tr>
              </table>

              <!-- Informações Importantes do Evento -->
              <div style="background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 14px; padding: 18px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #9a3412;">
                  📅 Cronograma & Retirada de Kit
                </h4>
                <ul style="margin: 0; padding-left: 18px; font-size: 12px; line-height: 1.6; color: #7c2d12;">
                  <li><strong>Data da Prova:</strong> Sábado, 26 de Dezembro de 2026.</li>
                  <li><strong>Horário da Largada:</strong> 17h00 (Concentração na Feira Livre Coberta a partir das 16h00).</li>
                  <li><strong>Local da Concentração & Largada:</strong> Feira Livre Coberta, Centro, Lajes Pintadas / RN.</li>
                  <li><strong>Retirada do Kit:</strong> Apresentar documento oficial com foto e este comprovante impresso ou no celular.</li>
                </ul>
              </div>

              <!-- Botão de Ação -->
              <div style="text-align: center; margin: 28px 0 10px 0;">
                <a href="https://corrida-lajes-pintadas-rn.vercel.app/#/atleta" target="_blank" style="display: inline-block; background-color: #ea580c; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.35);">
                  Acessar Área do Atleta & Comprovante
                </a>
              </div>
            </td>
          </tr>

          <!-- Rodapé Institucional -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px; text-align: center; color: #94a3b8; font-size: 11px; line-height: 1.5;">
              <p style="margin: 0 0 6px 0; color: #ffffff; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                Prefeitura Municipal de Lajes Pintadas / RN
              </p>
              <p style="margin: 0 0 6px 0;">
                Secretaria Municipal de Esporte, Lazer e Turismo
              </p>
              <p style="margin: 0; color: #64748b;">
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

  try {
    const info = await transporter.sendMail({
      from: sender,
      to: data.athleteEmail,
      subject,
      html,
    });

    console.log(`[Email] Confirmação enviada com sucesso para ${data.athleteEmail} (ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`[Email] Erro ao enviar e-mail de confirmação para ${data.athleteEmail}:`, error);
    return false;
  }
}
