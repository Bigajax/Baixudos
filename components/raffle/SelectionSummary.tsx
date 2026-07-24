"use client";

import { formatPrice } from "@/lib/format";
import { padNumber } from "@/lib/raffle/types";

interface SummaryProps {
  planKind: "free" | "pack" | null;
  packQuantity?: number;
  subtotalCents: number;
  selectedNumbers: number[];
  padding: number;
  complete: boolean;
  onClear: () => void;
  onContinue: () => void;
  onRemove?: (n: number) => void;
}

export default function SelectionSummary({
  planKind,
  packQuantity,
  subtotalCents,
  selectedNumbers,
  padding,
  complete,
  onClear,
  onContinue,
  onRemove,
}: SummaryProps) {
  // Nada escolhido ainda → não mostra a barra (o seletor é o CTA).
  if (!planKind && selectedNumbers.length === 0) return null;

  const qty = planKind === "pack" ? (packQuantity ?? 0) : selectedNumbers.length;

  const ctaLabel = !complete
    ? planKind === "pack"
      ? `Selecione ${packQuantity} números`
      : "Selecione seus números"
    : planKind === "pack"
      ? `Continuar com o pack de ${packQuantity} — ${formatPrice(subtotalCents)}`
      : `Continuar com ${qty} ${qty === 1 ? "número" : "números"} — ${formatPrice(subtotalCents)}`;

  return (
    <div className="fixed inset-x-0 bottom-[84px] z-40 border-t border-line bg-night/95 backdrop-blur lg:bottom-0">
      <div className="mx-auto max-w-[1360px] px-4 py-3 sm:px-6">
        {selectedNumbers.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-2">
            {selectedNumbers.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onRemove?.(n)}
                disabled={!onRemove}
                className="group flex shrink-0 items-center gap-1 border border-signal/60 bg-signal/10 px-2 py-1 font-mono text-xs text-white disabled:cursor-default"
                aria-label={onRemove ? `Remover número ${padNumber(n, padding)}` : `Número ${padNumber(n, padding)}`}
              >
                {padNumber(n, padding)}
                {onRemove && (
                  <span aria-hidden="true" className="text-signal group-hover:text-white">
                    ×
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div aria-live="polite" className="flex items-baseline gap-3">
            <span className="font-mono text-lg font-semibold text-white tabular-nums">{qty}</span>
            <span className="text-xs uppercase tracking-[0.12em] text-smoke">
              {qty === 1 ? "número" : "números"} ·{" "}
              <span className="font-mono text-white">{formatPrice(subtotalCents)}</span>
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
              onClick={onContinue}
              disabled={!complete}
              className="bg-signal px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark disabled:cursor-not-allowed disabled:bg-signal/40 disabled:text-white/70"
              style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
            >
              {ctaLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
