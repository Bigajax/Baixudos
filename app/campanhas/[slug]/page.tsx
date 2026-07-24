import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { getRaffleCampaign, getCampaignGrid } from "@/lib/raffle/queries";
import { getCampaignPacks, getCampaignTicketOffer } from "@/lib/checkout/queries";
import { paymentProviderName } from "@/lib/payments";
import CampaignHero from "@/components/raffle/CampaignHero";
import HowToParticipate from "@/components/raffle/HowToParticipate";
import CampaignParticipation from "@/components/raffle/CampaignParticipation";
import EventSection from "@/components/raffle/EventSection";
import CampaignDocs from "@/components/raffle/CampaignDocs";
import CampaignFAQ from "@/components/raffle/CampaignFAQ";

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

  const [grid, packs, ticketOffer] = await Promise.all([
    getCampaignGrid(campaign.id, campaign.totalNumbers),
    getCampaignPacks(campaign.id),
    getCampaignTicketOffer(campaign.id),
  ]);
  const sandbox = paymentProviderName === "sandbox";

  return (
    <>
      <CampaignHero campaign={campaign} counts={grid.counts} />
      <CampaignParticipation
        campaign={campaign}
        grid={grid}
        packs={packs}
        ticketOffer={ticketOffer}
        sandbox={sandbox}
      />
      <HowToParticipate />
      <EventSection campaign={campaign} />
      <CampaignDocs campaign={campaign} />
      <CampaignFAQ />
    </>
  );
}
