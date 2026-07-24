/** Leituras do painel admin (server-only). Usa a sessão autenticada (RLS admin). */
import "server-only";
import { createClient } from "@/lib/supabase/server";

async function countNumbers(campaignId: string, status: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("campaign_numbers")
    .select("*", { count: "exact", head: true })
    .eq("campaign_id", campaignId)
    .eq("status", status);
  return count ?? 0;
}

async function countOrders(status: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", status);
  return count ?? 0;
}

export interface AdminDashboard {
  campaign: { id: string; title: string; slug: string; totalNumbers: number; priceCents: number } | null;
  numbers: { available: number; reserved: number; pending: number; confirmed: number; blocked: number };
  orders: { paid: number; awaiting: number; expired: number };
  grossCents: number;
  filledPct: number;
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const supabase = await createClient();
  const { data: c } = await supabase
    .from("raffle_campaigns")
    .select("id,title,slug,total_numbers,price_cents")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!c) {
    return {
      campaign: null,
      numbers: { available: 0, reserved: 0, pending: 0, confirmed: 0, blocked: 0 },
      orders: { paid: 0, awaiting: 0, expired: 0 },
      grossCents: 0,
      filledPct: 0,
    };
  }

  const [available, reserved, pending, confirmed, blocked, paid, awaiting, expired] =
    await Promise.all([
      countNumbers(c.id, "available"),
      countNumbers(c.id, "reserved"),
      countNumbers(c.id, "pending"),
      countNumbers(c.id, "confirmed"),
      countNumbers(c.id, "blocked"),
      countOrders("paid"),
      countOrders("awaiting_payment"),
      countOrders("expired"),
    ]);

  const { data: paidOrders } = await supabase
    .from("orders")
    .select("total_cents")
    .eq("status", "paid");
  const grossCents = (paidOrders ?? []).reduce(
    (s, o) => s + ((o as { total_cents: number }).total_cents ?? 0),
    0,
  );

  const taken = c.total_numbers - available;
  const filledPct = c.total_numbers > 0 ? (taken / c.total_numbers) * 100 : 0;

  return {
    campaign: { id: c.id, title: c.title, slug: c.slug, totalNumbers: c.total_numbers, priceCents: c.price_cents },
    numbers: { available, reserved, pending, confirmed, blocked },
    orders: { paid, awaiting, expired },
    grossCents,
    filledPct,
  };
}

export interface AdminPack {
  id: string;
  title: string;
  numberQuantity: number;
  originalPriceCents: number;
  promotionalPriceCents: number;
  active: boolean;
  displayOrder: number;
}

export async function getAdminPacks(campaignId: string): Promise<AdminPack[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("campaign_packs")
    .select("id,title,number_quantity,original_price_cents,promotional_price_cents,active,display_order")
    .eq("campaign_id", campaignId)
    .order("display_order");
  return ((data ?? []) as Array<{
    id: string; title: string; number_quantity: number; original_price_cents: number;
    promotional_price_cents: number; active: boolean; display_order: number;
  }>).map((p) => ({
    id: p.id,
    title: p.title,
    numberQuantity: p.number_quantity,
    originalPriceCents: p.original_price_cents,
    promotionalPriceCents: p.promotional_price_cents,
    active: p.active,
    displayOrder: p.display_order,
  }));
}

export interface AdminOrder {
  id: string;
  code: string | null;
  customerName: string | null;
  totalCents: number;
  status: string;
  paymentStatus: string;
  sourceFlow: string;
  createdAt: string;
  items: { itemType: string; quantity: number; subtotalCents: number }[];
}

export async function getAdminOrders(limit = 50): Promise<AdminOrder[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("id,public_code,total_cents,status,payment_status,source_flow,created_at,customers(full_name),order_items(item_type,quantity,subtotal_cents)")
    .order("created_at", { ascending: false })
    .limit(limit);

  return ((data ?? []) as unknown as Array<{
    id: string; public_code: string | null; total_cents: number; status: string;
    payment_status: string; source_flow: string; created_at: string;
    customers: { full_name: string } | null;
    order_items: { item_type: string; quantity: number; subtotal_cents: number }[] | null;
  }>).map((o) => ({
    id: o.id,
    code: o.public_code,
    customerName: o.customers?.full_name ?? null,
    totalCents: o.total_cents,
    status: o.status,
    paymentStatus: o.payment_status,
    sourceFlow: o.source_flow,
    createdAt: o.created_at,
    items: (o.order_items ?? []).map((i) => ({ itemType: i.item_type, quantity: i.quantity, subtotalCents: i.subtotal_cents })),
  }));
}
