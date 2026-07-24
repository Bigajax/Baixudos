import { getAdminOrders } from "@/lib/admin/queries";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  created: "Criado",
  awaiting_payment: "Aguardando pgto",
  paid: "Pago",
  expired: "Expirado",
  cancelled: "Cancelado",
  refunded: "Estornado",
};

const FLOW_LABEL: Record<string, string> = {
  campaign_first: "Campanha primeiro",
  ticket_first: "Ingresso primeiro",
  post_purchase_ticket: "Ingresso pós-compra",
  post_purchase_campaign: "Números pós-compra",
};

const ITEM_LABEL: Record<string, string> = {
  campaign_individual: "Números",
  campaign_pack: "Pack",
  event_ticket: "Ingresso",
};

function statusClass(status: string): string {
  if (status === "paid") return "border-signal/50 bg-signal/15 text-signal";
  if (status === "awaiting_payment" || status === "created") return "border-line bg-panel text-smoke";
  return "border-line/50 bg-graphite text-smoke/60";
}

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div>
      <p className="eyebrow">Pedidos</p>
      <h1 className="display mt-2 text-3xl text-white sm:text-4xl">Pedidos e pagamentos</h1>

      {orders.length === 0 ? (
        <p className="mt-8 text-sm text-smoke">Nenhum pedido ainda.</p>
      ) : (
        <div className="mt-8 space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="border border-line bg-panel p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-semibold text-white">{o.code ?? o.id.slice(0, 8)}</p>
                  <p className="mt-0.5 text-sm text-smoke">
                    {o.customerName ?? "—"} · {FLOW_LABEL[o.sourceFlow] ?? o.sourceFlow}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold text-white">{formatPrice(o.totalCents)}</p>
                  <span className={`mt-1 inline-block border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${statusClass(o.status)}`}>
                    {STATUS_LABEL[o.status] ?? o.status}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
                {o.items.map((it, i) => (
                  <span key={i} className="border border-line px-2 py-1 text-xs text-smoke">
                    {ITEM_LABEL[it.itemType] ?? it.itemType} · {it.quantity}× · {formatPrice(it.subtotalCents)}
                  </span>
                ))}
                <span className="ml-auto text-xs text-smoke/60">
                  {new Date(o.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
