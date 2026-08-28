alter table public.tenant_settings
  add column if not exists about_highlight_1 text,
  add column if not exists about_highlight_2 text,
  add column if not exists about_highlight_3 text;

update public.tenant_settings as settings
set
  about_highlight_1 = 'Orçamento sem compromisso',
  about_highlight_2 = 'Materiais de qualidade',
  about_highlight_3 = 'Prazo combinado em contrato'
from public.tenants as tenant
where
  settings.tenant_id = tenant.id
  and tenant.slug = 'gilvanforros';