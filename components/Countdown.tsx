"use client";

import { useEffect, useState } from "react";

function diff(target: number) {
  const now = Date.now();
  const d = Math.max(0, target - now);
  return {
    days: Math.floor(d / 86_400_000),
    hours: Math.floor((d / 3_600_000) % 24),
    minutes: Math.floor((d / 60_000) % 60),
    seconds: Math.floor((d / 1_000) % 60),
  };
}

/** Contador regressivo. Só renderiza quando existe data confirmada. */
export default function Countdown({ date }: { date: string }) {
  const target = new Date(date).getTime();
  const [time, setTime] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    setTime(diff(target));
    const id = setInterval(() => setTime(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!time) {
    return <div className="h-[76px]" aria-hidden="true" />;
  }

  const cells = [
    { value: time.days, label: "dias" },
    { value: time.hours, label: "horas" },
    { value: time.minutes, label: "min" },
    { value: time.seconds, label: "seg" },
  ];

  return (
    <div className="flex gap-3" role="timer" aria-label="Contagem regressiva para o evento">
      {cells.map((c) => (
        <div
          key={c.label}
          className="flex min-w-[64px] flex-col items-center border border-line bg-panel px-3 py-2.5"
        >
          <span className="display text-2xl text-white tabular-nums">
            {String(c.value).padStart(2, "0")}
          </span>
          <span className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-smoke">{c.label}</span>
        </div>
      ))}
    </div>
  );
}
