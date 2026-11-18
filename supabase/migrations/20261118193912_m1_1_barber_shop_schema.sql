-- M1.1: platform_settings (single-row config) + barbers (many per shop) + services
-- + bookable_slots (no status column) + barber_photos. Applied via apply_migration.
create table if not exists public.platform_settings (
  id            boolean primary key default true check (id),   -- always true -> at most one row
  currency      text not null default 'twd',                   -- money columns are integers in THIS currency
  currency_minor_units integer not null default 0,             -- DISPLAY decimals only, not Stripe's exponent
  slot_minutes  integer not null default 30 check (slot_minutes > 0),
  updated_at    timestamptz not null default now()
);
insert into public.platform_settings (id) values (true) on conflict (id) do nothing;

create table if not exists public.barbers (
  id          uuid primary key default gen_random_uuid(),
  shop_id     uuid not null references public.profiles(id) on delete cascade,  -- NOT unique: many barbers per shop
  name        text not null,
  intro       text,
  address     text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_barbers_shop on public.barbers(shop_id);

create table if not exists public.services (
  id             uuid primary key default gen_random_uuid(),
  barber_id      uuid not null references public.barbers(id) on delete cascade,
  name           text not null,
  category       text not null check (category in ('cut','color','perm','beard')),
  price          integer not null check (price >= 0),          -- whole units of platform_settings.currency
  required_slots integer not null check (required_slots >= 1), -- consecutive bookable_slots needed
  created_at     timestamptz not null default now()
);

create table if not exists public.bookable_slots (
  id         uuid primary key default gen_random_uuid(),
  barber_id  uuid not null references public.barbers(id) on delete cascade,
  starts_at  timestamptz not null,
  ends_at    timestamptz not null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists public.barber_photos (
  id           uuid primary key default gen_random_uuid(),
  barber_id    uuid not null references public.barbers(id) on delete cascade,
  storage_path text not null,           -- '<barber_id>/<uuid>.<ext>' in the barber-photos bucket
  caption      text,
  is_featured  boolean not null default false,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists idx_services_barber       on public.services(barber_id);
create index if not exists idx_bookable_slots_barber on public.bookable_slots(barber_id);
create index if not exists idx_photos_barber         on public.barber_photos(barber_id);
create index if not exists idx_photos_featured       on public.barber_photos(barber_id, is_featured);
