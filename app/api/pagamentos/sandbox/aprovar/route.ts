import { NextResponse } from "next/server";
import { paymentProviderName } from "@/lib/payments";
import { confirmOrderByPayment } from "@/lib/checkout/orders";

/**
 * Simula a aprovação do Pix no SANDBOX (equivale ao banco confirmar o
 * pagamento). Roda a MESMA confirmação transacional/idempotente do webhook.
 * Só funciona quando o provedor é o sandbox — bloqueado com Mercado Pago real.
 */
export async function POST(req: Request) {
  if (paymentProviderName !== "sandbox") {
    return NextResponse.json({ error: "Indisponível." }, { status: 403 });
  }

  let body: { providerPaymentId?: string } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  if (!body.providerPaymentId) {
    return NextResponse.json({ error: "providerPaymentId obrigatório." }, { status: 400 });
  }

  try {
    const orderCode = await confirmOrderByPayment(body.providerPaymentId);
    return NextResponse.json({ orderCode, status: "approved" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Falha ao confirmar.";
    return NextResponse.json({ error: msg }, { status: 409 });
  }
}
