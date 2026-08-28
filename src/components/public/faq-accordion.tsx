"use client";

import { useState } from "react";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  items: FaqItem[];
};

export function FaqAccordion({
  items,
}: FaqAccordionProps) {
  const [openId, setOpenId] =
    useState<string | null>(null);

  function toggle(id: string) {
    setOpenId((current) =>
      current === id ? null : id,
    );
  }

  return (
    <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
      {items.map((item) => {
        const isOpen =
          openId === item.id;

        return (
          <div
            key={item.id}
            className="py-5"
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${item.id}`}
              className="flex w-full cursor-pointer items-center justify-between gap-6 text-left font-semibold text-[var(--foreground)] transition hover:text-[var(--accent)]"
            >
              <span>
                {item.question}
              </span>

              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-xl font-normal text-[var(--surface-foreground)] transition-all duration-200 ${
                  isOpen
                    ? "rotate-45 border-[var(--accent)] text-[var(--accent)]"
                    : ""
                }`}
              >
                +
              </span>
            </button>

            <div
              id={`faq-answer-${item.id}`}
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-3xl pr-10 pt-4 leading-7 text-[var(--muted)]">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}