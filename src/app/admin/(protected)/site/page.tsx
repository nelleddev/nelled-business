import type { ReactNode } from "react";
import Image from "next/image";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ColorField } from "@/components/admin/color-field";
import { FormMessage } from "@/components/admin/form-message";
import { SiteUpdateBroadcaster } from "@/components/admin/site-update-broadcaster";
import { getCurrentTenant } from "@/lib/auth/get-current-tenant";
import { DEFAULT_SITE_THEME } from "@/lib/theme/default-site-theme";
import type { TenantSettings } from "@/types/tenant";

import {
  resetSiteTheme,
  updateSiteSettings,
} from "./actions";

const input =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

const label =
  "block text-sm font-medium text-slate-700";

type ExtendedTenantSettings =
  TenantSettings & {
    service_cities?: string | null;

    hero_eyebrow?: string | null;
    hero_secondary_text?: string | null;

    stat_1_value?: string | null;
    stat_1_label?: string | null;

    stat_2_value?: string | null;
    stat_2_label?: string | null;

    stat_3_value?: string | null;
    stat_3_label?: string | null;

    about_image_url?: string | null;

    about_highlight_1?: string | null;
    about_highlight_2?: string | null;
    about_highlight_3?: string | null;

    instagram_username?: string | null;
    facebook_username?: string | null;
    tiktok_username?: string | null;

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
  description?: string;
  children: ReactNode;
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
  username: string | null | undefined,
  url: string | null | undefined,
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

  const params = await searchParams;

  const siteWasUpdated =
    params.success ===
      "Site atualizado com sucesso" ||
    params.success ===
      "Tema padrão restaurado";

  const stats: StatField[] = [
    {
      valueName: "stat_1_value",
      labelName: "stat_1_label",
      value:
        settings.stat_1_value ??
        null,
      label:
        settings.stat_1_label ??
        null,
    },
    {
      valueName: "stat_2_value",
      labelName: "stat_2_label",
      value:
        settings.stat_2_value ??
        null,
      label:
        settings.stat_2_label ??
        null,
    },
    {
      valueName: "stat_3_value",
      labelName: "stat_3_label",
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
        description="Edite a identidade visual e o conteúdo principal da landing page."
      />

      <FormMessage
        success={params.success}
        error={params.error}
      />

      <SiteUpdateBroadcaster
        tenantId={
          currentTenant.tenant.id
        }
        shouldBroadcast={
          siteWasUpdated
        }
      />

      <form
        action={updateSiteSettings}
        className="space-y-6"
      >
        {/* EMPRESA */}
        <Card
          title="Empresa e identidade"
          description="Informações básicas utilizadas em toda a landing page."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              name="company_name"
              title="Nome da empresa"
              value={
                settings.company_name ??
                currentTenant.tenant.name
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
        <Card
          title="Identidade visual"
          description="Escolha as três cores principais do site. Cada uma possui uma função específica."
        >
          <div className="grid gap-5 lg:grid-cols-3">
            <ColorField
              name="primary_color"
              title="Cor principal"
              description="Usada nos CTAs e na área de orçamento."
              defaultValue={
                settings.primary_color ??
                DEFAULT_SITE_THEME.primary
              }
            />

            <ColorField
              name="secondary_color"
              title="Cor de fundo do site"
              description="Define a cor base da landing page, navbar e das principais seções."
              defaultValue={
                settings.secondary_color ??
                DEFAULT_SITE_THEME.background
              }
            />

            <ColorField
              name="accent_color"
              title="Cor de destaque"
              description="Usada em botões principais, ícones, pequenos títulos, detalhes e efeitos de interação."
              defaultValue={
                settings.accent_color ??
                DEFAULT_SITE_THEME.accent
              }
            />
          </div>

          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-900">
              Como as cores são usadas
            </p>

            <div className="mt-3 grid gap-2 text-sm text-blue-800 sm:grid-cols-3">
              <p>
                <strong>
                  Principal:
                </strong>{" "}
                CTAs e área de orçamento.
              </p>

              <p>
                <strong>
                  Fundo:
                </strong>{" "}
                landing page, navbar e
                principais seções.
              </p>

              <p>
                <strong>
                  Destaque:
                </strong>{" "}
                botões principais, ícones,
                títulos menores e detalhes.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Tema padrão
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Restaura somente as três
                cores. Textos, imagens,
                serviços e demais
                configurações não são
                alterados.
              </p>
            </div>

            <button
              type="submit"
              formAction={resetSiteTheme}
              className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              Restaurar tema padrão
            </button>
          </div>
        </Card>

        {/* HERO */}
        <Card
          title="Hero"
          description="Primeira área que o visitante vê ao acessar o site."
        >
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
        <Card
          title="Indicadores"
          description="Números de destaque exibidos no Hero."
        >
          <p className="mb-5 text-sm text-slate-500">
            Exemplos: +10 anos de
            experiência, +500 projetos ou
            atendimento em toda a região.
          </p>

          <div className="grid gap-5 md:grid-cols-3">
            {stats.map(
              (stat, index) => (
                <div
                  key={stat.valueName}
                  className="space-y-3 rounded-xl bg-slate-50 p-4"
                >
                  <p className="text-sm font-semibold text-slate-700">
                    Indicador {index + 1}
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
        <Card
          title="Localização"
          description="Configure a cidade principal e as demais regiões atendidas."
        >
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
        <Card
          title="Sobre"
          description="Apresente a empresa ou profissional ao visitante."
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="space-y-5">
              <Field
                name="about_title"
                title="Título"
                value={settings.about_title}
              />

              <label className={label}>
                Texto

                <textarea
                  name="about_content"
                  rows={7}
                  defaultValue={
                    settings.about_content ?? ""
                  }
                  className={input}
                />
              </label>

              <div className="border-t border-slate-200 pt-5">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-slate-800">
                    Destaques
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Pequenos diferenciais exibidos abaixo do texto da seção Sobre.
                  </p>
                </div>

                <div className="grid gap-4">
                  <Field
                    name="about_highlight_1"
                    title="Destaque 1"
                    value={
                      settings.about_highlight_1
                    }
                    placeholder="Orçamento sem compromisso"
                  />

                  <Field
                    name="about_highlight_2"
                    title="Destaque 2"
                    value={
                      settings.about_highlight_2
                    }
                    placeholder="Materiais de qualidade"
                  />

                  <Field
                    name="about_highlight_3"
                    title="Destaque 3"
                    value={
                      settings.about_highlight_3
                    }
                    placeholder="Prazo combinado em contrato"
                  />
                </div>
              </div>
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
                  src={settings.about_image_url}
                  alt="Imagem atual da seção Sobre"
                  width={420}
                  height={525}
                  className="mt-4 aspect-[4/5] w-full max-w-[320px] rounded-lg object-cover"
                />
              )}
            </label>
          </div>
        </Card>

        {/* REDES SOCIAIS */}
        <Card
          title="Contato e redes sociais"
          description="Digite somente o usuário. O endereço completo é gerado automaticamente."
        >
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
        <Card
          title="SEO"
          description="Informações utilizadas por buscadores e compartilhamentos."
        >
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
  description,
  children,
}: CardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-950">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}