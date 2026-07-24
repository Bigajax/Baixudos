import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/admin/actions";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/packs", label: "Packs" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/numeros", label: "Números" },
  { href: "/admin/apuracao", label: "Apuração" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-[100svh] bg-night">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-night/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-6">
          <span className="display text-lg text-white">
            Baixudos<span className="text-signal">.PR</span> <span className="text-sm text-smoke">· Painel</span>
          </span>
          <nav className="hidden items-center gap-5 sm:flex">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="text-[13px] font-semibold uppercase tracking-[0.1em] text-smoke transition-colors hover:text-white">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-xs text-smoke/70 md:inline">{user.email}</span>
          <form action={signOut}>
            <button type="submit" className="border border-line px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-smoke transition-colors hover:border-signal hover:text-signal">
              Sair
            </button>
          </form>
        </div>
      </header>

      <nav className="flex gap-4 border-b border-line px-4 py-2 sm:hidden">
        {nav.map((n) => (
          <Link key={n.href} href={n.href} className="text-[13px] font-semibold uppercase tracking-[0.1em] text-smoke">
            {n.label}
          </Link>
        ))}
      </nav>

      <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
