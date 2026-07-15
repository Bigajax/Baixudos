"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { waLink } from "@/lib/wa";
import { partnerInterests } from "@/content/sponsors";

const schema = z.object({
  name: z.string().min(3, "Informe seu nome"),
  company: z.string().min(2, "Informe a empresa"),
  segment: z.string().min(2, "Informe o segmento"),
  phone: z.string().min(10, "Informe um telefone válido com DDD"),
  email: z.string().email("Informe um e-mail válido"),
  instagram: z.string().optional(),
  interest: z.enum(partnerInterests, { error: "Escolha o tipo de interesse" }),
  message: z.string().min(10, "Conte um pouco sobre o que sua marca procura"),
});

type FormData = z.infer<typeof schema>;

export default function PartnerForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    const text = [
      "🤝 CONTATO COMERCIAL — Baixudos.PR",
      "",
      `Nome: ${data.name}`,
      `Empresa: ${data.company}`,
      `Segmento: ${data.segment}`,
      `Telefone: ${data.phone}`,
      `E-mail: ${data.email}`,
      data.instagram ? `Instagram: ${data.instagram}` : null,
      `Interesse: ${data.interest}`,
      "",
      `Mensagem: ${data.message}`,
    ]
      .filter((l) => l !== null)
      .join("\n");

    window.open(waLink(text), "_blank", "noopener,noreferrer");
    setSent(true);
  };

  if (sent) {
    return (
      <div className="border border-signal/40 bg-signal/10 p-6">
        <h3 className="display text-xl text-white">Contato encaminhado!</h3>
        <p className="mt-2 text-sm leading-relaxed text-smoke">
          Finalize o envio na janela do WhatsApp que acabou de abrir. A equipe comercial retorna
          com os formatos de participação disponíveis.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="p-name" className="field-label">Nome *</label>
          <input id="p-name" type="text" className="field" autoComplete="name" {...register("name")} />
          {errors.name && <p className="field-error">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="p-company" className="field-label">Empresa *</label>
          <input id="p-company" type="text" className="field" autoComplete="organization" {...register("company")} />
          {errors.company && <p className="field-error">{errors.company.message}</p>}
        </div>
        <div>
          <label htmlFor="p-segment" className="field-label">Segmento *</label>
          <input id="p-segment" type="text" className="field" placeholder="Ex.: acessórios automotivos" {...register("segment")} />
          {errors.segment && <p className="field-error">{errors.segment.message}</p>}
        </div>
        <div>
          <label htmlFor="p-phone" className="field-label">Telefone *</label>
          <input id="p-phone" type="tel" className="field" placeholder="(44) 90000-0000" autoComplete="tel" {...register("phone")} />
          {errors.phone && <p className="field-error">{errors.phone.message}</p>}
        </div>
        <div>
          <label htmlFor="p-email" className="field-label">E-mail *</label>
          <input id="p-email" type="email" className="field" autoComplete="email" {...register("email")} />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="p-insta" className="field-label">Instagram da empresa</label>
          <input id="p-insta" type="text" className="field" placeholder="@suaempresa" {...register("instagram")} />
        </div>
      </div>
      <div>
        <label htmlFor="p-interest" className="field-label">Tipo de interesse *</label>
        <select id="p-interest" className="field" defaultValue="" {...register("interest")}>
          <option value="" disabled>
            Selecione
          </option>
          {partnerInterests.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
        {errors.interest && <p className="field-error">{errors.interest.message}</p>}
      </div>
      <div>
        <label htmlFor="p-message" className="field-label">Mensagem *</label>
        <textarea
          id="p-message"
          rows={4}
          className="field resize-y"
          placeholder="O que sua marca procura no evento?"
          {...register("message")}
        />
        {errors.message && <p className="field-error">{errors.message.message}</p>}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-signal py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark disabled:opacity-60 sm:w-auto sm:px-10"
        style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
      >
        Enviar contato comercial
      </button>
    </form>
  );
}
