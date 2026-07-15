import Link from "next/link";
import ScrollLights from "@/components/ScrollLights";
import ReelWall from "@/components/home/ReelWall";

export default function Hero() {
  return (
    <section className="relative flex min-h-[88vh] items-center overflow-hidden bg-night md:min-h-[92vh]">
      {/* Linhas diagonais sutis de fundo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, transparent, transparent 260px, #1b1b1e 260px, #1b1b1e 262px)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1360px] px-4 pb-24 pt-28 sm:px-6 md:pb-28 md:pt-32">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <div>
            <p className="eyebrow">Cultura automotiva • Maringá — PR</p>

            <h1 className="display mt-5 text-[44px] text-white sm:text-6xl md:text-7xl lg:text-[82px]">
              Não é só
              <br />
              carro baixo.
              <br />
              <span className="slash-mark">É cultura.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-smoke md:text-lg">
              A Baixudos.PR reúne projetos, pessoas e marcas em uma das maiores experiências
              automotivas da região.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/eventos"
                className="inline-flex items-center justify-center bg-signal px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark"
                style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
              >
                Ver próximo evento
              </Link>
              <Link
                href="/inscrever-veiculo"
                className="inline-flex items-center justify-center border border-white/40 px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:border-signal hover:text-signal"
                style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
              >
                Inscrever meu projeto
              </Link>
            </div>
          </div>

          <ReelWall />
        </div>
      </div>

      <ScrollLights />
    </section>
  );
}
