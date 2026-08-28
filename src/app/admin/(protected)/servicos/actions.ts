"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentTenant } from "@/lib/auth/get-current-tenant";
import { createClient } from "@/lib/supabase/server";

const serviceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe o nome do serviço.")
    .max(120),
  short_description: z
    .string()
    .trim()
    .max(500, "A descrição curta pode ter até 500 caracteres."),
  description: z
    .string()
    .trim()
    .max(3000, "A descrição completa pode ter até 3000 caracteres."),
  icon: z
    .string()
    .trim()
    .max(40),
  is_featured: z.boolean(),
  is_active: z.boolean(),
});

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseService(formData: FormData) {
  return serviceSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    short_description: String(
      formData.get("short_description") ?? "",
    ),
    description: String(formData.get("description") ?? ""),
    icon: String(formData.get("icon") ?? ""),
    is_featured: formData.get("is_featured") === "on",
    is_active: formData.get("is_active") === "on",
  });
}

function servicePayload(data: z.infer<typeof serviceSchema>) {
  return {
    name: data.name,
    slug: slugify(data.name),
    short_description: data.short_description || null,
    description: data.description || null,
    icon: data.icon || null,
    is_featured: data.is_featured,
    is_active: data.is_active,
  };
}

export async function createService(formData: FormData) {
  const currentTenant = await getCurrentTenant();

  if (!currentTenant) {
    redirect("/admin/login");
  }

  const parsed = parseService(formData);

  if (!parsed.success) {
    redirect(
      `/admin/servicos?error=${encodeURIComponent(
        parsed.error.issues[0]?.message ?? "Dados inválidos.",
      )}`,
    );
  }

  const supabase = await createClient();

  const { data: lastService } = await supabase
    .from("services")
    .select("position")
    .eq("tenant_id", currentTenant.tenant.id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const position = (lastService?.position ?? -1) + 1;

  const { error } = await supabase.from("services").insert({
    tenant_id: currentTenant.tenant.id,
    ...servicePayload(parsed.data),
    position,
  });

  if (error) {
    redirect(
      `/admin/servicos?error=${encodeURIComponent(
        error.code === "23505"
          ? "Já existe um serviço com esse nome."
          : "Não foi possível cadastrar o serviço.",
      )}`,
    );
  }

  revalidatePath("/");
  revalidatePath("/admin/servicos");
  redirect("/admin/servicos?success=Serviço cadastrado com sucesso");
}

export async function updateService(formData: FormData) {
  const currentTenant = await getCurrentTenant();

  if (!currentTenant) {
    redirect("/admin/login");
  }

  const id = String(formData.get("id") ?? "");
  const parsed = parseService(formData);

  if (!id || !parsed.success) {
    redirect(
      `/admin/servicos?error=${encodeURIComponent(
        parsed.success
          ? "Serviço inválido."
          : parsed.error.issues[0]?.message ?? "Dados inválidos.",
      )}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .update(servicePayload(parsed.data))
    .eq("id", id)
    .eq("tenant_id", currentTenant.tenant.id);

  if (error) {
    redirect(
      `/admin/servicos?edit=${encodeURIComponent(id)}&error=${encodeURIComponent(
        error.code === "23505"
          ? "Já existe outro serviço com esse nome."
          : "Não foi possível atualizar o serviço.",
      )}`,
    );
  }

  revalidatePath("/");
  revalidatePath("/admin/servicos");
  redirect("/admin/servicos?success=Serviço atualizado com sucesso");
}

export async function toggleService(formData: FormData) {
  const currentTenant = await getCurrentTenant();

  if (!currentTenant) {
    redirect("/admin/login");
  }

  const id = String(formData.get("id") ?? "");
  const currentValue = String(formData.get("is_active") ?? "") === "true";
  const supabase = await createClient();

  await supabase
    .from("services")
    .update({ is_active: !currentValue })
    .eq("id", id)
    .eq("tenant_id", currentTenant.tenant.id);

  revalidatePath("/");
  revalidatePath("/admin/servicos");
}

export async function moveService(formData: FormData) {
  const currentTenant = await getCurrentTenant();

  if (!currentTenant) {
    redirect("/admin/login");
  }

  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");

  if (!id || !["up", "down"].includes(direction)) {
    return;
  }

  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("id, position")
    .eq("tenant_id", currentTenant.tenant.id)
    .order("position", { ascending: true });

  if (!services?.length) {
    return;
  }

  const index = services.findIndex((service) => service.id === id);
  const targetIndex = direction === "up" ? index - 1 : index + 1;

  if (index < 0 || targetIndex < 0 || targetIndex >= services.length) {
    return;
  }

  const current = services[index];
  const target = services[targetIndex];

  await Promise.all([
    supabase
      .from("services")
      .update({ position: target.position })
      .eq("id", current.id)
      .eq("tenant_id", currentTenant.tenant.id),
    supabase
      .from("services")
      .update({ position: current.position })
      .eq("id", target.id)
      .eq("tenant_id", currentTenant.tenant.id),
  ]);

  revalidatePath("/");
  revalidatePath("/admin/servicos");
}

export async function deleteService(formData: FormData) {
  const currentTenant = await getCurrentTenant();

  if (!currentTenant) {
    redirect("/admin/login");
  }

  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();

  await supabase
    .from("services")
    .delete()
    .eq("id", id)
    .eq("tenant_id", currentTenant.tenant.id);

  revalidatePath("/");
  revalidatePath("/admin/servicos");
}
