import Image from "next/image";
import Reveal from "@/components/Reveal";

const experiences = [
  {
    title: "Exposição de projetos",
    text: "Carros selecionados pela curadoria da Baixudos.PR.",
    image: "/images/gramado-tendas.jpg",
  },
  {
    title: "Carros selecionados",
    text: "Projetos de várias cidades lado a lado.",
    image: "/images/jetta-publico.jpg",
  },
  {
    title: "Marcas e expositores",
    text: "Oficinas, lojas e empresas do setor no mesmo espaço.",
    image: "/images/leao-atacadista.jpg",
  },
  {
    title: "Influenciadores e convidados",
    text: "Quem produz a cultura automotiva, presente.",
    image: "/images/publico-pavilhao.jpg",
  },
  {
    title: "Premiações",
    text: "Reconhecimento para os projetos de destaque.",
    image: "/images/hero-8a-edicao.jpg",
  },
  {
    title: "Espaço de alimentação",
    text: "Food trucks e estrutura para passar o dia.",
    image: "/images/food-trucks.jpg",
  },
  {
    title: "Experiências automotivas",
    text: "Som, atrações e adrenalina do começo ao fim.",
    image: "/images/burnout.jpg",
  },
  {
    title: "Conteúdo e cobertura",
    text: "Tudo registrado e publicado para a comunidade.",
    image: "/images/drift-saveiro.jpg",
  },
];

export default function ExperienceGrid() {
  return (
    <section id="experiencia" className="diag-top bg-panel">
      <div className="mx-auto max-w-[1360px] px-4 pb-24 sm:px-6 md:pb-32">
        <Reveal>
          <p className="eyebrow">A experiência</p>
          <h2 className="display mt-4 max-w-3xl text-4xl text-white sm:text-5xl md:text-6xl">
            Um dia inteiro vivendo a <span className="slash-mark">cultura automotiva.</span>
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 items-start gap-3 md:mt-14 lg:grid-cols-4 lg:gap-5">
          {experiences.map((exp, i) => (
            <div key={exp.title} className={i % 2 === 1 ? "lg:mt-10" : ""}>
              <Reveal delay={Math.min(i * 0.05, 0.3)}>
                <article className="group overflow-hidden border border-line bg-graphite transition-colors duration-300 hover:border-signal/70">
                  <div className="relative aspect-[16/11] overflow-hidden">
                    <Image
                      src={exp.image}
                      alt={exp.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-0 h-[3px] w-0 bg-signal transition-all duration-300 group-hover:w-full"
                    />
                  </div>
                  <div className="border-t border-line p-3 md:p-4">
                    <span
                      aria-hidden="true"
                      className="block h-[3px] w-6 -skew-x-[30deg] bg-signal transition-[width] duration-300 group-hover:w-10"
                    />
                    <h3 className="display mt-2 text-base leading-tight text-white md:mt-3 md:text-lg">
                      {exp.title}
                    </h3>
                    <p className="mt-1.5 hidden text-[13px] leading-snug text-smoke sm:block">
                      {exp.text}
                    </p>
                  </div>
                </article>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
