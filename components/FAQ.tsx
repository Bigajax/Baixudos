"use client";

import { useState } from "react";
import type { FaqItem } from "@/content/faq";

export default function FAQ({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
            >
              <span className="text-[15px] font-semibold text-white">{item.question}</span>
              <span
                aria-hidden="true"
                className={`display shrink-0 text-xl transition-transform duration-200 ${
                  open ? "rotate-45 text-signal" : "text-smoke"
                }`}
              >
                +
              </span>
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="pb-5 pr-8 text-sm leading-relaxed text-smoke">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
