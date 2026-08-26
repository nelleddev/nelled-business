-- =========================================================
-- NELLED BUSINESS
-- Migration 003
-- Conteúdo comercial das empresas
-- =========================================================


-- =========================================================
-- FUNÇÃO GENÉRICA PARA updated_at
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- =========================================================
-- SERVICES
-- Serviços oferecidos pela empresa
-- =========================================================

create table public.services (
  id uuid primary key default gen_random_uuid(),

  tenant_id uuid not null
    references public.tenants(id)
    on delete cascade,

  name text not null,
  slug text not null,

  short_description text,
  description text,

  image_url text,
  image_public_id text,

  icon text,

  whatsapp_message text,

  position integer not null default 0,

  is_featured boolean not null default false,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (tenant_id, slug)
);

create index services_tenant_id_idx
  on public.services(tenant_id);

create index services_tenant_active_idx
  on public.services(tenant_id, is_active);

create index services_tenant_position_idx
  on public.services(tenant_id, position);


-- =========================================================
-- GALLERY CATEGORIES
-- Categorias da galeria
-- =========================================================

create table public.gallery_categories (
  id uuid primary key default gen_random_uuid(),

  tenant_id uuid not null
    references public.tenants(id)
    on delete cascade,

  name text not null,
  slug text not null,

  position integer not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (tenant_id, slug)
);

create index gallery_categories_tenant_id_idx
  on public.gallery_categories(tenant_id);

create index gallery_categories_position_idx
  on public.gallery_categories(tenant_id, position);


-- =========================================================
-- GALLERY ITEMS
-- Fotos de trabalhos
-- =========================================================

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),

  tenant_id uuid not null
    references public.tenants(id)
    on delete cascade,

  category_id uuid
    references public.gallery_categories(id)
    on delete set null,

  service_id uuid
    references public.services(id)
    on delete set null,

  title text,
  description text,

  image_url text not null,
  image_public_id text not null,

  alt_text text,

  city text,

  position integer not null default 0,

  is_featured boolean not null default false,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index gallery_items_tenant_id_idx
  on public.gallery_items(tenant_id);

create index gallery_items_category_id_idx
  on public.gallery_items(category_id);

create index gallery_items_service_id_idx
  on public.gallery_items(service_id);

create index gallery_items_tenant_active_idx
  on public.gallery_items(tenant_id, is_active);

create index gallery_items_tenant_position_idx
  on public.gallery_items(tenant_id, position);


-- =========================================================
-- BEFORE / AFTER
-- Comparações de trabalhos
-- =========================================================

create table public.before_after_items (
  id uuid primary key default gen_random_uuid(),

  tenant_id uuid not null
    references public.tenants(id)
    on delete cascade,

  service_id uuid
    references public.services(id)
    on delete set null,

  title text,
  description text,

  before_image_url text not null,
  before_image_public_id text not null,

  after_image_url text not null,
  after_image_public_id text not null,

  city text,

  position integer not null default 0,

  is_featured boolean not null default false,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index before_after_tenant_id_idx
  on public.before_after_items(tenant_id);

create index before_after_service_id_idx
  on public.before_after_items(service_id);

create index before_after_tenant_position_idx
  on public.before_after_items(tenant_id, position);


-- =========================================================
-- REVIEWS
-- Avaliações enviadas por clientes
-- =========================================================

create table public.reviews (
  id uuid primary key default gen_random_uuid(),

  tenant_id uuid not null
    references public.tenants(id)
    on delete cascade,

  customer_name text not null,

  city text,

  rating smallint not null
    check (rating between 1 and 5),

  comment text not null,

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'approved',
        'rejected'
      )
    ),

  is_featured boolean not null default false,

  approved_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reviews_tenant_id_idx
  on public.reviews(tenant_id);

create index reviews_tenant_status_idx
  on public.reviews(tenant_id, status);

create index reviews_tenant_rating_idx
  on public.reviews(tenant_id, rating);


-- =========================================================
-- FAQ
-- Perguntas frequentes
-- =========================================================

create table public.faq_items (
  id uuid primary key default gen_random_uuid(),

  tenant_id uuid not null
    references public.tenants(id)
    on delete cascade,

  question text not null,
  answer text not null,

  position integer not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index faq_items_tenant_id_idx
  on public.faq_items(tenant_id);

create index faq_items_tenant_position_idx
  on public.faq_items(tenant_id, position);


-- =========================================================
-- LEADS
-- Contatos/orçamentos recebidos pelo site
-- =========================================================

create table public.leads (
  id uuid primary key default gen_random_uuid(),

  tenant_id uuid not null
    references public.tenants(id)
    on delete cascade,

  service_id uuid
    references public.services(id)
    on delete set null,

  name text not null,

  whatsapp text,

  email text,

  message text,

  source text not null default 'website'
    check (
      source in (
        'website',
        'whatsapp',
        'other'
      )
    ),

  status text not null default 'new'
    check (
      status in (
        'new',
        'contacted',
        'converted',
        'archived'
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_tenant_id_idx
  on public.leads(tenant_id);

create index leads_tenant_status_idx
  on public.leads(tenant_id, status);

create index leads_created_at_idx
  on public.leads(created_at desc);


-- =========================================================
-- UPDATED_AT TRIGGERS
-- =========================================================

create trigger services_set_updated_at
before update on public.services
for each row
execute function public.set_updated_at();

create trigger gallery_categories_set_updated_at
before update on public.gallery_categories
for each row
execute function public.set_updated_at();

create trigger gallery_items_set_updated_at
before update on public.gallery_items
for each row
execute function public.set_updated_at();

create trigger before_after_items_set_updated_at
before update on public.before_after_items
for each row
execute function public.set_updated_at();

create trigger reviews_set_updated_at
before update on public.reviews
for each row
execute function public.set_updated_at();

create trigger faq_items_set_updated_at
before update on public.faq_items
for each row
execute function public.set_updated_at();

create trigger leads_set_updated_at
before update on public.leads
for each row
execute function public.set_updated_at();


-- =========================================================
-- RLS
-- Apenas habilitamos aqui.
-- As policies virão na migration 004.
-- =========================================================

alter table public.services
enable row level security;

alter table public.gallery_categories
enable row level security;

alter table public.gallery_items
enable row level security;

alter table public.before_after_items
enable row level security;

alter table public.reviews
enable row level security;

alter table public.faq_items
enable row level security;

alter table public.leads
enable row level security;