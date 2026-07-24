"use client";

import { formatPrice } from "@/lib/format";
import { padNumber } from "@/lib/raffle/types";
import type { CreateOrderResult } from "@/lib/checkout/types";

export const TRANSPARENCY_NOTICE =
  "A participação na campanha e o ingresso do evento são produtos distintos. A apuração e a premiação acontecerão durante o evento. Consulte o regulamento e as condições de participação.";

export const digits = (v: string) => v.replace(/\D/g, "");

export const maskCPF = (v: string) =>
  digits(v)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

export const maskPhone = (v: string) => {
  const d = digits(v).slice(0, 11);
  return d.length <= 10
    ? d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2")
    : d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
};

export function isValidCPF(v: string): boolean {
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

export const fieldClass =
  "w-full bg-panel border border-line px-3 py-2.5 text-sm text-white focus:border-signal focus:outline-none";

export function NumbersChips({ numbers, padding }: { numbers: number[]; padding: number }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {numbers.map((n) => (
        <span
          key={n}
          className="border border-signal/50 bg-signal/10 px-2 py-1 font-mono text-xs text-white tabular-nums"
        >
          {padNumber(n, padding)}
        </span>
      ))}
    </div>
  );
}

export function Input({
  label, value, onChange, error, inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  inputMode?: "numeric" | "email" | "text";
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-smoke">{label}</label>
      <input value={value} inputMode={inputMode} onChange={(e) => onChange(e.target.value)} className={fieldClass} aria-invalid={error ? true : undefined} />
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export function QtyStepper({ value, min = 0, max, onChange }: { value: number; min?: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center border border-line">
      <button type="button" aria-label="Diminuir" onClick={() => onChange(Math.max(min, value - 1))} className="px-3 py-2 text-white transition-colors hover:text-signal">−</button>
      <span className="min-w-8 text-center font-mono text-sm text-white tabular-nums">{value}</span>
      <button type="button" aria-label="Aumentar" onClick={() => onChange(Math.min(max, value + 1))} className="px-3 py-2 text-white transition-colors hover:text-signal">+</button>
    </div>
  );
}

/** Identificação: campos + consentimento. Estado controlado pelo pai. */
export interface CustomerForm {
  fullName: string;
  cpf: string;
  phone: string;
  phoneConfirm: string;
  email: string;
  birthDate: string;
}
export const emptyCustomer: CustomerForm = { fullName: "", cpf: "", phone: "", phoneConfirm: "", email: "", birthDate: "" };

export function validateCustomer(c: CustomerForm, consent: boolean): Record<string, string> {
  const e: Record<string, string> = {};
  if (c.fullName.trim().length < 3) e.fullName = "Informe seu nome completo.";
  if (!isValidCPF(c.cpf)) e.cpf = "CPF inválido.";
  if (digits(c.phone).length < 10) e.phone = "WhatsApp inválido.";
  if (digits(c.phoneConfirm) !== digits(c.phone)) e.phoneConfirm = "Os números não conferem.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) e.email = "E-mail inválido.";
  if (!consent) e.consent = "É necessário aceitar para continuar.";
  return e;
}

export function IdentityFields({
  customer, setCustomer, consent, setConsent, marketing, setMarketing, errors,
}: {
  customer: CustomerForm;
  setCustomer: (f: (c: CustomerForm) => CustomerForm) => void;
  consent: boolean;
  setConsent: (v: boolean) => void;
  marketing: boolean;
  setMarketing: (v: boolean) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <Input label="Nome completo" value={customer.fullName} error={errors.fullName} onChange={(v) => setCustomer((c) => ({ ...c, fullName: v }))} />
      <Input label="CPF" value={customer.cpf} error={errors.cpf} inputMode="numeric" onChange={(v) => setCustomer((c) => ({ ...c, cpf: maskCPF(v) }))} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="WhatsApp" value={customer.phone} error={errors.phone} inputMode="numeric" onChange={(v) => setCustomer((c) => ({ ...c, phone: maskPhone(v) }))} />
        <Input label="Confirmar WhatsApp" value={customer.phoneConfirm} error={errors.phoneConfirm} inputMode="numeric" onChange={(v) => setCustomer((c) => ({ ...c, phoneConfirm: maskPhone(v) }))} />
      </div>
      <Input label="E-mail" value={customer.email} error={errors.email} inputMode="email" onChange={(v) => setCustomer((c) => ({ ...c, email: v }))} />
      <label className="flex items-start gap-2.5 pt-1">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-signal" />
        <span className="text-[13px] leading-relaxed text-smoke">Li e concordo com o Regulamento da Campanha, os Termos de Uso e a Política de Privacidade.</span>
      </label>
      {errors.consent && <p className="field-error">{errors.consent}</p>}
      <label className="flex items-start gap-2.5">
        <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-signal" />
        <span className="text-[13px] leading-relaxed text-smoke/80">Quero receber novidades da Baixudos.PR (opcional).</span>
      </label>
    </div>
  );
}

/** Etapa Pix (render puro). O estado/polling é do pai. */
export function PixStep({
  order, mm, ss, expired, copied, onCopy, sandbox, onSimulate,
}: {
  order: CreateOrderResult;
  mm: number;
  ss: number;
  expired: boolean;
  copied: boolean;
  onCopy: () => void;
  sandbox: boolean;
  onSimulate: () => void;
}) {
  if (expired) {
    return (
      <div className="space-y-3 py-6 text-center">
        <p className="display text-2xl text-white">Reserva expirada</p>
        <p className="mx-auto max-w-sm text-sm text-smoke">O tempo para pagamento acabou e os itens foram liberados. Feche e tente novamente.</p>
      </div>
    );
  }
  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-[0.16em] text-smoke">Pague com Pix</p>
        <p className="mt-1 font-mono text-3xl font-semibold text-white">{formatPrice(order.totalCents)}</p>
        <p className="mt-1 text-xs text-smoke">Expira em <span className="font-mono text-signal">{String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}</span></p>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-smoke">Pix copia e cola</p>
        <div className="mt-2 flex items-stretch gap-2">
          <code className="flex-1 overflow-x-auto whitespace-nowrap border border-line bg-panel px-3 py-2.5 font-mono text-xs text-smoke">{order.pixCopyPaste}</code>
          <button type="button" onClick={onCopy} className="shrink-0 bg-signal px-4 text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-signal-dark">{copied ? "Copiado" : "Copiar"}</button>
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
        <button type="button" onClick={onSimulate} className="w-full border border-signal/50 py-3 text-xs font-bold uppercase tracking-[0.1em] text-signal transition-colors hover:bg-signal hover:text-white">
          Simular pagamento aprovado (sandbox)
        </button>
      )}
    </div>
  );
}
