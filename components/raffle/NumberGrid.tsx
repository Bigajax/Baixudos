"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatPrice } from "@/lib/format";
import { pickRandomAvailable } from "@/lib/raffle/random";
import type { RaffleCampaign, GridData, NumberStatus } from "@/lib/raffle/types";
import NumberCell from "./NumberCell";
import NumberGridToolbar from "./NumberGridToolbar";
import NumberGridLegend from "./NumberGridLegend";
import SelectionSummary from "./SelectionSummary";
import type { CellState } from "./status-meta";

export default function NumberGrid({
  campaign,
  grid,
}: {
  campaign: RaffleCampaign;
  grid: GridData;
}) {
  const total = campaign.totalNumbers;

  const takenMap = useMemo(() => {
    const m = new Map<number, NumberStatus>();
    for (const t of grid.taken) m.set(t.number, t.status);
    return m;
  }, [grid.taken]);

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<"all" | "available">("all");
  const [activeNumber, setActiveNumber] = useState(1);
  const [highlight, setHighlight] = useState<number | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(10);

  // Mede o nº real de colunas (auto-fill responsivo) para navegar com setas.
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

  const toggle = useCallback((n: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }, []);

  const removeOne = useCallback((n: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(n);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  const onFocusNumber = useCallback((n: number) => setActiveNumber(n), []);

  const focusNumber = useCallback(
    (n: number) => {
      setActiveNumber(n);
      requestAnimationFrame(() => {
        document.getElementById(`cell-${n}`)?.focus();
      });
    },
    [],
  );

  const handleSearch = useCallback((n: number) => {
    setFilter("all"); // garante que o número esteja visível
    setActiveNumber(n);
    setHighlight(n);
    requestAnimationFrame(() => {
      const el = document.getElementById(`cell-${n}`);
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
      el?.focus();
    });
    window.setTimeout(() => setHighlight((h) => (h === n ? null : h)), 2200);
  }, []);

  const handleRandom = useCallback(
    (count: number) => {
      setSelected((prev) => {
        const unavailable = new Set<number>(takenMap.keys());
        for (const s of prev) unavailable.add(s);
        const picks = pickRandomAvailable(total, unavailable, count);
        const next = new Set(prev);
        for (const p of picks) next.add(p);
        return next;
      });
    },
    [takenMap, total],
  );

  // Números visíveis (após filtro) — base da navegação por teclado.
  const visibleArr = useMemo(() => {
    const arr: number[] = [];
    for (let n = 1; n <= total; n++) {
      const isHidden = filter === "available" && takenMap.has(n) && !selected.has(n);
      if (!isHidden) arr.push(n);
    }
    return arr;
  }, [filter, takenMap, selected, total]);

  const tabbableNumber = visibleArr.includes(activeNumber)
    ? activeNumber
    : (visibleArr[0] ?? 1);

  function moveFocus(delta: number) {
    if (visibleArr.length === 0) return;
    const idx = visibleArr.indexOf(tabbableNumber);
    const cur = idx === -1 ? 0 : idx;
    const nextIdx = Math.max(0, Math.min(visibleArr.length - 1, cur + delta));
    focusNumber(visibleArr[nextIdx]);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        moveFocus(1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        moveFocus(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        moveFocus(cols);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveFocus(-cols);
        break;
      case "Home":
        e.preventDefault();
        if (visibleArr[0]) focusNumber(visibleArr[0]);
        break;
      case "End":
        e.preventDefault();
        if (visibleArr.length) focusNumber(visibleArr[visibleArr.length - 1]);
        break;
    }
  }

  const selectedSorted = useMemo(
    () => Array.from(selected).sort((a, b) => a - b),
    [selected],
  );

  return (
    <section
      id="numeros"
      className="mx-auto max-w-[1360px] scroll-mt-24 px-4 py-14 sm:px-6 md:py-24"
    >
      <p className="eyebrow">A grade</p>
      <h2 className="display mt-4 text-3xl text-white sm:text-5xl md:text-6xl">
        Monte seu jogo <span className="slash-mark">na pista</span>
      </h2>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-smoke">
        Toque nos números para montar sua seleção. Cada número custa{" "}
        <span className="font-mono text-white">{formatPrice(campaign.priceCents)}</span>. Você
        também pode buscar um número ou deixar a sorte escolher.
      </p>

      <div className="mt-8">
        <NumberGridLegend />
      </div>

      <div className="mt-5">
        <NumberGridToolbar
          total={total}
          filter={filter}
          onFilterChange={setFilter}
          onSearch={handleSearch}
          quickPicks={campaign.randomQuickPicks}
          onRandom={handleRandom}
          onClear={clearSelection}
          hasSelection={selected.size > 0}
        />
      </div>

      <div
        ref={gridRef}
        role="group"
        aria-label="Grade de números. Use as setas para navegar e Enter para selecionar."
        onKeyDown={onKeyDown}
        className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-1.5"
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
              onToggle={toggle}
              onFocusNumber={onFocusNumber}
            />
          );
        })}
      </div>

      {/* Espaço para a barra fixa de resumo não cobrir a última linha. */}
      {selected.size > 0 && <div aria-hidden="true" className="h-32" />}

      <SelectionSummary
        selected={selectedSorted}
        padding={campaign.numberPadding}
        priceCents={campaign.priceCents}
        maxPerOrder={campaign.maxPerOrder}
        onRemove={removeOne}
        onClear={clearSelection}
      />
    </section>
  );
}
