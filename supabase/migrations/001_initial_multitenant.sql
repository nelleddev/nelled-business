create extension if not exists "pgcrypto";

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tenant_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null unique
    references public.tenants(id) on delete cascade,

  company_name text,
  short_name text,
  slogan text,

  logo_light_url text,
  logo_dark_url text,
  favicon_url text,

  primary_color text default '#111827',
  secondary_color text default '#ffffff',
  accent_color text default '#2563eb',

  whatsapp text,
  email text,
  instagram_url text,
  facebook_url text,

  city text,
  state text,
  service_area text,

  hero_title text,
  hero_description text,
  hero_image_url text,

  about_title text,
  about_content text,

  seo_title text,
  seo_description text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tenant_domains (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null
    references public.tenants(id) on delete cascade,

  domain text not null unique,
  type text not null default 'subdomain'
    check (type in ('subdomain', 'custom')),
  status text not null default 'pending'
    check (status in ('pending', 'verified', 'failed')),
  is_primary boolean not null default false,

  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.tenant_users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null
    references public.tenants(id) on delete cascade,

  user_id uuid not null
    references auth.users(id) on delete cascade,

  role text not null default 'admin'
    check (role in ('owner', 'admin', 'editor')),

  created_at timestamptz not null default now(),

  unique (tenant_id, user_id)
);

create index tenant_domains_tenant_id_idx
  on public.tenant_domains(tenant_id);

create index tenant_users_tenant_id_idx
  on public.tenant_users(tenant_id);

create index tenant_users_user_id_idx
  on public.tenant_users(user_id);

alter table public.tenants enable row level security;
alter table public.tenant_settings enable row level security;
alter table public.tenant_domains enable row level security;
alter table public.tenant_users enable row level security;