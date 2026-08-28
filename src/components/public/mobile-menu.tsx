"use client";

import {
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

type MobileMenuProps = {
  whatsappUrl: string;
  hasWhatsapp: boolean;
};

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

export function MobileMenu({
  whatsappUrl,
  hasWhatsapp,
}: MobileMenuProps) {
  const [open, setOpen] =
    useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) => !current,
          )
        }
        aria-label={
          open
            ? "Fechar menu"
            : "Abrir menu"
        }
        aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--surface-foreground)] transition hover:border-[var(--accent)] lg:hidden"
      >
        {open ? (
          <X size={22} />
        ) : (
          <Menu size={23} />
        )}
      </button>

      {open && (
        <div className="fixed inset-x-0 top-20 z-50 border-b border-[var(--border)] bg-[var(--surface)] shadow-xl lg:hidden">
          <div className="mx-auto max-w-6xl px-6 py-5">
            <nav className="flex flex-col">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="border-b border-[var(--border)] py-4 font-semibold text-[var(--surface-foreground)] transition last:border-b-0 hover:text-[var(--accent)]"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {hasWhatsapp && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                onClick={closeMenu}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3.5 font-semibold text-[var(--brand-foreground)] transition hover:opacity-90"
              >
                <FaWhatsapp className="text-lg" />

                Solicitar orçamento
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}