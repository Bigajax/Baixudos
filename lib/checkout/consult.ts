/**
 * Consulta de participação por código do pedido (server-only).
 * O código público é o token de acesso. Retorna dados MÍNIMOS —
 * nunca CPF/telefone/e-mail; o nome vem só com o primeiro nome.
 */
import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface OrderConsult {
  code: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  totalCents: number;
  firstName: string | null;
  campaign: {
    title: string;
    padding: number;
    drawAt: string | null;
    numbers: { number: number; status: string }[];
  } | null;
  ticket: {
    eventTitle: string | null;
    location: string | null;
    ticketTitle: string | null;
    quantity: number;
  } | null;
}

function firstName(full: string | null): string | null {
  if (!full) return null;
  return full.trim().split(/\s+/)[0] ?? null;
}

interface OrderRow {
  id: string;
  public_code: string;
  status: string;
  payment_status: string;
  created_at: string;
  total_cents: number;
  customers: { full_name: string } | null;
  order_items: {
    id: string;
    item_type: string;
    quantity: number;
    campaign_id: string | null;
    ticket_types: {
      title: string;
      events: { title: string | null; location: string | null } | null;
    } | null;
  }[];
}

export async function getOrderByCode(code: string): Promise<OrderConsult | null> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("orders")
    .select(
      "id,public_code,status,payment_status,created_at,total_cents,customers(full_name),order_items(id,item_type,quantity,campaign_id,ticket_types(title,events(title,location)))",
    )
    .eq("public_code", code.trim().toUpperCase())
    .maybeSingle();

  if (error || !data) return null;
  const order = data as unknown as OrderRow;

  const campaignItems = order.order_items.filter((i) => i.item_type !== "event_ticket");
  const ticketItem = order.order_items.find((i) => i.item_type === "event_ticket");

  // Números do pedido
  let campaign: OrderConsult["campaign"] = null;
  if (campaignItems.length > 0) {
    const itemIds = campaignItems.map((i) => i.id);
    const { data: nums } = await sb
      .from("campaign_numbers")
      .select("number,status")
      .in("order_item_id", itemIds)
      .order("number");

    const campaignId = campaignItems[0].campaign_id;
    let title = "Campanha";
    let padding = 4;
    let drawAt: string | null = null;
    if (campaignId) {
      const { data: c } = await sb
        .from("raffle_campaigns")
        .select("title,number_padding,draw_at")
        .eq("id", campaignId)
        .maybeSingle();
      if (c) {
        title = c.title as string;
        padding = c.number_padding as number;
        drawAt = (c.draw_at as string) ?? null;
      }
    }
    campaign = {
      title,
      padding,
      drawAt,
      numbers: ((nums ?? []) as { number: number; status: string }[]).map((n) => ({
        number: n.number,
        status: n.status,
      })),
    };
  }

  const ticket: OrderConsult["ticket"] = ticketItem
    ? {
        eventTitle: ticketItem.ticket_types?.events?.title ?? null,
        location: ticketItem.ticket_types?.events?.location ?? null,
        ticketTitle: ticketItem.ticket_types?.title ?? null,
        quantity: ticketItem.quantity,
      }
    : null;

  return {
    code: order.public_code,
    status: order.status,
    paymentStatus: order.payment_status,
    createdAt: order.created_at,
    totalCents: order.total_cents,
    firstName: firstName(order.customers?.full_name ?? null),
    campaign,
    ticket,
  };
}
