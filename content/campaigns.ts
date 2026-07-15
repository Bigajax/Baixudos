/**
 * CAMPANHAS OFICIAIS — área informativa, DESATIVADA por padrão
 * (`campaignsEnabled: false` em content/site.ts).
 *
 * O site NÃO opera venda de números, emissão de títulos, sorteio,
 * apuração ou pagamentos. A página apenas apresenta a campanha e
 * direciona para a plataforma externa da empresa responsável.
 *
 * Antes de publicar uma campanha, TODOS os campos de compliance
 * devem estar preenchidos e `legalReviewConfirmed` deve ser true —
 * a confirmação de que os documentos foram revisados pelo
 * responsável jurídico da empresa promotora. Sem isso, a campanha
 * não é exibida mesmo com a área ativada.
 */

export interface CampaignCompliance {
  promoterCompany: string; // Empresa promotora
  legalName: string; // Razão social
  cnpj: string;
  regulationPdf: string; // caminho do regulamento em PDF
  period: string; // período da campanha
  eligibility: string; // critérios de participação
  operator: string; // responsável pela operação
  certificate: string; // documento/certificado aplicável
  drawMethod: string; // forma oficial de apuração
  supportChannel: string; // canal de suporte
  privacyPolicyUrl: string;
  termsUrl: string;
  /** “Confirmo que os documentos e autorizações desta campanha foram
   *  revisados pelo responsável jurídico da empresa.” */
  legalReviewConfirmed: boolean;
}

export interface CampaignFaqItem {
  question: string;
  answer: string;
}

export interface Campaign {
  slug: string;
  name: string;
  vehicle: {
    model: string;
    year: string;
    engine: string;
    modifications: string[];
    story: string;
  };
  gallery: string[];
  videoUrl: string | null;
  externalUrl: string; // plataforma externa responsável pela operação
  faq: CampaignFaqItem[];
  compliance: CampaignCompliance;
  published: boolean;
}

// Nenhuma campanha cadastrada. Estrutura pronta para quando houver.
export const campaigns: Campaign[] = [];

/** Uma campanha só é visível com a área ativa, publicada e com
 *  compliance completo confirmado pelo jurídico. */
export function isCampaignVisible(c: Campaign): boolean {
  const comp = c.compliance;
  const complete =
    comp.legalReviewConfirmed &&
    Boolean(
      comp.promoterCompany &&
        comp.legalName &&
        comp.cnpj &&
        comp.regulationPdf &&
        comp.period &&
        comp.eligibility &&
        comp.operator &&
        comp.drawMethod &&
        comp.supportChannel &&
        comp.privacyPolicyUrl &&
        comp.termsUrl,
    );
  return c.published && complete;
}

export function getCampaign(slug: string): Campaign | undefined {
  return campaigns.find((c) => c.slug === slug && isCampaignVisible(c));
}
