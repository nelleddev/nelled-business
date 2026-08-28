"use client";

import type { ReactNode } from "react";

type ScrollToTopProps = {
  children: ReactNode;
  ariaLabel: string;
  className?: string;
};

export function ScrollToTop({
  children,
  ariaLabel,
  className = "",
}: ScrollToTopProps) {
  function handleClick() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    /*
     * Remove #inicio ou qualquer outra hash
     * da URL sem atualizar a página.
     */
    if (window.location.hash) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      className={`cursor-pointer border-0 bg-transparent p-0 ${className}`}
    >
      {children}
    </button>
  );
}