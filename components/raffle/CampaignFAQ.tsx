import Reveal from "@/components/Reveal";
import FAQ from "@/components/FAQ";
import { raffleFaq } from "@/content/raffle";

export default function CampaignFAQ() {
  return (
    <section className="mx-auto max-w-[900px] px-4 py-14 sm:px-6 md:py-24">
      <Reveal>
        <p className="eyebrow">Perguntas frequentes</p>
        <h2 className="display mt-4 text-3xl text-white sm:text-5xl md:text-6xl">
          Antes de <span className="slash-mark">participar</span>
        </h2>
      </Reveal>
      <Reveal delay={0.06}>
        <div className="mt-8">
          <FAQ items={raffleFaq} />
        </div>
      </Reveal>
    </section>
  );
}
