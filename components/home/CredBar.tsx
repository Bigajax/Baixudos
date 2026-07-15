import { site } from "@/content/site";

/** Barra de credibilidade — faixa de "timing" de autódromo com cortes diagonais. */
export default function CredBar() {
  return (
    <section aria-label="Números da Baixudos.PR" className="relative border-y border-line bg-panel">
      <div className="speedline absolute inset-x-0 top-0" aria-hidden="true" />
      <div className="mx-auto grid max-w-[1360px] grid-cols-2 lg:grid-cols-4">
        {site.stats.map((s, i) => (
          <div
            key={s.label}
            className={`group relative flex items-center gap-3 px-4 py-5 transition-colors hover:bg-graphite md:gap-4 md:px-8 md:py-7 ${
              i % 2 === 1 ? "border-l border-line" : ""
            } ${i > 1 ? "border-t border-line lg:border-t-0" : ""} ${
              i === 2 ? "lg:border-l" : ""
            }`}
          >
            <span
              aria-hidden="true"
              className="h-8 w-[3px] shrink-0 -skew-x-[20deg] bg-signal transition-transform duration-300 group-hover:scale-y-125 md:h-10"
            />
            <div className="min-w-0">
              <p className="display text-xl leading-none text-white md:text-[34px]">{s.value}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-smoke md:mt-1.5 md:text-[11px] md:tracking-[0.18em]">
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
