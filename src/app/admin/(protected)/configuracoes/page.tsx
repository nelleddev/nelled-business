import type {
  LucideIcon,
} from "lucide-react";
import {
  Activity,
  Cloud,
  Database,
  ExternalLink,
  Globe2,
  ImageIcon,
  KeyRound,
  Link2,
  LogOut,
  Mail,
  Palette,
  Server,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getCurrentTenant } from "@/lib/auth/get-current-tenant";
import { createClient } from "@/lib/supabase/server";

import {
  signOutAction,
} from "./actions";

export const dynamic =
  "force-dynamic";

type Domain = {
  id: string;
  domain: string;
  type:
    | "subdomain"
    | "custom";
  status:
    | "pending"
    | "verified"
    | "failed";
  is_primary: boolean;
};

type IntegrationStatus = {
  name: string;
  description: string;
  configured: boolean;
  icon: LucideIcon;
};

const roleLabels: Record<
  string,
  string
> = {
  owner: "Proprietário",
  admin: "Administrador",
  editor: "Editor",
};

const tenantStatusLabels: Record<
  string,
  string
> = {
  active: "Ativo",
  inactive: "Inativo",
  suspended: "Suspenso",
};

function formatDate(
  value:
    | string
    | null
    | undefined,
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(
    new Date(value),
  );
}

export default async function SettingsPage() {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    return null;
  }

  const supabase =
    await createClient();

  const {
    data: domainsData,
  } = await supabase
    .from("tenant_domains")
    .select(
      `
        id,
        domain,
        type,
        status,
        is_primary
      `,
    )
    .eq(
      "tenant_id",
      currentTenant.tenant.id,
    )
    .order(
      "is_primary",
      {
        ascending: false,
      },
    );

  const domains =
    (domainsData ??
      []) as Domain[];

  const primaryDomain =
    domains.find(
      (domain) =>
        domain.is_primary &&
        domain.status ===
          "verified",
    ) ??
    domains.find(
      (domain) =>
        domain.status ===
        "verified",
    ) ??
    domains.find(
      (domain) =>
        domain.type ===
        "subdomain",
    ) ??
    null;

  const companyName =
    currentTenant.settings
      ?.company_name ??
    currentTenant.tenant.name;

  const role =
    roleLabels[
      currentTenant.membership
        .role
    ] ??
    currentTenant.membership
      .role;

  const tenantStatus =
    tenantStatusLabels[
      currentTenant.tenant
        .status
    ] ??
    currentTenant.tenant
      .status;

  const integrations: IntegrationStatus[] =
    [
      {
        name: "Supabase",
        description:
          "Banco de dados, autenticação e dados do sistema.",
        configured: Boolean(
          process.env
            .NEXT_PUBLIC_SUPABASE_URL &&
            process.env
              .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        ),
        icon: Database,
      },
      {
        name: "Cloudinary",
        description:
          "Armazenamento e entrega das imagens do site.",
        configured: Boolean(
          process.env
            .CLOUDINARY_CLOUD_NAME &&
            process.env
              .CLOUDINARY_API_KEY &&
            process.env
              .CLOUDINARY_API_SECRET,
        ),
        icon: ImageIcon,
      },
      {
        name: "Resend",
        description:
          "Infraestrutura para envio de e-mails do sistema.",
        configured: Boolean(
          process.env
            .RESEND_API_KEY &&
            process.env
              .RESEND_FROM_EMAIL,
        ),
        icon: Mail,
      },
    ];

  const configuredIntegrations =
    integrations.filter(
      (integration) =>
        integration.configured,
    ).length;

  return (
    <>
      <AdminPageHeader
        title="Configurações"
        description="Informações da conta, acesso, integrações e configurações gerais da empresa."
      />

      {/* RESUMO */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={Globe2}
          title="Empresa"
          value={companyName}
          description={`@${currentTenant.tenant.slug}`}
        />

        <SummaryCard
          icon={ShieldCheck}
          title="Conta"
          value={role}
          description={`Status: ${tenantStatus}`}
        />

        <SummaryCard
          icon={Link2}
          title="Domínios"
          value={String(
            domains.length,
          )}
          description={
            primaryDomain
              ? primaryDomain.domain
              : "Nenhum endereço ativo"
          }
        />

        <SummaryCard
          icon={Activity}
          title="Integrações"
          value={`${configuredIntegrations}/${integrations.length}`}
          description="serviços configurados"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_380px]">
        <div className="space-y-6">
          {/* CONTA */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <UserRound
                  size={19}
                />
              </div>

              <div>
                <h2 className="font-semibold text-slate-950">
                  Conta
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  Informações do usuário conectado ao painel.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InfoItem
                label="E-mail"
                value={
                  currentTenant.user
                    .email ??
                  "Não informado"
                }
              />

              <InfoItem
                label="Nível de acesso"
                value={role}
              />

              <InfoItem
                label="ID do usuário"
                value={
                  currentTenant.user.id
                }
                mono
              />

              <InfoItem
                label="Último acesso"
                value={formatDate(
                  currentTenant.user
                    .last_sign_in_at,
                )}
              />
            </div>
          </section>

          {/* EMPRESA */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                <Cloud size={19} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-950">
                  Empresa
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  Informações internas do tenant atual.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InfoItem
                label="Nome"
                value={companyName}
              />

              <InfoItem
                label="Slug"
                value={
                  currentTenant.tenant
                    .slug
                }
                mono
              />

              <InfoItem
                label="Status"
                value={tenantStatus}
              />

              <InfoItem
                label="ID do tenant"
                value={
                  currentTenant.tenant.id
                }
                mono
              />
            </div>

            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex gap-3">
                <Palette
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <div>
                  <p className="text-sm font-semibold text-blue-950">
                    Aparência e conteúdo
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-800">
                    Nome público, cores, logotipo, Hero, Sobre, redes sociais e SEO são gerenciados na área Site.
                  </p>

                  <Link
                    href="/admin/site"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-600"
                  >
                    Abrir configurações do site

                    <ExternalLink
                      size={13}
                    />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* INTEGRAÇÕES */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <Server size={19} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-950">
                  Integrações
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  Estado dos serviços utilizados pela plataforma.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {integrations.map(
                (integration) => (
                  <IntegrationCard
                    key={
                      integration.name
                    }
                    {...integration}
                  />
                ),
              )}
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <div className="flex gap-3">
                <KeyRound
                  size={18}
                  className="mt-0.5 shrink-0 text-slate-500"
                />

                <p className="text-xs leading-5 text-slate-500">
                  Por segurança, chaves de API e credenciais nunca são exibidas no painel. Esta tela mostra somente se a configuração necessária está disponível no servidor.
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          {/* SITE PÚBLICO */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-950">
              Site público
            </h2>

            {primaryDomain ? (
              <>
                <p className="mt-2 break-all text-sm font-medium text-slate-700">
                  {
                    primaryDomain.domain
                  }
                </p>

                <a
                  href={`https://${primaryDomain.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  <ExternalLink
                    size={15}
                  />

                  Abrir site
                </a>
              </>
            ) : (
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Nenhum domínio foi encontrado para a empresa.
              </p>
            )}

            <Link
              href="/admin/dominio"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <Globe2 size={15} />

              Gerenciar domínio
            </Link>
          </section>

          {/* ATALHOS */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-950">
              Atalhos
            </h2>

            <div className="mt-4 grid gap-2">
              <SettingsLink
                href="/admin/site"
                icon={Palette}
                title="Site"
                description="Aparência e conteúdo"
              />

              <SettingsLink
                href="/admin/formulario"
                icon={Mail}
                title="Formulário"
                description="Pedido de orçamento"
              />

              <SettingsLink
                href="/admin/dominio"
                icon={Globe2}
                title="Domínio"
                description="Endereços públicos"
              />

              <SettingsLink
                href="/admin/analytics"
                icon={Activity}
                title="Analytics"
                description="Métricas e conversões"
              />
            </div>
          </section>

          {/* SEGURANÇA */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={18}
                className="text-emerald-600"
              />

              <h2 className="font-semibold text-slate-950">
                Segurança
              </h2>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Sua sessão administrativa utiliza a autenticação do Supabase e o acesso é limitado ao tenant ao qual sua conta pertence.
            </p>

            <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">
                Papel atual
              </p>

              <strong className="mt-1 block text-sm text-slate-800">
                {role}
              </strong>
            </div>
          </section>

          {/* SESSÃO */}
          <section className="rounded-2xl border border-red-100 bg-white p-5">
            <h2 className="font-semibold text-slate-950">
              Sessão
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Encerre o acesso administrativo neste navegador.
            </p>

            <form
              action={
                signOutAction
              }
            >
              <button
                type="submit"
                className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <LogOut
                  size={16}
                />

                Sair da conta
              </button>
            </form>
          </section>
        </aside>
      </div>
    </>
  );
}

function SummaryCard({
  icon: Icon,
  title,
  value,
  description,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
          <Icon size={17} />
        </div>

        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>
      </div>

      <strong className="mt-4 block truncate text-lg text-slate-950">
        {value}
      </strong>

      <p className="mt-1 truncate text-xs text-slate-500">
        {description}
      </p>
    </article>
  );
}

function InfoItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 break-all text-sm font-medium text-slate-700 ${
          mono
            ? "font-mono text-xs"
            : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function IntegrationCard({
  name,
  description,
  configured,
  icon: Icon,
}: IntegrationStatus) {
  return (
    <article className="flex items-center gap-4 rounded-xl border border-slate-200 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-800">
            {name}
          </h3>

          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${
              configured
                ? "bg-emerald-50 text-emerald-700 ring-emerald-600/10"
                : "bg-red-50 text-red-700 ring-red-600/10"
            }`}
          >
            {configured
              ? "Configurado"
              : "Não configurado"}
          </span>
        </div>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </article>
  );
}

function SettingsLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-slate-200 hover:bg-slate-50"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:text-blue-600">
        <Icon size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-700">
          {title}
        </p>

        <p className="text-xs text-slate-400">
          {description}
        </p>
      </div>

      <ExternalLink
        size={14}
        className="shrink-0 text-slate-300"
      />
    </Link>
  );
}