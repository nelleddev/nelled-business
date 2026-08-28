"use client";

import {
  useEffect,
  useState,
} from "react";

const links = [
  {
    href: "#servicos",
    label: "Especialidades",
  },
  {
    href: "#trabalhos",
    label: "Trabalhos",
  },
  {
    href: "#sobre",
    label: "Sobre",
  },
  {
    href: "#duvidas",
    label: "Dúvidas",
  },
];

export function DesktopNav() {
  const [activeHref, setActiveHref] =
    useState("");

  useEffect(() => {
    let frameId:
      | number
      | null = null;

    function updateActiveSection() {
      const marker =
        window.scrollY + 180;

      let currentHref = "";

      for (const link of links) {
        const section =
          document.querySelector<HTMLElement>(
            link.href,
          );

        if (!section) {
          continue;
        }

        if (
          section.offsetTop <= marker
        ) {
          currentHref =
            link.href;
        }
      }

      setActiveHref(
        currentHref,
      );

      frameId = null;
    }

    function handleScroll() {
      if (frameId !== null) {
        return;
      }

      frameId =
        window.requestAnimationFrame(
          updateActiveSection,
        );
    }

    updateActiveSection();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      },
    );

    window.addEventListener(
      "resize",
      handleScroll,
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
      );

      window.removeEventListener(
        "resize",
        handleScroll,
      );

      if (frameId !== null) {
        window.cancelAnimationFrame(
          frameId,
        );
      }
    };
  }, []);

  return (
    <nav className="hidden items-center gap-7 text-sm font-medium text-[var(--foreground)] lg:flex">
      {links.map((link) => {
        const isActive =
          activeHref ===
          link.href;

        return (
          <a
            key={link.href}
            href={link.href}
            aria-current={
              isActive
                ? "location"
                : undefined
            }
            className={`nav-scroll-link ${
              isActive
                ? "active"
                : ""
            }`}
          >
            {link.label}
          </a>
        );
      })}
    </nav>
  );
}