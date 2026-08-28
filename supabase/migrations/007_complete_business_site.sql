-- Nelled Business 007 - campos extras da landing e analytics
alter table public.tenant_settings
  add column if not exists hero_eyebrow text,
  add column if not exists hero_secondary_text text,
  add column if not exists instagram_username text,
  add column if not exists facebook_username text,
  add column if not exists tiktok_username text,
  add column if not exists service_cities text,
  add column if not exists stat_1_value text,
  add column if not exists stat_1_label text,
  add column if not exists stat_2_value text,
  add column if not exists stat_2_label text,
  add column if not exists stat_3_value text,
  add column if not exists stat_3_label text,
  add column if not exists about_image_url text;

create table if not exists public.site_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_type text not null check (event_type in ('page_view','whatsapp_click','lead')),
  created_at timestamptz not null default now()
);
create index if not exists site_events_tenant_created_idx on public.site_events(tenant_id, created_at desc);
alter table public.site_events enable row level security;
create policy "public can insert site events" on public.site_events for insert to anon, authenticated with check (true);
create policy "tenant admins can read site events" on public.site_events for select to authenticated using (public.is_tenant_admin(tenant_id));
