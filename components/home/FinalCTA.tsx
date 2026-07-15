import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import LeadForm from "@/components/forms/LeadForm";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden">
      <Image
        src="/images/hero-8a-edicao-b.jpg"
        alt=""
        aria-hidden="true"
        fill
        quality={90}
        sizes="100vw"
        className="object-cover object-[center_30%]"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-night/70" />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 speedline" />

      <div className="relative z-10 mx-auto max-w-[1360px] px-4 py-20 sm:px-6 md:py-28">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <Reveal>
            <p className="eyebrow">Faça parte</p>
            <h2 className="display mt-4 text-4xl text-white sm:text-5xl md:text-6xl">
              A próxima edição começa antes mesmo dos{" "}
              <span className="slash-mark">portões abrirem.</span>
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-smoke">
              Faça parte da comunidade e receba as novidades da Baixudos.PR.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/eventos"
                className="inline-flex items-center justify-center bg-signal px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark"
                style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
              >
                Ver próximo evento
              </Link>
              <a
                href="#lista-avisos"
                className="inline-flex items-center justify-center border border-white/40 px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:border-signal hover:text-signal"
                style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
              >
                Entrar para a comunidade
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div id="lista-avisos" className="border border-line bg-night/90 p-6 backdrop-blur-sm md:p-8">
              <h3 className="display text-xl text-white">Lista de avisos</h3>
              <p className="mt-2 text-sm text-smoke">
                Deixe seu contato para receber a abertura de lotes e novidades da próxima edição.
              </p>
              <LeadForm />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
