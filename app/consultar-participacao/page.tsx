import type { Metadata } from "next";
import { getOrderByCode } from "@/lib/checkout/consult";
import { formatPrice } from "@/lib/format";
import { padNumber } from "@/lib/raffle/types";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Consultar participação",
  description: "Consulte seus números e ingressos pelo código do pedido.",
};

const STATUS: Record<string, string> = {
  paid: "Pago",
  awaiting_payment: "Aguardando pagamento",
  created: "Criado",
  expired: "Expirado",
  cancelled: "Cancelado",
  refunded: "Estornado",
};

export default async function ConsultarPage(props: PageProps<"/consultar-participacao">) {
  const params = await props.searchParams;
  const code = typeof params.codigo === "string" ? params.codigo : null;
  const order = code ? await getOrderByCode(code) : null;

  return (
    <div className="mx-auto max-w-[720px] px-4 pb-24 pt-32 sm:px-6 md:pt-40">
      <Reveal>
        <p className="eyebrow">Consulta</p>
        <h1 className="display mt-4 text-4xl text-white sm:text-5xl">
          Minha <span className="slash-mark">participação</span>
        </h1>
        <p className="mt-5 text-[15px] leading-relaxed text-smoke">
          Informe o código do seu pedido (ex.: BX-XXXXXXXX) para consultar seus números e ingressos.
        </p>
      </Reveal>

      <form method="get" className="mt-8 flex gap-2">
        <input
          name="codigo"
          defaultValue={code ?? ""}
          placeholder="BX-XXXXXXXX"
          className="field font-mono uppercase"
          autoComplete="off"
        />
        <button
          type="submit"
          className="shrink-0 bg-signal px-6 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark"
        >
          Consultar
        </button>
      </form>

      {code && !order && (
        <p className="mt-8 border border-line bg-panel p-5 text-sm text-smoke">
          Pedido não encontrado. Confira o código e tente novamente.
        </p>
      )}

      {order && (
        <div className="mt-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border border-line bg-panel p-5">
            <div>
              <p className="font-mono text-lg font-semibold text-white">{order.code}</p>
              <p className="text-sm text-smoke">
                {order.firstName ? `${order.firstName} · ` : ""}
                {formatPrice(order.totalCents)}
              </p>
            </div>
            <span
              className={`border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] ${
                order.status === "paid"
                  ? "border-signal/50 bg-signal/15 text-signal"
                  : "border-line bg-graphite text-smoke"
              }`}
            >
              {STATUS[order.status] ?? order.status}
            </span>
          </div>

          {order.campaign && (
            <div className="border border-line bg-panel p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-smoke">Seus números</p>
              <p className="mt-1 font-semibold text-white">{order.campaign.title}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {order.campaign.numbers.map((n) => (
                  <span
                    key={n.number}
                    className="border border-signal/50 bg-signal/10 px-2 py-1 font-mono text-xs text-white tabular-nums"
                  >
                    {padNumber(n.number, order.campaign!.padding)}
                  </span>
                ))}
              </div>
              {order.campaign.drawAt && (
                <p className="mt-3 text-xs text-smoke">
                  Apuração: {new Date(order.campaign.drawAt).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
          )}

          {order.ticket && (
            <div className="border border-line bg-panel p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-smoke">Seu ingresso</p>
              <p className="mt-1 font-semibold text-white">{order.ticket.eventTitle}</p>
              <p className="text-sm text-smoke">
                {order.ticket.quantity} × {order.ticket.ticketTitle}
                {order.ticket.location ? ` · ${order.ticket.location}` : ""}
              </p>
            </div>
          )}

          <p className="text-xs leading-relaxed text-smoke/60">
            A participação na campanha e o ingresso do evento são produtos distintos. A apuração e a
            premiação acontecerão durante o evento. Consulte o regulamento e as condições de
            participação.
          </p>
        </div>
      )}
    </div>
  );
}
