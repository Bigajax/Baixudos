/**
 * PARCEIROS E PATROCINADORES — preencher com marcas reais e seus
 * logos (adicionar arquivos em /public/sponsors/). Nenhuma marca é
 * exibida enquanto a lista estiver vazia; a home mostra o convite
 * comercial no lugar.
 */

export type SponsorTier =
  | "Patrocinador principal"
  | "Patrocinador oficial"
  | "Apoiador"
  | "Expositor";

export interface Sponsor {
  name: string;
  tier: SponsorTier;
  logo: string; // caminho em /public/sponsors/
  url: string | null;
}

// [PLACEHOLDER] Cadastrar os patrocinadores reais de cada edição.
export const sponsors: Sponsor[] = [];

export const sponsorTiers: SponsorTier[] = [
  "Patrocinador principal",
  "Patrocinador oficial",
  "Apoiador",
  "Expositor",
];

export const partnerInterests = [
  "Patrocínio",
  "Exposição de produtos",
  "Estande",
  "Alimentação",
  "Mídia",
  "Influenciador",
  "Cobertura",
  "Outro",
] as const;
