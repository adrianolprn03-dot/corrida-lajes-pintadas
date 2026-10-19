// ==============================================================================
// VERCEL SERVERLESS FUNCTION: /api/metrics
// Monitoramento aprofundado: latência p95, erros, banco, estoque e pagamentos
// ==============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { memoryStore } from './lib/state';
import { asaasMetrics } from './lib/asaas';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const shirtStats: Record<string, { total: number; reserved: number; confirmed: number; available: number }> = {};
  for (const [size, s] of memoryStore.shirts.entries()) {
    shirtStats[size] = {
      total: s.totalStock,
      reserved: s.reservedCount,
      confirmed: s.confirmedCount,
      available: s.totalStock - (s.reservedCount + s.confirmedCount),
    };
  }

  let confirmedPayments = 0;
  let pendingPayments = 0;
  let cancelledPayments = 0;

  for (const reg of memoryStore.registrations.values()) {
    if (reg.status === 'CONFIRMED') confirmedPayments++;
    else if (reg.status === 'RESERVED') pendingPayments++;
    else if (reg.status === 'CANCELLED') cancelledPayments++;
  }

  return res.status(200).json({
    timestamp: new Date().toISOString(),
    latency: {
      p95Ms: memoryStore.getP95Latency(),
      samplesCount: memoryStore.metrics.latencies.length,
    },
    reservations: {
      successful: memoryStore.metrics.successfulReservations,
      rejectedOutOfStock: memoryStore.metrics.rejectedOutOfStock,
      rejectedOvercapacity: memoryStore.metrics.rejectedOvercapacity,
      rejectedDuplicateCpf: memoryStore.metrics.rejectedDuplicateCpf,
      duplicateSubmissionsPrevented: memoryStore.metrics.duplicateSubmissionsPrevented,
    },
    payments: {
      confirmed: confirmedPayments,
      pending: pendingPayments,
      cancelled: cancelledPayments,
      totalTracked: memoryStore.registrations.size,
    },
    asaasGateway: {
      ...asaasMetrics,
    },
    webhooks: {
      processed: memoryStore.metrics.webhookProcessed,
      duplicatesIgnored: memoryStore.metrics.webhookDuplicatesIgnored,
      outOfOrderIgnored: memoryStore.metrics.webhookOutOfOrderIgnored,
    },
    inventory: shirtStats,
  });
}
