import Reveal from "@/components/Reveal";
import { howToSteps } from "@/content/raffle";

export default function HowToParticipate() {
  return (
    <section className="mx-auto max-w-[1360px] px-4 py-14 sm:px-6 md:py-24">
      <Reveal>
        <p className="eyebrow">Como participar</p>
        <h2 className="display mt-4 text-3xl text-white sm:text-5xl md:text-6xl">
          Da escolha ao <span className="slash-mark">resultado</span>
        </h2>
      </Reveal>

      <ol className="mt-10 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {howToSteps.map((step, i) => (
          <Reveal key={step.title} delay={Math.min(i * 0.05, 0.3)}>
            <li className="flex h-full gap-4 bg-panel p-6">
              <span className="display shrink-0 font-mono text-2xl leading-none text-signal tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-[15px] font-semibold text-white">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-smoke">{step.description}</p>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
