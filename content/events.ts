/**
 * EVENTOS — editável pelo administrador.
 *
 * `nextEvent`: o evento em destaque na home e no checkout.
 * Preencher os campos [PLACEHOLDER] quando a organização confirmar
 * cada dado. Lotes com `demoPrice: true` exibem o selo "valor de
 * demonstração" até o preço oficial ser definido.
 */

export type EventStatus = "anunciado" | "ingressos" | "realizado";

export interface EventBatch {
  name: string;
  /** Preço em centavos. null = "a divulgar" (lote ainda não à venda) */
  priceCents: number | null;
  available: boolean;
  /** true enquanto o valor for de demonstração — trocar pelo oficial */
  demoPrice?: boolean;
}

export interface BxEvent {
  slug: string;
  name: string;
  edition: string;
  status: EventStatus;
  /** ISO 8601 com fuso, ex.: "2026-10-25T10:00:00-03:00". null = a confirmar */
  date: string | null;
  dateLabel: string; // texto exibido enquanto não há data confirmada
  timeLabel: string;
  venue: string;
  city: string;
  description: string;
  cover: string;
  gallery: string[];
  /** Link de checkout externo (gateway/plataforma). null = checkout na página */
  ticketUrl: string | null;
  batches: EventBatch[];
  mapUrl: string | null;
}

export const nextEvent: BxEvent = {
  slug: "9-edicao",
  name: "Baixudos.PR — 9ª Edição",
  edition: "9ª edição",
  status: "ingressos",
  date: null, // [PLACEHOLDER] preencher quando a organização confirmar a data
  dateLabel: "Data a confirmar",
  timeLabel: "Horário a confirmar",
  venue: "Race Park Maringá Motorsport",
  city: "Maringá — PR",
  description:
    "A nona edição do maior encontro da Baixudos.PR já está em produção. Exposição de projetos selecionados, marcas parceiras, som, entretenimento e a comunidade inteira reunida no Race Park Maringá Motorsport.",
  cover: "/images/anuncio-9a-edicao.jpg",
  gallery: ["/images/anuncio-9a-edicao.jpg", "/images/hero-8a-edicao.jpg"],
  ticketUrl: null, // definir quando houver gateway/plataforma externa
  batches: [
    // [DEMONSTRAÇÃO] trocar 6000 (R$ 60,00) pelo valor oficial do lote
    { name: "1º lote", priceCents: 6000, available: true, demoPrice: true },
    { name: "2º lote", priceCents: null, available: false },
  ],
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Race+Park+Maring%C3%A1+Motorsport",
};

export const pastEvents: BxEvent[] = [
  {
    slug: "8-edicao",
    name: "Baixudos.PR — 8ª Edição",
    edition: "8ª edição",
    status: "realizado",
    date: null, // [PLACEHOLDER] registrar a data real da edição
    dateLabel: "[DATA DA EDIÇÃO]",
    timeLabel: "Dia inteiro",
    venue: "[LOCAL DA EDIÇÃO]",
    city: "Maringá — PR",
    description:
      "Mais uma edição concluída: projetos de várias cidades, estrutura de palco, marcas expositoras e um dia inteiro de cultura automotiva.",
    cover: "/images/hero-8a-edicao.jpg",
    gallery: [
      "/images/hero-8a-edicao.jpg",
      "/images/hero-8a-edicao-b.jpg",
      "/images/palco-8a-chuva.jpg",
      "/images/aereo-evento.jpg",
      "/images/publico-pavilhao.jpg",
      "/images/gramado-tendas.jpg",
      "/images/jetta-publico.jpg",
      "/images/food-trucks.jpg",
      "/images/saveiro-capo.jpg",
      "/images/golf-evento.jpg",
      "/images/jetta-bandeira.jpg",
      "/images/gramado-projeto.jpg",
    ],
    ticketUrl: null,
    batches: [],
    mapUrl: null,
  },
];

export const allEvents = [nextEvent, ...pastEvents];

export function getEvent(slug: string): BxEvent | undefined {
  return allEvents.find((e) => e.slug === slug);
}

export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
