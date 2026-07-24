import { padNumber } from "@/lib/raffle/types";
import type { RaffleCampaign } from "@/lib/raffle/types";

export default function ResultBanner({ campaign }: { campaign: RaffleCampaign }) {
  if (campaign.resultNumber == null) return null;
  return (
    <section id="numeros" className="scroll-mt-24 border-y border-line bg-panel/40">
      <div className="mx-auto max-w-[1360px] px-4 py-16 text-center sm:px-6 md:py-24">
        <p className="eyebrow justify-center">Resultado da apuração</p>
        <p className="mt-4 font-mono text-sm uppercase tracking-[0.3em] text-smoke">Número contemplado</p>
        <p className="display mt-4 text-[26vw] leading-none text-signal drop-shadow-[0_0_40px_rgba(255,16,16,0.4)] sm:text-[14rem]">
          {padNumber(campaign.resultNumber, campaign.numberPadding)}
        </p>
        <p className="mt-6 text-[15px] leading-relaxed text-smoke">
          A apuração seguiu o método previsto no regulamento oficial. Parabéns ao contemplado!
        </p>
      </div>
    </section>
  );
}
