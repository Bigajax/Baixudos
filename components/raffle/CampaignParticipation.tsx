"use client";

import { useCallback, useMemo, useState } from "react";
import { padNumber } from "@/lib/raffle/types";
import type { RaffleCampaign, GridData } from "@/lib/raffle/types";
import type { Pack } from "@/lib/checkout/types";
import type { TicketOffer } from "@/lib/checkout/queries";
import Countdown from "@/components/Countdown";
import ParticipationChooser from "./ParticipationChooser";
import NumberGrid from "./NumberGrid";
import SelectionSummary from "./SelectionSummary";
import CampaignCheckoutModal from "./CampaignCheckoutModal";

type Method = "grade" | "aleatorio";

export default function CampaignParticipation({
  campaign,
  grid,
  packs,
  ticketOffer,
  sandbox,
  bestSellerId,
}: {
  campaign: RaffleCampaign;
  grid: GridData;
  packs: Pack[];
  ticketOffer: TicketOffer | null;
  sandbox: boolean;
  bestSellerId: string | null;
}) {
  const [mode, setMode] = useState<"free" | "pack">("free");
  const [pack, setPack] = useState<Pack | null>(null);
  const [method, setMethod] = useState<Method>("grade");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [sorting, setSorting] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const isPack = mode === "pack" && pack != null;
  const limit = isPack ? pack.numberQuantity : null;
  const taken = Math.max(0, campaign.totalNumbers - grid.counts.available);

  const chooseFree = useCallback(() => {
    setMode("free");
    setPack(null);
    setMethod("grade");
    setSelected(new Set());
  }, []);

  const choosePack = useCallback((p: Pack) => {
    setMode("pack");
    setPack(p);
    setMethod("grade");
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

  const sortPack = useCallback(async () => {
    if (!pack) return;
    setSorting(true);
    const nums = await fetchRandom(pack.numberQuantity);
    setSelected(new Set(nums.slice(0, pack.numberQuantity)));
    setSorting(false);
  }, [pack, fetchRandom]);

  const pickMethod = useCallback(
    (m: Method) => {
      setMethod(m);
      if (m === "aleatorio") sortPack();
      else setSelected(new Set());
    },
    [sortPack],
  );

  const selectedSorted = useMemo(() => Array.from(selected).sort((a, b) => a - b), [selected]);
  const subtotalCents = isPack ? pack.promotionalPriceCents : selected.size * campaign.priceCents;
  const complete = isPack ? selected.size === pack.numberQuantity : selected.size >= 1;
  const showGrid = mode === "free" || (isPack && method === "grade");

  return (
    <section id="numeros" className="mx-auto max-w-[1360px] scroll-mt-24 px-4 py-14 sm:px-6 md:py-20">
      <p className="eyebrow">Sorteio</p>
      <h2 className="display mt-4 text-3xl text-white sm:text-5xl md:text-6xl">
        Escolha como <span className="slash-mark">participar</span>
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-smoke">Simples, rápido e 100% seguro.</p>

      {/* Escassez REAL */}
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
        <span className="text-smoke">
          <span className="font-mono font-semibold text-white">{grid.counts.available.toLocaleString("pt-BR")}</span> de{" "}
          {campaign.totalNumbers.toLocaleString("pt-BR")} disponíveis
        </span>
        {taken > 0 && (
          <span className="flex items-center gap-1.5 text-smoke">
            <span className="h-2 w-2 rounded-full bg-signal" />
            <span className="font-mono font-semibold text-white">{taken.toLocaleString("pt-BR")}</span> já garantidos
          </span>
        )}
      </div>

      {campaign.salesCloseAt && (
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border border-signal/40 bg-signal/[0.06] p-3">
          <span className="text-sm font-semibold text-white">Vendas encerram em</span>
          <Countdown date={campaign.salesCloseAt} />
        </div>
      )}

      {/* 1. Packs */}
      <div className="mt-8">
        <ParticipationChooser
          packs={packs}
          basePriceCents={campaign.priceCents}
          mode={mode}
          packId={pack?.id ?? null}
          bestSellerId={bestSellerId}
          onChooseFree={chooseFree}
          onChoosePack={choosePack}
        />
      </div>

      {/* 2. Como escolher (packs) */}
      {isPack && (
        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-smoke">2. Como você quer escolher?</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {([
              { key: "grade", title: "Escolher na grade", desc: "Veja os disponíveis e escolha os seus.", icon: "grid" },
              { key: "aleatorio", title: "Números aleatórios", desc: "Deixe a sorte escolher por você.", icon: "shuffle" },
            ] as const).map((opt) => {
              const active = method === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => pickMethod(opt.key)}
                  className={`relative flex items-center gap-4 border p-4 text-left transition-colors ${
                    active ? "border-signal bg-signal/[0.07]" : "border-line bg-panel hover:border-signal/60"
                  }`}
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${active ? "border-signal text-signal" : "border-line text-smoke"}`}>
                    {opt.icon === "grid" ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" /><rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" /><rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" /><rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true"><path d="M4 7h3l10 10h3M4 17h3L17 7h3M17 4l3 3-3 3M17 20l3-3-3-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    )}
                  </span>
                  <span>
                    <span className="block text-[15px] font-semibold text-white">{opt.title}</span>
                    <span className="mt-0.5 block text-sm text-smoke">{opt.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Números */}
      <div className="mt-8">
        {(mode === "pack" || mode === "free") && (
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-smoke">
            {mode === "pack" ? "3. " : ""}Escolha seus números
          </p>
        )}

        {showGrid ? (
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
        ) : (
          <div className="border border-line bg-panel p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-smoke">
                Seus <span className="font-mono text-white">{pack?.numberQuantity}</span> números sorteados:
              </p>
              <button type="button" onClick={sortPack} disabled={sorting}
                className="shrink-0 border border-line px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:border-signal hover:text-signal disabled:opacity-50">
                {sorting ? "Sorteando…" : "Trocar"}
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2" aria-live="polite">
              {selectedSorted.map((n) => (
                <span key={n} className="border border-signal/60 bg-signal/15 px-3 py-2 font-mono text-sm text-white tabular-nums">
                  {padNumber(n, campaign.numberPadding)}
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-smoke/70">
              Os números são confirmados no servidor no pagamento. Você pode trocar enquanto estiverem disponíveis.
            </p>
          </div>
        )}
      </div>

      {/* Confiança */}
      <div className="mt-6 flex items-center gap-3 border border-line bg-panel p-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-signal/15 text-signal">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <div>
          <p className="text-sm font-semibold text-white">Ambiente 100% seguro</p>
          <p className="text-xs text-smoke">Pagamento via Pix, reserva garantida e confirmação automática.</p>
        </div>
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
        onRemove={isPack && method === "aleatorio" ? undefined : removeOne}
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
