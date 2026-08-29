import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  ExternalLink,
  Globe2,
  Info,
  Link2,
  Server,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DomainCopyButton } from "@/components/admin/domain-copy-button";
import { FormMessage } from "@/components/admin/form-message";
import { getCurrentTenant } from "@/lib/auth/get-current-tenant";
import { createClient } from "@/lib/supabase/server";

import {
  addCustomDomain,
  removeCustomDomain,
} from "./actions";

export const dynamic =
  "force-dynamic";

type DomainPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

type DomainType =
  | "subdomain"
  | "custom";

type DomainStatus =
  | "pending"
  | "verified"
  | "failed";

type TenantDomain = {
  id: string;
  domain: string;
  type: DomainType;
  status: DomainStatus;
  is_primary: boolean;
  verified_at: string | null;
  created_at: string;
};

const statusConfig: Record<
  DomainStatus,
  {
    label: string;
    description: string;
    className: string;
    icon: typeof CheckCircle2;
  }
> = {
  verified: {
    label: "Ativo",
    description:
      "Domínio validado e pronto para uso.",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
    icon: CheckCircle2,
  },

  pending: {
    label: "Pendente",
    description:
      "Aguardando configuração ou validação do DNS.",
    className:
      "bg-amber-50 text-amber-700 ring-amber-600/10",
    icon: CircleDashed,
  },

  failed: {
    label: "Erro",
    description:
      "Não foi possível validar a configuração do domínio.",
    className:
      "bg-red-50 text-red-700 ring-red-600/10",
    icon: XCircle,
  },
};

function formatDate(
  value: string | null,
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

export default async function DomainPage({
  searchParams,
}: DomainPageProps) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    return null;
  }

  const params =
    await searchParams;

  const supabase =
    await createClient();

  const {
    data,
    error: queryError,
  } = await supabase
    .from("tenant_domains")
    .select(
      `
        id,
        domain,
        type,
        status,
        is_primary,
        verified_at,
        created_at
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
    )
    .order(
      "created_at",
      {
        ascending: true,
      },
    );

  const domains =
    (data ??
      []) as TenantDomain[];

  const isOwner =
    currentTenant.membership
      .role === "owner";

  const nelledDomain =
    domains.find(
      (domain) =>
        domain.type ===
        "subdomain",
    ) ?? null;

  const customDomains =
    domains.filter(
      (domain) =>
        domain.type ===
        "custom",
    );

  const primaryDomain =
    domains.find(
      (domain) =>
        domain.is_primary,
    ) ??
    domains.find(
      (domain) =>
        domain.status ===
        "verified",
    ) ??
    nelledDomain ??
    null;

  return (
    <>
      <AdminPageHeader
        title="Domínio"
        description="Gerencie o endereço do site da empresa e acompanhe a configuração de domínios personalizados."
      />

      <FormMessage
        success={
          params.success
        }
        error={
          params.error ??
          queryError?.message
        }
      />

      {/* RESUMO */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={Globe2}
          title="Endereço principal"
          value={
            primaryDomain
              ?.domain ??
            "Não definido"
          }
          description={
            primaryDomain
              ? "Endereço utilizado como referência principal."
              : "Nenhum domínio cadastrado."
          }
        />

        <SummaryCard
          icon={ShieldCheck}
          title="Domínios ativos"
          value={String(
            domains.filter(
              (domain) =>
                domain.status ===
                "verified",
            ).length,
          )}
          description="Endereços já validados."
        />

        <SummaryCard
          icon={Link2}
          title="Personalizados"
          value={String(
            customDomains.length,
          )}
          description="Domínios próprios cadastrados."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_380px]">
        <div className="space-y-6">
          {/* ENDEREÇO NELLED */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                    <Server size={18} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-950">
                      Endereço Nelled
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Subdomínio fornecido automaticamente pela plataforma.
                    </p>
                  </div>
                </div>
              </div>

              {nelledDomain && (
                <DomainStatusBadge
                  status={
                    nelledDomain.status
                  }
                />
              )}
            </div>

            {nelledDomain ? (
              <div className="mt-6">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    URL pública
                  </p>

                  <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <code className="min-w-0 break-all text-sm font-semibold text-slate-800">
                      https://
                      {
                        nelledDomain.domain
                      }
                    </code>

                    <div className="flex shrink-0 gap-2">
                      <DomainCopyButton
                        value={`https://${nelledDomain.domain}`}
                      />

                      <a
                        href={`https://${nelledDomain.domain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                      >
                        <ExternalLink
                          size={14}
                        />

                        Abrir
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <InfoItem
                    label="Tipo"
                    value="Subdomínio Nelled"
                  />

                  <InfoItem
                    label="Principal"
                    value={
                      nelledDomain.is_primary
                        ? "Sim"
                        : "Não"
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                <Globe2
                  size={26}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 font-medium text-slate-700">
                  Endereço Nelled não encontrado
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  O subdomínio padrão ainda não está cadastrado para este tenant.
                </p>
              </div>
            )}
          </section>

          {/* DOMÍNIOS PERSONALIZADOS */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div>
              <h2 className="font-semibold text-slate-950">
                Domínios personalizados
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Use um domínio próprio, como{" "}
                <strong>
                  minhaempresa.com.br
                </strong>
                , mantendo o mesmo site e painel administrativo.
              </p>
            </div>

            {customDomains.length ===
            0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
                <Link2
                  size={25}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 font-medium text-slate-700">
                  Nenhum domínio próprio cadastrado
                </p>

                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                  Você pode continuar utilizando normalmente o endereço Nelled ou conectar um domínio próprio.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {customDomains.map(
                  (domain) => (
                    <DomainCard
                      key={
                        domain.id
                      }
                      domain={
                        domain
                      }
                      isOwner={
                        isOwner
                      }
                    />
                  ),
                )}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          {/* CADASTRAR */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-950">
              Conectar domínio
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Informe apenas o domínio, sem{" "}
              <code>https://</code>{" "}
              ou caminhos.
            </p>

            {isOwner ? (
              <form
                action={
                  addCustomDomain
                }
                className="mt-5"
              >
                <label className="block text-sm font-medium text-slate-700">
                  Domínio

                  <input
                    type="text"
                    name="domain"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="minhaempresa.com.br"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </label>

                <button
                  type="submit"
                  className="mt-4 w-full cursor-pointer rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  Adicionar domínio
                </button>
              </form>
            ) : (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0 text-amber-600"
                  />

                  <p className="text-sm leading-6 text-amber-800">
                    Somente o proprietário da conta pode adicionar ou remover domínios.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* CONFIGURAÇÃO DNS */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <Info
                size={18}
                className="text-blue-600"
              />

              <h2 className="font-semibold text-slate-950">
                Configuração DNS
              </h2>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Depois de adicionar um domínio, será necessário configurar o DNS no provedor onde ele foi comprado.
            </p>

            <div className="mt-5 space-y-4">
              <Step
                number="1"
                title="Adicione o domínio"
                description="Cadastre o endereço que será utilizado pela empresa."
              />

              <Step
                number="2"
                title="Configure o DNS"
                description="A Nelled fornecerá o registro necessário conforme a infraestrutura utilizada."
              />

              <Step
                number="3"
                title="Aguarde a validação"
                description="O domínio permanecerá como Pendente até a configuração ser confirmada."
              />

              <Step
                number="4"
                title="Domínio ativo"
                description="Após validado, o endereço poderá ser utilizado normalmente."
              />
            </div>
          </section>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex gap-3">
              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-blue-600"
              />

              <div>
                <h3 className="text-sm font-semibold text-blue-950">
                  Configuração segura
                </h3>

                <p className="mt-1 text-xs leading-5 text-blue-800">
                  A validação do domínio não é simulada no painel. O status só deve mudar para Ativo depois que o DNS e a infraestrutura realmente estiverem configurados.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function DomainCard({
  domain,
  isOwner,
}: {
  domain: TenantDomain;
  isOwner: boolean;
}) {
  const config =
    statusConfig[
      domain.status
    ];

  return (
    <article className="rounded-xl border border-slate-200 p-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-all font-semibold text-slate-950">
              {domain.domain}
            </h3>

            {domain.is_primary && (
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/10">
                Principal
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-slate-500">
            {config.description}
          </p>
        </div>

        <DomainStatusBadge
          status={domain.status}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <InfoItem
          label="Adicionado"
          value={formatDate(
            domain.created_at,
          )}
        />

        <InfoItem
          label="Validado"
          value={formatDate(
            domain.verified_at,
          )}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <DomainCopyButton
          value={`https://${domain.domain}`}
        />

        {domain.status ===
          "verified" && (
          <a
            href={`https://${domain.domain}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <ExternalLink
              size={14}
            />

            Abrir
          </a>
        )}

        {isOwner &&
          !domain.is_primary && (
            <form
              action={
                removeCustomDomain
              }
              className="sm:ml-auto"
            >
              <input
                type="hidden"
                name="id"
                value={domain.id}
              />

              <button
                type="submit"
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
              >
                <Trash2
                  size={14}
                />

                Remover
              </button>
            </form>
          )}
      </div>
    </article>
  );
}

function DomainStatusBadge({
  status,
}: {
  status: DomainStatus;
}) {
  const config =
    statusConfig[status];

  const Icon =
    config.icon;

  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${config.className}`}
    >
      <Icon size={13} />

      {config.label}
    </span>
  );
}

function SummaryCard({
  icon: Icon,
  title,
  value,
  description,
}: {
  icon: typeof Globe2;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
          <Icon size={18} />
        </div>

        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>
      </div>

      <strong className="mt-4 block break-all text-lg text-slate-950">
        {value}
      </strong>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </article>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
        {number}
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-0.5 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}