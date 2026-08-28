"use client";

import {
  useEffect,
  useRef,
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
    href: "#avaliacoes",
    label: "Clientes",
  },
  {
    href: "#duvidas",
    label: "Dúvidas",
  },
  {
    href: "#contato",
    label: "Contato",
  },
];

const NAVBAR_HEIGHT = 80;
const ACTIVE_OFFSET = 90;

export function DesktopNav() {
  const [activeHref, setActiveHref] =
    useState("");

  const navRef =
    useRef<HTMLElement | null>(
      null,
    );

  const indicatorRef =
    useRef<HTMLSpanElement | null>(
      null,
    );

  const linkRefs =
    useRef<
      Map<string, HTMLAnchorElement>
    >(new Map());

  function moveIndicator(
    href: string,
  ) {
    const indicator =
      indicatorRef.current;

    const link =
      linkRefs.current.get(href);

    if (!indicator || !link) {
      if (indicator) {
        indicator.style.opacity =
          "0";
      }

      return;
    }

    indicator.style.width =
      `${link.offsetWidth}px`;

    indicator.style.transform =
      `translateX(${link.offsetLeft}px)`;

    indicator.style.opacity =
      "1";
  }

  useEffect(() => {
    let frameId:
      | number
      | null = null;

    function findActiveSection() {
      const pageBottom =
        window.scrollY +
        window.innerHeight;

      const documentHeight =
        document.documentElement
          .scrollHeight;

      /*
       * Se chegou no final da página,
       * Contato deve permanecer ativo.
       */
      if (
        pageBottom >=
        documentHeight - 8
      ) {
        const contact =
          document.querySelector(
            "#contato",
          );

        if (contact) {
          setActiveHref(
            "#contato",
          );

          frameId = null;
          return;
        }
      }

      /*
       * Linha imaginária logo abaixo
       * da navbar.
       */
      const marker =
        window.scrollY +
        NAVBAR_HEIGHT +
        ACTIVE_OFFSET;

      let currentHref = "";

      for (const link of links) {
        const section =
          document.querySelector<HTMLElement>(
            link.href,
          );

        if (!section) {
          continue;
        }

        const sectionTop =
          section.offsetTop;

        if (
          sectionTop <= marker
        ) {
          currentHref =
            link.href;
        } else {
          break;
        }
      }

      setActiveHref(
        currentHref,
      );

      frameId = null;
    }

    function requestUpdate() {
      if (frameId !== null) {
        return;
      }

      frameId =
        window.requestAnimationFrame(
          findActiveSection,
        );
    }

    /*
     * Primeira leitura depois da
     * renderização.
     */
    frameId =
      window.requestAnimationFrame(
        findActiveSection,
      );

    window.addEventListener(
      "scroll",
      requestUpdate,
      {
        passive: true,
      },
    );

    window.addEventListener(
      "resize",
      requestUpdate,
    );

    return () => {
      window.removeEventListener(
        "scroll",
        requestUpdate,
      );

      window.removeEventListener(
        "resize",
        requestUpdate,
      );

      if (frameId !== null) {
        window.cancelAnimationFrame(
          frameId,
        );
      }
    };
  }, []);

  /*
   * Move fisicamente a mesma linha
   * para o item que ficou ativo.
   */
  useEffect(() => {
    if (!activeHref) {
      const indicator =
        indicatorRef.current;

      if (indicator) {
        indicator.style.opacity =
          "0";
      }

      return;
    }

    moveIndicator(
      activeHref,
    );
  }, [activeHref]);

  function handleClick(
    href: string,
  ) {
    setActiveHref(href);

    const target =
      document.querySelector<HTMLElement>(
        href,
      );

    if (!target) {
      return;
    }

    const top =
      target.getBoundingClientRect()
        .top +
      window.scrollY -
      NAVBAR_HEIGHT;

    window.scrollTo({
      top,
      behavior: "smooth",
    });
  }

  return (
    <nav
      ref={navRef}
      className="relative hidden items-center gap-6 text-sm font-medium text-[var(--foreground)] lg:flex"
      onMouseLeave={() => {
        if (activeHref) {
          moveIndicator(
            activeHref,
          );
        }
      }}
    >
      {links.map((link) => {
        const isActive =
          activeHref ===
          link.href;

        return (
          <a
            key={link.href}
            ref={(element) => {
              if (element) {
                linkRefs.current.set(
                  link.href,
                  element,
                );
              } else {
                linkRefs.current.delete(
                  link.href,
                );
              }
            }}
            href={link.href}
            aria-current={
              isActive
                ? "location"
                : undefined
            }
            onClick={(event) => {
              event.preventDefault();

              handleClick(
                link.href,
              );
            }}
            onMouseEnter={() =>
              moveIndicator(
                link.href,
              )
            }
            className={`relative z-10 cursor-pointer pb-2 transition-colors duration-200 ${
              isActive
                ? "text-[var(--accent)]"
                : "text-[var(--foreground)] hover:text-[var(--accent)]"
            }`}
          >
            {link.label}
          </a>
        );
      })}

      {/* ÚNICA LINHA DESLIZANTE */}
      <span
        ref={indicatorRef}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-[2px] bg-[var(--accent)] opacity-0 transition-[width,transform,opacity] duration-300 ease-out"
        style={{
          width: 0,
          transform:
            "translateX(0)",
        }}
      />
    </nav>
  );
}