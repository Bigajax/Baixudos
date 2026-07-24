import Image from "next/image";
import Countdown from "@/components/Countdown";
import { formatPrice, formatDateLong } from "@/lib/format";
import type { RaffleCampaign, StatusCounts } from "@/lib/raffle/types";

export default function CampaignHero({
  campaign,
  counts,
}: {
  campaign: RaffleCampaign;
  counts: StatusCounts;
}) {
  const taken = Math.max(0, campaign.totalNumbers - counts.available);
  const pct = campaign.totalNumbers > 0 ? (taken / campaign.totalNumbers) * 100 : 0;

  const drawLabel = campaign.drawAt ? formatDateLong(campaign.drawAt) : "A confirmar";

  const instruments: { label: string; value: string }[] = [
    { label: "Cada número", value: formatPrice(campaign.priceCents) },
    { label: "Total de números", value: campaign.totalNumbers.toLocaleString("pt-BR") },
    { label: "Apuração", value: drawLabel },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-night">
      {/* Foto do prêmio (full-bleed), escurecida para leitura */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {campaign.highlightImageUrl && (
          <Image
            src={campaign.highlightImageUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/85 to-night/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-night/95 via-night/70 to-transparent" />
        {/* linhas diagonais da marca */}
        <div
          className="absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, transparent, transparent 260px, #1b1b1e 260px, #1b1b1e 262px)",
          }}
        />
      </div>

      <div className="mx-auto max-w-[1360px] px-4 pb-16 pt-32 sm:px-6 md:pb-24 md:pt-40">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <p className="eyebrow hero-eyebrow">Campanha oficial • Números da sorte</p>
            {campaign.isDemo && (
              <span className="border border-signal/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-signal">
                Demonstração
              </span>
            )}
          </div>

          <h1 className="display mt-4 text-[44px] leading-[0.94] text-white sm:text-6xl md:text-7xl">
            {campaign.title}
          </h1>

          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-smoke sm:text-base md:text-lg">
            {campaign.subtitle ??
              "Escolha seus números, garanta sua participação e acompanhe a apuração ao vivo no evento."}
          </p>

          {/* Cluster de instrumentos */}
          <dl className="mt-8 grid grid-cols-3 gap-px overflow-hidden border border-line bg-line">
            {instruments.map((it) => (
              <div key={it.label} className="bg-panel px-3 py-4 sm:px-5">
                <dt className="text-[10px] uppercase tracking-[0.16em] text-smoke sm:text-[11px]">
                  {it.label}
                </dt>
                <dd className="mt-1.5 font-mono text-base font-medium leading-tight text-white tabular-nums sm:text-xl">
                  {it.value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Faixa de progresso — "vagas na pista" */}
          <div className="mt-6">
            <div className="flex items-baseline justify-between text-[12px] text-smoke">
              <span>
                <span className="font-mono tabular-nums text-white">
                  {counts.available.toLocaleString("pt-BR")}
                </span>{" "}
                de {campaign.totalNumbers.toLocaleString("pt-BR")} disponíveis
              </span>
              <span className="font-mono tabular-nums">{pct.toFixed(0)}%</span>
            </div>
            <div
              className="mt-2 h-2 overflow-hidden border border-line bg-graphite"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={campaign.totalNumbers}
              aria-valuenow={taken}
              aria-label="Números já reservados"
            >
              <div className="h-full bg-signal" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-8 grid gap-3 sm:flex sm:items-center">
            <a
              href="#numeros"
              className="inline-flex min-h-13 w-full items-center justify-center bg-signal px-8 py-4 text-center text-sm font-bold uppercase tracking-[0.12em] text-white transition-[background-color,transform] hover:bg-signal-dark active:translate-y-px sm:w-auto"
              style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
            >
              Escolher meus números
              <span aria-hidden="true" className="ml-2 text-base leading-none">
                →
              </span>
            </a>
            {campaign.regulationUrl && (
              <a
                href={campaign.regulationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-13 w-full items-center justify-center border border-white/40 px-8 py-4 text-center text-sm font-bold uppercase tracking-[0.1em] text-white transition-[border-color,color] hover:border-signal hover:text-signal sm:w-auto"
                style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
              >
                Ver regulamento
              </a>
            )}
          </div>

          {campaign.drawAt && (
            <div className="mt-8">
              <p className="eyebrow mb-3">Faltam para a apuração</p>
              <Countdown date={campaign.drawAt} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
