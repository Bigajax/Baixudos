/**
 * Leitura pública da rifa (server-only). Usa o client Supabase de servidor
 * (anon key + RLS): só campanhas fora de 'draft' são visíveis.
 */
import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  RaffleCampaign,
  GridData,
  StatusCounts,
  TakenNumber,
  NumberStatus,
  CampaignMedia,
} from "./types";

function emptyCounts(): StatusCounts {
  return {
    available: 0,
    reserved: 0,
    pending: 0,
    confirmed: 0,
    blocked: 0,
    cancelled: 0,
    won: 0,
  };
}

interface MediaRow {
  kind: "image" | "video";
  url: string;
  alt_text: string | null;
  sort_order: number;
}

interface CampaignRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  prize_title: string;
  prize_description: string | null;
  prize_model: string | null;
  prize_year: string | null;
  prize_color: string | null;
  prize_condition: string | null;
  prize_details: string | null;
  total_numbers: number;
  price_cents: number;
  number_padding: number;
  min_per_order: number;
  max_per_order: number;
  random_quick_picks: number[];
  status: RaffleCampaign["status"];
  sales_open_at: string | null;
  sales_close_at: string | null;
  draw_at: string | null;
  location_label: string | null;
  event_label: string | null;
  event_description: string | null;
  event_address: string | null;
  event_map_url: string | null;
  highlight_image_url: string | null;
  regulation_url: string | null;
  certificate_url: string | null;
  privacy_policy_url: string | null;
  terms_url: string | null;
  support_channel: string | null;
  draw_method: string | null;
  show_gross_revenue: boolean;
  is_demo: boolean;
  result_number: number | null;
  campaign_media: MediaRow[] | null;
}

function mapCampaign(row: CampaignRow): RaffleCampaign {
  const media: CampaignMedia[] = (row.campaign_media ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((m) => ({ kind: m.kind, url: m.url, alt: m.alt_text }));

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    prizeTitle: row.prize_title,
    prizeDescription: row.prize_description,
    prizeModel: row.prize_model,
    prizeYear: row.prize_year,
    prizeColor: row.prize_color,
    prizeCondition: row.prize_condition,
    prizeDetails: row.prize_details,
    totalNumbers: row.total_numbers,
    priceCents: row.price_cents,
    numberPadding: row.number_padding,
    minPerOrder: row.min_per_order,
    maxPerOrder: row.max_per_order,
    randomQuickPicks: row.random_quick_picks,
    status: row.status,
    salesOpenAt: row.sales_open_at,
    salesCloseAt: row.sales_close_at,
    drawAt: row.draw_at,
    locationLabel: row.location_label,
    eventLabel: row.event_label,
    eventDescription: row.event_description,
    eventAddress: row.event_address,
    eventMapUrl: row.event_map_url,
    highlightImageUrl: row.highlight_image_url,
    regulationUrl: row.regulation_url,
    certificateUrl: row.certificate_url,
    privacyPolicyUrl: row.privacy_policy_url,
    termsUrl: row.terms_url,
    supportChannel: row.support_channel,
    drawMethod: row.draw_method,
    showGrossRevenue: row.show_gross_revenue,
    isDemo: row.is_demo,
    resultNumber: row.result_number,
    media,
  };
}

/** Uma campanha visível (não-draft) pelo slug, com sua mídia. */
export async function getRaffleCampaign(slug: string): Promise<RaffleCampaign | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("raffle_campaigns")
      .select("*, campaign_media(kind,url,alt_text,sort_order)")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) return null;
    return mapCampaign(data as unknown as CampaignRow);
  } catch (e) {
    // Config ausente (env) ou Supabase indisponível — degrada sem 500.
    console.error("[raffle] getRaffleCampaign falhou:", e);
    return null;
  }
}

/** Lista das campanhas visíveis (índice). */
export async function listRaffleCampaigns(): Promise<RaffleCampaign[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("raffle_campaigns")
      .select("*, campaign_media(kind,url,alt_text,sort_order)")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return (data as unknown as CampaignRow[]).map(mapCampaign);
  } catch (e) {
    console.error("[raffle] listRaffleCampaigns falhou:", e);
    return [];
  }
}

/**
 * Payload compacto da grade: só os números NÃO-disponíveis + counts.
 * O cliente trata "ausente da lista = disponível".
 */
export async function getCampaignGrid(
  campaignId: string,
  total: number,
): Promise<GridData> {
  const counts = emptyCounts();
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("campaign_numbers")
      .select("number,status")
      .eq("campaign_id", campaignId)
      .neq("status", "available")
      .order("number")
      .limit(total); // M1: taken é pequeno. M2 troca por RPC agregada se necessário.

    const rows = (data ?? []) as { number: number; status: NumberStatus }[];
    const taken: TakenNumber[] = rows.map((r) => ({ number: r.number, status: r.status }));

    for (const t of taken) counts[t.status] += 1;
    counts.available = Math.max(0, total - taken.length);

    return { total, counts, taken };
  } catch (e) {
    console.error("[raffle] getCampaignGrid falhou:", e);
    counts.available = total;
    return { total, counts, taken: [] };
  }
}
