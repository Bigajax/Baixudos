/** Leitura pública de catálogo do checkout (server-only). */
import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Pack } from "./types";

export interface TicketOffer {
  offerId: string;
  title: string;
  description: string | null;
  ctaLabel: string | null;
  event: { title: string | null; dateLabel: string | null; location: string | null };
  ticket: {
    id: string;
    title: string;
    lotName: string | null;
    priceCents: number;
    maxPerCustomer: number;
  };
}

interface PackRow {
  id: string;
  title: string;
  number_quantity: number;
  original_price_cents: number;
  promotional_price_cents: number;
}

/** Packs ativos de uma campanha, na ordem de exibição. */
export async function getCampaignPacks(campaignId: string): Promise<Pack[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("campaign_packs")
      .select("id,title,number_quantity,original_price_cents,promotional_price_cents")
      .eq("campaign_id", campaignId)
      .eq("active", true)
      .order("display_order");

    if (error || !data) return [];
    return (data as PackRow[]).map((p) => ({
      id: p.id,
      title: p.title,
      numberQuantity: p.number_quantity,
      originalPriceCents: p.original_price_cents,
      promotionalPriceCents: p.promotional_price_cents,
    }));
  } catch (e) {
    console.error("[checkout] getCampaignPacks falhou:", e);
    return [];
  }
}

export interface EventTicket {
  id: string;
  title: string;
  lotName: string | null;
  priceCents: number;
  maxPerCustomer: number;
  available: number;
}

export interface EventTickets {
  eventId: string;
  tickets: EventTicket[];
}

interface TicketRow {
  id: string;
  title: string;
  lot_name: string | null;
  price_cents: number;
  max_per_customer: number;
  available_quantity: number;
  sold_quantity: number;
  reserved_quantity: number;
}

/** Ingressos ativos de um evento (por slug). null = evento não está no banco. */
export async function getEventTickets(slug: string): Promise<EventTickets | null> {
  try {
    const supabase = await createClient();
    const { data: event } = await supabase
      .from("events")
      .select("id,status")
      .eq("slug", slug)
      .maybeSingle();
    if (!event || event.status === "draft") return null;

    const { data } = await supabase
      .from("ticket_types")
      .select("id,title,lot_name,price_cents,max_per_customer,available_quantity,sold_quantity,reserved_quantity")
      .eq("event_id", event.id)
      .eq("status", "active")
      .order("display_order");

    const tickets = ((data ?? []) as TicketRow[]).map((t) => ({
      id: t.id,
      title: t.title,
      lotName: t.lot_name,
      priceCents: t.price_cents,
      maxPerCustomer: t.max_per_customer,
      available: Math.max(0, t.available_quantity - t.sold_quantity - t.reserved_quantity),
    }));
    if (tickets.length === 0) return null;
    return { eventId: event.id as string, tickets };
  } catch (e) {
    console.error("[checkout] getEventTickets falhou:", e);
    return null;
  }
}

export interface EventNumberOffer {
  campaignId: string;
  campaignSlug: string;
  numberPadding: number;
  basePriceCents: number;
  imageUrl: string | null;
  prizeTitle: string;
  ratio: { offerId: string; title: string; description: string | null; ratio: number; promoPriceCents: number } | null;
  packs: { offerId: string; pack: Pack }[];
}

/** Oferta cruzada de números/packs para o checkout do ingresso. */
export async function getEventNumberOffer(eventId: string): Promise<EventNumberOffer | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("offers")
      .select("id,title,description,offer_type,ticket_number_ratio,promotional_number_price_cents,campaign_id,campaign_pack_id")
      .eq("event_id", eventId)
      .eq("active", true)
      .in("offer_type", ["ticket_number_ratio_offer", "campaign_pack_offer"]);
    if (!data || data.length === 0) return null;

    const ratioRow = data.find((o) => o.offer_type === "ticket_number_ratio_offer");
    const campaignId = (ratioRow?.campaign_id ?? data[0].campaign_id) as string | null;
    if (!campaignId) return null;

    const { data: c } = await supabase
      .from("raffle_campaigns")
      .select("slug,number_padding,price_cents,status,highlight_image_url,prize_title")
      .eq("id", campaignId)
      .maybeSingle();
    if (!c || c.status === "draft") return null;

    // packs das ofertas de pack
    const packOfferRows = data.filter((o) => o.offer_type === "campaign_pack_offer" && o.campaign_pack_id);
    const packs: { offerId: string; pack: Pack }[] = [];
    if (packOfferRows.length > 0) {
      const { data: packRows } = await supabase
        .from("campaign_packs")
        .select("id,title,number_quantity,original_price_cents,promotional_price_cents")
        .in("id", packOfferRows.map((o) => o.campaign_pack_id as string));
      for (const o of packOfferRows) {
        const p = (packRows ?? []).find((pr) => pr.id === o.campaign_pack_id);
        if (p) {
          packs.push({
            offerId: o.id as string,
            pack: {
              id: p.id,
              title: p.title,
              numberQuantity: p.number_quantity,
              originalPriceCents: p.original_price_cents,
              promotionalPriceCents: p.promotional_price_cents,
            },
          });
        }
      }
    }

    return {
      campaignId,
      campaignSlug: c.slug as string,
      numberPadding: c.number_padding as number,
      basePriceCents: c.price_cents as number,
      imageUrl: (c.highlight_image_url as string) ?? null,
      prizeTitle: (c.prize_title as string) ?? "Gol vermelho",
      ratio: ratioRow
        ? {
            offerId: ratioRow.id as string,
            title: ratioRow.title as string,
            description: ratioRow.description as string | null,
            ratio: (ratioRow.ticket_number_ratio as number) ?? 1,
            promoPriceCents: (ratioRow.promotional_number_price_cents as number) ?? c.price_cents,
          }
        : null,
      packs,
    };
  } catch (e) {
    console.error("[checkout] getEventNumberOffer falhou:", e);
    return null;
  }
}

interface OfferRow {
  id: string;
  title: string;
  description: string | null;
  cta_label: string | null;
  ticket_types: {
    id: string;
    title: string;
    lot_name: string | null;
    price_cents: number;
    max_per_customer: number;
    events: { title: string | null; event_date: string | null; location: string | null } | null;
  } | null;
}

/** Oferta de ingresso (addon) para o checkout da campanha. */
export async function getCampaignTicketOffer(campaignId: string): Promise<TicketOffer | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("offers")
      .select(
        "id,title,description,cta_label,ticket_types(id,title,lot_name,price_cents,max_per_customer,events(title,event_date,location))",
      )
      .eq("offer_type", "campaign_ticket_addon")
      .eq("campaign_id", campaignId)
      .eq("active", true)
      .order("display_order")
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    const row = data as unknown as OfferRow;
    if (!row.ticket_types) return null;
    const tt = row.ticket_types;

    return {
      offerId: row.id,
      title: row.title,
      description: row.description,
      ctaLabel: row.cta_label,
      event: {
        title: tt.events?.title ?? null,
        dateLabel: tt.events?.event_date ?? null,
        location: tt.events?.location ?? null,
      },
      ticket: {
        id: tt.id,
        title: tt.title,
        lotName: tt.lot_name,
        priceCents: tt.price_cents,
        maxPerCustomer: tt.max_per_customer,
      },
    };
  } catch (e) {
    console.error("[checkout] getCampaignTicketOffer falhou:", e);
    return null;
  }
}
