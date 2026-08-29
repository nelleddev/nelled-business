import {
  CheckCircle2,
  ClipboardList,
  Eye,
  EyeOff,
  MessageCircle,
  Send,
  UserRound,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { FormMessage } from "@/components/admin/form-message";
import { getCurrentTenant } from "@/lib/auth/get-current-tenant";
import { createClient } from "@/lib/supabase/server";

import { updateContactForm } from "./actions";

type ContactFormPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

export default async function ContactFormPage({
  searchParams,
}: ContactFormPageProps) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    return null;
  }

  const params =
    await searchParams;

  const supabase =
    await createClient();

  const [
    settingsResult,
    servicesResult,
  ] = await Promise.all([
    supabase
      .from(
        "tenant_contact_form_settings",
      )
      .select("*")
      .eq(
        "tenant_id",
        currentTenant.tenant.id,
      )
      .single(),

    supabase
      .from("services")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "tenant_id",
        currentTenant.tenant.id,
      )
      .eq(
        "is_active",
        true,
      ),
  ]);

  const settings =
    settingsResult.data;

  const activeServices =
    servicesResult.count ?? 0;

  if (!settings) {
    return (
      <>
        <AdminPageHeader
          title="Formulário"
          description="Personalize o formulário de orçamento."
        />

        <FormMessage error="As configurações do formulário não foram encontradas." />
      </>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Formulário"
        description="Personalize o formulário de orçamento e a mensagem enviada para o WhatsApp."
      />

      <FormMessage
        success={params.success}
        error={params.error}
      />

      {/* RESUMO */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Status"
          value={
            settings.is_active
              ? "Ativo"
              : "Inativo"
          }
          description={
            settings.is_active
              ? "visível na landing page"
              : "oculto da landing page"
          }
          icon={
            settings.is_active
              ? Eye
              : EyeOff
          }
          iconClass={
            settings.is_active
              ? "bg-emerald-50 text-emerald-600"
              : "bg-slate-100 text-slate-600"
          }
        />

        <SummaryCard
          title="Campos"
          value="5"
          description="dados solicitados ao cliente"
          icon={ClipboardList}
          iconClass="bg-blue-50 text-blue-600"
        />

        <SummaryCard
          title="Serviços"
          value={String(
            activeServices,
          )}
          description="opções ativas no seletor"
          icon={CheckCircle2}
          iconClass="bg-violet-50 text-violet-600"
        />
      </div>

      <form
        action={updateContactForm}
        className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"
      >
        <div className="space-y-6">
          {/* APRESENTAÇÃO */}
          <Section
            title="Apresentação"
            description="Textos exibidos ao lado do formulário de orçamento."
          >
            <Field
              name="title"
              label="Título"
              value={settings.title}
              className="md:col-span-2"
            />

            <Field
              name="description"
              label="Descrição"
              value={
                settings.description
              }
              textarea
              className="md:col-span-2"
            />
          </Section>

          {/* DADOS DO CLIENTE */}
          <Section
            title="Dados do cliente"
            description="Configure os nomes e exemplos mostrados nos campos."
          >
            <FieldGroup
              icon={UserRound}
              title="Nome"
            >
              <Field
                name="name_label"
                label="Rótulo"
                value={
                  settings.name_label
                }
              />

              <Field
                name="name_placeholder"
                label="Placeholder"
                value={
                  settings.name_placeholder
                }
              />
            </FieldGroup>

            <FieldGroup
              icon={MessageCircle}
              title="WhatsApp"
            >
              <Field
                name="whatsapp_label"
                label="Rótulo"
                value={
                  settings.whatsapp_label
                }
              />

              <Field
                name="whatsapp_placeholder"
                label="Placeholder"
                value={
                  settings.whatsapp_placeholder
                }
              />
            </FieldGroup>

            <FieldGroup
              title="Cidade / bairro"
            >
              <Field
                name="location_label"
                label="Rótulo"
                value={
                  settings.location_label
                }
              />

              <Field
                name="location_placeholder"
                label="Placeholder"
                value={
                  settings.location_placeholder
                }
              />
            </FieldGroup>

            <FieldGroup
              title="Tipo de serviço"
            >
              <Field
                name="service_label"
                label="Rótulo"
                value={
                  settings.service_label
                }
              />

              <Field
                name="service_placeholder"
                label="Placeholder"
                value={
                  settings.service_placeholder
                }
              />
            </FieldGroup>

            <FieldGroup
              title="Mensagem"
              className="md:col-span-2"
            >
              <Field
                name="message_label"
                label="Rótulo"
                value={
                  settings.message_label
                }
              />

              <Field
                name="message_placeholder"
                label="Placeholder"
                value={
                  settings.message_placeholder
                }
              />
            </FieldGroup>
          </Section>

          {/* ENVIO */}
          <Section
            title="Envio"
            description="Configure o botão e a mensagem que inicia a conversa no WhatsApp."
          >
            <Field
              name="submit_button_text"
              label="Texto do botão"
              value={
                settings.submit_button_text
              }
              className="md:col-span-2"
            />

            <Field
              name="whatsapp_intro_message"
              label="Mensagem inicial do WhatsApp"
              value={
                settings.whatsapp_intro_message
              }
              textarea
              className="md:col-span-2"
            />

            <div className="md:col-span-2 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex gap-3">
                <MessageCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <p className="text-xs leading-5 text-blue-800">
                  Depois do envio, os dados do cliente são registrados em Leads e o WhatsApp é aberto com a mensagem preenchida.
                </p>
              </div>
            </div>
          </Section>
        </div>

        {/* COLUNA LATERAL */}
        <aside className="space-y-6 self-start xl:sticky xl:top-24">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-950">
              Publicação
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Controle se a seção de orçamento aparece na landing page.
            </p>

            <label
              className={`mt-5 flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 ${
                settings.is_active
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Formulário ativo
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Desmarque para ocultar temporariamente a seção.
                </p>
              </div>

              <input
                type="checkbox"
                name="is_active"
                defaultChecked={
                  settings.is_active
                }
                className="h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300"
              />
            </label>
          </section>

          {/* PREVIEW */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-950">
              Estrutura atual
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Prévia dos campos exibidos no site.
            </p>

            <div className="mt-5 space-y-3">
              <PreviewField
                label={
                  settings.name_label
                }
                placeholder={
                  settings.name_placeholder
                }
              />

              <PreviewField
                label={
                  settings.whatsapp_label
                }
                placeholder={
                  settings.whatsapp_placeholder
                }
              />

              <PreviewField
                label={
                  settings.location_label
                }
                placeholder={
                  settings.location_placeholder
                }
              />

              <PreviewField
                label={
                  settings.service_label
                }
                placeholder={
                  settings.service_placeholder
                }
              />

              <PreviewField
                label={
                  settings.message_label
                }
                placeholder={
                  settings.message_placeholder
                }
              />

              <div className="rounded-lg bg-blue-600 px-4 py-2.5 text-center text-xs font-semibold text-white">
                {
                  settings.submit_button_text
                }
              </div>
            </div>
          </section>

          <button
            type="submit"
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <Send size={16} />

            Salvar formulário
          </button>
        </aside>
      </form>
    </>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="font-semibold text-slate-950">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

function FieldGroup({
  title,
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  icon?: typeof UserRound;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 p-4 ${className}`}
    >
      <div className="mb-4 flex items-center gap-2">
        {Icon && (
          <Icon
            size={16}
            className="text-blue-600"
          />
        )}

        <h3 className="text-sm font-semibold text-slate-800">
          {title}
        </h3>
      </div>

      <div className="grid gap-4">
        {children}
      </div>
    </div>
  );
}

function Field({
  name,
  label,
  value,
  textarea = false,
  className = "",
}: {
  name: string;
  label: string;
  value: string;
  textarea?: boolean;
  className?: string;
}) {
  const fieldClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

  return (
    <label
      className={`block text-sm font-medium text-slate-700 ${className}`}
    >
      {label}

      {textarea ? (
        <textarea
          name={name}
          rows={4}
          required
          defaultValue={value}
          className={fieldClass}
        />
      ) : (
        <input
          name={name}
          required
          defaultValue={value}
          className={fieldClass}
        />
      )}
    </label>
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
  value: string;
  description: string;
  icon: typeof Eye;
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

      <strong className="mt-4 block text-xl font-bold text-slate-950">
        {value}
      </strong>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </article>
  );
}

function PreviewField({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-400">
        {placeholder}
      </div>
    </div>
  );
}