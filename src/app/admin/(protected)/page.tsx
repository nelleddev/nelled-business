import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  ArrowUpRight,
  BriefcaseBusiness,
  ClipboardList,
  Eye,
  Images,
  MessageCircle,
  Star,
} from "lucide-react";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getCurrentTenant } from "@/lib/auth/get-current-tenant";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SiteEvent = {
  event_type:
    | "page_view"
    | "whatsapp_click"
    | "lead";
  created_at: string;
};

type Lead = {
  id: string;
  name: string;
  status:
    | "new"
    | "contacted"
    | "converted"
    | "archived";
  created_at: string;
};

type Review = {
  id: string;
  customer_name: string;
  status:
    | "pending"
    | "approved"
    | "rejected";
  rating: number;
  created_at: string;
};

type DailyStat = {
  key: string;
  label: string;
  visits: number;
  leads: number;
};

type Activity = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  href: string;
  type: "lead" | "review";
};

type MetricCardProps = {
  label: string;
  value: number;
  description: string;
  detail?: string;
  href: string;
  icon: LucideIcon;
};

const numberFormatter =
  new Intl.NumberFormat("pt-BR");

const dateFormatter =
  new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

const shortDateFormatter =
  new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      timeZone: "UTC",
    },
  );

function formatNumber(
  value: number,
) {
  return numberFormatter.format(
    value,
  );
}

function formatPercentage(
  value: number,
) {
  return `${value.toLocaleString(
    "pt-BR",
    {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    },
  )}%`;
}

function formatDate(
  value: string,
) {
  return dateFormatter.format(
    new Date(value),
  );
}

function getRoleLabel(
  role: string,
) {
  const roles: Record<
    string,
    string
  > = {
    owner: "Proprietário",
    admin: "Administrador",
    member: "Membro",
  };

  return roles[role] ?? role;
}

function createDailyStats(
  startDate: Date,
  events: SiteEvent[],
  leads: Pick<
    Lead,
    "created_at"
  >[],
): DailyStat[] {
  const days =
    new Map<
      string,
      DailyStat
    >();

  for (
    let index = 0;
    index < 30;
    index++
  ) {
    const date =
      new Date(startDate);

    date.setUTCDate(
      startDate.getUTCDate() +
        index,
    );

    const key = date
      .toISOString()
      .slice(0, 10);

    days.set(key, {
      key,
      label:
        shortDateFormatter.format(
          date,
        ),
      visits: 0,
      leads: 0,
    });
  }

  for (const event of events) {
    if (
      event.event_type !==
      "page_view"
    ) {
      continue;
    }

    const key = new Date(
      event.created_at,
    )
      .toISOString()
      .slice(0, 10);

    const day = days.get(key);

    if (day) {
      day.visits += 1;
    }
  }

  for (const lead of leads) {
    const key = new Date(
      lead.created_at,
    )
      .toISOString()
      .slice(0, 10);

    const day = days.get(key);

    if (day) {
      day.leads += 1;
    }
  }

  return Array.from(
    days.values(),
  );
}

function createActivities(
  leads: Lead[],
  reviews: Review[],
): Activity[] {
  const leadActivities: Activity[] =
    leads.map((lead) => ({
      id: `lead-${lead.id}`,
      title: `Orçamento de ${lead.name}`,
      description:
        lead.status === "new"
          ? "Novo lead recebido"
          : "Lead atualizado",
      createdAt:
        lead.created_at,
      href: "/admin/leads",
      type: "lead",
    }));

  const reviewActivities: Activity[] =
    reviews.map(
      (review) => {
        let description =
          "Nova avaliação recebida";

        if (
          review.status ===
          "approved"
        ) {
          description =
            "Avaliação aprovada";
        }

        if (
          review.status ===
          "rejected"
        ) {
          description =
            "Avaliação rejeitada";
        }

        return {
          id: `review-${review.id}`,
          title:
            review.customer_name,
          description,
          createdAt:
            review.created_at,
          href:
            "/admin/avaliacoes",
          type: "review",
        };
      },
    );

  return [
    ...leadActivities,
    ...reviewActivities,
  ]
    .sort(
      (first, second) =>
        new Date(
          second.createdAt,
        ).getTime() -
        new Date(
          first.createdAt,
        ).getTime(),
    )
    .slice(0, 6);
}

export default async function AdminPage() {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    return null;
  }

  const supabase =
    await createClient();

  const tenantId =
    currentTenant.tenant.id;

  /*
   * Período dos últimos 30 dias,
   * incluindo hoje.
   */
  const now = new Date();

  const sinceDate =
    new Date(now);

  sinceDate.setUTCHours(
    0,
    0,
    0,
    0,
  );

  sinceDate.setUTCDate(
    sinceDate.getUTCDate() -
      29,
  );

  const since =
    sinceDate.toISOString();

  const [
    eventsResult,
    visitsCountResult,
    clicksCountResult,
    leadsChartResult,
    leadsCountResult,
    recentLeadsResult,
    approvedReviewsResult,
    pendingReviewsResult,
    recentReviewsResult,
    servicesResult,
    galleryResult,
  ] = await Promise.all([
    /*
     * Eventos usados no gráfico.
     */
    supabase
      .from("site_events")
      .select(
        "event_type, created_at",
      )
      .eq(
        "tenant_id",
        tenantId,
      )
      .gte(
        "created_at",
        since,
      )
      .order("created_at"),

    /*
     * Total exato de visitas.
     */
    supabase
      .from("site_events")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "tenant_id",
        tenantId,
      )
      .eq(
        "event_type",
        "page_view",
      )
      .gte(
        "created_at",
        since,
      ),

    /*
     * Total exato de cliques
     * no WhatsApp.
     */
    supabase
      .from("site_events")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "tenant_id",
        tenantId,
      )
      .eq(
        "event_type",
        "whatsapp_click",
      )
      .gte(
        "created_at",
        since,
      ),

    /*
     * Leads usados no gráfico.
     */
    supabase
      .from("leads")
      .select("created_at")
      .eq(
        "tenant_id",
        tenantId,
      )
      .gte(
        "created_at",
        since,
      )
      .order("created_at"),

    /*
     * Total exato de leads
     * nos últimos 30 dias.
     */
    supabase
      .from("leads")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "tenant_id",
        tenantId,
      )
      .gte(
        "created_at",
        since,
      ),

    /*
     * Atividade recente.
     */
    supabase
      .from("leads")
      .select(
        `
          id,
          name,
          status,
          created_at
        `,
      )
      .eq(
        "tenant_id",
        tenantId,
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(6),

    /*
     * Avaliações publicadas.
     */
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

    /*
     * Avaliações esperando
     * moderação.
     */
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

    /*
     * Avaliações recentes.
     */
    supabase
      .from("reviews")
      .select(
        `
          id,
          customer_name,
          status,
          rating,
          created_at
        `,
      )
      .eq(
        "tenant_id",
        tenantId,
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(6),

    /*
     * Serviços ativos.
     */
    supabase
      .from("services")
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

    /*
     * Fotos ativas.
     */
    supabase
      .from("gallery_items")
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
  ]);

  const events =
    (eventsResult.data ??
      []) as SiteEvent[];

  const chartLeads =
    (leadsChartResult.data ??
      []) as Pick<
      Lead,
      "created_at"
    >[];

  const recentLeads =
    (recentLeadsResult.data ??
      []) as Lead[];

  const recentReviews =
    (recentReviewsResult.data ??
      []) as Review[];

  const visits =
    visitsCountResult.count ??
    0;

  const whatsappClicks =
    clicksCountResult.count ??
    0;

  const leads =
    leadsCountResult.count ??
    0;

  const approvedReviews =
    approvedReviewsResult.count ??
    0;

  const pendingReviews =
    pendingReviewsResult.count ??
    0;

  const activeServices =
    servicesResult.count ??
    0;

  const galleryItems =
    galleryResult.count ??
    0;

  const whatsappRate =
    visits > 0
      ? (whatsappClicks /
          visits) *
        100
      : 0;

  const leadRate =
    visits > 0
      ? (leads / visits) *
        100
      : 0;

  const dailyStats =
    createDailyStats(
      sinceDate,
      events,
      chartLeads,
    );

  const activities =
    createActivities(
      recentLeads,
      recentReviews,
    );

  const companyName =
    currentTenant.settings
      ?.company_name ??
    currentTenant.tenant.name;

  const cards: MetricCardProps[] =
    [
      {
        label: "Visitas",
        value: visits,
        description:
          "Últimos 30 dias",
        detail:
          "Visualizações do site",
        icon: Eye,
        href: "/admin/analytics",
      },
      {
        label: "WhatsApp",
        value:
          whatsappClicks,
        description:
          "Cliques nos últimos 30 dias",
        detail: `${formatPercentage(
          whatsappRate,
        )} das visitas`,
        icon: MessageCircle,
        href: "/admin/analytics",
      },
      {
        label: "Leads",
        value: leads,
        description:
          "Orçamentos recebidos",
        detail: `${formatPercentage(
          leadRate,
        )} de conversão`,
        icon: ClipboardList,
        href: "/admin/leads",
      },
      {
        label: "Avaliações",
        value:
          approvedReviews,
        description:
          "Avaliações publicadas",
        detail:
          pendingReviews > 0
            ? `${pendingReviews} pendente${
                pendingReviews === 1
                  ? ""
                  : "s"
              }`
            : "Nenhuma pendência",
        icon: Star,
        href:
          "/admin/avaliacoes",
      },
    ];

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description={`Acompanhe o desempenho e as principais informações da ${companyName}.`}
      />

      {/* MÉTRICAS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(
          (card) => (
            <MetricCard
              key={card.label}
              {...card}
            />
          ),
        )}
      </div>

      {/* GRÁFICO + RESUMO */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,2fr)_380px]">
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-950">
                Visitas e conversões
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Desempenho dos
                últimos 30 dias.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-sm bg-blue-600" />

                Visitas
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />

                Leads
              </div>
            </div>
          </div>

          <DashboardChart
            data={dailyStats}
          />

          <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
            <ChartSummary
              label="Visitas"
              value={visits}
            />

            <ChartSummary
              label="Cliques WhatsApp"
              value={
                whatsappClicks
              }
            />

            <ChartSummary
              label="Leads"
              value={leads}
            />
          </div>
        </section>

        <div className="grid gap-6">
          {/* RESUMO */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-950">
              Resumo
            </h2>

            <div className="mt-5 space-y-4 text-sm">
              <SummaryRow
                label="Empresa"
                value={
                  companyName
                }
              />

              <SummaryRow
                label="Perfil"
                value={getRoleLabel(
                  currentTenant
                    .membership.role,
                )}
              />

              <SummaryRow
                label="Serviços ativos"
                value={formatNumber(
                  activeServices,
                )}
              />

              <SummaryRow
                label="Fotos publicadas"
                value={formatNumber(
                  galleryItems,
                )}
              />

              <div className="flex items-center justify-between gap-5">
                <span className="text-slate-500">
                  Status
                </span>

                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Ativo
                </span>
              </div>
            </div>
          </section>

          {/* PENDÊNCIAS */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <AlertCircle
                size={18}
                className="text-amber-500"
              />

              <h2 className="font-semibold text-slate-950">
                Pendências
              </h2>
            </div>

            {pendingReviews >
            0 ? (
              <Link
                href="/admin/avaliacoes"
                className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4 transition hover:bg-amber-100"
              >
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    {pendingReviews}{" "}
                    avaliação
                    {pendingReviews ===
                    1
                      ? ""
                      : "ões"}{" "}
                    aguardando
                    moderação
                  </p>

                  <p className="mt-1 text-xs text-amber-700">
                    Revise antes de
                    publicar no site.
                  </p>
                </div>

                <ArrowUpRight
                  size={18}
                  className="shrink-0 text-amber-700"
                />
              </Link>
            ) : (
              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-700">
                  Tudo em dia
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Nenhuma avaliação
                  aguardando moderação.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ATIVIDADE + ATALHOS */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,2fr)_380px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-slate-950">
                Atividade recente
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Últimos leads e
                avaliações recebidas.
              </p>
            </div>
          </div>

          {activities.length >
          0 ? (
            <div className="mt-5 divide-y divide-slate-100">
              {activities.map(
                (activity) => (
                  <Link
                    key={
                      activity.id
                    }
                    href={
                      activity.href
                    }
                    className="group flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        activity.type ===
                        "lead"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {activity.type ===
                      "lead" ? (
                        <ClipboardList
                          size={18}
                        />
                      ) : (
                        <Star
                          size={18}
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {
                          activity.title
                        }
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {
                          activity.description
                        }
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xs text-slate-400">
                        {formatDate(
                          activity.createdAt,
                        )}
                      </p>

                      <ArrowUpRight
                        size={16}
                        className="ml-auto mt-1 text-slate-300 transition group-hover:text-blue-600"
                      />
                    </div>
                  </Link>
                ),
              )}
            </div>
          ) : (
            <div className="mt-5 flex min-h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
              <p className="text-sm text-slate-500">
                Nenhuma atividade
                registrada ainda.
              </p>
            </div>
          )}
        </section>

        {/* ATALHOS */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-950">
            Atalhos
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Acesse rapidamente as
            principais áreas.
          </p>

          <div className="mt-5 grid gap-3">
            <QuickLink
              href="/admin/site"
              icon={
                BriefcaseBusiness
              }
              title="Editar site"
              description="Textos, cores e identidade"
            />

            <QuickLink
              href="/admin/servicos"
              icon={
                ClipboardList
              }
              title="Gerenciar serviços"
              description="Especialidades da empresa"
            />

            <QuickLink
              href="/admin/galeria"
              icon={Images}
              title="Gerenciar galeria"
              description="Fotos e antes/depois"
            />

            <QuickLink
              href="/admin/leads"
              icon={
                MessageCircle
              }
              title="Ver leads"
              description="Orçamentos recebidos"
            />
          </div>
        </section>
      </div>
    </>
  );
}

function MetricCard({
  label,
  value,
  description,
  detail,
  href,
  icon: Icon,
}: MetricCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-sm"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-slate-500">
          {label}
        </p>

        <div className="rounded-xl bg-slate-100 p-2 text-slate-600 transition group-hover:bg-blue-50 group-hover:text-blue-600">
          <Icon size={18} />
        </div>
      </div>

      <p className="mt-5 text-3xl font-bold text-slate-950">
        {formatNumber(value)}
      </p>

      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">
          {description}
        </p>

        {detail && (
          <span className="text-xs font-medium text-slate-400">
            {detail}
          </span>
        )}
      </div>
    </Link>
  );
}

function DashboardChart({
  data,
}: {
  data: DailyStat[];
}) {
  const maxValue =
    Math.max(
      1,
      ...data.map((day) =>
        Math.max(
          day.visits,
          day.leads,
        ),
      ),
    );

  return (
    <div className="mt-7 overflow-x-auto pb-2">
      <div className="min-w-[720px]">
        <div className="relative flex h-56 items-end gap-1 border-b border-slate-200">
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
            <span className="border-t border-dashed border-slate-100" />
            <span className="border-t border-dashed border-slate-100" />
            <span className="border-t border-dashed border-slate-100" />
            <span className="border-t border-dashed border-slate-100" />
          </div>

          {data.map(
            (day) => {
              const visitsHeight =
                day.visits ===
                0
                  ? "0%"
                  : `${Math.max(
                      4,
                      (day.visits /
                        maxValue) *
                        100,
                    )}%`;

              const leadsHeight =
                day.leads === 0
                  ? "0%"
                  : `${Math.max(
                      4,
                      (day.leads /
                        maxValue) *
                        100,
                    )}%`;

              return (
                <div
                  key={day.key}
                  title={`${day.label}: ${day.visits} visita(s), ${day.leads} lead(s)`}
                  className="group relative z-10 flex h-full min-w-0 flex-1 items-end justify-center gap-[2px]"
                >
                  <div
                    className="w-[45%] max-w-2 rounded-t-sm bg-blue-600 transition-opacity group-hover:opacity-75"
                    style={{
                      height:
                        visitsHeight,
                    }}
                  />

                  <div
                    className="w-[45%] max-w-2 rounded-t-sm bg-emerald-500 transition-opacity group-hover:opacity-75"
                    style={{
                      height:
                        leadsHeight,
                    }}
                  />
                </div>
              );
            },
          )}
        </div>

        <div className="mt-3 grid grid-cols-6 text-xs text-slate-400">
          {[
            0,
            5,
            11,
            17,
            23,
            29,
          ].map((index) => (
            <span
              key={index}
              className={
                index === 29
                  ? "text-right"
                  : ""
              }
            >
              {
                data[index]
                  ?.label
              }
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChartSummary({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold text-slate-900">
        {formatNumber(value)}
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-slate-100 pb-4">
      <span className="text-slate-500">
        {label}
      </span>

      <span className="text-right font-medium text-slate-900">
        {value}
      </span>
    </div>
  );
}

function QuickLink({
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
      className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-blue-200 hover:bg-blue-50/50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-blue-100 group-hover:text-blue-600">
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-slate-500">
          {description}
        </p>
      </div>

      <ArrowUpRight
        size={17}
        className="shrink-0 text-slate-300 transition group-hover:text-blue-600"
      />
    </Link>
  );
}