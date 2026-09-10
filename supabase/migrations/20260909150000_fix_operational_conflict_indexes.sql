drop index if exists public.projects_legacy_id_key;
create unique index projects_legacy_id_key
  on public.projects (legacy_id);

drop index if exists public.material_requests_legacy_id_key;
create unique index material_requests_legacy_id_key
  on public.material_requests (legacy_id);

drop index if exists public.deliveries_legacy_id_key;
create unique index deliveries_legacy_id_key
  on public.deliveries (legacy_id);

drop index if exists public.returns_legacy_id_key;
create unique index returns_legacy_id_key
  on public.returns (legacy_id);

notify pgrst, 'reload schema';
