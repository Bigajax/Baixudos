"use client";

import { useEffect, useRef } from "react";

/** Parede de reels do hero: 3 vídeos verticais em cascata diagonal, mudos e em loop. */
const reels = [
  "/videos/reel-hero-1.mp4",
  "/videos/reel-hero-2.mp4",
  "/videos/reel-hero-3.mp4",
];

export default function ReelWall() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const videos = [...(ref.current?.querySelectorAll("video") ?? [])];

    // Respeita "movimento reduzido": não roda os vídeos sozinhos.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      videos.forEach((v) => v.pause());
      return;
    }

    // Largada sincronizada: espera os três estarem prontos e dá play juntos.
    let cancelled = false;
    const ready = (v: HTMLVideoElement) =>
      new Promise<void>((resolve) => {
        if (v.readyState >= 3) return resolve();
        v.addEventListener("canplay", () => resolve(), { once: true });
        setTimeout(resolve, 4000); // não trava se um vídeo demorar
      });

    Promise.all(videos.map(ready)).then(() => {
      if (cancelled) return;
      videos.forEach((v) => {
        v.currentTime = 0;
        v.play().catch(() => {});
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Brilho vermelho discreto atrás dos vídeos */}
      <div
        aria-hidden="true"
        className="absolute -inset-x-16 -inset-y-10 bg-[radial-gradient(ellipse_at_center,rgba(255,16,16,0.14),transparent_65%)]"
      />
      {/* Linha de velocidade atravessando a parede */}
      <div
        aria-hidden="true"
        className="absolute left-[-12%] right-[-12%] top-[58%] h-[2px] -rotate-6 bg-gradient-to-r from-transparent via-signal/50 to-transparent"
      />
      <div className="relative flex items-start gap-3 md:gap-4">
        {reels.map((src, i) => (
          <div
            key={src}
            className={`group reel-float relative flex-1 overflow-hidden rounded-2xl border border-line bg-graphite transition-colors duration-300 hover:border-signal/70 ${
              i === 1 ? "mt-10 md:mt-16" : i === 2 ? "mt-20 md:mt-32" : ""
            }`}
            style={{ animationDelay: `${i * 1.1}s` }}
          >
            <span
              aria-hidden="true"
              className="absolute left-0 top-0 z-10 h-[3px] w-0 bg-signal transition-all duration-300 group-hover:w-full"
            />
            <video
              src={src}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-label={`Vídeo ${i + 1} dos eventos Baixudos.PR`}
              className="aspect-[9/16] w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
