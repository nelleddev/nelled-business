-- =========================================================
-- NELLED BUSINESS
-- Migration 005
-- RLS do conteúdo comercial
-- =========================================================


-- =========================================================
-- FUNÇÃO AUXILIAR
-- Verifica se o usuário pertence ao tenant
-- =========================================================

create or replace function public.is_tenant_member(
  target_tenant_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_users tu
    where tu.tenant_id = target_tenant_id
      and tu.user_id = auth.uid()
  );
$$;


-- =========================================================
-- FUNÇÃO AUXILIAR
-- Verifica se é owner/admin
-- =========================================================

create or replace function public.is_tenant_admin(
  target_tenant_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_users tu
    where tu.tenant_id = target_tenant_id
      and tu.user_id = auth.uid()
      and tu.role in ('owner', 'admin')
  );
$$;


-- =========================================================
-- SERVICES
-- Público lê apenas ativos
-- Admin gerencia sua empresa
-- =========================================================

create policy "public can read active services"
on public.services
for select
to anon, authenticated
using (
  is_active = true
);

create policy "tenant admins can insert services"
on public.services
for insert
to authenticated
with check (
  public.is_tenant_admin(tenant_id)
);

create policy "tenant admins can update services"
on public.services
for update
to authenticated
using (
  public.is_tenant_admin(tenant_id)
)
with check (
  public.is_tenant_admin(tenant_id)
);

create policy "tenant admins can delete services"
on public.services
for delete
to authenticated
using (
  public.is_tenant_admin(tenant_id)
);


-- =========================================================
-- GALLERY CATEGORIES
-- =========================================================

create policy "public can read active gallery categories"
on public.gallery_categories
for select
to anon, authenticated
using (
  is_active = true
);

create policy "tenant admins can insert gallery categories"
on public.gallery_categories
for insert
to authenticated
with check (
  public.is_tenant_admin(tenant_id)
);

create policy "tenant admins can update gallery categories"
on public.gallery_categories
for update
to authenticated
using (
  public.is_tenant_admin(tenant_id)
)
with check (
  public.is_tenant_admin(tenant_id)
);

create policy "tenant admins can delete gallery categories"
on public.gallery_categories
for delete
to authenticated
using (
  public.is_tenant_admin(tenant_id)
);


-- =========================================================
-- GALLERY ITEMS
-- =========================================================

create policy "public can read active gallery items"
on public.gallery_items
for select
to anon, authenticated
using (
  is_active = true
);

create policy "tenant admins can insert gallery items"
on public.gallery_items
for insert
to authenticated
with check (
  public.is_tenant_admin(tenant_id)
);

create policy "tenant admins can update gallery items"
on public.gallery_items
for update
to authenticated
using (
  public.is_tenant_admin(tenant_id)
)
with check (
  public.is_tenant_admin(tenant_id)
);

create policy "tenant admins can delete gallery items"
on public.gallery_items
for delete
to authenticated
using (
  public.is_tenant_admin(tenant_id)
);


-- =========================================================
-- BEFORE / AFTER
-- =========================================================

create policy "public can read active before after items"
on public.before_after_items
for select
to anon, authenticated
using (
  is_active = true
);

create policy "tenant admins can insert before after items"
on public.before_after_items
for insert
to authenticated
with check (
  public.is_tenant_admin(tenant_id)
);

create policy "tenant admins can update before after items"
on public.before_after_items
for update
to authenticated
using (
  public.is_tenant_admin(tenant_id)
)
with check (
  public.is_tenant_admin(tenant_id)
);

create policy "tenant admins can delete before after items"
on public.before_after_items
for delete
to authenticated
using (
  public.is_tenant_admin(tenant_id)
);


-- =========================================================
-- REVIEWS
-- Público lê apenas aprovadas
-- Público pode enviar novas como pending
-- Admin modera
-- =========================================================

create policy "public can read approved reviews"
on public.reviews
for select
to anon, authenticated
using (
  status = 'approved'
);

create policy "public can submit reviews"
on public.reviews
for insert
to anon, authenticated
with check (
  status = 'pending'
  and is_featured = false
  and approved_at is null
);

create policy "tenant admins can read all reviews"
on public.reviews
for select
to authenticated
using (
  public.is_tenant_admin(tenant_id)
);

create policy "tenant admins can update reviews"
on public.reviews
for update
to authenticated
using (
  public.is_tenant_admin(tenant_id)
)
with check (
  public.is_tenant_admin(tenant_id)
);

create policy "tenant admins can delete reviews"
on public.reviews
for delete
to authenticated
using (
  public.is_tenant_admin(tenant_id)
);


-- =========================================================
-- FAQ
-- =========================================================

create policy "public can read active faq items"
on public.faq_items
for select
to anon, authenticated
using (
  is_active = true
);

create policy "tenant admins can insert faq items"
on public.faq_items
for insert
to authenticated
with check (
  public.is_tenant_admin(tenant_id)
);

create policy "tenant admins can update faq items"
on public.faq_items
for update
to authenticated
using (
  public.is_tenant_admin(tenant_id)
)
with check (
  public.is_tenant_admin(tenant_id)
);

create policy "tenant admins can delete faq items"
on public.faq_items
for delete
to authenticated
using (
  public.is_tenant_admin(tenant_id)
);


-- =========================================================
-- LEADS
-- Público pode enviar
-- Somente admins podem ler/alterar
-- =========================================================

create policy "public can submit leads"
on public.leads
for insert
to anon, authenticated
with check (
  status = 'new'
);

create policy "tenant admins can read leads"
on public.leads
for select
to authenticated
using (
  public.is_tenant_admin(tenant_id)
);

create policy "tenant admins can update leads"
on public.leads
for update
to authenticated
using (
  public.is_tenant_admin(tenant_id)
)
with check (
  public.is_tenant_admin(tenant_id)
);

create policy "tenant admins can delete leads"
on public.leads
for delete
to authenticated
using (
  public.is_tenant_admin(tenant_id)
);


-- =========================================================
-- CONTACT FORM SETTINGS
-- Público pode ler configuração ativa
-- Admin pode gerenciar
-- =========================================================

create policy "public can read active contact form settings"
on public.tenant_contact_form_settings
for select
to anon, authenticated
using (
  is_active = true
);

create policy "tenant admins can insert contact form settings"
on public.tenant_contact_form_settings
for insert
to authenticated
with check (
  public.is_tenant_admin(tenant_id)
);

create policy "tenant admins can update contact form settings"
on public.tenant_contact_form_settings
for update
to authenticated
using (
  public.is_tenant_admin(tenant_id)
)
with check (
  public.is_tenant_admin(tenant_id)
);

create policy "tenant admins can delete contact form settings"
on public.tenant_contact_form_settings
for delete
to authenticated
using (
  public.is_tenant_admin(tenant_id)
);