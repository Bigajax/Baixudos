/** Contrato de provedor de pagamento (desacoplado do gateway). */

export interface PixChargeInput {
  amountCents: number;
  orderCode: string;
  description: string;
  ttlMinutes: number;
  payer?: { name?: string; email?: string; cpf?: string };
}

export interface PixCharge {
  providerPaymentId: string;
  /** EMV "copia e cola". */
  pixCopyPaste: string;
  /** Imagem do QR em base64 (PNG), quando o provedor fornece. */
  qrCodeBase64: string | null;
  ticketUrl: string | null;
  expiresAt: string;
  status: "pending";
}

export type ProviderStatus = "pending" | "approved" | "rejected" | "expired" | "cancelled";

export interface PaymentProvider {
  readonly name: string;
  createPixCharge(input: PixChargeInput): Promise<PixCharge>;
  getStatus(providerPaymentId: string): Promise<ProviderStatus>;
}
