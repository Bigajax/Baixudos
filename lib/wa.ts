import { site } from "@/content/site";

/** Monta um link wa.me com mensagem pré-preenchida. */
export function waLink(message: string, phone: string = site.whatsapp): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
