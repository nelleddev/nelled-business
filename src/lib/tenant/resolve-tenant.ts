import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type {
  ResolvedTenant,
  Tenant,
  TenantSettings,
} from "@/types/tenant";

function normalizeHostname(
  hostname: string,
) {
  return hostname
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/:\d+$/, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

function isPrivateNetworkIp(hostname: string) {
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return true;
  }

  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return true;
  }

  const match = hostname.match(
    /^172\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/,
  );

  if (match) {
    const secondOctet = Number(match[1]);

    return (
      secondOctet >= 16 &&
      secondOctet <= 31
    );
  }

  return false;
}

function shouldUseDefaultTenant(
  hostname: string,
) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".vercel.app") ||
    (
      process.env.NODE_ENV ===
        "development" &&
      isPrivateNetworkIp(hostname)
    )
  );
}

/**
 * Resolve o tenant padrão utilizado em:
 * - localhost
 * - 127.0.0.1
 * - domínios *.vercel.app
 */
async function resolveDefaultTenant(
  hostname: string,
): Promise<ResolvedTenant | null> {
  const defaultSlug =
    process.env.DEFAULT_TENANT_SLUG;

  if (!defaultSlug) {
    console.error(
      "[resolveTenant] DEFAULT_TENANT_SLUG não configurado.",
    );

    return null;
  }

  const supabase =
    createAdminSupabaseClient();

  const {
    data: tenant,
    error: tenantError,
  } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", defaultSlug)
    .eq("status", "active")
    .maybeSingle();

  if (tenantError) {
    console.error(
      "[resolveTenant] Erro ao buscar tenant padrão:",
      tenantError.message,
    );

    return null;
  }

  if (!tenant) {
    console.error(
      `[resolveTenant] Tenant padrão "${defaultSlug}" não encontrado.`,
    );

    return null;
  }

  const {
    data: settings,
    error: settingsError,
  } = await supabase
    .from("tenant_settings")
    .select("*")
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  if (settingsError) {
    console.error(
      "[resolveTenant] Erro ao buscar configurações do tenant padrão:",
      settingsError.message,
    );
  }

  return {
    tenant: tenant as Tenant,

    settings:
      (settings as TenantSettings | null) ??
      null,

    domain: hostname,

    isCustomDomain: false,
  };
}

export async function resolveTenant(
  hostname: string,
): Promise<ResolvedTenant | null> {
  const normalizedHostname =
    normalizeHostname(hostname);

  if (!normalizedHostname) {
    return null;
  }

  /*
   * Localhost e URLs da Vercel utilizam
   * temporariamente o tenant definido por
   * DEFAULT_TENANT_SLUG.
   */
  if (
    shouldUseDefaultTenant(
      normalizedHostname,
    )
  ) {
    return resolveDefaultTenant(
      normalizedHostname,
    );
  }

  const supabase =
    createAdminSupabaseClient();

  /*
   * Domínios cadastrados:
   *
   * gilvanforros.nelled.app
   * empresa.com.br
   */
  const {
    data: domain,
    error: domainError,
  } = await supabase
    .from("tenant_domains")
    .select(
      `
        *,
        tenants!inner (
          *
        )
      `,
    )
    .eq("domain", normalizedHostname)
    .maybeSingle();

  if (domainError) {
    console.error(
      "[resolveTenant] Erro ao resolver domínio:",
      domainError.message,
    );

    return null;
  }

  if (!domain) {
    console.warn(
      `[resolveTenant] Domínio não cadastrado: ${normalizedHostname}`,
    );

    return null;
  }

  /*
   * A relação do Supabase pode chegar
   * como objeto ou array.
   */
  const joinedTenant =
    Array.isArray(domain.tenants)
      ? domain.tenants[0]
      : domain.tenants;

  if (!joinedTenant) {
    console.warn(
      `[resolveTenant] Tenant não encontrado para o domínio: ${normalizedHostname}`,
    );

    return null;
  }

  if (
    joinedTenant.status !== "active"
  ) {
    console.warn(
      `[resolveTenant] Tenant inativo para o domínio: ${normalizedHostname}`,
    );

    return null;
  }

  const {
    data: settings,
    error: settingsError,
  } = await supabase
    .from("tenant_settings")
    .select("*")
    .eq(
      "tenant_id",
      joinedTenant.id,
    )
    .maybeSingle();

  if (settingsError) {
    console.error(
      "[resolveTenant] Erro ao buscar configurações do tenant:",
      settingsError.message,
    );
  }

  return {
    tenant:
      joinedTenant as Tenant,

    settings:
      (settings as TenantSettings | null) ??
      null,

    domain: normalizedHostname,

    isCustomDomain:
      domain.type === "custom",
  };
}