/**
 * LOJA — catálogo de produtos oficiais.
 *
 * Produtos com `demo: true` usam PREÇO e ESTOQUE de demonstração
 * (exibidos com aviso na loja). Para lançar: trocar `priceCents`
 * pelos valores oficiais, ajustar o estoque por tamanho e mudar
 * `demo` para false. O modo da loja (WhatsApp ou checkout externo)
 * é definido em `content/site.ts` → `shopMode`.
 */

export interface ProductSize {
  size: string;
  stock: number;
}

export interface Product {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  /** Preço em centavos. null = sob consulta */
  priceCents: number | null;
  images: string[];
  sizes: ProductSize[];
  limited: boolean;
  /** true enquanto preço/estoque forem de demonstração */
  demo: boolean;
  checkoutUrl: string | null; // usado quando shopMode === "checkout"
}

export const products: Product[] = [
  {
    slug: "camiseta-oficial",
    name: "Camiseta oficial Baixudos.PR",
    shortName: "Camiseta oficial",
    description:
      "Camiseta preta com estampa dupla: logo Baixudos.PR no peito e arte exclusiva do projeto vermelho nas costas, com detalhes nas mangas e barra.",
    priceCents: 7990,
    images: ["/products/camiseta-frente.png", "/products/camiseta-costas.png"],
    sizes: [
      { size: "P", stock: 8 },
      { size: "M", stock: 12 },
      { size: "G", stock: 10 },
      { size: "GG", stock: 6 },
    ],
    limited: false,
    demo: true,
    checkoutUrl: null,
  },
  {
    slug: "regata-oficial",
    name: "Regata oficial Baixudos.PR",
    shortName: "Regata oficial",
    description:
      "Regata preta com o logo Baixudos.PR no peito e arte do projeto vermelho nas costas sobre padrão grafitado da marca.",
    priceCents: 6990,
    images: ["/products/regata-frente.png", "/products/regata-costas.png"],
    sizes: [
      { size: "P", stock: 3 },
      { size: "M", stock: 5 },
      { size: "G", stock: 7 },
      { size: "GG", stock: 4 },
    ],
    limited: false,
    demo: true,
    checkoutUrl: null,
  },
  {
    slug: "moletom-edicao-limitada",
    name: "Moletom canguru — Edição Limitada",
    shortName: "Moletom Edição Limitada",
    description:
      "Moletom canguru com capuz, estampa Baixudos.PR Edição Limitada no peito e o B da marca em arte grande nas costas. Tiragem única por edição.",
    priceCents: 14990,
    images: ["/products/moletom-frente.png", "/products/moletom-costas.png"],
    sizes: [
      { size: "P", stock: 2 },
      { size: "M", stock: 4 },
      { size: "G", stock: 3 },
      { size: "GG", stock: 2 },
    ],
    limited: true,
    demo: true,
    checkoutUrl: null,
  },
  {
    slug: "bone-oficial",
    name: "Boné Baixudos.PR",
    shortName: "Boné oficial",
    description:
      "Boné estonado com aba curva, bordado Baixudos.PR em alto relevo na frente e o B da marca bordado na lateral. Ajuste regulável.",
    priceCents: 5990,
    images: ["/products/bone-frente.png", "/products/bone-lado.png"],
    sizes: [{ size: "Único", stock: 15 }],
    limited: false,
    demo: true,
    checkoutUrl: null,
  },
  {
    slug: "kit-adesivos",
    name: "Kit de adesivos Baixudos.PR",
    shortName: "Kit de adesivos",
    description:
      "Kit com os adesivos oficiais da marca em vários modelos: logos, lettering, projetos e as frases da comunidade — pra fechar o vidro, a tampa ou o notebook.",
    priceCents: 2490,
    images: ["/products/adesivos.png"],
    sizes: [{ size: "Único", stock: 30 }],
    limited: false,
    demo: true,
    checkoutUrl: null,
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function totalStock(p: Product): number {
  return p.sizes.reduce((sum, s) => sum + s.stock, 0);
}
