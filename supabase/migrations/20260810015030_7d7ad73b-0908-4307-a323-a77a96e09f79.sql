alter table public.services
  add column if not exists technologies text[] not null default '{}',
  add column if not exists cta_text text,
  add column if not exists cta_url text,
  add column if not exists featured boolean not null default false;

alter table public.portfolio_projects
  add column if not exists client_name text,
  add column if not exists completion_date date,
  add column if not exists seo_title text,
  add column if not exists seo_description text;

alter table public.technologies
  add column if not exists website_url text;

alter table public.team_members
  add column if not exists instagram text;

alter table public.blogs
  add column if not exists featured boolean not null default false,
  add column if not exists og_image text;

alter table public.seo_settings
  add column if not exists og_title text,
  add column if not exists og_description text,
  add column if not exists no_index boolean not null default false,
  add column if not exists no_follow boolean not null default false;

alter table public.website_settings
  add column if not exists twitter_x text,
  add column if not exists website_url text,
  add column if not exists google_maps_url text,
  add column if not exists default_seo_title text,
  add column if not exists default_seo_description text,
  add column if not exists default_og_image text;

create index if not exists idx_job_applications_job_id on public.job_applications(job_id);
create index if not exists idx_job_applications_status on public.job_applications(status);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_blogs_status on public.blogs(status);