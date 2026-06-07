create extension if not exists "pgcrypto";

create type merchant_type as enum ('restaurant', 'cafe', 'coiffeur', 'barber', 'gym', 'other');
create type user_role as enum ('super_admin', 'merchant');
create type card_status as enum ('active', 'reward_available', 'redeemed', 'disabled');
create type transaction_action as enum ('add_points', 'redeem_reward', 'custom_adjustment');
create type redemption_mode as enum ('reset', 'deduct');

create table public.merchants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type merchant_type not null default 'other',
  logo_url text,
  primary_color text not null default '#FFD600',
  reward_required_points integer not null check (reward_required_points > 0),
  reward_name text not null,
  description text not null,
  reward_redemption_mode redemption_mode not null default 'reset',
  public_slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  merchant_id uuid references public.merchants(id) on delete cascade,
  role user_role not null,
  email text not null unique,
  created_at timestamptz not null default now(),
  constraint merchant_required_for_merchant_role check (
    role = 'super_admin' or merchant_id is not null
  )
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  first_name text not null,
  phone text not null,
  email text,
  created_at timestamptz not null default now()
);

create table public.loyalty_cards (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  current_points integer not null default 0 check (current_points >= 0),
  status card_status not null default 'active',
  wallet_serial_number text not null unique,
  apple_pass_registered boolean not null default false,
  google_object_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  card_id uuid not null references public.loyalty_cards(id) on delete cascade,
  action transaction_action not null,
  points integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  title text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index customers_merchant_id_idx on public.customers(merchant_id);
create index loyalty_cards_merchant_id_idx on public.loyalty_cards(merchant_id);
create index loyalty_cards_customer_id_idx on public.loyalty_cards(customer_id);
create index transactions_merchant_id_idx on public.transactions(merchant_id);
create index transactions_card_id_idx on public.transactions(card_id);
create index notifications_merchant_id_idx on public.notifications(merchant_id);

grant usage on schema public to anon, authenticated, service_role;
grant select on public.merchants to anon, authenticated;
grant all privileges on public.merchants to service_role;
grant select, insert, update, delete on public.users to authenticated;
grant all privileges on public.users to service_role;
grant select, insert, update, delete on public.customers to authenticated;
grant all privileges on public.customers to service_role;
grant select, insert, update, delete on public.loyalty_cards to authenticated;
grant all privileges on public.loyalty_cards to service_role;
grant select, insert, update, delete on public.transactions to authenticated;
grant all privileges on public.transactions to service_role;
grant select, insert, update, delete on public.notifications to authenticated;
grant all privileges on public.notifications to service_role;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger loyalty_cards_touch_updated_at
before update on public.loyalty_cards
for each row execute procedure public.touch_updated_at();

alter table public.merchants enable row level security;
alter table public.users enable row level security;
alter table public.customers enable row level security;
alter table public.loyalty_cards enable row level security;
alter table public.transactions enable row level security;
alter table public.notifications enable row level security;

create or replace function public.current_app_user()
returns public.users
language sql
security definer
set search_path = public
stable
as $$
  select * from public.users where id = auth.uid();
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists(select 1 from public.users where id = auth.uid() and role = 'super_admin');
$$;

create or replace function public.current_merchant_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select merchant_id from public.users where id = auth.uid();
$$;

create policy "super admin can manage merchants"
on public.merchants for all
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "merchants can read own merchant"
on public.merchants for select
using (id = public.current_merchant_id());

create policy "public can read merchants for enrollment"
on public.merchants for select
using (true);

create policy "users read own profile"
on public.users for select
using (id = auth.uid() or public.is_super_admin());

create policy "super admin manages users"
on public.users for all
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "merchant tenant customers"
on public.customers for all
using (merchant_id = public.current_merchant_id() or public.is_super_admin())
with check (merchant_id = public.current_merchant_id() or public.is_super_admin());

create policy "merchant tenant cards"
on public.loyalty_cards for all
using (merchant_id = public.current_merchant_id() or public.is_super_admin())
with check (merchant_id = public.current_merchant_id() or public.is_super_admin());

create policy "merchant tenant transactions"
on public.transactions for all
using (merchant_id = public.current_merchant_id() or public.is_super_admin())
with check (merchant_id = public.current_merchant_id() or public.is_super_admin());

create policy "merchant tenant notifications"
on public.notifications for all
using (merchant_id = public.current_merchant_id() or public.is_super_admin())
with check (merchant_id = public.current_merchant_id() or public.is_super_admin());

-- Bootstrap a super admin after creating the auth user in Supabase Auth:
-- insert into public.users (id, role, email)
-- values ('AUTH_USER_UUID', 'super_admin', 'admin@loyalpass.app');
