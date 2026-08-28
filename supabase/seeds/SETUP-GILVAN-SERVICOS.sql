-- Execute uma única vez no SQL Editor do Supabase para completar
-- os serviços já cadastrados do tenant Gilvan Forros.

update public.services
set
  short_description = 'Acabamento uniforme, ideal para pintura e ambientes que pedem simplicidade e elegância.',
  icon = 'briefcase'
where tenant_id = 'da7fccae-e562-46a9-a9ac-319264e08f12'
  and lower(name) = lower('Forro de gesso liso');

update public.services
set
  short_description = 'Estrutura em placas para maior resistência, isolamento acústico e térmico.',
  icon = 'grid'
where tenant_id = 'da7fccae-e562-46a9-a9ac-319264e08f12'
  and lower(name) = lower('Forro em drywall');

update public.services
set
  short_description = 'Divisão de ambientes com rapidez de execução e ótimo acabamento, sem obra pesada.',
  icon = 'columns'
where tenant_id = 'da7fccae-e562-46a9-a9ac-319264e08f12'
  and lower(name) = lower('Divisórias de drywall');

update public.services
set
  short_description = 'Rebaixos com iluminação indireta para valorizar o ambiente e criar um acabamento moderno.',
  icon = 'sparkles'
where tenant_id = 'da7fccae-e562-46a9-a9ac-319264e08f12'
  and lower(name) = lower('Sanca com iluminação embutida');

update public.services
set
  short_description = 'Correção de trincas, infiltrações e ajustes em forros, divisórias e acabamentos já instalados.',
  icon = 'wrench'
where tenant_id = 'da7fccae-e562-46a9-a9ac-319264e08f12'
  and lower(name) = lower('Reparos e manutenção');
