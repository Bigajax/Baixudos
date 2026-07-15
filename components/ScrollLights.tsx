"use client";

/** Semáforo de largada: 5 luzes acendem em sequência e apagam — dica de scroll. */
export default function ScrollLights() {
  const onClick = () => {
    document.getElementById("proximo-evento")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Descer para o próximo evento"
      className="group absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
    >
      <span className="flex gap-1.5 border border-line bg-night/70 px-3 py-2.5 backdrop-blur-sm transition-colors group-hover:border-signal/60">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="race-light h-2 w-2 rounded-full"
            style={{ animationDelay: `${i * 0.22}s` }}
          />
        ))}
      </span>
      <svg
        viewBox="0 0 12 8"
        className="scroll-hint h-2.5 w-3 text-smoke transition-colors group-hover:text-signal"
        aria-hidden="true"
      >
        <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
    </button>
  );
}
