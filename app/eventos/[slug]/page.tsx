import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allEvents, getEvent } from "@/content/events";
import { site } from "@/content/site";
import { waLink } from "@/lib/wa";
import Countdown from "@/components/Countdown";
import TicketCheckout from "@/components/TicketCheckout";
import Reveal from "@/components/Reveal";

export function generateStaticParams() {
  return allEvents.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata(props: PageProps<"/eventos/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const event = getEvent(slug);
  if (!event) return {};
  return {
    title: event.name,
    description: event.description,
    openGraph: { images: [{ url: event.cover }] },
  };
}

export default async function EventoPage(props: PageProps<"/eventos/[slug]">) {
  const { slug } = await props.params;
  const event = getEvent(slug);
  if (!event) notFound();

  const hasDate = Boolean(event.date);
  const isPast = event.status === "realizado";
  const hasTickets = event.batches.some((b) => b.available && b.priceCents !== null);

  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: event.description,
    eventStatus: "https://schema.org/EventScheduled",
    ...(hasDate ? { startDate: event.date } : {}),
    location: {
      "@type": "Place",
      name: event.venue,
      address: { "@type": "PostalAddress", addressLocality: site.city, addressRegion: site.stateShort, addressCountry: "BR" },
    },
    organizer: { "@type": "Organization", name: "Baixudos.PR", url: site.instagram },
    image: event.cover,
  };

  return (
    <div className="pb-20 md:pb-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }} />

      {/* Capa */}
      <section className="relative flex min-h-[60vh] items-end overflow-hidden">
        <Image
          src={event.cover}
          alt={`Capa de ${event.name}`}
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night via-night/25 to-night/5" />
        <div className="relative z-10 mx-auto w-full max-w-[1360px] px-4 pb-12 pt-40 sm:px-6">
          <p className="eyebrow">{isPast ? "Edição realizada" : "Próxima edição"}</p>
          <h1 className="display mt-4 max-w-4xl text-5xl text-white sm:text-6xl md:text-7xl">{event.name}</h1>
        </div>
      </section>

      <div className="mx-auto max-w-[1360px] px-4 sm:px-6">
        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_380px]">
          <div>
            <Reveal>
              <p className="max-w-2xl text-base leading-relaxed text-smoke">{event.description}</p>
            </Reveal>

            {event.gallery.length > 1 && (
              <div className="mt-12">
                <h2 className="eyebrow mb-6">Galeria</h2>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {event.gallery.map((src, i) => (
                    <Reveal key={src} delay={Math.min(i * 0.04, 0.2)}>
                      <div className="relative aspect-[4/5] overflow-hidden border border-line">
                        <Image
                          src={src}
                          alt={`Foto ${i + 1} de ${event.name}`}
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 hover:scale-[1.04]"
                        />
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside>
            <Reveal delay={0.08}>
              <div className="sticky top-24 space-y-6 border border-line bg-panel p-6">
                <dl className="space-y-4">
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.2em] text-smoke">Data</dt>
                    <dd className="text-lg font-semibold text-white">
                      {hasDate
                        ? new Date(event.date!).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
                        : event.dateLabel}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.2em] text-smoke">Horário</dt>
                    <dd className="text-lg font-semibold text-white">{event.timeLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.2em] text-smoke">Local</dt>
                    <dd className="text-lg font-semibold text-white">{event.venue}</dd>
                    <dd className="text-sm text-smoke">{event.city}</dd>
                  </div>
                </dl>

                {hasDate && !isPast && <Countdown date={event.date!} />}

                {!isPast &&
                  (event.ticketUrl ? (
                    <a
                      href={event.ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-signal py-4 text-center text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark"
                    >
                      Garantir meu ingresso
                    </a>
                  ) : hasTickets ? (
                    <TicketCheckout event={event} />
                  ) : (
                    <div>
                      <p className="border border-line bg-night p-4 text-sm text-smoke">
                        Uma nova edição está sendo preparada. Os ingressos ainda não estão à venda.
                      </p>
                      <a
                        href={site.whatsappCommunity}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 block bg-signal py-4 text-center text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark"
                      >
                        Entrar na lista de avisos
                      </a>
                    </div>
                  ))}

                {event.mapUrl && (
                  <a
                    href={event.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border border-line py-3.5 text-center text-sm font-bold uppercase tracking-[0.12em] text-smoke transition-colors hover:border-signal hover:text-white"
                  >
                    Abrir localização
                  </a>
                )}

                <Link
                  href="/inscrever-veiculo"
                  className="block border border-line py-3.5 text-center text-sm font-bold uppercase tracking-[0.12em] text-smoke transition-colors hover:border-signal hover:text-white"
                >
                  Inscrever meu carro
                </Link>

                {!isPast && (
                  <a
                    href={waLink(site.whatsappMessages.eventos)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-xs text-smoke/70 underline-offset-4 hover:underline"
                  >
                    Dúvidas? Fale com a organização
                  </a>
                )}
              </div>
            </Reveal>
          </aside>
        </div>
      </div>
    </div>
  );
}
