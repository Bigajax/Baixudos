"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { BxEvent } from "@/content/events";
import { formatPrice } from "@/content/events";
import { waLink } from "@/lib/wa";

/**
 * Checkout de ingressos na própria página.
 *
 * O pedido é montado aqui (lote, quantidade, comprador) e finalizado
 * pelo WhatsApp da organização. Quando houver conta em um gateway de
 * pagamento (ex.: Mercado Pago), basta definir `ticketUrl` no evento
 * ou trocar o `onSubmit` para criar a preferência de pagamento.
 */

const schema = z.object({
  name: z.string().min(3, "Informe seu nome completo"),
  whatsapp: z.string().min(10, "Informe um WhatsApp válido com DDD"),
  email: z.string().email("Informe um e-mail válido"),
});

type FormData = z.infer<typeof schema>;

const MAX_QTY = 10;

export default function TicketCheckout({ event }: { event: BxEvent }) {
  const buyable = event.batches.filter((b) => b.available && b.priceCents !== null);
  const upcoming = event.batches.filter((b) => !b.available || b.priceCents === null);
  const [qty, setQty] = useState<Record<string, number>>(
    Object.fromEntries(buyable.map((b, i) => [b.name, i === 0 ? 1 : 0])),
  );
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const totalQty = Object.values(qty).reduce((a, b) => a + b, 0);
  const totalCents = buyable.reduce((sum, b) => sum + (b.priceCents ?? 0) * (qty[b.name] ?? 0), 0);
  const hasDemoPrice = buyable.some((b) => b.demoPrice && (qty[b.name] ?? 0) > 0);

  const step = (name: string, delta: number) => {
    setQty((q) => ({ ...q, [name]: Math.min(MAX_QTY, Math.max(0, (q[name] ?? 0) + delta)) }));
  };

  const onSubmit = (data: FormData) => {
    const items = buyable
      .filter((b) => (qty[b.name] ?? 0) > 0)
      .map((b) => `• ${qty[b.name]}x ${b.name} — ${formatPrice((b.priceCents ?? 0) * qty[b.name])}`);

    const message = [
      `🎟️ PEDIDO DE INGRESSO — ${event.name}`,
      `${event.dateLabel} · ${event.venue}`,
      "",
      ...items,
      `Total: ${formatPrice(totalCents)}`,
      "",
      `Nome: ${data.name}`,
      `WhatsApp: ${data.whatsapp}`,
      `E-mail: ${data.email}`,
      "",
      "Aguardo as instruções de pagamento!",
    ].join("\n");

    window.open(waLink(message), "_blank", "noopener,noreferrer");
    setSent(true);
  };

  if (buyable.length === 0) {
    return (
      <div id="ingressos">
        <p className="border border-line bg-night p-4 text-sm text-smoke">
          Os ingressos desta edição ainda não estão à venda. Entre na lista de avisos para ser
          avisado da abertura do 1º lote.
        </p>
      </div>
    );
  }

  if (sent) {
    return (
      <div id="ingressos" className="border border-signal/40 bg-signal/10 p-5">
        <h3 className="display text-lg text-white">Pedido encaminhado!</h3>
        <p className="mt-2 text-sm leading-relaxed text-smoke">
          Finalize na janela do WhatsApp que acabou de abrir — a organização confirma o pedido e
          envia as instruções de pagamento por lá.
        </p>
      </div>
    );
  }

  return (
    <form id="ingressos" onSubmit={handleSubmit(onSubmit)} noValidate>
      <h3 className="text-[11px] uppercase tracking-[0.2em] text-smoke">Ingressos</h3>

      <ul className="mt-2 divide-y divide-line border-y border-line">
        {buyable.map((b) => (
          <li key={b.name} className="flex items-center justify-between gap-3 py-3">
            <div>
              <p className="text-sm font-semibold text-white">{b.name}</p>
              <p className="text-sm text-signal">
                {formatPrice(b.priceCents!)}
                {b.demoPrice && (
                  <span className="ml-2 align-middle text-[9px] uppercase tracking-wider text-smoke/70">
                    valor de demonstração
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center border border-line">
              <button
                type="button"
                onClick={() => step(b.name, -1)}
                aria-label={`Remover um ingresso do ${b.name}`}
                className="flex h-10 w-10 items-center justify-center text-lg text-smoke transition-colors hover:bg-graphite hover:text-white"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-bold text-white tabular-nums" aria-live="polite">
                {qty[b.name] ?? 0}
              </span>
              <button
                type="button"
                onClick={() => step(b.name, 1)}
                aria-label={`Adicionar um ingresso do ${b.name}`}
                className="flex h-10 w-10 items-center justify-center text-lg text-smoke transition-colors hover:bg-graphite hover:text-white"
              >
                +
              </button>
            </div>
          </li>
        ))}
        {upcoming.map((b) => (
          <li key={b.name} className="flex items-center justify-between py-3 opacity-60">
            <p className="text-sm text-white">{b.name}</p>
            <p className="text-xs uppercase tracking-wider text-smoke">em breve</p>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.2em] text-smoke">Total</span>
        <span className="display text-2xl text-white tabular-nums">{formatPrice(totalCents)}</span>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor="tk-name" className="field-label">Nome completo</label>
          <input id="tk-name" type="text" className="field" autoComplete="name" {...register("name")} />
          {errors.name && <p className="field-error">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="tk-whats" className="field-label">WhatsApp</label>
          <input id="tk-whats" type="tel" className="field" placeholder="(44) 90000-0000" autoComplete="tel" {...register("whatsapp")} />
          {errors.whatsapp && <p className="field-error">{errors.whatsapp.message}</p>}
        </div>
        <div>
          <label htmlFor="tk-email" className="field-label">E-mail</label>
          <input id="tk-email" type="email" className="field" autoComplete="email" {...register("email")} />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={totalQty === 0}
        className="mt-4 w-full bg-signal py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {totalQty === 0 ? "Escolha a quantidade" : `Finalizar pedido · ${formatPrice(totalCents)}`}
      </button>

      <p className="mt-3 text-xs leading-relaxed text-smoke/70">
        O pedido é confirmado pelo WhatsApp oficial da organização, que envia as instruções de
        pagamento{hasDemoPrice ? ". O valor exibido é de demonstração até a divulgação oficial do lote" : ""}.
      </p>
    </form>
  );
}
