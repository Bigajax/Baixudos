import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { allEvents } from "@/content/events";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Eventos",
  description:
    "Próximas edições e histórico de eventos da Baixudos.PR em Maringá — PR. Ingressos, inscrição de veículos e galerias.",
};

const statusLabel = {
  anunciado: "Anunciado",
  ingressos: "Ingressos à venda",
  realizado: "Realizado",
} as const;

export default function EventosPage() {
  const years = [
    ...new Set(
      allEvents
        .map((e) => (e.date ? new Date(e.date).getFullYear() : null))
        .filter((y): y is number => y !== null),
    ),
  ].sort((a, b) => b - a);

  return (
    <div className="mx-auto max-w-[1360px] px-4 pb-20 pt-32 sm:px-6 md:pb-28 md:pt-40">
      <Reveal>
        <p className="eyebrow">Agenda</p>
        <h1 className="display mt-4 max-w-3xl text-5xl text-white sm:text-6xl md:text-7xl">
          Os encontros da <span className="slash-mark">Baixudos.PR</span>
        </h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-smoke">
          Próximas edições e o histórico de tudo que já aconteceu. Cada evento reúne exposição
          selecionada, marcas parceiras e a comunidade inteira.
        </p>
      </Reveal>

      {years.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {years.map((y) => (
            <span key={y} className="border border-line px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-smoke">
              {y}
            </span>
          ))}
        </div>
      )}

      <div className="mt-12 space-y-6">
        {allEvents.map((event, i) => (
          <Reveal key={event.slug} delay={i * 0.06}>
            <Link
              href={`/eventos/${event.slug}`}
              className="group grid overflow-hidden border border-line transition-colors hover:border-signal/60 md:grid-cols-[380px_1fr]"
            >
              <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[240px]">
                <Image
                  src={event.cover}
                  alt={`Capa de ${event.name}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 380px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex flex-col justify-center gap-3 bg-panel p-6 md:p-8">
                <span
                  className={`display w-fit px-3 py-1 text-xs tracking-wider ${
                    event.status === "realizado" ? "bg-graphite text-smoke" : "bg-signal text-white"
                  }`}
                >
                  {statusLabel[event.status]}
                </span>
                <h2 className="display text-3xl text-white md:text-4xl">{event.name}</h2>
                <p className="text-sm uppercase tracking-[0.16em] text-smoke">
                  {event.date
                    ? new Date(event.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
                    : event.dateLabel}{" "}
                  · {event.city}
                </p>
                <p className="max-w-2xl text-sm leading-relaxed text-smoke">{event.description}</p>
                <span className="mt-1 text-sm font-bold uppercase tracking-[0.12em] text-signal">
                  Ver detalhes →
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
