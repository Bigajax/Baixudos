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

// ---------- Gestão de números ----------

export async function blockNumber(formData: FormData) {
  const supabase = await createClient();
  const campaignId = String(formData.get("campaignId"));
  const number = parseInt(String(formData.get("number") ?? ""), 10);
  if (!Number.isNaN(number)) {
    await supabase
      .from("campaign_numbers")
      .update({ status: "blocked" })
      .eq("campaign_id", campaignId)
      .eq("number", number)
      .eq("status", "available");
  }
  redirect(`/admin/numeros?n=${number}`);
}

export async function unblockNumber(formData: FormData) {
  const supabase = await createClient();
  const campaignId = String(formData.get("campaignId"));
  const number = parseInt(String(formData.get("number") ?? ""), 10);
  if (!Number.isNaN(number)) {
    await supabase
      .from("campaign_numbers")
      .update({ status: "available" })
      .eq("campaign_id", campaignId)
      .eq("number", number)
      .eq("status", "blocked");
  }
  redirect(`/admin/numeros?n=${number}`);
}

// ---------- Apuração ----------

export async function setCampaignStatus(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("campaignId"));
  const status = String(formData.get("status")); // published | closed | paused
  await supabase.from("raffle_campaigns").update({ status }).eq("id", id);
  revalidatePath("/admin/apuracao");
}

/** Registra o número contemplado (conforme método oficial). NÃO publica. */
export async function saveResult(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("campaignId"));
  const num = parseInt(String(formData.get("resultNumber") ?? ""), 10);
  const method = String(formData.get("drawMethod") ?? "").trim() || null;
  if (!id || Number.isNaN(num)) redirect("/admin/apuracao?erro=1");
  await supabase.from("raffle_campaigns").update({ result_number: num, draw_method: method }).eq("id", id);
  revalidatePath("/admin/apuracao");
  redirect("/admin/apuracao");
}

/** Publica o resultado: marca o número como contemplado e a campanha como apurada. */
export async function publishResult(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("campaignId"));
  const num = parseInt(String(formData.get("resultNumber") ?? ""), 10);
  if (!id || Number.isNaN(num)) redirect("/admin/apuracao?erro=1");
  await supabase
    .from("campaign_numbers")
    .update({ status: "won" })
    .eq("campaign_id", id)
    .eq("number", num)
    .eq("status", "confirmed");
  await supabase
    .from("raffle_campaigns")
    .update({ status: "drawn", result_published_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/apuracao");
  revalidatePath("/campanhas/[slug]", "page");
  redirect("/admin/apuracao");
}
