import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getCurrentTenant } from "@/lib/auth/get-current-tenant";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const currentTenant = await getCurrentTenant();

  if (!currentTenant) {
    return null;
  }

  const supabase = await createClient();

  const now = new Date();
  const sinceDate = new Date(now);

  sinceDate.setDate(sinceDate.getDate() - 30);

  const since = sinceDate.toISOString();

  const [
    visitsResult,
    clicksResult,
    leadsResult,
    reviewsResult,
  ] = await Promise.all([
    supabase
      .from("site_events")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "tenant_id",
        currentTenant.tenant.id,
      )
      .eq("event_type", "page_view")
      .gte("created_at", since),

    supabase
      .from("site_events")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "tenant_id",
        currentTenant.tenant.id,
      )
      .eq(
        "event_type",
        "whatsapp_click",
      )
      .gte("created_at", since),

    supabase
      .from("leads")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "tenant_id",
        currentTenant.tenant.id,
      )
      .gte("created_at", since),

    supabase
      .from("reviews")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "tenant_id",
        currentTenant.tenant.id,
      )
      .eq("status", "approved"),
  ]);

  const cards = [
    {
      title: "Visitas",
      value: visitsResult.count ?? 0,
    },
    {
      title: "WhatsApp",
      value: clicksResult.count ?? 0,
    },
    {
      title: "Leads",
      value: leadsResult.count ?? 0,
    },
    {
      title: "Avaliações",
      value: reviewsResult.count ?? 0,
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="Analytics"
        description="Resumo dos últimos 30 dias."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <p className="text-sm text-slate-500">
              {card.title}
            </p>

            <strong className="mt-3 block text-3xl text-slate-950">
              {card.value}
            </strong>
          </div>
        ))}
      </div>
    </>
  );
}