import { NextResponse } from "next/server";
import { createOrder } from "@/lib/checkout/orders";
import type { CreateOrderInput } from "@/lib/checkout/types";

export async function POST(req: Request) {
  let body: Partial<CreateOrderInput>;
  try {
    body = (await req.json()) as Partial<CreateOrderInput>;
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const c = body.customer;
  if (!c?.fullName || !c?.cpf || !c?.phone || !c?.email) {
    return NextResponse.json({ error: "Dados de cadastro incompletos." }, { status: 400 });
  }
  if (!body.campaign && !body.ticket) {
    return NextResponse.json({ error: "Selecione ao menos um item." }, { status: 400 });
  }

  const input: CreateOrderInput = {
    sourceFlow: body.sourceFlow ?? "campaign_first",
    campaign: body.campaign ?? null,
    ticket: body.ticket ?? null,
    customer: c,
    consents: body.consents ?? { regulation: false, terms: false, privacy: false },
  };

  try {
    const result = await createOrder(input);
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Falha ao criar pedido.";
    console.error("[pedidos] createOrder:", msg);
    return NextResponse.json({ error: msg }, { status: 409 });
  }
}
