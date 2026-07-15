import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import { campaigns, isCampaignVisible } from "@/content/campaigns";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Campanhas",
  description:
    "Área informativa das campanhas oficiais da Baixudos.PR. A operação de cada campanha é realizada por plataforma externa autorizada.",
};

export default function CampanhasPage() {
  const visible = site.campaignsEnabled ? campaigns.filter(isCampaignVisible) : [];

  return (
    <div className="mx-auto max-w-[1360px] px-4 pb-20 pt-32 sm:px-6 md:pb-28 md:pt-40">
      <Reveal>
        <p className="eyebrow">Campanhas oficiais</p>
        <h1 className="display mt-4 max-w-3xl text-5xl text-white sm:text-6xl md:text-7xl">
          Campanhas <span className="slash-mark">Baixudos.PR</span>
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-smoke">
          Esta área apresenta campanhas oficiais envolvendo veículos ou prêmios. A participação e
          toda a operação (números, apuração e pagamentos) acontecem exclusivamente no ambiente
          da empresa responsável por cada campanha, com regulamento e documentação próprios.
        </p>
      </Reveal>

      {visible.length > 0 ? (
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {visible.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.06}>
              <Link
                href={`/campanhas/${c.slug}`}
                className="group relative block aspect-[16/10] overflow-hidden border border-line"
              >
                <Image
                  src={c.gallery[0]}
                  alt={c.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night/95 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h2 className="display text-2xl text-white">{c.name}</h2>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-smoke">
                    {c.vehicle.model} · {c.vehicle.year}
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
              Quando houver uma campanha oficial, ela será publicada aqui com regulamento,
              empresa responsável e canal de suporte. Acompanhe o {site.instagramHandle} para
              ficar por dentro.
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
