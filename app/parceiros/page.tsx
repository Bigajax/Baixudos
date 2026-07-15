import type { Metadata } from "next";
import Image from "next/image";
import PartnerForm from "@/components/forms/PartnerForm";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Parceiros e patrocinadores",
  description:
    "Conecte sua marca à comunidade automotiva da Baixudos.PR: patrocínio, estandes, exposição de produtos e ativações em Maringá — PR.",
};

const formats = [
  {
    title: "Patrocínio de edição",
    text: "Sua marca integrada à comunicação oficial do evento: palco, painéis, conteúdo e divulgação.",
  },
  {
    title: "Estande e exposição",
    text: "Espaço físico dentro do evento para apresentar produtos e serviços direto ao público automotivo.",
  },
  {
    title: "Alimentação",
    text: "Operação de food trucks e pontos de alimentação para um público que passa o dia inteiro no evento.",
  },
  {
    title: "Mídia e conteúdo",
    text: "Cobertura, ativações com influenciadores e presença nos canais digitais da marca.",
  },
];

const audience = [
  { label: "Comunidade digital", value: "+93 mil seguidores" },
  { label: "Edições realizadas", value: "8" },
  { label: "Origem do público", value: "Maringá e região" },
  { label: "Alcance por edição", value: "+[NÚMERO] pessoas" },
];

export default function ParceirosPage() {
  return (
    <div className="pb-20 md:pb-28">
      <section className="relative overflow-hidden">
        <Image
          src="/images/leao-atacadista.jpg"
          alt=""
          aria-hidden="true"
          fill
          quality={90}
          sizes="100vw"
          className="object-cover object-[center_35%]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-night/90 via-night/60 to-night/30" />
        <div className="relative z-10 mx-auto max-w-[1360px] px-4 pb-14 pt-32 sm:px-6 md:pt-40">
          <Reveal>
            <p className="eyebrow">Comercial</p>
            <h1 className="display mt-4 max-w-4xl text-5xl text-white sm:text-6xl md:text-7xl">
              Coloque sua marca no <span className="slash-mark">próximo evento.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-smoke">
              Conecte sua empresa a uma comunidade apaixonada por carros, personalização e
              experiências automotivas — com estrutura profissional de evento e presença digital
              ativa o ano inteiro.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-[1360px] px-4 sm:px-6">
        {/* Perfil do público */}
        <section className="mt-16">
          <Reveal>
            <h2 className="eyebrow mb-6">Perfil do público</h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {audience.map((a, i) => (
              <Reveal key={a.label} delay={i * 0.05}>
                <div className="border border-line bg-panel px-5 py-6">
                  <p className="display text-2xl text-white md:text-3xl">{a.value}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-smoke">{a.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-4 text-xs text-smoke/70">
            Métricas entre colchetes são preenchidas pela organização com os dados reais de cada
            edição — nenhum número de alcance é estimado sem fonte.
          </p>
        </section>

        {/* Formatos */}
        <section className="mt-16">
          <Reveal>
            <h2 className="eyebrow mb-6">Formatos de participação</h2>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-2">
            {formats.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.05}>
                <div className="group h-full border border-line bg-panel p-6 transition-colors hover:border-signal/60 md:p-8">
                  <span aria-hidden="true" className="block h-[3px] w-8 -skew-x-12 bg-signal" />
                  <h3 className="display mt-4 text-2xl text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-smoke">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Presença digital + ativação */}
        <section className="mt-16 grid gap-4 md:grid-cols-2">
          <Reveal>
            <div className="relative aspect-[16/10] overflow-hidden border border-line">
              <Image
                src="/images/hero-8a-edicao.jpg"
                alt="Painel de patrocinadores da 8ª edição Baixudos.PR"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.06} className="flex flex-col justify-center border border-line bg-panel p-6 md:p-10">
            <h2 className="display text-3xl text-white">Presença digital e cobertura</h2>
            <p className="mt-3 text-sm leading-relaxed text-smoke">
              Além do dia do evento, a Baixudos.PR produz conteúdo o ano inteiro para uma
              comunidade de mais de 93 mil seguidores. Marcas parceiras aparecem na comunicação
              oficial, na cobertura das edições e nas ativações com criadores de conteúdo do
              cenário automotivo.
            </p>
          </Reveal>
        </section>

        {/* Formulário */}
        <section className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <h2 className="display text-4xl text-white sm:text-5xl">
              Vamos <span className="slash-mark">conversar?</span>
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-smoke">
              Preencha o formulário e a equipe comercial retorna com os formatos, espaços e
              condições da próxima edição.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="border border-line bg-panel p-6 md:p-8">
              <PartnerForm />
            </div>
          </Reveal>
        </section>
      </div>
    </div>
  );
}
