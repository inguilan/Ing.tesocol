-- ============================================
-- PROJECTS
-- ============================================
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client text,
  status text not null default 'active', -- active, completed, paused
  start_date date,
  end_date date,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- MATERIAL REQUESTS
-- ============================================
create table material_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  material_name text not null,
  quantity numeric not null,
  unit text, -- ej: unidades, metros, kg
  status text not null default 'pending', -- pending, approved, rejected, fulfilled
  requested_by uuid references auth.users(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- DELIVERIES
-- ============================================
create table deliveries (
  id uuid primary key default gen_random_uuid(),
  material_request_id uuid references material_requests(id) on delete cascade,
  carrier text,
  delivered_at timestamptz,
  status text not null default 'pending', -- pending, in_transit, delivered, failed
  received_by uuid references auth.users(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- RETURNS
-- ============================================
create table returns (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid references deliveries(id) on delete cascade,
  quantity numeric not null,
  reason text,
  status text not null default 'pending', -- pending, approved, rejected
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- ÍNDICES ÚTILES
-- ============================================
create index idx_material_requests_project on material_requests(project_id);
create index idx_deliveries_request on deliveries(material_request_id);
create index idx_returns_delivery on returns(delivery_id);

-- ============================================
-- RLS (obligatorio en Supabase)
-- ============================================
alter table projects enable row level security;
alter table material_requests enable row level security;
alter table deliveries enable row level security;
alter table returns enable row level security;

-- Política básica: usuarios autenticados pueden leer/escribir todo
-- (ajusta esto después según tus roles reales)
create policy "Authenticated users full access" on projects
  for all using (auth.role() = 'authenticated');
create policy "Authenticated users full access" on material_requests
  for all using (auth.role() = 'authenticated');
create policy "Authenticated users full access" on deliveries
  for all using (auth.role() = 'authenticated');
create policy "Authenticated users full access" on returns
  for all using (auth.role() = 'authenticated');