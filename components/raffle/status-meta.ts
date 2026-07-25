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
  // Reservado / aguardando pagamento — amarelo (em espera)
  reserved: "border-[#FFB800]/55 bg-[#FFB800]/18 text-[#FFD21F] cursor-not-allowed",
  pending: "border-[#FFB800]/55 bg-[#FFB800]/18 text-[#FFD21F] cursor-not-allowed",
  // Vendido — verde (garantido)
  confirmed: "border-[#22C55E]/60 bg-[#22C55E]/22 text-[#4ADE80] cursor-not-allowed",
  // Indisponível / cancelado — mais escuro, borda tracejada
  blocked: "border-dashed border-line/50 bg-night text-smoke/30 cursor-not-allowed",
  cancelled: "border-dashed border-line/50 bg-night text-smoke/30 cursor-not-allowed",
  // Contemplado
  won: "border-signal bg-signal/25 text-white cursor-not-allowed",
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

/** Amostra de cor/borda da legenda por estado (espelha CELL_CLASS). */
export const LEGEND_SWATCH: Record<CellState, string> = {
  available: "border-line bg-panel",
  selected: "border-signal bg-signal",
  reserved: "border-[#FFB800]/55 bg-[#FFB800]/18",
  pending: "border-[#FFB800]/55 bg-[#FFB800]/18",
  confirmed: "border-[#22C55E]/60 bg-[#22C55E]/22",
  blocked: "border-dashed border-line/50 bg-night",
  cancelled: "border-dashed border-line/50 bg-night",
  won: "border-signal bg-signal/25",
};
