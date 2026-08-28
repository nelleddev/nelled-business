import type { ReactNode } from "react";
import Image from "next/image";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { FormMessage } from "@/components/admin/form-message";
import { getCurrentTenant } from "@/lib/auth/get-current-tenant";
import type { TenantSettings } from "@/types/tenant";

import { updateSiteSettings } from "./actions";

const input =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

const label =
  "block text-sm font-medium text-slate-700";

type ExtendedTenantSettings =
  TenantSettings & {
    service_cities?: string | null;

    hero_eyebrow?: string | null;
    hero_secondary_text?:
      | string
      | null;

    stat_1_value?: string | null;
    stat_1_label?: string | null;

    stat_2_value?: string | null;
    stat_2_label?: string | null;

    stat_3_value?: string | null;
    stat_3_label?: string | null;

    about_image_url?:
      | string
      | null;

    instagram_username?:
      | string
      | null;

    facebook_username?:
      | string
      | null;

    tiktok_username?:
      | string
      | null;

    tiktok_url?: string | null;
  };

type SearchParams = {
  success?: string;
  error?: string;
};

type SitePageProps = {
  searchParams: Promise<SearchParams>;
};

type FieldProps = {
  name: string;
  title: string;
  value?: string | null;
  placeholder?: string;
};

type CardProps = {
  title: string;
  children: ReactNode;
};

type ColorField = {
  name:
    | "primary_color"
    | "secondary_color"
    | "accent_color";
  title: string;
  value: string;
};

type StatField = {
  valueName:
    | "stat_1_value"
    | "stat_2_value"
    | "stat_3_value";
  labelName:
    | "stat_1_label"
    | "stat_2_label"
    | "stat_3_label";
  value: string | null;
  label: string | null;
};

function getSocialUsername(
  username:
    | string
    | null
    | undefined,
  url:
    | string
    | null
    | undefined,
): string {
  if (username) {
    return username;
  }

  if (!url) {
    return "";
  }

  return url
    .replace(
      /^https?:\/\/(www\.)?[^/]+\/?/i,
      "",
    )
    .replace(/^@/, "")
    .replace(/^\//, "")
    .replace(/\/$/, "");
}

export default async function SitePage({
  searchParams,
}: SitePageProps) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    return null;
  }

  const settings =
    (currentTenant.settings ??
      {}) as Partial<ExtendedTenantSettings>;

  const params =
    await searchParams;

  const colors: ColorField[] = [
    {
      name: "primary_color",
      title: "Principal",
      value:
        settings.primary_color ??
        "#0b3b6f",
    },
    {
      name: "secondary_color",
      title: "Fundo",
      value:
        settings.secondary_color ??
        "#ffffff",
    },
    {
      name: "accent_color",
      title: "Destaque",
      value:
        settings.accent_color ??
        "#f59e42",
    },
  ];

  const stats: StatField[] = [
    {
      valueName:
        "stat_1_value",
      labelName:
        "stat_1_label",
      value:
        settings.stat_1_value ??
        null,
      label:
        settings.stat_1_label ??
        null,
    },
    {
      valueName:
        "stat_2_value",
      labelName:
        "stat_2_label",
      value:
        settings.stat_2_value ??
        null,
      label:
        settings.stat_2_label ??
        null,
    },
    {
      valueName:
        "stat_3_value",
      labelName:
        "stat_3_label",
      value:
        settings.stat_3_value ??
        null,
      label:
        settings.stat_3_label ??
        null,
    },
  ];

  const instagramUsername =
    getSocialUsername(
      settings.instagram_username,
      settings.instagram_url,
    );

  const facebookUsername =
    getSocialUsername(
      settings.facebook_username,
      settings.facebook_url,
    );

  const tiktokUsername =
    getSocialUsername(
      settings.tiktok_username,
      settings.tiktok_url,
    );

  return (
    <>
      <AdminPageHeader
        title="Site"
        description="Edite toda a identidade e o conteúdo principal da landing page."
      />

      <FormMessage
        success={params.success}
        error={params.error}
      />

      <form
        action={updateSiteSettings}
        className="space-y-6"
      >
        {/* EMPRESA */}
        <Card title="Empresa e identidade">
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              name="company_name"
              title="Nome da empresa"
              value={
                settings.company_name ??
                currentTenant.tenant
                  .name
              }
            />

            <Field
              name="short_name"
              title="Nome curto"
              value={
                settings.short_name
              }
            />

            <Field
              name="slogan"
              title="Slogan"
              value={settings.slogan}
            />

            <Field
              name="email"
              title="E-mail"
              value={settings.email}
            />

            <Field
              name="whatsapp"
              title="WhatsApp"
              value={
                settings.whatsapp
              }
              placeholder="5582999999999"
            />

            <label className={label}>
              Logo

              <input
                type="file"
                name="logo"
                accept="image/*"
                className={input}
              />

              {settings.logo_light_url && (
                <Image
                  src={
                    settings.logo_light_url
                  }
                  alt="Logo atual"
                  width={160}
                  height={80}
                  className="mt-4 h-14 w-auto rounded-lg object-contain"
                />
              )}
            </label>
          </div>
        </Card>

        {/* CORES */}
        <Card title="Cores">
          <div className="grid gap-5 sm:grid-cols-3">
            {colors.map(
              (color) => (
                <label
                  key={color.name}
                  className={label}
                >
                  {color.title}

                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="color"
                      name={color.name}
                      defaultValue={
                        color.value
                      }
                      className="h-12 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                    />

                    <input
                      value={
                        color.value
                      }
                      readOnly
                      className={`${input} mt-0`}
                    />
                  </div>
                </label>
              ),
            )}
          </div>
        </Card>

        {/* HERO */}
        <Card title="Hero">
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              name="hero_eyebrow"
              title="Texto superior"
              value={
                settings.hero_eyebrow
              }
              placeholder="FORROS · DIVISÓRIAS · SANCAS COM ILUMINAÇÃO"
            />

            <Field
              name="service_area"
              title="Área de atendimento"
              value={
                settings.service_area
              }
              placeholder="Penedo e região"
            />

            <div className="md:col-span-2">
              <Field
                name="hero_title"
                title="Título principal"
                value={
                  settings.hero_title
                }
              />
            </div>

            <label
              className={`${label} md:col-span-2`}
            >
              Descrição

              <textarea
                name="hero_description"
                rows={3}
                defaultValue={
                  settings.hero_description ??
                  ""
                }
                className={input}
              />
            </label>

            <label
              className={`${label} md:col-span-2`}
            >
              Texto complementar

              <textarea
                name="hero_secondary_text"
                rows={2}
                defaultValue={
                  settings.hero_secondary_text ??
                  ""
                }
                className={input}
              />
            </label>

            <label
              className={`${label} md:col-span-2`}
            >
              Imagem do Hero

              <input
                type="file"
                name="hero_image"
                accept="image/*"
                className={input}
              />

              {settings.hero_image_url && (
                <Image
                  src={
                    settings.hero_image_url
                  }
                  alt="Imagem atual do Hero"
                  width={700}
                  height={420}
                  className="mt-4 max-h-72 w-full rounded-xl object-cover md:max-w-xl"
                />
              )}
            </label>
          </div>
        </Card>

        {/* INDICADORES */}
        <Card title="Indicadores">
          <p className="mb-5 text-sm text-slate-500">
            Exemplos: +10 anos de
            experiência, +500 projetos,
            atendimento em toda a região.
          </p>

          <div className="grid gap-5 md:grid-cols-3">
            {stats.map(
              (stat, index) => (
                <div
                  key={
                    stat.valueName
                  }
                  className="space-y-3 rounded-xl bg-slate-50 p-4"
                >
                  <p className="text-sm font-semibold text-slate-700">
                    Indicador{" "}
                    {index + 1}
                  </p>

                  <Field
                    name={
                      stat.valueName
                    }
                    title="Valor"
                    value={stat.value}
                    placeholder="+10 anos"
                  />

                  <Field
                    name={
                      stat.labelName
                    }
                    title="Legenda"
                    value={stat.label}
                    placeholder="de experiência"
                  />
                </div>
              ),
            )}
          </div>
        </Card>

        {/* LOCALIZAÇÃO */}
        <Card title="Localização">
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              name="city"
              title="Cidade principal"
              value={settings.city}
            />

            <Field
              name="state"
              title="Estado"
              value={settings.state}
            />

            <div className="md:col-span-2">
              <Field
                name="service_cities"
                title="Outras cidades atendidas"
                value={
                  settings.service_cities
                }
                placeholder="Penedo/AL, Piaçabuçu/AL, Igreja Nova/AL"
              />

              <p className="mt-2 text-xs text-slate-500">
                Separe as cidades por
                vírgula.
              </p>
            </div>
          </div>
        </Card>

        {/* SOBRE */}
        <Card title="Sobre">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-5">
              <Field
                name="about_title"
                title="Título"
                value={
                  settings.about_title
                }
              />

              <label className={label}>
                Texto

                <textarea
                  name="about_content"
                  rows={7}
                  defaultValue={
                    settings.about_content ??
                    ""
                  }
                  className={input}
                />
              </label>
            </div>

            <label className={label}>
              Foto

              <input
                type="file"
                name="about_image"
                accept="image/*"
                className={input}
              />

              {settings.about_image_url && (
                <Image
                  src={
                    settings.about_image_url
                  }
                  alt="Imagem atual da seção Sobre"
                  width={500}
                  height={500}
                  className="mt-4 h-64 w-full rounded-xl object-cover"
                />
              )}
            </label>
          </div>
        </Card>

        {/* REDES SOCIAIS */}
        <Card title="Contato e redes sociais">
          <p className="mb-5 text-sm text-slate-500">
            Digite somente o usuário da
            rede social. Não precisa
            informar a URL completa.
          </p>

          <div className="grid gap-5 md:grid-cols-2">
            <SocialField
              name="instagram_username"
              title="Instagram"
              prefix="instagram.com/"
              value={
                instagramUsername
              }
              placeholder="gilvanforros"
            />

            <SocialField
              name="facebook_username"
              title="Facebook"
              prefix="facebook.com/"
              value={
                facebookUsername
              }
              placeholder="gilvanforros"
            />

            <SocialField
              name="tiktok_username"
              title="TikTok"
              prefix="tiktok.com/@"
              value={
                tiktokUsername
              }
              placeholder="gilvanforros"
            />
          </div>
        </Card>

        {/* SEO */}
        <Card title="SEO">
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              name="seo_title"
              title="Título SEO"
              value={
                settings.seo_title
              }
            />

            <Field
              name="seo_description"
              title="Descrição SEO"
              value={
                settings.seo_description
              }
            />
          </div>
        </Card>

        <div className="sticky bottom-4 z-10 flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-7 py-3.5 font-semibold text-white shadow-lg transition hover:bg-blue-500"
          >
            Salvar alterações
          </button>
        </div>
      </form>
    </>
  );
}

function Field({
  name,
  title,
  value,
  placeholder = "",
}: FieldProps) {
  return (
    <label className={label}>
      {title}

      <input
        name={name}
        defaultValue={value ?? ""}
        placeholder={placeholder}
        className={input}
      />
    </label>
  );
}

function SocialField({
  name,
  title,
  prefix,
  value,
  placeholder,
}: {
  name: string;
  title: string;
  prefix: string;
  value: string;
  placeholder: string;
}) {
  return (
    <label className={label}>
      {title}

      <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10">
        <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
          {prefix}
        </span>

        <input
          name={name}
          defaultValue={value}
          placeholder={placeholder}
          className="min-w-0 flex-1 px-3 py-3 text-sm outline-none"
        />
      </div>
    </label>
  );
}

function Card({
  title,
  children,
}: CardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="mb-6 text-lg font-semibold text-slate-950">
        {title}
      </h2>

      {children}
    </section>
  );
}