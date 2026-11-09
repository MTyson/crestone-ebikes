-- ============================================================================
-- Crestone E-Bike (crestoneebike.com) — Supabase schema, RLS, storage
--
-- Paste into Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Written for a FRESH project. It is safe to re-run (idempotent), but
-- `create table if not exists` will NOT alter a table from an older version of
-- this file. If you ran the old schema, run `drop table public.listings cascade;`
-- first (only OK while it holds no real data).
--
-- Design:
--   * public.listings          -> public, readable by everyone (no contact info)
--   * public.listing_contacts  -> private; revealed one listing at a time via
--                                 get_listing_contact() ("Show contact info")
--   * ceb_approved / inspection_note can only be changed from the Supabase
--     dashboard (Table Editor / SQL), never by the app's anon/authenticated users
--   * Photos live in the public `listing-photos` bucket, one folder per user
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. Listings (public data only) ---------------------------------------------
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade,

  title text not null check (char_length(title) between 3 and 120),
  category text not null check (category in ('ebike', 'battery', 'parts', 'accessories')),
  price numeric(10, 2) not null check (price >= 0 and price <= 100000),
  condition text not null check (condition in ('Like New', 'Good', 'Fair', 'Needs Work / Parts')),
  location text not null default 'Crestone / Baca Grande' check (char_length(location) <= 120),
  description text not null check (char_length(description) between 1 and 4000),

  image_url text not null,                                   -- cover photo
  image_urls text[] not null default '{}'
    check (cardinality(image_urls) <= 4),                    -- up to 4 photos

  -- Set by Wade / owner from the dashboard only (enforced by trigger below)
  ceb_approved boolean not null default false,
  inspection_note text,

  status text not null default 'active' check (status in ('active', 'pending', 'sold')),

  -- E-bike specifics (nullable for gear / accessories)
  brand text,
  motor_watts text,
  battery_spec text,
  range_estimate text,
  mileage text,
  wheel_size text,

  seller_name text not null check (char_length(seller_name) between 1 and 80)
);

create index if not exists listings_created_at_idx on public.listings (created_at desc);
create index if not exists listings_category_idx   on public.listings (category);
create index if not exists listings_status_idx     on public.listings (status);
create index if not exists listings_user_idx       on public.listings (user_id);

-- 2. Private contact details --------------------------------------------------
create table if not exists public.listing_contacts (
  listing_id uuid primary key references public.listings(id) on delete cascade,
  seller_email text not null check (char_length(seller_email) between 3 and 254),
  seller_phone text check (char_length(seller_phone) <= 40),
  preferred_contact text not null default 'Text or Email'
    check (preferred_contact in ('Text or Call', 'Email Only', 'Text or Email'))
);

-- 3. Guard trigger: protects privileged columns + rate-limits posting ----------
-- `current_user` is 'anon' / 'authenticated' for requests coming from the app,
-- and 'postgres' for the dashboard's Table Editor / SQL Editor.
create or replace function public.listings_guard()
returns trigger
language plpgsql
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      new.user_id         := auth.uid();
      new.ceb_approved    := false;
      new.inspection_note := null;
      new.status          := 'active';

      if (
        select count(*) from public.listings
        where user_id = new.user_id
          and created_at > now() - interval '24 hours'
      ) >= 5 then
        raise exception 'Posting limit reached: you can post up to 5 listings per day.';
      end if;
    else
      new.user_id         := old.user_id;
      new.created_at      := old.created_at;
      new.ceb_approved    := old.ceb_approved;
      new.inspection_note := old.inspection_note;
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists listings_guard_trg on public.listings;
create trigger listings_guard_trg
  before insert or update on public.listings
  for each row execute function public.listings_guard();

-- 4. Row Level Security -------------------------------------------------------
alter table public.listings enable row level security;
alter table public.listing_contacts enable row level security;

drop policy if exists "Public can read listings" on public.listings;
create policy "Public can read listings"
  on public.listings for select
  using (true);

drop policy if exists "Signed-in users can create listings" on public.listings;
create policy "Signed-in users can create listings"
  on public.listings for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Owners can update own listings" on public.listings;
create policy "Owners can update own listings"
  on public.listings for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Owners can delete own listings" on public.listings;
create policy "Owners can delete own listings"
  on public.listings for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Contacts: NO public select policy. Only the owner can touch their own row.
drop policy if exists "Owners manage own contact" on public.listing_contacts;
create policy "Owners manage own contact"
  on public.listing_contacts for all
  to authenticated
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id and l.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.listings l
    where l.id = listing_id and l.user_id = (select auth.uid())
  ));

-- 5. "Show contact info": returns ONE listing's contact details on request -----
create or replace function public.get_listing_contact(p_listing_id uuid)
returns table (seller_email text, seller_phone text, preferred_contact text)
language sql
stable
security definer
set search_path = public
as $$
  select c.seller_email, c.seller_phone, c.preferred_contact
  from public.listing_contacts c
  where c.listing_id = p_listing_id;
$$;

revoke all on function public.get_listing_contact(uuid) from public;
grant execute on function public.get_listing_contact(uuid) to anon, authenticated;

-- 6. Photo storage ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-photos', 'listing-photos', true,
  5242880,                                            -- 5 MB per photo
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public bucket: photo URLs work for everyone without a select policy (which
-- also keeps the bucket from being listable). Uploads/deletes are restricted
-- to the signed-in user's own folder: <user-id>/<file>.
drop policy if exists "Users upload to own photo folder" on storage.objects;
create policy "Users upload to own photo folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users delete own photos" on storage.objects;
create policy "Users delete own photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
