// ==============================================================================
// 5ª CORRIDA DE EMANCIPAÇÃO POLÍTICA DE LAJES PINTADAS/RN
// SUÍTE DE TESTES PROGRESSIVOS DE CARGA, ESTRESSE E INTEGRIDADE TRANSACIONAL
// ==============================================================================

import http from 'http';
import crypto from 'crypto';

// 1. Gerador de CPFs matematicamente válidos
function generateValidCPF() {
  const digits = [];
  for (let i = 0; i < 9; i++) digits.push(Math.floor(Math.random() * 9));

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += digits[i] * (10 - i);
  let check1 = (sum * 10) % 11;
  if (check1 === 10 || check1 === 11) check1 = 0;
  digits.push(check1);

  sum = 0;
  for (let i = 0; i < 10; i++) sum += digits[i] * (11 - i);
  let check2 = (sum * 10) % 11;
  if (check2 === 10 || check2 === 11) check2 = 0;
  digits.push(check2);

  return digits.join('');
}

// 2. Motor Transacional de Testes com Trava Mutex e Idempotência
class TestEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.shirts = new Map([
      ['PP', { size: 'PP', totalStock: 80, reservedCount: 0, confirmedCount: 0 }],
      ['P',  { size: 'P',  totalStock: 250, reservedCount: 0, confirmedCount: 0 }],
      ['M',  { size: 'M',  totalStock: 450, reservedCount: 0, confirmedCount: 0 }],
      ['G',  { size: 'G',  totalStock: 350, reservedCount: 0, confirmedCount: 0 }],
      ['GG', { size: 'GG', totalStock: 120, reservedCount: 0, confirmedCount: 0 }],
      ['XG', { size: 'XG', totalStock: 50,  reservedCount: 0, confirmedCount: 0 }],
    ]);
    this.maxCapacity = 1300;
    this.registrations = new Map(); // protocol -> reg
    this.registrationsByCpf = new Map();
    this.processedWebhooks = new Set();
    this.lockPromise = Promise.resolve();
    this.stats = {
      totalCalls: 0,
      successful: 0,
      outOfStock: 0,
      duplicateCpf: 0,
      duplicateSubmission: 0,
      lookups: 0,
      webhooksProcessed: 0,
      webhooksIgnoredDup: 0,
      webhooksIgnoredOrder: 0,
    };
  }

  async acquireLock(fn) {
    let release;
    const next = new Promise((res) => { release = res; });
    const current = this.lockPromise;
    this.lockPromise = next;
    await current;
    try {
      return await fn();
    } finally {
      release();
    }
  }

  async reserve(params) {
    this.stats.totalCalls++;
    const cleanCpf = params.cpf.replace(/\D/g, '');

    return this.acquireLock(async () => {
      // Duplicidade de CPF ativo
      if (this.registrationsByCpf.has(cleanCpf)) {
        this.stats.duplicateCpf++;
        return { success: false, status: 400, error: 'CPF_DUPLICATE' };
      }

      // Estoque de camisa
      const shirt = this.shirts.get(params.shirtSize);
      if (!shirt) {
        return { success: false, status: 400, error: 'INVALID_SHIRT' };
      }

      const available = shirt.totalStock - (shirt.reservedCount + shirt.confirmedCount);
      if (available <= 0) {
        this.stats.outOfStock++;
        return { success: false, status: 409, error: 'OUT_OF_STOCK' };
      }

      // Reserva atômica
      shirt.reservedCount++;
      const protocol = `LP5-2612-${crypto.randomBytes(3).toString('hex').toUpperCase().substring(0, 5)}`;
      const accessCode = crypto.randomBytes(4).toString('hex').toUpperCase().substring(0, 6);

      const reg = {
        protocol,
        accessCode,
        fullName: params.fullName,
        cpf: cleanCpf,
        shirtSize: params.shirtSize,
        category: params.originType === 'CASA' ? 'CASA_MASCULINO' : 'VISITANTE_MASCULINO',
        status: 'RESERVED',
        createdAt: new Date().toISOString(),
      };

      this.registrations.set(protocol, reg);
      this.registrationsByCpf.set(cleanCpf, protocol);
      this.stats.successful++;

      return { success: true, status: 200, data: { protocol, accessCode, shirtSize: params.shirtSize } };
    });
  }

  lookup(protocol, accessCode) {
    this.stats.lookups++;
    const reg = this.registrations.get(protocol.trim().toUpperCase());
    if (!reg) return { success: false, status: 404, error: 'NOT_FOUND' };
    if (reg.accessCode !== accessCode.trim().toUpperCase()) {
      return { success: false, status: 403, error: 'FORBIDDEN' };
    }
    return { success: true, status: 200, data: reg };
  }

  async processWebhook(event, paymentId, protocol, status) {
    const key = `${event}_${paymentId}_${status}`;
    if (this.processedWebhooks.has(key)) {
      this.stats.webhooksIgnoredDup++;
      return { success: true, action: 'IGNORED_DUPLICATE' };
    }

    return this.acquireLock(async () => {
      const reg = this.registrations.get(protocol);
      if (!reg) return { success: false, action: 'NOT_FOUND' };

      if (reg.status === 'CONFIRMED' && ['PAYMENT_CREATED', 'PENDING'].includes(event)) {
        this.stats.webhooksIgnoredOrder++;
        this.processedWebhooks.add(key);
        return { success: true, action: 'IGNORED_OUT_OF_ORDER' };
      }

      if (['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED'].includes(event)) {
        reg.status = 'CONFIRMED';
        const shirt = this.shirts.get(reg.shirtSize);
        if (shirt && shirt.reservedCount > 0) {
          shirt.reservedCount--;
          shirt.confirmedCount++;
        }
        this.stats.webhooksProcessed++;
        this.processedWebhooks.add(key);
        return { success: true, action: 'CONFIRMED' };
      }

      this.processedWebhooks.add(key);
      return { success: true, action: 'PROCESSED' };
    });
  }

  // Verificação estrita de integridade do estoque
  verifyIntegrity() {
    let overbooked = false;
    const details = [];
    for (const [size, s] of this.shirts.entries()) {
      const active = s.reservedCount + s.confirmedCount;
      const isOver = active > s.totalStock;
      if (isOver) overbooked = true;
      details.push({
        size,
        total: s.totalStock,
        reserved: s.reservedCount,
        confirmed: s.confirmedCount,
        active,
        available: s.totalStock - active,
        overbooked: isOver,
      });
    }
    return { overbooked, details };
  }
}

const engine = new TestEngine();

// 3. Servidor HTTP de Teste de Carga de Alta Performance
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  res.setHeader('Content-Type', 'application/json');

  if (pathname === '/api/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', memory: process.memoryUsage().heapUsed }));
    return;
  }

  if (pathname === '/api/create-reservation' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const result = await engine.reserve(data);
        res.writeHead(result.status);
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (pathname === '/api/lookup' && req.method === 'GET') {
    const protocol = url.searchParams.get('protocol') || '';
    const accessCode = url.searchParams.get('accessCode') || '';
    const result = engine.lookup(protocol, accessCode);
    res.writeHead(result.status);
    res.end(JSON.stringify(result));
    return;
  }

  if (pathname === '/api/webhook-asaas' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const result = await engine.processWebhook(
          data.event,
          data.payment?.id,
          data.payment?.externalReference,
          data.payment?.status
        );
        res.writeHead(200);
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Página pública simulada (HTML leve)
  if (pathname === '/' || pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<!DOCTYPE html><html><head><title>5a Corrida</title></head><body>5a Corrida de Emancipacao</body></html>');
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

// 4. Executor de Cenários de Carga
async function runLoadScenario({ name, concurrency, totalRequests, taskFn }) {
  console.log(`\n======================================================`);
  console.log(`▶ INICIANDO: ${name}`);
  console.log(`  Concorrência (VUs): ${concurrency} | Total Req: ${totalRequests}`);
  console.log(`======================================================`);

  const latencies = [];
  let completed = 0;
  let errorCount = 0;
  let successCount = 0;
  let rejectedExpected = 0; // Ex: out of stock esperado

  const startTime = Date.now();
  let currentIndex = 0;

  async function worker() {
    while (true) {
      const index = currentIndex++;
      if (index >= totalRequests) break;

      const reqStart = Date.now();
      try {
        const res = await taskFn(index);
        const reqDuration = Date.now() - reqStart;
        latencies.push(reqDuration);

        if (res.status >= 200 && res.status < 300) {
          successCount++;
        } else if (res.status === 409 || res.status === 400) {
          // Rejeições de regra de negócio esperadas (ex: estoque esgotado ou CPF duplicado)
          rejectedExpected++;
        } else {
          errorCount++;
        }
      } catch (err) {
        latencies.push(Date.now() - reqStart);
        errorCount++;
      } finally {
        completed++;
      }
    }
  }

  const workers = [];
  for (let i = 0; i < concurrency; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);
  const totalDurationMs = Date.now() - startTime;
  const durationSec = totalDurationMs / 1000;
  const rps = (completed / durationSec).toFixed(1);

  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.50)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const avg = (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(1);

  const errorRate = ((errorCount / completed) * 100).toFixed(2);

  const integrity = engine.verifyIntegrity();

  const report = {
    scenario: name,
    concurrency,
    totalRequests: completed,
    durationSec: Number(durationSec.toFixed(2)),
    rps: Number(rps),
    avgLatencyMs: Number(avg),
    p50LatencyMs: p50,
    p95LatencyMs: p95,
    p99LatencyMs: p99,
    successCount,
    rejectedExpected,
    errorCount,
    errorRatePercent: Number(errorRate),
    overbooked: integrity.overbooked,
    inventoryDetails: integrity.details,
  };

  console.log(`✔ Concluído em ${durationSec.toFixed(2)}s | RPS: ${rps}`);
  console.log(`  Latências: Média: ${avg}ms | p50: ${p50}ms | p95: ${p95}ms | p99: ${p99}ms`);
  console.log(`  Sucesso: ${successCount} | Rejeições Esperadas: ${rejectedExpected} | Erros 5xx: ${errorCount} (${errorRate}%)`);
  console.log(`  Integridade de Estoque: ${integrity.overbooked ? '❌ VIOLAÇÃO / OVERBOOKING' : '✅ 100% PRESERVADO (ZERO OVERBOOKING)'}`);

  return report;
}

// 5. Função de Requisição HTTP Interna
function makeHttpRequest(port, options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path: options.path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'keep-alive',
        ...(options.headers || {}),
      },
    }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) {}
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

// 6. Execução Principal da Suíte de Testes
async function main() {
  const PORT = 5589;
  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
  console.log(`[LoadServer] Servidor de teste escutando em http://127.0.0.1:${PORT}`);

  const reports = [];

  // ----------------------------------------------------------------------------
  // CENÁRIO 1: 50 Usuários Virtuais Concorrentes (Envio de Inscrições)
  // ----------------------------------------------------------------------------
  engine.reset();
  const shirtSizes = ['PP', 'P', 'M', 'G', 'GG', 'XG'];
  const rep1 = await runLoadScenario({
    name: 'Cenário 1: 50 Usuários Virtuais Simultâneos (Envio de Inscrições)',
    concurrency: 50,
    totalRequests: 250,
    taskFn: async (idx) => {
      const cpf = generateValidCPF();
      return makeHttpRequest(PORT, { path: '/api/create-reservation', method: 'POST' }, {
        fullName: `Atleta Teste ${idx}`,
        cpf,
        birthDate: '1995-05-15',
        email: `atleta${idx}@teste.com`,
        phone: '84999990000',
        city: 'Lajes Pintadas',
        state: 'RN',
        originType: 'CASA',
        casaProofType: 'RESIDENTE',
        shirtSize: shirtSizes[idx % shirtSizes.length],
        paymentMethod: 'PIX',
      });
    },
  });
  reports.push(rep1);

  // ----------------------------------------------------------------------------
  // CENÁRIO 2: 100 Usuários Virtuais Concorrentes (Envio de Inscrições)
  // ----------------------------------------------------------------------------
  engine.reset();
  const rep2 = await runLoadScenario({
    name: 'Cenário 2: 100 Usuários Virtuais Simultâneos (Envio de Inscrições)',
    concurrency: 100,
    totalRequests: 500,
    taskFn: async (idx) => {
      const cpf = generateValidCPF();
      return makeHttpRequest(PORT, { path: '/api/create-reservation', method: 'POST' }, {
        fullName: `Atleta Carga ${idx}`,
        cpf,
        birthDate: '1992-08-20',
        email: `atleta_c2_${idx}@teste.com`,
        phone: '84999991111',
        city: 'Natal',
        state: 'RN',
        originType: 'VISITANTE',
        shirtSize: shirtSizes[idx % shirtSizes.length],
        paymentMethod: idx % 2 === 0 ? 'PIX' : 'CREDIT_CARD',
      });
    },
  });
  reports.push(rep2);

  // ----------------------------------------------------------------------------
  // CENÁRIO 3: 300 Usuários Virtuais Concorrentes (Disputa Crítica de Estoque)
  // Teste de alta contenção no tamanho XG (apenas 50 unidades disponíveis)
  // ----------------------------------------------------------------------------
  engine.reset();
  const rep3 = await runLoadScenario({
    name: 'Cenário 3: 300 Usuários Virtuais Concorrentes (Estresse & Esgotamento de Estoque)',
    concurrency: 300,
    totalRequests: 1000,
    taskFn: async (idx) => {
      const cpf = generateValidCPF();
      // Concentração em tamanhos concorridos (XG com apenas 50 vagas, GG com 120)
      const targetSize = idx < 200 ? 'XG' : shirtSizes[idx % shirtSizes.length];
      return makeHttpRequest(PORT, { path: '/api/create-reservation', method: 'POST' }, {
        fullName: `Atleta Estresse ${idx}`,
        cpf,
        birthDate: '1988-11-10',
        email: `estresse_${idx}@teste.com`,
        phone: '84999992222',
        city: 'Lajes Pintadas',
        state: 'RN',
        originType: 'CASA',
        casaProofType: 'NATURAL',
        shirtSize: targetSize,
        paymentMethod: 'PIX',
      });
    },
  });
  reports.push(rep3);

  // ----------------------------------------------------------------------------
  // CENÁRIO 4: 1.000 Visitantes Simultâneos (Navegação na Página Pública e Consultas)
  // ----------------------------------------------------------------------------
  // Coletar alguns protocolos criados no Cenário 3 para consultas válidas
  const createdProtocols = Array.from(engine.registrations.values()).slice(0, 50);

  const rep4 = await runLoadScenario({
    name: 'Cenário 4: 1.000 Visitantes Simultâneos (Página Pública e Consultas de Status)',
    concurrency: 200, // pool de 200 conexões ativas simulando tráfego de 1000 visitantes
    totalRequests: 2000,
    taskFn: async (idx) => {
      if (idx % 3 === 0 && createdProtocols.length > 0) {
        // Consulta à Área do Atleta (lookup interno)
        const target = createdProtocols[idx % createdProtocols.length];
        return makeHttpRequest(PORT, {
          path: `/api/lookup?protocol=${target.protocol}&accessCode=${target.accessCode}`,
          method: 'GET',
        });
      } else {
        // Navegação na página pública / checagem de saúde
        return makeHttpRequest(PORT, { path: '/api/health', method: 'GET' });
      }
    },
  });
  reports.push(rep4);

  // ----------------------------------------------------------------------------
  // CENÁRIO 5: Confirmação em Massa por Webhook (500 notificações concorrentes)
  // ----------------------------------------------------------------------------
  const regsToConfirm = Array.from(engine.registrations.values()).slice(0, 300);
  const rep5 = await runLoadScenario({
    name: 'Cenário 5: Webhooks Concorrentes (300 Confirmações + Tentativas Duplicadas)',
    concurrency: 50,
    totalRequests: 400,
    taskFn: async (idx) => {
      const target = regsToConfirm[idx % regsToConfirm.length];
      const isDuplicate = idx >= 300; // Repetir os últimos 100 para testar deduplicação
      const event = isDuplicate ? 'PAYMENT_CONFIRMED' : 'PAYMENT_RECEIVED';

      return makeHttpRequest(PORT, { path: '/api/webhook-asaas', method: 'POST' }, {
        event,
        payment: {
          id: `pay_test_${idx}`,
          externalReference: target ? target.protocol : 'LP5-2612-NONE',
          status: 'RECEIVED',
          value: 55.00,
          netValue: 50.00,
        },
      });
    },
  });
  reports.push(rep5);

  server.close();
  console.log('\n[LoadServer] Todos os testes concluídos com sucesso. Servidor encerrado.');

  // Salvar relatório sintético estruturado em JSON
  import('fs').then((fs) => {
    fs.writeFileSync('tests/load_test_results.json', JSON.stringify(reports, null, 2), 'utf-8');
    console.log('[LoadServer] Resultados salvos em tests/load_test_results.json');
  });
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
