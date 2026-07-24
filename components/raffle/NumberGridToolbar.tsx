"use client";

import { useState } from "react";

interface ToolbarProps {
  total: number;
  filter: "all" | "available";
  onFilterChange: (f: "all" | "available") => void;
  onSearch: (n: number) => void;
  quickPicks: number[];
  onRandom: (n: number) => void;
  onClear: () => void;
  hasSelection: boolean;
}

export default function NumberGridToolbar({
  total,
  filter,
  onFilterChange,
  onSearch,
  quickPicks,
  onRandom,
  onClear,
  hasSelection,
}: ToolbarProps) {
  const [query, setQuery] = useState("");

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const n = parseInt(query, 10);
    if (!Number.isNaN(n) && n >= 1 && n <= total) onSearch(n);
  }

  return (
    <div className="flex flex-col gap-4 border border-line bg-panel p-4 sm:p-5">
      {/* Busca + filtro */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={submitSearch} className="flex gap-2" role="search">
          <label htmlFor="grid-search" className="sr-only">
            Buscar número
          </label>
          <input
            id="grid-search"
            inputMode="numeric"
            pattern="[0-9]*"
            value={query}
            onChange={(e) => setQuery(e.target.value.replace(/\D/g, ""))}
            placeholder={`Buscar nº (1–${total})`}
            className="field w-full font-mono sm:w-48"
          />
          <button
            type="submit"
            className="shrink-0 border border-line px-4 text-sm font-semibold text-white transition-colors hover:border-signal hover:text-signal"
          >
            Ir
          </button>
        </form>

        <div className="flex overflow-hidden border border-line" role="group" aria-label="Filtrar números">
          {(["all", "available"] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => onFilterChange(f)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
                filter === f ? "bg-signal text-white" : "text-smoke hover:text-white"
              }`}
            >
              {f === "all" ? "Todos" : "Disponíveis"}
            </button>
          ))}
        </div>
      </div>

      {/* Seleção aleatória + limpar */}
      {(quickPicks.length > 0 || hasSelection) && (
        <div className="flex flex-wrap items-center gap-2">
          {quickPicks.length > 0 && (
            <>
              <span className="mr-1 text-xs uppercase tracking-[0.14em] text-smoke">Aleatório:</span>
              {quickPicks.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onRandom(n)}
                  className="border border-line px-3 py-1.5 font-mono text-sm text-white transition-colors hover:border-signal hover:text-signal"
                >
                  +{n}
                </button>
              ))}
            </>
          )}
          {hasSelection && (
            <button
              type="button"
              onClick={onClear}
              className="ml-auto text-xs font-semibold uppercase tracking-[0.1em] text-smoke underline-offset-4 transition-colors hover:text-signal hover:underline"
            >
              Limpar seleção
            </button>
          )}
        </div>
      )}
    </div>
  );
}
