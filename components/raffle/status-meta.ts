import type { NumberStatus } from "@/lib/raffle/types";

/** Estado visual de uma célula: os status do banco + "selected" (só UI). */
export type CellState = NumberStatus | "selected";

/** Rótulo textual (não depender só de cor — usado em aria-label e legenda). */
export const CELL_LABEL: Record<CellState, string> = {
  available: "Disponível",
  selected: "Selecionado",
  reserved: "Reservado",
  pending: "Aguardando pagamento",
  confirmed: "Vendido",
  blocked: "Indisponível",
  cancelled: "Indisponível",
  won: "Contemplado",
};

/** Classes da célula por estado. Available e selected são interativos. */
export const CELL_CLASS: Record<CellState, string> = {
  available:
    "border-line bg-panel text-smoke hover:border-signal hover:text-white",
  selected:
    "border-signal bg-signal text-white shadow-[0_0_10px_rgba(255,16,16,0.55)]",
  reserved: "border-line/40 bg-graphite text-smoke/40 cursor-not-allowed",
  pending: "border-line/40 bg-graphite text-smoke/40 cursor-not-allowed",
  confirmed: "border-line/40 bg-graphite text-smoke/35 cursor-not-allowed",
  blocked: "border-line/30 bg-graphite/60 text-smoke/25 cursor-not-allowed",
  cancelled: "border-line/30 bg-graphite/60 text-smoke/25 cursor-not-allowed",
  won: "border-signal/60 bg-signal/20 text-white cursor-not-allowed",
};

/** Estados interativos (podem ser selecionados/deselecionados pelo usuário). */
export function isInteractive(state: CellState): boolean {
  return state === "available" || state === "selected";
}

/** Itens exibidos na legenda (subconjunto relevante ao público). */
export const LEGEND_ITEMS: CellState[] = [
  "available",
  "selected",
  "reserved",
  "confirmed",
  "blocked",
];

/** Amostra de cor/borda da legenda por estado. */
export const LEGEND_SWATCH: Record<CellState, string> = {
  available: "border-line bg-panel",
  selected: "border-signal bg-signal",
  reserved: "border-line/40 bg-graphite",
  pending: "border-line/40 bg-graphite",
  confirmed: "border-line/40 bg-graphite",
  blocked: "border-line/30 bg-graphite/60",
  cancelled: "border-line/30 bg-graphite/60",
  won: "border-signal/60 bg-signal/20",
};
