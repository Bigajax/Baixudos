import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { getRaffleCampaign, getCampaignGrid } from "@/lib/raffle/queries";
import { getCampaignPacks, getCampaignTicketOffer, getBestSellerPackId } from "@/lib/checkout/queries";
import { paymentProviderName } from "@/lib/payments";
import CampaignHero from "@/components/raffle/CampaignHero";
import HowToParticipate from "@/components/raffle/HowToParticipate";
import CampaignParticipation from "@/components/raffle/CampaignParticipation";
import ResultBanner from "@/components/raffle/ResultBanner";
import EventSection from "@/components/raffle/EventSection";
import CampaignDocs from "@/components/raffle/CampaignDocs";
import CampaignFAQ from "@/components/raffle/CampaignFAQ";
import Testimonials from "@/components/home/Testimonials";

// Rota dinâmica: a grade muda; lê do Supabase a cada request (RLS).
export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/campanhas/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  if (!site.rafflesEnabled) return {};
  const campaign = await getRaffleCampaign(slug);
  if (!campaign) return {};
  return {
    title: campaign.title,
    description: campaign.subtitle ?? campaign.description ?? undefined,
  };
}

export default async function CampanhaPage(props: PageProps<"/campanhas/[slug]">) {
  const { slug } = await props.params;
  if (!site.rafflesEnabled) notFound();

  const campaign = await getRaffleCampaign(slug);
  if (!campaign) notFound();

  const [grid, packs, ticketOffer, bestSellerId] = await Promise.all([
    getCampaignGrid(campaign.id, campaign.totalNumbers),
    getCampaignPacks(campaign.id),
    getCampaignTicketOffer(campaign.id),
    getBestSellerPackId(campaign.id),
  ]);
  const sandbox = paymentProviderName === "sandbox";

  return (
    <>
      <CampaignHero campaign={campaign} counts={grid.counts} />
      {campaign.status === "published" ? (
        <CampaignParticipation
          campaign={campaign}
          grid={grid}
          packs={packs}
          ticketOffer={ticketOffer}
          sandbox={sandbox}
          bestSellerId={bestSellerId}
        />
      ) : campaign.status === "drawn" ? (
        <ResultBanner campaign={campaign} />
      ) : (
        <section id="numeros" className="mx-auto max-w-[1360px] scroll-mt-24 px-4 py-16 text-center sm:px-6 md:py-24">
          <p className="display text-2xl text-white sm:text-3xl">Vendas encerradas</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-smoke">
            As vendas desta campanha foram encerradas. A apuração e a premiação acontecem no evento —
            acompanhe o resultado aqui.
          </p>
        </section>
      )}
      <HowToParticipate />
      <EventSection campaign={campaign} />
      <Testimonials />
      <CampaignDocs campaign={campaign} />
      <CampaignFAQ />
    </>
  );
}
