"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import { QtyStepper } from "./checkout-shared";
import TicketCheckoutModal from "./TicketCheckoutModal";
import type { EventTicket, EventNumberOffer } from "@/lib/checkout/queries";

export default function EventTicketPurchase({
  tickets,
  event,
  numberOffer,
  sandbox,
}: {
  tickets: EventTicket[];
  event: { title: string | null; location: string | null };
  numberOffer: EventNumberOffer | null;
  sandbox: boolean;
}) {
  const [qtys, setQtys] = useState<Record<string, number>>(() =>
    Object.fromEntries(tickets.map((t, i) => [t.id, i === 0 ? 1 : 0])),
  );
  const [open, setOpen] = useState(false);

  // M4: um tipo de ingresso por pedido — usa o primeiro com quantidade > 0.
  const active = tickets.find((t) => (qtys[t.id] ?? 0) > 0) ?? null;
  const activeQty = active ? qtys[active.id] : 0;

  return (
    <div className="space-y-3">
      {tickets.map((t) => {
        const max = Math.min(t.available, t.maxPerCustomer);
        return (
          <div key={t.id} className="flex items-center justify-between gap-3 border border-line bg-night p-4">
            <div>
              <p className="text-sm font-semibold text-white">{t.title}</p>
              <p className="text-xs text-smoke">
                {t.lotName ? `${t.lotName} · ` : ""}
                {formatPrice(t.priceCents)}
                {t.available <= 20 && t.available > 0 ? ` · ${t.available} restantes` : ""}
              </p>
            </div>
            {t.available > 0 ? (
              <QtyStepper value={qtys[t.id] ?? 0} min={0} max={max} onChange={(v) => setQtys((q) => ({ ...q, [t.id]: v }))} />
            ) : (
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-smoke/60">Esgotado</span>
            )}
          </div>
        );
      })}

      <button
        type="button"
        disabled={!active}
        onClick={() => setOpen(true)}
        className="block w-full bg-signal py-4 text-center text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark disabled:cursor-not-allowed disabled:bg-signal/40 disabled:text-white/70"
      >
        {active ? `Garantir ingresso — ${formatPrice(activeQty * active.priceCents)}` : "Selecione um ingresso"}
      </button>

      {active && (
        <TicketCheckoutModal
          open={open}
          onClose={() => setOpen(false)}
          ticket={active}
          quantity={activeQty}
          event={event}
          campaignSlug={numberOffer?.campaignSlug ?? ""}
          numberOffer={numberOffer}
          sandbox={sandbox}
        />
      )}
    </div>
  );
}
