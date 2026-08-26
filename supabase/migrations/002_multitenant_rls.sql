create policy "tenant users can read their tenants"
on public.tenants
for select
to authenticated
using (
  exists (
    select 1
    from public.tenant_users tu
    where tu.tenant_id = tenants.id
      and tu.user_id = auth.uid()
  )
);

create policy "tenant users can read tenant settings"
on public.tenant_settings
for select
to authenticated
using (
  exists (
    select 1
    from public.tenant_users tu
    where tu.tenant_id = tenant_settings.tenant_id
      and tu.user_id = auth.uid()
  )
);

create policy "tenant admins can update tenant settings"
on public.tenant_settings
for update
to authenticated
using (
  exists (
    select 1
    from public.tenant_users tu
    where tu.tenant_id = tenant_settings.tenant_id
      and tu.user_id = auth.uid()
      and tu.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.tenant_users tu
    where tu.tenant_id = tenant_settings.tenant_id
      and tu.user_id = auth.uid()
      and tu.role in ('owner', 'admin')
  )
);

create policy "tenant users can read domains"
on public.tenant_domains
for select
to authenticated
using (
  exists (
    select 1
    from public.tenant_users tu
    where tu.tenant_id = tenant_domains.tenant_id
      and tu.user_id = auth.uid()
  )
);

create policy "tenant owners can manage domains"
on public.tenant_domains
for all
to authenticated
using (
  exists (
    select 1
    from public.tenant_users tu
    where tu.tenant_id = tenant_domains.tenant_id
      and tu.user_id = auth.uid()
      and tu.role = 'owner'
  )
)
with check (
  exists (
    select 1
    from public.tenant_users tu
    where tu.tenant_id = tenant_domains.tenant_id
      and tu.user_id = auth.uid()
      and tu.role = 'owner'
  )
);

create policy "users can read their tenant memberships"
on public.tenant_users
for select
to authenticated
using (
  user_id = auth.uid()
);