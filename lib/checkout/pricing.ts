/**
 * Motor de preço AUTORITATIVO (server-only). Lê preços de packs, campanha,
 * ingressos e ofertas direto do banco e monta o orçamento. O front nunca
 * envia valores — só ids/quantidades/números. Todo total é recalculado aqui.
 */
import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { QuoteInput, Quote, QuoteLine } from "./types";

type SB = ReturnType<typeof createAdminClient>;

async function campaignBasePrice(sb: SB, campaignId: string): Promise<number> {
  const { data, error } = await sb
    .from("raffle_campaigns")
    .select("price_cents,status")
    .eq("id", campaignId)
    .maybeSingle();
  if (error || !data) throw new Error("Campanha inválida.");
  if (data.status === "draft") throw new Error("Campanha indisponível.");
  return data.price_cents as number;
}

function clampQuantity(qty: number, max: number | null | undefined): number {
  const q = Math.max(1, Math.floor(qty));
  return max && max > 0 ? Math.min(q, max) : q;
}

/**
 * Calcula o orçamento a partir das intenções (ids/quantidades).
 * Lança em qualquer inconsistência — nada de preço vindo do cliente.
 */
export async function buildQuote(input: QuoteInput): Promise<Quote> {
  const sb = createAdminClient();
  const lines: QuoteLine[] = [];

  // ---- Ingresso ----
  if (input.ticket && input.ticket.quantity > 0) {
    const { data: tt, error } = await sb
      .from("ticket_types")
      .select("id,title,lot_name,price_cents,max_per_customer,status")
      .eq("id", input.ticket.ticketTypeId)
      .maybeSingle();
    if (error || !tt) throw new Error("Ingresso inválido.");
    if (tt.status !== "active") throw new Error("Ingresso não está à venda.");

    const qty = clampQuantity(input.ticket.quantity, tt.max_per_customer);
    lines.push({
      itemType: "event_ticket",
      label: tt.lot_name ? `${tt.title} — ${tt.lot_name}` : tt.title,
      quantity: qty,
      originalUnitCents: tt.price_cents,
      finalUnitCents: tt.price_cents,
      discountCents: 0,
      subtotalCents: qty * tt.price_cents,
      ticketTypeId: tt.id,
      offerId: input.ticket.offerId ?? undefined,
    });
  }

  // ---- Campanha ----
  if (input.campaign) {
    const c = input.campaign;

    if (c.packId) {
      const { data: pack, error } = await sb
        .from("campaign_packs")
        .select("id,title,number_quantity,original_price_cents,promotional_price_cents,active,campaign_id")
        .eq("id", c.packId)
        .maybeSingle();
      if (error || !pack || !pack.active) throw new Error("Pack inválido.");
      if (pack.campaign_id !== c.campaignId) throw new Error("Pack não pertence à campanha.");

      const original = pack.original_price_cents as number;
      const final = pack.promotional_price_cents as number;
      lines.push({
        itemType: "campaign_pack",
        label: pack.title,
        quantity: pack.number_quantity,
        originalUnitCents: Math.round(original / pack.number_quantity),
        finalUnitCents: Math.round(final / pack.number_quantity),
        discountCents: original - final,
        subtotalCents: final,
        campaignId: c.campaignId,
        campaignPackId: pack.id,
        numbers: c.numbers,
        offerId: c.offerId ?? undefined,
      });
    } else {
      const count = c.numbers?.length ?? c.count ?? 0;
      if (count > 0) {
        const base = await campaignBasePrice(sb, c.campaignId);
        let unit = base;

        // Oferta promocional por número (ex.: combo com ingresso)
        if (c.offerId) {
          const { data: offer } = await sb
            .from("offers")
            .select("id,promotional_number_price_cents,active")
            .eq("id", c.offerId)
            .maybeSingle();
          if (offer?.active && offer.promotional_number_price_cents != null) {
            unit = offer.promotional_number_price_cents as number;
          }
        }

        lines.push({
          itemType: "campaign_individual",
          label: "Números da sorte",
          quantity: count,
          originalUnitCents: base,
          finalUnitCents: unit,
          discountCents: (base - unit) * count,
          subtotalCents: unit * count,
          campaignId: c.campaignId,
          numbers: c.numbers,
          offerId: c.offerId ?? undefined,
        });
      }
    }
  }

  if (lines.length === 0) throw new Error("Pedido vazio.");

  const subtotalCents = lines.reduce((s, l) => s + l.originalUnitCents * l.quantity, 0);
  const discountTotalCents = lines.reduce((s, l) => s + l.discountCents, 0);
  const feeTotalCents = 0; // Pix sem taxa ao comprador
  const totalCents = lines.reduce((s, l) => s + l.subtotalCents, 0) + feeTotalCents;

  return { lines, subtotalCents, discountTotalCents, feeTotalCents, totalCents };
}
