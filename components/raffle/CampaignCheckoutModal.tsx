"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { formatPrice } from "@/lib/format";
import { padNumber } from "@/lib/raffle/types";
import type { RaffleCampaign } from "@/lib/raffle/types";
import type { Pack, CreateOrderResult } from "@/lib/checkout/types";
import type { TicketOffer } from "@/lib/checkout/queries";

export const TRANSPARENCY_NOTICE =
  "A participação na campanha e o ingresso do evento são produtos distintos. A apuração e a premiação acontecerão durante o evento. Consulte o regulamento e as condições de participação.";

const digits = (v: string) => v.replace(/\D/g, "");
const maskCPF = (v: string) =>
  digits(v)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
const maskPhone = (v: string) => {
  const d = digits(v).slice(0, 11);
  return d.length <= 10
    ? d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2")
    : d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
};
function isValidCPF(v: string): boolean {
  const c = digits(v);
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += +c[i] * (10 - i);
  let d1 = (s * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== +c[9]) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += +c[i] * (11 - i);
  let d2 = (s * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === +c[10];
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  campaign: RaffleCampaign;
  planKind: "free" | "pack" | null;
  pack: Pack | null;
  numbers: number[];
  subtotalCents: number;
  ticketOffer: TicketOffer | null;
  sandbox: boolean;
}

const emptyCustomer = { fullName: "", cpf: "", phone: "", phoneConfirm: "", email: "", birthDate: "" };

export default function CampaignCheckoutModal({
  open,
  onClose,
  campaign,
  planKind,
  pack,
  numbers,
  subtotalCents,
  ticketOffer,
  sandbox,
}: ModalProps) {
  // 1 Identificação · 2 Oferta · 3 Pix · 4 Confirmação
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState(emptyCustomer);
  const [consent, setConsent] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ticketQty, setTicketQty] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [order, setOrder] = useState<CreateOrderResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [nowMs, setNowMs] = useState(0);

  const isPack = planKind === "pack" && pack != null;
  const ticketSubtotal = ticketOffer ? ticketQty * ticketOffer.ticket.priceCents : 0;
  const combinedTotal = subtotalCents + ticketSubtotal;

  const close = useCallback(() => {
    setStep(1);
    setCustomer(emptyCustomer);
    setConsent(false);
    setMarketing(false);
    setErrors({});
    setTicketQty(0);
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

  if (!open) return null;

  function validateIdentity(): boolean {
    const e: Record<string, string> = {};
    if (customer.fullName.trim().length < 3) e.fullName = "Informe seu nome completo.";
    if (!isValidCPF(customer.cpf)) e.cpf = "CPF inválido.";
    if (digits(customer.phone).length < 10) e.phone = "WhatsApp inválido.";
    if (digits(customer.phoneConfirm) !== digits(customer.phone)) e.phoneConfirm = "Os números não conferem.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) e.email = "E-mail inválido.";
    if (!consent) e.consent = "É necessário aceitar para continuar.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submitOrder() {
    setSubmitting(true);
    setOrderError(null);
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sourceFlow: "campaign_first",
          campaign: { campaignId: campaign.id, packId: pack?.id ?? null, numbers },
          ticket:
            ticketQty > 0 && ticketOffer
              ? { ticketTypeId: ticketOffer.ticket.id, quantity: ticketQty, offerId: ticketOffer.offerId }
              : null,
          customer: {
            fullName: customer.fullName,
            cpf: customer.cpf,
            phone: customer.phone,
            email: customer.email,
            birthDate: customer.birthDate || null,
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
      /* clipboard indisponível */
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

  const remainingMs = order ? new Date(order.expiresAt).getTime() - nowMs : 0;
  const mm = Math.max(0, Math.floor(remainingMs / 60000));
  const ss = Math.max(0, Math.floor((remainingMs % 60000) / 1000));
  const expired = order != null && remainingMs <= 0 && step === 3;

  const field =
    "w-full bg-panel border border-line px-3 py-2.5 text-sm text-white focus:border-signal focus:outline-none";

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Checkout da campanha">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} aria-hidden="true" />

      <div className="relative flex max-h-[92vh] w-full flex-col overflow-hidden border border-line bg-night sm:max-w-lg">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <p className="eyebrow">{step === 4 ? "Confirmação" : `Etapa ${step} de 3`}</p>
          <button type="button" onClick={close} aria-label="Fechar" className="text-2xl leading-none text-smoke transition-colors hover:text-white">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* ---------- ETAPA 1 — IDENTIFICAÇÃO (com resumo compacto) ---------- */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="border border-line bg-panel p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">
                    {isPack ? pack.title : `${numbers.length} ${numbers.length === 1 ? "número" : "números"}`}
                  </p>
                  <p className="font-mono text-sm font-semibold text-white">{formatPrice(subtotalCents)}</p>
                </div>
                <NumbersChips numbers={numbers} padding={campaign.numberPadding} compact />
              </div>

              <Input label="Nome completo" value={customer.fullName} error={errors.fullName}
                onChange={(v) => setCustomer((c) => ({ ...c, fullName: v }))} className={field} />
              <Input label="CPF" value={customer.cpf} error={errors.cpf} inputMode="numeric"
                onChange={(v) => setCustomer((c) => ({ ...c, cpf: maskCPF(v) }))} className={field} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="WhatsApp" value={customer.phone} error={errors.phone} inputMode="numeric"
                  onChange={(v) => setCustomer((c) => ({ ...c, phone: maskPhone(v) }))} className={field} />
                <Input label="Confirmar WhatsApp" value={customer.phoneConfirm} error={errors.phoneConfirm} inputMode="numeric"
                  onChange={(v) => setCustomer((c) => ({ ...c, phoneConfirm: maskPhone(v) }))} className={field} />
              </div>
              <Input label="E-mail" value={customer.email} error={errors.email} inputMode="email"
                onChange={(v) => setCustomer((c) => ({ ...c, email: v }))} className={field} />

              <label className="flex items-start gap-2.5 pt-1">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-signal" />
                <span className="text-[13px] leading-relaxed text-smoke">
                  Li e concordo com o Regulamento da Campanha, os Termos de Uso e a Política de Privacidade.
                </span>
              </label>
              {errors.consent && <p className="field-error">{errors.consent}</p>}

              <label className="flex items-start gap-2.5">
                <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-signal" />
                <span className="text-[13px] leading-relaxed text-smoke/80">Quero receber novidades da Baixudos.PR (opcional).</span>
              </label>
              <p className="text-xs leading-relaxed text-smoke/60">{TRANSPARENCY_NOTICE}</p>
            </div>
          )}

          {/* ---------- ETAPA 2 — OFERTA DE INGRESSO ---------- */}
          {step === 2 && (
            <div className="space-y-5">
              {ticketOffer ? (
                <>
                  <div className="border border-signal/40 bg-signal/5 p-4">
                    <p className="font-semibold text-white">{ticketOffer.title}</p>
                    {ticketOffer.description && <p className="mt-1.5 text-sm leading-relaxed text-smoke">{ticketOffer.description}</p>}
                    <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{ticketOffer.ticket.title}</p>
                        <p className="text-xs text-smoke">{ticketOffer.ticket.lotName} · {formatPrice(ticketOffer.ticket.priceCents)} cada</p>
                      </div>
                      <QtyStepper value={ticketQty} max={ticketOffer.ticket.maxPerCustomer} onChange={setTicketQty} />
                    </div>
                  </div>
                  <dl className="space-y-1.5 border-t border-line pt-4 text-sm">
                    <div className="flex justify-between text-smoke">
                      <dt>{isPack ? pack.title : `${numbers.length} números`}</dt>
                      <dd className="font-mono text-white">{formatPrice(subtotalCents)}</dd>
                    </div>
                    {ticketQty > 0 && (
                      <div className="flex justify-between text-smoke">
                        <dt>{ticketQty} × ingresso</dt>
                        <dd className="font-mono text-white">{formatPrice(ticketSubtotal)}</dd>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-line pt-2 text-base font-semibold text-white">
                      <dt>Total</dt>
                      <dd className="font-mono">{formatPrice(combinedTotal)}</dd>
                    </div>
                  </dl>
                </>
              ) : (
                <p className="text-sm text-smoke">Tudo certo. Continue para o pagamento.</p>
              )}
              {orderError && <p className="field-error">{orderError}</p>}
            </div>
          )}

          {/* ---------- ETAPA 3 — PIX ---------- */}
          {step === 3 && order && (
            <div className="space-y-5">
              {expired ? (
                <div className="space-y-3 py-6 text-center">
                  <p className="display text-2xl text-white">Reserva expirada</p>
                  <p className="mx-auto max-w-sm text-sm text-smoke">O tempo para pagamento acabou e os números foram liberados. Feche e escolha novamente.</p>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-smoke">Pague com Pix</p>
                    <p className="mt-1 font-mono text-3xl font-semibold text-white">{formatPrice(order.totalCents)}</p>
                    <p className="mt-1 text-xs text-smoke">Expira em <span className="font-mono text-signal">{String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}</span></p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-smoke">Pix copia e cola</p>
                    <div className="mt-2 flex items-stretch gap-2">
                      <code className="flex-1 overflow-x-auto whitespace-nowrap border border-line bg-panel px-3 py-2.5 font-mono text-xs text-smoke">{order.pixCopyPaste}</code>
                      <button type="button" onClick={copyPix} className="shrink-0 bg-signal px-4 text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-signal-dark">{copied ? "Copiado" : "Copiar"}</button>
                    </div>
                  </div>
                  {order.qrCodeBase64 && (
                    <div className="flex justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`data:image/png;base64,${order.qrCodeBase64}`} alt="QR Code Pix" className="h-44 w-44 border border-line bg-white p-2" />
                    </div>
                  )}
                  <p className="text-center text-xs text-smoke">Pedido <span className="font-mono text-white">{order.orderCode}</span> · aguardando pagamento…</p>
                  {sandbox && (
                    <button type="button" onClick={simulateApproval} className="w-full border border-signal/50 py-3 text-xs font-bold uppercase tracking-[0.1em] text-signal transition-colors hover:bg-signal hover:text-white">
                      Simular pagamento aprovado (sandbox)
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* ---------- ETAPA 4 — CONFIRMAÇÃO ---------- */}
          {step === 4 && order && (
            <div className="space-y-5">
              <div className="text-center">
                <p className="display text-3xl text-white">Pagamento aprovado</p>
                <p className="mt-2 text-sm text-smoke">Seus números{ticketQty > 0 ? " e seu ingresso estão" : " estão"} confirmados.</p>
              </div>
              <div className="border border-line bg-panel p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-smoke">Seus números</p>
                <NumbersChips numbers={numbers} padding={campaign.numberPadding} />
                <p className="mt-3 text-xs text-smoke">Apuração: {campaign.drawAt ? new Date(campaign.drawAt).toLocaleDateString("pt-BR") : "a confirmar"} · pedido <span className="font-mono text-white">{order.orderCode}</span></p>
              </div>
              {ticketQty > 0 && ticketOffer && (
                <div className="border border-line bg-panel p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-smoke">Seu ingresso</p>
                  <p className="mt-1 font-semibold text-white">{ticketOffer.event.title}</p>
                  <p className="text-sm text-smoke">{ticketQty} × {ticketOffer.ticket.title} · {ticketOffer.event.location}</p>
                </div>
              )}
              <p className="text-xs leading-relaxed text-smoke/70">{TRANSPARENCY_NOTICE}</p>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="border-t border-line p-5">
          {step === 1 && (
            <div className="flex items-center gap-3">
              <button type="button" onClick={close} className="border border-line px-5 py-3 text-sm font-bold uppercase tracking-[0.1em] text-white transition-colors hover:border-signal hover:text-signal">Cancelar</button>
              <button type="button" onClick={() => validateIdentity() && setStep(2)} className="flex-1 bg-signal py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark" style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}>Continuar</button>
            </div>
          )}
          {step === 2 && (
            <div className="flex flex-col gap-2.5">
              <button type="button" onClick={submitOrder} disabled={submitting} className="bg-signal py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark disabled:opacity-60" style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}>
                {submitting ? "Gerando Pix…" : ticketQty > 0 ? `Pagar ${formatPrice(combinedTotal)} com Pix` : `Pagar ${formatPrice(subtotalCents)} com Pix`}
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

function NumbersChips({ numbers, padding, compact }: { numbers: number[]; padding: number; compact?: boolean }) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${compact ? "mt-2" : "mt-2"}`}>
      {numbers.map((n) => (
        <span key={n} className="border border-signal/50 bg-signal/10 px-2 py-1 font-mono text-xs text-white tabular-nums">{padNumber(n, padding)}</span>
      ))}
    </div>
  );
}

function Input({ label, value, onChange, error, className, inputMode }: { label: string; value: string; onChange: (v: string) => void; error?: string; className: string; inputMode?: "numeric" | "email" | "text" }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-smoke">{label}</label>
      <input value={value} inputMode={inputMode} onChange={(e) => onChange(e.target.value)} className={className} aria-invalid={error ? true : undefined} />
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function QtyStepper({ value, max, onChange }: { value: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center border border-line">
      <button type="button" aria-label="Diminuir" onClick={() => onChange(Math.max(0, value - 1))} className="px-3 py-2 text-white transition-colors hover:text-signal">−</button>
      <span className="min-w-8 text-center font-mono text-sm text-white tabular-nums">{value}</span>
      <button type="button" aria-label="Aumentar" onClick={() => onChange(Math.min(max, value + 1))} className="px-3 py-2 text-white transition-colors hover:text-signal">+</button>
    </div>
  );
}
