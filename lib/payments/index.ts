import "server-only";
import type { PaymentProvider } from "./types";
import { sandboxProvider } from "./sandbox";
import { createMercadoPagoProvider } from "./mercadopago";

/**
 * Escolhe o provedor: Mercado Pago se houver MERCADOPAGO_ACCESS_TOKEN,
 * senão o sandbox (testável de ponta a ponta). Trocar de um para o outro
 * é só definir/remover a env — nenhuma outra mudança de código.
 */
export function getPaymentProvider(): PaymentProvider {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (token) return createMercadoPagoProvider(token);
  return sandboxProvider;
}

export const paymentProviderName = process.env.MERCADOPAGO_ACCESS_TOKEN
  ? "mercadopago"
  : "sandbox";
