create table if not exists public.app_state (
  id text primary key,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

drop policy if exists "Authenticated users can read app state" on public.app_state;
create policy "Authenticated users can read app state"
  on public.app_state for select to authenticated using (true);

drop policy if exists "Authenticated users can write app state" on public.app_state;
create policy "Authenticated users can write app state"
  on public.app_state for insert to authenticated with check (true);

drop policy if exists "Authenticated users can update app state" on public.app_state;
create policy "Authenticated users can update app state"
  on public.app_state for update to authenticated using (true) with check (true);

alter table public.projects
  add column if not exists legacy_id text,
  add column if not exists location text,
  add column if not exists capacity_kw numeric,
  add column if not exists priority text,
  add column if not exists engineer text,
  add column if not exists engineer_initials text,
  add column if not exists technician_id text,
  add column if not exists technician text,
  add column if not exists description text,
  add column if not exists materials jsonb not null default '[]'::jsonb;

create unique index if not exists projects_legacy_id_key on public.projects(legacy_id);

alter table public.material_requests
  add column if not exists legacy_id text,
  add column if not exists reference text,
  add column if not exists project_name text,
  add column if not exists requested_by_name text,
  add column if not exists requested_by_role text,
  add column if not exists items_count integer,
  add column if not exists items jsonb not null default '[]'::jsonb,
  add column if not exists priority text,
  add column if not exists request_date date;

create unique index if not exists material_requests_legacy_id_key on public.material_requests(legacy_id);

alter table public.deliveries
  add column if not exists legacy_id text,
  add column if not exists reference text,
  add column if not exists project_name text,
  add column if not exists scheduled_date date,
  add column if not exists items_count integer,
  add column if not exists created_by_name text,
  add column if not exists received_by_name text,
  add column if not exists received_date date;

create unique index if not exists deliveries_legacy_id_key on public.deliveries(legacy_id);

alter table public.returns
  add column if not exists legacy_id text,
  add column if not exists reference text,
  add column if not exists project_name text,
  add column if not exists items_count integer,
  add column if not exists project_date date,
  add column if not exists condition text,
  add column if not exists notes text,
  add column if not exists created_by_name text;

create unique index if not exists returns_legacy_id_key on public.returns(legacy_id);

create table if not exists public.site_reports (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique not null,
  project_id text not null,
  project_name text not null,
  technician text not null,
  report_date date not null,
  materials_left text,
  materials_returned text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique not null,
  event_type text not null,
  title text not null,
  description text not null,
  user_name text not null,
  event_time text not null,
  created_at timestamptz not null default now()
);

alter table public.site_reports enable row level security;
alter table public.activity_events enable row level security;

drop policy if exists "Authenticated users can manage site reports" on public.site_reports;
create policy "Authenticated users can manage site reports"
  on public.site_reports for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated users can manage activity events" on public.activity_events;
create policy "Authenticated users can manage activity events"
  on public.activity_events for all to authenticated using (true) with check (true);

notify pgrst, 'reload schema';