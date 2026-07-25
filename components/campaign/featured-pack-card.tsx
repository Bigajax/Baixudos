"use client";

interface FeaturedPackCardProps {
  active: boolean;
  quantity: number;
  /** Rótulo curto abaixo do número: "número" | "números". */
  label: string;
  /** Preço promocional já formatado (ex.: "R$ 379,90"). */
  price: string;
  badgeText: string;
  showFireEffect?: boolean;
  onSelect: () => void;
}

// Línguas de fogo (CSS): posição/altura/ritmo variados para movimento orgânico.
const FLAMES = [
  { left: 18, w: 20, h: 46, base: 34, dur: 3.1, delay: 0 },
  { left: 35, w: 26, h: 62, base: 30, dur: 3.7, delay: 0.5 },
  { left: 50, w: 30, h: 72, base: 28, dur: 4.0, delay: 0.2 },
  { left: 65, w: 26, h: 60, base: 30, dur: 3.5, delay: 0.8 },
  { left: 82, w: 20, h: 48, base: 34, dur: 3.3, delay: 0.35 },
];

const FLAME_CLIP =
  "polygon(50% 0%, 66% 26%, 82% 58%, 62% 92%, 50% 100%, 38% 92%, 18% 58%, 34% 26%)";

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M13.4 2.3c.3 2.4-.6 4-1.9 5.5-1.2 1.4-2.7 2.8-2.7 5.1a5.2 5.2 0 0 0 10.4.3c.2-2.8-1.3-4.7-2.4-6.1.3 1.2.1 2.2-.6 2.7.2-2.9-1-5.4-2.3-7.5-.6.9-.9 1.7-1.1 2.4-.1-1.4-.6-2.6-1.4-3.6Z" />
    </svg>
  );
}

/**
 * Card de pack em destaque: selo "Melhor oferta" dourado 50% sobreposto ao
 * topo + chamas decorativas em CSS concentradas no topo, atrás do conteúdo.
 * Não vem selecionado por padrão. O fogo é decorativo (aria-hidden), some em
 * direção ao centro e não cobre textos/valores. Sob prefers-reduced-motion as
 * animações param (regra global em globals.css), restando o brilho estático.
 */
export default function FeaturedPackCard({
  active,
  quantity,
  label,
  price,
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
      {/* Camada decorativa de chamas — clipada ao topo, some para o centro */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-2 z-0 h-[72%] overflow-hidden mix-blend-screen"
        style={{
          WebkitMaskImage: "linear-gradient(to bottom, #000 46%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, #000 46%, transparent 100%)",
        }}
      >
        {/* Brilho quente de base (também é o fallback estático) */}
        <span
          className="ember-flicker absolute inset-0"
          style={{
            background:
              "radial-gradient(115% 80% at 50% 6%, rgba(255,150,20,0.5), rgba(255,60,0,0.14) 46%, transparent 72%)",
          }}
        />
        {/* Leito de brasa que une as bases das chamas (fogueira contínua) */}
        {showFireEffect && (
          <span
            className="ember-flicker absolute inset-x-0"
            style={{
              bottom: "26%",
              height: "18px",
              filter: "blur(7px)",
              background:
                "linear-gradient(to right, transparent, rgba(255,90,0,0.55) 16%, rgba(255,150,10,0.7) 50%, rgba(255,90,0,0.55) 84%, transparent)",
            }}
          />
        )}
        {/* Línguas de fogo */}
        {showFireEffect && (
          <span className="absolute inset-0 blur-[4px]">
            {FLAMES.map((f, i) => (
              <span
                key={i}
                className="absolute block"
                style={{
                  left: `${f.left}%`,
                  bottom: `${f.base}%`,
                  width: f.w,
                  height: f.h,
                  transform: "translateX(-50%)",
                  transformOrigin: "50% 100%",
                  clipPath: FLAME_CLIP,
                  background:
                    "linear-gradient(to top, #ff2a00 0%, #ff7d00 45%, #ffd646 100%)",
                  animation: `flame-lick ${f.dur}s ease-in-out ${f.delay}s infinite`,
                }}
              />
            ))}
          </span>
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
    </button>
  );
}
