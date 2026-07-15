import Link from "next/link";
import ScrollLights from "@/components/ScrollLights";
import ReelWall from "@/components/home/ReelWall";

export default function Hero() {
  return (
    <section id="home-hero" className="relative flex min-h-[100svh] items-center overflow-hidden bg-night md:min-h-[92vh]">
      {/* Linhas diagonais sutis de fundo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, transparent, transparent 260px, #1b1b1e 260px, #1b1b1e 262px)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1360px] px-4 pb-24 pt-24 sm:px-6 md:pb-28 md:pt-32">
        <div className="grid items-center lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <div className="contents lg:block">
            <p className="eyebrow hero-eyebrow">Cultura automotiva • Maringá, PR</p>

            <h1 className="display mt-4 text-[40px] leading-[0.94] text-white sm:mt-5 sm:text-6xl md:text-7xl lg:text-[82px]">
              Muito além do
              <br />
              carro baixo.
              <br />
              <span className="slash-mark hero-slash">É cultura.</span>
            </h1>

            <p className="order-5 mt-6 max-w-xl text-[15px] leading-relaxed text-smoke sm:text-base md:text-lg lg:order-none">
              A Baixudos.PR reúne projetos, pessoas e marcas em uma das maiores experiências
              automotivas da região.
            </p>

            <div className="order-3 mt-6 grid w-full gap-3 sm:mt-8 sm:flex sm:w-auto sm:items-center lg:order-none">
              <Link
                href="/eventos"
                className="inline-flex min-h-13 w-full items-center justify-center bg-signal px-6 py-3 text-center text-xs font-bold uppercase tracking-[0.12em] text-white transition-[background-color,transform] hover:bg-signal-dark active:translate-y-px sm:w-auto sm:px-8 sm:py-4 sm:text-sm"
                style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
              >
                Ver próximo evento <span aria-hidden="true" className="ml-2 text-base leading-none">→</span>
              </Link>
              <Link
                href="/inscrever-veiculo"
                className="inline-flex min-h-13 w-full items-center justify-center border border-white/40 px-6 py-3 text-center text-xs font-bold uppercase tracking-[0.1em] text-white transition-[border-color,color,transform] hover:border-signal hover:text-signal active:translate-y-px sm:w-auto sm:px-8 sm:py-4 sm:text-sm"
                style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
              >
                Inscrever meu projeto <span aria-hidden="true" className="ml-2 text-base leading-none">→</span>
              </Link>
            </div>
          </div>

          <div className="order-4 mt-7 min-w-0 lg:order-none lg:mt-0">
            <ReelWall />
          </div>
        </div>
      </div>

      <ScrollLights />
    </section>
  );
}
