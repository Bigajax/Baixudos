/**
 * Tipos de aplicação da rifa (camelCase), desacoplados das linhas do banco.
 * As queries em `queries.ts` mapeiam as rows do Supabase para estes tipos.
 */

export type NumberStatus =
  | "available"
  | "reserved"
  | "pending"
  | "confirmed"
  | "blocked"
  | "cancelled"
  | "won";

export type CampaignStatus = "draft" | "published" | "paused" | "drawn" | "closed";

export interface CampaignMedia {
  kind: "image" | "video";
  url: string;
  alt: string | null;
}

export interface RaffleCampaign {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;

  prizeTitle: string;
  prizeDescription: string | null;
  prizeModel: string | null;
  prizeYear: string | null;
  prizeColor: string | null;
  prizeCondition: string | null;
  prizeDetails: string | null;

  totalNumbers: number;
  priceCents: number;
  numberPadding: number;
  minPerOrder: number;
  maxPerOrder: number;
  randomQuickPicks: number[];

  status: CampaignStatus;
  salesOpenAt: string | null;
  salesCloseAt: string | null;
  drawAt: string | null;

  locationLabel: string | null;
  eventLabel: string | null;
  eventDescription: string | null;
  eventAddress: string | null;
  eventMapUrl: string | null;

  highlightImageUrl: string | null;
  regulationUrl: string | null;
  certificateUrl: string | null;
  privacyPolicyUrl: string | null;
  termsUrl: string | null;
  supportChannel: string | null;
  drawMethod: string | null;

  showGrossRevenue: boolean;
  isDemo: boolean;
  resultNumber: number | null;

  media: CampaignMedia[];
}

/** Um número já tomado (não disponível) — payload compacto da grade. */
export interface TakenNumber {
  number: number;
  status: NumberStatus;
}

/** Contagem por status + disponíveis derivado. */
export type StatusCounts = Record<NumberStatus, number>;

export interface GridData {
  total: number;
  counts: StatusCounts;
  /** Só os números com status <> 'available'. Ausência = disponível. */
  taken: TakenNumber[];
}

/** Formata um número com o padding da campanha (ex.: 7 -> "0007"). */
export function padNumber(n: number, padding: number): string {
  return String(n).padStart(padding, "0");
}
