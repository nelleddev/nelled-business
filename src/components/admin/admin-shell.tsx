"use client";

import {
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  FileQuestion,
  Globe2,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Palette,
  Settings,
  Star,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { logout } from "@/app/admin/(protected)/actions";

type AdminShellProps = {
  companyName: string;
  tenantSlug: string;
  tenantStatus: string;
  children: React.ReactNode;
};

const navigation = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Site",
    href: "/admin/site",
    icon: Palette,
  },
  {
    label: "Serviços",
    href: "/admin/servicos",
    icon: Wrench,
  },
  {
    label: "Galeria",
    href: "/admin/galeria",
    icon: ImageIcon,
  },
  {
    label: "Avaliações",
    href: "/admin/avaliacoes",
    icon: Star,
  },
  {
    label: "FAQ",
    href: "/admin/faq",
    icon: FileQuestion,
  },
  {
    label: "Leads",
    href: "/admin/leads",
    icon: ClipboardList,
  },
  {
    label: "Formulário",
    href: "/admin/formulario",
    icon: MessageSquareText,
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    label: "Domínio",
    href: "/admin/dominio",
    icon: Globe2,
  },
  {
    label: "Configurações",
    href: "/admin/configuracoes",
    icon: Settings,
  },
];

export function AdminShell({
  companyName,
  tenantSlug,
  tenantStatus,
  children,
}: AdminShellProps) {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [collapsed, setCollapsed] =
    useState(false);

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  }

  const sidebarContent = (
    <>
      <div className="flex min-h-20 items-center border-b border-slate-800 px-4">
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-400">
              Nelled Business
            </p>

            <p className="mt-1 truncate font-semibold text-white">
              {companyName}
            </p>

            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
              <span
                className={`h-2 w-2 rounded-full ${
                  tenantStatus === "active"
                    ? "bg-emerald-400"
                    : "bg-amber-400"
                }`}
              />

              {tenantStatus === "active"
                ? "Site ativo"
                : tenantStatus}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            setCollapsed((value) => !value)
          }
          className="ml-auto hidden rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:block"
          aria-label={
            collapsed
              ? "Expandir menu"
              : "Recolher menu"
          }
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() =>
                setMobileOpen(false)
              }
              title={
                collapsed
                  ? item.label
                  : undefined
              }
              className={`flex min-h-11 items-center rounded-xl px-3 text-sm font-medium transition ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              } ${
                collapsed
                  ? "justify-center"
                  : "gap-3"
              }`}
            >
              <Icon
                size={19}
                className="shrink-0"
              />

              {!collapsed && (
                <span>{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-slate-800 p-3">
        <Link
          href="/"
          target="_blank"
          title={
            collapsed
              ? "Ver meu site"
              : undefined
          }
          className={`flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white ${
            collapsed
              ? "justify-center"
              : "gap-3"
          }`}
        >
          <ExternalLink
            size={19}
            className="shrink-0"
          />

          {!collapsed && (
            <span>Ver meu site</span>
          )}
        </Link>

        <form action={logout}>
          <button
            type="submit"
            title={
              collapsed ? "Sair" : undefined
            }
            className={`flex min-h-11 w-full items-center rounded-xl px-3 text-sm font-medium text-red-300 transition hover:bg-red-500/10 hover:text-red-200 ${
              collapsed
                ? "justify-center"
                : "gap-3"
            }`}
          >
            <LogOut
              size={19}
              className="shrink-0"
            />

            {!collapsed && (
              <span>Sair</span>
            )}
          </button>
        </form>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden bg-slate-950 transition-all duration-200 lg:flex lg:flex-col ${
          collapsed
            ? "w-20"
            : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 bg-black/50"
            onClick={() =>
              setMobileOpen(false)
            }
          />

          <aside className="relative flex h-full w-72 flex-col bg-slate-950 shadow-2xl">
            <button
              type="button"
              onClick={() =>
                setMobileOpen(false)
              }
              className="absolute right-3 top-3 z-10 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="Fechar menu"
            >
              <X size={20} />
            </button>

            {sidebarContent}
          </aside>
        </div>
      )}

      <div
        className={`transition-all duration-200 ${
          collapsed
            ? "lg:pl-20"
            : "lg:pl-64"
        }`}
      >
        <header className="sticky top-0 z-30 flex min-h-16 items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() =>
              setMobileOpen(true)
            }
            className="mr-3 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Building2
                size={18}
                className="text-blue-600"
              />

              <p className="truncate text-sm font-semibold text-slate-900">
                {companyName}
              </p>
            </div>

            <p className="hidden text-xs text-slate-500 sm:block">
              {tenantSlug}.nelled.app
            </p>
          </div>

          <Link
            href="/"
            target="_blank"
            className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ExternalLink size={16} />

            <span className="hidden sm:inline">
              Ver site
            </span>
          </Link>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}