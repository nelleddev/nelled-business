import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getCurrentTenant } from "@/lib/auth/get-current-tenant";
import { createClient } from "@/lib/supabase/server";

import { reviewAction } from "./actions";

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
};

type StatusConfig = {
  label: string;
  className: string;
};

const STATUS_CONFIG: Record<
  ReviewStatus,
  StatusConfig
> = {
  pending: {
    label: "Pendente",
    className:
      "border-amber-200 bg-amber-50 text-amber-700",
  },

  approved: {
    label: "Aprovada",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  rejected: {
    label: "Rejeitada",
    className:
      "border-red-200 bg-red-50 text-red-700",
  },
};

export default async function ReviewsPage() {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    return null;
  }

  const supabase =
    await createClient();

  const { data } = await supabase
    .from("reviews")
    .select(
      `
        id,
        customer_name,
        city,
        rating,
        comment,
        status,
        is_featured
      `,
    )
    .eq(
      "tenant_id",
      currentTenant.tenant.id,
    )
    .order("created_at", {
      ascending: false,
    });

  const reviews =
    (data ?? []) as Review[];

  return (
    <>
      <AdminPageHeader
        title="Avaliações"
        description="Modere avaliações e escolha quais aparecem no site."
      />

      <div className="grid gap-4">
        {reviews.length === 0 && (
          <Empty text="Nenhuma avaliação recebida ainda." />
        )}

        {reviews.map((review) => {
          const status =
            STATUS_CONFIG[
              review.status
            ];

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
              key={review.id}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                {/* CONTEÚDO */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-950">
                      {
                        review.customer_name
                      }
                    </h2>

                    <span className="text-sm tracking-wide text-amber-500">
                      {"★".repeat(
                        rating,
                      )}
                    </span>

                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}
                    >
                      {
                        status.label
                      }
                    </span>

                    {review.is_featured && (
                      <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        Destaque
                      </span>
                    )}
                  </div>

                  <p className="mt-3 max-w-3xl leading-6 text-slate-600">
                    {review.comment}
                  </p>

                  <p className="mt-3 text-xs text-slate-400">
                    {review.city ||
                      "Local não informado"}
                  </p>
                </div>

                {/* AÇÕES */}
                <form
                  action={
                    reviewAction
                  }
                  className="flex self-start flex-wrap items-center gap-2"
                >
                  <input
                    type="hidden"
                    name="id"
                    value={
                      review.id
                    }
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
                      className="cursor-pointer rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
                    >
                      Aprovar
                    </button>
                  )}

                  {review.status !==
                    "rejected" && (
                    <button
                      type="submit"
                      name="action"
                      value="rejected"
                      className="cursor-pointer rounded-lg bg-slate-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-600"
                    >
                      Rejeitar
                    </button>
                  )}

                  {review.status ===
                    "approved" && (
                    <button
                      type="submit"
                      name="action"
                      value="feature"
                      className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      {review.is_featured
                        ? "Remover destaque"
                        : "Destacar"}
                    </button>
                  )}

                  <button
                    type="submit"
                    name="action"
                    value="delete"
                    className="cursor-pointer rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Excluir
                  </button>
                </form>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

function Empty({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
      {text}
    </div>
  );
}