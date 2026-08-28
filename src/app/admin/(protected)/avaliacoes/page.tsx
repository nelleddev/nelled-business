import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getCurrentTenant } from "@/lib/auth/get-current-tenant";
import { createClient } from "@/lib/supabase/server";

import { reviewAction } from "./actions";

type Review = {
  id: string;
  customer_name: string;
  city: string | null;
  rating: number;
  comment: string;
  status:
    | "pending"
    | "approved"
    | "rejected";
  is_featured: boolean;
};

export default async function ReviewsPage() {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    return null;
  }

  const supabase = await createClient();

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

        {reviews.map((review) => (
          <article
            key={review.id}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="flex flex-col justify-between gap-5 lg:flex-row">
              <div className="min-w-0">
                <div className="font-semibold text-slate-950">
                  {review.customer_name} ·{" "}
                  {"★".repeat(
                    Math.max(
                      0,
                      Math.min(
                        review.rating,
                        5,
                      ),
                    ),
                  )}
                </div>

                <p className="mt-2 leading-6 text-slate-600">
                  {review.comment}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  {review.city || "Local não informado"} ·{" "}
                  {review.status}
                </p>
              </div>

              <form
                action={reviewAction}
                className="flex flex-wrap gap-2"
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

                <button
                  name="action"
                  value="approved"
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white"
                >
                  Aprovar
                </button>

                <button
                  name="action"
                  value="rejected"
                  className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium text-white"
                >
                  Rejeitar
                </button>

                <button
                  name="action"
                  value="feature"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  {review.is_featured
                    ? "Remover destaque"
                    : "Destacar"}
                </button>

                <button
                  name="action"
                  value="delete"
                  className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600"
                >
                  Excluir
                </button>
              </form>
            </div>
          </article>
        ))}
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