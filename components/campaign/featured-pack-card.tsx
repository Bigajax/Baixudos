"use client";

import dynamic from "next/dynamic";

// three.js só carrega quando este card entra em cena (code-split, sem SSR).
const FireSphere = dynamic(() => import("@/components/ui/fire-sphere"), { ssr: false });

interface FeaturedPackCardProps {
  active: boolean;
  quantity: number;
  /** Rótulo curto abaixo do número: "número" | "números". */
  label: string;
  /** Preço promocional já formatado (ex.: "R$ 379,90"). */
  price: string;
  /** Preço por número já formatado (ex.: "R$ 18,99"). */
  pricePerNumber: string;
  badgeText: string;
  showFireEffect?: boolean;
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
 * Card de pack em destaque: selo "Melhor oferta" dourado + camada de chamas
 * (WebGL/Three.js via FireSphere) concentrada no topo, atrás do conteúdo.
 * Não vem selecionado por padrão. O fogo é puramente decorativo (aria-hidden)
 * e não cobre textos/valores. Sob prefers-reduced-motion o FireSphere congela
 * e as animações do selo param (regra global em globals.css).
 */
export default function FeaturedPackCard({
  active,
  quantity,
  label,
  price,
  pricePerNumber,
  badgeText,
  showFireEffect = true,
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
      {/* Camada decorativa de chamas — clipada ao topo, some em direção ao centro */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[58%] overflow-hidden rounded-t-lg mix-blend-screen"
        style={{
          WebkitMaskImage: "linear-gradient(to bottom, #000 42%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, #000 42%, transparent 100%)",
        }}
      >
        {/* Fallback CSS (WebGL indisponível ou reduced-motion): brilho estático */}
        <span
          className="ember-flicker absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 85% at 50% 0%, rgba(255,150,0,0.55), rgba(255,60,0,0.18) 42%, transparent 72%)",
          }}
        />
        {showFireEffect && (
          <FireSphere
            className="absolute inset-0 h-full w-full"
            color0={[255, 60, 0]}
            color1={[255, 190, 0]}
            bloomStrength={1.4}
            bloomThreshold={0.15}
            animate
          />
        )}
      </span>

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

      {/* Conteúdo — sempre acima do fogo, sem ser coberto */}
      <span className="relative z-10 display text-3xl leading-none text-white sm:text-4xl">{quantity}</span>
      <span className="relative z-10 mt-1.5 text-[11px] leading-tight text-smoke sm:text-xs">{label}</span>
      <span className={`relative z-10 mt-2 font-mono text-xs font-semibold sm:mt-3 sm:text-lg ${active ? "text-[#FFD21F]" : "text-white"}`}>
        {price}
      </span>
      <span className="relative z-10 mt-1 font-mono text-[9px] font-medium text-[#FFD21F]/85 sm:text-[10px]">
        {pricePerNumber}/nº
      </span>
    </button>
  );
}
