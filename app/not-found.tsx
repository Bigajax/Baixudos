import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 pt-20 text-center">
      <p className="eyebrow">Erro 404</p>
      <h1 className="display mt-4 text-6xl text-white sm:text-7xl">
        Página <span className="slash-mark">não encontrada.</span>
      </h1>
      <p className="mt-5 max-w-md text-[15px] text-smoke">
        O endereço que você tentou acessar não existe ou mudou de lugar.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center bg-signal px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark"
        style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
      >
        Voltar para o início
      </Link>
    </div>
  );
}
