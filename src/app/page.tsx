import type {
  CSSProperties,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa";
import { MapPin, Star } from "lucide-react";
import Image from "next/image";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { BeforeAfterSlider } from "@/components/public/before-after-slider";
import { FaqAccordion } from "@/components/public/faq-accordion";
import { MobileMenu } from "@/components/public/mobile-menu";
import {
  Gallery,
  type PublicGalleryItem,
} from "@/components/public/gallery";
import { SiteLiveRefresh } from "@/components/public/site-live-refresh";
import { ServiceIcon } from "@/components/service-icon";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";
import type { TenantSettings } from "@/types/tenant";

import { submitLead } from "./actions";

export const dynamic = "force-dynamic";

type ExtendedTenantSettings = TenantSettings & {
  hero_eyebrow?: string | null;
  hero_secondary_text?: string | null;

  stat_1_value?: string | null;
  stat_1_label?: string | null;

  stat_2_value?: string | null;
  stat_2_label?: string | null;

  stat_3_value?: string | null;
  stat_3_label?: string | null;

  service_cities?: string | null;

  about_image_url?: string | null;

  tiktok_url?: string | null;
};

type Service = {
  id: string;
  name: string;
  short_description: string | null;
  icon: string | null;
};

type BeforeAfterItem = {
  id: string;
  title: string | null;
  description: string | null;
  before_image_url: string;
  after_image_url: string;
};

type Review = {
  id: string;
  customer_name: string;
  city: string | null;
  rating: number;
  comment: string;
  is_featured: boolean;
};

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

type ContactFormSettings = {
  title: string;
  description: string | null;

  name_placeholder: string;
  whatsapp_placeholder: string;
  location_placeholder: string;
  service_placeholder: string;
  message_placeholder: string;

  submit_button_text: string;
  whatsapp_intro_message: string;
};

type Stat = {
  value: string;
  label: string | null | undefined;
};

function hexToRgb(hex: string) {
  let value = hex.replace("#", "").trim();

  if (value.length === 3) {
    value = value
      .split("")
      .map((char) => char + char)
      .join("");
  }

  if (!/^[0-9a-fA-F]{6}$/.test(value)) {
    return {
      r: 255,
      g: 255,
      b: 255,
    };
  }

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function isDarkColor(hex: string) {
  const { r, g, b } = hexToRgb(hex);

  const luminance =
    (0.299 * r +
      0.587 * g +
      0.114 * b) /
    255;

  return luminance < 0.55;
}

function mixHexColor(
  base: string,
  target: string,
  amount: number,
) {
  const baseRgb = hexToRgb(base);
  const targetRgb = hexToRgb(target);

  const mix = (
    from: number,
    to: number,
  ) =>
    Math.round(
      from + (to - from) * amount,
    );

  const r = mix(
    baseRgb.r,
    targetRgb.r,
  );

  const g = mix(
    baseRgb.g,
    targetRgb.g,
  );

  const b = mix(
    baseRgb.b,
    targetRgb.b,
  );

  return `#${[r, g, b]
    .map((value) =>
      value
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

export default async function Home() {
  const headerStore =
    await headers();

  const hostname =
    headerStore.get(
      "x-forwarded-host",
    ) ??
    headerStore.get("host") ??
    "";

  const resolvedTenant =
    await resolveTenant(hostname);

  if (!resolvedTenant) {
    notFound();
  }

  const tenant =
    resolvedTenant.tenant;

  const settings =
    resolvedTenant.settings as
      | ExtendedTenantSettings
      | null;

  const db =
    createAdminSupabaseClient();

  const [
    servicesResult,
    galleryResult,
    beforeAfterResult,
    reviewsResult,
    faqResult,
    formResult,
  ] = await Promise.all([
    db
      .from("services")
      .select(
        "id, name, short_description, icon",
      )
      .eq(
        "tenant_id",
        tenant.id,
      )
      .eq("is_active", true)
      .order("position"),

    db
      .from("gallery_items")
      .select(
        `
          id,
          title,
          description,
          image_url,
          alt_text
        `,
      )
      .eq(
        "tenant_id",
        tenant.id,
      )
      .eq("is_active", true)
      .order("position"),

    db
      .from(
        "before_after_items",
      )
      .select(
        `
          id,
          title,
          description,
          before_image_url,
          after_image_url
        `,
      )
      .eq(
        "tenant_id",
        tenant.id,
      )
      .eq("is_active", true)
      .order("position"),

    db
      .from("reviews")
      .select(
        `
          id,
          customer_name,
          city,
          rating,
          comment,
          is_featured
        `,
      )
      .eq(
        "tenant_id",
        tenant.id,
      )
      .eq(
        "status",
        "approved",
      )
      .order("is_featured", {
        ascending: false,
      }),

    db
      .from("faq_items")
      .select(
        `
          id,
          question,
          answer
        `,
      )
      .eq(
        "tenant_id",
        tenant.id,
      )
      .eq("is_active", true)
      .order("position"),

    db
      .from(
        "tenant_contact_form_settings",
      )
      .select(
        `
          title,
          description,
          name_placeholder,
          whatsapp_placeholder,
          location_placeholder,
          service_placeholder,
          message_placeholder,
          submit_button_text,
          whatsapp_intro_message
        `,
      )
      .eq(
        "tenant_id",
        tenant.id,
      )
      .eq("is_active", true)
      .maybeSingle(),
  ]);

  const services =
    (servicesResult.data ??
      []) as Service[];

  const gallery =
    (galleryResult.data ??
      []) as PublicGalleryItem[];

  const beforeAfter =
    (beforeAfterResult.data ??
      []) as BeforeAfterItem[];

  const reviews =
    (reviewsResult.data ??
      []) as Review[];

  const faq =
    (faqResult.data ??
      []) as FaqItem[];

  const form =
    formResult.data as
      | ContactFormSettings
      | null;

  await db
    .from("site_events")
    .insert({
      tenant_id: tenant.id,
      event_type: "page_view",
    });

  const company =
    settings?.company_name ??
    settings?.short_name ??
    tenant.name;

  const whatsapp =
    settings?.whatsapp?.replace(
      /\D/g,
      "",
    ) ?? "";

  const accent =
    settings?.accent_color ??
    "#f59e42";

  const primary =
    settings?.primary_color ??
    "#0c1d32";

  const secondary =
    settings?.secondary_color ??
    "#ffffff";

  /*
   * TEMA AUTOMÁTICO
   */
  const darkBackground =
    isDarkColor(secondary);

  const darkBrand =
    isDarkColor(primary);

  const backgroundAlt =
    mixHexColor(
      secondary,
      darkBackground
        ? "#ffffff"
        : "#000000",
      darkBackground ? 0.07 : 0.04,
    );

  const surface =
    darkBackground
      ? mixHexColor(
          secondary,
          "#ffffff",
          0.1,
        )
      : "#ffffff";

  const foreground =
    darkBackground
      ? "#f8fafc"
      : "#0f172a";

  const muted =
    darkBackground
      ? "#cbd5e1"
      : "#64748b";

  const border =
    darkBackground
      ? "rgba(255,255,255,0.14)"
      : "#e2e8f0";

  const surfaceForeground =
    darkBackground
      ? "#f8fafc"
      : "#0f172a";

  const surfaceMuted =
    darkBackground
      ? "#cbd5e1"
      : "#64748b";

  const brandForeground =
    darkBrand
      ? "#ffffff"
      : "#0f172a";

  const brandMuted =
    darkBrand
      ? "rgba(255,255,255,0.72)"
      : "rgba(15,23,42,0.72)";

  const brandBorder =
    darkBrand
      ? "rgba(255,255,255,0.16)"
      : "rgba(15,23,42,0.16)";

  const brandField =
    darkBrand
      ? "rgba(255,255,255,0.08)"
      : "rgba(255,255,255,0.42)";

  const cities =
    settings?.service_cities
      ?.split(",")
      .map((city) =>
        city.trim(),
      )
      .filter(Boolean) ?? [];

  const whatsappMessage =
    `Olá! Vi o site da ${company} e gostaria de solicitar um orçamento.`;

  const whatsappUrl =
    whatsapp
      ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(
          whatsappMessage,
        )}`
      : "#orcamento";

  const stats = [
    {
      value:
        settings?.stat_1_value,
      label:
        settings?.stat_1_label,
    },
    {
      value:
        settings?.stat_2_value,
      label:
        settings?.stat_2_label,
    },
    {
      value:
        settings?.stat_3_value,
      label:
        settings?.stat_3_label,
    },
  ].filter(
    (item): item is Stat =>
      typeof item.value ===
        "string" &&
      item.value.trim().length > 0,
  );

  const cssVariables = {
    "--brand": primary,
    "--brand-foreground":
      brandForeground,
    "--brand-muted": brandMuted,
    "--brand-border": brandBorder,
    "--brand-field": brandField,

    "--accent": accent,

    "--background": secondary,
    "--background-alt":
      backgroundAlt,

    "--foreground": foreground,
    "--muted": muted,
    "--border": border,

    "--surface": surface,
    "--surface-foreground":
      surfaceForeground,
    "--surface-muted":
      surfaceMuted,
  } as CSSProperties;

  return (
    <main
      style={cssVariables}
      className="min-h-screen bg-[var(--background)] text-[var(--foreground)]"
    >
      <SiteLiveRefresh
        tenantId={tenant.id}
      />

      {/* NAVBAR */}
        <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-5 px-6">
            <a
              href="#topo"
              aria-label={`Ir para o início do site da ${company}`}
              className="shrink-0"
            >
              {settings?.logo_light_url ? (
                <Image
                  src={
                    settings.logo_light_url
                  }
                  alt={company}
                  width={150}
                  height={60}
                  className="h-10 w-auto max-w-[170px] object-contain sm:h-12"
                />
              ) : (
                <strong className="text-lg text-[var(--surface-foreground)]">
                  {company}
                </strong>
              )}
            </a>

            {/* MENU DESKTOP */}
            <nav className="hidden items-center gap-7 text-sm font-semibold text-[var(--surface-foreground)] lg:flex">
              <a
                href="#servicos"
                className="transition hover:text-[var(--accent)]"
              >
                Especialidades
              </a>

              <a
                href="#trabalhos"
                className="transition hover:text-[var(--accent)]"
              >
                Trabalhos
              </a>

              <a
                href="#sobre"
                className="transition hover:text-[var(--accent)]"
              >
                Sobre
              </a>

              <a
                href="#duvidas"
                className="transition hover:text-[var(--accent)]"
              >
                Dúvidas
              </a>
            </nav>

            {/* WHATSAPP DESKTOP */}
            {whatsapp && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden items-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-[var(--brand-foreground)] transition hover:opacity-90 lg:flex"
              >
                <FaWhatsapp className="text-lg" />

                Orçamento no WhatsApp
              </a>
            )}

            {/* MENU MOBILE */}
            <MobileMenu
              whatsappUrl={whatsappUrl}
              hasWhatsapp={Boolean(
                whatsapp,
              )}
            />
          </div>
        </header>

      {/* HERO */}
      <section
        id="topo"
        className="hero-grid scroll-mt-20 border-b border-[var(--border)] bg-[var(--background)]"
      >
        <div className="mx-auto grid min-h-[610px] max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:py-20">
          <div>
            <p className="max-w-full text-[10px] font-bold uppercase leading-5 tracking-[0.08em] text-[var(--accent)] sm:text-xs sm:tracking-[0.16em] lg:tracking-[0.24em]">
              {settings?.hero_eyebrow ??
                settings?.service_area ??
                "ATENDIMENTO PROFISSIONAL"}
            </p>

            <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
              {settings?.hero_title ??
                `Soluções profissionais da ${company}`}
            </h1>

            {(settings?.hero_description ||
              settings?.slogan) && (
              <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">
                {settings?.hero_description ??
                  settings?.slogan}
              </p>
            )}

            {settings?.hero_secondary_text && (
              <p className="mt-3 max-w-xl leading-7 text-[var(--muted)]">
                {
                  settings.hero_secondary_text
                }
              </p>
            )}

            <div className="mt-7 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
              <a
                href={whatsappUrl}
                target={whatsapp ? "_blank" : undefined}
                rel={whatsapp ? "noreferrer" : undefined}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-[var(--brand)] px-3 py-2.5 text-center text-xs font-semibold leading-4 text-[var(--brand-foreground)] transition hover:-translate-y-0.5 hover:opacity-90 sm:min-h-0 sm:gap-2 sm:px-6 sm:py-3.5 sm:text-base"
              >
                {whatsapp && (
                  <FaWhatsapp className="shrink-0 text-sm sm:text-base" />
                )}

                <span>
                  Solicitar orçamento
                </span>
              </a>

              <a
                href="#trabalhos"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-center text-xs font-semibold leading-4 text-[var(--surface-foreground)] transition hover:-translate-y-0.5 sm:min-h-0 sm:px-6 sm:py-3.5 sm:text-base"
              >
                Ver trabalhos
              </a>
            </div>

            {stats.length > 0 && (
              <div className="mt-8 grid max-w-xl grid-cols-3 gap-x-5 gap-y-4 border-t border-[var(--border)] pt-6 sm:grid-cols-3 sm:gap-5 sm:pt-8">
                {stats.map((stat, index) => (
                  <div
                    key={`${stat.value}-${index}`}
                    className="min-w-0"
                  >
                    <strong className="block text-lg font-bold leading-tight text-[var(--foreground)] sm:text-2xl">
                      {stat.value}
                    </strong>

                    {stat.label && (
                      <p className="mt-1 text-[11px] leading-4 text-[var(--muted)] sm:text-xs sm:leading-5">
                        {stat.label}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            {settings?.hero_image_url ? (
              <>
                <div className="absolute -inset-3 -z-10 rounded-[28px] bg-[var(--accent)]/10" />

                <Image
                  src={
                    settings.hero_image_url
                  }
                  alt={`Trabalho realizado pela ${company}`}
                  width={900}
                  height={675}
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="aspect-[4/3] w-full rounded-2xl border border-[var(--border)] object-cover shadow-xl shadow-black/10"
                />
              </>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-8 text-center text-sm text-[var(--surface-muted)]">
                Adicione uma imagem do
                Hero no painel administrativo.
              </div>
            )}
          </div>
        </div>

        {cities.length > 0 && (
          <div className="border-t border-[var(--border)] bg-[var(--surface)]">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-5 text-sm sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex items-center gap-2">
                <MapPin
                  size={18}
                  className="shrink-0 text-[var(--accent)]"
                />

                <span className="font-medium text-[var(--surface-muted)]">
                  Atendemos também:
                </span>
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-3">
                {cities.map((city) => (
                  <span
                    key={city}
                    className="rounded-full border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-[var(--foreground)] shadow-sm"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SERVIÇOS */}
      {services.length > 0 && (
        <section
          id="servicos"
          className="scroll-mt-20 bg-[var(--background-alt)] py-20 sm:py-24"
        >
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="O QUE FAZEMOS"
              title="Especialidades"
              description="Soluções executadas com atenção aos detalhes, acabamento e qualidade."
            />

            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {services.map(
                (service) => (
                  <article
                    key={service.id}
                    className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-lg hover:shadow-black/10"
                  >
                    {service.icon && (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] transition">
                        <ServiceIcon
                          name={
                            service.icon
                          }
                          className="h-7 w-7 text-[var(--accent)]"
                        />
                      </div>
                    )}

                    <h3
                      className={`text-lg font-semibold text-[var(--surface-foreground)] ${
                        service.icon
                          ? "mt-6"
                          : ""
                      }`}
                    >
                      {service.name}
                    </h3>

                    {service.short_description && (
                      <p className="mt-3 leading-7 text-[var(--surface-muted)]">
                        {
                          service.short_description
                        }
                      </p>
                    )}
                  </article>
                ),
              )}
            </div>
          </div>
        </section>
      )}

      {/* GALERIA */}
      {gallery.length > 0 && (
        <section
          id="trabalhos"
          className="scroll-mt-20 bg-[var(--background)] py-20 sm:py-24"
        >
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <SectionHeading
                eyebrow="TRABALHOS REALIZADOS"
                title="Conheça alguns dos nossos projetos"
                description="Confira alguns trabalhos realizados e veja de perto os detalhes de cada projeto."
              />

              <span className="shrink-0 text-sm text-[var(--muted)]">
                {gallery.length}{" "}
                {gallery.length === 1
                  ? "trabalho"
                  : "trabalhos"}
              </span>
            </div>

            <div className="mt-10">
              <Gallery
                items={gallery}
              />
            </div>
          </div>
        </section>
      )}

      {/* ANTES E DEPOIS */}
      {beforeAfter.length > 0 && (
        <section className="bg-[var(--background-alt)] py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="TRANSFORMAÇÃO"
              title="Antes e depois"
              description="Arraste o controle sobre a imagem para comparar o ambiente antes e depois da execução do serviço."
            />

            <div className="mt-10 grid gap-x-6 gap-y-12 lg:grid-cols-2">
              {beforeAfter.map(
                (item) => (
                  <BeforeAfterSlider
                    key={item.id}
                    beforeUrl={
                      item.before_image_url
                    }
                    afterUrl={
                      item.after_image_url
                    }
                    title={
                      item.title
                    }
                    description={
                      item.description
                    }
                  />
                ),
              )}
            </div>
          </div>
        </section>
      )}

      {/* SOBRE */}
      {(settings?.about_title ||
        settings?.about_content ||
        settings?.about_image_url) && (
        <section
          id="sobre"
          className="scroll-mt-20 bg-[var(--background)] py-20 sm:py-24"
        >
          <div
            className={`mx-auto grid max-w-6xl items-center gap-12 px-6 ${
              settings?.about_image_url
                ? "md:grid-cols-[0.8fr_1.2fr]"
                : ""
            }`}
          >
            {settings?.about_image_url && (
              <div className="relative">
                <div className="absolute -inset-3 -z-10 rounded-[28px] bg-[var(--accent)]/10" />

                <Image
                  src={
                    settings.about_image_url
                  }
                  alt={
                    settings.about_title ??
                    `Sobre ${company}`
                  }
                  width={600}
                  height={750}
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="aspect-[4/5] w-full rounded-2xl object-cover shadow-lg shadow-black/10"
                />
              </div>
            )}

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
                QUEM FAZ
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
                {settings?.about_title ??
                  company}
              </h2>

              {settings?.about_content && (
                <p className="mt-6 whitespace-pre-line text-lg leading-8 text-[var(--muted)]">
                  {
                    settings.about_content
                  }
                </p>
              )}

              {whatsapp && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3 font-semibold text-[var(--brand-foreground)] transition hover:opacity-90"
                >
                  <FaWhatsapp />

                  Falar pelo WhatsApp
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* AVALIAÇÕES */}
      {reviews.length > 0 && (
        <section className="bg-[var(--background-alt)] py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="CLIENTES"
              title="O que nossos clientes dizem"
              description="Avaliações de clientes que já contrataram nossos serviços."
            />

            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {reviews
                .slice(0, 6)
                .map((review) => {
                  const rating =
                    Math.max(
                      0,
                      Math.min(
                        review.rating,
                        5,
                      ),
                    );

                  return (
                    <article
                      key={
                        review.id
                      }
                      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
                    >
                      <div className="flex gap-1 text-amber-500">
                        {Array.from({
                          length:
                            rating,
                        }).map(
                          (
                            _,
                            index,
                          ) => (
                            <Star
                              key={
                                index
                              }
                              size={
                                17
                              }
                              fill="currentColor"
                            />
                          ),
                        )}
                      </div>

                      <p className="mt-5 leading-7 text-[var(--surface-muted)]">
                        “{review.comment}”
                      </p>

                      <div className="mt-6 border-t border-[var(--border)] pt-4">
                        <strong className="block text-[var(--surface-foreground)]">
                          {
                            review.customer_name
                          }
                        </strong>

                        {review.city && (
                          <span className="mt-1 block text-sm text-[var(--surface-muted)]">
                            {
                              review.city
                            }
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <section
          id="duvidas"
          className="scroll-mt-20 bg-[var(--background)] py-20 sm:py-24"
        >
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="ANTES DE CHAMAR"
              title="Perguntas frequentes"
              description="Confira respostas para algumas das dúvidas mais comuns."
            />

            <div className="mt-10">
              <FaqAccordion
                items={faq}
              />
            </div>
          </div>
        </section>
      )}

      {/* ORÇAMENTO */}
      {form && whatsapp && (
        <section
          id="orcamento"
          className="scroll-mt-20 border-y border-[var(--border)] bg-[var(--background-alt)] py-20 sm:py-24"
        >
          <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
                SOLICITE SEU ORÇAMENTO
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
                {form.title}
              </h2>

              {form.description && (
                <p className="mt-5 max-w-lg leading-7 text-[var(--muted)]">
                  {form.description}
                </p>
              )}

              <div className="mt-8 flex items-start gap-3 text-sm text-[var(--muted)]">
                <FaWhatsapp className="mt-1 shrink-0 text-lg text-[var(--accent)]" />

                <p>
                  Depois de preencher o formulário,
                  você continuará o atendimento
                  diretamente pelo WhatsApp.
                </p>
              </div>
            </div>

            <form
              action={submitLead}
              className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-lg shadow-black/5 sm:p-6"
            >
              <input
                type="hidden"
                name="tenant_id"
                value={tenant.id}
              />

              <input
                type="hidden"
                name="target_whatsapp"
                value={whatsapp}
              />

              <input
                type="hidden"
                name="intro"
                value={form.whatsapp_intro_message}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Nome">
                  <Input
                    name="name"
                    autoComplete="name"
                    placeholder={
                      form.name_placeholder ||
                      "Seu nome"
                    }
                  />
                </FormField>

                <FormField label="WhatsApp">
                  <Input
                    name="whatsapp"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder={
                      form.whatsapp_placeholder ||
                      "WhatsApp com DDD"
                    }
                  />
                </FormField>
              </div>

              <FormField label="Cidade / bairro">
                <Input
                  name="location"
                  placeholder={
                    form.location_placeholder ||
                    "Informe sua cidade ou bairro"
                  }
                />
              </FormField>

              <FormField label="Tipo de serviço">
                <select
                  name="service_id"
                  defaultValue=""
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                >
                  <option value="">
                    {form.service_placeholder ||
                      "Selecione o serviço"}
                  </option>

                  {services.map((service) => (
                    <option
                      key={service.id}
                      value={service.id}
                    >
                      {service.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Mensagem">
                <textarea
                  name="message"
                  rows={5}
                  placeholder={
                    form.message_placeholder ||
                    "Conte um pouco sobre o que você precisa"
                  }
                  className="w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                />
              </FormField>

              <button
                type="submit"
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-6 py-3.5 font-semibold text-[var(--brand-foreground)] transition hover:-translate-y-0.5 hover:opacity-90"
              >
                <FaWhatsapp />

                {form.submit_button_text ||
                  "Enviar e continuar no WhatsApp"}
              </button>
            </form>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-8 text-center text-sm text-[var(--surface-muted)] sm:flex-row sm:text-left">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            {settings?.logo_light_url ? (
              <Image
                src={
                  settings.logo_light_url
                }
                alt={company}
                width={110}
                height={45}
                className="h-9 w-auto object-contain"
              />
            ) : (
              <strong className="text-[var(--surface-foreground)]">
                {company}
              </strong>
            )}

            {(settings?.city ||
              settings?.state) && (
              <span className="text-xs text-[var(--surface-muted)]">
                {[
                  settings?.city,
                  settings?.state,
                ]
                  .filter(Boolean)
                  .join(" - ")}
              </span>
            )}
          </div>

          <span>
            © {new Date().getFullYear()}{" "}
            {company}. Todos os direitos
            reservados.
          </span>

          <div className="flex gap-3">
            {settings?.instagram_url && (
              <Social
                href={
                  settings.instagram_url
                }
                label="Instagram"
              >
                <FaInstagram />
              </Social>
            )}

            {settings?.facebook_url && (
              <Social
                href={
                  settings.facebook_url
                }
                label="Facebook"
              >
                <FaFacebookF />
              </Social>
            )}

            {settings?.tiktok_url && (
              <Social
                href={
                  settings.tiktok_url
                }
                label="TikTok"
              >
                <FaTiktok />
              </Social>
            )}
          </div>
        </div>
      </footer>
    </main>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
        {title}
      </h2>

      {description && (
        <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">
          {description}
        </p>
      )}
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[var(--surface-foreground)]">
        {label}
      </span>

      {children}
    </label>
  );
}

function Input(
  props: InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <input
      {...props}
      required
      className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
    />
  );
}

function Social({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--surface-foreground)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
    >
      {children}
    </a>
  );
}