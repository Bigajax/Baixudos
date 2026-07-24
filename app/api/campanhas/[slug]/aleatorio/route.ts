import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Amostra aleatória de números disponíveis (PREVIEW — não reserva).
 * Lê a disponibilidade no SERVIDOR (fonte da verdade) e sorteia aqui.
 * A reserva atômica (sem venda duplicada) acontece só no checkout.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;

  let body: { count?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const supabase = await createClient();
  const { data: campaign } = await supabase
    .from("raffle_campaigns")
    .select("id,status,max_per_order,total_numbers")
    .eq("slug", slug)
    .maybeSingle();

  if (!campaign || campaign.status === "draft") {
    return NextResponse.json({ error: "Campanha indisponível." }, { status: 404 });
  }

  const max = (campaign.max_per_order as number) ?? 50;
  const count = Math.min(Math.max(1, Math.floor(Number(body.count) || 0)), max);

  const { data, error } = await supabase
    .from("campaign_numbers")
    .select("number")
    .eq("campaign_id", campaign.id)
    .eq("status", "available")
    .limit((campaign.total_numbers as number) ?? 2000);

  if (error) {
    console.error("[aleatorio] leitura falhou:", error);
    return NextResponse.json({ error: "Falha ao sortear números." }, { status: 500 });
  }

  const pool = (data ?? []).map((r) => (r as { number: number }).number);
  // Fisher-Yates parcial: embaralha só o necessário.
  const take = Math.min(count, pool.length);
  const picked: number[] = [];
  for (let i = 0; i < take; i++) {
    const j = i + Math.floor(Math.random() * (pool.length - i));
    const tmp = pool[i];
    pool[i] = pool[j];
    pool[j] = tmp;
    picked.push(pool[i]);
  }
  picked.sort((a, b) => a - b);

  return NextResponse.json({ numbers: picked });
}
