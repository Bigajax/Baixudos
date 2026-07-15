import Hero from "@/components/home/Hero";
import CredBar from "@/components/home/CredBar";
import EventHighlight from "@/components/home/EventHighlight";
import ExperienceGrid from "@/components/home/ExperienceGrid";
import VideoSection from "@/components/home/VideoSection";
import VehicleCTA from "@/components/home/VehicleCTA";
import Editions from "@/components/home/Editions";
import Community from "@/components/home/Community";
import ShopPreview from "@/components/home/ShopPreview";
import Sponsors from "@/components/home/Sponsors";
import Testimonials from "@/components/home/Testimonials";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/home/FinalCTA";
import Reveal from "@/components/Reveal";
import { faq } from "@/content/faq";

export default function Home() {
  return (
    <>
      <Hero />
      <CredBar />
      <EventHighlight />
      <ExperienceGrid />
      <VideoSection />
      <VehicleCTA />
      <Editions />
      <Community />
      <ShopPreview />
      <Sponsors />
      <Testimonials />

      <section className="mx-auto w-full max-w-[900px] px-4 pb-20 sm:px-6 md:pb-28">
        <Reveal>
          <p className="eyebrow">Dúvidas</p>
          <h2 className="display mt-4 text-4xl text-white sm:text-5xl">
            Perguntas <span className="slash-mark">frequentes.</span>
          </h2>
        </Reveal>
        <div className="mt-10">
          <FAQ items={faq} />
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
