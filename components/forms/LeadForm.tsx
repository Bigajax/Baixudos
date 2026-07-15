"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { waLink } from "@/lib/wa";

const schema = z.object({
  name: z.string().min(2, "Informe seu nome"),
  whatsapp: z.string().min(10, "Informe um WhatsApp válido com DDD"),
  city: z.string().min(2, "Informe sua cidade"),
  consent: z.literal(true, { error: "É preciso autorizar o contato" }),
});

type FormData = z.infer<typeof schema>;

export default function LeadForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    const message = [
      "Olá! Quero entrar na lista de avisos da Baixudos.PR.",
      `Nome: ${data.name}`,
      `WhatsApp: ${data.whatsapp}`,
      `Cidade: ${data.city}`,
    ].join("\n");
    window.open(waLink(message), "_blank", "noopener,noreferrer");
    setSent(true);
  };

  if (sent) {
    return (
      <p className="mt-6 border border-signal/40 bg-signal/10 p-4 text-sm text-white">
        Cadastro encaminhado! Finalize o envio na janela do WhatsApp que acabou de abrir.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
      <div>
        <label htmlFor="lead-name" className="field-label">
          Nome
        </label>
        <input id="lead-name" type="text" className="field" placeholder="Seu nome" {...register("name")} />
        {errors.name && <p className="field-error">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="lead-whats" className="field-label">
          WhatsApp
        </label>
        <input
          id="lead-whats"
          type="tel"
          className="field"
          placeholder="(44) 90000-0000"
          {...register("whatsapp")}
        />
        {errors.whatsapp && <p className="field-error">{errors.whatsapp.message}</p>}
      </div>
      <div>
        <label htmlFor="lead-city" className="field-label">
          Cidade
        </label>
        <input id="lead-city" type="text" className="field" placeholder="Sua cidade" {...register("city")} />
        {errors.city && <p className="field-error">{errors.city.message}</p>}
      </div>
      <label className="flex cursor-pointer items-start gap-2 text-xs text-smoke">
        <input type="checkbox" className="mt-0.5 accent-signal" {...register("consent")} />
        Autorizo o contato da Baixudos.PR pelos dados informados.
      </label>
      {errors.consent && <p className="field-error">{errors.consent.message}</p>}
      <button
        type="submit"
        className="w-full bg-signal py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark"
      >
        Quero receber as novidades
      </button>
    </form>
  );
}
