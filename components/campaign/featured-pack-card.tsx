"use client";

interface FeaturedPackCardProps {
  active: boolean;
  quantity: number;
  /** Rótulo curto abaixo do número: "número" | "números". */
  label: string;
  /** Preço promocional já formatado (ex.: "R$ 379,90"). */
  price: string;
  /** Percentual de desconto (0 = sem badge). */
  discountPct?: number;
  badgeText: string;
  onSelect: () => void;
}

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M13.4 2.3c.3 2.4-.6 4-1.9 5.5-1.2 1.4-2.7 2.8-2.7 5.1a5.2 5.2 0 0 0 10.4.3c.2-2.8-1.3-4.7-2.4-6.1.3 1.2.1 2.2-.6 2.7.2-2.9-1-5.4-2.3-7.5-.6.9-.9 1.7-1.1 2.4-.1-1.4-.6-2.6-1.4-3.6Z" />
    </svg>
  );
}

/**
 * Card de pack em destaque: selo "Melhor oferta" dourado 50% sobreposto ao
 * topo, com borda e brilho dourados discretos. Não vem selecionado por padrão.
 */
export default function FeaturedPackCard({
  active,
  quantity,
  label,
  price,
  discountPct,
  badgeText,
  onSelect,
}: FeaturedPackCardProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={`relative flex flex-col items-center justify-center rounded-lg border px-1 pb-3.5 pt-6 text-center transition-colors sm:px-2 sm:pb-5 sm:pt-7 ${
        active
          ? "border-[#FFD21F] bg-gradient-to-b from-[#FFD21F]/[0.1] to-signal/[0.05] shadow-[0_0_26px_-6px_rgba(255,184,0,0.55)]"
          : "border-[#FFB800]/55 bg-[#18181B] shadow-[0_0_20px_-8px_rgba(255,184,0,0.45)] hover:border-[#FFD21F]/80"
      }`}
    >
      {/* Selo "Melhor oferta" — 50% sobreposto ao topo */}
      <span className="badge-glow absolute left-1/2 top-0 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-[3px] border border-[#FFB800]/70 bg-[#160a02] px-2 py-1 sm:px-2.5">
        <FlameIcon className="h-3 w-3 text-[#FFC01F]" />
        <span className="bg-gradient-to-b from-[#FFF36A] to-[#FFB800] bg-clip-text font-display text-[9px] font-bold uppercase leading-none tracking-[0.12em] text-transparent sm:text-[11px]">
          {badgeText}
        </span>
      </span>

      {/* Check quando selecionado */}
      {active && (
        <span className="absolute right-2 top-2 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFD21F] text-[#160a02]">
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" aria-hidden="true">
            <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}

      <span className="display text-3xl leading-none text-white sm:text-4xl">{quantity}</span>
      <span className="mt-1.5 text-[11px] leading-tight text-smoke sm:text-xs">{label}</span>
      <span className={`mt-2 font-mono text-xs font-semibold sm:mt-3 sm:text-lg ${active ? "text-[#FFD21F]" : "text-white"}`}>
        {price}
      </span>
      {discountPct != null && discountPct > 0 && (
        <span className="mt-1 rounded-[2px] bg-[#FFB800] px-1.5 py-0.5 font-mono text-[8px] font-bold text-[#160a02] sm:mt-1.5 sm:text-[10px]">
          −{discountPct}%
        </span>
      )}
    </button>
  );
}
