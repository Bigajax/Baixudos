import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "A história e o posicionamento da Baixudos.PR: uma comunidade e marca automotiva de Maringá, Paraná — de Maringá pro mundo.",
};

const pillars = [
  {
    title: "Comunidade",
    text: "Pessoas, projetos e histórias conectadas pela mesma paixão — dentro e fora dos eventos.",
  },
  {
    title: "Eventos",
    text: "Edições com estrutura profissional: exposição selecionada, marcas, som e entretenimento.",
  },
  {
    title: "Conteúdo",
    text: "Produção diária que movimenta mais de 93 mil seguidores e leva a cena de Maringá pro Brasil.",
  },
  {
    title: "Marca",
    text: "Produtos oficiais e parcerias com oficinas, lojas e empresas de todo o setor automotivo.",
  },
];

export default function SobrePage() {
  return (
    <div className="pb-20 md:pb-28">
      <section className="relative flex min-h-[65vh] items-end overflow-hidden">
        <Image
          src="/images/golf-ceu.jpg"
          alt="Projeto rebaixado da comunidade Baixudos.PR sob céu dramático"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-[center_60%]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-night/5" />
        <div className="relative z-10 mx-auto w-full max-w-[1360px] px-4 pb-14 pt-40 sm:px-6">
          <Reveal>
            <p className="eyebrow">Sobre a Baixudos.PR</p>
            <h1 className="display mt-4 max-w-4xl text-5xl text-white sm:text-6xl md:text-7xl">
              De Maringá <span className="slash-mark">pro mundo.</span>
            </h1>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-[1360px] px-4 sm:px-6">
        <section className="mt-16 grid gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 className="display text-3xl text-white md:text-4xl">
              Não é apenas um encontro de carros.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="space-y-4 text-[15px] leading-relaxed text-smoke">
              <p>
                A Baixudos.PR nasceu em Maringá, no Paraná, da paixão por carros rebaixados e
                projetos personalizados — e cresceu até se tornar uma comunidade que reúne
                pessoas, projetos, marcas e experiências em torno da cultura automotiva.
              </p>
              <p>
                Já são <strong className="text-white">8 edições realizadas</strong> e uma
                comunidade de mais de <strong className="text-white">{site.followers} seguidores</strong>{" "}
                acompanhando conteúdo, encontros e grandes eventos. Carros, pessoas e histórias
                que movimentam uma comunidade inteira.
              </p>
              <p>
                O compromisso é o mesmo desde o começo: estrutura profissional, curadoria de
                projetos e orgulho de representar Maringá e o Paraná.
              </p>
            </div>
          </Reveal>
        </section>

        <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.05}>
              <div className="h-full border border-line bg-panel p-6">
                <span aria-hidden="true" className="block h-[3px] w-8 -skew-x-12 bg-signal" />
                <h3 className="display mt-4 text-2xl text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-smoke">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </section>

        <section className="mt-16 grid gap-3 md:grid-cols-3">
          {["/images/hero-8a-edicao.jpg", "/images/publico-pavilhao.jpg", "/images/gramado-tendas.jpg"].map(
            (src, i) => (
              <Reveal key={src} delay={i * 0.05}>
                <div className="relative aspect-[4/3] overflow-hidden border border-line">
                  <Image
                    src={src}
                    alt={`Registro dos eventos Baixudos.PR ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            ),
          )}
        </section>

        <Reveal delay={0.06}>
          <section className="mt-16 border border-line bg-panel p-8 text-center md:p-14">
            <h2 className="display mx-auto max-w-2xl text-3xl text-white md:text-4xl">
              A cultura automotiva tem um <span className="text-signal">ponto de encontro.</span>
            </h2>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/eventos"
                className="inline-flex items-center justify-center bg-signal px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark"
                style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
              >
                Ver próximo evento
              </Link>
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center border border-line px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-smoke transition-colors hover:border-signal hover:text-white"
                style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
              >
                Seguir {site.instagramHandle}
              </a>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
