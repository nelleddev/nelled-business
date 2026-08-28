"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentTenant } from "@/lib/auth/get-current-tenant";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().min(2).max(500),

  name_label: z.string().trim().min(1).max(80),
  name_placeholder: z.string().trim().min(1).max(120),

  whatsapp_label: z.string().trim().min(1).max(80),
  whatsapp_placeholder: z.string().trim().min(1).max(120),

  location_label: z.string().trim().min(1).max(80),
  location_placeholder: z.string().trim().min(1).max(120),

  service_label: z.string().trim().min(1).max(80),
  service_placeholder: z.string().trim().min(1).max(120),

  message_label: z.string().trim().min(1).max(80),
  message_placeholder: z.string().trim().min(1).max(250),

  submit_button_text: z.string().trim().min(1).max(120),

  whatsapp_intro_message: z.string().trim().min(1).max(1000),
});

export async function updateContactForm(
  formData: FormData,
) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    redirect("/admin/login");
  }

  const raw = Object.fromEntries(
    [
      "title",
      "description",
      "name_label",
      "name_placeholder",
      "whatsapp_label",
      "whatsapp_placeholder",
      "location_label",
      "location_placeholder",
      "service_label",
      "service_placeholder",
      "message_label",
      "message_placeholder",
      "submit_button_text",
      "whatsapp_intro_message",
    ].map((key) => [
      key,
      String(formData.get(key) ?? ""),
    ]),
  );

  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    redirect(
      `/admin/formulario?error=${encodeURIComponent(
        "Revise os campos do formulário.",
      )}`,
    );
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from(
      "tenant_contact_form_settings",
    )
    .update(parsed.data)
    .eq(
      "tenant_id",
      currentTenant.tenant.id,
    );

  if (error) {
    redirect(
      `/admin/formulario?error=${encodeURIComponent(
        "Não foi possível salvar o formulário.",
      )}`,
    );
  }

  revalidatePath("/");
  revalidatePath("/admin/formulario");

  redirect(
    "/admin/formulario?success=Formulário atualizado",
  );
}