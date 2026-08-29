"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentTenant } from "@/lib/auth/get-current-tenant";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_STATUSES = [
  "new",
  "contacted",
  "converted",
  "archived",
] as const;

type LeadStatus =
  (typeof ALLOWED_STATUSES)[number];

function isLeadStatus(
  value: string,
): value is LeadStatus {
  return ALLOWED_STATUSES.includes(
    value as LeadStatus,
  );
}

function revalidateLeads() {
  revalidatePath("/admin");
  revalidatePath("/admin/leads");
  revalidatePath("/admin/analytics");
}

function redirectWithMessage(
  type: "success" | "error",
  message: string,
): never {
  redirect(
    `/admin/leads?${type}=${encodeURIComponent(
      message,
    )}`,
  );
}

export async function updateLeadStatus(
  formData: FormData,
) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    redirect("/admin/login");
  }

  const id = String(
    formData.get("id") ?? "",
  ).trim();

  const status = String(
    formData.get("status") ?? "",
  ).trim();

  if (!id) {
    redirectWithMessage(
      "error",
      "Lead inválido.",
    );
  }

  if (!isLeadStatus(status)) {
    redirectWithMessage(
      "error",
      "Status inválido.",
    );
  }

  const supabase =
    await createClient();

  const { error } = await supabase
    .from("leads")
    .update({
      status,
    })
    .eq("id", id)
    .eq(
      "tenant_id",
      currentTenant.tenant.id,
    );

  if (error) {
    redirectWithMessage(
      "error",
      error.message,
    );
  }

  revalidateLeads();

  redirectWithMessage(
    "success",
    "Status atualizado com sucesso.",
  );
}

export async function deleteLead(
  formData: FormData,
) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    redirect("/admin/login");
  }

  const id = String(
    formData.get("id") ?? "",
  ).trim();

  if (!id) {
    redirectWithMessage(
      "error",
      "Lead inválido.",
    );
  }

  const supabase =
    await createClient();

  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("id", id)
    .eq(
      "tenant_id",
      currentTenant.tenant.id,
    );

  if (error) {
    redirectWithMessage(
      "error",
      error.message,
    );
  }

  revalidateLeads();

  redirectWithMessage(
    "success",
    "Lead excluído com sucesso.",
  );
}