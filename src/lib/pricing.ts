// ==============================================================================
// CÁLCULO DE PREÇO POR LOTE E TAXA DE SERVIÇO (10%)
// ==============================================================================
// Regras Oficiais do Evento:
// 1. Categoria Geral:
//    Valor base do lote vigente acrescido de taxa de serviço de 10%.
// 2. Categoria PCD / Inclusão (Pessoas com Deficiência):
//    50% de desconto (metade do valor base do lote vigente) acrescido de taxa de 10%.
// 3. Atleta-Guia de atleta PCD:
//    Inscrição e kit oficial (camisa laranja) 100% gratuitos (R$ 0,00).
// ==============================================================================

import { EventSettings, PaymentMethod, PricingBreakdown } from '../types';

export interface FeeConfig {
  basePriceCents: number;
  feePercent?: number; // 0.10 (10%)
  pixFixedFeeCents?: number;
  creditFixedFeeCents?: number;
  creditPercentFee?: number;
}

export const DEFAULT_FEE_CONFIG: FeeConfig = {
  basePriceCents: 5000, // Fallback padrão quando nenhum lote foi configurado
  feePercent: 0.10, // 10%
  pixFixedFeeCents: 500,
  creditFixedFeeCents: 500,
  creditPercentFee: 0.10,
};

export function getActiveBasePriceCents(settings?: Partial<EventSettings> | null): number {
  const batchCurrent = settings?.batchState?.current;
  if (batchCurrent && Number.isFinite(batchCurrent.basePriceCents) && batchCurrent.basePriceCents > 0) {
    return Math.round(batchCurrent.basePriceCents);
  }
  const firstBatch = settings?.registrationBatches?.[0];
  if (!settings?.batchState && firstBatch && Number.isFinite(firstBatch.basePriceCents) && firstBatch.basePriceCents > 0) {
    return Math.round(firstBatch.basePriceCents);
  }
  if (settings?.basePriceCents && Number.isFinite(settings.basePriceCents) && settings.basePriceCents > 0) {
    return Math.round(settings.basePriceCents);
  }
  return DEFAULT_FEE_CONFIG.basePriceCents;
}

export function getActiveBatchLabel(settings?: Partial<EventSettings> | null): string {
  const current = settings?.batchState?.current;
  if (current?.name) return current.name;
  if (settings?.batchState?.configured && !current) {
    return 'Lotes Encerrados';
  }
  const firstBatch = settings?.registrationBatches?.[0];
  if (firstBatch?.name) return firstBatch.name;
  return '1º Lote Oficial';
}

export function calculatePricing(
  paymentMethod: PaymentMethod,
  config: FeeConfig = DEFAULT_FEE_CONFIG,
  options?: { isPcd?: boolean; batchName?: string }
): PricingBreakdown {
  const isPcd = Boolean(options?.isPcd);
  const fullBaseCents =
    Number.isFinite(config?.basePriceCents) && config.basePriceCents > 0
      ? Math.round(config.basePriceCents)
      : DEFAULT_FEE_CONFIG.basePriceCents;

  // Valor base do lote vigente:
  // - Para PCD: Metade do valor base do lote vigente (50%)
  // - Para demais categorias: 100% do valor base do lote vigente
  const baseCents = isPcd ? Math.round(fullBaseCents / 2) : fullBaseCents;
  const feePercent = 0.10; // Taxa de serviço de 10%
  const feeCents = Math.round(baseCents * feePercent);
  const totalCents = baseCents + feeCents;

  const paymentLabel = paymentMethod === 'PIX' ? 'Pix' : 'Cartão 1x';
  const batchPrefix = options?.batchName ? `${options.batchName}: ` : '';

  return {
    baseAmountCents: baseCents,
    feeCents,
    totalAmountCents: totalCents,
    paymentMethod,
    formulaDescription: isPcd
      ? `${batchPrefix}${formatCentsToBRL(baseCents)} (50% Meia-Inscrição PCD) + ${formatCentsToBRL(feeCents)} (taxa de serviço 10% - ${paymentLabel})`
      : `${batchPrefix}${formatCentsToBRL(baseCents)} + ${formatCentsToBRL(feeCents)} (taxa de serviço 10% - ${paymentLabel})`,
  };
}

export function formatCentsToBRL(cents: number): string {
  const val = Number.isFinite(cents) && cents >= 0 ? cents : DEFAULT_FEE_CONFIG.basePriceCents;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val / 100);
}
