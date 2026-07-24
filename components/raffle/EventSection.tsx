import Reveal from "@/components/Reveal";
import { formatDateLong } from "@/lib/format";
import type { RaffleCampaign } from "@/lib/raffle/types";

export default function EventSection({ campaign }: { campaign: RaffleCampaign }) {
  const rows: { label: string; value: string }[] = [
    { label: "Evento", value: campaign.eventLabel ?? "A confirmar" },
    { label: "Local", value: campaign.locationLabel ?? "A confirmar" },
    {
      label: "Data da apuração",
      value: campaign.drawAt ? formatDateLong(campaign.drawAt) : "A confirmar",
    },
    { label: "Endereço", value: campaign.eventAddress ?? "A confirmar" },
  ];

  return (
    <section className="border-t border-line bg-panel/40">
      <div className="mx-auto max-w-[1360px] px-4 py-14 sm:px-6 md:py-24">
        <Reveal>
          <p className="eyebrow">O evento</p>
          <h2 className="display mt-4 text-3xl text-white sm:text-5xl md:text-6xl">
            A apuração acontece ao vivo
          </h2>
          {campaign.eventDescription && (
            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-smoke">
              {campaign.eventDescription}
            </p>
          )}
        </Reveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          <Reveal delay={0.06}>
            <dl className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
              {rows.map((r) => (
                <div key={r.label} className="bg-panel px-5 py-5">
                  <dt className="text-[11px] uppercase tracking-[0.2em] text-smoke">{r.label}</dt>
                  <dd className="mt-1.5 font-semibold text-white">{r.value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-5 text-sm leading-relaxed text-smoke">
              A entrega do prêmio ocorre durante o evento, com conferência de identidade e
              assinatura do termo de recebimento. As regras de presença do contemplado seguem o
              regulamento oficial da campanha.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex h-full flex-col justify-between border border-line bg-panel p-6">
              <div>
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-smoke">Como chegar</h3>
                <p className="mt-2 text-sm leading-relaxed text-smoke">
                  Confira a localização e planeje sua ida ao encontro da Baixudos.PR.
                </p>
              </div>
              {campaign.eventMapUrl && (
                <a
                  href={campaign.eventMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center justify-center border border-white/40 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-white transition-[border-color,color] hover:border-signal hover:text-signal"
                >
                  Abrir no mapa
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
