import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";

const steps = [
  { n: "1", title: "Envie os dados do projeto", text: "Fotos, modificações e a história do carro." },
  { n: "2", title: "Nossa equipe avalia", text: "Curadoria por edição, sem aprovação automática." },
  { n: "3", title: "Confirmação pelo WhatsApp", text: "Você recebe o retorno direto da organização." },
];

export default function VehicleCTA() {
  return (
    <section className="diag-top bg-graphite">
      <div className="mx-auto max-w-[1360px] px-4 pb-20 sm:px-6 md:pb-28">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <Reveal className="order-2 lg:order-1 flex flex-col justify-center">
            <p className="eyebrow">Inscrição de veículos</p>
            <h2 className="display mt-4 text-4xl text-white sm:text-5xl md:text-6xl">
              Seu projeto merece <span className="slash-mark">fazer parte.</span>
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-smoke">
              Cadastre seu veículo para participar da seleção de projetos da próxima edição
              Baixudos.PR.
            </p>

            <ol className="mt-8 space-y-5">
              {steps.map((s) => (
                <li key={s.n} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="display flex h-10 w-10 shrink-0 items-center justify-center bg-signal text-lg text-white"
                    style={{ clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)" }}
                  >
                    {s.n}
                  </span>
                  <div>
                    <h3 className="font-semibold text-white">{s.title}</h3>
                    <p className="text-sm text-smoke">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-9">
              <Link
                href="/inscrever-veiculo"
                className="inline-flex items-center justify-center bg-signal px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark"
                style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
              >
                Inscrever meu projeto
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="order-1 lg:order-2">
            <div className="relative h-full min-h-[320px] overflow-hidden border border-line lg:min-h-[520px]">
              <Image
                src="/images/estudio-jetta.jpg"
                alt="Projeto rebaixado fotografado em estúdio com iluminação técnica"
                fill
                quality={90}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-graphite/40 via-transparent to-transparent"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
