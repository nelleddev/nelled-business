import type {
  LucideIcon,
} from "lucide-react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Search,
  Star,
  StarOff,
  Trash2,
  XCircle,
} from "lucide-react";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getCurrentTenant } from "@/lib/auth/get-current-tenant";
import { createClient } from "@/lib/supabase/server";

import { reviewAction } from "./actions";

export const dynamic =
  "force-dynamic";

type ReviewStatus =
  | "pending"
  | "approved"
  | "rejected";

type Review = {
  id: string;
  customer_name: string;
  city: string | null;
  rating: number;
  comment: string;
  status: ReviewStatus;
  is_featured: boolean;
  created_at: string;
};

type ReviewsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    rating?: string;
    page?: string;
  }>;
};

type StatusConfig = {
  label: string;
  className: string;
};

const PAGE_SIZE = 15;

const STATUS_CONFIG: Record<
  ReviewStatus,
  StatusConfig
> = {
  pending: {
    label: "Pendente",
    className:
      "bg-amber-50 text-amber-700 ring-amber-600/10",
  },

  approved: {
    label: "Aprovada",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  },

  rejected: {
    label: "Rejeitada",
    className:
      "bg-red-50 text-red-700 ring-red-600/10",
  },
};

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

function normalizeSearch(
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

export default async function ReviewsPage({
  searchParams,
}: ReviewsPageProps) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    return null;
  }

  const params =
    await searchParams;

  const search =
    normalizeSearch(
      params.q ?? "",
    );

  const selectedStatus: ReviewStatus | "" =
    params.status ===
      "pending" ||
    params.status ===
      "approved" ||
    params.status ===
      "rejected"
      ? params.status
      : "";

  const parsedRating =
    Number.parseInt(
      params.rating ?? "",
      10,
    );

  const selectedRating =
    parsedRating >= 1 &&
    parsedRating <= 5
      ? parsedRating
      : null;

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
   * RESUMO
   */
  const [
    pendingResult,
    approvedResult,
    rejectedResult,
    featuredResult,
  ] = await Promise.all([
    supabase
      .from("reviews")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "tenant_id",
        tenantId,
      )
      .eq(
        "status",
        "pending",
      ),

    supabase
      .from("reviews")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "tenant_id",
        tenantId,
      )
      .eq(
        "status",
        "approved",
      ),

    supabase
      .from("reviews")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "tenant_id",
        tenantId,
      )
      .eq(
        "status",
        "rejected",
      ),

    supabase
      .from("reviews")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "tenant_id",
        tenantId,
      )
      .eq(
        "is_featured",
        true,
      ),
  ]);

  const pendingCount =
    pendingResult.count ?? 0;

  const approvedCount =
    approvedResult.count ?? 0;

  const rejectedCount =
    rejectedResult.count ?? 0;

  const featuredCount =
    featuredResult.count ?? 0;

  /*
   * PRIMEIRO DESCOBRIMOS QUANTOS
   * RESULTADOS EXISTEM COM OS FILTROS.
   */
  let countQuery =
    supabase
      .from("reviews")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "tenant_id",
        tenantId,
      );

  if (selectedStatus) {
    countQuery =
      countQuery.eq(
        "status",
        selectedStatus,
      );
  }

  if (selectedRating) {
    countQuery =
      countQuery.eq(
        "rating",
        selectedRating,
      );
  }

  if (search) {
    countQuery =
      countQuery.or(
        [
          `customer_name.ilike.%${search}%`,
          `city.ilike.%${search}%`,
          `comment.ilike.%${search}%`,
        ].join(","),
      );
  }

  const {
    count: filteredCount,
    error: countError,
  } = await countQuery;

  const totalReviews =
    filteredCount ?? 0;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalReviews /
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
   * AGORA BUSCAMOS APENAS
   * A PÁGINA ATUAL.
   */
  let reviewsQuery =
    supabase
      .from("reviews")
      .select(
        `
          id,
          customer_name,
          city,
          rating,
          comment,
          status,
          is_featured,
          created_at
        `,
      )
      .eq(
        "tenant_id",
        tenantId,
      );

  if (selectedStatus) {
    reviewsQuery =
      reviewsQuery.eq(
        "status",
        selectedStatus,
      );
  }

  if (selectedRating) {
    reviewsQuery =
      reviewsQuery.eq(
        "rating",
        selectedRating,
      );
  }

  if (search) {
    reviewsQuery =
      reviewsQuery.or(
        [
          `customer_name.ilike.%${search}%`,
          `city.ilike.%${search}%`,
          `comment.ilike.%${search}%`,
        ].join(","),
      );
  }

  const {
    data,
    error: reviewsError,
  } = await reviewsQuery
    .order("created_at", {
      ascending: false,
    })
    .range(from, to);

  const reviews =
    (data ?? []) as Review[];

  const hasFilters =
    Boolean(
      search ||
        selectedStatus ||
        selectedRating,
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

    if (selectedRating) {
      query.set(
        "rating",
        String(
          selectedRating,
        ),
      );
    }

    query.set(
      "page",
      String(page),
    );

    return `/admin/avaliacoes?${query.toString()}`;
  }

  const startResult =
    totalReviews > 0
      ? from + 1
      : 0;

  const endResult =
    Math.min(
      from +
        reviews.length,
      totalReviews,
    );

  return (
    <>
      <AdminPageHeader
        title="Avaliações"
        description="Modere avaliações, encontre rapidamente novos comentários e escolha os destaques do site."
      />

      {/* RESUMO */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Pendentes"
          value={pendingCount}
          description="aguardando moderação"
          icon={Clock3}
          iconClass="bg-amber-50 text-amber-600"
        />

        <SummaryCard
          title="Aprovadas"
          value={approvedCount}
          description="publicadas no site"
          icon={CheckCircle2}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <SummaryCard
          title="Rejeitadas"
          value={rejectedCount}
          description="não publicadas"
          icon={XCircle}
          iconClass="bg-red-50 text-red-600"
        />

        <SummaryCard
          title="Destaques"
          value={featuredCount}
          description="avaliações destacadas"
          icon={Star}
          iconClass="bg-blue-50 text-blue-600"
        />
      </div>

      {/* FILTROS */}
      <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4">
        <form
          method="GET"
          className="grid gap-3 lg:grid-cols-[minmax(280px,1fr)_200px_180px_auto_auto]"
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
                defaultValue={search}
                placeholder="Nome, cidade ou comentário..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
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
                Todos
              </option>

              <option value="pending">
                Pendentes
              </option>

              <option value="approved">
                Aprovadas
              </option>

              <option value="rejected">
                Rejeitadas
              </option>
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Nota
            </span>

            <select
              name="rating"
              defaultValue={
                selectedRating
                  ? String(
                      selectedRating,
                    )
                  : ""
              }
              className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            >
              <option value="">
                Todas
              </option>

              <option value="5">
                5 estrelas
              </option>

              <option value="4">
                4 estrelas
              </option>

              <option value="3">
                3 estrelas
              </option>

              <option value="2">
                2 estrelas
              </option>

              <option value="1">
                1 estrela
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
                href="/admin/avaliacoes"
                className="w-full rounded-xl border border-slate-200 px-5 py-2.5 text-center text-sm font-semibold text-slate-600 transition hover:bg-slate-50 lg:w-auto"
              >
                Limpar
              </Link>
            </div>
          )}
        </form>
      </section>

      {/* CONTADOR */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-500">
          <strong className="text-slate-800">
            {totalReviews}
          </strong>{" "}
          {totalReviews === 1
            ? "avaliação encontrada"
            : "avaliações encontradas"}
        </p>

        {pendingCount > 0 && (
          <Link
            href="/admin/avaliacoes?status=pending"
            className="text-xs font-semibold text-amber-600 transition hover:text-amber-500"
          >
            Ver {pendingCount}{" "}
            {pendingCount === 1
              ? "pendente"
              : "pendentes"}
          </Link>
        )}
      </div>

      {/* ERROS */}
      {(countError ||
        reviewsError) && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {countError?.message ??
            reviewsError?.message}
        </div>
      )}

      {/* LISTAGEM */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {reviews.length ===
        0 ? (
          <Empty
            hasFilters={
              hasFilters
            }
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {reviews.map(
              (review) => (
                <ReviewRow
                  key={
                    review.id
                  }
                  review={
                    review
                  }
                />
              ),
            )}
          </div>
        )}
      </div>

      {/* PAGINAÇÃO */}
      {totalReviews > 0 && (
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
              {totalReviews}
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
                  title="Página anterior"
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
                  title="Próxima página"
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

function ReviewRow({
  review,
}: {
  review: Review;
}) {
  const status =
    STATUS_CONFIG[
      review.status
    ];

  const rating =
    Math.max(
      1,
      Math.min(
        review.rating,
        5,
      ),
    );

  return (
    <article
      className={`p-4 transition hover:bg-slate-50/70 sm:p-5 ${
        review.status ===
        "pending"
          ? "bg-amber-50/20"
          : ""
      }`}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        {/* CONTEÚDO */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <h2 className="font-semibold text-slate-950">
              {
                review.customer_name
              }
            </h2>

            <div
              className="flex items-center gap-0.5 text-amber-500"
              title={`${rating} de 5 estrelas`}
            >
              {Array.from({
                length: 5,
              }).map(
                (_, index) => (
                  <Star
                    key={index}
                    size={14}
                    fill={
                      index <
                      rating
                        ? "currentColor"
                        : "none"
                    }
                    className={
                      index <
                      rating
                        ? ""
                        : "text-slate-300"
                    }
                  />
                ),
              )}
            </div>

            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${status.className}`}
            >
              {status.label}
            </span>

            {review.is_featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/10">
                <Star
                  size={11}
                  fill="currentColor"
                />

                Destaque
              </span>
            )}
          </div>

          <p className="mt-2 line-clamp-2 max-w-4xl text-sm leading-6 text-slate-600">
            {review.comment}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
            <span>
              {review.city ||
                "Local não informado"}
            </span>

            <span className="hidden sm:inline">
              •
            </span>

            <span>
              {formatDate(
                review.created_at,
              )}
            </span>
          </div>
        </div>

        {/* AÇÕES */}
        <form
          action={reviewAction}
          className="flex shrink-0 flex-wrap items-center gap-2 xl:justify-end"
        >
          <input
            type="hidden"
            name="id"
            value={review.id}
          />

          <input
            type="hidden"
            name="featured"
            value={String(
              review.is_featured,
            )}
          />

          {review.status !==
            "approved" && (
            <button
              type="submit"
              name="action"
              value="approved"
              title="Aprovar avaliação"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
            >
              <CheckCircle2
                size={14}
              />

              Aprovar
            </button>
          )}

          {review.status !==
            "rejected" && (
            <button
              type="submit"
              name="action"
              value="rejected"
              title="Rejeitar avaliação"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <XCircle
                size={14}
              />

              Rejeitar
            </button>
          )}

          {review.status ===
            "approved" && (
            <button
              type="submit"
              name="action"
              value="feature"
              title={
                review.is_featured
                  ? "Remover dos destaques"
                  : "Destacar avaliação"
              }
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                review.is_featured
                  ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              {review.is_featured ? (
                <StarOff
                  size={14}
                />
              ) : (
                <Star
                  size={14}
                />
              )}

              {review.is_featured
                ? "Remover destaque"
                : "Destacar"}
            </button>
          )}

          <button
            type="submit"
            name="action"
            value="delete"
            title="Excluir avaliação"
            aria-label="Excluir avaliação"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-red-100 bg-white text-red-600 transition hover:bg-red-50"
          >
            <Trash2
              size={15}
            />
          </button>
        </form>
      </div>
    </article>
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
    <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
      <Search
        size={28}
        className="text-slate-300"
      />

      <p className="mt-4 font-semibold text-slate-700">
        {hasFilters
          ? "Nenhuma avaliação encontrada"
          : "Nenhuma avaliação recebida"}
      </p>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasFilters
          ? "Tente alterar os filtros ou limpar a busca para encontrar outras avaliações."
          : "Quando clientes enviarem avaliações pelo site, elas aparecerão aqui para moderação."}
      </p>
    </div>
  );
}