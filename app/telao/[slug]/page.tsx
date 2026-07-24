import Image from "next/image";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { padNumber } from "@/lib/raffle/types";

export const dynamic = "force-dynamic";

export default async function TelaoPage(props: PageProps<"/telao/[slug]">) {
  const { slug } = await props.params;
  const sb = createAdminClient();

  const { data: c } = await sb
    .from("raffle_campaigns")
    .select("id,title,prize_title,highlight_image_url,status,number_padding,result_number,result_published_at")
    .eq("slug", slug)
    .maybeSingle();

  if (!c) notFound();

  const published = Boolean(c.result_published_at);
  const hasNumber = c.result_number != null;

  let winnerFirst: string | null = null;
  if (hasNumber) {
    const { data: n } = await sb
      .from("campaign_numbers")
      .select("order_items(orders(customers(full_name)))")
      .eq("campaign_id", c.id)
      .eq("number", c.result_number)
      .maybeSingle();
    const row = n as unknown as {
      order_items: { orders: { customers: { full_name: string } | null } | null } | null;
    } | null;
    winnerFirst = row?.order_items?.orders?.customers?.full_name?.trim().split(/\s+/)[0] ?? null;
  }

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-night px-6 text-center">
      {c.highlight_image_url && (
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <Image src={c.highlight_image_url} alt="" fill priority sizes="100vw" className="object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-night via-night/85 to-night/70" />
        </div>
      )}

      <p className="eyebrow">{c.title}</p>
      <p className="display mt-3 text-2xl text-white sm:text-4xl">{c.prize_title}</p>

      {hasNumber ? (
        <>
          <p className="mt-14 font-mono text-sm uppercase tracking-[0.3em] text-smoke">
            {published ? "Número contemplado" : "Prévia — aguardando publicação"}
          </p>
          <p className="display mt-4 text-[22vw] leading-none text-signal drop-shadow-[0_0_40px_rgba(255,16,16,0.5)] sm:text-[16rem]">
            {padNumber(c.result_number as number, c.number_padding)}
          </p>
          {winnerFirst && (
            <p className="mt-6 display text-3xl text-white sm:text-5xl">{winnerFirst}</p>
          )}
          {!winnerFirst && published && (
            <p className="mt-6 text-lg text-smoke">Número sem titular confirmado.</p>
          )}
        </>
      ) : (
        <p className="mt-16 display text-4xl text-white sm:text-6xl">Aguardando a apuração</p>
      )}
    </section>
  );
}
