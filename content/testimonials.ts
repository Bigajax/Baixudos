/**
 * DEPOIMENTOS — nunca publicar depoimentos falsos.
 * Os itens abaixo são espaços reservados claramente identificados;
 * substituir por depoimentos reais autorizados pelos autores.
 */

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  placeholder: boolean;
}

export const testimonials: Testimonial[] = [
  {
    quote: "[DEPOIMENTO REAL SERÁ INSERIDO AQUI]",
    author: "[NOME DO PARTICIPANTE]",
    role: "Participante",
    placeholder: true,
  },
  {
    quote: "[DEPOIMENTO REAL SERÁ INSERIDO AQUI]",
    author: "[NOME DO PROPRIETÁRIO]",
    role: "Proprietário de projeto",
    placeholder: true,
  },
  {
    quote: "[DEPOIMENTO REAL SERÁ INSERIDO AQUI]",
    author: "[NOME DA EMPRESA]",
    role: "Expositor",
    placeholder: true,
  },
];
