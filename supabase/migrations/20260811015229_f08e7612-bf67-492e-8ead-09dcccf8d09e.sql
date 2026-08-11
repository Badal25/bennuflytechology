create or replace function public.submit_project_inquiry(
  _name text,
  _email text,
  _phone text,
  _company text,
  _project_type text,
  _services text[],
  _budget text,
  _timeline text,
  _description text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  _lead_id uuid;
begin
  if coalesce(trim(_name),'') = '' or coalesce(trim(_email),'') = '' or coalesce(trim(_description),'') = '' then
    raise exception 'Missing required fields';
  end if;
  if length(_name) > 120 or length(_email) > 255 or length(_description) > 5000 then
    raise exception 'Input too long';
  end if;

  insert into public.leads (name, email, phone, company, service, budget, timeline, message, source)
  values (
    left(trim(_name),120), lower(left(trim(_email),255)), left(coalesce(_phone,''),40),
    left(coalesce(_company,''),160), left(array_to_string(coalesce(_services,'{}'::text[]), ', '),500),
    left(coalesce(_budget,''),120), left(coalesce(_timeline,''),120),
    left(_description,5000), 'start-project'
  )
  returning id into _lead_id;

  insert into public.quote_requests (lead_id, project_type, services, budget, timeline, description)
  values (_lead_id, left(coalesce(_project_type,''),120), coalesce(_services,'{}'::text[]),
          left(coalesce(_budget,''),120), left(coalesce(_timeline,''),120), left(_description,5000));
end;
$$;

revoke all on function public.submit_project_inquiry(text,text,text,text,text,text[],text,text,text) from public;
grant execute on function public.submit_project_inquiry(text,text,text,text,text,text[],text,text,text) to anon, authenticated;

update public.website_settings
set working_hours = 'Mon - Fri: 9:30 AM - 6:30 PM IST | Sat: 10:00 AM - 2:00 PM IST | Sun: Closed';

delete from public.job_applications where email = 'e2e@test.com';
delete from public.quote_requests where lead_id in (select id from public.leads where email = 'e2e@test.com');
delete from public.leads where email = 'e2e@test.com';