import type {
  LucideIcon,
} from "lucide-react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Eye,
  EyeOff,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getCurrentTenant } from "@/lib/auth/get-current-tenant";
import { createClient } from "@/lib/supabase/server";

import {
  deleteFaq,
  moveFaq,
  saveFaq,
  toggleFaq,
} from "./actions";

export const dynamic =
  "force-dynamic";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  position: number;
  is_active: boolean;
};

type FaqPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
};

const PAGE_SIZE = 20;

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

function sanitizeSearch(
  value: string,
) {
  return value
    .replace(
      /[,%()]/g,
      " ",
    )
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}

export default async function FaqPage({
  searchParams,
}: FaqPageProps) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    return null;
  }

  const params =
    await searchParams;

  const search =
    sanitizeSearch(
      params.q ?? "",
    );

  const selectedStatus =
    params.status ===
      "active" ||
    params.status ===
      "inactive"
      ? params.status
      : "";

  const parsedPage =
    Number.parseInt(
      params.page ?? "1",
      10,
    );

  const requestedPage =
    Number.isFinite(
      parsedPage,
    ) &&
    parsedPage > 0
      ? parsedPage
      : 1;

  const tenantId =
    currentTenant.tenant.id;

  const supabase =
    await createClient();

  /*
   * RESUMO E LIMITES DE ORDEM
   */
  const [
    totalResult,
    activeResult,
    inactiveResult,
    firstResult,
    lastResult,
  ] = await Promise.all([
    supabase
      .from("faq_items")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "tenant_id",
        tenantId,
      ),

    supabase
      .from("faq_items")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "tenant_id",
        tenantId,
      )
      .eq(
        "is_active",
        true,
      ),

    supabase
      .from("faq_items")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "tenant_id",
        tenantId,
      )
      .eq(
        "is_active",
        false,
      ),

    supabase
      .from("faq_items")
      .select("position")
      .eq(
        "tenant_id",
        tenantId,
      )
      .order("position", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle(),

    supabase
      .from("faq_items")
      .select("position")
      .eq(
        "tenant_id",
        tenantId,
      )
      .order("position", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle(),
  ]);

  const totalCount =
    totalResult.count ?? 0;

  const activeCount =
    activeResult.count ?? 0;

  const inactiveCount =
    inactiveResult.count ??
    0;

  const firstPosition =
    firstResult.data
      ?.position ?? null;

  const lastPosition =
    lastResult.data
      ?.position ?? null;

  /*
   * CONTAGEM COM FILTROS
   */
  let countQuery =
    supabase
      .from("faq_items")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "tenant_id",
        tenantId,
      );

  if (
    selectedStatus ===
    "active"
  ) {
    countQuery =
      countQuery.eq(
        "is_active",
        true,
      );
  }

  if (
    selectedStatus ===
    "inactive"
  ) {
    countQuery =
      countQuery.eq(
        "is_active",
        false,
      );
  }

  if (search) {
    countQuery =
      countQuery.or(
        [
          `question.ilike.%${search}%`,
          `answer.ilike.%${search}%`,
        ].join(","),
      );
  }

  const {
    count: filteredCount,
    error: countError,
  } = await countQuery;

  const totalFiltered =
    filteredCount ?? 0;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalFiltered /
          PAGE_SIZE,
      ),
    );

  const currentPage =
    Math.min(
      requestedPage,
      totalPages,
    );

  const from =
    (currentPage - 1) *
    PAGE_SIZE;

  const to =
    from +
    PAGE_SIZE -
    1;

  /*
   * SOMENTE A PÁGINA ATUAL
   */
  let faqQuery =
    supabase
      .from("faq_items")
      .select(
        `
          id,
          question,
          answer,
          position,
          is_active
        `,
      )
      .eq(
        "tenant_id",
        tenantId,
      );

  if (
    selectedStatus ===
    "active"
  ) {
    faqQuery =
      faqQuery.eq(
        "is_active",
        true,
      );
  }

  if (
    selectedStatus ===
    "inactive"
  ) {
    faqQuery =
      faqQuery.eq(
        "is_active",
        false,
      );
  }

  if (search) {
    faqQuery =
      faqQuery.or(
        [
          `question.ilike.%${search}%`,
          `answer.ilike.%${search}%`,
        ].join(","),
      );
  }

  const {
    data,
    error: faqError,
  } = await faqQuery
    .order("position", {
      ascending: true,
    })
    .range(from, to);

  const faqItems =
    (data ?? []) as FaqItem[];

  const hasFilters =
    Boolean(
      search ||
        selectedStatus,
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

    return `/admin/faq?${query.toString()}`;
  }

  const startResult =
    totalFiltered > 0
      ? from + 1
      : 0;

  const endResult =
    Math.min(
      from +
        faqItems.length,
      totalFiltered,
    );

  return (
    <>
      <AdminPageHeader
        title="Perguntas frequentes"
        description="Cadastre, organize e controle as dúvidas exibidas no site."
      />

      {/* RESUMO */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Total"
          value={totalCount}
          description="perguntas cadastradas"
          icon={CircleHelp}
          iconClass="bg-blue-50 text-blue-600"
        />

        <SummaryCard
          title="Ativas"
          value={activeCount}
          description="visíveis no site"
          icon={Eye}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <SummaryCard
          title="Inativas"
          value={inactiveCount}
          description="ocultas do site"
          icon={EyeOff}
          iconClass="bg-slate-100 text-slate-600"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        {/* NOVA PERGUNTA */}
        <form
          action={saveFaq}
          className="self-start rounded-2xl border border-slate-200 bg-white p-5 xl:sticky xl:top-24"
        >
          <h2 className="font-semibold text-slate-950">
            Nova pergunta
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Adicione uma dúvida comum dos seus clientes.
          </p>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Pergunta
              </span>

              <input
                name="question"
                required
                placeholder="Ex.: O orçamento tem algum custo?"
                className={
                  inputClass
                }
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Resposta
              </span>

              <textarea
                name="answer"
                required
                rows={5}
                placeholder="Digite a resposta..."
                className={
                  inputClass
                }
              />
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked
                className="h-4 w-4 rounded border-slate-300"
              />

              Publicar no site
            </label>

            <button
              type="submit"
              className="w-full cursor-pointer rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Adicionar pergunta
            </button>
          </div>
        </form>

        {/* COLUNA DIREITA */}
        <div className="min-w-0">
          {/* FILTROS */}
          <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4">
            <form
              method="GET"
              className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_180px_auto_auto]"
            >
              <label>
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
                    placeholder="Pergunta ou resposta..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
              </label>

              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Status
                </span>

                <select
                  name="status"
                  defaultValue={
                    selectedStatus
                  }
                  className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                >
                  <option value="">
                    Todas
                  </option>

                  <option value="active">
                    Ativas
                  </option>

                  <option value="inactive">
                    Inativas
                  </option>
                </select>
              </label>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full cursor-pointer rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 lg:w-auto"
                >
                  Filtrar
                </button>
              </div>

              {hasFilters && (
                <div className="flex items-end">
                  <Link
                    href="/admin/faq"
                    className="w-full rounded-xl border border-slate-200 px-5 py-2.5 text-center text-sm font-semibold text-slate-600 transition hover:bg-slate-50 lg:w-auto"
                  >
                    Limpar
                  </Link>
                </div>
              )}
            </form>
          </section>

          {/* CABEÇALHO LISTA */}
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-950">
                Perguntas cadastradas
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                A ordem abaixo também define a ordem exibida no site.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {totalFiltered}
            </span>
          </div>

          {(countError ||
            faqError) && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {countError?.message ??
                faqError?.message}
            </div>
          )}

          {/* LISTA */}
          {faqItems.length === 0 ? (
            <Empty
              hasFilters={
                hasFilters
              }
            />
          ) : (
            <div className="space-y-3">
              {faqItems.map(
                (item) => (
                  <FaqCard
                    key={item.id}
                    item={item}
                    isFirst={
                      firstPosition !==
                        null &&
                      item.position ===
                        firstPosition
                    }
                    isLast={
                      lastPosition !==
                        null &&
                      item.position ===
                        lastPosition
                    }
                  />
                ),
              )}
            </div>
          )}

          {/* PAGINAÇÃO */}
          {totalFiltered > 0 && (
            <div className="mt-5 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 sm:flex-row">
              <p className="text-sm text-slate-500">
                Mostrando{" "}
                <strong className="text-slate-800">
                  {startResult}
                </strong>
                {" – "}
                <strong className="text-slate-800">
                  {endResult}
                </strong>
                {" de "}
                <strong className="text-slate-800">
                  {totalFiltered}
                </strong>
              </p>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  {currentPage >
                  1 ? (
                    <Link
                      href={pageHref(
                        currentPage -
                          1,
                      )}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                      aria-label="Página anterior"
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
                    {currentPage} de{" "}
                    {totalPages}
                  </span>

                  {currentPage <
                  totalPages ? (
                    <Link
                      href={pageHref(
                        currentPage +
                          1,
                      )}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                      aria-label="Próxima página"
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
        </div>
      </div>
    </>
  );
}

function FaqCard({
  item,
  isFirst,
  isLast,
}: {
  item: FaqItem;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* VISUALIZAÇÃO COMPACTA */}
      <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 gap-3">
          <div className="hidden shrink-0 flex-col gap-1 sm:flex">
            <MoveButton
              id={item.id}
              direction="up"
              disabled={isFirst}
            />

            <MoveButton
              id={item.id}
              direction="down"
              disabled={isLast}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-[10px] font-semibold text-slate-500">
                #{item.position + 1}
              </span>

              <StatusBadge
                active={
                  item.is_active
                }
              />
            </div>

            <h3 className="mt-2 font-semibold leading-6 text-slate-950">
              {item.question}
            </h3>

            <p className="mt-1 line-clamp-2 max-w-4xl text-sm leading-6 text-slate-500">
              {item.answer}
            </p>
          </div>
        </div>

        {/* AÇÕES RÁPIDAS */}
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <div className="flex gap-1 sm:hidden">
            <MoveButton
              id={item.id}
              direction="up"
              disabled={isFirst}
            />

            <MoveButton
              id={item.id}
              direction="down"
              disabled={isLast}
            />
          </div>

          <form action={toggleFaq}>
            <input
              type="hidden"
              name="id"
              value={item.id}
            />

            <input
              type="hidden"
              name="is_active"
              value={String(
                item.is_active,
              )}
            />

            <button
              type="submit"
              title={
                item.is_active
                  ? "Ocultar do site"
                  : "Publicar no site"
              }
              className={`inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition ${
                item.is_active
                  ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              {item.is_active ? (
                <>
                  <EyeOff
                    size={14}
                  />

                  Ocultar
                </>
              ) : (
                <>
                  <Eye
                    size={14}
                  />

                  Publicar
                </>
              )}
            </button>
          </form>

          <form action={deleteFaq}>
            <input
              type="hidden"
              name="id"
              value={item.id}
            />

            <button
              type="submit"
              title="Excluir pergunta"
              aria-label="Excluir pergunta"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-50"
            >
              <Trash2
                size={15}
              />
            </button>
          </form>
        </div>
      </div>

      {/* EDIÇÃO EXPANSÍVEL */}
      <details className="group border-t border-slate-100">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 sm:px-5">
          <span className="flex items-center gap-2">
            <Pencil
              size={14}
            />

            Editar pergunta
          </span>

          <ChevronDown
            size={16}
            className="transition-transform group-open:rotate-180"
          />
        </summary>

        <form
          action={saveFaq}
          className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5"
        >
          <input
            type="hidden"
            name="id"
            value={item.id}
          />

          <div className="grid gap-4">
            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Pergunta
              </span>

              <input
                name="question"
                defaultValue={
                  item.question
                }
                required
                className={
                  inputClass
                }
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Resposta
              </span>

              <textarea
                name="answer"
                defaultValue={
                  item.answer
                }
                required
                rows={4}
                className={
                  inputClass
                }
              />
            </label>

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked={
                    item.is_active
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />

                Publicar no site
              </label>

              <button
                type="submit"
                className="cursor-pointer rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Salvar alterações
              </button>
            </div>
          </div>
        </form>
      </details>
    </article>
  );
}

function MoveButton({
  id,
  direction,
  disabled,
}: {
  id: string;
  direction:
    | "up"
    | "down";
  disabled: boolean;
}) {
  const Icon =
    direction === "up"
      ? ArrowUp
      : ArrowDown;

  return (
    <form action={moveFaq}>
      <input
        type="hidden"
        name="id"
        value={id}
      />

      <input
        type="hidden"
        name="direction"
        value={direction}
      />

      <button
        type="submit"
        disabled={disabled}
        title={
          direction === "up"
            ? "Mover para cima"
            : "Mover para baixo"
        }
        aria-label={
          direction === "up"
            ? "Mover para cima"
            : "Mover para baixo"
        }
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Icon size={14} />
      </button>
    </form>
  );
}

function StatusBadge({
  active,
}: {
  active: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${
        active
          ? "bg-emerald-50 text-emerald-700 ring-emerald-600/10"
          : "bg-slate-100 text-slate-600 ring-slate-500/10"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active
            ? "bg-emerald-500"
            : "bg-slate-400"
        }`}
      />

      {active
        ? "Ativa"
        : "Inativa"}
    </span>
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
  icon: LucideIcon;
  iconClass: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <div
          className={`rounded-xl p-2 ${iconClass}`}
        >
          <Icon size={17} />
        </div>
      </div>

      <strong className="mt-4 block text-3xl font-bold text-slate-950">
        {value}
      </strong>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </article>
  );
}

function Empty({
  hasFilters,
}: {
  hasFilters: boolean;
}) {
  return (
    <div className="flex min-h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
      <CircleHelp
        size={28}
        className="text-slate-300"
      />

      <p className="mt-4 font-semibold text-slate-700">
        {hasFilters
          ? "Nenhuma pergunta encontrada"
          : "Nenhuma pergunta cadastrada"}
      </p>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasFilters
          ? "Altere os filtros ou limpe a busca para visualizar outras perguntas."
          : "Cadastre a primeira pergunta frequente utilizando o formulário ao lado."}
      </p>
    </div>
  );
}