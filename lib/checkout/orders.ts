/**
 * Criação e confirmação de pedidos (server-only). Preço é recalculado aqui
 * (buildQuote). Reservas de números e ingressos são atômicas (RPCs); em caso
 * de falha, o pedido é liberado (compensação). Confirmação é idempotente.
 */
import "server-only";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider, paymentProviderName } from "@/lib/payments";
import type { PixCharge } from "@/lib/payments/types";
import { buildQuote } from "./pricing";
import type { CreateOrderInput, CreateOrderResult } from "./types";

function genOrderCode(): string {
  return "BX-" + randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
}

class OrderError extends Error {}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const { campaign, ticket, customer, consents } = input;

  if (!campaign && !ticket) throw new OrderError("Pedido vazio.");
  if (!consents.regulation || !consents.terms || !consents.privacy) {
    throw new OrderError("É necessário aceitar o regulamento, os termos e a política.");
  }

  const sb = createAdminClient();

  // 1) Preço autoritativo
  const quote = await buildQuote({ campaign, ticket });

  // 2) TTL da reserva (da campanha, quando houver) + trava de vendas abertas
  let ttlMinutes = 15;
  let regulationVersion: string | null = null;
  if (campaign) {
    const { data: c } = await sb
      .from("raffle_campaigns")
      .select("reservation_ttl_minutes,regulation_version,status")
      .eq("id", campaign.campaignId)
      .maybeSingle();
    if (!c) throw new OrderError("Campanha inválida.");
    if (c.status !== "published") throw new OrderError("As vendas desta campanha estão encerradas.");
    if (c.reservation_ttl_minutes) ttlMinutes = c.reservation_ttl_minutes as number;
    regulationVersion = (c.regulation_version as string) ?? null;
  }
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000).toISOString();

  // 3) Cliente (upsert por CPF)
  const cpf = customer.cpf.replace(/\D/g, "");
  let customerId: string | null = null;
  {
    const { data: existing } = await sb
      .from("customers")
      .select("id")
      .eq("cpf", cpf)
      .maybeSingle();
    if (existing) {
      customerId = existing.id as string;
      await sb
        .from("customers")
        .update({
          full_name: customer.fullName,
          phone: customer.phone.replace(/\D/g, ""),
          email: customer.email,
          birth_date: customer.birthDate || null,
        })
        .eq("id", customerId);
    } else {
      const { data: created, error } = await sb
        .from("customers")
        .insert({
          full_name: customer.fullName,
          cpf,
          phone: customer.phone.replace(/\D/g, ""),
          email: customer.email,
          birth_date: customer.birthDate || null,
        })
        .select("id")
        .single();
      if (error || !created) throw new OrderError("Falha ao registrar cliente.");
      customerId = created.id as string;
    }
  }

  // 4) Pedido
  const orderCode = genOrderCode();
  const { data: order, error: orderErr } = await sb
    .from("orders")
    .insert({
      public_code: orderCode,
      customer_id: customerId,
      source_flow: input.sourceFlow,
      subtotal_cents: quote.subtotalCents,
      discount_total_cents: quote.discountTotalCents,
      fee_total_cents: quote.feeTotalCents,
      total_cents: quote.totalCents,
      status: "awaiting_payment",
      payment_status: "pending",
      expires_at: expiresAt,
    })
    .select("id")
    .single();
  if (orderErr || !order) throw new OrderError("Falha ao criar pedido.");
  const orderId = order.id as string;

  const fail = async (msg: string): Promise<never> => {
    await sb.rpc("release_order", { p_order: orderId, p_status: "cancelled" });
    throw new OrderError(msg);
  };

  // 5) Itens
  const itemsPayload = quote.lines.map((l) => ({
    order_id: orderId,
    item_type: l.itemType,
    campaign_id: l.campaignId ?? null,
    campaign_pack_id: l.campaignPackId ?? null,
    ticket_type_id: l.ticketTypeId ?? null,
    offer_id: l.offerId ?? null,
    quantity: l.quantity,
    original_unit_price_cents: l.originalUnitCents,
    final_unit_price_cents: l.finalUnitCents,
    discount_cents: l.discountCents,
    subtotal_cents: l.subtotalCents,
  }));
  const { data: items, error: itemsErr } = await sb
    .from("order_items")
    .insert(itemsPayload)
    .select("id,item_type");
  if (itemsErr || !items) await fail("Falha ao registrar itens.");
  const campaignItem = items!.find(
    (i) => i.item_type === "campaign_individual" || i.item_type === "campaign_pack",
  );

  // 6) Reserva
  const { data: reservation, error: resErr } = await sb
    .from("reservations")
    .insert({ order_id: orderId, status: "active", expires_at: expiresAt })
    .select("id")
    .single();
  if (resErr || !reservation) await fail("Falha ao criar reserva.");
  const reservationId = reservation!.id as string;

  // 7) Reserva atômica dos números
  if (campaign && campaign.numbers.length > 0) {
    const { error } = await sb.rpc("reserve_numbers", {
      p_campaign: campaign.campaignId,
      p_numbers: campaign.numbers,
      p_reservation: reservationId,
      p_order_item: campaignItem?.id ?? null,
    });
    if (error) await fail("Alguns números não estão mais disponíveis. Escolha novamente.");
  }

  // 8) Reserva atômica dos ingressos
  if (ticket && ticket.quantity > 0) {
    const { data: ok, error } = await sb.rpc("reserve_ticket", {
      p_ticket: ticket.ticketTypeId,
      p_qty: ticket.quantity,
    });
    if (error || ok !== true) await fail("Ingressos esgotados para a quantidade pedida.");
  }

  // 9) Consentimentos versionados
  const consentRows = [
    { document_type: "regulation", document_version: regulationVersion ?? "v1" },
    { document_type: "terms", document_version: "v1" },
    { document_type: "privacy", document_version: "v1" },
    ...(consents.marketing ? [{ document_type: "marketing", document_version: "v1" }] : []),
  ].map((c) => ({ ...c, customer_id: customerId, order_id: orderId }));
  await sb.from("consents").insert(consentRows);

  // 10) Cobrança Pix
  const provider = getPaymentProvider();
  let charge: PixCharge | undefined;
  try {
    charge = await provider.createPixCharge({
      amountCents: quote.totalCents,
      orderCode,
      description: `Baixudos.PR — pedido ${orderCode}`,
      ttlMinutes,
      payer: { name: customer.fullName, email: customer.email, cpf },
    });
  } catch {
    await fail("Falha ao gerar a cobrança Pix.");
  }

  await sb.from("payments").insert({
    order_id: orderId,
    provider: paymentProviderName,
    provider_payment_id: charge!.providerPaymentId,
    method: "pix",
    status: "pending",
    amount_cents: quote.totalCents,
    qr_code: charge!.pixCopyPaste,
    pix_copy_paste: charge!.pixCopyPaste,
    ticket_url: charge!.ticketUrl,
    expires_at: charge!.expiresAt,
  });

  return {
    orderCode,
    totalCents: quote.totalCents,
    providerPaymentId: charge!.providerPaymentId,
    pixCopyPaste: charge!.pixCopyPaste,
    qrCodeBase64: charge!.qrCodeBase64,
    expiresAt: charge!.expiresAt,
  };
}

/** Confirmação idempotente (webhook / simulação sandbox). */
export async function confirmOrderByPayment(providerPaymentId: string): Promise<string> {
  const sb = createAdminClient();
  const { data, error } = await sb.rpc("confirm_order", {
    p_provider_payment_id: providerPaymentId,
  });
  if (error) throw new OrderError(error.message);
  return data as string;
}
