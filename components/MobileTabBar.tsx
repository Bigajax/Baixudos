"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nextEvent } from "@/content/events";

/** Barra de navegação fixa no rodapé — só em telas menores que lg. */
const tabs = [
  {
    href: "/",
    label: "Início",
    match: (p: string) => p === "/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M3 10.5 12 3l9 7.5V21h-6v-6h-6v6H3v-10.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/eventos",
    label: "Eventos",
    match: (p: string) => p.startsWith("/eventos"),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: `/eventos/${nextEvent.slug}`,
    label: "Ingresso",
    match: () => false,
    highlight: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path
          d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 1 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 1 0 0-4V8Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M14 6v12" stroke="currentColor" strokeWidth="1.8" strokeDasharray="2.5 2.5" />
      </svg>
    ),
  },
  {
    href: "/loja",
    label: "Loja",
    match: (p: string) => p.startsWith("/loja"),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M5 8h14l-1 13H6L5 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 10V6a3 3 0 0 1 6 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação rápida"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-night/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-4">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.label}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors ${
                tab.highlight
                  ? "text-signal"
                  : active
                    ? "text-white"
                    : "text-smoke/80 hover:text-white"
              }`}
            >
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-0 h-[3px] w-8 -translate-x-1/2 -skew-x-[20deg] bg-signal"
                />
              )}
              {tab.icon}
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
