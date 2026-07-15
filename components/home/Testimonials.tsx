import { testimonials } from "@/content/testimonials";
import Reveal from "@/components/Reveal";

export default function Testimonials() {
  return (
    <section className="mx-auto max-w-[1360px] px-4 py-20 sm:px-6 md:py-28">
      <Reveal>
        <p className="eyebrow">Quem viveu</p>
        <h2 className="display mt-4 max-w-3xl text-4xl text-white sm:text-5xl md:text-6xl">
          A experiência contada <span className="slash-mark">por quem foi.</span>
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <Reveal key={`${t.role}-${i}`} delay={i * 0.07}>
            <figure className="flex h-full flex-col border border-line bg-panel p-6">
              <span aria-hidden="true" className="display text-4xl leading-none text-signal">
                “
              </span>
              <blockquote
                className={`mt-3 flex-1 text-[15px] leading-relaxed ${
                  t.placeholder ? "italic text-smoke/60" : "text-smoke"
                }`}
              >
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 border-t border-line pt-4">
                <p className="text-sm font-semibold text-white">{t.author}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-smoke">{t.role}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
      <p className="mt-6 text-xs text-smoke/60">
        Os depoimentos acima são espaços reservados e serão substituídos por relatos reais
        autorizados pelos participantes.
      </p>
    </section>
  );
}
