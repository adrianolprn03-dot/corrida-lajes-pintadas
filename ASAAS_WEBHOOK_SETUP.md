# Guia de Integração e Configuração de Webhooks do Asaas (API v3)
## 5ª Corrida de Emancipação Política de Lajes Pintadas/RN

---

### 1. Modelo de Cobrança e Regras Financeiras
- **Valor Base Municipal:** R$ 60,00 (líquido destinado aos cofres municipais / fundo de esportes).
- **Repasse das Tarifas:** O atleta arca com o acréscimo de processamento do Asaas para pagamento à vista.
- **Formas de Pagamento Permitidas:**
  - **Pix:** `R$ 60,00 + Tarifa Fixa (R$ 0,99) = R$ 60,99`.
  - **Cartão de Crédito (1x à vista):** `(R$ 60,00 + Tarifa Fixa R$ 0,49) / (1 - 0,0299) = R$ 62,35`.
  - **Parcelamento:** Estritamente desabilitado (`installmentCount: 1`).

---

### 2. Criação do Checkout Avulso no Asaas
O sistema utiliza o endpoint oficial `/v3/checkouts` da API v3 do Asaas com a seguinte estrutura:

```http
POST https://api.asaas.com/v3/checkouts
Authorization: Bearer $ASAAS_API_KEY
Content-Type: application/json

{
  "chargeTypes": ["DETACHED"],
  "billingTypes": ["PIX"], // ou ["CREDIT_CARD"]
  "minutesToExpire": 30,
  "installment": {
    "maxInstallmentCount": 1
  },
  "items": [
    {
      "name": "Inscrição 5ª Corrida de Emancipação Lajes Pintadas (Tam: M)",
      "value": 60.99,
      "quantity": 1
    }
  ],
  "callback": {
    "successUrl": "https://corrida.lajespintadas.rn.gov.br/#/pagamento-sucesso",
    "cancelUrl": "https://corrida.lajespintadas.rn.gov.br/#/pagamento-cancelado",
    "expiredUrl": "https://corrida.lajespintadas.rn.gov.br/#/pagamento-expirado",
    "autoRedirect": true
  }
}
```

> **Atenção:** Os redirecionamentos de callback (`successUrl`) servem exclusivamente para experiência de interface do atleta e **nunca** confirmam a vaga no banco de dados. A confirmação é realizada unicamente pelo Webhook assinado.

---

### 3. Configuração do Webhook no Painel Asaas
1. Acesse o painel do Asaas ([Sandbox](https://sandbox.asaas.com) ou [Produção](https://www.asaas.com)).
2. Navegue até: **Minha Conta > Configurações da Conta > Integrações > Webhooks**.
3. Clique em **"Novo Webhook"** e preencha:
   - **Nome:** Webhook Inscrições - Corrida Lajes Pintadas 2026
   - **URL de Destino:** `https://seu-dominio.gov.br/api/webhook-asaas` (ou URL da Supabase Edge Function)
   - **Versão da API:** `v3`
   - **Token de Autenticação:** Digite uma chave alfanumérica segura e salve-a também na variável de ambiente `ASAAS_WEBHOOK_SECRET`.
   - **Eventos a Selecionar:**
     - `CHECKOUT_PAID` (Checkout avulso quitado)
     - `PAYMENT_RECEIVED` (Pagamento Pix ou Boleto recebido)
     - `PAYMENT_CONFIRMED` (Transação de Cartão de Crédito confirmada)
     - `PAYMENT_OVERDUE` (Prazo expirado)
     - `PAYMENT_REFUNDED` (Estorno concedido)

---

### 4. Validação e Segurança do Webhook
O backend (`api/webhook-asaas.ts`) valida rigorosamente:
1. **Cabeçalho de Autenticação:**
   O Asaas envia o cabeçalho `asaas-access-token`. Se o valor não corresponder exatamente a `process.env.ASAAS_WEBHOOK_SECRET`, o endpoint rejeita com `HTTP 401 Unauthorized`.
2. **Idempotência:**
   Cada evento possui um ID único gravado em `webhook_logs`. Eventos repetidos retornam `HTTP 200` imediatamente sem reprocessar estoque ou registros.
3. **Validação de Valor:**
   O valor recebido no webhook deve ser maior ou igual ao `total_amount_cents` registrado na reserva.
4. **Atualização Atômica:**
   A transação converte a reserva em confirmação definitiva (`status: CONFIRMED`, `financial_status: CONFIRMED`, `paid_at: NOW()`) e transfere o item de `reserved_count` para `confirmed_count` no estoque de camisas.
