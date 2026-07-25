import Image from "next/image";
import Countdown from "@/components/Countdown";
import { formatPrice, formatDateLong } from "@/lib/format";
import type { RaffleCampaign, StatusCounts } from "@/lib/raffle/types";

function isPlaceholder(v: string | null): boolean {
  return !v || v.trim().startsWith("[");
}

/**
 * Hero "showroom": foto grande do prêmio à esquerda + card de participação
 * à direita (preço, progresso, specs e ação), tudo acima da dobra.
 */
export default function CampaignHero({
  campaign,
  counts,
}: {
  campaign: RaffleCampaign;
  counts: StatusCounts;
}) {
  const total = campaign.totalNumbers;
  const taken = Math.max(0, total - counts.available);
  const pct = total > 0 ? (taken / total) * 100 : 0;
  const drawLabel = campaign.drawAt ? formatDateLong(campaign.drawAt) : "A confirmar";

  const specs: { label: string; value: string | null }[] = [
    { label: "Modelo", value: campaign.prizeModel },
    { label: "Ano", value: campaign.prizeYear },
    { label: "Cor", value: campaign.prizeColor },
    { label: "Estado", value: campaign.prizeCondition },
  ];

  return (
    <section className="relative overflow-hidden bg-night">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, transparent, transparent 260px, #1b1b1e 260px, #1b1b1e 262px)",
        }}
      />

      <div className="relative mx-auto max-w-[1360px] px-4 pb-14 pt-28 sm:px-6 md:pb-20 md:pt-36">
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

        {campaign.drawAt && (
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <p className="eyebrow">Faltam para a apuração</p>
            <Countdown date={campaign.drawAt} />
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
          {/* Foto grande do prêmio */}
          <div className="relative aspect-[4/3] overflow-hidden border border-line lg:aspect-auto">
            {campaign.highlightImageUrl && (
              <Image
                src={campaign.highlightImageUrl}
                alt={campaign.prizeTitle}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover object-[center_78%]"
              />
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/80 to-transparent p-4 sm:p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-smoke">
                O prêmio
              </p>
              <p className="display text-xl text-white sm:text-2xl">{campaign.prizeTitle}</p>
            </div>
          </div>

          {/* Card de participação */}
          <div className="flex flex-col border border-line bg-panel">
            {/* Preço em destaque */}
            <div className="flex items-baseline justify-between gap-3 bg-signal px-5 py-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/85">
                Cada número
              </span>
              <span className="font-mono text-3xl font-semibold leading-none text-white">
                {formatPrice(campaign.priceCents)}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-5 p-5">
              {/* Progresso */}
              <div>
                <div className="flex items-baseline justify-between text-xs text-smoke">
                  <span>
                    <span className="font-mono tabular-nums text-white">
                      {counts.available.toLocaleString("pt-BR")}
                    </span>{" "}
                    de {total.toLocaleString("pt-BR")} disponíveis
                  </span>
                  <span className="font-mono tabular-nums">{pct.toFixed(0)}%</span>
                </div>
                <div
                  className="mt-2 h-2 overflow-hidden border border-line bg-graphite"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={total}
                  aria-valuenow={taken}
                  aria-label="Números já reservados"
                >
                  <div className="h-full bg-signal" style={{ width: `${pct}%` }} />
                </div>
              </div>

              {/* Total + apuração */}
              <dl className="grid grid-cols-2 gap-px overflow-hidden border border-line bg-line">
                <div className="bg-panel px-4 py-3">
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-smoke">Números</dt>
                  <dd className="mt-1 font-mono text-lg font-medium text-white tabular-nums">
                    {total.toLocaleString("pt-BR")}
                  </dd>
                </div>
                <div className="bg-panel px-4 py-3">
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-smoke">Apuração</dt>
                  <dd className="mt-1 font-mono text-sm font-medium leading-tight text-white">
                    {drawLabel}
                  </dd>
                </div>
              </dl>

              {/* Specs do prêmio */}
              <ul className="text-sm">
                {specs.map((s) => (
                  <li
                    key={s.label}
                    className="flex items-center justify-between border-b border-line/60 py-2"
                  >
                    <span className="text-smoke">{s.label}</span>
                    <span
                      className={isPlaceholder(s.value) ? "text-smoke/50" : "font-medium text-white"}
                    >
                      {s.value ?? "A confirmar"}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Ações */}
              <div className="mt-auto grid gap-2.5">
                <a
                  href="#numeros"
                  className="inline-flex min-h-13 items-center justify-center bg-signal px-6 py-3.5 text-center text-sm font-bold uppercase tracking-[0.12em] text-white transition-[background-color,transform] hover:bg-signal-dark active:translate-y-px"
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
                    className="inline-flex min-h-11 items-center justify-center border border-line px-6 py-3 text-center text-sm font-bold uppercase tracking-[0.1em] text-white transition-colors hover:border-signal hover:text-signal"
                  >
                    Ver regulamento
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
