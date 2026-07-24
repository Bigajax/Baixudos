import Reveal from "@/components/Reveal";
import type { RaffleCampaign } from "@/lib/raffle/types";

function isPlaceholder(v: string | null): boolean {
  return !v || v.trim().startsWith("[");
}

export default function PrizeInfo({ campaign }: { campaign: RaffleCampaign }) {
  const specs: { label: string; value: string | null }[] = [
    { label: "Modelo", value: campaign.prizeModel },
    { label: "Ano", value: campaign.prizeYear },
    { label: "Cor", value: campaign.prizeColor },
    { label: "Estado", value: campaign.prizeCondition },
  ];

  return (
    <section className="mx-auto max-w-[1360px] px-4 py-14 sm:px-6 md:py-24">
      <Reveal>
        <p className="eyebrow">O prêmio</p>
        <h2 className="display mt-4 text-3xl text-white sm:text-5xl md:text-6xl">
          {campaign.prizeTitle}
        </h2>
        {campaign.prizeDescription && (
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-smoke">
            {campaign.prizeDescription}
          </p>
        )}
      </Reveal>

      <Reveal delay={0.06}>
        <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {specs.map((s) => (
            <div key={s.label} className="border border-line bg-panel p-4">
              <dt className="text-[11px] uppercase tracking-[0.2em] text-smoke">{s.label}</dt>
              <dd
                className={`mt-1.5 font-semibold ${
                  isPlaceholder(s.value) ? "text-sm text-smoke/60" : "text-white"
                }`}
              >
                {s.value ?? "A confirmar"}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>

      {campaign.prizeDetails && !isPlaceholder(campaign.prizeDetails) && (
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-smoke">
            {campaign.prizeDetails}
          </p>
        </Reveal>
      )}

      <Reveal delay={0.12}>
        <p className="mt-6 max-w-2xl text-xs leading-relaxed text-smoke/60">
          As informações do veículo são confirmadas pela organização e publicadas oficialmente
          antes do encerramento das vendas. Itens marcados como “a confirmar” ainda serão
          detalhados no regulamento.
        </p>
      </Reveal>
    </section>
  );
}
