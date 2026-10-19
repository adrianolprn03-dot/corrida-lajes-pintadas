// ==============================================================================
// MÁSCARAS E FORMATADORES DE ENTRADA
// ==============================================================================

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

export function formatPhone(value: string): string {
  return maskPhone(value || '');
}

export function formatCPF(value: string): string {
  const digits = (value || '').replace(/\D/g, '').slice(0, 11);
  if (digits.length !== 11) return value || '';
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function maskDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2');
}

export function formatDateBR(dateStr: string | null | undefined): string {
  if (!dateStr) return '--/--/----';
  try {
    // Se for formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const [year, month, day] = dateStr.slice(0, 10).split('-');
      return `${day}/${month}/${year}`;
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  } catch {
    return dateStr;
  }
}

export function formatDateTimeBR(dateStr: string | null | undefined): string {
  if (!dateStr) return '--/--/---- --:--';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function calculateAgeOnDate(birthDateStr: string, targetDateStr: string = '2026-12-26'): number {
  if (!birthDateStr) return 0;
  const birth = new Date(birthDateStr);
  const target = new Date(targetDateStr);
  let age = target.getFullYear() - birth.getFullYear();
  const m = target.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && target.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
