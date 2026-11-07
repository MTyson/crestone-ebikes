-- ============================================================================
-- Crestone E-Bikes (crestoneebikes.com) — Supabase Schema & RLS Policies
-- Run this in your Supabase SQL Editor when ready to switch from Prototype
-- mode to live cloud storage + Magic Link email authentication.
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. Listings Table
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null,

  title text not null,
  category text not null check (category in ('ebike', 'battery', 'parts', 'accessories')),
  price numeric(10, 2) not null check (price >= 0),
  condition text not null check (condition in ('Like New', 'Good', 'Fair', 'Needs Work / Parts')),
  location text not null default 'Crestone / Baca Grande',
  description text not null,
  image_url text not null,
  wade_inspected boolean not null default false,
  status text not null default 'active' check (status in ('active', 'pending', 'sold')),

  -- E-Bike specific specs (nullable for gear/accessories)
  brand text,
  motor_watts text,
  battery_spec text,
  range_estimate text,
  mileage text,
  wheel_size text,

  -- Seller contact details (displayed when visitor clicks "Contact Seller")
  seller_name text not null,
  seller_email text not null,
  seller_phone text,
  preferred_contact text not null default 'Text or Email'
);

-- 2. Enable Row Level Security (RLS)
alter table public.listings enable row level security;

-- Everyone can view active/sold listings
create policy "Public can read listings"
  on public.listings
  for select
  using (true);

-- Authenticated users (via Supabase Magic Link) can insert listings
create policy "Authenticated users can create listings"
  on public.listings
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Owners can update or mark their own listings as sold
create policy "Users can update own listings"
  on public.listings
  for update
  to authenticated
  using (auth.uid() = user_id);

-- Owners can delete their own listings
create policy "Users can delete own listings"
  on public.listings
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- 3. Storage bucket for listing photos (optional)
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

