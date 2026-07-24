"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RaffleCampaign, GridData, NumberStatus } from "@/lib/raffle/types";
import NumberCell from "./NumberCell";
import NumberGridToolbar from "./NumberGridToolbar";
import NumberGridLegend from "./NumberGridLegend";
import type { CellState } from "./status-meta";

/**
 * Grade CONTROLADA: seleção vive no componente pai (CampaignParticipation).
 * Suporta limite máximo (packs) e aleatório no servidor (via onRandom no pai).
 */
export default function NumberGrid({
  campaign,
  grid,
  selected,
  onToggle,
  onClear,
  onRandom,
  quickPicks,
  maxSelectable,
}: {
  campaign: RaffleCampaign;
  grid: GridData;
  selected: Set<number>;
  onToggle: (n: number) => void;
  onClear: () => void;
  onRandom: (count: number) => void;
  quickPicks: number[];
  maxSelectable: number | null;
}) {
  const total = campaign.totalNumbers;

  const takenMap = useMemo(() => {
    const m = new Map<number, NumberStatus>();
    for (const t of grid.taken) m.set(t.number, t.status);
    return m;
  }, [grid.taken]);

  const [filter, setFilter] = useState<"all" | "available">("all");
  const [activeNumber, setActiveNumber] = useState(1);
  const [highlight, setHighlight] = useState<number | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(10);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const measure = () => {
      const tc = getComputedStyle(el).gridTemplateColumns;
      const n = tc ? tc.split(" ").filter(Boolean).length : 1;
      setCols(Math.max(1, n));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onFocusNumber = useCallback((n: number) => setActiveNumber(n), []);

  const focusNumber = useCallback((n: number) => {
    setActiveNumber(n);
    requestAnimationFrame(() => document.getElementById(`cell-${n}`)?.focus());
  }, []);

  const handleSearch = useCallback((n: number) => {
    setFilter("all");
    setActiveNumber(n);
    setHighlight(n);
    requestAnimationFrame(() => {
      const el = document.getElementById(`cell-${n}`);
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
      el?.focus();
    });
    window.setTimeout(() => setHighlight((h) => (h === n ? null : h)), 2200);
  }, []);

  const visibleArr = useMemo(() => {
    const arr: number[] = [];
    for (let n = 1; n <= total; n++) {
      const isHidden = filter === "available" && takenMap.has(n) && !selected.has(n);
      if (!isHidden) arr.push(n);
    }
    return arr;
  }, [filter, takenMap, selected, total]);

  const tabbableNumber = visibleArr.includes(activeNumber) ? activeNumber : (visibleArr[0] ?? 1);

  function moveFocus(delta: number) {
    if (visibleArr.length === 0) return;
    const idx = visibleArr.indexOf(tabbableNumber);
    const cur = idx === -1 ? 0 : idx;
    const nextIdx = Math.max(0, Math.min(visibleArr.length - 1, cur + delta));
    focusNumber(visibleArr[nextIdx]);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowRight": e.preventDefault(); moveFocus(1); break;
      case "ArrowLeft": e.preventDefault(); moveFocus(-1); break;
      case "ArrowDown": e.preventDefault(); moveFocus(cols); break;
      case "ArrowUp": e.preventDefault(); moveFocus(-cols); break;
      case "Home": e.preventDefault(); if (visibleArr[0]) focusNumber(visibleArr[0]); break;
      case "End": e.preventDefault(); if (visibleArr.length) focusNumber(visibleArr[visibleArr.length - 1]); break;
    }
  }

  return (
    <div>
      <div className="mb-4">
        <NumberGridLegend />
      </div>

      <NumberGridToolbar
        total={total}
        filter={filter}
        onFilterChange={setFilter}
        onSearch={handleSearch}
        quickPicks={quickPicks}
        onRandom={onRandom}
        onClear={onClear}
        hasSelection={selected.size > 0}
      />

      {maxSelectable != null && (
        <p className="mt-3 text-sm text-smoke" aria-live="polite">
          <span className="font-mono text-white">{selected.size}</span> de{" "}
          <span className="font-mono text-white">{maxSelectable}</span> selecionados
          {selected.size < maxSelectable && (
            <span className="text-smoke/70">
              {" "}
              · ainda faltam {maxSelectable - selected.size}
            </span>
          )}
        </p>
      )}

      <div
        ref={gridRef}
        role="group"
        aria-label="Grade de números. Use as setas para navegar e Enter para selecionar."
        onKeyDown={onKeyDown}
        className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-1.5"
      >
        {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
          const isSel = selected.has(n);
          const taken = takenMap.get(n);
          const state: CellState = isSel ? "selected" : (taken ?? "available");
          const isHidden = filter === "available" && !!taken && !isSel;
          return (
            <NumberCell
              key={n}
              number={n}
              padding={campaign.numberPadding}
              state={state}
              tabbable={n === tabbableNumber}
              hidden={isHidden}
              highlight={highlight === n}
              onToggle={onToggle}
              onFocusNumber={onFocusNumber}
            />
          );
        })}
      </div>
    </div>
  );
}
