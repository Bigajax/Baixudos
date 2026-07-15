"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";
import { nextEvent } from "@/content/events";

const nav = [
  { href: "/", label: "Início" },
  { href: "/eventos", label: "Próximo evento" },
  { href: "/inscrever-veiculo", label: "Inscrever meu carro" },
  { href: "/loja", label: "Loja" },
  { href: "/parceiros", label: "Parceiros" },
  { href: "/sobre", label: "Sobre" },
];

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.3" cy="6.7" r="1.2" fill="currentColor" />
    </svg>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const ticketHref = nextEvent.ticketUrl ?? `/eventos/${nextEvent.slug}`;

  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-line bg-night/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between px-4 sm:px-6 md:h-[72px]">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Baixudos.PR — início">
          <Image
            src="/images/logo.png"
            alt="Logo Baixudos.PR"
            width={44}
            height={44}
            className="h-10 w-10 md:h-11 md:w-11"
            priority
          />
          <span className="display text-lg tracking-wide text-white md:text-xl">
            Baixudos<span className="text-signal">.PR</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegação principal">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                pathname === item.href ? "text-signal" : "text-smoke hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram da Baixudos.PR"
            className="hidden text-smoke transition-colors hover:text-white sm:block"
          >
            <InstagramIcon className="h-5 w-5" />
          </a>

          <a
            href={ticketHref}
            {...(nextEvent.ticketUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="hidden items-center bg-signal px-5 py-2.5 text-[13px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-signal-dark sm:inline-flex"
            style={{ clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)" }}
          >
            Garantir ingresso
          </a>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            className="flex h-11 w-11 flex-col items-center justify-center gap-[5px] lg:hidden"
          >
            <span
              className={`h-[2px] w-6 bg-white transition-transform ${open ? "translate-y-[7px] rotate-45" : ""}`}
            />
            <span className={`h-[2px] w-6 bg-white transition-opacity ${open ? "opacity-0" : ""}`} />
            <span
              className={`h-[2px] w-6 bg-white transition-transform ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

    </header>

    {/* Menu mobile — fora do <header> (o backdrop-blur dele quebraria o position:fixed) */}
      <div
        className={`fixed inset-x-0 top-16 bottom-0 z-[45] flex flex-col overflow-y-auto transition-opacity duration-200 md:top-[72px] lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
        style={{ backgroundColor: "#131315" }}
      >
        <nav className="flex flex-col px-5 pt-4" aria-label="Menu mobile">
          {nav.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={`display flex items-center justify-between border-b border-line py-3.5 text-2xl transition-all duration-300 ${
                pathname === item.href ? "text-signal" : "text-white"
              } ${open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
              style={{ transitionDelay: open ? `${80 + i * 45}ms` : "0ms" }}
            >
              {item.label}
              <span aria-hidden="true" className="text-lg text-signal">
                →
              </span>
            </Link>
          ))}
        </nav>

        <Link
          href={`/eventos/${nextEvent.slug}`}
          className={`mx-5 mt-5 flex items-center gap-3 border border-line bg-panel px-4 py-3 text-[13px] text-smoke transition-all duration-300 ${
            open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
          style={{ transitionDelay: open ? "380ms" : "0ms" }}
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-signal" />
          </span>
          <span>
            <strong className="font-bold text-white">9ª edição</strong> — 25 de outubro · Race
            Park Maringá
          </span>
        </Link>

        <div
          className={`mt-auto space-y-2.5 px-5 pb-6 pt-6 transition-all duration-300 ${
            open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
          style={{ transitionDelay: open ? "440ms" : "0ms" }}
        >
          <a
            href={ticketHref}
            {...(nextEvent.ticketUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="block bg-signal py-3.5 text-center text-sm font-bold uppercase tracking-[0.12em] text-white"
            style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
          >
            Garantir ingresso
          </a>
          <a
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 border border-line py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-smoke"
          >
            <InstagramIcon className="h-4 w-4" /> {site.instagramHandle}
          </a>
        </div>
      </div>
    </>
  );
}
