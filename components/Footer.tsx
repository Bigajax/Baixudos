import Link from "next/link";
import Image from "next/image";
import { site } from "@/content/site";
import { waLink } from "@/lib/wa";

const quickLinks = [
  { href: "/eventos", label: "Eventos" },
  { href: "/inscrever-veiculo", label: "Inscrever veículo" },
  { href: "/loja", label: "Loja" },
  { href: "/parceiros", label: "Parceiros" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

const legalLinks = [
  { href: "/politica-de-privacidade", label: "Política de Privacidade" },
  { href: "/termos-de-uso", label: "Termos de Uso" },
  { href: "/politica-de-cookies", label: "Política de Cookies" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-night">
      <div className="speedline" aria-hidden="true" />
      <div className="mx-auto max-w-[1360px] px-4 pb-32 pt-14 sm:px-6 lg:pb-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Logo Baixudos.PR"
                width={48}
                height={48}
                className="h-12 w-12"
              />
              <span className="display text-2xl text-white">
                Baixudos<span className="text-signal">.PR</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-smoke">
              Comunidade e marca automotiva de {site.city}, {site.state}. Eventos, projetos,
              produtos oficiais e experiências que movimentam a cultura automotiva — de Maringá
              pro mundo.
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-smoke/70">
              {site.city} — {site.stateShort}
            </p>
          </div>

          <nav aria-label="Links rápidos">
            <h2 className="eyebrow mb-4">Navegação</h2>
            <ul className="space-y-2.5">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-smoke transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow mb-4">Fale com a gente</h2>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href={waLink(site.whatsappMessages.default)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-smoke transition-colors hover:text-white"
                >
                  WhatsApp oficial
                </a>
              </li>
              <li>
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-smoke transition-colors hover:text-white"
                >
                  Instagram {site.instagramHandle}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="text-smoke transition-colors hover:text-white">
                  {site.email}
                </a>
              </li>
            </ul>
            <ul className="mt-6 space-y-2 border-t border-line pt-4">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-xs text-smoke/70 transition-colors hover:text-smoke">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-xs text-smoke/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Baixudos.PR. Todos os direitos reservados.</p>
          {site.cnpj ? <p>CNPJ {site.cnpj}</p> : null}
        </div>
      </div>
    </footer>
  );
}
