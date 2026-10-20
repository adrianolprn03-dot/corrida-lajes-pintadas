// ==============================================================================
// CÁLCULO DE PREÇO E TAXA DE SERVIÇO (10%)
// ==============================================================================
// Regra do Evento:
// Valor base de inscrição de R$ 60,00 acrescido de taxa de serviço de 10% (R$ 6,00),
// totalizando R$ 66,00 para o atleta.
// ==============================================================================

import { PaymentMethod, PricingBreakdown } from '../types';

export interface FeeConfig {
  basePriceCents: number; // 6000 (R$ 60,00)
  feePercent?: number; // 0.10 (10%)
  pixFixedFeeCents?: number;
  creditFixedFeeCents?: number;
  creditPercentFee?: number;
}

export const DEFAULT_FEE_CONFIG: FeeConfig = {
  basePriceCents: 6000, // R$ 60,00
  feePercent: 0.10, // 10%
  pixFixedFeeCents: 600, // R$ 6,00 (10%)
  creditFixedFeeCents: 600, // R$ 6,00 (10%)
  creditPercentFee: 0.10, // 10%
};

export function calculatePricing(
  paymentMethod: PaymentMethod,
  config: FeeConfig = DEFAULT_FEE_CONFIG
): PricingBreakdown {
  const baseCents = config.basePriceCents || 6000;
  // Garantir que a taxa percentual padrão seja rigorosamente 10% (0.10)
  const feePercent = (config.feePercent && config.feePercent > 0) ? config.feePercent : 0.10;
  const feeCents = config.pixFixedFeeCents && config.pixFixedFeeCents > 0 && config.pixFixedFeeCents !== 99 && config.pixFixedFeeCents !== 49
    ? config.pixFixedFeeCents
    : Math.round(baseCents * feePercent); // R$ 6,00 para R$ 60,00
  const totalCents = baseCents + feeCents; // R$ 66,00

  const paymentLabel = paymentMethod === 'PIX' ? 'Pix' : 'Cartão';

  return {
    baseAmountCents: baseCents,
    feeCents,
    totalAmountCents: totalCents,
    paymentMethod,
    formulaDescription: `R$ ${(baseCents / 100).toFixed(2).replace('.', ',')} + R$ ${(feeCents / 100).toFixed(2).replace('.', ',')} (taxa de serviço 10% - ${paymentLabel})`,
  };
}

export function formatCentsToBRL(cents: number): string {
  const val = Number.isFinite(cents) && cents > 0 ? cents : 6600;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val / 100);
}
