// ==============================================================================
// VERCEL SERVERLESS FUNCTION: /api/health
// Monitoramento de integridade, status dos serviços e latência básica
// ==============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { memoryStore } from './lib/state.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const uptimeSeconds = process.uptime();
  const memUsage = process.memoryUsage();

  return res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(uptimeSeconds),
    memory: {
      rssMb: Math.round(memUsage.rss / 1024 / 1024),
      heapUsedMb: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(memUsage.heapTotal / 1024 / 1024),
    },
    p95LatencyMs: memoryStore.getP95Latency(),
    activeRegistrations: memoryStore.registrations.size,
  });
}
