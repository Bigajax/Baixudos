import { createClient } from "@/lib/supabase/server";
import { getAdminPacks } from "@/lib/admin/queries";
import { savePack, togglePack } from "@/lib/admin/actions";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminPacksPage(props: PageProps<"/admin/packs">) {
  const params = await props.searchParams;
  const editId = typeof params.edit === "string" ? params.edit : null;

  const supabase = await createClient();
  const { data: campaign } = await supabase
    .from("raffle_campaigns")
    .select("id,title")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!campaign) return <p className="text-smoke">Nenhuma campanha cadastrada.</p>;

  const packs = await getAdminPacks(campaign.id);
  const editing = editId ? packs.find((p) => p.id === editId) : null;
  const reais = (c: number) => (c / 100).toFixed(2).replace(".", ",");

  return (
    <div>
      <p className="eyebrow">Packs</p>
      <h1 className="display mt-2 text-3xl text-white sm:text-4xl">{campaign.title}</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Lista */}
        <div className="space-y-3">
          {packs.length === 0 && <p className="text-sm text-smoke">Nenhum pack cadastrado ainda.</p>}
          {packs.map((p) => {
            const saving = p.originalPriceCents - p.promotionalPriceCents;
            return (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 border border-line bg-panel p-4">
                <div>
                  <p className="font-semibold text-white">
                    {p.title} <span className="text-sm text-smoke">· {p.numberQuantity} números</span>
                  </p>
                  <p className="mt-1 font-mono text-sm text-smoke">
                    <span className="line-through">{formatPrice(p.originalPriceCents)}</span>{" "}
                    <span className="text-white">{formatPrice(p.promotionalPriceCents)}</span>
                    {saving > 0 && <span className="text-signal"> · −{formatPrice(saving)}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-[10px] uppercase tracking-[0.14em] ${p.active ? "text-signal" : "text-smoke/50"}`}>
                    {p.active ? "Ativo" : "Inativo"}
                  </span>
                  <a href={`/admin/packs?edit=${p.id}`} className="border border-line px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-smoke transition-colors hover:border-signal hover:text-signal">
                    Editar
                  </a>
                  <form action={togglePack}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="active" value={String(p.active)} />
                    <button type="submit" className="border border-line px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-smoke transition-colors hover:border-signal hover:text-signal">
                      {p.active ? "Desativar" : "Ativar"}
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>

        {/* Form */}
        <div className="border border-line bg-panel p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-smoke">{editing ? "Editar pack" : "Novo pack"}</p>
          <form action={savePack} className="mt-4 space-y-4">
            <input type="hidden" name="campaignId" value={campaign.id} />
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <div>
              <label className="field-label">Título</label>
              <input name="title" required defaultValue={editing?.title ?? ""} className="field" placeholder="Pack com 10" />
            </div>
            <div>
              <label className="field-label">Quantidade de números</label>
              <input name="numberQuantity" type="number" min={1} required defaultValue={editing?.numberQuantity ?? ""} className="field" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label">Preço original</label>
                <input name="originalPrice" required defaultValue={editing ? reais(editing.originalPriceCents) : ""} className="field" placeholder="250,00" />
              </div>
              <div>
                <label className="field-label">Preço promocional</label>
                <input name="promotionalPrice" required defaultValue={editing ? reais(editing.promotionalPriceCents) : ""} className="field" placeholder="199,90" />
              </div>
            </div>
            <div>
              <label className="field-label">Ordem de exibição</label>
              <input name="displayOrder" type="number" defaultValue={editing?.displayOrder ?? packs.length + 1} className="field" />
            </div>
            {params.erro && <p className="field-error">Verifique os campos (o preço promocional não pode ser maior que o original).</p>}
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-signal py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark">
                {editing ? "Salvar" : "Criar pack"}
              </button>
              {editing && (
                <a href="/admin/packs" className="border border-line px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-smoke transition-colors hover:border-signal hover:text-signal">
                  Cancelar
                </a>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
