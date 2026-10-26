// ==============================================================================
// UTILITÁRIOS E VALIDAÇÃO DE CARTÃO DE CRÉDITO
// Suporte a detecção de bandeira, máscaras e validação de expiração / algoritmo de Luhn
// ==============================================================================

export type CardBrand = 'visa' | 'mastercard' | 'elo' | 'hipercard' | 'amex' | 'unknown';

export function detectCardBrand(cardNumber: string): CardBrand {
  const clean = cardNumber.replace(/\D/g, '');
  if (!clean) return 'unknown';

  // Elo (Prefixos brasileiros comuns)
  if (
    /^(4011(78|79)|431274|438935|451416|457393|45763(1|2)|504175|627780|636297|636368|506699|5067[0-7][0-9]|5090[0-9]{2}|65003[1-3]|6500[3-5][0-9]|6504[0-3][0-9]|6504[8-9][0-9]|6505[0-9]{2}|6507[0-2][0-9]|6509[0-7][0-9]|6516[5-7][0-9]|6550[0-5][0-9])/.test(
      clean
    )
  ) {
    return 'elo';
  }

  // Hipercard
  if (/^(606282|3841)/.test(clean)) {
    return 'hipercard';
  }

  // Amex
  if (/^3[47]/.test(clean)) {
    return 'amex';
  }

  // Visa
  if (/^4/.test(clean)) {
    return 'visa';
  }

  // Mastercard
  if (/^(5[1-5]|2[2-7])/.test(clean)) {
    return 'mastercard';
  }

  return 'unknown';
}

export function maskCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  // Se for Amex (15 dígitos: 4-6-5)
  if (/^3[47]/.test(digits)) {
    return digits
      .replace(/(\d{4})(\d)/, '$1 $2')
      .replace(/(\d{4}) (\d{6})(\d)/, '$1 $2 $3')
      .trim();
  }
  // Padrão 16 dígitos: 4-4-4-4
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function maskExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  }
  return digits;
}

export function maskCVV(value: string, brand: CardBrand = 'unknown'): string {
  const max = brand === 'amex' ? 4 : 4;
  return value.replace(/\D/g, '').slice(0, max);
}

export function validateCardNumber(number: string): boolean {
  const clean = number.replace(/\D/g, '');
  if (clean.length < 13 || clean.length > 19) return false;

  // Algoritmo de Luhn
  let sum = 0;
  let alternate = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let n = parseInt(clean.charAt(i), 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n = (n % 10) + 1;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

export function validateExpiry(monthStr: string, yearStr: string): boolean {
  const month = parseInt(monthStr, 10);
  let year = parseInt(yearStr, 10);
  if (isNaN(month) || isNaN(year) || month < 1 || month > 12) return false;

  // Ajustar ano para 4 dígitos se digitado como 2
  if (year < 100) year += 2000;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  if (year > currentYear + 20) return false;

  return true;
}
