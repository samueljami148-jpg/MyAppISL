alter table public.merchants
add column if not exists card_image_url text;

alter table public.customers
add column if not exists last_name text;

grant all privileges on public.merchants to service_role;
grant all privileges on public.customers to service_role;
