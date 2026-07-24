import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import { confirmOrderByPayment } from "@/lib/checkout/orders";

/**
 * Webhook de pagamento (Mercado Pago). Idempotente: a confirmação é feita
 * pela RPC confirm_order, que só confirma uma vez. A verificação de verdade
 * é consultar o status no provedor (não confia no payload).
 *
 * ⚠️ Produção com Mercado Pago: validar a assinatura x-signature (HMAC com
 * MERCADOPAGO_WEBHOOK_SECRET) antes de processar. Deixado explícito aqui.
 */
export async function POST(req: Request) {
  let body: { data?: { id?: string | number }; type?: string } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const url = new URL(req.url);
  const paymentId =
    body?.data?.id != null ? String(body.data.id) : url.searchParams.get("id");

  if (!paymentId) {
    return NextResponse.json({ received: true });
  }

  // Fonte da verdade: consulta o status no provedor.
  const provider = getPaymentProvider();
  const status = await provider.getStatus(paymentId);

  if (status === "approved") {
    try {
      await confirmOrderByPayment(paymentId);
    } catch (e) {
      console.error("[webhook] confirmação falhou:", e);
    }
  }

  return NextResponse.json({ received: true });
}
