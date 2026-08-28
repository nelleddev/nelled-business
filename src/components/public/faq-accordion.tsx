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
    <div className="divide-y divide-slate-200 border-y border-slate-200">
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
              onClick={() =>
                toggle(item.id)
              }
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-6 text-left font-semibold text-slate-900"
            >
              <span>
                {item.question}
              </span>

              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-normal transition-transform duration-200 ${
                  isOpen
                    ? "rotate-45"
                    : ""
                }`}
              >
                +
              </span>
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-3xl pr-10 pt-4 leading-7 text-slate-600">
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