/**
 * CONFIGURAÇÃO CENTRAL DO SITE — BAIXUDOS.PR
 *
 * Tudo que é editável pelo administrador está aqui e nos demais
 * arquivos da pasta `content/`. Campos marcados com [PLACEHOLDER]
 * devem ser preenchidos com dados reais antes do lançamento.
 */

export const site = {
  name: "Baixudos.PR",
  tagline: "Não é só carro baixo. É cultura.",
  description:
    "Eventos, projetos, comunidade, produtos oficiais e experiências automotivas. Conheça a Baixudos.PR.",
  city: "Maringá",
  state: "Paraná",
  stateShort: "PR",

  // [PLACEHOLDER] Trocar pelo número real da organização (formato: 55 + DDD + número)
  whatsapp: "5544999999999",

  instagram: "https://www.instagram.com/baixudos.pr/",
  instagramHandle: "@baixudos.pr",

  // Link real do grupo, retirado da bio do Instagram oficial
  whatsappCommunity: "https://chat.whatsapp.com/Lw2GuttikAgJU7GbZmuHMo",

  // [PLACEHOLDER] E-mail comercial da organização
  email: "contato@baixudospr.com.br",

  // [PLACEHOLDER] Preencher com o CNPJ real. Enquanto vazio, não é exibido no rodapé.
  cnpj: "",

  followers: "93 mil", // conferido no Instagram oficial em julho/2026

  /**
   * Modo da loja:
   * "whatsapp" — catálogo com pedido via WhatsApp (padrão)
   * "checkout" — botões apontam para checkout externo (definir checkoutUrl nos produtos)
   */
  shopMode: "whatsapp" as "whatsapp" | "checkout",

  /** Campanhas oficiais ficam desativadas até haver documentação completa. */
  campaignsEnabled: false,

  /**
   * Barra de credibilidade da home. Não inventar números:
   * os valores entre colchetes são placeholders editáveis.
   */
  stats: [
    { value: "8", label: "edições realizadas" },
    { value: "25 OUT", label: "9ª edição confirmada" },
    { value: "+93 mil", label: "seguidores na comunidade" },
    { value: "Maringá — PR", label: "de Maringá pro mundo" },
  ],

  whatsappMessages: {
    default: "Olá! Vim pelo site da Baixudos.PR e gostaria de mais informações.",
    eventos: "Olá! Gostaria de saber mais sobre o próximo evento da Baixudos.PR.",
    veiculos: "Olá! Gostaria de informações sobre a inscrição do meu projeto.",
    parceiros: "Olá! Tenho interesse em participar como parceiro ou expositor.",
    loja: "Olá! Gostaria de informações sobre os produtos oficiais da Baixudos.PR.",
  },
} as const;

export type Site = typeof site;
