"use client";

import { formatPrice } from "@/lib/format";
import { padNumber } from "@/lib/raffle/types";

interface SummaryProps {
  selected: number[]; // ordenado
  padding: number;
  priceCents: number;
  maxPerOrder: number;
  onRemove: (n: number) => void;
  onClear: () => void;
}

export default function SelectionSummary({
  selected,
  padding,
  priceCents,
  maxPerOrder,
  onRemove,
  onClear,
}: SummaryProps) {
  if (selected.length === 0) return null;

  const totalCents = selected.length * priceCents;
  const overLimit = selected.length > maxPerOrder;

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 border-t border-line bg-night/95 backdrop-blur lg:bottom-0">
      <div className="mx-auto max-w-[1360px] px-4 py-3 sm:px-6">
        {/* Chips dos números escolhidos */}
        <div className="flex gap-1.5 overflow-x-auto pb-2">
          {selected.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onRemove(n)}
              className="group flex shrink-0 items-center gap-1 border border-signal/60 bg-signal/10 px-2 py-1 font-mono text-xs text-white"
              aria-label={`Remover número ${padNumber(n, padding)}`}
            >
              {padNumber(n, padding)}
              <span aria-hidden="true" className="text-signal group-hover:text-white">
                ×
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div aria-live="polite" className="flex items-baseline gap-3">
            <span className="font-mono text-lg font-semibold text-white tabular-nums">
              {selected.length}
            </span>
            <span className="text-xs uppercase tracking-[0.12em] text-smoke">
              {selected.length === 1 ? "número" : "números"} ·{" "}
              <span className="font-mono text-white">{formatPrice(totalCents)}</span>
            </span>
            <span className="hidden text-[11px] text-smoke/60 sm:inline">
              ({formatPrice(priceCents)} cada · recalculado no servidor)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClear}
              className="text-xs font-semibold uppercase tracking-[0.1em] text-smoke transition-colors hover:text-signal"
            >
              Limpar
            </button>
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Reserva e pagamento via Pix — em breve"
              className="cursor-not-allowed bg-signal/40 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white/70"
              style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
            >
              Reservar — em breve
            </button>
          </div>
        </div>

        {overLimit && (
          <p className="mt-1.5 text-xs text-signal">
            Máximo de {maxPerOrder} números por pedido. Remova alguns para continuar.
          </p>
        )}
      </div>
    </div>
  );
}
