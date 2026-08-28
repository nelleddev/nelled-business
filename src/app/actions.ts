"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";

export type ReviewActionState = {
  status:
    | "idle"
    | "success"
    | "error";
  message: string;
};

export async function submitLead(
  formData: FormData,
) {
  const tenantId = String(
    formData.get("tenant_id") ?? "",
  );

  const targetWhatsapp = String(
    formData.get(
      "target_whatsapp",
    ) ?? "",
  ).replace(/\D/g, "");

  const intro = String(
    formData.get("intro") ??
      "Olá! Gostaria de solicitar um orçamento.",
  ).trim();

  const name = String(
    formData.get("name") ?? "",
  ).trim();

  const whatsapp = String(
    formData.get("whatsapp") ?? "",
  ).trim();

  const location = String(
    formData.get("location") ?? "",
  ).trim();

  const serviceId = String(
    formData.get("service_id") ?? "",
  ).trim();

  const message = String(
    formData.get("message") ?? "",
  ).trim();

  if (
    !tenantId ||
    !name ||
    !whatsapp ||
    !targetWhatsapp
  ) {
    redirect("/#orcamento");
  }

  const db =
    createAdminSupabaseClient();

  let serviceName = "Outro";

  if (serviceId) {
    const { data: service } =
      await db
        .from("services")
        .select("name")
        .eq("id", serviceId)
        .eq(
          "tenant_id",
          tenantId,
        )
        .maybeSingle();

    if (service?.name) {
      serviceName =
        service.name;
    }
  }

  await db.from("leads").insert({
    tenant_id: tenantId,

    service_id:
      serviceId || null,

    name,
    whatsapp,

    location:
      location || null,

    message:
      message || null,

    source: "website",
    status: "new",
  });

  await db
    .from("site_events")
    .insert({
      tenant_id: tenantId,
      event_type:
        "whatsapp_click",
    });

  const whatsappMessage = [
    intro,
    "",
    `Nome: ${name}`,
    `WhatsApp: ${whatsapp}`,
    location
      ? `Local: ${location}`
      : null,
    `Serviço: ${serviceName}`,
    message ? "" : null,
    message
      ? `Mensagem: ${message}`
      : null,
  ]
    .filter(
      (
        line,
      ): line is string =>
        line !== null,
    )
    .join("\n");

  redirect(
    `https://wa.me/${targetWhatsapp}?text=${encodeURIComponent(
      whatsappMessage,
    )}`,
  );
}

export async function submitReview(
  _previousState: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  /*
   * Honeypot.
   * Usuário normal nunca preenche este campo.
   */
  const website = String(
    formData.get("website") ?? "",
  ).trim();

  if (website) {
    return {
      status: "success",
      message:
        "Avaliação enviada com sucesso.",
    };
  }

  const customerName = String(
    formData.get(
      "customer_name",
    ) ?? "",
  ).trim();

  const city = String(
    formData.get("city") ?? "",
  ).trim();

  const comment = String(
    formData.get("comment") ?? "",
  ).trim();

  const ratingValue = Number(
    formData.get("rating"),
  );

  if (
    customerName.length < 2
  ) {
    return {
      status: "error",
      message:
        "Informe seu nome.",
    };
  }

  if (
    customerName.length > 100
  ) {
    return {
      status: "error",
      message:
        "O nome informado é muito longo.",
    };
  }

  if (
    city.length > 120
  ) {
    return {
      status: "error",
      message:
        "A cidade informada é muito longa.",
    };
  }

  if (
    !Number.isInteger(
      ratingValue,
    ) ||
    ratingValue < 1 ||
    ratingValue > 5
  ) {
    return {
      status: "error",
      message:
        "Escolha uma nota de 1 a 5 estrelas.",
    };
  }

  if (comment.length < 10) {
    return {
      status: "error",
      message:
        "Conte um pouco mais sobre sua experiência.",
    };
  }

  if (comment.length > 1500) {
    return {
      status: "error",
      message:
        "A avaliação deve ter no máximo 1500 caracteres.",
    };
  }

  /*
   * Descobrimos o tenant pelo domínio.
   * Não confiamos em tenant_id vindo
   * de um input escondido do navegador.
   */
  const headerStore =
    await headers();

  const hostname =
    headerStore.get(
      "x-forwarded-host",
    ) ??
    headerStore.get("host") ??
    "";

  const resolvedTenant =
    await resolveTenant(
      hostname,
    );

  if (!resolvedTenant) {
    return {
      status: "error",
      message:
        "Não foi possível identificar a empresa.",
    };
  }

  const db =
    createAdminSupabaseClient();

  const { error } = await db
    .from("reviews")
    .insert({
      tenant_id:
        resolvedTenant.tenant.id,

      customer_name:
        customerName,

      city:
        city || null,

      rating: ratingValue,

      comment,

      status: "pending",

      is_featured: false,

      approved_at: null,
    });

  if (error) {
    console.error(
      "[submitReview]",
      error.message,
    );

    return {
      status: "error",
      message:
        "Não foi possível enviar sua avaliação. Tente novamente.",
    };
  }

  revalidatePath("/");
  revalidatePath(
    "/admin/avaliacoes",
  );

  return {
    status: "success",
    message:
      "Obrigado! Sua avaliação foi enviada e será publicada após aprovação.",
  };
}