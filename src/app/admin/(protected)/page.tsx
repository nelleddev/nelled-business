import {
  ClipboardList,
  Eye,
  MessageCircle,
  Star,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getCurrentTenant } from "@/lib/auth/get-current-tenant";

export default async function AdminPage() {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    return null;
  }

  const companyName =
    currentTenant.settings?.company_name ??
    currentTenant.tenant.name;

  const cards = [
    {
      label: "Visitas",
      value: "0",
      description: "Últimos 30 dias",
      icon: Eye,
    },
    {
      label: "WhatsApp",
      value: "0",
      description: "Cliques registrados",
      icon: MessageCircle,
    },
    {
      label: "Leads",
      value: "0",
      description: "Orçamentos recebidos",
      icon: ClipboardList,
    },
    {
      label: "Avaliações",
      value: "0",
      description: "Avaliações publicadas",
      icon: Star,
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description={`Acompanhe o desempenho e as principais informações da ${companyName}.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {card.label}
                </p>

                <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
                  <Icon size={18} />
                </div>
              </div>

              <p className="mt-5 text-3xl font-bold text-slate-950">
                {card.value}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2">
          <h2 className="font-semibold text-slate-900">
            Visitas e conversões
          </h2>

          <div className="mt-6 flex min-h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-500">
              Os gráficos aparecerão quando ativarmos o Analytics.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">
            Resumo
          </h2>

          <div className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">
                Empresa
              </span>

              <span className="font-medium text-slate-900">
                {companyName}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">
                Perfil
              </span>

              <span className="font-medium text-slate-900">
                {currentTenant.membership.role}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">
                Status
              </span>

              <span className="font-semibold text-emerald-600">
                Ativo
              </span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}