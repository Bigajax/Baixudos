import "server-only";
import { randomUUID } from "node:crypto";
import type { PaymentProvider, PixCharge, PixChargeInput, ProviderStatus } from "./types";

/**
 * Provedor SANDBOX — gera um Pix copia-e-cola fake e testável de ponta a
 * ponta. A "aprovação" é simulada pela rota /api/pagamentos/sandbox/aprovar,
 * que dispara a mesma confirmação transacional do webhook real.
 * Trocar por Mercado Pago é só definir MERCADOPAGO_ACCESS_TOKEN (ver index.ts).
 */
export const sandboxProvider: PaymentProvider = {
  name: "sandbox",

  async createPixCharge(input: PixChargeInput): Promise<PixCharge> {
    const id = `sbx_${randomUUID()}`;
    const amount = (input.amountCents / 100).toFixed(2);
    // EMV fictício (apenas aparência de "copia e cola"), único por pedido.
    const emv =
      `00020126580014BR.GOV.BCB.PIX0136${randomUUID()}` +
      `520400005303986540${amount.length}${amount}5802BR5913BAIXUDOS.PR6007MARINGA` +
      `62190515${input.orderCode}6304SBOX`;
    const expiresAt = new Date(Date.now() + input.ttlMinutes * 60_000).toISOString();
    return {
      providerPaymentId: id,
      pixCopyPaste: emv,
      qrCodeBase64: null, // sandbox não gera imagem; a UI mostra o copia-e-cola
      ticketUrl: null,
      expiresAt,
      status: "pending",
    };
  },

  async getStatus(): Promise<ProviderStatus> {
    // No sandbox a fonte da verdade é o nosso banco; a aprovação é disparada
    // pela rota de simulação. Sem consulta a gateway externo.
    return "pending";
  },
};
