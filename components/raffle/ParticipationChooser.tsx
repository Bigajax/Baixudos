"use client";

import { formatPrice } from "@/lib/format";
import type { Pack } from "@/lib/checkout/types";
import FeaturedPackCard from "@/components/campaign/featured-pack-card";

interface ChooserProps {
  packs: Pack[];
  basePriceCents: number;
  mode: "free" | "pack";
  packId: string | null;
  bestSellerId: string | null;
  onChooseFree: () => void;
  onChoosePack: (pack: Pack) => void;
}

function Check() {
  return (
    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-signal text-white">
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" aria-hidden="true">
        <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function Card({
  active, big, label, price, discountPct, bestSeller, onSelect,
}: {
  active: boolean;
  big: string;
  label: string;
  price: string;
  discountPct?: number;
  bestSeller?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={`relative flex flex-col items-center justify-center rounded-lg border px-1 py-3.5 text-center transition-colors sm:px-2 sm:py-5 ${
        active ? "border-signal bg-signal/[0.07]" : "border-line bg-panel hover:border-signal/60"
      }`}
    >
      {bestSeller && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-signal px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-white sm:px-2 sm:text-[9px] sm:tracking-[0.12em]">
          ★<span className="hidden sm:inline"> Mais vendido</span>
        </span>
      )}
      {active && <Check />}
      <span className="display text-3xl leading-none text-white sm:text-4xl">{big}</span>
      <span className="mt-1.5 text-[11px] leading-tight text-smoke sm:text-xs">{label}</span>
      <span className={`mt-2 font-mono text-xs font-semibold sm:mt-3 sm:text-lg ${active ? "text-signal" : "text-white"}`}>
        {price}
      </span>
      {discountPct != null && discountPct > 0 && (
        <span
          className={`mt-1 rounded-[2px] px-1 py-0.5 font-mono text-[8px] font-bold sm:mt-1.5 sm:px-1.5 sm:text-[10px] ${
            active ? "bg-signal text-white" : "bg-graphite text-smoke"
          }`}
        >
          −{discountPct}%
        </span>
      )}
    </button>
  );
}

export default function ParticipationChooser({
  packs,
  basePriceCents,
  mode,
  packId,
  bestSellerId,
  onChooseFree,
  onChoosePack,
}: ChooserProps) {
  // Pack com a melhor relação preço/quantidade (menor R$ por número).
  // O selo "Melhor oferta" só vai para ele — mantém a afirmação verdadeira
  // mesmo se os preços mudarem depois.
  const bestValuePackId =
    packs.reduce<{ id: string; ratio: number } | null>((best, p) => {
      const ratio = p.promotionalPriceCents / p.numberQuantity;
      return !best || ratio < best.ratio ? { id: p.id, ratio } : best;
    }, null)?.id ?? null;

  return (
    <div>
      <p className="text-[15px] font-semibold text-white">Escolha quantos números deseja comprar.</p>

      <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-5 sm:gap-3">
        <Card
          active={mode === "free"}
          big="1"
          label="número"
          price={formatPrice(basePriceCents)}
          onSelect={onChooseFree}
        />
        {packs.map((pack) => {
          const isActive = mode === "pack" && packId === pack.id;
          const label = pack.numberQuantity === 1 ? "número" : "números";
          const discountPct =
            pack.originalPriceCents > 0
              ? Math.round(((pack.originalPriceCents - pack.promotionalPriceCents) / pack.originalPriceCents) * 100)
              : 0;
          if (pack.id === bestValuePackId) {
            return (
              <FeaturedPackCard
                key={pack.id}
                active={isActive}
                quantity={pack.numberQuantity}
                label={label}
                price={formatPrice(pack.promotionalPriceCents)}
                discountPct={discountPct}
                badgeText="Melhor oferta"
                onSelect={() => onChoosePack(pack)}
              />
            );
          }
          return (
            <Card
              key={pack.id}
              active={isActive}
              big={String(pack.numberQuantity)}
              label={label}
              price={formatPrice(pack.promotionalPriceCents)}
              discountPct={discountPct}
              bestSeller={pack.id === bestSellerId}
              onSelect={() => onChoosePack(pack)}
            />
          );
        })}
      </div>

      {mode === "pack" && packId && (
        <p className="mt-3 text-xs text-smoke">
          {(() => {
            const p = packs.find((x) => x.id === packId);
            if (!p) return null;
            const saving = p.originalPriceCents - p.promotionalPriceCents;
            const avg = Math.round(p.promotionalPriceCents / p.numberQuantity);
            return saving > 0
              ? `Você economiza ${formatPrice(saving)} — sai a ${formatPrice(avg)} por número.`
              : `${formatPrice(avg)} por número.`;
          })()}
        </p>
      )}
    </div>
  );
}
