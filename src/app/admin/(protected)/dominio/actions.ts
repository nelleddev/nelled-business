"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentTenant } from "@/lib/auth/get-current-tenant";
import { createClient } from "@/lib/supabase/server";

function redirectWithMessage(
  type: "success" | "error",
  message: string,
): never {
  redirect(
    `/admin/dominio?${type}=${encodeURIComponent(
      message,
    )}`,
  );
}

function normalizeDomain(
  value: string,
) {
  let domain = value
    .trim()
    .toLowerCase();

  domain = domain.replace(
    /^https?:\/\//,
    "",
  );

  domain = domain.replace(
    /^www\./,
    "",
  );

  domain = domain.split("/")[0];
  domain = domain.split("?")[0];
  domain = domain.split("#")[0];

  return domain
    .replace(/\.$/, "")
    .trim();
}

function isValidDomain(
  value: string,
) {
  if (
    value.length < 4 ||
    value.length > 253
  ) {
    return false;
  }

  if (
    value === "localhost" ||
    value.includes(" ")
  ) {
    return false;
  }

  const labels =
    value.split(".");

  if (labels.length < 2) {
    return false;
  }

  return labels.every(
    (label) => {
      if (
        label.length < 1 ||
        label.length > 63
      ) {
        return false;
      }

      return /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(
        label,
      );
    },
  );
}

async function requireOwner() {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    redirect("/admin/login");
  }

  if (
    currentTenant.membership
      .role !== "owner"
  ) {
    redirectWithMessage(
      "error",
      "Somente o proprietário da empresa pode gerenciar domínios.",
    );
  }

  return currentTenant;
}

function revalidateDomains() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(
    "/admin/dominio",
  );
}

export async function addCustomDomain(
  formData: FormData,
) {
  const currentTenant =
    await requireOwner();

  const rawDomain =
    String(
      formData.get(
        "domain",
      ) ?? "",
    );

  const domain =
    normalizeDomain(
      rawDomain,
    );

  if (!domain) {
    redirectWithMessage(
      "error",
      "Informe um domínio.",
    );
  }

  if (!isValidDomain(domain)) {
    redirectWithMessage(
      "error",
      "Informe um domínio válido, como minhaempresa.com.br.",
    );
  }

  if (
    domain.endsWith(
      ".nelled.app",
    ) ||
    domain === "nelled.app"
  ) {
    redirectWithMessage(
      "error",
      "O endereço Nelled é administrado automaticamente. Para esta área, informe um domínio próprio.",
    );
  }

  const supabase =
    await createClient();

  const {
    data: existingDomain,
  } = await supabase
    .from("tenant_domains")
    .select(
      `
        id,
        tenant_id,
        domain
      `,
    )
    .eq(
      "domain",
      domain,
    )
    .maybeSingle();

  if (existingDomain) {
    if (
      existingDomain.tenant_id ===
      currentTenant.tenant.id
    ) {
      redirectWithMessage(
        "error",
        "Este domínio já está cadastrado para sua empresa.",
      );
    }

    redirectWithMessage(
      "error",
      "Este domínio já está sendo utilizado.",
    );
  }

  const { error } =
    await supabase
      .from(
        "tenant_domains",
      )
      .insert({
        tenant_id:
          currentTenant.tenant
            .id,

        domain,
        type: "custom",
        status: "pending",
        is_primary: false,
        verified_at: null,
      });

  if (error) {
    if (
      error.code === "23505"
    ) {
      redirectWithMessage(
        "error",
        "Este domínio já está cadastrado.",
      );
    }

    redirectWithMessage(
      "error",
      error.message,
    );
  }

  revalidateDomains();

  redirectWithMessage(
    "success",
    "Domínio adicionado. Agora configure o DNS para iniciar a validação.",
  );
}

export async function removeCustomDomain(
  formData: FormData,
) {
  const currentTenant =
    await requireOwner();

  const id =
    String(
      formData.get("id") ??
        "",
    ).trim();

  if (!id) {
    redirectWithMessage(
      "error",
      "Domínio inválido.",
    );
  }

  const supabase =
    await createClient();

  const {
    data: domain,
    error: queryError,
  } = await supabase
    .from("tenant_domains")
    .select(
      `
        id,
        type,
        is_primary
      `,
    )
    .eq(
      "id",
      id,
    )
    .eq(
      "tenant_id",
      currentTenant.tenant.id,
    )
    .maybeSingle();

  if (
    queryError ||
    !domain
  ) {
    redirectWithMessage(
      "error",
      queryError?.message ??
        "Domínio não encontrado.",
    );
  }

  if (
    domain.type !==
    "custom"
  ) {
    redirectWithMessage(
      "error",
      "O endereço Nelled padrão não pode ser removido.",
    );
  }

  if (domain.is_primary) {
    redirectWithMessage(
      "error",
      "O domínio principal não pode ser removido antes de outro endereço ser definido como principal.",
    );
  }

  const {
    error: deleteError,
  } = await supabase
    .from("tenant_domains")
    .delete()
    .eq("id", id)
    .eq(
      "tenant_id",
      currentTenant.tenant.id,
    );

  if (deleteError) {
    redirectWithMessage(
      "error",
      deleteError.message,
    );
  }

  revalidateDomains();

  redirectWithMessage(
    "success",
    "Domínio removido.",
  );
}