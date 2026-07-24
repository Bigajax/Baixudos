import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import { listRaffleCampaigns } from "@/lib/raffle/queries";
import { formatPrice } from "@/lib/format";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Campanhas",
  description:
    "Campanhas de números da sorte da Baixudos.PR. Escolha seus números, participe e acompanhe a apuração no evento.",
};

export default async function CampanhasPage() {
  const campaigns = site.rafflesEnabled ? await listRaffleCampaigns() : [];

  return (
    <div className="mx-auto max-w-[1360px] px-4 pb-20 pt-32 sm:px-6 md:pb-28 md:pt-40">
      <Reveal>
        <p className="eyebrow">Campanhas</p>
        <h1 className="display mt-4 max-w-3xl text-5xl text-white sm:text-6xl md:text-7xl">
          Números da <span className="slash-mark">sorte</span>
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-smoke">
          Concorra a prêmios da Baixudos.PR escolhendo seus próprios números. Pagamento via Pix,
          reserva garantida e apuração ao vivo durante os eventos.
        </p>
      </Reveal>

      {campaigns.length > 0 ? (
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {campaigns.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.06}>
              <Link
                href={`/campanhas/${c.slug}`}
                className="group relative block aspect-[16/10] overflow-hidden border border-line"
              >
                {c.highlightImageUrl && (
                  <Image
                    src={c.highlightImageUrl}
                    alt={c.prizeTitle}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                )}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-night/95 via-night/40 to-transparent"
                />
                {c.isDemo && (
                  <span className="absolute right-3 top-3 border border-signal/50 bg-night/70 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-signal">
                    Demonstração
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h2 className="display text-2xl text-white">{c.title}</h2>
                  <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-smoke">
                    {formatPrice(c.priceCents)} / número ·{" "}
                    {c.totalNumbers.toLocaleString("pt-BR")} números
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      ) : (
        <Reveal delay={0.08}>
          <div className="mt-12 border border-line bg-panel p-8 text-center md:p-14">
            <p className="display text-2xl text-white md:text-3xl">
              Nenhuma campanha ativa no momento.
            </p>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-smoke">
              Quando uma nova campanha for aberta, ela aparece aqui com o prêmio, o valor de cada
              número e a data da apuração. Acompanhe o {site.instagramHandle} para não perder.
            </p>
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center justify-center bg-signal px-7 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark"
            >
              Seguir no Instagram
            </a>
          </div>
        </Reveal>
      )}
    </div>
  );
}
