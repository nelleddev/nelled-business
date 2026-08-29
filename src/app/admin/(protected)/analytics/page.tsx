import type {
  LucideIcon,
} from "lucide-react";
import {
  ArrowUpRight,
  ChartNoAxesCombined,
  ClipboardList,
  Eye,
  MessageCircle,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getCurrentTenant } from "@/lib/auth/get-current-tenant";
import { createClient } from "@/lib/supabase/server";

export const dynamic =
  "force-dynamic";

type AnalyticsPageProps = {
  searchParams: Promise<{
    period?: string;
  }>;
};

type Period =
  | 7
  | 30
  | 90;

type SiteEvent = {
  event_type: string;
  created_at: string;
};

type Lead = {
  status:
    | "new"
    | "contacted"
    | "converted"
    | "archived";
  created_at: string;
};

type DailyStat = {
  key: string;
  label: string;
  visits: number;
  whatsapp: number;
  leads: number;
};

type MetricCardProps = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  iconClass: string;
};

const PERIODS: {
  value: Period;
  label: string;
}[] = [
  {
    value: 7,
    label: "7 dias",
  },
  {
    value: 30,
    label: "30 dias",
  },
  {
    value: 90,
    label: "90 dias",
  },
];

const numberFormatter =
  new Intl.NumberFormat(
    "pt-BR",
  );

function formatNumber(
  value: number,
) {
  return numberFormatter.format(
    value,
  );
}

function formatPercent(
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

function getPeriod(
  value?: string,
): Period {
  const parsed =
    Number(value);

  if (
    parsed === 7 ||
    parsed === 30 ||
    parsed === 90
  ) {
    return parsed;
  }

  return 30;
}

function createDailyStats(
  startDate: Date,
  period: Period,
  events: SiteEvent[],
  leads: Lead[],
): DailyStat[] {
  const days =
    new Map<
      string,
      DailyStat
    >();

  const formatter =
    new Intl.DateTimeFormat(
      "pt-BR",
      {
        day: "2-digit",
        month: "2-digit",
        timeZone: "UTC",
      },
    );

  for (
    let index = 0;
    index < period;
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
        formatter.format(
          date,
        ),
      visits: 0,
      whatsapp: 0,
      leads: 0,
    });
  }

  for (const event of events) {
    const key =
      event.created_at.slice(
        0,
        10,
      );

    const day =
      days.get(key);

    if (!day) {
      continue;
    }

    if (
      event.event_type ===
      "page_view"
    ) {
      day.visits += 1;
    }

    if (
      event.event_type ===
      "whatsapp_click"
    ) {
      day.whatsapp += 1;
    }
  }

  for (const lead of leads) {
    const key =
      lead.created_at.slice(
        0,
        10,
      );

    const day =
      days.get(key);

    if (day) {
      day.leads += 1;
    }
  }

  return Array.from(
    days.values(),
  );
}

export default async function AnalyticsPage({
  searchParams,
}: AnalyticsPageProps) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    return null;
  }

  const params =
    await searchParams;

  const period =
    getPeriod(
      params.period,
    );

  const tenantId =
    currentTenant.tenant.id;

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
      (period - 1),
  );

  const since =
    sinceDate.toISOString();

  const supabase =
    await createClient();

  const [
    eventsResult,
    leadsResult,
    visitsCountResult,
    whatsappCountResult,
    leadsCountResult,
    convertedCountResult,
    reviewsCountResult,
  ] = await Promise.all([
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
      .order("created_at", {
        ascending: true,
      }),

    supabase
      .from("leads")
      .select(
        "status, created_at",
      )
      .eq(
        "tenant_id",
        tenantId,
      )
      .gte(
        "created_at",
        since,
      )
      .order("created_at", {
        ascending: true,
      }),

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
      .eq(
        "status",
        "converted",
      )
      .gte(
        "created_at",
        since,
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
      .gte(
        "created_at",
        since,
      ),
  ]);

  const events =
    (eventsResult.data ??
      []) as SiteEvent[];

  const leadsData =
    (leadsResult.data ??
      []) as Lead[];

  const visits =
    visitsCountResult.count ??
    0;

  const whatsappClicks =
    whatsappCountResult.count ??
    0;

  const leads =
    leadsCountResult.count ??
    0;

  const converted =
    convertedCountResult.count ??
    0;

  const reviews =
    reviewsCountResult.count ??
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

  const closeRate =
    leads > 0
      ? (converted / leads) *
        100
      : 0;

  const dailyStats =
    createDailyStats(
      sinceDate,
      period,
      events,
      leadsData,
    );

  const bestDay =
    dailyStats.reduce<
      DailyStat | null
    >(
      (best, day) => {
        if (
          !best ||
          day.visits >
            best.visits
        ) {
          return day;
        }

        return best;
      },
      null,
    );

  const metrics: MetricCardProps[] =
    [
      {
        title: "Visitas",
        value:
          formatNumber(
            visits,
          ),
        description: `Últimos ${period} dias`,
        icon: Eye,
        iconClass:
          "bg-blue-50 text-blue-600",
      },
      {
        title: "WhatsApp",
        value:
          formatNumber(
            whatsappClicks,
          ),
        description: `${formatPercent(
          whatsappRate,
        )} das visitas`,
        icon: MessageCircle,
        iconClass:
          "bg-emerald-50 text-emerald-600",
      },
      {
        title: "Leads",
        value:
          formatNumber(
            leads,
          ),
        description: `${formatPercent(
          leadRate,
        )} de conversão`,
        icon: ClipboardList,
        iconClass:
          "bg-violet-50 text-violet-600",
      },
      {
        title: "Convertidos",
        value:
          formatNumber(
            converted,
          ),
        description: `${formatPercent(
          closeRate,
        )} dos leads`,
        icon: Trophy,
        iconClass:
          "bg-amber-50 text-amber-600",
      },
    ];

  return (
    <>
      <AdminPageHeader
        title="Analytics"
        description="Acompanhe visitas, interesse no WhatsApp e conversões geradas pelo site."
      />

      {/* PERÍODO */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {PERIODS.map(
          (option) => {
            const active =
              period ===
              option.value;

            return (
              <Link
                key={
                  option.value
                }
                href={`/admin/analytics?period=${option.value}`}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </Link>
            );
          },
        )}
      </div>

      {/* PRINCIPAIS MÉTRICAS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(
          (metric) => (
            <MetricCard
              key={
                metric.title
              }
              {...metric}
            />
          ),
        )}
      </div>

      {/* GRÁFICO */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <div className="flex items-center gap-2">
              <ChartNoAxesCombined
                size={19}
                className="text-blue-600"
              />

              <h2 className="font-semibold text-slate-950">
                Desempenho diário
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Visitas, cliques no
              WhatsApp e leads
              recebidos.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            <Legend
              className="bg-blue-600"
              label="Visitas"
            />

            <Legend
              className="bg-emerald-500"
              label="WhatsApp"
            />

            <Legend
              className="bg-violet-500"
              label="Leads"
            />
          </div>
        </div>

        <AnalyticsChart
          data={dailyStats}
          period={period}
        />
      </section>

      {/* CONVERSÕES */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-950">
            Funil de conversão
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Veja como os visitantes
            avançam até virar
            clientes.
          </p>

          <div className="mt-7 space-y-5">
            <FunnelRow
              label="Visitas"
              value={visits}
              percent={100}
              className="bg-blue-600"
            />

            <FunnelRow
              label="Cliques no WhatsApp"
              value={
                whatsappClicks
              }
              percent={
                whatsappRate
              }
              className="bg-emerald-500"
            />

            <FunnelRow
              label="Leads"
              value={leads}
              percent={
                leadRate
              }
              className="bg-violet-500"
            />

            <FunnelRow
              label="Convertidos"
              value={converted}
              percent={
                visits > 0
                  ? (converted /
                      visits) *
                    100
                  : 0
              }
              className="bg-amber-500"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-950">
            Destaques
          </h2>

          <div className="mt-5 grid gap-3">
            <InsightCard
              icon={Target}
              title="Conversão em lead"
              value={formatPercent(
                leadRate,
              )}
              description="Percentual de visitas que geraram pedido de orçamento."
            />

            <InsightCard
              icon={Trophy}
              title="Fechamento"
              value={formatPercent(
                closeRate,
              )}
              description="Percentual dos leads marcados como convertidos."
            />

            <InsightCard
              icon={Star}
              title="Avaliações"
              value={formatNumber(
                reviews,
              )}
              description={`Recebidas nos últimos ${period} dias.`}
            />

            <InsightCard
              icon={Eye}
              title="Melhor dia"
              value={
                bestDay &&
                bestDay.visits >
                  0
                  ? bestDay.label
                  : "—"
              }
              description={
                bestDay &&
                bestDay.visits >
                  0
                  ? `${formatNumber(
                      bestDay.visits,
                    )} visitas`
                  : "Ainda não há visitas suficientes."
              }
            />
          </div>
        </section>
      </div>

      {/* RESUMO */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-slate-950">
              Resumo do período
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Principais números dos
              últimos {period} dias.
            </p>
          </div>

          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-500"
          >
            Ver leads

            <ArrowUpRight
              size={16}
            />
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SmallMetric
            label="CTR WhatsApp"
            value={formatPercent(
              whatsappRate,
            )}
          />

          <SmallMetric
            label="Conversão em lead"
            value={formatPercent(
              leadRate,
            )}
          />

          <SmallMetric
            label="Conversão dos leads"
            value={formatPercent(
              closeRate,
            )}
          />

          <SmallMetric
            label="Avaliações recebidas"
            value={formatNumber(
              reviews,
            )}
          />
        </div>
      </section>
    </>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
}: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
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

      <strong className="mt-5 block text-3xl font-bold text-slate-950">
        {value}
      </strong>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </article>
  );
}

function AnalyticsChart({
  data,
  period,
}: {
  data: DailyStat[];
  period: Period;
}) {
  const maxValue =
    Math.max(
      1,
      ...data.flatMap(
        (day) => [
          day.visits,
          day.whatsapp,
          day.leads,
        ],
      ),
    );

  const labelEvery =
    period === 7
      ? 1
      : period === 30
        ? 5
        : 15;

  return (
    <div className="mt-7 overflow-x-auto pb-2">
      <div
        className={
          period === 90
            ? "min-w-[1100px]"
            : "min-w-[720px]"
        }
      >
        <div className="relative flex h-72 items-end gap-1 border-b border-slate-200">
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
            <span className="border-t border-dashed border-slate-100" />
            <span className="border-t border-dashed border-slate-100" />
            <span className="border-t border-dashed border-slate-100" />
            <span className="border-t border-dashed border-slate-100" />
            <span className="border-t border-dashed border-slate-100" />
          </div>

          {data.map(
            (day) => (
              <div
                key={day.key}
                title={`${day.label} — ${day.visits} visitas, ${day.whatsapp} WhatsApp, ${day.leads} leads`}
                className="group relative z-10 flex h-full min-w-0 flex-1 items-end justify-center gap-[1px]"
              >
                <Bar
                  value={
                    day.visits
                  }
                  max={maxValue}
                  className="bg-blue-600"
                />

                <Bar
                  value={
                    day.whatsapp
                  }
                  max={maxValue}
                  className="bg-emerald-500"
                />

                <Bar
                  value={
                    day.leads
                  }
                  max={maxValue}
                  className="bg-violet-500"
                />
              </div>
            ),
          )}
        </div>

        <div className="mt-3 flex">
          {data.map(
            (
              day,
              index,
            ) => (
              <div
                key={day.key}
                className="min-w-0 flex-1 text-center"
              >
                {index %
                  labelEvery ===
                  0 ||
                index ===
                  data.length -
                    1 ? (
                  <span className="text-[10px] text-slate-400 sm:text-xs">
                    {day.label}
                  </span>
                ) : null}
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function Bar({
  value,
  max,
  className,
}: {
  value: number;
  max: number;
  className: string;
}) {
  const height =
    value <= 0
      ? "0%"
      : `${Math.max(
          3,
          (value / max) * 100,
        )}%`;

  return (
    <div
      className={`w-[30%] max-w-2 rounded-t-sm transition-opacity group-hover:opacity-70 ${className}`}
      style={{
        height,
      }}
    />
  );
}

function Legend({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2.5 w-2.5 rounded-sm ${className}`}
      />

      {label}
    </div>
  );
}

function FunnelRow({
  label,
  value,
  percent,
  className,
}: {
  label: string;
  value: number;
  percent: number;
  className: string;
}) {
  const safePercent =
    Math.max(
      0,
      Math.min(
        percent,
        100,
      ),
    );

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-sm">
        <span className="font-medium text-slate-700">
          {label}
        </span>

        <div className="text-right">
          <strong className="text-slate-950">
            {formatNumber(
              value,
            )}
          </strong>

          <span className="ml-2 text-xs text-slate-400">
            {formatPercent(
              safePercent,
            )}
          </span>
        </div>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${className}`}
          style={{
            width: `${safePercent}%`,
          }}
        />
      </div>
    </div>
  );
}

function InsightCard({
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
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon size={16} />

        <span className="text-xs font-medium">
          {title}
        </span>
      </div>

      <strong className="mt-2 block text-xl text-slate-950">
        {value}
      </strong>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function SmallMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-4">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <strong className="mt-1 block text-lg text-slate-950">
        {value}
      </strong>
    </div>
  );
}