import "server-only";
import type { PaymentProvider, PixCharge, PixChargeInput, ProviderStatus } from "./types";

const API = "https://api.mercadopago.com/v1";

function mapStatus(s: string): ProviderStatus {
  switch (s) {
    case "approved":
      return "approved";
    case "rejected":
    case "cancelled":
      return "rejected";
    case "refunded":
    case "charged_back":
      return "rejected";
    default:
      return "pending";
  }
}

/**
 * Adapter Mercado Pago (Pix). Ativado quando MERCADOPAGO_ACCESS_TOKEN existe.
 * Enquanto não houver token, o factory (index.ts) usa o sandbox.
 */
export function createMercadoPagoProvider(token: string): PaymentProvider {
  return {
    name: "mercadopago",

    async createPixCharge(input: PixChargeInput): Promise<PixCharge> {
      const res = await fetch(`${API}/payments`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
          "X-Idempotency-Key": input.orderCode,
        },
        body: JSON.stringify({
          transaction_amount: input.amountCents / 100,
          description: input.description,
          payment_method_id: "pix",
          date_of_expiration: new Date(
            Date.now() + input.ttlMinutes * 60_000,
          ).toISOString(),
          payer: {
            email: input.payer?.email ?? "comprador@baixudospr.com.br",
            first_name: input.payer?.name,
            identification: input.payer?.cpf
              ? { type: "CPF", number: input.payer.cpf }
              : undefined,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Mercado Pago falhou (${res.status})`);
      }
      const data = await res.json();
      const tx = data.point_of_interaction?.transaction_data ?? {};
      return {
        providerPaymentId: String(data.id),
        pixCopyPaste: tx.qr_code ?? "",
        qrCodeBase64: tx.qr_code_base64 ?? null,
        ticketUrl: tx.ticket_url ?? null,
        expiresAt:
          data.date_of_expiration ??
          new Date(Date.now() + input.ttlMinutes * 60_000).toISOString(),
        status: "pending",
      };
    },

    async getStatus(providerPaymentId: string): Promise<ProviderStatus> {
      const res = await fetch(`${API}/payments/${providerPaymentId}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      if (!res.ok) return "pending";
      const data = await res.json();
      return mapStatus(data.status);
    },
  };
}
