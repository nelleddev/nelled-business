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

  const params = await searchParams;

  const supabase = await createClient();

  const { data: settings } =
    await supabase
      .from(
        "tenant_contact_form_settings",
      )
      .select("*")
      .eq(
        "tenant_id",
        currentTenant.tenant.id,
      )
      .single();

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
        description="Personalize os textos exibidos no formulário de orçamento e a mensagem inicial do WhatsApp."
      />

      <FormMessage
        success={params.success}
        error={params.error}
      />

      <form
        action={updateContactForm}
        className="space-y-6"
      >
        <Section title="Apresentação">
          <Field
            name="title"
            label="Título"
            value={settings.title}
          />

          <Field
            name="description"
            label="Descrição"
            value={settings.description}
            textarea
          />
        </Section>

        <Section title="Nome">
          <Field
            name="name_label"
            label="Nome do campo"
            value={settings.name_label}
          />

          <Field
            name="name_placeholder"
            label="Placeholder"
            value={
              settings.name_placeholder
            }
          />
        </Section>

        <Section title="WhatsApp">
          <Field
            name="whatsapp_label"
            label="Nome do campo"
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
        </Section>

        <Section title="Cidade / bairro">
          <Field
            name="location_label"
            label="Nome do campo"
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
        </Section>

        <Section title="Tipo de serviço">
          <Field
            name="service_label"
            label="Nome do campo"
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
        </Section>

        <Section title="Mensagem">
          <Field
            name="message_label"
            label="Nome do campo"
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
        </Section>

        <Section title="Envio">
          <Field
            name="submit_button_text"
            label="Texto do botão"
            value={
              settings.submit_button_text
            }
          />

          <Field
            name="whatsapp_intro_message"
            label="Mensagem inicial do WhatsApp"
            value={
              settings.whatsapp_intro_message
            }
            textarea
          />
        </Section>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Salvar formulário
          </button>
        </div>
      </form>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="font-semibold text-slate-950">
        {title}
      </h2>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

function Field({
  name,
  label,
  value,
  textarea = false,
}: {
  name: string;
  label: string;
  value: string;
  textarea?: boolean;
}) {
  const className =
    "mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}

      {textarea ? (
        <textarea
          name={name}
          rows={4}
          required
          defaultValue={value}
          className={className}
        />
      ) : (
        <input
          name={name}
          required
          defaultValue={value}
          className={className}
        />
      )}
    </label>
  );
}