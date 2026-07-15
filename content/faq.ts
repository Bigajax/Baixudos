/**
 * FAQ — respostas temporárias que indicam que as regras são
 * atualizadas a cada edição. Substituir pelo painel quando os
 * detalhes oficiais de cada edição forem confirmados.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

export const faq: FaqItem[] = [
  {
    question: "Onde acontece o evento?",
    answer:
      "O local de cada edição é divulgado oficialmente no Instagram @baixudos.pr e aqui no site assim que confirmado. A 9ª edição terá o endereço publicado em breve.",
  },
  {
    question: "Como comprar meu ingresso?",
    answer:
      "A venda é feita por uma plataforma externa oficial. Quando o lote abrir, o botão “Garantir ingresso” do site leva direto para a página de compra.",
  },
  {
    question: "Crianças podem entrar?",
    answer:
      "A política de entrada para crianças é definida a cada edição e publicada junto com as informações oficiais do evento.",
  },
  {
    question: "Posso levar meu carro?",
    answer:
      "Todo mundo pode ir de carro ao evento. Para expor dentro da área de projetos é preciso passar pela inscrição e seleção de veículos.",
  },
  {
    question: "Como funciona a inscrição de veículos?",
    answer:
      "Você envia os dados e fotos do projeto pelo formulário do site, a equipe avalia e a confirmação chega pelo WhatsApp. A inscrição não garante aprovação automática.",
  },
  {
    question: "Posso comprar ingresso na portaria?",
    answer:
      "Depende da lotação de cada edição. A recomendação é sempre garantir o ingresso antecipado pela plataforma oficial.",
  },
  {
    question: "O evento possui estacionamento?",
    answer:
      "As informações de estacionamento são divulgadas junto com o local de cada edição.",
  },
  {
    question: "Animais são permitidos?",
    answer:
      "A política sobre animais é definida por edição e publicada nas informações oficiais do evento.",
  },
  {
    question: "Como posso ser expositor?",
    answer:
      "Preencha o formulário da página Parceiros informando o tipo de interesse “Exposição de produtos” ou “Estande”. A equipe comercial retorna com os formatos disponíveis.",
  },
  {
    question: "Como posso patrocinar o evento?",
    answer:
      "Acesse a página Parceiros e envie o formulário comercial. Apresentamos os formatos de cota, espaços e possibilidades de ativação da sua marca.",
  },
  {
    question: "Onde encontro os produtos oficiais?",
    answer:
      "Na página Loja do site e nos pontos oficiais durante os eventos. Produtos verdadeiros levam o selo “Produto oficial Baixudos.PR”.",
  },
  {
    question: "Como falar com a organização?",
    answer:
      "Pelo WhatsApp oficial (botão no canto da tela), pelo direct do @baixudos.pr ou pelo formulário da página Contato.",
  },
];
