"use client";

import { useEffect, useState } from "react";

type Consent = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
};

const STORAGE_KEY = "bxpr-consent";

export function getConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    // ?preview oculta o banner em capturas de tela de desenvolvimento
    if (new URLSearchParams(window.location.search).has("preview")) return;
    if (!getConsent()) setVisible(true);
  }, []);

  const save = (consent: Consent) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    setVisible(false);
    // Ponto único para inicializar Analytics/Pixel após consentimento:
    window.dispatchEvent(new CustomEvent("bxpr:consent", { detail: consent }));
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-night/50 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Preferências de cookies"
        className="border-t border-line bg-panel/97 backdrop-blur-md"
      >
      <div className="mx-auto max-w-[1360px] px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-2xl text-sm leading-relaxed text-smoke">
            Usamos cookies essenciais para o funcionamento do site e, com a sua permissão,
            cookies de análise e marketing. O site continua funcionando normalmente se você
            recusar os opcionais.
          </p>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <button
              type="button"
              onClick={() =>
                save(
                  customize
                    ? { essential: true, analytics, marketing }
                    : { essential: true, analytics: true, marketing: true },
                )
              }
              className="order-1 w-full bg-signal px-5 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-signal-dark sm:order-3 sm:w-auto sm:py-2.5 sm:text-xs"
            >
              {customize ? "Salvar preferências" : "Aceitar"}
            </button>
            <button
              type="button"
              onClick={() => save({ essential: true, analytics: false, marketing: false })}
              className="order-2 w-full border border-line px-4 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-smoke transition-colors hover:text-white sm:w-auto sm:py-2.5 sm:text-xs"
            >
              Recusar
            </button>
            <button
              type="button"
              onClick={() => setCustomize(!customize)}
              className="order-3 w-full border border-line px-4 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-smoke transition-colors hover:text-white sm:order-1 sm:w-auto sm:py-2.5 sm:text-xs"
            >
              Personalizar
            </button>
          </div>
        </div>

        {customize && (
          <div className="mt-4 flex flex-wrap gap-6 border-t border-line pt-4 text-sm text-smoke">
            <label className="flex items-center gap-2 opacity-60">
              <input type="checkbox" checked disabled className="accent-signal" />
              Essenciais (sempre ativos)
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="accent-signal"
              />
              Análise
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="accent-signal"
              />
              Marketing
            </label>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
