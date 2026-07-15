import Image from "next/image";
import Link from "next/link";
import { editions } from "@/content/editions";
import Reveal from "@/components/Reveal";

export default function Editions() {
  return (
    <section className="mx-auto max-w-[1360px] px-4 py-20 sm:px-6 md:py-28">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Edições anteriores</p>
            <h2 className="display mt-4 max-w-3xl text-4xl text-white sm:text-5xl md:text-6xl">
              Cada edição deixa <span className="slash-mark">uma história.</span>
            </h2>
          </div>
          <Link
            href="/eventos"
            className="text-sm font-bold uppercase tracking-[0.12em] text-signal transition-colors hover:text-white"
          >
            Ver todas →
          </Link>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {editions.map((ed, i) => (
          <Reveal key={ed.slug} delay={i * 0.08}>
            <Link
              href={`/eventos/${ed.slug}`}
              className="group relative block aspect-[16/10] overflow-hidden border border-line"
            >
              <Image
                src={ed.cover}
                alt={`Capa da ${ed.name} da Baixudos.PR`}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/10 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                <div>
                  <h3 className="display text-2xl text-white md:text-3xl">{ed.name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-smoke">
                    {ed.dateLabel} · {ed.venue}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className="display text-signal opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                >
                  →
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
