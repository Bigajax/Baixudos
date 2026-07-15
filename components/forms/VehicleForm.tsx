"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { waLink } from "@/lib/wa";

export const vehicleCategories = [
  "Rebaixado",
  "Suspensão fixa",
  "Suspensão a ar",
  "Projeto de rodas",
  "Som automotivo",
  "Clássico",
  "Performance",
  "Customizado",
  "Outro",
] as const;

const MAX_PHOTOS = 6;
const MAX_PHOTO_MB = 8;

const schema = z.object({
  name: z.string().min(3, "Informe seu nome completo"),
  whatsapp: z.string().min(10, "Informe um WhatsApp válido com DDD"),
  email: z.string().email("Informe um e-mail válido"),
  instagram: z.string().optional(),
  city: z.string().min(2, "Informe sua cidade"),
  state: z.string().min(2, "Informe seu estado"),
  brand: z.string().min(2, "Informe a marca do veículo"),
  model: z.string().min(1, "Informe o modelo"),
  year: z.string().min(4, "Informe o ano"),
  modifications: z.string().min(10, "Descreva as principais modificações"),
  category: z.enum(vehicleCategories, { error: "Escolha a categoria do projeto" }),
  story: z.string().min(20, "Conte um pouco da história do carro"),
  terms: z.literal(true, { error: "É preciso aceitar os termos" }),
  contactConsent: z.literal(true, { error: "É preciso autorizar o contato" }),
});

type FormData = z.infer<typeof schema>;

export default function VehicleForm() {
  const [sent, setSent] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoCount, setPhotoCount] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPhotoError(null);
    if (files.length > MAX_PHOTOS) {
      setPhotoError(`Envie no máximo ${MAX_PHOTOS} fotos.`);
      e.target.value = "";
      setPhotoCount(0);
      return;
    }
    const tooBig = files.find((f) => f.size > MAX_PHOTO_MB * 1024 * 1024);
    if (tooBig) {
      setPhotoError(`Cada foto deve ter no máximo ${MAX_PHOTO_MB} MB.`);
      e.target.value = "";
      setPhotoCount(0);
      return;
    }
    const notImage = files.find((f) => !f.type.startsWith("image/"));
    if (notImage) {
      setPhotoError("Envie apenas arquivos de imagem (JPG, PNG ou WebP).");
      e.target.value = "";
      setPhotoCount(0);
      return;
    }
    setPhotoCount(files.length);
  };

  const onSubmit = (data: FormData) => {
    const message = [
      "🏁 INSCRIÇÃO DE PROJETO — Baixudos.PR",
      "",
      `Nome: ${data.name}`,
      `WhatsApp: ${data.whatsapp}`,
      `E-mail: ${data.email}`,
      data.instagram ? `Instagram: ${data.instagram}` : null,
      `Cidade/UF: ${data.city} — ${data.state}`,
      "",
      `Veículo: ${data.brand} ${data.model} ${data.year}`,
      `Categoria: ${data.category}`,
      `Modificações: ${data.modifications}`,
      "",
      `História do projeto: ${data.story}`,
      "",
      `Fotos selecionadas: ${photoCount} (envio na sequência pelo WhatsApp)`,
    ]
      .filter((l) => l !== null)
      .join("\n");

    window.open(waLink(message), "_blank", "noopener,noreferrer");
    setSent(true);
  };

  if (sent) {
    return (
      <div className="border border-signal/40 bg-signal/10 p-6">
        <h3 className="display text-xl text-white">Inscrição encaminhada!</h3>
        <p className="mt-2 text-sm leading-relaxed text-smoke">
          Finalize o envio na janela do WhatsApp que acabou de abrir e anexe as fotos do projeto
          na conversa. Nossa equipe avalia cada inscrição e responde por lá — a inscrição não
          garante aprovação automática.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      <fieldset className="space-y-4">
        <legend className="eyebrow mb-4">Seus dados</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="v-name" className="field-label">Nome completo *</label>
            <input id="v-name" type="text" className="field" autoComplete="name" {...register("name")} />
            {errors.name && <p className="field-error">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="v-whats" className="field-label">WhatsApp *</label>
            <input id="v-whats" type="tel" className="field" placeholder="(44) 90000-0000" autoComplete="tel" {...register("whatsapp")} />
            {errors.whatsapp && <p className="field-error">{errors.whatsapp.message}</p>}
          </div>
          <div>
            <label htmlFor="v-email" className="field-label">E-mail *</label>
            <input id="v-email" type="email" className="field" autoComplete="email" {...register("email")} />
            {errors.email && <p className="field-error">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="v-insta" className="field-label">Instagram</label>
            <input id="v-insta" type="text" className="field" placeholder="@seuperfil" {...register("instagram")} />
          </div>
          <div>
            <label htmlFor="v-city" className="field-label">Cidade *</label>
            <input id="v-city" type="text" className="field" {...register("city")} />
            {errors.city && <p className="field-error">{errors.city.message}</p>}
          </div>
          <div>
            <label htmlFor="v-state" className="field-label">Estado *</label>
            <input id="v-state" type="text" className="field" placeholder="PR" {...register("state")} />
            {errors.state && <p className="field-error">{errors.state.message}</p>}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="eyebrow mb-4">O projeto</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="v-brand" className="field-label">Marca *</label>
            <input id="v-brand" type="text" className="field" placeholder="Volkswagen" {...register("brand")} />
            {errors.brand && <p className="field-error">{errors.brand.message}</p>}
          </div>
          <div>
            <label htmlFor="v-model" className="field-label">Modelo *</label>
            <input id="v-model" type="text" className="field" placeholder="Jetta" {...register("model")} />
            {errors.model && <p className="field-error">{errors.model.message}</p>}
          </div>
          <div>
            <label htmlFor="v-year" className="field-label">Ano *</label>
            <input id="v-year" type="text" className="field" placeholder="2014" inputMode="numeric" {...register("year")} />
            {errors.year && <p className="field-error">{errors.year.message}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="v-category" className="field-label">Categoria do projeto *</label>
          <select id="v-category" className="field" defaultValue="" {...register("category")}>
            <option value="" disabled>
              Selecione a categoria
            </option>
            {vehicleCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.category && <p className="field-error">{errors.category.message}</p>}
        </div>
        <div>
          <label htmlFor="v-mods" className="field-label">Principais modificações *</label>
          <textarea
            id="v-mods"
            rows={3}
            className="field resize-y"
            placeholder="Suspensão, rodas, som, motor..."
            {...register("modifications")}
          />
          {errors.modifications && <p className="field-error">{errors.modifications.message}</p>}
        </div>
        <div>
          <label htmlFor="v-story" className="field-label">A história do carro *</label>
          <textarea
            id="v-story"
            rows={5}
            className="field resize-y"
            placeholder="Como o projeto começou, o que ele representa pra você..."
            {...register("story")}
          />
          {errors.story && <p className="field-error">{errors.story.message}</p>}
        </div>
        <div>
          <label htmlFor="v-photos" className="field-label">
            Fotos do projeto (até {MAX_PHOTOS})
          </label>
          <input
            id="v-photos"
            type="file"
            accept="image/*"
            multiple
            onChange={onPhotosChange}
            className="field cursor-pointer file:mr-4 file:border-0 file:bg-signal file:px-4 file:py-1.5 file:text-xs file:font-bold file:uppercase file:tracking-wide file:text-white"
          />
          <p className="mt-1.5 text-xs text-smoke/70">
            JPG, PNG ou WebP, até {MAX_PHOTO_MB} MB cada. As fotos são enviadas na conversa do
            WhatsApp após a inscrição.
          </p>
          {photoError && <p className="field-error">{photoError}</p>}
          {photoCount > 0 && !photoError && (
            <p className="mt-1.5 text-xs text-white">{photoCount} foto(s) selecionada(s) ✓</p>
          )}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <label className="flex cursor-pointer items-start gap-2.5 text-sm text-smoke">
          <input type="checkbox" className="mt-1 accent-signal" {...register("terms")} />
          Li e aceito os termos de participação: a inscrição passa por avaliação da equipe e não
          garante aprovação automática.
        </label>
        {errors.terms && <p className="field-error">{errors.terms.message}</p>}
        <label className="flex cursor-pointer items-start gap-2.5 text-sm text-smoke">
          <input type="checkbox" className="mt-1 accent-signal" {...register("contactConsent")} />
          Autorizo o contato da organização pelo WhatsApp e e-mail informados.
        </label>
        {errors.contactConsent && <p className="field-error">{errors.contactConsent.message}</p>}
      </fieldset>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-signal py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark disabled:opacity-60 sm:w-auto sm:px-10"
        style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
      >
        Inscrever meu projeto
      </button>
    </form>
  );
}
