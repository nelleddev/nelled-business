-- =========================================================
-- NELLED BUSINESS
-- Migration 004
-- Configuração do formulário de orçamento
-- Ajustes em leads
-- =========================================================


-- =========================================================
-- AJUSTES NA TABELA LEADS
-- =========================================================

alter table public.leads
  drop column if exists email;

alter table public.leads
  add column if not exists location text;

alter table public.leads
  alter column whatsapp set not null;


-- =========================================================
-- CONFIGURAÇÕES DO FORMULÁRIO DE ORÇAMENTO
-- =========================================================

create table public.tenant_contact_form_settings (
  id uuid primary key default gen_random_uuid(),

  tenant_id uuid not null unique
    references public.tenants(id)
    on delete cascade,

  title text not null default 'Vamos planejar seu ambiente?',

  description text not null default
    'Preencha os dados abaixo ou fale direto pelo WhatsApp.',

  name_label text not null default 'Nome',
  name_placeholder text not null default 'Seu nome',

  whatsapp_label text not null default 'WhatsApp',
  whatsapp_placeholder text not null default 'WhatsApp com DDD',

  location_label text not null default 'Cidade / bairro',
  location_placeholder text not null default 'Cidade / bairro',

  service_label text not null default 'Tipo de serviço',
  service_placeholder text not null default 'Tipo de serviço',

  message_label text not null default 'Mensagem',
  message_placeholder text not null default
    'Conte um pouco sobre o que você precisa',

  submit_button_text text not null default
    'Enviar e continuar no WhatsApp',

  whatsapp_intro_message text not null default
    'Olá! Gostaria de solicitar um orçamento.',

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create index tenant_contact_form_settings_tenant_id_idx
  on public.tenant_contact_form_settings(tenant_id);


-- =========================================================
-- UPDATED_AT
-- =========================================================

create trigger tenant_contact_form_settings_set_updated_at
before update on public.tenant_contact_form_settings
for each row
execute function public.set_updated_at();


-- =========================================================
-- RLS
-- Policies serão adicionadas na próxima migration
-- =========================================================

alter table public.tenant_contact_form_settings
enable row level security;