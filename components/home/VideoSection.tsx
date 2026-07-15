"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import Reveal from "@/components/Reveal";

/** Vídeo oficial exibido em loop. Para trocar, substituir o arquivo em /public/videos/. */
const videoUrl = "/videos/experiencia.mp4";

export default function VideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  // Respeita "movimento reduzido": não roda o vídeo sozinho.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
    }
  }, []);

  return (
    <section className="relative overflow-hidden bg-night">
      <div className="mx-auto max-w-[1360px] px-4 py-20 sm:px-6 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_auto] lg:gap-20">
          <Reveal>
            <p className="eyebrow">Na pista</p>
            <h2 className="display mt-4 text-4xl text-white sm:text-5xl md:text-6xl">
              Você precisa viver isso <span className="slash-mark">de perto.</span>
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-smoke">
              Som, projetos e a comunidade inteira no mesmo lugar. Isso é um pedaço de 16
              segundos de uma edição Baixudos.PR — imagina o dia inteiro.
            </p>
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center border border-line px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-smoke transition-colors hover:border-signal hover:text-white"
              style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
            >
              Ver mais no {site.instagramHandle}
            </a>
          </Reveal>

          <Reveal delay={0.1} className="justify-self-center lg:justify-self-end">
            <div className="relative overflow-hidden border border-line bg-graphite">
              <span aria-hidden="true" className="absolute inset-x-0 top-0 z-10 speedline" />
              <video
                ref={videoRef}
                src={videoUrl}
                autoPlay
                muted={muted}
                loop
                playsInline
                preload="metadata"
                aria-label="Vídeo de uma edição do evento Baixudos.PR"
                className="block max-h-[72vh] w-auto max-w-full"
              />
              <button
                type="button"
                onClick={() => setMuted(!muted)}
                aria-label={muted ? "Ativar som do vídeo" : "Silenciar vídeo"}
                className="absolute bottom-3 right-3 z-10 flex h-11 w-11 items-center justify-center bg-night/80 text-white backdrop-blur-sm transition-colors hover:bg-signal"
              >
                {muted ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                    <path d="M4 9v6h4l5 5V4L8 9H4Zm12.5 3 3-3 1.4 1.4-3 3 3 3-1.4 1.4-3-3-3 3-1.4-1.4 3-3-3-3L13.5 9l3 3Z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                    <path d="M4 9v6h4l5 5V4L8 9H4Zm12 3a4 4 0 0 0-2-3.46v6.92A4 4 0 0 0 16 12Zm-2-7.7v2.06A6 6 0 0 1 18 12a6 6 0 0 1-4 5.64v2.06A8 8 0 0 0 20 12a8 8 0 0 0-6-7.7Z" />
                  </svg>
                )}
              </button>
              <p className="absolute bottom-3 left-3 z-10 bg-night/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-smoke backdrop-blur-sm">
                {site.instagramHandle}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
