// ==============================================================================
// UTILITÁRIO DE EXPORTAÇÃO CSV E EXCEL COM PROTEÇÃO CONTRA INJEÇÃO DE FÓRMULAS
// ==============================================================================
// Medida de segurança: Previne CSV/Formula Injection (CWE-1236)
// Qualquer campo textual iniciando por '=', '+', '-', '@', '\t', '\r' tem
// uma aspa simples "'" adicionada no início para forçar o Excel a tratar como texto puro.
// ==============================================================================

import * as XLSX from 'xlsx';
import { Registration } from '../types';
import { formatCentsToBRL } from './pricing';
import { formatDateBR, formatDateTimeBR } from './masks';

export function sanitizeFormulaInjection(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value).trim();
  
  // Se o valor começar com caracteres que desencadeiam execução de fórmula no Excel
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

export interface ExportRow {
  Protocolo: string;
  Atleta: string;
  CPF: string;
  'Data Nasc.': string;
  Email: string;
  WhatsApp: string;
  Cidade: string;
  UF: string;
  Equipe: string;
  Categoria: string;
  Origem: string;
  'Vínculo Casa': string;
  Camisa: string;
  Situação: string;
  'Status Financeiro': string;
  Pagamento: string;
  'Valor Total': string;
  'ID Asaas': string;
  'Data Inscrição': string;
  'Kit Entregue': string;
  'Data Entrega Kit': string;
  'Entregue Por': string;
}

export function prepareRegistrationsForExport(registrations: Registration[]): ExportRow[] {
  return registrations.map((r) => {
    const athlete = r.athlete;
    return {
      Protocolo: sanitizeFormulaInjection(r.protocol),
      Atleta: sanitizeFormulaInjection(athlete?.fullName || 'N/A'),
      CPF: sanitizeFormulaInjection(athlete?.cpf || 'N/A'),
      'Data Nasc.': sanitizeFormulaInjection(formatDateBR(athlete?.birthDate)),
      Email: sanitizeFormulaInjection(athlete?.email || 'N/A'),
      WhatsApp: sanitizeFormulaInjection(athlete?.phone || 'N/A'),
      Cidade: sanitizeFormulaInjection(athlete?.city || 'N/A'),
      UF: sanitizeFormulaInjection(athlete?.state || 'N/A'),
      Equipe: sanitizeFormulaInjection(athlete?.team || '-'),
      Categoria: sanitizeFormulaInjection(r.category.replace('_', ' ')),
      Origem: sanitizeFormulaInjection(r.originType),
      'Vínculo Casa': sanitizeFormulaInjection(r.casaProofType || '-'),
      Camisa: sanitizeFormulaInjection(r.shirtSize),
      Situação: sanitizeFormulaInjection(r.status),
      'Status Financeiro': sanitizeFormulaInjection(r.financialStatus),
      Pagamento: sanitizeFormulaInjection(r.paymentMethod),
      'Valor Total': sanitizeFormulaInjection(formatCentsToBRL(r.totalAmountCents)),
      'ID Asaas': sanitizeFormulaInjection(r.asaasPaymentId || '-'),
      'Data Inscrição': sanitizeFormulaInjection(formatDateTimeBR(r.createdAt)),
      'Kit Entregue': sanitizeFormulaInjection(r.kitDelivered ? 'SIM' : 'NÃO'),
      'Data Entrega Kit': sanitizeFormulaInjection(formatDateTimeBR(r.kitDeliveredAt)),
      'Entregue Por': sanitizeFormulaInjection(r.kitDeliveredBy || '-'),
    };
  });
}

export function exportToExcel(registrations: Registration[], fileNamePrefix = 'Inscricoes_Corrida_Lajes_Pintadas'): void {
  const rows = prepareRegistrationsForExport(registrations);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inscritos');

  // Ajuste automático de largura de colunas
  const colWidths = Object.keys(rows[0] || {}).map((key) => ({
    wch: Math.max(key.length, 14),
  }));
  worksheet['!cols'] = colWidths;

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${fileNamePrefix}_${dateStr}.xlsx`);
}

export function exportToCSV(registrations: Registration[], fileNamePrefix = 'Inscricoes_Corrida_Lajes_Pintadas'): void {
  const rows = prepareRegistrationsForExport(registrations);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet, { FS: ';' }); // Formato padrão brasileiro com ponto e vírgula

  // Incluir BOM para UTF-8 para garantir acentuação correta no Excel brasileiro
  const blob = new Blob(['\uFEFF' + csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `${fileNamePrefix}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const exportRegistrationsToExcel = exportToExcel;
export const exportRegistrationsToCSV = exportToCSV;
