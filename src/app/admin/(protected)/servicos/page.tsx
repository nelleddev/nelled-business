import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { FormMessage } from "@/components/admin/form-message";
import {
  SERVICE_ICON_OPTIONS,
  ServiceIcon,
} from "@/components/service-icon";
import { getCurrentTenant } from "@/lib/auth/get-current-tenant";
import { createClient } from "@/lib/supabase/server";

import {
  createService,
  deleteService,
  moveService,
  toggleService,
  updateService,
} from "./actions";

type ServicesPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
    edit?: string;
  }>;
};

type Service = {
  id: string;
  name: string;
  short_description: string | null;
  description: string | null;
  icon: string | null;
  position: number;
  is_active: boolean;
  is_featured: boolean;
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const currentTenant = await getCurrentTenant();

  if (!currentTenant) {
    return null;
  }

  const params = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from("services")
    .select(
      "id, name, short_description, description, icon, position, is_active, is_featured",
    )
    .eq("tenant_id", currentTenant.tenant.id)
    .order("position", { ascending: true });

  const services = (data ?? []) as Service[];
  const editingService = params.edit
    ? services.find((service) => service.id === params.edit) ?? null
    : null;

  return (
    <>
      <AdminPageHeader
        title="Serviços"
        description="Cadastre, edite e organize as especialidades exibidas no site."
      />

      <FormMessage success={params.success} error={params.error} />

      <div className="grid gap-6 xl:grid-cols-[410px_minmax(0,1fr)]">
        <section className="self-start rounded-2xl border border-slate-200 bg-white p-6 xl:sticky xl:top-24">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {editingService ? (
                <Pencil size={19} className="text-blue-600" />
              ) : (
                <Plus size={19} className="text-blue-600" />
              )}

              <h2 className="font-semibold text-slate-950">
                {editingService ? "Editar serviço" : "Novo serviço"}
              </h2>
            </div>

            {editingService && (
              <Link
                href="/admin/servicos"
                title="Cancelar edição"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={18} />
              </Link>
            )}
          </div>

          <form
            action={editingService ? updateService : createService}
            className="mt-6 space-y-5"
          >
            {editingService && (
              <input type="hidden" name="id" value={editingService.id} />
            )}

            <label className="block text-sm font-medium text-slate-700">
              Nome
              <input
                name="name"
                required
                defaultValue={editingService?.name ?? ""}
                placeholder="Ex.: Forro de gesso liso"
                className={inputClass}
              />
            </label>

            <fieldset>
              <legend className="text-sm font-medium text-slate-700">
                Ícone
              </legend>

              <div className="mt-3 grid grid-cols-4 gap-2">
                {SERVICE_ICON_OPTIONS.map((option) => {
                  const inputId = `icon-${option.value}`;

                  return (
                    <label
                      key={option.value}
                      htmlFor={inputId}
                      title={option.label}
                      className="cursor-pointer"
                    >
                      <input
                        id={inputId}
                        type="radio"
                        name="icon"
                        value={option.value}
                        defaultChecked={
                          editingService?.icon
                            ? editingService.icon === option.value
                            : option.value === "briefcase"
                        }
                        className="peer sr-only"
                      />

                      <span className="flex min-h-16 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-blue-700 hover:bg-slate-50">
                        <ServiceIcon name={option.value} className="h-6 w-6" />
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <label className="block text-sm font-medium text-slate-700">
              Descrição curta
              <textarea
                name="short_description"
                rows={3}
                maxLength={500}
                defaultValue={editingService?.short_description ?? ""}
                placeholder="Texto curto exibido no card da especialidade."
                className={inputClass}
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Descrição completa
              <textarea
                name="description"
                rows={5}
                maxLength={3000}
                defaultValue={editingService?.description ?? ""}
                placeholder="Detalhes adicionais do serviço."
                className={inputClass}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="is_featured"
                  defaultChecked={editingService?.is_featured ?? false}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Destaque
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked={editingService?.is_active ?? true}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Ativo
              </label>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              {editingService ? "Salvar alterações" : "Adicionar serviço"}
            </button>
          </form>
        </section>

        <section>
          {!services.length ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="font-semibold text-slate-800">
                Nenhum serviço cadastrado
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Cadastre a primeira especialidade usando o formulário ao lado.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((service, index) => (
                <article
                  key={service.id}
                  className={`rounded-2xl border bg-white p-5 transition ${
                    editingService?.id === service.id
                      ? "border-blue-400 ring-2 ring-blue-100"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <div className="flex min-w-0 flex-1 gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                        <ServiceIcon
                          name={service.icon}
                          className="h-6 w-6 stroke-[1.7]"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-950">
                            {service.name}
                          </h3>

                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              service.is_active
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {service.is_active ? "Ativo" : "Oculto"}
                          </span>

                          {service.is_featured && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                              <Star size={12} fill="currentColor" />
                              Destaque
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {service.short_description ||
                            "Adicione uma descrição curta para deixar o card do site mais completo."}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      <form action={moveService}>
                        <input type="hidden" name="id" value={service.id} />
                        <input type="hidden" name="direction" value="up" />
                        <button
                          type="submit"
                          disabled={index === 0}
                          title="Mover para cima"
                          className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ArrowUp size={17} />
                        </button>
                      </form>

                      <form action={moveService}>
                        <input type="hidden" name="id" value={service.id} />
                        <input type="hidden" name="direction" value="down" />
                        <button
                          type="submit"
                          disabled={index === services.length - 1}
                          title="Mover para baixo"
                          className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ArrowDown size={17} />
                        </button>
                      </form>

                      <Link
                        href={`/admin/servicos?edit=${encodeURIComponent(service.id)}`}
                        title="Editar"
                        className="rounded-xl border border-slate-200 p-2.5 text-blue-600 transition hover:bg-blue-50"
                      >
                        <Pencil size={17} />
                      </Link>

                      <form action={toggleService}>
                        <input type="hidden" name="id" value={service.id} />
                        <input
                          type="hidden"
                          name="is_active"
                          value={String(service.is_active)}
                        />
                        <button
                          type="submit"
                          title={service.is_active ? "Ocultar" : "Ativar"}
                          className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50"
                        >
                          {service.is_active ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}
                        </button>
                      </form>

                      <form action={deleteService}>
                        <input type="hidden" name="id" value={service.id} />
                        <button
                          type="submit"
                          title="Excluir"
                          className="rounded-xl border border-red-100 p-2.5 text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
