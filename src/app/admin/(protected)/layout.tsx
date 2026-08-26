import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { getCurrentTenant } from "@/lib/auth/get-current-tenant";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    redirect("/admin/login");
  }

  const {
    tenant,
    settings,
  } = currentTenant;

  const companyName =
    settings?.company_name ??
    settings?.short_name ??
    tenant.name;

  return (
    <AdminShell
      companyName={companyName}
      tenantSlug={tenant.slug}
      tenantStatus={tenant.status}
    >
      {children}
    </AdminShell>
  );
}