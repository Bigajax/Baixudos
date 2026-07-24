"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import type { CreateOrderResult, Pack } from "@/lib/checkout/types";
import type { EventNumberOffer, EventTicket } from "@/lib/checkout/queries";
import {
  IdentityFields, PixStep, NumbersChips, TRANSPARENCY_NOTICE,
  emptyCustomer, validateCustomer, type CustomerForm,
} from "./checkout-shared";

type NumberChoice =
  | { type: "none" }
  | { type: "ratio" }
  | { type: "pack"; pack: Pack; offerId: string };

interface Props {
  open: boolean;
  onClose: () => void;
  ticket: EventTicket;
  quantity: number;
  event: { title: string | null; location: string | null };
  campaignSlug: string;
  numberOffer: EventNumberOffer | null;
  sandbox: boolean;
}

export default function TicketCheckoutModal({
  open, onClose, ticket, quantity, event, campaignSlug, numberOffer, sandbox,
}: Props) {
  const [step, setStep] = useState(1); // 1 identif · 2 oferta números · 3 pix · 4 confirmação
  const [customer, setCustomer] = useState<CustomerForm>(emptyCustomer);
  const [consent, setConsent] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [choice, setChoice] = useState<NumberChoice>({ type: "none" });
  const [assigned, setAssigned] = useState<number[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [order, setOrder] = useState<CreateOrderResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [nowMs, setNowMs] = useState(0);

  const ticketSubtotal = quantity * ticket.priceCents;
  const ratioCount = numberOffer?.ratio ? quantity * numberOffer.ratio.ratio : 0;
  const campaignSubtotal =
    choice.type === "ratio"
      ? ratioCount * (numberOffer?.ratio?.promoPriceCents ?? 0)
      : choice.type === "pack"
        ? choice.pack.promotionalPriceCents
        : 0;
  const combinedTotal = ticketSubtotal + campaignSubtotal;

  const close = useCallback(() => {
    setStep(1);
    setCustomer(emptyCustomer);
    setConsent(false);
    setMarketing(false);
    setErrors({});
    setChoice({ type: "none" });
    setAssigned([]);
    setOrder(null);
    setOrderError(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  useEffect(() => {
    if (step !== 3 || !order) return;
    const tick = setInterval(() => setNowMs(Date.now()), 1000);
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/pedidos/${order.orderCode}/status`);
        const json = (await res.json()) as { paymentStatus?: string };
        if (json.paymentStatus === "approved") setStep(4);
      } catch {
        /* ignora */
      }
    }, 4000);
    return () => {
      clearInterval(tick);
      clearInterval(poll);
    };
  }, [step, order]);

  const fetchRandom = useCallback(
    async (count: number): Promise<number[]> => {
      const res = await fetch(`/api/campanhas/${campaignSlug}/aleatorio`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ count }),
      });
      if (!res.ok) return [];
      const json = (await res.json()) as { numbers?: number[] };
      return json.numbers ?? [];
    },
    [campaignSlug],
  );

  const pickRatio = useCallback(async () => {
    setChoice({ type: "ratio" });
    setAssignLoading(true);
    setAssigned(await fetchRandom(ratioCount));
    setAssignLoading(false);
  }, [fetchRandom, ratioCount]);

  const pickPack = useCallback(
    async (pack: Pack, offerId: string) => {
      setChoice({ type: "pack", pack, offerId });
      setAssignLoading(true);
      setAssigned(await fetchRandom(pack.numberQuantity));
      setAssignLoading(false);
    },
    [fetchRandom],
  );

  const reshuffle = useCallback(async () => {
    const count = choice.type === "ratio" ? ratioCount : choice.type === "pack" ? choice.pack.numberQuantity : 0;
    if (count === 0) return;
    setAssignLoading(true);
    setAssigned(await fetchRandom(count));
    setAssignLoading(false);
  }, [choice, ratioCount, fetchRandom]);

  async function submitOrder() {
    setSubmitting(true);
    setOrderError(null);
    try {
      const campaign =
        choice.type === "none"
          ? null
          : choice.type === "ratio"
            ? { campaignId: numberOffer!.campaignId, numbers: assigned, offerId: numberOffer!.ratio!.offerId }
            : { campaignId: numberOffer!.campaignId, packId: choice.pack.id, numbers: assigned, offerId: choice.offerId };

      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sourceFlow: "ticket_first",
          ticket: { ticketTypeId: ticket.id, quantity },
          campaign,
          customer: {
            fullName: customer.fullName, cpf: customer.cpf, phone: customer.phone,
            email: customer.email, birthDate: customer.birthDate || null,
          },
          consents: { regulation: consent, terms: consent, privacy: consent, marketing },
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setOrderError(json.error ?? "Falha ao criar o pedido.");
        return;
      }
      setOrder(json as CreateOrderResult);
      setNowMs(Date.now());
      setStep(3);
    } catch {
      setOrderError("Falha de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyPix() {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.pixCopyPaste);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* indisponível */
    }
  }

  async function simulateApproval() {
    if (!order) return;
    await fetch("/api/pagamentos/sandbox/aprovar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ providerPaymentId: order.providerPaymentId }),
    });
    setStep(4);
  }

  if (!open) return null;

  const remainingMs = order ? new Date(order.expiresAt).getTime() - nowMs : 0;
  const mm = Math.max(0, Math.floor(remainingMs / 60000));
  const ss = Math.max(0, Math.floor((remainingMs % 60000) / 1000));
  const expired = order != null && remainingMs <= 0 && step === 3;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Checkout do ingresso">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} aria-hidden="true" />
      <div className="relative flex max-h-[92vh] w-full flex-col overflow-hidden border border-line bg-night sm:max-w-lg">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <p className="eyebrow">{step === 4 ? "Confirmação" : `Etapa ${step} de 3`}</p>
          <button type="button" onClick={close} aria-label="Fechar" className="text-2xl leading-none text-smoke transition-colors hover:text-white">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* ETAPA 1 — IDENTIFICAÇÃO */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border border-line bg-panel p-3">
                <div>
                  <p className="text-sm font-semibold text-white">{ticket.title}</p>
                  <p className="text-xs text-smoke">{quantity} × {formatPrice(ticket.priceCents)}{ticket.lotName ? ` · ${ticket.lotName}` : ""}</p>
                </div>
                <p className="font-mono text-sm font-semibold text-white">{formatPrice(ticketSubtotal)}</p>
              </div>
              <IdentityFields customer={customer} setCustomer={setCustomer} consent={consent} setConsent={setConsent} marketing={marketing} setMarketing={setMarketing} errors={errors} />
              <p className="text-xs leading-relaxed text-smoke/60">{TRANSPARENCY_NOTICE}</p>
            </div>
          )}

          {/* ETAPA 2 — OFERTA DE NÚMEROS */}
          {step === 2 && (
            <div className="space-y-4">
              {numberOffer?.imageUrl && (
                <div className="relative aspect-[16/9] overflow-hidden border border-line">
                  <Image
                    src={numberOffer.imageUrl}
                    alt={numberOffer.prizeTitle}
                    fill
                    sizes="(max-width: 640px) 100vw, 480px"
                    className="object-cover object-[center_72%]"
                  />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/20 to-transparent" />
                  <div className="absolute bottom-2 left-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-smoke">O prêmio</p>
                    <p className="display text-lg text-white">{numberOffer.prizeTitle}</p>
                  </div>
                </div>
              )}
              <div>
                <p className="font-semibold text-white">
                  Quer também concorrer ao {numberOffer?.prizeTitle ?? "Gol vermelho"}?
                </p>
                <p className="mt-1 text-sm leading-relaxed text-smoke">
                  A apuração acontecerá durante este evento. Escolha seus números ou um pack e participe da campanha.
                </p>
              </div>

              {numberOffer?.ratio && ratioCount > 0 && (
                <OfferCard
                  active={choice.type === "ratio"}
                  title={`${quantity} ${quantity === 1 ? "ingresso" : "ingressos"} + ${ratioCount} ${ratioCount === 1 ? "número" : "números"}`}
                  price={formatPrice(ratioCount * numberOffer.ratio.promoPriceCents)}
                  cta={`Adicionar ${ratioCount} ${ratioCount === 1 ? "número" : "números"}`}
                  onSelect={pickRatio}
                />
              )}
              {numberOffer?.packs.map(({ offerId, pack }) => (
                <OfferCard
                  key={offerId}
                  active={choice.type === "pack" && choice.pack.id === pack.id}
                  title={pack.title}
                  price={formatPrice(pack.promotionalPriceCents)}
                  cta={`Escolher ${pack.title.toLowerCase()}`}
                  onSelect={() => pickPack(pack, offerId)}
                />
              ))}

              {choice.type !== "none" && (
                <div className="border border-signal/40 bg-signal/5 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.14em] text-smoke">Seus números</p>
                    <button type="button" onClick={reshuffle} disabled={assignLoading} className="text-xs font-semibold uppercase tracking-[0.1em] text-signal hover:underline disabled:opacity-50">
                      {assignLoading ? "…" : "Trocar"}
                    </button>
                  </div>
                  {numberOffer && <NumbersChips numbers={assigned} padding={numberOffer.numberPadding} />}
                </div>
              )}

              <button type="button" onClick={() => { setChoice({ type: "none" }); setAssigned([]); }}
                className={`w-full border py-3 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${choice.type === "none" ? "border-signal text-signal" : "border-line text-smoke hover:text-white"}`}>
                Continuar somente com os ingressos
              </button>

              <dl className="space-y-1.5 border-t border-line pt-4 text-sm">
                <div className="flex justify-between text-smoke"><dt>{quantity} × ingresso</dt><dd className="font-mono text-white">{formatPrice(ticketSubtotal)}</dd></div>
                {campaignSubtotal > 0 && <div className="flex justify-between text-smoke"><dt>Números da campanha</dt><dd className="font-mono text-white">{formatPrice(campaignSubtotal)}</dd></div>}
                <div className="flex justify-between border-t border-line pt-2 text-base font-semibold text-white"><dt>Total</dt><dd className="font-mono">{formatPrice(combinedTotal)}</dd></div>
              </dl>
              {orderError && <p className="field-error">{orderError}</p>}
            </div>
          )}

          {/* ETAPA 3 — PIX */}
          {step === 3 && order && (
            <PixStep order={order} mm={mm} ss={ss} expired={expired} copied={copied} onCopy={copyPix} sandbox={sandbox} onSimulate={simulateApproval} />
          )}

          {/* ETAPA 4 — CONFIRMAÇÃO */}
          {step === 4 && order && (
            <div className="space-y-5">
              <div className="text-center">
                <p className="display text-3xl text-white">Pagamento aprovado</p>
                <p className="mt-2 text-sm text-smoke">Seu ingresso{choice.type !== "none" ? " e seus números estão" : " está"} confirmado{choice.type !== "none" ? "s" : ""}.</p>
              </div>
              <div className="border border-line bg-panel p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-smoke">Seu ingresso</p>
                <p className="mt-1 font-semibold text-white">{event.title}</p>
                <p className="text-sm text-smoke">{quantity} × {ticket.title} · {event.location} · pedido <span className="font-mono text-white">{order.orderCode}</span></p>
              </div>
              {choice.type !== "none" && numberOffer && (
                <div className="border border-line bg-panel p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-smoke">Seus números</p>
                  <NumbersChips numbers={assigned} padding={numberOffer.numberPadding} />
                </div>
              )}
              <p className="text-xs leading-relaxed text-smoke/70">{TRANSPARENCY_NOTICE}</p>
            </div>
          )}
        </div>

        <div className="border-t border-line p-5">
          {step === 1 && (
            <div className="flex items-center gap-3">
              <button type="button" onClick={close} className="border border-line px-5 py-3 text-sm font-bold uppercase tracking-[0.1em] text-white transition-colors hover:border-signal hover:text-signal">Cancelar</button>
              <button type="button" onClick={() => { const e = validateCustomer(customer, consent); setErrors(e); if (Object.keys(e).length === 0) setStep(2); }}
                className="flex-1 bg-signal py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark" style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}>Continuar</button>
            </div>
          )}
          {step === 2 && (
            <div className="flex flex-col gap-2.5">
              <button type="button" onClick={submitOrder} disabled={submitting || assignLoading}
                className="bg-signal py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark disabled:opacity-60" style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}>
                {submitting ? "Gerando Pix…" : `Pagar ${formatPrice(combinedTotal)} com Pix`}
              </button>
              <button type="button" onClick={() => setStep(1)} className="text-xs font-semibold uppercase tracking-[0.1em] text-smoke transition-colors hover:text-signal">Voltar</button>
            </div>
          )}
          {(step === 3 || step === 4) && (
            <button type="button" onClick={close} className="w-full border border-line py-3 text-sm font-bold uppercase tracking-[0.1em] text-white transition-colors hover:border-signal hover:text-signal">{step === 4 ? "Concluir" : "Fechar"}</button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function OfferCard({ active, title, price, cta, onSelect }: { active: boolean; title: string; price: string; cta: string; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} aria-pressed={active}
      className={`flex w-full items-center justify-between gap-3 border p-4 text-left transition-colors ${active ? "border-signal bg-signal/10" : "border-line bg-panel hover:border-signal/60"}`}>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-0.5 font-mono text-sm text-signal">{price}</p>
      </div>
      <span className={`shrink-0 text-xs font-bold uppercase tracking-[0.1em] ${active ? "text-signal" : "text-smoke"}`}>{active ? "Selecionado" : cta}</span>
    </button>
  );
}
