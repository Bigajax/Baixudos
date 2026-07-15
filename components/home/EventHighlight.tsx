import Image from "next/image";
import Link from "next/link";
import { nextEvent } from "@/content/events";
import { site } from "@/content/site";
import { waLink } from "@/lib/wa";
import Countdown from "@/components/Countdown";
import Reveal from "@/components/Reveal";

export default function EventHighlight() {
  const hasDate = Boolean(nextEvent.date);
  const canBuyOnSite = nextEvent.batches.some((b) => b.available && b.priceCents !== null);
  const hasTickets = Boolean(nextEvent.ticketUrl) || canBuyOnSite;
  const ticketHref = nextEvent.ticketUrl ?? `/eventos/${nextEvent.slug}`;

  return (
    <section id="proximo-evento" className="mx-auto max-w-[1360px] px-4 py-20 sm:px-6 md:py-28">
      <Reveal>
        <p className="eyebrow">Próxima edição</p>
        <h2 className="display mt-4 max-w-3xl text-4xl text-white sm:text-5xl md:text-6xl">
          O próximo encontro <span className="slash-mark">já tem nome.</span>
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <Reveal className="relative">
          <div className="relative aspect-[4/5] overflow-hidden border border-line sm:aspect-[4/4.4]">
            <Image
              src={nextEvent.cover}
              alt={`Anúncio oficial da ${nextEvent.edition} da Baixudos.PR`}
              fill
              quality={90}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <span className="display absolute left-4 top-4 bg-signal px-4 py-2 text-sm tracking-wide text-white">
              Próxima edição
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="flex flex-col justify-center">
          <h3 className="display text-3xl text-white md:text-4xl">{nextEvent.name}</h3>

          <dl className="mt-6 space-y-3 border-l-2 border-signal pl-5">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.2em] text-smoke">Data</dt>
              <dd className="text-lg font-semibold text-white">
                {hasDate
                  ? new Date(nextEvent.date!).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : nextEvent.dateLabel}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.2em] text-smoke">Local</dt>
              <dd className="text-lg font-semibold text-white">
                {nextEvent.venue} · {nextEvent.city}
                {nextEvent.mapUrl && (
                  <a
                    href={nextEvent.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 align-middle text-xs font-bold uppercase tracking-[0.1em] text-signal hover:text-white"
                  >
                    Ver no mapa →
                  </a>
                )}
              </dd>
            </div>
          </dl>

          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-smoke">
            Prepare o projeto, reúna a galera e venha viver mais uma edição da Baixudos.PR.{" "}
            {nextEvent.description}
          </p>

          {hasDate && (
            <div className="mt-7">
              <Countdown date={nextEvent.date!} />
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {hasTickets ? (
              <Link
                href={ticketHref}
                {...(nextEvent.ticketUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="inline-flex items-center justify-center bg-signal px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark"
                style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
              >
                Garantir meu ingresso
              </Link>
            ) : (
              <a
                href={site.whatsappCommunity}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-signal px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark"
                style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
              >
                Entrar na lista de avisos
              </a>
            )}
            <Link
              href="/inscrever-veiculo"
              className="inline-flex items-center justify-center border border-line px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-smoke transition-colors hover:border-signal hover:text-white"
              style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
            >
              Inscrever meu carro
            </Link>
          </div>

          <p className="mt-5 text-xs text-smoke/70">
            {nextEvent.ticketUrl
              ? "Venda por plataforma externa oficial. Informações de lotes na página do evento."
              : canBuyOnSite
                ? "1º lote disponível — o pedido é feito no site e confirmado pelo WhatsApp da organização."
                : "Ingressos ainda não estão à venda. Entre na lista para ser avisado da abertura do 1º lote."}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
