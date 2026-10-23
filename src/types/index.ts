// ==============================================================================
// 5ª CORRIDA DE EMANCIPAÇÃO POLÍTICA DE LAJES PINTADAS/RN - TIPOS OFICIAIS
// ==============================================================================

export type EventStatus = 'PREPARATION' | 'OPEN' | 'SUSPENDED' | 'CLOSED' | 'SOLD_OUT';

export type AthleteGender = 'MASCULINO' | 'FEMININO';

// Categoria Local (anteriormente chamada Casa) e Visitante
export type OriginType = 'CASA' | 'VISITANTE' | 'LOCAL';

export type CasaProofType = 'NATURAL' | 'RESIDENTE' | 'NATURAL_E_RESIDENTE';
export type LocalProofType = CasaProofType;

export type Category = 
  | 'CASA_MASCULINO' 
  | 'CASA_FEMININO' 
  | 'VISITANTE_MASCULINO' 
  | 'VISITANTE_FEMININO'
  | 'LOCAL_MASCULINO'
  | 'LOCAL_FEMININO';

export type ShirtSize = 'PP' | 'P' | 'M' | 'G' | 'GG' | 'XG';

export type PaymentMethod = 'PIX' | 'CREDIT_CARD';

export type RegistrationChannel = 'ONLINE' | 'PRESENCIAL_PREFEITURA';

// Perfis de Acesso ao Painel Administrativo
export type AdminRole = 
  | 'ADMIN_GERAL'      // Administrador Geral: Acesso total a todas as áreas, finanças, Asaas, operadores e configurações
  | 'ATENDIMENTO'      // Atendimento Presencial: Inscrições presenciais (Local), consulta de atletas e comprovantes
  | 'FINANCEIRO'       // Gestão Financeira: Visão Geral, conciliação Asaas, relatórios contábeis e taxas
  | 'ENTREGA_KIT';     // Entrega de Kits: Busca de atleta por CPF/Protocolo e baixa na entrega do kit oficial

export interface AdminOperator {
  id: string;
  username: string;
  name: string;
  role: AdminRole;
  email: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
  password?: string;
}

export type DocumentVerificationStatus = 
  | 'PENDENTE' 
  | 'APROVADO' 
  | 'PENDENTE_COMPLEMENTACAO' 
  | 'REJEITADO';

export type RegistrationStatus = 
  | 'RESERVED' 
  | 'CONFIRMED' 
  | 'EXPIRED' 
  | 'CANCELLED' 
  | 'IN_REVIEW' 
  | 'REFUNDED';

export type FinancialStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'RECEIVED' 
  | 'IN_ANALYSIS' 
  | 'REFUNDED' 
  | 'DISPUTED' 
  | 'OVERDUE' 
  | 'FAILED';

export interface EventSettings {
  id: string;
  eventName: string;
  edition: string;
  eventDate: string; // '2026-12-26'
  distanceKm: number; // 5.0
  basePriceCents: number; // 6000
  status: EventStatus;
  maxCapacity: number | null;
  localMaxCapacity?: number | null; // Cota de Vagas Categoria Local (Lajespintadense)
  visitorMaxCapacity?: number | null; // Cota de Vagas Categoria Visitante (Demais Cidades)
  minAge: number | null;
  minorRules: string;
  startTime: string;
  startLocation: string;
  registrationStartDate: string | null;
  registrationEndDate: string | null;
  kitPickupInfo: string;
  cancellationPolicy: string;
  organizerName: string;
  organizerContact: string;
  revenueResponsible: string;
  asaasEnvironment: 'sandbox' | 'production';
  asaasPixFixedFeeCents: number;
  asaasCreditFixedFeeCents: number;
  asaasCreditPercentFee: number;
  termsVersion: string;
  privacyVersion: string;
  termsContent: string;
  privacyContent: string;
  updatedAt: string;
}

export interface ShirtInventoryItem {
  id: string;
  size: ShirtSize;
  displayOrder: number;
  // Estoque Consolidado
  totalStock: number;
  reservedCount: number;
  confirmedCount: number;
  isActive: boolean;
  availableStock: number; // totalStock - (reservedCount + confirmedCount)

  // Estoque Exclusivo Atletas Locais (Lajespintadense - Atendimento Presencial)
  localTotalStock?: number;
  localReservedCount?: number;
  localConfirmedCount?: number;
  localAvailableStock?: number;

  // Estoque Exclusivo Visitantes (Inscrições Gerais)
  visitorTotalStock?: number;
  visitorReservedCount?: number;
  visitorConfirmedCount?: number;
  visitorAvailableStock?: number;
}

export interface AthleteData {
  id?: string;
  fullName: string;
  cpf: string;
  birthDate: string; // YYYY-MM-DD
  email: string;
  phone: string;
  city: string;
  state: string;
  team?: string;
}

export interface RegistrationSubmission {
  // Step 1 - Athlete data
  fullName: string;
  cpf: string;
  birthDate: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  team?: string;
  
  // Step 2 - Category & Kit
  originType: OriginType;
  gender: AthleteGender;
  casaProofType?: CasaProofType;
  shirtSize: ShirtSize;
  paymentMethod: PaymentMethod;
  
  // Step 3 - Agreement
  termsAccepted: boolean;
  privacyAccepted: boolean;
  termsVersion: string;
  privacyVersion: string;

  // Presential attendance fields
  channel?: RegistrationChannel;
  attendantName?: string;
  attendantId?: string;
  documentVerificationStatus?: DocumentVerificationStatus;
  documentTypePresented?: string;
  documentVerificationNotes?: string;
}

export interface Registration {
  id: string;
  athleteId: string;
  protocol: string;
  category: Category;
  originType: OriginType;
  gender: AthleteGender;
  casaProofType: CasaProofType | null;
  shirtSize: ShirtSize;
  status: RegistrationStatus;
  financialStatus: FinancialStatus;
  paymentMethod: PaymentMethod;
  baseAmountCents: number;
  processingFeeCents: number;
  totalAmountCents: number;
  netReceivedCents?: number | null;
  asaasPaymentId?: string | null;
  asaasInvoiceUrl?: string | null;
  asaasPixQrCode?: string | null;
  asaasPixCopyPaste?: string | null;
  pixQrCodeUrl?: string | null;
  pixPayload?: string | null;
  reservationExpiresAt: string;
  paidAt?: string | null;
  kitDelivered: boolean;
  kitDeliveredAt?: string | null;
  kitDeliveredBy?: string | null;
  kitNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  athlete?: AthleteData;

  // Presential and Document Audit Fields
  channel?: RegistrationChannel;
  documentVerificationStatus?: DocumentVerificationStatus;
  documentTypePresented?: string | null;
  documentVerificationNotes?: string | null;
  documentCheckedBy?: string | null;
  documentCheckedAt?: string | null;
  attendantName?: string | null;
  attendantId?: string | null;
}

export interface PricingBreakdown {
  baseAmountCents: number;
  feeCents: number;
  totalAmountCents: number;
  paymentMethod: PaymentMethod;
  formulaDescription: string;
}

export interface AthleteLookupResponse {
  registration: Registration;
  athlete: {
    fullName: string;
    cpfMasked: string;
    city: string;
    state: string;
    team?: string;
    emailMasked: string;
  };
  event: {
    eventName: string;
    eventDate: string;
    distanceKm: number;
    startTime: string;
    startLocation: string;
    kitPickupInfo: string;
    organizerContact: string;
  };
}

export interface AdminMetrics {
  confirmedCount: number;
  reservedCount: number;
  availableCapacity: number | null;
  totalCapacity: number | null;
  categories: Record<Category, number>;
  grossRevenueCents: number;
  processingFeesCents: number;
  netRevenueCents: number;
  refundedCount: number;
  inReviewCount: number;
  shirts: Record<ShirtSize, { total: number; reserved: number; confirmed: number; available: number }>;
  kitsDeliveredCount: number;
  // Indicadores Especiais Locais vs Visitantes e Asaas
  localCount?: number;
  visitorCount?: number;
  localMaxCapacity?: number | null;
  visitorMaxCapacity?: number | null;
  localAvailableCapacity?: number | null;
  visitorAvailableCapacity?: number | null;
  localReservedCount?: number;
  visitorReservedCount?: number;
  localConfirmedCount?: number;
  visitorConfirmedCount?: number;
  presentialCount?: number;
  onlineCount?: number;
  asaasStatus?: 'CONNECTED' | 'SANDBOX' | 'OFFLINE';
  asaasLatencyMs?: number;
}
