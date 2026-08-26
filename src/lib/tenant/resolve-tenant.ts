import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type {
  ResolvedTenant,
  Tenant,
  TenantSettings,
} from "@/types/tenant";

function normalizeHostname(hostname: string) {
  return hostname
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/:\d+$/, "")
    .replace(/^www\./, "");
}

export async function resolveTenant(
  hostname: string,
): Promise<ResolvedTenant | null> {
  const normalizedHostname = normalizeHostname(hostname);

  const supabase = createAdminSupabaseClient();

  // Desenvolvimento local
  if (
    normalizedHostname === "localhost" ||
    normalizedHostname === "127.0.0.1"
  ) {
    const defaultTenantSlug =
      process.env.DEFAULT_TENANT_SLUG;

    if (!defaultTenantSlug) {
      return null;
    }

    const { data: tenant, error: tenantError } =
      await supabase
        .from("tenants")
        .select("*")
        .eq("slug", defaultTenantSlug)
        .eq("status", "active")
        .maybeSingle();

    if (tenantError || !tenant) {
      return null;
    }

    const { data: settings } = await supabase
      .from("tenant_settings")
      .select("*")
      .eq("tenant_id", tenant.id)
      .maybeSingle();

    return {
      tenant: tenant as Tenant,
      settings: settings as TenantSettings | null,
      domain: normalizedHostname,
      isCustomDomain: false,
    };
  }

  const { data: domainRecord, error: domainError } =
    await supabase
      .from("tenant_domains")
      .select(
        `
          domain,
          type,
          tenant_id,
          tenants!inner (
            id,
            name,
            slug,
            status,
            created_at,
            updated_at
          )
        `,
      )
      .eq("domain", normalizedHostname)
      .maybeSingle();

  if (domainError || !domainRecord) {
    return null;
  }

  const tenant = Array.isArray(domainRecord.tenants)
    ? domainRecord.tenants[0]
    : domainRecord.tenants;

  if (!tenant || tenant.status !== "active") {
    return null;
  }

  const { data: settings } = await supabase
    .from("tenant_settings")
    .select("*")
    .eq("tenant_id", domainRecord.tenant_id)
    .maybeSingle();

  return {
    tenant: tenant as Tenant,
    settings: settings as TenantSettings | null,
    domain: normalizedHostname,
    isCustomDomain:
      domainRecord.type === "custom",
  };
}