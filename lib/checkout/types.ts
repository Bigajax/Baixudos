/**
 * Tipos do checkout integrado (campanha + ingresso).
 * O cliente envia apenas IDs/quantidades/números — NUNCA preços.
 * Os valores são sempre recalculados no servidor (ver pricing.ts).
 */

export type ItemType = "campaign_individual" | "campaign_pack" | "event_ticket";

/** Pack de números (preços vêm do servidor). */
export interface Pack {
  id: string;
  title: string;
  numberQuantity: number;
  originalPriceCents: number;
  promotionalPriceCents: number;
}

export type SourceFlow =
  | "campaign_first"
  | "ticket_first"
  | "post_purchase_ticket"
  | "post_purchase_campaign";

/** Intenção da parte de campanha (números individuais ou pack). */
export interface CampaignIntent {
  campaignId: string;
  /** Se presente, usa preço de pack; senão, números individuais. */
  packId?: string | null;
  /** Números escolhidos/atribuídos (podem ser definidos no checkout). */
  numbers?: number[];
  /** Quando ainda não há números definidos, a quantidade pretendida. */
  count?: number;
  /** Oferta aplicada (ex.: número promocional no combo com ingresso). */
  offerId?: string | null;
}

/** Intenção da parte de ingresso. */
export interface TicketIntent {
  ticketTypeId: string;
  quantity: number;
  offerId?: string | null;
}

export interface QuoteInput {
  campaign?: CampaignIntent | null;
  ticket?: TicketIntent | null;
}

/** Uma linha do orçamento (espelha um futuro order_item). */
export interface QuoteLine {
  itemType: ItemType;
  label: string;
  quantity: number;
  originalUnitCents: number;
  finalUnitCents: number;
  discountCents: number;
  subtotalCents: number;
  campaignId?: string;
  campaignPackId?: string;
  ticketTypeId?: string;
  offerId?: string;
  numbers?: number[];
}

/** Orçamento autoritativo calculado no servidor. */
export interface Quote {
  lines: QuoteLine[];
  subtotalCents: number;
  discountTotalCents: number;
  feeTotalCents: number;
  totalCents: number;
}

export interface CustomerInput {
  fullName: string;
  cpf: string;
  phone: string;
  email: string;
  birthDate?: string | null;
}

export interface ConsentInput {
  regulation: boolean;
  terms: boolean;
  privacy: boolean;
  marketing?: boolean;
}

export interface CreateOrderInput {
  sourceFlow: SourceFlow;
  campaign?: (CampaignIntent & { numbers: number[] }) | null;
  ticket?: TicketIntent | null;
  customer: CustomerInput;
  consents: ConsentInput;
}

export interface CreateOrderResult {
  orderCode: string;
  totalCents: number;
  providerPaymentId: string;
  pixCopyPaste: string;
  qrCodeBase64: string | null;
  expiresAt: string;
}

