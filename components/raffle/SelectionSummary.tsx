"use client";

import { useEffect, useState } from "react";
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

function TicketIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-signal" aria-hidden="true">
      <path
        d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 1 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 1 0 0-4V8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M14 6v12" stroke="currentColor" strokeWidth="1.7" strokeDasharray="2.5 2.5" />
    </svg>
  );
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
  const [open, setOpen] = useState(false);
  const active = selectedNumbers.length > 0 || planKind === "pack";

  // Sinaliza "checkout ativo" para o app esconder a pill de navegação e o FAB
  // no mobile enquanto a barra de continuar está no rodapé.
  useEffect(() => {
    if (!active) return;
    document.documentElement.dataset.checkout = "1";
    return () => {
      delete document.documentElement.dataset.checkout;
    };
  }, [active]);

  if (!active) return null;

  const qty = planKind === "pack" ? (packQuantity ?? 0) : selectedNumbers.length;
  const ctaLabel = complete
    ? "Continuar"
    : planKind === "pack"
      ? `Faltam ${(packQuantity ?? 0) - selectedNumbers.length}`
      : "Selecione";

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-night/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="mx-auto max-w-[1360px] px-4 py-3 sm:px-6">
        {open && selectedNumbers.length > 0 && (
          <div className="mb-2.5 flex gap-1.5 overflow-x-auto pb-1">
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
                {onRemove && <span aria-hidden="true" className="text-signal group-hover:text-white">×</span>}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-stretch gap-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex min-w-0 flex-1 items-center gap-3 border border-line bg-panel px-4 py-2.5 text-left sm:flex-none sm:min-w-[220px]"
            aria-expanded={open}
          >
            <TicketIcon />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-white">
                {qty} {qty === 1 ? "número" : "números"}
              </span>
              <span className="block font-mono text-[15px] font-semibold text-signal">
                {formatPrice(subtotalCents)}
              </span>
            </span>
            {selectedNumbers.length > 0 && (
              <svg viewBox="0 0 24 24" className={`ml-auto h-4 w-4 shrink-0 text-smoke transition-transform ${open ? "rotate-180" : ""}`} fill="none" aria-hidden="true">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={onContinue}
            disabled={!complete}
            className="flex flex-1 items-center justify-center gap-2 bg-signal px-6 text-sm font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-signal-dark disabled:cursor-not-allowed disabled:bg-signal/40 disabled:text-white/70"
            style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
          >
            {ctaLabel}
            {complete && <span aria-hidden="true" className="text-base">→</span>}
          </button>
        </div>

        <div className="mt-1.5 flex items-center justify-between text-[11px] text-smoke/70">
          <span className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" aria-hidden="true">
              <path d="M6 10V8a6 6 0 0 1 12 0v2M5 10h14v9H5v-9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            Pagamento seguro · Pix
          </span>
          {selectedNumbers.length > 0 && (
            <button type="button" onClick={onClear} className="uppercase tracking-[0.1em] transition-colors hover:text-signal">
              Limpar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
