import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { campaigns, getCampaign, isCampaignVisible } from "@/content/campaigns";
import Reveal from "@/components/Reveal";
import FAQ from "@/components/FAQ";

export function generateStaticParams() {
  if (!site.campaignsEnabled) return [];
  return campaigns.filter(isCampaignVisible).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: PageProps<"/campanhas/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const campaign = site.campaignsEnabled ? getCampaign(slug) : undefined;
  if (!campaign) return {};
  return { title: campaign.name };
}

export default async function CampanhaPage(props: PageProps<"/campanhas/[slug]">) {
  const { slug } = await props.params;
  const campaign = site.campaignsEnabled ? getCampaign(slug) : undefined;
  if (!campaign) notFound();

  const { vehicle, compliance } = campaign;

  return (
    <div className="mx-auto max-w-[1360px] px-4 pb-20 pt-32 sm:px-6 md:pb-28 md:pt-40">
      <Reveal>
        <p className="eyebrow">Campanha oficial</p>
        <h1 className="display mt-4 max-w-4xl text-5xl text-white sm:text-6xl md:text-7xl">
          {campaign.name}
        </h1>
      </Reveal>

      {/* Galeria */}
      <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3">
        {campaign.gallery.map((src, i) => (
          <Reveal key={src} delay={Math.min(i * 0.04, 0.2)}>
            <div
              className={`relative overflow-hidden border border-line ${
                i === 0 ? "col-span-2 aspect-[16/9] md:row-span-2 md:aspect-auto md:h-full" : "aspect-[4/3]"
              }`}
            >
              <Image
                src={src}
                alt={`${vehicle.model} — foto ${i + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_380px]">
        <div className="space-y-12">
          <Reveal>
            <h2 className="eyebrow mb-5">O veículo</h2>
            <dl className="grid gap-3 sm:grid-cols-3">
              <div className="border border-line bg-panel p-4">
                <dt className="text-[11px] uppercase tracking-[0.2em] text-smoke">Modelo</dt>
                <dd className="mt-1 font-semibold text-white">{vehicle.model}</dd>
              </div>
              <div className="border border-line bg-panel p-4">
                <dt className="text-[11px] uppercase tracking-[0.2em] text-smoke">Ano</dt>
                <dd className="mt-1 font-semibold text-white">{vehicle.year}</dd>
              </div>
              <div className="border border-line bg-panel p-4">
                <dt className="text-[11px] uppercase tracking-[0.2em] text-smoke">Motorização</dt>
                <dd className="mt-1 font-semibold text-white">{vehicle.engine}</dd>
              </div>
            </dl>
            {vehicle.modifications.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {vehicle.modifications.map((m) => (
                  <li key={m} className="border border-line px-3 py-1 text-xs uppercase tracking-wider text-smoke">
                    {m}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-smoke">{vehicle.story}</p>
          </Reveal>

          {campaign.faq.length > 0 && (
            <Reveal>
              <h2 className="eyebrow mb-5">Perguntas frequentes</h2>
              <FAQ items={campaign.faq} />
            </Reveal>
          )}
        </div>

        <aside>
          <Reveal delay={0.08}>
            <div className="sticky top-24 space-y-5 border border-line bg-panel p-6">
              <div>
                <h2 className="text-[11px] uppercase tracking-[0.2em] text-smoke">Empresa responsável</h2>
                <p className="mt-1 font-semibold text-white">{compliance.promoterCompany}</p>
                <p className="text-sm text-smoke">{compliance.legalName}</p>
                <p className="text-sm text-smoke">CNPJ {compliance.cnpj}</p>
              </div>
              <div>
                <h2 className="text-[11px] uppercase tracking-[0.2em] text-smoke">Período</h2>
                <p className="mt-1 text-sm text-white">{compliance.period}</p>
              </div>
              <div>
                <h2 className="text-[11px] uppercase tracking-[0.2em] text-smoke">Apuração</h2>
                <p className="mt-1 text-sm text-white">{compliance.drawMethod}</p>
              </div>

              <a
                href={campaign.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-signal py-4 text-center text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark"
              >
                Acessar campanha oficial
              </a>
              <p className="text-xs leading-relaxed text-smoke/80">
                A participação e a operação são realizadas no ambiente da empresa responsável.
              </p>

              <div className="space-y-2 border-t border-line pt-4 text-sm">
                <a href={compliance.regulationPdf} target="_blank" rel="noopener noreferrer" className="block text-smoke underline-offset-4 hover:text-white hover:underline">
                  Regulamento (PDF)
                </a>
                <a href={compliance.privacyPolicyUrl} target="_blank" rel="noopener noreferrer" className="block text-smoke underline-offset-4 hover:text-white hover:underline">
                  Política de privacidade
                </a>
                <a href={compliance.termsUrl} target="_blank" rel="noopener noreferrer" className="block text-smoke underline-offset-4 hover:text-white hover:underline">
                  Termos de uso
                </a>
                <p className="pt-1 text-xs text-smoke/70">Suporte: {compliance.supportChannel}</p>
              </div>
            </div>
          </Reveal>
        </aside>
      </div>
    </div>
  );
}
