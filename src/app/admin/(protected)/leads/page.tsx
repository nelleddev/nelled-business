import {
  Archive,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MessageCircle,
  Search,
  Trash2,
  UserRoundCheck,
} from "lucide-react";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { FormMessage } from "@/components/admin/form-message";
import { getCurrentTenant } from "@/lib/auth/get-current-tenant";
import { createClient } from "@/lib/supabase/server";

import {
  deleteLead,
  updateLeadStatus,
} from "./actions";

type LeadStatus =
  | "new"
  | "contacted"
  | "converted"
  | "archived";

type LeadService = {
  name: string;
} | null;

type Lead = {
  id: string;
  name: string;
  whatsapp: string;
  location: string | null;
  message: string | null;
  status: LeadStatus;
  created_at: string;

  services:
    | LeadService
    | LeadService[];
};

type LeadsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
    success?: string;
    error?: string;
  }>;
};

const PAGE_SIZE = 15;

const STATUS_OPTIONS: {
  value: LeadStatus;
  label: string;
}[] = [
  {
    value: "new",
    label: "Novo",
  },
  {
    value: "contacted",
    label: "Contatado",
  },
  {
    value: "converted",
    label: "Convertido",
  },
  {
    value: "archived",
    label: "Arquivado",
  },
];

const statusConfig: Record<
  LeadStatus,
  {
    label: string;
    className: string;
  }
> = {
  new: {
    label: "Novo",
    className:
      "bg-blue-50 text-blue-700 ring-blue-600/10",
  },

  contacted: {
    label: "Contatado",
    className:
      "bg-amber-50 text-amber-700 ring-amber-600/10",
  },

  converted: {
    label: "Convertido",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  },

  archived: {
    label: "Arquivado",
    className:
      "bg-slate-100 text-slate-600 ring-slate-500/10",
  },
};

function getServiceName(
  services: Lead["services"],
) {
  if (Array.isArray(services)) {
    return (
      services[0]?.name ??
      "Outro"
    );
  }

  return (
    services?.name ??
    "Outro"
  );
}

function normalize(
  value: string | null | undefined,
) {
  return (
    value
      ?.normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
      .toLowerCase()
      .trim() ?? ""
  );
}

function formatDate(
  value: string,
) {
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

function formatWhatsapp(
  value: string,
) {
  const digits =
    value.replace(
      /\D/g,
      "",
    );

  if (
    digits.startsWith("55") &&
    digits.length >= 12
  ) {
    const ddd =
      digits.slice(2, 4);

    const number =
      digits.slice(4);

    if (number.length === 9) {
      return `(${ddd}) ${number.slice(
        0,
        5,
      )}-${number.slice(5)}`;
    }

    if (number.length === 8) {
      return `(${ddd}) ${number.slice(
        0,
        4,
      )}-${number.slice(4)}`;
    }
  }

  return value;
}

function getWhatsappUrl(
  lead: Lead,
) {
  const phone =
    lead.whatsapp.replace(
      /\D/g,
      "",
    );

  const message =
    `Olá, ${lead.name}! Recebemos seu pedido de orçamento pelo nosso site e estamos entrando em contato para dar continuidade ao atendimento.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(
    message,
  )}`;
}

export default async function LeadsPage({
  searchParams,
}: LeadsPageProps) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    return null;
  }

  const params =
    await searchParams;

  const search =
    params.q?.trim() ?? "";

  const selectedStatus =
    STATUS_OPTIONS.some(
      (option) =>
        option.value ===
        params.status,
    )
      ? (params.status as LeadStatus)
      : "";

  const requestedPage =
    Number.parseInt(
      params.page ?? "1",
      10,
    );

  const currentPage =
    Number.isFinite(
      requestedPage,
    ) &&
    requestedPage > 0
      ? requestedPage
      : 1;

  const supabase =
    await createClient();

  const {
    data,
    error: queryError,
  } = await supabase
    .from("leads")
    .select(
      `
        id,
        name,
        whatsapp,
        location,
        message,
        status,
        created_at,
        services (
          name
        )
      `,
    )
    .eq(
      "tenant_id",
      currentTenant.tenant.id,
    )
    .order("created_at", {
      ascending: false,
    });

  const leads =
    (data ?? []) as Lead[];

  const totals = {
    all: leads.length,

    new: leads.filter(
      (lead) =>
        lead.status === "new",
    ).length,

    contacted: leads.filter(
      (lead) =>
        lead.status ===
        "contacted",
    ).length,

    converted: leads.filter(
      (lead) =>
        lead.status ===
        "converted",
    ).length,

    archived: leads.filter(
      (lead) =>
        lead.status ===
        "archived",
    ).length,
  };

  const normalizedSearch =
    normalize(search);

  const filteredLeads =
    leads.filter(
      (lead) => {
        if (
          selectedStatus &&
          lead.status !==
            selectedStatus
        ) {
          return false;
        }

        if (
          !normalizedSearch
        ) {
          return true;
        }

        const searchable =
          [
            lead.name,
            lead.whatsapp,
            lead.location,
            lead.message,
            getServiceName(
              lead.services,
            ),
          ]
            .map(normalize)
            .join(" ");

        return searchable.includes(
          normalizedSearch,
        );
      },
    );

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredLeads.length /
          PAGE_SIZE,
      ),
    );

  const safePage =
    Math.min(
      currentPage,
      totalPages,
    );

  const start =
    (safePage - 1) *
    PAGE_SIZE;

  const visibleLeads =
    filteredLeads.slice(
      start,
      start + PAGE_SIZE,
    );

  function pageHref(
    page: number,
  ) {
    const query =
      new URLSearchParams();

    if (search) {
      query.set(
        "q",
        search,
      );
    }

    if (selectedStatus) {
      query.set(
        "status",
        selectedStatus,
      );
    }

    query.set(
      "page",
      String(page),
    );

    return `/admin/leads?${query.toString()}`;
  }

  return (
    <>
      <AdminPageHeader
        title="Leads"
        description="Acompanhe e gerencie os pedidos de orçamento recebidos pelo site."
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
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Novos"
          value={totals.new}
          description="aguardando atendimento"
          icon={Clock3}
          iconClass="bg-blue-50 text-blue-600"
        />

        <SummaryCard
          title="Contatados"
          value={
            totals.contacted
          }
          description="em atendimento"
          icon={MessageCircle}
          iconClass="bg-amber-50 text-amber-600"
        />

        <SummaryCard
          title="Convertidos"
          value={
            totals.converted
          }
          description="negócios conquistados"
          icon={UserRoundCheck}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <SummaryCard
          title="Arquivados"
          value={
            totals.archived
          }
          description="leads encerrados"
          icon={Archive}
          iconClass="bg-slate-100 text-slate-600"
        />
      </div>

      {/* FILTROS */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
        <form
          method="GET"
          className="flex flex-col gap-3 lg:flex-row lg:items-end"
        >
          <label className="min-w-0 flex-1">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Buscar
            </span>

            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                name="q"
                defaultValue={
                  search
                }
                placeholder="Nome, WhatsApp, cidade, serviço ou mensagem..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>
          </label>

          <label className="lg:w-52">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Status
            </span>

            <select
              name="status"
              defaultValue={
                selectedStatus
              }
              className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            >
              <option value="">
                Todos
              </option>

              {STATUS_OPTIONS.map(
                (option) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {
                      option.label
                    }
                  </option>
                ),
              )}
            </select>
          </label>

          <button
            type="submit"
            className="cursor-pointer rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Filtrar
          </button>

          {(search ||
            selectedStatus) && (
            <Link
              href="/admin/leads"
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-center text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Limpar
            </Link>
          )}
        </form>
      </section>

      {/* RESULTADOS */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-500">
          <strong className="text-slate-800">
            {
              filteredLeads.length
            }
          </strong>{" "}
          {filteredLeads.length ===
          1
            ? "lead encontrado"
            : "leads encontrados"}
        </p>

        {totals.all > 0 && (
          <p className="text-xs text-slate-400">
            {totals.all} no total
          </p>
        )}
      </div>

      {/* DESKTOP */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-4 font-semibold text-slate-700">
                  Cliente
                </th>

                <th className="px-5 py-4 font-semibold text-slate-700">
                  Serviço
                </th>

                <th className="px-5 py-4 font-semibold text-slate-700">
                  Mensagem
                </th>

                <th className="px-5 py-4 font-semibold text-slate-700">
                  Recebido
                </th>

                <th className="px-5 py-4 font-semibold text-slate-700">
                  Status
                </th>

                <th className="px-5 py-4 text-right font-semibold text-slate-700">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {visibleLeads.map(
                (lead) => (
                  <DesktopLeadRow
                    key={lead.id}
                    lead={lead}
                  />
                ),
              )}
            </tbody>
          </table>
        </div>

        {visibleLeads.length ===
          0 && (
          <EmptyState />
        )}
      </div>

      {/* MOBILE / TABLET */}
      <div className="grid gap-4 lg:hidden">
        {visibleLeads.map(
          (lead) => (
            <MobileLeadCard
              key={lead.id}
              lead={lead}
            />
          ),
        )}

        {visibleLeads.length ===
          0 && (
          <EmptyState />
        )}
      </div>

      {/* PAGINAÇÃO */}
      {filteredLeads.length >
        0 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 sm:flex-row">
          <p className="text-sm text-slate-500">
            Mostrando{" "}
            <strong className="text-slate-800">
              {start + 1}
            </strong>
            {" – "}
            <strong className="text-slate-800">
              {Math.min(
                start +
                  PAGE_SIZE,
                filteredLeads.length,
              )}
            </strong>
            {" de "}
            <strong className="text-slate-800">
              {
                filteredLeads.length
              }
            </strong>
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              {safePage > 1 ? (
                <Link
                  href={pageHref(
                    safePage - 1,
                  )}
                  aria-label="Página anterior"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                >
                  <ChevronLeft
                    size={17}
                  />
                </Link>
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-300">
                  <ChevronLeft
                    size={17}
                  />
                </span>
              )}

              <span className="px-2 text-sm font-medium text-slate-600">
                Página{" "}
                {safePage} de{" "}
                {totalPages}
              </span>

              {safePage <
              totalPages ? (
                <Link
                  href={pageHref(
                    safePage + 1,
                  )}
                  aria-label="Próxima página"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                >
                  <ChevronRight
                    size={17}
                  />
                </Link>
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-300">
                  <ChevronRight
                    size={17}
                  />
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function DesktopLeadRow({
  lead,
}: {
  lead: Lead;
}) {
  const status =
    statusConfig[lead.status];

  return (
    <tr className="border-t border-slate-100 align-top transition hover:bg-slate-50/60">
      <td className="px-5 py-5">
        <strong className="block font-semibold text-slate-950">
          {lead.name}
        </strong>

        <a
          href={getWhatsappUrl(
            lead,
          )}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-1.5 text-sm text-emerald-600 transition hover:text-emerald-500"
        >
          <FaWhatsapp />

          {formatWhatsapp(
            lead.whatsapp,
          )}
        </a>

        <p className="mt-1 text-xs text-slate-400">
          {lead.location ??
            "Local não informado"}
        </p>
      </td>

      <td className="px-5 py-5 font-medium text-slate-700">
        {getServiceName(
          lead.services,
        )}
      </td>

      <td className="max-w-sm px-5 py-5">
        <p
          title={
            lead.message ??
            undefined
          }
          className="line-clamp-3 leading-6 text-slate-500"
        >
          {lead.message ??
            "Sem mensagem"}
        </p>
      </td>

      <td className="whitespace-nowrap px-5 py-5 text-xs leading-5 text-slate-500">
        {formatDate(
          lead.created_at,
        )}
      </td>

      <td className="px-5 py-5">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${status.className}`}
        >
          {status.label}
        </span>
      </td>

      <td className="px-5 py-5">
        <div className="flex items-center justify-end gap-2">
          <a
            href={getWhatsappUrl(
              lead,
            )}
            target="_blank"
            rel="noreferrer"
            title="Falar no WhatsApp"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"
          >
            <FaWhatsapp />
          </a>

          <StatusForm
            lead={lead}
          />

          <DeleteForm
            id={lead.id}
          />
        </div>
      </td>
    </tr>
  );
}

function MobileLeadCard({
  lead,
}: {
  lead: Lead;
}) {
  const status =
    statusConfig[lead.status];

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate font-semibold text-slate-950">
            {lead.name}
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {formatDate(
              lead.created_at,
            )}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <div className="mt-4 grid gap-3 text-sm">
        <div>
          <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
            WhatsApp
          </span>

          <a
            href={getWhatsappUrl(
              lead,
            )}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-2 font-medium text-emerald-600"
          >
            <FaWhatsapp />

            {formatWhatsapp(
              lead.whatsapp,
            )}
          </a>
        </div>

        <Info
          label="Local"
          value={
            lead.location ??
            "Não informado"
          }
        />

        <Info
          label="Serviço"
          value={getServiceName(
            lead.services,
          )}
        />

        <Info
          label="Mensagem"
          value={
            lead.message ??
            "Sem mensagem"
          }
        />
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <StatusForm
          lead={lead}
          fullWidth
        />

        <div className="mt-3 flex gap-2">
          <a
            href={getWhatsappUrl(
              lead,
            )}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            <FaWhatsapp />

            WhatsApp
          </a>

          <DeleteForm
            id={lead.id}
          />
        </div>
      </div>
    </article>
  );
}

function StatusForm({
  lead,
  fullWidth = false,
}: {
  lead: Lead;
  fullWidth?: boolean;
}) {
  return (
    <form
      action={
        updateLeadStatus
      }
      className={`flex items-center gap-2 ${
        fullWidth
          ? "w-full"
          : ""
      }`}
    >
      <input
        type="hidden"
        name="id"
        value={lead.id}
      />

      <select
        name="status"
        defaultValue={
          lead.status
        }
        aria-label={`Status do lead ${lead.name}`}
        className={`cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700 outline-none transition focus:border-blue-500 ${
          fullWidth
            ? "min-w-0 flex-1"
            : ""
        }`}
      >
        {STATUS_OPTIONS.map(
          (option) => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {option.label}
            </option>
          ),
        )}
      </select>

      <button
        type="submit"
        title="Salvar status"
        className="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-slate-700"
      >
        <CheckCircle2
          size={14}
        />

        Salvar
      </button>
    </form>
  );
}

function DeleteForm({
  id,
}: {
  id: string;
}) {
  return (
    <form action={deleteLead}>
      <input
        type="hidden"
        name="id"
        value={id}
      />

      <button
        type="submit"
        title="Excluir lead"
        aria-label="Excluir lead"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-50"
      >
        <Trash2 size={15} />
      </button>
    </form>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </span>

      <p className="mt-1 leading-6 text-slate-600">
        {value}
      </p>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
}: {
  title: string;
  value: number;
  description: string;
  icon: typeof Clock3;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <div
          className={`rounded-xl p-2 ${iconClass}`}
        >
          <Icon size={18} />
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center px-6 py-12 text-center">
      <Search
        size={28}
        className="text-slate-300"
      />

      <p className="mt-4 font-semibold text-slate-700">
        Nenhum lead encontrado
      </p>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        Quando novos pedidos de orçamento chegarem pelo site, eles aparecerão aqui.
      </p>
    </div>
  );
}