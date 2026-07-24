/**
 * Microcópia da campanha de números da sorte.
 * Editável aqui até o painel admin (M5) assumir FAQ/passos por campanha.
 */
import type { FaqItem } from "@/content/faq";

/**
 * Campanha em destaque no hero da HOME (estático — não bate no banco,
 * para a home continuar sendo pré-renderizada). Editar aqui ao trocar
 * a campanha ativa. Some quando `site.rafflesEnabled` for false.
 */
export const featuredRaffle = {
  slug: "gol-vermelho",
  prize: "Gol vermelho",
  priceLabel: "R$ 25 o número",
};

export interface HowToStep {
  title: string;
  description: string;
}

/** Sequência real de participação — por isso a numeração 01…06 faz sentido. */
export const howToSteps: HowToStep[] = [
  {
    title: "Escolha seus números",
    description:
      "Navegue pela grade, busque um número específico ou use a seleção aleatória. Escolha quantos quiser.",
  },
  {
    title: "Faça seu cadastro",
    description:
      "Informe seus dados para vincular os números escolhidos à sua participação.",
  },
  {
    title: "Conclua o pagamento",
    description:
      "Pague com Pix na hora. Seus números ficam reservados até a confirmação do pagamento.",
  },
  {
    title: "Receba a confirmação",
    description:
      "Assim que o Pix é aprovado, você recebe o comprovante com seus números confirmados.",
  },
  {
    title: "Acompanhe a campanha",
    description:
      "Veja a grade sendo preenchida e receba os comunicados oficiais da organização.",
  },
  {
    title: "Confira o resultado",
    description:
      "Na data da apuração, o número contemplado é divulgado aqui no site e ao vivo no evento.",
  },
];

/** FAQ inicial da rifa (o admin poderá cadastrar por campanha no M5). */
export const raffleFaq: FaqItem[] = [
  {
    question: "Como escolho meus números?",
    answer:
      "Na grade da campanha, toque nos números que quiser. Você também pode buscar um número específico ou usar a seleção aleatória (1, 2, 5 ou 10 de uma vez).",
  },
  {
    question: "Posso comprar mais de um número?",
    answer:
      "Pode. Selecione quantos números quiser (dentro do limite por pedido) antes de seguir para o cadastro. O valor total é a quantidade multiplicada pelo valor de cada número.",
  },
  {
    question: "Como sei que meu pagamento foi aprovado?",
    answer:
      "O pagamento é por Pix e a confirmação é automática: assim que o banco confirma, seus números passam a “confirmado” e você recebe o comprovante. Não é preciso enviar print.",
  },
  {
    question: "Onde consulto meus números?",
    answer:
      "Na área de consulta da participação, com o código do seu pedido. Você acessa por um link seguro, sem precisar criar senha.",
  },
  {
    question: "Quando acontece a apuração?",
    answer:
      "Na data de apuração informada na campanha. O resultado é apresentado ao vivo durante o evento da Baixudos.PR e publicado aqui no site.",
  },
  {
    question: "Preciso estar presente no evento?",
    answer:
      "As regras de presença do contemplado são definidas no regulamento oficial da campanha. Consulte o regulamento antes de participar.",
  },
  {
    question: "Como o resultado será divulgado?",
    answer:
      "O número contemplado é divulgado na página da campanha e no evento, com registro do método de apuração previsto no regulamento.",
  },
  {
    question: "O que acontece se o pagamento não for concluído?",
    answer:
      "A reserva dos números tem prazo. Se o Pix não for concluído a tempo, os números voltam a ficar disponíveis para outras pessoas e você pode escolher novamente.",
  },
  {
    question: "O que acontece se a campanha for adiada?",
    answer:
      "Alterações de data são comunicadas oficialmente e valem conforme o regulamento. Sua participação e seus números permanecem válidos.",
  },
  {
    question: "Como será feita a entrega do prêmio?",
    answer:
      "A entrega ocorre durante o evento, com conferência de identidade e assinatura do termo de recebimento, conforme o regulamento oficial.",
  },
];
