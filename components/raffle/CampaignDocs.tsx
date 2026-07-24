import Reveal from "@/components/Reveal";
import type { RaffleCampaign } from "@/lib/raffle/types";

export default function CampaignDocs({ campaign }: { campaign: RaffleCampaign }) {
  const docs: { label: string; href: string | null }[] = [
    { label: "Regulamento oficial", href: campaign.regulationUrl },
    { label: "Certificado / autorização", href: campaign.certificateUrl },
    { label: "Política de privacidade", href: campaign.privacyPolicyUrl ?? "/politica-de-privacidade" },
    { label: "Termos de uso", href: campaign.termsUrl ?? "/termos-de-uso" },
  ];

  return (
    <section className="mx-auto max-w-[1360px] px-4 py-14 sm:px-6 md:py-24">
      <Reveal>
        <p className="eyebrow">Documentação e transparência</p>
        <h2 className="display mt-4 text-3xl text-white sm:text-5xl md:text-6xl">
          Tudo às <span className="slash-mark">claras</span>
        </h2>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-smoke">
          Consulte os documentos oficiais da campanha antes de participar. O regulamento é a fonte
          da verdade sobre participação, apuração e entrega do prêmio.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <Reveal delay={0.06}>
          <ul className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
            {docs.map((d) => (
              <li key={d.label} className="bg-panel">
                {d.href ? (
                  <a
                    href={d.href}
                    target={d.href.startsWith("http") || d.href.endsWith(".pdf") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-4 px-5 py-5 transition-colors hover:bg-graphite"
                  >
                    <span className="text-[15px] font-semibold text-white">{d.label}</span>
                    <span
                      aria-hidden="true"
                      className="text-smoke transition-colors group-hover:text-signal"
                    >
                      →
                    </span>
                  </a>
                ) : (
                  <div className="flex items-center justify-between gap-4 px-5 py-5">
                    <span className="text-[15px] font-semibold text-smoke/60">{d.label}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-smoke/50">
                      Em breve
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="border border-line bg-panel p-6">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-smoke">Atendimento oficial</h3>
            <p className="mt-2 text-sm leading-relaxed text-white">
              {campaign.supportChannel ?? "Canal de suporte a confirmar"}
            </p>
            <p className="mt-4 text-xs leading-relaxed text-smoke/70">
              Em caso de dúvidas sobre sua participação, procure sempre os canais oficiais da
              Baixudos.PR.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
