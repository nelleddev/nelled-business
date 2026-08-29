"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentTenant } from "@/lib/auth/get-current-tenant";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  title: z
    .string()
    .trim()
    .min(2)
    .max(150),

  description: z
    .string()
    .trim()
    .min(2)
    .max(500),

  name_label: z
    .string()
    .trim()
    .min(1)
    .max(80),

  name_placeholder: z
    .string()
    .trim()
    .min(1)
    .max(120),

  whatsapp_label: z
    .string()
    .trim()
    .min(1)
    .max(80),

  whatsapp_placeholder: z
    .string()
    .trim()
    .min(1)
    .max(120),

  location_label: z
    .string()
    .trim()
    .min(1)
    .max(80),

  location_placeholder: z
    .string()
    .trim()
    .min(1)
    .max(120),

  service_label: z
    .string()
    .trim()
    .min(1)
    .max(80),

  service_placeholder: z
    .string()
    .trim()
    .min(1)
    .max(120),

  message_label: z
    .string()
    .trim()
    .min(1)
    .max(80),

  message_placeholder: z
    .string()
    .trim()
    .min(1)
    .max(250),

  submit_button_text: z
    .string()
    .trim()
    .min(1)
    .max(120),

  whatsapp_intro_message: z
    .string()
    .trim()
    .min(1)
    .max(1000),

  is_active: z.boolean(),
});

export async function updateContactForm(
  formData: FormData,
) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    redirect("/admin/login");
  }

  const raw = {
    title: String(
      formData.get("title") ?? "",
    ),

    description: String(
      formData.get(
        "description",
      ) ?? "",
    ),

    name_label: String(
      formData.get(
        "name_label",
      ) ?? "",
    ),

    name_placeholder: String(
      formData.get(
        "name_placeholder",
      ) ?? "",
    ),

    whatsapp_label: String(
      formData.get(
        "whatsapp_label",
      ) ?? "",
    ),

    whatsapp_placeholder:
      String(
        formData.get(
          "whatsapp_placeholder",
        ) ?? "",
      ),

    location_label: String(
      formData.get(
        "location_label",
      ) ?? "",
    ),

    location_placeholder:
      String(
        formData.get(
          "location_placeholder",
        ) ?? "",
      ),

    service_label: String(
      formData.get(
        "service_label",
      ) ?? "",
    ),

    service_placeholder:
      String(
        formData.get(
          "service_placeholder",
        ) ?? "",
      ),

    message_label: String(
      formData.get(
        "message_label",
      ) ?? "",
    ),

    message_placeholder:
      String(
        formData.get(
          "message_placeholder",
        ) ?? "",
      ),

    submit_button_text:
      String(
        formData.get(
          "submit_button_text",
        ) ?? "",
      ),

    whatsapp_intro_message:
      String(
        formData.get(
          "whatsapp_intro_message",
        ) ?? "",
      ),

    is_active:
      formData.get(
        "is_active",
      ) === "on",
  };

  const parsed =
    schema.safeParse(raw);

  if (!parsed.success) {
    redirect(
      `/admin/formulario?error=${encodeURIComponent(
        "Revise os campos do formulário.",
      )}`,
    );
  }

  const supabase =
    await createClient();

  const { error } =
    await supabase
      .from(
        "tenant_contact_form_settings",
      )
      .update(
        parsed.data,
      )
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
  revalidatePath("/admin");
  revalidatePath(
    "/admin/formulario",
  );

  redirect(
    `/admin/formulario?success=${encodeURIComponent(
      "Formulário atualizado com sucesso.",
    )}`,
  );
}