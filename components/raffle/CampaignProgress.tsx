import Reveal from "@/components/Reveal";
import { formatPrice, formatDateLong } from "@/lib/format";
import type { RaffleCampaign, StatusCounts } from "@/lib/raffle/types";

export default function CampaignProgress({
  campaign,
  counts,
}: {
  campaign: RaffleCampaign;
  counts: StatusCounts;
}) {
  const total = campaign.totalNumbers;
  const taken = Math.max(0, total - counts.available);
  const pct = total > 0 ? (taken / total) * 100 : 0;

  const stats: { label: string; value: string }[] = [
    { label: "Confirmados", value: counts.confirmed.toLocaleString("pt-BR") },
    { label: "Disponíveis", value: counts.available.toLocaleString("pt-BR") },
    { label: "Preenchido", value: `${pct.toFixed(1)}%` },
    { label: "Valor por número", value: formatPrice(campaign.priceCents) },
    {
      label: "Apuração",
      value: campaign.drawAt ? formatDateLong(campaign.drawAt) : "A confirmar",
    },
  ];

  return (
    <section className="border-y border-line bg-panel/40">
      <div className="mx-auto max-w-[1360px] px-4 py-14 sm:px-6 md:py-20">
        <Reveal>
          <p className="eyebrow">Progresso da campanha</p>
          <h2 className="display mt-4 text-2xl text-white sm:text-4xl">
            {counts.available.toLocaleString("pt-BR")} vagas ainda na pista
          </h2>
        </Reveal>

        <Reveal delay={0.06}>
          <div
            className="mt-8 h-4 overflow-hidden border border-line bg-graphite"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={taken}
            aria-label="Números já reservados ou confirmados"
          >
            <div
              className="h-full bg-signal transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((s) => (
              <div key={s.label} className="bg-panel px-4 py-5">
                <dt className="text-[11px] uppercase tracking-[0.16em] text-smoke">{s.label}</dt>
                <dd className="mt-2 font-mono text-lg font-medium leading-tight text-white tabular-nums">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mt-5 text-xs leading-relaxed text-smoke/60">
            Os valores refletem os números já reservados e confirmados. Por transparência, não
            exibimos arrecadação financeira nesta página.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
