-- ============================================================
-- ATHLETIC VAULT · Supabase schema
-- ------------------------------------------------------------
-- Modelo de "kv" (key → value jsonb) que refleja el localStorage
-- del sitio. Dos tablas:
--   store        → productos + settings (escritura SOLO admin autenticado)
--   reservations → solicitudes de compra (los clientes las crean sin login)
--
-- CÓMO USAR:
--   Supabase → SQL Editor → New query → pega TODO esto → Run
-- ============================================================

-- Catálogo (productos + settings)
create table if not exists public.store (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.store enable row level security;

-- Lectura pública (el sitio necesita leer el catálogo)
create policy "store_anon_read" on public.store
  for select using (true);
-- Escritura SOLO para el admin autenticado (Supabase Auth)
create policy "store_auth_insert" on public.store
  for insert to authenticated with check (true);
create policy "store_auth_update" on public.store
  for update to authenticated using (true);

-- Reservas / solicitudes de compra
create table if not exists public.reservations (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.reservations enable row level security;

-- Lectura pública (el admin las ve; también sirve para el sitio)
create policy "res_anon_read" on public.reservations
  for select using (true);
-- Los clientes (anon) pueden crear/actualizar solicitudes
create policy "res_anon_insert" on public.reservations
  for insert with check (true);
create policy "res_anon_update" on public.reservations
  for update using (true);
