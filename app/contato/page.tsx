import type { Metadata } from "next";
import { site } from "@/content/site";
import { waLink } from "@/lib/wa";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Fale com a organização da Baixudos.PR: WhatsApp, Instagram e e-mail. Maringá — Paraná.",
};

const channels = [
  {
    title: "WhatsApp",
    text: "Canal direto com a organização para dúvidas, ingressos e inscrições.",
    action: "Chamar no WhatsApp",
    href: waLink(site.whatsappMessages.default),
    external: true,
  },
  {
    title: "Instagram",
    text: `Novidades, bastidores e anúncios oficiais em primeira mão no ${site.instagramHandle}.`,
    action: "Seguir no Instagram",
    href: site.instagram,
    external: true,
  },
  {
    title: "E-mail",
    text: "Para assuntos comerciais, imprensa e parcerias.",
    action: site.email,
    href: `mailto:${site.email}`,
    external: false,
  },
];

export default function ContatoPage() {
  return (
    <div className="mx-auto max-w-[1360px] px-4 pb-20 pt-32 sm:px-6 md:pb-28 md:pt-40">
      <Reveal>
        <p className="eyebrow">Contato</p>
        <h1 className="display mt-4 max-w-3xl text-5xl text-white sm:text-6xl md:text-7xl">
          Fala com <span className="slash-mark">a gente.</span>
        </h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-smoke">
          A organização da Baixudos.PR responde pelos canais oficiais abaixo. {site.city} —{" "}
          {site.state}.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {channels.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.06}>
            <div className="flex h-full flex-col border border-line bg-panel p-6 md:p-8">
              <h2 className="display text-2xl text-white">{c.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-smoke">{c.text}</p>
              <a
                href={c.href}
                {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="mt-6 inline-flex items-center justify-center bg-signal px-5 py-3.5 text-center text-sm font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-signal-dark"
              >
                {c.action}
              </a>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <div className="mt-10 border border-line bg-panel p-6 text-sm text-smoke">
          Prefere o grupo? Entre na{" "}
          <a
            href={site.whatsappCommunity}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-white underline-offset-4 hover:underline"
          >
            comunidade oficial no WhatsApp
          </a>{" "}
          e receba os avisos de cada edição.
        </div>
      </Reveal>
    </div>
  );
}
