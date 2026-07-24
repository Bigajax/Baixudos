import { getApuracaoData } from "@/lib/admin/queries";
import { setCampaignStatus, saveResult, publishResult } from "@/lib/admin/actions";
import { padNumber } from "@/lib/raffle/types";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  published: "Vendas abertas",
  paused: "Pausada",
  closed: "Vendas encerradas",
  drawn: "Apurada",
  draft: "Rascunho",
};

export default async function ApuracaoPage() {
  const { campaign, confirmedCount, winner } = await getApuracaoData();
  if (!campaign) return <p className="text-smoke">Nenhuma campanha cadastrada.</p>;

  const drawn = campaign.status === "drawn";
  const hasResult = campaign.resultNumber != null;

  return (
    <div className="max-w-[720px]">
      <p className="eyebrow">Apuração</p>
      <h1 className="display mt-2 text-3xl text-white sm:text-4xl">{campaign.title}</h1>
      <p className="mt-2 text-sm text-smoke">
        Status: <span className="font-semibold text-white">{STATUS_LABEL[campaign.status] ?? campaign.status}</span> ·{" "}
        <span className="font-mono text-white">{confirmedCount}</span> números confirmados
      </p>

      {/* 1. Vendas */}
      {!drawn && (
        <div className="mt-8 border border-line bg-panel p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-smoke">1. Vendas</p>
          <p className="mt-2 text-sm text-smoke">
            Encerre as vendas antes de apurar. Com as vendas encerradas, novos pedidos são bloqueados.
          </p>
          <form action={setCampaignStatus} className="mt-4">
            <input type="hidden" name="campaignId" value={campaign.id} />
            <input type="hidden" name="status" value={campaign.status === "published" ? "closed" : "published"} />
            <button className="border border-line px-4 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-white transition-colors hover:border-signal hover:text-signal">
              {campaign.status === "published" ? "Encerrar vendas" : "Reabrir vendas"}
            </button>
          </form>
        </div>
      )}

      {/* 2. Resultado */}
      <div className="mt-6 border border-line bg-panel p-5">
        <p className="text-[11px] uppercase tracking-[0.16em] text-smoke">2. Número contemplado</p>
        <p className="mt-2 text-sm leading-relaxed text-smoke">
          Informe o número apurado <strong className="text-white">conforme o método oficial</strong> do
          regulamento (ex.: Loteria Federal ou apuração presencial autorizada). O sistema não sorteia
          automaticamente.
        </p>
        <form action={saveResult} className="mt-4 space-y-4">
          <input type="hidden" name="campaignId" value={campaign.id} />
          <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
            <div>
              <label className="field-label">Número contemplado</label>
              <input name="resultNumber" type="number" min={1} defaultValue={campaign.resultNumber ?? ""} className="field font-mono" required />
            </div>
            <div>
              <label className="field-label">Método / fonte da apuração</label>
              <input name="drawMethod" defaultValue={campaign.drawMethod ?? ""} className="field" placeholder="Loteria Federal — extração de dd/mm/aaaa" />
            </div>
          </div>
          <button className="bg-signal px-5 py-2.5 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark">
            Salvar número
          </button>
        </form>

        {hasResult && (
          <div className="mt-5 border-t border-line pt-5">
            <div className="flex items-center gap-3">
              <span className="display bg-signal px-3 py-1 font-mono text-xl text-white">
                {padNumber(campaign.resultNumber!, campaign.padding)}
              </span>
              <div className="text-sm">
                <p className="text-white">
                  {winner?.firstName ? `Contemplado: ${winner.firstName}` : "Número ainda não vendido / sem titular confirmado"}
                </p>
                {winner?.orderCode && <p className="font-mono text-xs text-smoke">Pedido {winner.orderCode}</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Publicação */}
      {hasResult && (
        <div className="mt-6 border border-line bg-panel p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-smoke">3. Publicação</p>
          {drawn ? (
            <div className="mt-2">
              <p className="text-sm text-signal">Resultado publicado.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={`/campanhas/${campaign.slug}`} target="_blank" className="border border-line px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-smoke hover:border-signal hover:text-signal">Ver página pública</a>
                <a href={`/telao/${campaign.slug}`} target="_blank" className="bg-signal px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-signal-dark">Abrir modo telão</a>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-2 text-sm text-smoke">
                Publicar torna o resultado visível na página pública e no modo telão, e marca o número como contemplado.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <form action={publishResult}>
                  <input type="hidden" name="campaignId" value={campaign.id} />
                  <input type="hidden" name="resultNumber" value={campaign.resultNumber!} />
                  <button className="bg-signal px-5 py-2.5 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark">
                    Publicar resultado
                  </button>
                </form>
                <a href={`/telao/${campaign.slug}`} target="_blank" className="border border-line px-5 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-white hover:border-signal hover:text-signal">
                  Prévia do telão
                </a>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
