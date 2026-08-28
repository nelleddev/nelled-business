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

type ExtendedTenantSettings =
  TenantSettings & {
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
      item.value.trim().length >
        0,
  );

  const cssVariables = {
    "--brand": primary,
    "--accent": accent,
    "--background": secondary,
  } as CSSProperties;

  return (
    <main
      style={cssVariables}
      className="min-h-screen bg-[var(--background)] text-slate-900"
    >
      {/* ATUALIZAÇÃO AUTOMÁTICA */}
      <SiteLiveRefresh
        tenantId={tenant.id}
      />

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
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
                className="h-11 w-auto object-contain sm:h-12"
              />
            ) : (
              <strong className="text-lg text-slate-950">
                {company}
              </strong>
            )}
          </a>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-700 lg:flex">
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

          {whatsapp && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 sm:px-5"
            >
              <FaWhatsapp className="text-lg" />

              <span className="hidden sm:inline">
                Orçamento no WhatsApp
              </span>

              <span className="sm:hidden">
                Orçamento
              </span>
            </a>
          )}
        </div>
      </header>

      {/* HERO */}
      <section
        id="topo"
        className="hero-grid scroll-mt-20 border-b border-slate-200 bg-[var(--background)]"
      >
        <div className="mx-auto grid min-h-[610px] max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">
              {settings?.hero_eyebrow ??
                settings?.service_area ??
                "ATENDIMENTO PROFISSIONAL"}
            </p>

            <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              {settings?.hero_title ??
                `Soluções profissionais da ${company}`}
            </h1>

            {(settings?.hero_description ||
              settings?.slogan) && (
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                {settings?.hero_description ??
                  settings?.slogan}
              </p>
            )}

            {settings?.hero_secondary_text && (
              <p className="mt-3 max-w-xl leading-7 text-slate-500">
                {
                  settings.hero_secondary_text
                }
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={whatsappUrl}
                target={
                  whatsapp
                    ? "_blank"
                    : undefined
                }
                rel={
                  whatsapp
                    ? "noreferrer"
                    : undefined
                }
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-6 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-90"
              >
                {whatsapp && (
                  <FaWhatsapp />
                )}

                Solicitar orçamento grátis
              </a>

              <a
                href="#trabalhos"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Ver trabalhos realizados
              </a>
            </div>

            {stats.length > 0 && (
              <div className="mt-10 grid max-w-xl grid-cols-1 gap-5 border-t border-slate-200 pt-8 sm:grid-cols-3">
                {stats.map(
                  (stat, index) => (
                    <div
                      key={`${stat.value}-${index}`}
                    >
                      <strong className="text-2xl font-bold text-slate-950">
                        {stat.value}
                      </strong>

                      {stat.label && (
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {stat.label}
                        </p>
                      )}
                    </div>
                  ),
                )}
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
                  className="aspect-[4/3] w-full rounded-2xl border border-slate-200 object-cover shadow-xl shadow-slate-900/10"
                />
              </>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-8 text-center text-sm text-slate-400">
                Adicione uma imagem do
                Hero no painel
                administrativo.
              </div>
            )}
          </div>
        </div>

        {cities.length > 0 && (
          <div className="border-t border-slate-200 bg-white/70">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-6 py-5 text-sm">
              <MapPin
                size={18}
                className="text-[var(--accent)]"
              />

              <span className="mr-1 font-medium text-slate-600">
                Atendemos também:
              </span>

              {cities.map((city) => (
                <span
                  key={city}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 shadow-sm"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* SERVIÇOS */}
      {services.length > 0 && (
        <section
          id="servicos"
          className="scroll-mt-20 bg-[color-mix(in_srgb,var(--background)_92%,#000_8%)] py-20 sm:py-24"
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
                    className="group rounded-2xl border border-slate-200 bg-white p-7 transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-lg hover:shadow-slate-900/5"
                  >
                    {service.icon && (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 transition group-hover:bg-[var(--accent)]/10">
                        <ServiceIcon
                          name={
                            service.icon
                          }
                          className="h-7 w-7 text-slate-700 transition group-hover:text-[var(--accent)]"
                        />
                      </div>
                    )}

                    <h3
                      className={`text-lg font-semibold text-slate-950 ${
                        service.icon
                          ? "mt-6"
                          : ""
                      }`}
                    >
                      {service.name}
                    </h3>

                    {service.short_description && (
                      <p className="mt-3 leading-7 text-slate-600">
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

              <span className="shrink-0 text-sm text-slate-400">
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
      {beforeAfter.length >
        0 && (
        <section className="bg-[color-mix(in_srgb,var(--background)_92%,#000_8%)] py-20 sm:py-24">
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
                  className="aspect-[4/5] w-full rounded-2xl object-cover shadow-lg shadow-slate-900/10"
                />
              </div>
            )}

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
                QUEM FAZ
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {settings?.about_title ??
                  company}
              </h2>

              {settings?.about_content && (
                <p className="mt-6 whitespace-pre-line text-lg leading-8 text-slate-600">
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
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3 font-semibold text-white transition hover:opacity-90"
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
        <section className="bg-[color-mix(in_srgb,var(--background)_92%,#000_8%)] py-20 sm:py-24">
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
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
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

                      <p className="mt-5 leading-7 text-slate-600">
                        “
                        {
                          review.comment
                        }
                        ”
                      </p>

                      <div className="mt-6 border-t border-slate-100 pt-4">
                        <strong className="block text-slate-950">
                          {
                            review.customer_name
                          }
                        </strong>

                        {review.city && (
                          <span className="mt-1 block text-sm text-slate-400">
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
              <FaqAccordion items={faq} />
            </div>
          </div>
        </section>
      )}

      {/* ORÇAMENTO */}
      {form && whatsapp && (
        <section
          id="orcamento"
          className="scroll-mt-20 bg-[var(--brand)] py-20 text-white sm:py-24"
        >
          <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
                SOLICITE SEU
                ORÇAMENTO
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                {form.title}
              </h2>

              {form.description && (
                <p className="mt-5 max-w-lg leading-7 text-white/70">
                  {
                    form.description
                  }
                </p>
              )}

              <div className="mt-8 flex items-start gap-3 text-sm text-white/70">
                <FaWhatsapp className="mt-1 shrink-0 text-lg text-[var(--accent)]" />

                <p>
                  Depois de preencher
                  o formulário, você
                  continuará o
                  atendimento
                  diretamente pelo
                  WhatsApp.
                </p>
              </div>
            </div>

            <form
              action={submitLead}
              className="grid gap-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 sm:p-6"
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
                value={
                  form.whatsapp_intro_message
                }
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
                  className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-[var(--accent)]"
                >
                  <option
                    value=""
                    className="text-slate-900"
                  >
                    {form.service_placeholder ||
                      "Selecione o serviço"}
                  </option>

                  {services.map(
                    (service) => (
                      <option
                        key={
                          service.id
                        }
                        value={
                          service.id
                        }
                        className="text-slate-900"
                      >
                        {
                          service.name
                        }
                      </option>
                    ),
                  )}
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
                  className="w-full resize-y rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-white/40 focus:border-[var(--accent)]"
                />
              </FormField>

              <button
                type="submit"
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-[var(--brand)] transition hover:-translate-y-0.5 hover:opacity-90"
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
      <footer className="border-t border-slate-200 bg-[var(--background)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-8 text-center text-sm text-slate-500 sm:flex-row sm:text-left">
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
              <strong className="text-slate-800">
                {company}
              </strong>
            )}

            {(settings?.city ||
              settings?.state) && (
              <span className="text-xs text-slate-400">
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

      <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h2>

      {description && (
        <p className="mt-4 max-w-2xl leading-7 text-slate-500">
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
      <span className="mb-2 block text-sm font-medium text-white/80">
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
      className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-white/40 focus:border-[var(--accent)]"
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
      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
    >
      {children}
    </a>
  );
}