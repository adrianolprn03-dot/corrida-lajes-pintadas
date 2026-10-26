// ==============================================================================
// CÁLCULO DE PREÇO E TAXA DE SERVIÇO (10%)
// ==============================================================================
// Regra do Evento:
// Valor base de inscrição de R$ 50,00 acrescido de taxa de serviço de 10% (R$ 5,00),
// totalizando R$ 55,00 para o atleta.
// ==============================================================================

import { PaymentMethod, PricingBreakdown } from '../types';

export interface FeeConfig {
  basePriceCents: number; // 5000 (R$ 50,00)
  feePercent?: number; // 0.10 (10%)
  pixFixedFeeCents?: number;
  creditFixedFeeCents?: number;
  creditPercentFee?: number;
}

export const DEFAULT_FEE_CONFIG: FeeConfig = {
  basePriceCents: 5000, // R$ 50,00
  feePercent: 0.10, // 10%
  pixFixedFeeCents: 500, // R$ 5,00 (10%)
  creditFixedFeeCents: 500, // R$ 5,00 (10%)
  creditPercentFee: 0.10, // 10%
};

export function calculatePricing(
  paymentMethod: PaymentMethod,
  config: FeeConfig = DEFAULT_FEE_CONFIG
): PricingBreakdown {
  // O valor oficial e imutável da inscrição conforme Edital é rigorosamente R$ 50,00 (5000 centavos)
  const baseCents = 5000; // R$ 50,00
  const feePercent = 0.10; // Taxa de 10%
  const feeCents = Math.round(baseCents * feePercent); // R$ 5,00 (10% de R$ 50,00)
  const totalCents = baseCents + feeCents; // R$ 55,00

  const paymentLabel = paymentMethod === 'PIX' ? 'Pix' : 'Cartão 1x';

  return {
    baseAmountCents: baseCents,
    feeCents,
    totalAmountCents: totalCents,
    paymentMethod,
    formulaDescription: `R$ 50,00 + R$ 5,00 (taxa de serviço 10% - ${paymentLabel})`,
  };
}

export function formatCentsToBRL(cents: number): string {
  const val = Number.isFinite(cents) && cents > 0 ? cents : 5000;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val / 100);
}
