"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function reais(v: FormDataEntryValue | null): number {
  return Math.round(parseFloat(String(v ?? "0").replace(/\./g, "").replace(",", ".")) * 100) || 0;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/** Cria ou edita um pack. Preço em reais (aceita "199,90"). */
export async function savePack(formData: FormData) {
  const supabase = await createClient();
  const id = (formData.get("id") as string) || null;
  const campaignId = String(formData.get("campaignId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const numberQuantity = parseInt(String(formData.get("numberQuantity") ?? "0"), 10);
  const originalCents = reais(formData.get("originalPrice"));
  const promoCents = reais(formData.get("promotionalPrice"));
  const displayOrder = parseInt(String(formData.get("displayOrder") ?? "0"), 10) || 0;

  if (!campaignId || !title || numberQuantity <= 0 || promoCents > originalCents) {
    redirect("/admin/packs?erro=1");
  }

  const payload = {
    campaign_id: campaignId,
    title,
    number_quantity: numberQuantity,
    original_price_cents: originalCents,
    promotional_price_cents: promoCents,
    display_order: displayOrder,
  };

  if (id) await supabase.from("campaign_packs").update(payload).eq("id", id);
  else await supabase.from("campaign_packs").insert(payload);

  revalidatePath("/admin/packs");
  revalidatePath("/campanhas/[slug]", "page");
  redirect("/admin/packs");
}

export async function togglePack(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const active = String(formData.get("active")) === "true";
  await supabase.from("campaign_packs").update({ active: !active }).eq("id", id);
  revalidatePath("/admin/packs");
}
