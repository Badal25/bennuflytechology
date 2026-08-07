create or replace function public.touch_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

-- resumes: anyone may upload (job application), only HR/super admin may read
create policy "anyone upload resume" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'resumes');
create policy "hr read resumes" on storage.objects for select to authenticated
  using (bucket_id = 'resumes' and public.can_manage_hr(auth.uid()));
create policy "admin delete resumes" on storage.objects for delete to authenticated
  using (bucket_id = 'resumes' and public.has_role(auth.uid(),'super_admin'));

-- media: staff manage, everyone may read
create policy "read media objects" on storage.objects for select to anon, authenticated
  using (bucket_id = 'media');
create policy "staff upload media" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_staff(auth.uid()));
create policy "staff update media" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_staff(auth.uid()));
create policy "staff delete media" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_staff(auth.uid()));