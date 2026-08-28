import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getCurrentTenant } from "@/lib/auth/get-current-tenant";
import { createClient } from "@/lib/supabase/server";

import { leadAction } from "./actions";

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
  services:
    | LeadService
    | LeadService[];
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

  return services?.name ?? "Outro";
}

export default async function LeadsPage() {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    return null;
  }

  const supabase = await createClient();

  const { data } = await supabase
    .from("leads")
    .select(
      `
        id,
        name,
        whatsapp,
        location,
        message,
        status,
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

  return (
    <>
      <AdminPageHeader
        title="Leads"
        description="Pedidos de orçamento recebidos pelo formulário do site."
      />

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[950px] text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              {[
                "Cliente",
                "WhatsApp",
                "Local",
                "Serviço",
                "Mensagem",
                "Status",
                "Ações",
              ].map((column) => (
                <th
                  key={column}
                  className="p-4 font-semibold text-slate-700"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="border-t border-slate-100"
              >
                <td className="p-4 font-medium">
                  {lead.name}
                </td>

                <td className="p-4">
                  <a
                    href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {lead.whatsapp}
                  </a>
                </td>

                <td className="p-4">
                  {lead.location ??
                    "—"}
                </td>

                <td className="p-4">
                  {getServiceName(
                    lead.services,
                  )}
                </td>

                <td className="max-w-xs p-4 text-slate-500">
                  {lead.message ?? "—"}
                </td>

                <td className="p-4">
                  {lead.status}
                </td>

                <td className="p-4">
                  <form
                    action={leadAction}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="hidden"
                      name="id"
                      value={lead.id}
                    />

                    <select
                      name="action"
                      defaultValue={
                        lead.status
                      }
                      className="rounded-lg border border-slate-200 p-2"
                    >
                      <option value="new">
                        Novo
                      </option>

                      <option value="contacted">
                        Contatado
                      </option>

                      <option value="converted">
                        Convertido
                      </option>

                      <option value="archived">
                        Arquivado
                      </option>
                    </select>

                    <button className="rounded-lg bg-slate-900 px-3 py-2 text-white">
                      Salvar
                    </button>

                    <button
                      name="action"
                      value="delete"
                      className="rounded-lg border border-red-200 px-3 py-2 text-red-600"
                    >
                      Excluir
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {leads.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            Nenhum lead recebido.
          </div>
        )}
      </div>
    </>
  );
}