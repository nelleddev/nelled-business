"use server";

import { redirect } from "next/navigation";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";

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
        .eq("tenant_id", tenantId)
        .maybeSingle();

    if (service?.name) {
      serviceName = service.name;
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
    message
      ? ""
      : null,
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