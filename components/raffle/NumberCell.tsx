"use client";

import { memo } from "react";
import { padNumber } from "@/lib/raffle/types";
import { CELL_CLASS, CELL_LABEL, isInteractive, type CellState } from "./status-meta";

interface NumberCellProps {
  number: number;
  padding: number;
  state: CellState;
  tabbable: boolean;
  hidden: boolean;
  highlight: boolean;
  onToggle: (n: number) => void;
  onFocusNumber: (n: number) => void;
}

function NumberCellBase({
  number,
  padding,
  state,
  tabbable,
  hidden,
  highlight,
  onToggle,
  onFocusNumber,
}: NumberCellProps) {
  const interactive = isInteractive(state);
  const padded = padNumber(number, padding);

  return (
    <button
      type="button"
      id={`cell-${number}`}
      hidden={hidden}
      tabIndex={tabbable && !hidden ? 0 : -1}
      aria-label={`Número ${padded}: ${CELL_LABEL[state]}`}
      aria-pressed={interactive ? state === "selected" : undefined}
      aria-disabled={interactive ? undefined : true}
      onClick={() => interactive && onToggle(number)}
      onFocus={() => onFocusNumber(number)}
      className={`flex aspect-square min-h-11 items-center justify-center border font-mono text-[11px] tabular-nums transition-colors ${CELL_CLASS[state]} ${
        highlight ? "outline outline-2 outline-signal outline-offset-2" : ""
      }`}
    >
      {padded}
    </button>
  );
}

// Só re-renderiza quando um primitivo muda. Callbacks são estáveis (useCallback).
export default memo(NumberCellBase);
