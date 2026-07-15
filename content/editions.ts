/**
 * EDIÇÕES ANTERIORES — grade histórica da marca.
 * Campos [PLACEHOLDER] devem ser preenchidos com os dados reais de
 * cada edição pelo administrador. `year: null` = ano a registrar.
 */

export interface Edition {
  slug: string;
  name: string;
  year: number | null;
  dateLabel: string;
  venue: string;
  cover: string;
  gallery: string[];
  summary: string;
  photoCount: string; // ex.: "+400 fotos" — usar dado real
  brands: string[]; // marcas participantes reais
}

export const editions: Edition[] = [
  {
    slug: "8-edicao",
    name: "8ª Edição",
    year: null, // [ANO]
    dateLabel: "[DATA DA EDIÇÃO]",
    venue: "[LOCAL] — Maringá, PR",
    cover: "/images/hero-8a-edicao.jpg",
    gallery: [
      "/images/hero-8a-edicao.jpg",
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
      "/images/comboio-chuva.jpg",
    ],
    summary:
      "A oitava edição reuniu projetos de várias cidades do Paraná com palco, exposição selecionada e marcas parceiras do setor.",
    photoCount: "[NÚMERO] fotos",
    brands: [], // [PLACEHOLDER] preencher com as marcas reais participantes
  },
  {
    slug: "7-edicao",
    name: "7ª Edição",
    year: null,
    dateLabel: "[DATA DA EDIÇÃO]",
    venue: "[LOCAL] — Maringá, PR",
    cover: "/images/aereo-evento.jpg",
    gallery: ["/images/aereo-evento.jpg"],
    summary:
      "Registro histórico a completar pelo painel: fotos, marcas participantes e resumo da edição.",
    photoCount: "[NÚMERO] fotos",
    brands: [],
  },
];

export function getEdition(slug: string): Edition | undefined {
  return editions.find((e) => e.slug === slug);
}
