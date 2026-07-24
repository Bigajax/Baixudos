import { createClient } from "@/lib/supabase/server";
import { getNumberDetail } from "@/lib/admin/queries";
import { blockNumber, unblockNumber } from "@/lib/admin/actions";
import { padNumber } from "@/lib/raffle/types";

export const dynamic = "force-dynamic";

const STATUS: Record<string, string> = {
  available: "Disponível",
  reserved: "Reservado",
  pending: "Aguardando pagamento",
  confirmed: "Vendido",
  blocked: "Bloqueado",
  cancelled: "Cancelado",
  won: "Contemplado",
};

export default async function AdminNumbersPage(props: PageProps<"/admin/numeros">) {
  const params = await props.searchParams;
  const raw = typeof params.n === "string" ? params.n : null;
  const number = raw ? parseInt(raw, 10) : null;

  const supabase = await createClient();
  const { data: campaign } = await supabase
    .from("raffle_campaigns")
    .select("id,title,number_padding,total_numbers")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!campaign) return <p className="text-smoke">Nenhuma campanha cadastrada.</p>;

  const detail =
    number != null && !Number.isNaN(number) && number >= 1 && number <= campaign.total_numbers
      ? await getNumberDetail(campaign.id, number)
      : null;

  return (
    <div className="max-w-[640px]">
      <p className="eyebrow">Números</p>
      <h1 className="display mt-2 text-3xl text-white sm:text-4xl">{campaign.title}</h1>

      <form method="get" className="mt-8 flex gap-2">
        <input
          name="n"
          type="number"
          min={1}
          max={campaign.total_numbers}
          defaultValue={raw ?? ""}
          placeholder={`Número (1–${campaign.total_numbers})`}
          className="field font-mono"
        />
        <button type="submit" className="shrink-0 bg-signal px-6 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark">
          Buscar
        </button>
      </form>

      {number != null && !detail && (
        <p className="mt-6 text-sm text-smoke">Número fora do intervalo.</p>
      )}

      {detail && (
        <div className="mt-6 border border-line bg-panel p-5">
          <div className="flex items-center gap-4">
            <span className="display font-mono text-3xl text-white">
              {padNumber(detail.number, campaign.number_padding)}
            </span>
            <span className="border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-smoke">
              {STATUS[detail.status] ?? detail.status}
            </span>
          </div>

          {detail.holder && (
            <p className="mt-4 text-sm text-smoke">
              Titular: <span className="text-white">{detail.holder.firstName ?? "—"}</span>
              {detail.holder.orderCode && <span className="font-mono"> · {detail.holder.orderCode}</span>}
            </p>
          )}

          {(detail.status === "available" || detail.status === "blocked") && (
            <form action={detail.status === "available" ? blockNumber : unblockNumber} className="mt-5">
              <input type="hidden" name="campaignId" value={campaign.id} />
              <input type="hidden" name="number" value={detail.number} />
              <button className="border border-line px-4 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-white transition-colors hover:border-signal hover:text-signal">
                {detail.status === "available" ? "Bloquear número" : "Desbloquear número"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
