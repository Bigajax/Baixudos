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
      <h3 className="text-[15px] font-semibold text-white">Escolha como participar</h3>
      <p className="mt-1 text-sm text-smoke">
        Selecione números individualmente ou escolha um pack com condição especial.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Escolha livre */}
        <button
          type="button"
          aria-pressed={mode === "free"}
          onClick={onChooseFree}
          className={`flex flex-col items-start border p-4 text-left transition-colors ${
            mode === "free"
              ? "border-signal bg-signal/10"
              : "border-line bg-panel hover:border-signal/60"
          }`}
        >
          <span className="text-[15px] font-semibold text-white">Escolher meus números</span>
          <span className="mt-1 text-sm text-smoke">Você seleciona um a um na grade.</span>
          <span className="mt-3 font-mono text-lg font-medium text-white">
            {formatPrice(basePriceCents)}
            <span className="ml-1 text-xs text-smoke">/ número</span>
          </span>
        </button>

        {/* Packs */}
        {packs.map((pack) => {
          const active = mode === "pack" && packId === pack.id;
          const saving = pack.originalPriceCents - pack.promotionalPriceCents;
          const avg = Math.round(pack.promotionalPriceCents / pack.numberQuantity);
          return (
            <button
              key={pack.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChoosePack(pack)}
              className={`relative flex flex-col items-start border p-4 text-left transition-colors ${
                active ? "border-signal bg-signal/10" : "border-line bg-panel hover:border-signal/60"
              }`}
            >
              {saving > 0 && (
                <span className="absolute right-3 top-3 bg-signal px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-white">
                  −{formatPrice(saving)}
                </span>
              )}
              <span className="text-[15px] font-semibold text-white">{pack.title}</span>
              <span className="mt-1 text-sm text-smoke">
                {pack.numberQuantity} números
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                {saving > 0 && (
                  <span className="font-mono text-xs text-smoke/60 line-through">
                    {formatPrice(pack.originalPriceCents)}
                  </span>
                )}
                <span className="font-mono text-lg font-medium text-white">
                  {formatPrice(pack.promotionalPriceCents)}
                </span>
              </div>
              <span className="mt-1 font-mono text-[11px] text-smoke">
                {formatPrice(avg)} por número
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
