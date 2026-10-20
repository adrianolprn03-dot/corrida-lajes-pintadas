// ==============================================================================
// ASAAS CLIENT HELPER COM CONTROLE DE RATE-LIMIT (429), RETRY COM EXPONENTIAL
// BACKOFF, JITTER, CONCILIAÇÃO PRÉVIA E PREVENÇÃO DE DUPLICIDADES
// ==============================================================================

export interface AsaasConfig {
  apiKey: string;
  environment: 'production' | 'sandbox' | 'mock';
  maxRetries?: number;
  baseDelayMs?: number;
}

export interface AsaasCustomer {
  id: string;
  name: string;
  cpfCnpj: string;
  email: string;
  mobilePhone: string;
}

export interface AsaasPayment {
  id: string;
  customer: string;
  value: number;
  netValue?: number;
  billingType: 'PIX' | 'CREDIT_CARD';
  status: string;
  dueDate: string;
  invoiceUrl?: string;
  externalReference?: string;
}

export interface AsaasPixQrCode {
  encodedImage: string;
  payload: string;
  expirationDate?: string;
}

// Estatísticas de chamadas para monitoramento
export const asaasMetrics = {
  totalCalls: 0,
  successCalls: 0,
  rateLimitHits: 0,
  retriedCalls: 0,
  failedCalls: 0,
  reconciliations: 0,
};

export class AsaasClient {
  private apiKey: string;
  private baseUrl: string;
  private isMock: boolean;
  private maxRetries: number;
  private baseDelayMs: number;

  constructor(config: AsaasConfig) {
    this.apiKey = config.apiKey;
    this.isMock = config.environment === 'mock' || !config.apiKey;
    const env = (config.environment || '').toLowerCase();
    this.baseUrl = env === 'production' || env === 'prod'
      ? 'https://api.asaas.com/v3' 
      : 'https://api-sandbox.asaas.com/v3';
    this.maxRetries = config.maxRetries ?? 3;
    this.baseDelayMs = config.baseDelayMs ?? 400;
  }

  // Execução de requisição com tratamento de rate-limit (429), 5xx e retry inteligente
  private async fetchWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt = 1
  ): Promise<T> {
    asaasMetrics.totalCalls++;

    // Se estiver em modo mock (testes pesados de carga ou sem credenciais reais)
    if (this.isMock) {
      return this.handleMockResponse<T>(endpoint, options);
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'access_token': this.apiKey,
      'User-Agent': 'Corrida-LajesPintadas-Backend/1.0',
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(url, { ...options, headers });

      // Tratar Rate Limit (HTTP 429) e Erros Transitórios de Servidor (500, 502, 503, 504)
      if (response.status === 429 || (response.status >= 500 && response.status <= 504)) {
        if (response.status === 429) {
          asaasMetrics.rateLimitHits++;
        }

        if (attempt <= this.maxRetries) {
          asaasMetrics.retriedCalls++;
          
          // Exponential backoff com jitter aleatório para evitar thundering herd
          const delay = Math.pow(2, attempt) * this.baseDelayMs + Math.random() * 200;
          console.warn(`[AsaasClient] Status ${response.status} na chamada ${endpoint}. Tentativa ${attempt}/${this.maxRetries}. Aguardando ${delay.toFixed(0)}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.fetchWithRetry<T>(endpoint, options, attempt + 1);
        }
      }

      if (!response.ok) {
        asaasMetrics.failedCalls++;
        const contentType = response.headers.get('content-type') || '';
        let errorMsg = `Erro no processamento (${response.status})`;
        if (contentType.includes('application/json')) {
          try {
            const errJson = await response.json();
            if (errJson?.errors && Array.isArray(errJson.errors) && errJson.errors[0]?.description) {
              errorMsg = `Gateway de Pagamento: ${errJson.errors[0].description}`;
            } else if (errJson?.message) {
              errorMsg = `Gateway de Pagamento: ${errJson.message}`;
            }
          } catch {}
        } else {
          const errorBody = await response.text();
          errorMsg = `Gateway de Pagamento retornou status ${response.status}: ${errorBody.slice(0, 100)}`;
        }
        throw new Error(errorMsg);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Gateway de Pagamento retornou resposta não-JSON (${response.status}): ${text.slice(0, 100)}`);
      }

      asaasMetrics.successCalls++;
      return (await response.json()) as T;
    } catch (err: any) {
      if (attempt <= this.maxRetries && err.name !== 'AbortError') {
        asaasMetrics.retriedCalls++;
        const delay = Math.pow(2, attempt) * this.baseDelayMs + Math.random() * 200;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.fetchWithRetry<T>(endpoint, options, attempt + 1);
      }
      asaasMetrics.failedCalls++;
      throw err;
    }
  }

  // Respostas simuladas sintéticas para testes de carga de alta performance (sem estourar quota do Asaas)
  private handleMockResponse<T>(endpoint: string, options: RequestInit): T {
    asaasMetrics.successCalls++;
    const method = options.method || 'GET';

    if (endpoint.startsWith('/customers')) {
      if (method === 'POST') {
        const body = JSON.parse((options.body as string) || '{}');
        return {
          id: `cus_mock_${Math.random().toString(36).substring(2, 10)}`,
          name: body.name || 'Atleta Simulado',
          cpfCnpj: body.cpfCnpj || '00000000000',
          email: body.email || 'atleta@exemplo.com',
          mobilePhone: body.mobilePhone || '84999999999',
        } as T;
      }
      // GET /customers?cpfCnpj=...
      return { data: [] } as T;
    }

    if (endpoint.startsWith('/payments')) {
      if (endpoint.includes('/pixQrCode')) {
        const payId = endpoint.split('/')[2];
        return {
          encodedImage: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
          payload: `00020101021226830014br.gov.bcb.pix2561asaas.com/pix/${payId}52040000530398654060.005802BR5925PREF MUNIC LAJES PINTADAS6014LAJES PINTADAS62070503***6304`,
          expirationDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        } as T;
      }

      if (method === 'POST') {
        const body = JSON.parse((options.body as string) || '{}');
        const mockPayId = `pay_mock_${Math.random().toString(36).substring(2, 12)}`;
        return {
          id: mockPayId,
          customer: body.customer,
          value: body.value,
          billingType: body.billingType,
          status: 'PENDING',
          dueDate: body.dueDate,
          invoiceUrl: `https://sandbox.asaas.com/i/${mockPayId}`,
          externalReference: body.externalReference,
        } as T;
      }

      // GET /payments?externalReference=...
      return { data: [] } as T;
    }

    return {} as T;
  }

  // 1. CONCILIAÇÃO E CRIAÇÃO SEGURA DE CLIENTE
  // Verifica antes se o cliente já existe por CPF/CNPJ para não duplicar cadastros
  async getOrCreateCustomer(params: {
    name: string;
    cpfCnpj: string;
    email: string;
    mobilePhone: string;
  }): Promise<AsaasCustomer> {
    const cleanCpf = params.cpfCnpj.replace(/\D/g, '');

    // Consulta prévia por CPF
    try {
      const searchRes = await this.fetchWithRetry<{ data: AsaasCustomer[] }>(
        `/customers?cpfCnpj=${cleanCpf}`
      );
      if (searchRes.data && searchRes.data.length > 0) {
        asaasMetrics.reconciliations++;
        return searchRes.data[0];
      }
    } catch (e) {
      console.warn('[AsaasClient] Consulta prévia de cliente falhou, prosseguindo com criação:', e);
    }

    // Criar novo cliente
    return this.fetchWithRetry<AsaasCustomer>('/customers', {
      method: 'POST',
      body: JSON.stringify({
        name: params.name,
        cpfCnpj: cleanCpf,
        email: params.email,
        mobilePhone: params.mobilePhone.replace(/\D/g, ''),
      }),
    });
  }

  // 2. CONCILIAÇÃO E CRIAÇÃO SEGURA DE COBRANÇA
  // Antes de criar, verifica se já existe cobrança com o mesmo externalReference (Protocolo)
  // para evitar cobrança em duplicidade caso a requisição anterior tenha oscilado na rede
  async getOrCreatePayment(params: {
    customerId: string;
    billingType: 'PIX' | 'CREDIT_CARD';
    value: number;
    protocol: string;
    description: string;
  }): Promise<AsaasPayment> {
    // Conciliação prévia por externalReference
    try {
      const searchRes = await this.fetchWithRetry<{ data: AsaasPayment[] }>(
        `/payments?externalReference=${params.protocol}`
      );
      if (searchRes.data && searchRes.data.length > 0) {
        asaasMetrics.reconciliations++;
        const existing = searchRes.data[0];
        console.log(`[AsaasClient] Cobrança conciliada existente encontrada para ${params.protocol}: ${existing.id}`);
        return existing;
      }
    } catch (e) {
      console.warn('[AsaasClient] Consulta prévia de cobrança falhou, criando nova:', e);
    }

    // Criar cobrança única (sem parcelamento, conforme Edital)
    return this.fetchWithRetry<AsaasPayment>('/payments', {
      method: 'POST',
      body: JSON.stringify({
        customer: params.customerId,
        billingType: params.billingType,
        value: params.value,
        dueDate: '2026-12-26',
        description: params.description,
        externalReference: params.protocol,
        postalService: false,
      }),
    });
  }

  // 3. Obter QR Code e Chave Pix Copia e Cola
  async getPixQrCode(paymentId: string): Promise<AsaasPixQrCode> {
    return this.fetchWithRetry<AsaasPixQrCode>(`/payments/${paymentId}/pixQrCode`);
  }
}
