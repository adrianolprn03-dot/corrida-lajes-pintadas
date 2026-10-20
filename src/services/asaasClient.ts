// ==============================================================================
// CLIENTE OFICIAL DE INTEGRAÇÃO ASAAS API v3 (CHECKOUT HOSPEDADO & WEBHOOKS)
// Conforme documentação técnica oficial atualizada do Asaas (docs.asaas.com)
// ==============================================================================

export interface AsaasConfig {
  apiKey: string;
  webhookSecret: string;
  environment: 'sandbox' | 'production';
}

export interface AsaasCheckoutItem {
  name: string;
  description: string;
  quantity: number;
  value: number; // Float (ex: 60.99)
  imageBase64?: string;
  externalReference?: string;
}

export interface AsaasCheckoutInput {
  billingType: 'PIX' | 'CREDIT_CARD';
  value: number; // Valor total calculado no servidor
  minutesToExpire?: number; // 10 a 1440 min (padrão: 30)
  externalReference: string; // Protocolo do evento (ex: LP5-2612-ABCDE)
  athlete: {
    fullName: string;
    cpf: string;
    email: string;
    phone: string;
    city?: string;
    state?: string;
  };
  shirtSize: string;
  urls: {
    successUrl: string;
    cancelUrl: string;
    expiredUrl: string;
  };
}

export interface AsaasCheckoutResponse {
  id: string;
  link: string;
  status: 'ACTIVE' | 'PAID' | 'CANCELED' | 'EXPIRED';
  billingTypes: string[];
  chargeTypes: string[];
  minutesToExpire: number;
  externalReference: string;
}

export class AsaasGateway {
  private baseUrl: string;
  private apiKey: string;
  private webhookSecret: string;
  private environment: 'sandbox' | 'production';

  constructor(config: AsaasConfig) {
    this.environment = config.environment;
    const env = (config.environment || '').toLowerCase();
    this.baseUrl = env === 'production' || env === 'prod'
      ? 'https://api.asaas.com/v3'
      : 'https://api-sandbox.asaas.com/v3';
    this.apiKey = config.apiKey;
    this.webhookSecret = config.webhookSecret;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      'access_token': this.apiKey,
      'User-Agent': 'CorridaEmancipacaoLajesPintadas/1.0',
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { message: errorText };
      }
      throw new Error(`Asaas API Error [${response.status}]: ${JSON.stringify(errorJson)}`);
    }

    return response.json();
  }

  // 1. Criar Novo Checkout Hospedado (POST /v3/checkouts)
  // Utiliza cobrança avulsa sem parcelamento (DETACHED) e apenas o meio selecionado
  async createCheckout(input: AsaasCheckoutInput): Promise<AsaasCheckoutResponse> {
    const cleanCpf = input.athlete.cpf.replace(/\D/g, '');
    const cleanPhone = input.athlete.phone.replace(/\D/g, '');

    // Imagem da camisa em base64 ou miniatura transparente para o item do checkout
    const dummyShirtBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    const payload = {
      billingTypes: [input.billingType],
      chargeTypes: ['DETACHED'], // Cobrança avulsa sem parcelamento
      minutesToExpire: input.minutesToExpire || 30, // 30 minutos de reserva
      externalReference: input.externalReference,
      callback: {
        successUrl: input.urls.successUrl,
        cancelUrl: input.urls.cancelUrl,
        expiredUrl: input.urls.expiredUrl,
      },
      items: [
        {
          name: 'Inscrição 5ª Corrida de Emancipação',
          description: `Camisa Dry-Fit Laranja Tam: ${input.shirtSize} • Lajes Pintadas/RN (5km)`,
          quantity: 1,
          value: input.value,
          imageBase64: dummyShirtBase64,
          externalReference: `${input.externalReference}-KIT`,
        },
      ],
      customerData: {
        name: input.athlete.fullName,
        cpfCnpj: cleanCpf,
        email: input.athlete.email,
        phone: cleanPhone,
        province: input.athlete.city || 'Centro',
      },
    };

    const res = await this.request<any>('/checkouts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    // Link do checkout conforme documentação oficial:
    // https://asaas.com/checkoutSession/show?id=ID ou https://sandbox.asaas.com/checkoutSession/show?id=ID
    const checkoutId = res.id;
    const checkoutHost = this.environment === 'production' ? 'asaas.com' : 'sandbox.asaas.com';
    const computedLink = res.link || `https://${checkoutHost}/checkoutSession/show?id=${checkoutId}`;

    return {
      id: checkoutId,
      link: computedLink,
      status: res.status || 'ACTIVE',
      billingTypes: res.billingTypes || [input.billingType],
      chargeTypes: res.chargeTypes || ['DETACHED'],
      minutesToExpire: res.minutesToExpire || 30,
      externalReference: input.externalReference,
    };
  }

  // 2. Consultar Checkout para Conciliação
  async getCheckout(checkoutId: string): Promise<any> {
    return this.request<any>(`/checkouts/${checkoutId}`);
  }

  // 3. Cancelar Checkout se expirado ou cancelado pela organização
  async cancelCheckout(checkoutId: string): Promise<any> {
    return this.request<any>(`/checkouts/${checkoutId}/cancel`, {
      method: 'POST',
    });
  }

  // 4. Validar Autenticidade do Token do Webhook
  // Header: asaas-access-token enviado pelo Asaas deve coincidir com o authToken cadastrado
  validateWebhookToken(incomingToken: string | null | undefined): boolean {
    if (!this.webhookSecret) return true; // Em dev/sandbox sem segredo estrito configurado
    if (!incomingToken) return false;
    return incomingToken === this.webhookSecret;
  }
}
