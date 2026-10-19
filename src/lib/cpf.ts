// ==============================================================================
// VALIDADOR ESTRITO DE CPF (DÍGITOS VERIFICADORES OFICIAIS)
// ==============================================================================

export function isValidCPF(cpf: string): boolean {
  if (!cpf) return false;

  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');

  // CPF deve ter exatamente 11 dígitos
  if (cleanCPF.length !== 11) {
    return false;
  }

  // Bloqueia CPFs com todos os dígitos iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }

  // Validação do 1º dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i), 10) * (10 - i);
  }
  let firstCheck = (sum * 10) % 11;
  if (firstCheck === 10 || firstCheck === 11) {
    firstCheck = 0;
  }
  if (firstCheck !== parseInt(cleanCPF.charAt(9), 10)) {
    return false;
  }

  // Validação do 2º dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i), 10) * (11 - i);
  }
  let secondCheck = (sum * 10) % 11;
  if (secondCheck === 10 || secondCheck === 11) {
    secondCheck = 0;
  }
  if (secondCheck !== parseInt(cleanCPF.charAt(10), 10)) {
    return false;
  }

  return true;
}

export function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function maskCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return cpf;
  return `${clean.slice(0, 3)}.***.***-${clean.slice(9)}`;
}
