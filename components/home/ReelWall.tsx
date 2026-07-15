"use client";

import { useEffect, useRef } from "react";

/**
 * Parede de reels do hero.
 * Desktop: 3 vídeos verticais em cascata diagonal.
 * Mobile: carrossel deslizável com snap, reels grandes.
 * Vídeos em H.264 + faststart (VP9 não toca no iOS/Safari).
 */
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

    // Garante autoplay (Safari exige muted como atributo + play() explícito)
    let cancelled = false;
    const ready = (v: HTMLVideoElement) =>
      new Promise<void>((resolve) => {
        if (v.readyState >= 3) return resolve();
        v.addEventListener("canplay", () => resolve(), { once: true });
        setTimeout(resolve, 4000);
      });

    videos.forEach((v) => {
      v.muted = true;
      v.setAttribute("muted", "");
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
        className="absolute left-[-12%] right-[-12%] top-[58%] hidden h-[2px] -rotate-6 bg-gradient-to-r from-transparent via-signal/50 to-transparent lg:block"
      />
      <div
        className="relative -mx-4 flex snap-x snap-mandatory items-start gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0 lg:snap-none lg:gap-4 lg:overflow-visible lg:pb-0"
      >
        {reels.map((src, i) => (
          <div
            key={src}
            className={`group reel-float relative w-[62%] shrink-0 snap-center overflow-hidden rounded-2xl border border-line bg-graphite transition-colors duration-300 hover:border-signal/70 sm:w-auto sm:flex-1 ${
              i === 1 ? "lg:mt-16" : i === 2 ? "lg:mt-32" : ""
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
      <p className="mt-3 text-center text-[10px] uppercase tracking-[0.24em] text-smoke/60 sm:hidden">
        ← Deslize pra ver mais →
      </p>
    </div>
  );
}
