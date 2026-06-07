alter table public.merchants
add column if not exists card_background_url text,
add column if not exists card_logo_url text,
add column if not exists card_strip_url text,
add column if not exists card_thumbnail_url text,
add column if not exists card_text_color text not null default '#111111',
add column if not exists card_qr_position text not null default 'bottom_right',
add column if not exists card_design_config jsonb not null default '{}'::jsonb;

grant all privileges on public.merchants to service_role;
