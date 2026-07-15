import type { ReactNode } from "react";

export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[820px] px-4 pb-20 pt-32 sm:px-6 md:pb-28 md:pt-40">
      <h1 className="display text-4xl text-white sm:text-5xl">{title}</h1>
      {updated && (
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-smoke/70">
          Última atualização: {updated}
        </p>
      )}
      <div className="mt-10 space-y-6 text-[15px] leading-relaxed text-smoke [&_h2]:display [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:text-white [&_strong]:text-white">
        {children}
      </div>
      <p className="mt-12 border border-line bg-panel p-4 text-xs leading-relaxed text-smoke/70">
        Este documento é um modelo inicial e deve ser revisado pelo responsável jurídico da
        Baixudos.PR antes da publicação oficial do site.
      </p>
    </div>
  );
}
