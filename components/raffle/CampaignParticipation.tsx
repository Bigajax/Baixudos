"use client";

import { useCallback, useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import type { RaffleCampaign, GridData } from "@/lib/raffle/types";
import type { Pack } from "@/lib/checkout/types";
import type { TicketOffer } from "@/lib/checkout/queries";
import ParticipationChooser from "./ParticipationChooser";
import NumberGrid from "./NumberGrid";
import SelectionSummary from "./SelectionSummary";
import CampaignCheckoutModal from "./CampaignCheckoutModal";

export default function CampaignParticipation({
  campaign,
  grid,
  packs,
  ticketOffer,
  sandbox,
}: {
  campaign: RaffleCampaign;
  grid: GridData;
  packs: Pack[];
  ticketOffer: TicketOffer | null;
  sandbox: boolean;
}) {
  // Grade já ativa por padrão (modo livre): o usuário clica números na hora.
  const [mode, setMode] = useState<"free" | "pack">("free");
  const [pack, setPack] = useState<Pack | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [sorting, setSorting] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const isPack = mode === "pack" && pack != null;
  const limit = isPack ? pack.numberQuantity : null;

  const chooseFree = useCallback(() => {
    setMode("free");
    setPack(null);
    setSelected(new Set());
  }, []);

  const choosePack = useCallback((p: Pack) => {
    setMode("pack");
    setPack(p);
    setSelected(new Set());
  }, []);

  const fetchRandom = useCallback(
    async (count: number): Promise<number[]> => {
      const res = await fetch(`/api/campanhas/${campaign.slug}/aleatorio`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ count }),
      });
      if (!res.ok) return [];
      const json = (await res.json()) as { numbers?: number[] };
      return json.numbers ?? [];
    },
    [campaign.slug],
  );

  const toggle = useCallback(
    (n: number) => {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(n)) {
          next.delete(n);
          return next;
        }
        if (limit != null && next.size >= limit) return prev;
        next.add(n);
        return next;
      });
    },
    [limit],
  );

  const removeOne = useCallback((n: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(n);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  // Aleatório do modo livre: acrescenta à seleção.
  const freeRandom = useCallback(
    async (count: number) => {
      setSorting(true);
      const nums = await fetchRandom(count + selected.size);
      setSelected((prev) => {
        const next = new Set(prev);
        for (const n of nums) {
          if (next.size >= prev.size + count) break;
          if (!next.has(n)) next.add(n);
        }
        return next;
      });
      setSorting(false);
    },
    [selected.size, fetchRandom],
  );

  // Sortear os N do pack de uma vez (substitui a seleção).
  const sortPack = useCallback(async () => {
    if (!pack) return;
    setSorting(true);
    const nums = await fetchRandom(pack.numberQuantity);
    setSelected(new Set(nums.slice(0, pack.numberQuantity)));
    setSorting(false);
  }, [pack, fetchRandom]);

  const selectedSorted = useMemo(
    () => Array.from(selected).sort((a, b) => a - b),
    [selected],
  );

  const subtotalCents = isPack ? pack.promotionalPriceCents : selected.size * campaign.priceCents;
  const complete = isPack ? selected.size === pack.numberQuantity : selected.size >= 1;

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
        Clique nos números para montar sua seleção, ou escolha um pack com condição especial. Cada
        número custa <span className="font-mono text-white">{formatPrice(campaign.priceCents)}</span>.
      </p>

      <div className="mt-8">
        <ParticipationChooser
          packs={packs}
          basePriceCents={campaign.priceCents}
          mode={mode}
          packId={pack?.id ?? null}
          onChooseFree={chooseFree}
          onChoosePack={choosePack}
        />
      </div>

      {/* Pack: atalho de sortear os N (manual continua sendo clicar na grade) */}
      {isPack && (
        <div className="mt-6 flex flex-wrap items-center gap-3 border border-line bg-panel p-4">
          <p className="text-sm text-smoke">
            Escolha <span className="font-mono text-white">{pack.numberQuantity}</span> números na
            grade — ou deixe a sorte:
          </p>
          <button
            type="button"
            onClick={sortPack}
            disabled={sorting}
            className="ml-auto border border-signal px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-signal transition-colors hover:bg-signal hover:text-white disabled:opacity-50"
          >
            {sorting ? "Sorteando…" : `Sortear os ${pack.numberQuantity}`}
          </button>
        </div>
      )}

      <div className="mt-8">
        <NumberGrid
          campaign={campaign}
          grid={grid}
          selected={selected}
          onToggle={toggle}
          onClear={clearSelection}
          onRandom={freeRandom}
          quickPicks={mode === "free" ? campaign.randomQuickPicks : []}
          maxSelectable={limit}
        />
      </div>

      <div aria-hidden="true" className="h-40" />

      <SelectionSummary
        planKind={mode}
        packQuantity={isPack ? pack.numberQuantity : undefined}
        subtotalCents={subtotalCents}
        selectedNumbers={selectedSorted}
        padding={campaign.numberPadding}
        complete={complete}
        onClear={clearSelection}
        onContinue={() => setCheckoutOpen(true)}
        onRemove={removeOne}
      />

      <CampaignCheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        campaign={campaign}
        planKind={mode}
        pack={pack}
        numbers={selectedSorted}
        subtotalCents={subtotalCents}
        ticketOffer={ticketOffer}
        sandbox={sandbox}
      />
    </section>
  );
}
