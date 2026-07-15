"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/** Entrada curta: logo + linha vermelha de velocidade, máx. 1s. Roda uma vez por sessão. */
export default function IntroLoader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("bxpr-intro")) return;
    sessionStorage.setItem("bxpr-intro", "1");
    setShow(true);
    const t = setTimeout(() => setShow(false), 1400);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div
      aria-hidden="true"
      className="intro-overlay fixed inset-0 z-[100] flex flex-col items-center justify-center bg-night"
    >
      <Image
        src="/images/logo.jpg"
        alt=""
        width={96}
        height={96}
        className="h-24 w-24"
        priority
      />
      <div className="mt-6 h-[3px] w-40 overflow-hidden bg-line">
        <div className="intro-bar h-full w-full bg-signal" />
      </div>
    </div>
  );
}
