-- M1.1 RLS: own-row CRUD for shops, public read for browse, platform_settings
-- world-read/admin-write, bank fields on profiles readable by the shop + admin only.
alter table public.platform_settings enable row level security;
alter table public.barbers           enable row level security;
alter table public.services          enable row level security;
alter table public.bookable_slots    enable row level security;
alter table public.barber_photos     enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p
                 where p.id = auth.uid() and p.role = 'admin');
$$;

create policy "platform_settings_read"  on public.platform_settings for select using (true);
create policy "platform_settings_admin" on public.platform_settings for all using (public.is_admin()) with check (public.is_admin());

create policy "shops_select_public" on public.barbers for select using (true);
create policy "shops_insert_own" on public.barbers for insert with check (auth.uid() = shop_id);
create policy "shops_update_own" on public.barbers for update using (auth.uid() = shop_id) with check (auth.uid() = shop_id);
create policy "shops_delete_own" on public.barbers for delete using (auth.uid() = shop_id);

create policy "services_select_public" on public.services for select using (true);
create policy "services_write_own" on public.services
  for all using (
    exists (select 1 from public.barbers s where s.id = services.barber_id and s.shop_id = auth.uid())
  ) with check (
    exists (select 1 from public.barbers s where s.id = services.barber_id and s.shop_id = auth.uid())
  );

create policy "slots_select_public" on public.bookable_slots for select using (true);
create policy "slots_write_own" on public.bookable_slots
  for all using (
    exists (select 1 from public.barbers s where s.id = bookable_slots.barber_id and s.shop_id = auth.uid())
  ) with check (
    exists (select 1 from public.barbers s where s.id = bookable_slots.barber_id and s.shop_id = auth.uid())
  );

create policy "photos_select_public" on public.barber_photos for select using (true);
create policy "photos_write_own" on public.barber_photos
  for all using (
    exists (select 1 from public.barbers s where s.id = barber_photos.barber_id and s.shop_id = auth.uid())
  ) with check (
    exists (select 1 from public.barbers s where s.id = barber_photos.barber_id and s.shop_id = auth.uid())
  );

-- public browse projection; security_invoker so it respects barbers' RLS
create or replace view public.barbers_public with (security_invoker = on) as
  select id, shop_id, name, intro, address, created_at
  from public.barbers;

-- admin read path for the shop-level bank fields on profiles
create policy "profiles_select_admin" on public.profiles
  for select using (public.is_admin());

-- profiles_update_own lets a user update their own row, which alone would let them
-- self-promote to 'admin'. A signed-in non-admin may only set role to customer|shop.
-- Migrations / service-role (auth.uid() is null) are unaffected.
create or replace function public.guard_profile_role()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and new.role not in ('customer','shop')
     and not public.is_admin() then
    raise exception 'role % cannot be self-assigned', new.role using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_role
  before update on public.profiles
  for each row execute function public.guard_profile_role();
