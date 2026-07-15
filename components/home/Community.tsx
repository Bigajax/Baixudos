import Image from "next/image";
import { site } from "@/content/site";
import Reveal from "@/components/Reveal";

const feed = [
  { src: "/images/comboio-chuva.jpg", alt: "Comboio de carros rebaixados na avenida em dia de chuva" },
  { src: "/images/noturno-jetta.jpg", alt: "Projeto rebaixado fotografado à noite na rua" },
  { src: "/images/comunidade-reflexo.jpg", alt: "Casal fotografando o reflexo do próprio projeto" },
  { src: "/images/golf-ceu.jpg", alt: "Golf rebaixado sob céu dramático" },
  { src: "/images/saveiro-rua.jpg", alt: "Saveiro rebaixada estacionada na rua" },
  { src: "/images/audi-flor.jpg", alt: "Projeto branco sob árvore florida" },
];

export default function Community() {
  return (
    <section className="diag-top bg-panel">
      <div className="mx-auto max-w-[1360px] px-4 pb-20 sm:px-6 md:pb-28">
        <Reveal>
          <p className="eyebrow">Comunidade</p>
          <h2 className="display mt-4 max-w-3xl text-4xl text-white sm:text-5xl md:text-6xl">
            Uma comunidade que <span className="slash-mark">não para de crescer.</span>
          </h2>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-smoke">
            Projetos, histórias e pessoas conectadas pela mesma paixão. São mais de{" "}
            <strong className="text-white">{site.followers} seguidores</strong> acompanhando a
            Baixudos.PR todos os dias.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {feed.map((f, i) => (
            <Reveal key={f.src} delay={Math.min(i * 0.05, 0.25)}>
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square overflow-hidden border border-line"
                aria-label={`${f.alt} — abrir Instagram da Baixudos.PR`}
              >
                <Image
                  src={f.src}
                  alt={f.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-signal/0 transition-colors duration-300 group-hover:bg-signal/20"
                />
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-signal px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark"
              style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
            >
              Seguir {site.instagramHandle}
            </a>
            <a
              href={site.whatsappCommunity}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center border border-line px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-smoke transition-colors hover:border-signal hover:text-white"
              style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
            >
              Entrar no grupo oficial
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
