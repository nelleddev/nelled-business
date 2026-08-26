import "server-only";

import { headers } from "next/headers";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { resolveTenant } from "@/lib/tenant/resolve-tenant";

export async function getCurrentTenant() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const headerStore = await headers();

  const hostname =
    headerStore.get("x-forwarded-host") ??
    headerStore.get("host") ??
    "";

  const resolvedTenant = await resolveTenant(hostname);

  if (!resolvedTenant) {
    return null;
  }

  const supabase = await createClient();

  const { data: membership, error } = await supabase
    .from("tenant_users")
    .select("id, tenant_id, user_id, role")
    .eq("tenant_id", resolvedTenant.tenant.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !membership) {
    return null;
  }

  return {
    ...resolvedTenant,
    user,
    membership,
  };
}