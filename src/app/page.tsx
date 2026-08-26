import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { resolveTenant } from "@/lib/tenant/resolve-tenant";

export default async function Home() {
  const headerStore = await headers();
  const hostname =
    headerStore.get("x-forwarded-host") ??
    headerStore.get("host") ??
    "";

  const resolvedTenant = await resolveTenant(hostname);

  if (!resolvedTenant) {
    notFound();
  }

  const { tenant, settings } = resolvedTenant;

  const companyName =
    settings?.company_name ??
    settings?.short_name ??
    tenant.name;

  const heroTitle =
    settings?.hero_title ??
    `Bem-vindo à ${companyName}`;

  const heroDescription =
    settings?.hero_description ??
    settings?.slogan ??
    "Atendimento profissional e orçamento pelo WhatsApp.";

  const primaryColor =
    settings?.primary_color ?? "#111827";

  const secondaryColor =
    settings?.secondary_color ?? "#ffffff";

  const accentColor =
    settings?.accent_color ?? "#2563eb";

  const location = [
    settings?.city,
    settings?.state,
  ]
    .filter(Boolean)
    .join(" - ");

  const whatsapp =
    settings?.whatsapp?.replace(/\D/g, "") ?? "";

  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(
        `Olá! Vi o site da ${companyName} e gostaria de solicitar um orçamento.`,
      )}`
    : null;

  return (
    <main
      style={
        {
          "--brand-primary": primaryColor,
          "--brand-secondary": secondaryColor,
          "--brand-accent": accentColor,
        } as React.CSSProperties
      }
      className="min-h-screen bg-[var(--brand-secondary)] text-[var(--brand-primary)]"
    >
      <section className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-accent)]">
            {settings?.service_area ??
              location ??
              "Atendimento regional"}
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            {heroTitle}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 opacity-80">
            {heroDescription}
          </p>

          {settings?.slogan && (
            <p className="mt-4 text-base font-medium opacity-70">
              {settings.slogan}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-4">
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-[var(--brand-accent)] px-6 py-3 font-semibold text-white transition hover:opacity-90"
              >
                Solicitar orçamento
              </a>
            ) : (
              <span className="rounded-xl border px-6 py-3 text-sm opacity-60">
                WhatsApp ainda não configurado
              </span>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}