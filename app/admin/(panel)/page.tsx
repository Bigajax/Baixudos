import Link from "next/link";
import { getAdminDashboard } from "@/lib/admin/queries";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border border-line bg-panel p-5">
      <p className="text-[11px] uppercase tracking-[0.16em] text-smoke">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold text-white tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-smoke/60">{hint}</p>}
    </div>
  );
}

export default async function AdminDashboard() {
  const d = await getAdminDashboard();

  if (!d.campaign) {
    return <p className="text-smoke">Nenhuma campanha cadastrada.</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="display mt-2 text-3xl text-white sm:text-4xl">{d.campaign.title}</h1>
        </div>
        <Link href={`/campanhas/${d.campaign.slug}`} target="_blank" className="border border-line px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-smoke transition-colors hover:border-signal hover:text-signal">
          Ver página pública
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Stat label="Confirmados" value={d.numbers.confirmed.toLocaleString("pt-BR")} hint={`de ${d.campaign.totalNumbers.toLocaleString("pt-BR")} números`} />
        <Stat label="Disponíveis" value={d.numbers.available.toLocaleString("pt-BR")} />
        <Stat label="Reservados" value={d.numbers.reserved.toLocaleString("pt-BR")} />
        <Stat label="Preenchido" value={`${d.filledPct.toFixed(1)}%`} />
        <Stat label="Bruto confirmado" value={formatPrice(d.grossCents)} hint="pedidos pagos" />
        <Stat label="Pedidos pagos" value={d.orders.paid.toLocaleString("pt-BR")} />
        <Stat label="Aguardando pgto" value={d.orders.awaiting.toLocaleString("pt-BR")} />
        <Stat label="Expirados" value={d.orders.expired.toLocaleString("pt-BR")} />
      </div>

      <div className="mt-8 border border-line bg-panel p-5">
        <p className="text-[11px] uppercase tracking-[0.16em] text-smoke">Parâmetros da campanha</p>
        <dl className="mt-3 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div><dt className="text-smoke">Total de números</dt><dd className="font-mono text-white">{d.campaign.totalNumbers.toLocaleString("pt-BR")}</dd></div>
          <div><dt className="text-smoke">Valor por número</dt><dd className="font-mono text-white">{formatPrice(d.campaign.priceCents)}</dd></div>
          <div><dt className="text-smoke">Bloqueados</dt><dd className="font-mono text-white">{d.numbers.blocked}</dd></div>
        </dl>
      </div>
    </div>
  );
}
