"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nextEvent } from "@/content/events";
import { site } from "@/content/site";
import { featuredRaffle } from "@/content/raffle";

const carIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
    <path
      d="M3 14v-1l1.8-4.2A2 2 0 0 1 6.6 7.6h6.8c.5 0 1 .2 1.4.6L18 11l2.3.9a1 1 0 0 1 .7 1V14M3 14h18M3 14v2h1.6M21 14v2h-1.6"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="7.6" cy="16" r="1.7" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="16.4" cy="16" r="1.7" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);

const ticketIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
    <path
      d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 1 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 1 0 0-4V8Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path d="M14 6v12" stroke="currentColor" strokeWidth="1.7" strokeDasharray="2.5 2.5" />
  </svg>
);

/**
 * Barra flutuante estilo iOS (pill, vidro fosco) — só < lg.
 * Duas ações: Sorteio e Ingresso. Navegação completa fica no menu do topo.
 */
export default function MobileTabBar() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  const items = [
    ...(site.rafflesEnabled
      ? [
          {
            href: `/campanhas/${featuredRaffle.slug}`,
            label: "Sorteio",
            icon: carIcon,
            active: pathname.startsWith("/campanhas"),
            external: false,
          },
        ]
      : []),
    {
      href: nextEvent.ticketUrl ?? `/eventos/${nextEvent.slug}`,
      label: "Ingresso",
      icon: ticketIcon,
      active: pathname.startsWith("/eventos"),
      external: Boolean(nextEvent.ticketUrl),
    },
  ];

  return (
    <nav
      aria-label="Navegação rápida"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 lg:hidden"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}
    >
      <div className="flex items-center gap-1 rounded-full border border-white/10 bg-night/70 p-1.5 shadow-[0_10px_34px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        {items.map((it) => (
          <Link
            key={it.label}
            href={it.href}
            aria-current={it.active ? "page" : undefined}
            {...(it.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold uppercase tracking-[0.08em] transition-colors ${
              it.active ? "bg-signal text-white" : "text-smoke hover:text-white"
            }`}
          >
            {it.icon}
            <span>{it.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
