import Image from "next/image";
import Link from "next/link";
import { sponsors, sponsorTiers } from "@/content/sponsors";
import Reveal from "@/components/Reveal";

export default function Sponsors() {
  const hasSponsors = sponsors.length > 0;

  return (
    <section className="diag-top bg-graphite">
      <div className="mx-auto max-w-[1360px] px-4 pb-20 sm:px-6 md:pb-28">
        <Reveal>
          <p className="eyebrow">Parceiros</p>
          <h2 className="display mt-4 max-w-3xl text-4xl text-white sm:text-5xl md:text-6xl">
            As marcas que movimentam <span className="slash-mark">essa experiência.</span>
          </h2>
        </Reveal>

        {hasSponsors ? (
          <div className="mt-12 space-y-10">
            {sponsorTiers.map((tier) => {
              const list = sponsors.filter((s) => s.tier === tier);
              if (list.length === 0) return null;
              return (
                <div key={tier}>
                  <h3 className="eyebrow mb-5">{tier}</h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                    {list.map((s) => (
                      <div
                        key={s.name}
                        className="flex aspect-[3/2] items-center justify-center border border-line bg-panel p-4"
                      >
                        <Image
                          src={s.logo}
                          alt={s.name}
                          width={140}
                          height={70}
                          className="max-h-full w-auto object-contain opacity-80 transition-opacity hover:opacity-100"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Reveal delay={0.08}>
            <p className="mt-8 max-w-xl text-[15px] leading-relaxed text-smoke">
              Os patrocinadores e expositores da próxima edição serão anunciados aqui. Sua marca
              pode ser uma delas.
            </p>
          </Reveal>
        )}

        <Reveal delay={0.12}>
          <div className="mt-14 border border-line bg-panel p-8 md:p-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="display text-2xl text-white sm:text-3xl md:text-4xl">
                  Coloque sua marca no <span className="text-signal">próximo evento.</span>
                </h3>
                <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-smoke">
                  Conecte sua empresa a uma comunidade apaixonada por carros, personalização e
                  experiências automotivas.
                </p>
              </div>
              <Link
                href="/parceiros"
                className="inline-flex shrink-0 items-center justify-center bg-signal px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark"
                style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
              >
                Quero ser parceiro
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
