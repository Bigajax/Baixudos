"use client";

import { formatPrice } from "@/lib/format";
import type { Pack } from "@/lib/checkout/types";

interface ChooserProps {
  packs: Pack[];
  basePriceCents: number;
  mode: "free" | "pack";
  packId: string | null;
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
  active, big, label, price, discountPct, onSelect,
}: {
  active: boolean;
  big: string;
  label: string;
  price: string;
  discountPct: number | null;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={`relative flex min-w-[130px] flex-1 snap-start flex-col items-center border p-4 text-center transition-colors ${
        active ? "border-signal bg-signal/[0.07]" : "border-line bg-panel hover:border-signal/60"
      }`}
    >
      {active && <Check />}
      <span className="display text-4xl leading-none text-white">{big}</span>
      <span className="mt-1.5 text-xs text-smoke">{label}</span>
      <span className={`mt-3 font-mono text-lg font-semibold ${active ? "text-signal" : "text-white"}`}>{price}</span>
      {discountPct != null && discountPct > 0 && (
        <span
          className={`mt-1.5 px-2 py-0.5 font-mono text-[10px] font-bold ${
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
  onChooseFree,
  onChoosePack,
}: ChooserProps) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-smoke">1. Escolha seu pack</p>

      <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Card
          active={mode === "free"}
          big="1"
          label="número avulso"
          price={formatPrice(basePriceCents)}
          discountPct={null}
          onSelect={onChooseFree}
        />
        {packs.map((pack) => {
          const discountPct =
            pack.originalPriceCents > 0
              ? Math.round(((pack.originalPriceCents - pack.promotionalPriceCents) / pack.originalPriceCents) * 100)
              : 0;
          return (
            <Card
              key={pack.id}
              active={mode === "pack" && packId === pack.id}
              big={String(pack.numberQuantity)}
              label={pack.title}
              price={formatPrice(pack.promotionalPriceCents)}
              discountPct={discountPct}
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
