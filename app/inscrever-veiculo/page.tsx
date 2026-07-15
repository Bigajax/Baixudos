import type { Metadata } from "next";
import Image from "next/image";
import VehicleForm from "@/components/forms/VehicleForm";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Inscrever meu veículo",
  description:
    "Cadastre seu projeto para participar da seleção de veículos da próxima edição Baixudos.PR em Maringá — PR.",
};

export default function InscreverVeiculoPage() {
  return (
    <div className="pb-20 md:pb-28">
      <section className="relative overflow-hidden">
        <Image
          src="/images/noturno-jetta.jpg"
          alt=""
          aria-hidden="true"
          fill
          quality={90}
          sizes="100vw"
          className="object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-night/85 via-night/55 to-night/30" />
        <div className="relative z-10 mx-auto max-w-[1360px] px-4 pb-14 pt-32 sm:px-6 md:pt-40">
          <Reveal>
            <p className="eyebrow">Inscrição de veículos</p>
            <h1 className="display mt-4 max-w-3xl text-5xl text-white sm:text-6xl md:text-7xl">
              Seu projeto merece <span className="slash-mark">fazer parte.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-smoke">
              Cadastre seu veículo para participar da seleção de projetos da próxima edição
              Baixudos.PR. A equipe avalia cada inscrição e responde pelo WhatsApp.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-[900px] px-4 sm:px-6">
        <Reveal delay={0.08}>
          <div className="mt-12 border border-line bg-panel p-6 md:p-10">
            <VehicleForm />
          </div>
        </Reveal>
        <p className="mt-6 text-xs leading-relaxed text-smoke/70">
          Seus dados são usados exclusivamente pela organização para a avaliação do projeto e o
          contato sobre o evento, conforme a Política de Privacidade.
        </p>
      </div>
    </div>
  );
}
