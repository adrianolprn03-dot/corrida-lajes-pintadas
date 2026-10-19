// ==============================================================================
// CÁLCULO DE PREÇO E TARIFAS ASAAS (EXATO, TRANSPARENTE E DOCUMENTADO)
// ==============================================================================
// Regra do Edital:
// O evento preserva exatamente R$ 60,00 após a dedução da taxa do Asaas.
//
// 1. PIX:
//    Total = 60,00 + tarifa_fixa_pix
//    Exemplo: R$ 60,00 + R$ 0,99 = R$ 60,99.
//    Líquido que a prefeitura/organização recebe: R$ 60,00.
//
// 2. CARTÃO DE CRÉDITO (1x sem parcelamento):
//    Fórmula: Total = (60,00 + tarifa_fixa_cartao) / (1 - percentual)
//    Arredondamento: Math.ceil (para cima em centavos inteiros)
//    Exemplo com taxa de R$ 0,49 + 2,99%:
//    Total = (60,00 + 0,49) / (1 - 0.0299) = 60,49 / 0.9701 = 62,354396... -> R$ 62,36.
//    Ao cobrar R$ 62,36, o Asaas desconta: (62,36 * 0.0299) + 0,49 = 1,86 + 0,49 = 2,36.
//    Líquido que a organização recebe: 62,36 - 2,36 = R$ 60,00!
// ==============================================================================

import { PaymentMethod, PricingBreakdown } from '../types';

export interface FeeConfig {
  basePriceCents: number; // 6000
  pixFixedFeeCents: number; // 99 (R$ 0,99)
  creditFixedFeeCents: number; // 49 (R$ 0,49)
  creditPercentFee: number; // 0.0299 (2,99%)
}

export const DEFAULT_FEE_CONFIG: FeeConfig = {
  basePriceCents: 6000, // R$ 60,00
  pixFixedFeeCents: 99, // R$ 0,99
  creditFixedFeeCents: 49, // R$ 0,49
  creditPercentFee: 0.0299, // 2,99%
};

export function calculatePricing(
  paymentMethod: PaymentMethod,
  config: FeeConfig = DEFAULT_FEE_CONFIG
): PricingBreakdown {
  const baseCents = config.basePriceCents;

  if (paymentMethod === 'PIX') {
    const feeCents = config.pixFixedFeeCents;
    const totalCents = baseCents + feeCents;

    return {
      baseAmountCents: baseCents,
      feeCents,
      totalAmountCents: totalCents,
      paymentMethod: 'PIX',
      formulaDescription: `R$ ${(baseCents / 100).toFixed(2).replace('.', ',')} + R$ ${(feeCents / 100).toFixed(2).replace('.', ',')} (processamento Pix Asaas)`,
    };
  } else {
    // Cartão de crédito à vista (1x)
    const basePlusFixed = (baseCents + config.creditFixedFeeCents) / 100;
    const netMultiplier = 1.0 - config.creditPercentFee;
    
    // Cálculo do total em centavos arredondado para cima
    const rawTotal = basePlusFixed / netMultiplier;
    const totalCents = Math.ceil(rawTotal * 100);
    const feeCents = totalCents - baseCents;

    return {
      baseAmountCents: baseCents,
      feeCents,
      totalAmountCents: totalCents,
      paymentMethod: 'CREDIT_CARD',
      formulaDescription: `R$ ${(baseCents / 100).toFixed(2).replace('.', ',')} + R$ ${(feeCents / 100).toFixed(2).replace('.', ',')} (tarifa fixa + ${(config.creditPercentFee * 100).toFixed(2).replace('.', ',')}% cartão de crédito Asaas)`,
    };
  }
}

export function formatCentsToBRL(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}
