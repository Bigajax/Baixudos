import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Status do pedido por código público (para o polling do checkout). Sem PII. */
export async function GET(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const sb = createAdminClient();
  const { data } = await sb
    .from("orders")
    .select("public_code,status,payment_status,expires_at")
    .eq("public_code", code)
    .maybeSingle();

  if (!data) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }
  return NextResponse.json({
    orderCode: data.public_code,
    status: data.status,
    paymentStatus: data.payment_status,
    expiresAt: data.expires_at,
  });
}
