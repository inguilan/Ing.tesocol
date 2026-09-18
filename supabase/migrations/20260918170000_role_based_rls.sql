create or replace function public.current_user_has_role(required_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and active = true
      and role = any(required_roles)
  );
$$;

revoke all on function public.current_user_has_role(text[]) from public;
grant execute on function public.current_user_has_role(text[]) to authenticated;

alter table public.material_requests
  add column if not exists project_legacy_id text;
alter table public.deliveries
  add column if not exists project_legacy_id text;
alter table public.returns
  add column if not exists project_legacy_id text;

drop policy if exists "Authenticated users full access" on public.projects;
drop policy if exists "Authenticated users full access" on public.material_requests;
drop policy if exists "Authenticated users full access" on public.deliveries;
drop policy if exists "Authenticated users full access" on public.returns;

create policy "Authenticated users can read projects"
  on public.projects for select to authenticated using (true);
create policy "Managers can write projects"
  on public.projects for all to authenticated
  using (public.current_user_has_role(array['engineer', 'superadmin']))
  with check (public.current_user_has_role(array['engineer', 'superadmin']));

create policy "Authenticated users can read material requests"
  on public.material_requests for select to authenticated using (true);
create policy "Managers can write material requests"
  on public.material_requests for all to authenticated
  using (public.current_user_has_role(array['engineer', 'superadmin']))
  with check (public.current_user_has_role(array['engineer', 'superadmin']));
create policy "Technicians can create material requests"
  on public.material_requests for insert to authenticated
  with check (
    public.current_user_has_role(array['technician'])
    and requested_by = auth.uid()
  );

create policy "Authenticated users can read deliveries"
  on public.deliveries for select to authenticated using (true);
create policy "Managers can write deliveries"
  on public.deliveries for all to authenticated
  using (public.current_user_has_role(array['engineer', 'superadmin']))
  with check (public.current_user_has_role(array['engineer', 'superadmin']));

create policy "Authenticated users can read returns"
  on public.returns for select to authenticated using (true);
create policy "Managers can write returns"
  on public.returns for all to authenticated
  using (public.current_user_has_role(array['engineer', 'superadmin']))
  with check (public.current_user_has_role(array['engineer', 'superadmin']));

drop policy if exists "Authenticated users can write app state" on public.app_state;
drop policy if exists "Authenticated users can update app state" on public.app_state;
create policy "Managers can insert app state"
  on public.app_state for insert to authenticated
  with check (public.current_user_has_role(array['engineer', 'superadmin']));
create policy "Managers can update app state"
  on public.app_state for update to authenticated
  using (public.current_user_has_role(array['engineer', 'superadmin']))
  with check (public.current_user_has_role(array['engineer', 'superadmin']));

drop policy if exists "Authenticated users can manage site reports" on public.site_reports;
create policy "Authenticated users can read site reports"
  on public.site_reports for select to authenticated using (true);
create policy "Authenticated users can create site reports"
  on public.site_reports for insert to authenticated
  with check (public.current_user_has_role(array['technician', 'engineer', 'superadmin']));
create policy "Managers can update site reports"
  on public.site_reports for update to authenticated
  using (public.current_user_has_role(array['engineer', 'superadmin']))
  with check (public.current_user_has_role(array['engineer', 'superadmin']));
create policy "Managers can delete site reports"
  on public.site_reports for delete to authenticated
  using (public.current_user_has_role(array['engineer', 'superadmin']));

drop policy if exists "Authenticated users can manage activity events" on public.activity_events;
create policy "Authenticated users can read activity events"
  on public.activity_events for select to authenticated using (true);
create policy "Managers can manage activity events"
  on public.activity_events for all to authenticated
  using (public.current_user_has_role(array['engineer', 'superadmin']))
  with check (public.current_user_has_role(array['engineer', 'superadmin']));

notify pgrst, 'reload schema';