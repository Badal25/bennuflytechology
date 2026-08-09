-- 1. Remove the "first signup becomes super_admin" bootstrap
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  insert into public.profiles (user_id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.email)
  on conflict (user_id) do nothing;
  return new;
end;
$function$;

-- 2. Only super admins may write roles (previously: no write policies at all)
drop policy if exists "super admin insert roles" on public.user_roles;
drop policy if exists "super admin update roles" on public.user_roles;
drop policy if exists "super admin delete roles" on public.user_roles;

create policy "super admin insert roles" on public.user_roles
  for insert to authenticated
  with check (public.has_role(auth.uid(), 'super_admin'));

create policy "super admin update roles" on public.user_roles
  for update to authenticated
  using (public.has_role(auth.uid(), 'super_admin'))
  with check (public.has_role(auth.uid(), 'super_admin'));

create policy "super admin delete roles" on public.user_roles
  for delete to authenticated
  using (public.has_role(auth.uid(), 'super_admin'));

-- 3. Super admins can list all staff profiles; users still cannot change their own status
drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles
  for update to authenticated
  using ((auth.uid() = user_id) or public.has_role(auth.uid(), 'super_admin'))
  with check ((auth.uid() = user_id) or public.has_role(auth.uid(), 'super_admin'));

grant select, insert, update, delete on public.user_roles to authenticated;
grant all on public.user_roles to service_role;