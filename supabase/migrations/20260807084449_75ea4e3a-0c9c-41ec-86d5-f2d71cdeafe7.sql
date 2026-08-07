-- ============ ROLES ============
create type public.app_role as enum ('super_admin','hr','content_manager','sales','developer');
create type public.content_status as enum ('draft','published');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  full_name text,
  email text,
  phone text,
  avatar text,
  status text not null default 'active',
  last_login timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id)
$$;

create or replace function public.can_manage_content(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id
    and role in ('super_admin','content_manager'))
$$;

create or replace function public.can_manage_tech(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id
    and role in ('super_admin','content_manager','developer'))
$$;

create or replace function public.can_manage_hr(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id
    and role in ('super_admin','hr'))
$$;

create or replace function public.can_manage_sales(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id
    and role in ('super_admin','sales'))
$$;

create policy "own profile read" on public.profiles for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'super_admin'));
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'super_admin'));
create policy "profile insert" on public.profiles for insert to authenticated with check (auth.uid() = user_id or public.has_role(auth.uid(),'super_admin'));

create policy "read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'super_admin'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.email)
  on conflict (user_id) do nothing;
  if not exists (select 1 from public.user_roles where role = 'super_admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'super_admin');
  end if;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

-- ============ CONTENT ============
create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text,
  description text,
  icon text,
  image text,
  features text[] not null default '{}',
  status public.content_status not null default 'published',
  sort_order int not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.services to anon;
grant select, insert, update, delete on public.services to authenticated;
grant all on public.services to service_role;
alter table public.services enable row level security;
create policy "public read services" on public.services for select using (status = 'published' or public.can_manage_content(auth.uid()));
create policy "manage services" on public.services for all to authenticated using (public.can_manage_content(auth.uid())) with check (public.can_manage_content(auth.uid()));
create trigger t_services before update on public.services for each row execute function public.touch_updated_at();

create table public.technologies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  icon text,
  description text,
  status public.content_status not null default 'published',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.technologies to anon;
grant select, insert, update, delete on public.technologies to authenticated;
grant all on public.technologies to service_role;
alter table public.technologies enable row level security;
create policy "public read tech" on public.technologies for select using (status = 'published' or public.can_manage_tech(auth.uid()));
create policy "manage tech" on public.technologies for all to authenticated using (public.can_manage_tech(auth.uid())) with check (public.can_manage_tech(auth.uid()));

create table public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text,
  description text,
  category text,
  technologies text[] not null default '{}',
  cover_image text,
  gallery text[] not null default '{}',
  live_url text,
  github_url text,
  project_status text not null default 'In Development',
  status public.content_status not null default 'published',
  featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.portfolio_projects to anon;
grant select, insert, update, delete on public.portfolio_projects to authenticated;
grant all on public.portfolio_projects to service_role;
alter table public.portfolio_projects enable row level security;
create policy "public read projects" on public.portfolio_projects for select using (status = 'published' or public.can_manage_tech(auth.uid()));
create policy "manage projects" on public.portfolio_projects for all to authenticated using (public.can_manage_tech(auth.uid())) with check (public.can_manage_tech(auth.uid()));
create trigger t_projects before update on public.portfolio_projects for each row execute function public.touch_updated_at();

create table public.industries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  image text,
  status public.content_status not null default 'published',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.industries to anon;
grant select, insert, update, delete on public.industries to authenticated;
grant all on public.industries to service_role;
alter table public.industries enable row level security;
create policy "public read industries" on public.industries for select using (status = 'published' or public.can_manage_content(auth.uid()));
create policy "manage industries" on public.industries for all to authenticated using (public.can_manage_content(auth.uid())) with check (public.can_manage_content(auth.uid()));

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  department text,
  employment_type text not null default 'Full-time',
  work_mode text not null default 'Remote',
  experience text,
  salary_range text,
  location text default 'Remote',
  description text,
  requirements text[] not null default '{}',
  responsibilities text[] not null default '{}',
  skills text[] not null default '{}',
  deadline date,
  status public.content_status not null default 'published',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.jobs to anon;
grant select, insert, update, delete on public.jobs to authenticated;
grant all on public.jobs to service_role;
alter table public.jobs enable row level security;
create policy "public read jobs" on public.jobs for select using (status = 'published' or public.can_manage_hr(auth.uid()));
create policy "manage jobs" on public.jobs for all to authenticated using (public.can_manage_hr(auth.uid())) with check (public.can_manage_hr(auth.uid()));
create trigger t_jobs before update on public.jobs for each row execute function public.touch_updated_at();

create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  location text,
  position text,
  experience text,
  education text,
  skills text,
  linkedin_url text,
  github_url text,
  portfolio_url text,
  cover_letter text,
  resume_path text,
  status text not null default 'New',
  interview_date timestamptz,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant insert on public.job_applications to anon;
grant select, insert, update, delete on public.job_applications to authenticated;
grant all on public.job_applications to service_role;
alter table public.job_applications enable row level security;
create policy "anyone can apply" on public.job_applications for insert with check (true);
create policy "hr read applications" on public.job_applications for select to authenticated using (public.can_manage_hr(auth.uid()));
create policy "hr update applications" on public.job_applications for update to authenticated using (public.can_manage_hr(auth.uid()));
create policy "admin delete applications" on public.job_applications for delete to authenticated using (public.has_role(auth.uid(),'super_admin'));
create trigger t_apps before update on public.job_applications for each row execute function public.touch_updated_at();

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  company text,
  service text,
  budget text,
  timeline text,
  message text,
  source text not null default 'contact',
  status text not null default 'New',
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant insert on public.leads to anon;
grant select, insert, update, delete on public.leads to authenticated;
grant all on public.leads to service_role;
alter table public.leads enable row level security;
create policy "anyone can create lead" on public.leads for insert with check (true);
create policy "sales read leads" on public.leads for select to authenticated using (public.can_manage_sales(auth.uid()));
create policy "sales update leads" on public.leads for update to authenticated using (public.can_manage_sales(auth.uid()));
create policy "admin delete leads" on public.leads for delete to authenticated using (public.has_role(auth.uid(),'super_admin'));
create trigger t_leads before update on public.leads for each row execute function public.touch_updated_at();

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  project_type text,
  services text[] not null default '{}',
  budget text,
  timeline text,
  description text,
  attachment_path text,
  created_at timestamptz not null default now()
);
grant insert on public.quote_requests to anon;
grant select, insert, update, delete on public.quote_requests to authenticated;
grant all on public.quote_requests to service_role;
alter table public.quote_requests enable row level security;
create policy "anyone create quote" on public.quote_requests for insert with check (true);
create policy "sales read quotes" on public.quote_requests for select to authenticated using (public.can_manage_sales(auth.uid()));
create policy "sales manage quotes" on public.quote_requests for update to authenticated using (public.can_manage_sales(auth.uid()));

create table public.blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  thumbnail text,
  category text,
  tags text[] not null default '{}',
  author_name text,
  author_id uuid,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.blogs to anon;
grant select, insert, update, delete on public.blogs to authenticated;
grant all on public.blogs to service_role;
alter table public.blogs enable row level security;
create policy "public read blogs" on public.blogs for select using (status = 'published' or public.can_manage_content(auth.uid()));
create policy "manage blogs" on public.blogs for all to authenticated using (public.can_manage_content(auth.uid())) with check (public.can_manage_content(auth.uid()));
create trigger t_blogs before update on public.blogs for each row execute function public.touch_updated_at();

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  company text,
  designation text,
  message text not null,
  rating int check (rating between 1 and 5),
  image text,
  status public.content_status not null default 'published',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.testimonials to anon;
grant select, insert, update, delete on public.testimonials to authenticated;
grant all on public.testimonials to service_role;
alter table public.testimonials enable row level security;
create policy "public read testimonials" on public.testimonials for select using (status = 'published' or public.can_manage_content(auth.uid()));
create policy "manage testimonials" on public.testimonials for all to authenticated using (public.can_manage_content(auth.uid())) with check (public.can_manage_content(auth.uid()));

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text,
  status public.content_status not null default 'published',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.faqs to anon;
grant select, insert, update, delete on public.faqs to authenticated;
grant all on public.faqs to service_role;
alter table public.faqs enable row level security;
create policy "public read faqs" on public.faqs for select using (status = 'published' or public.can_manage_content(auth.uid()));
create policy "manage faqs" on public.faqs for all to authenticated using (public.can_manage_content(auth.uid())) with check (public.can_manage_content(auth.uid()));

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  designation text,
  bio text,
  photo text,
  linkedin text,
  github text,
  email text,
  status public.content_status not null default 'published',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.team_members to anon;
grant select, insert, update, delete on public.team_members to authenticated;
grant all on public.team_members to service_role;
alter table public.team_members enable row level security;
create policy "public read team" on public.team_members for select using (status = 'published' or public.can_manage_content(auth.uid()));
create policy "manage team" on public.team_members for all to authenticated using (public.can_manage_content(auth.uid())) with check (public.can_manage_content(auth.uid()));

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  status text not null default 'subscribed',
  subscribed_at timestamptz not null default now()
);
grant insert on public.newsletter_subscribers to anon;
grant select, insert, update, delete on public.newsletter_subscribers to authenticated;
grant all on public.newsletter_subscribers to service_role;
alter table public.newsletter_subscribers enable row level security;
create policy "anyone subscribe" on public.newsletter_subscribers for insert with check (true);
create policy "staff read subs" on public.newsletter_subscribers for select to authenticated using (public.is_staff(auth.uid()));
create policy "admin delete subs" on public.newsletter_subscribers for delete to authenticated using (public.has_role(auth.uid(),'super_admin'));

create table public.media (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_path text not null,
  file_type text,
  file_size bigint,
  uploaded_by uuid,
  created_at timestamptz not null default now()
);
grant select on public.media to anon;
grant select, insert, update, delete on public.media to authenticated;
grant all on public.media to service_role;
alter table public.media enable row level security;
create policy "public read media" on public.media for select using (true);
create policy "staff manage media" on public.media for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create table public.website_settings (
  id uuid primary key default gen_random_uuid(),
  company_name text not null default 'Bennufly Technology Pvt. Ltd.',
  tagline text,
  email text,
  phone text,
  whatsapp text,
  whatsapp_message text,
  address text,
  linkedin text,
  instagram text,
  facebook text,
  github text,
  youtube text,
  working_hours text,
  logo text,
  favicon text,
  footer_text text,
  copyright text,
  booking_url text,
  ai_chat_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);
grant select on public.website_settings to anon;
grant select, insert, update, delete on public.website_settings to authenticated;
grant all on public.website_settings to service_role;
alter table public.website_settings enable row level security;
create policy "public read settings" on public.website_settings for select using (true);
create policy "super admin settings" on public.website_settings for all to authenticated using (public.has_role(auth.uid(),'super_admin')) with check (public.has_role(auth.uid(),'super_admin'));

create table public.site_stats (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  value text,
  fallback_text text default 'Growing every day',
  sort_order int not null default 0,
  status public.content_status not null default 'published'
);
grant select on public.site_stats to anon;
grant select, insert, update, delete on public.site_stats to authenticated;
grant all on public.site_stats to service_role;
alter table public.site_stats enable row level security;
create policy "public read stats" on public.site_stats for select using (status = 'published' or public.can_manage_content(auth.uid()));
create policy "manage stats" on public.site_stats for all to authenticated using (public.has_role(auth.uid(),'super_admin')) with check (public.has_role(auth.uid(),'super_admin'));

create table public.page_content (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  section text not null,
  title text,
  subtitle text,
  content text,
  image text,
  button_text text,
  button_url text,
  status public.content_status not null default 'published',
  sort_order int not null default 0,
  updated_at timestamptz not null default now(),
  unique (page, section)
);
grant select on public.page_content to anon;
grant select, insert, update, delete on public.page_content to authenticated;
grant all on public.page_content to service_role;
alter table public.page_content enable row level security;
create policy "public read page content" on public.page_content for select using (status = 'published' or public.can_manage_content(auth.uid()));
create policy "manage page content" on public.page_content for all to authenticated using (public.can_manage_content(auth.uid())) with check (public.can_manage_content(auth.uid()));

create table public.seo_settings (
  id uuid primary key default gen_random_uuid(),
  page text not null unique,
  seo_title text,
  seo_description text,
  keywords text,
  og_image text,
  canonical_url text,
  updated_at timestamptz not null default now()
);
grant select on public.seo_settings to anon;
grant select, insert, update, delete on public.seo_settings to authenticated;
grant all on public.seo_settings to service_role;
alter table public.seo_settings enable row level security;
create policy "public read seo" on public.seo_settings for select using (true);
create policy "manage seo" on public.seo_settings for all to authenticated using (public.can_manage_content(auth.uid())) with check (public.can_manage_content(auth.uid()));

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  module text,
  record_id text,
  description text,
  created_at timestamptz not null default now()
);
grant select, insert on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;
alter table public.audit_logs enable row level security;
create policy "staff insert audit" on public.audit_logs for insert to authenticated with check (public.is_staff(auth.uid()));
create policy "admin read audit" on public.audit_logs for select to authenticated using (public.has_role(auth.uid(),'super_admin'));

-- ============ SEED ============
insert into public.website_settings (tagline, email, phone, whatsapp, whatsapp_message, address, linkedin, instagram, working_hours, footer_text, copyright)
values ('Building Ideas. Engineering the Future.','supportbennufly@gmail.com','+91 94041 44550','+919404144550','Hello Bennufly Technology, I would like to discuss a project.','IT Park, Nagpur, Maharashtra, India','https://www.linkedin.com/company/bennuflytech/','https://www.instagram.com/officialbennufly/','Mon - Sat, 10:00 - 19:00 IST','Transforming Ideas into Powerful Digital Products.','2026 Bennufly Technology Pvt. Ltd. All rights reserved.');

insert into public.services (title, slug, short_description, description, icon, features, sort_order, seo_title, seo_description) values
('Software Development','software-development','Custom software solutions for businesses and organizations.','We design and engineer custom software that fits the way your business actually works - from internal tools to large scale platforms.','Code','{"Custom architecture","Scalable systems","Third-party integrations","Long-term support"}',1,'Custom Software Development - Bennufly','Custom software engineering for businesses, startups and enterprises.'),
('Web Development','web-development','Modern websites, web applications, dashboards and SaaS platforms.','High-performance web products built with React, Next.js and modern tooling - fast, accessible and search-friendly.','Globe','{"Marketing websites","Web applications","Admin dashboards","SEO and performance"}',2,'Web Development Services - Bennufly','Modern websites, web apps and dashboards engineered for performance.'),
('Mobile Application Development','mobile-app-development','Android and iOS applications.','Cross-platform and native mobile applications built with Flutter and React Native, shipped to both stores.','Smartphone','{"Android and iOS","Cross-platform","App store deployment","Offline-first UX"}',3,'Mobile App Development - Bennufly','Android and iOS application development for startups and businesses.'),
('AI & Machine Learning','ai-machine-learning','AI automation, intelligent applications and ML solutions.','We integrate generative AI, assistants and machine learning into real products where they create measurable value.','Brain','{"Generative AI integration","AI assistants","ML models","Process automation"}',4,'AI and Machine Learning Services - Bennufly','AI automation, generative AI integration and machine learning solutions.'),
('SaaS Development','saas-development','Scalable subscription-based software products.','From MVP to multi-tenant platform - billing, roles, analytics and the infrastructure that carries growth.','Layers','{"Multi-tenant architecture","Subscriptions and billing","Role-based access","Analytics"}',5,'SaaS Product Development - Bennufly','Scalable subscription software products built end to end.'),
('UI/UX Design','ui-ux-design','User-centered interfaces, prototypes and product experiences.','Design systems, prototypes and interfaces that make complex products feel effortless.','PenTool','{"Design systems","Prototyping","User research","Accessibility"}',6,'UI/UX Design Services - Bennufly','Product design, prototypes and design systems for digital products.'),
('Cloud & DevOps','cloud-devops','Cloud deployment, CI/CD, Docker and scalable infrastructure.','Reliable infrastructure and delivery pipelines so your team can ship safely and often.','Cloud','{"CI/CD pipelines","Docker and containers","Cloud deployment","Monitoring"}',7,'Cloud and DevOps Services - Bennufly','Cloud infrastructure, CI/CD and DevOps engineering.'),
('API & Backend Development','api-backend-development','Secure APIs, backend systems and database architecture.','Well-documented APIs and backend systems designed around security, correctness and scale.','Server','{"REST and GraphQL APIs","Database architecture","Authentication and security","Integrations"}',8,'API and Backend Development - Bennufly','Secure APIs, backend systems and database architecture.'),
('Business Automation','business-automation','Automation platforms and workflow systems.','Replace manual, repetitive operations with dependable automated workflows.','Workflow','{"Workflow automation","Document processing","Notifications","Reporting"}',9,'Business Automation - Bennufly','Workflow automation and business process systems.'),
('Custom Digital Solutions','custom-digital-solutions','Custom CRM, ERP and management systems.','Purpose-built business systems - CRM, ERP, management portals - designed around your operations.','Boxes','{"Custom CRM","ERP systems","Management portals","Reporting dashboards"}',10,'Custom Digital Solutions - Bennufly','Custom CRM, ERP and business management systems.'),
('Student Learning & Internships','student-learning-internships','Practical learning and real-world technology experience.','Structured internships and learning programs where students work on real projects with mentorship.','GraduationCap','{"Real project experience","Mentorship","Remote programs","Career guidance"}',11,'Student Learning and Internships - Bennufly','Internships and practical technology learning programs for students.');

insert into public.technologies (name, category, sort_order) values
('React','Frontend',1),('Next.js','Frontend',2),('TypeScript','Frontend',3),('Tailwind CSS','Frontend',4),('HTML','Frontend',5),('CSS','Frontend',6),
('Node.js','Backend',1),('Express.js','Backend',2),('Python','Backend',3),('Java','Backend',4),
('Flutter','Mobile',1),('React Native','Mobile',2),
('PostgreSQL','Database',1),('MongoDB','Database',2),('MySQL','Database',3),('Firebase','Database',4),
('OpenAI APIs','AI',1),('Gemini APIs','AI',2),('Machine Learning','AI',3),('Generative AI','AI',4),
('AWS','Cloud & DevOps',1),('Vercel','Cloud & DevOps',2),('Docker','Cloud & DevOps',3),('GitHub','Cloud & DevOps',4),('CI/CD','Cloud & DevOps',5),
('Figma','Design',1);

insert into public.industries (name, slug, description, icon, sort_order) values
('Startups','startups','MVPs, product engineering and scale-up support for founders.','Rocket',1),
('Education','education','Learning platforms, campus systems and student products.','GraduationCap',2),
('Healthcare','healthcare','Patient-facing apps, records and clinic operations software.','HeartPulse',3),
('Finance','finance','Secure dashboards, reporting and fintech integrations.','Landmark',4),
('Retail','retail','Commerce platforms, inventory and customer experience.','ShoppingBag',5),
('Real Estate','real-estate','Listing platforms, CRM and property management systems.','Building2',6),
('Manufacturing','manufacturing','Production tracking, ERP and automation systems.','Factory',7),
('Logistics','logistics','Fleet, dispatch and supply chain visibility tools.','Truck',8),
('Travel','travel','Booking engines and travel experience platforms.','Plane',9),
('Professional Services','professional-services','Client portals, workflow and practice management.','Briefcase',10);

insert into public.portfolio_projects (title, slug, short_description, description, category, technologies, project_status, featured, sort_order) values
('Campus Ride Sharing App','campus-ride-sharing-app','A ride sharing platform designed for campus communities.','A mobile-first ride sharing platform built for campus communities - matching students travelling on similar routes, with verified profiles, live trip status and a simple, safety-first experience. Currently in active development.','Mobile Application','{"Flutter","Node.js","PostgreSQL","Supabase"}','Currently in Development',true,1);

insert into public.faqs (question, answer, sort_order) values
('What services does Bennufly provide?','Bennufly builds software, websites, mobile applications, AI-powered solutions, SaaS products, UI/UX design, cloud and DevOps, APIs and custom business systems.',1),
('How can I start a project?','Share your requirements through the Start a Project form or contact us directly. We respond with a discovery call to understand your goals before proposing scope and timeline.',2),
('Do you work with international clients?','Yes. We work with clients across India and international markets and operate remotely with overlapping working hours.',3),
('Do you offer internships?','Yes. Bennufly runs structured internship and learning programs where students work on real projects with mentorship.',4),
('Do you provide remote opportunities?','Yes. Our roles and internships are remote by default.',5),
('How long does software development take?','It depends on scope. A focused MVP typically takes a few weeks, while larger platforms run over several months with staged releases.',6),
('Can Bennufly build custom software?','Yes. Custom software - including CRM, ERP and internal management systems - is a core part of what we do.',7),
('Do you provide post-launch support?','Yes. We offer maintenance, monitoring and continuous improvement after launch.',8);

insert into public.site_stats (label, value, fallback_text, sort_order) values
('Founded','2026',null,1),
('Projects Delivered',null,'Growing every day',2),
('Technologies','26+',null,3),
('Engagement','Remote-first',null,4);

insert into public.jobs (title, slug, department, employment_type, work_mode, experience, location, description, requirements, responsibilities, skills, featured) values
('Frontend Developer Intern','frontend-developer-intern','Engineering','Internship','Remote','0-1 years','Remote','Work alongside our engineering team on real product interfaces using React, TypeScript and Tailwind CSS.','{"Understanding of HTML, CSS and JavaScript","Familiarity with React","Ability to commit to a structured program"}','{"Build and refine UI components","Collaborate on product features","Participate in code reviews"}','{"React","TypeScript","Tailwind CSS","Git"}',true),
('Full Stack Developer','full-stack-developer','Engineering','Full-time','Remote','1-3 years','Remote','Build end-to-end product features across the frontend, API layer and database.','{"Experience with React and Node.js","Comfortable with relational databases","Strong problem solving"}','{"Design and ship product features","Write reliable, tested code","Contribute to architecture decisions"}','{"React","Node.js","PostgreSQL","TypeScript"}',false);

insert into public.seo_settings (page, seo_title, seo_description) values
('home','Bennufly Technology - Building Ideas. Engineering the Future.','Bennufly Technology Pvt. Ltd. builds modern software, AI solutions, mobile applications and digital products for businesses worldwide.'),
('about','About Bennufly Technology - Our Story, Mission and Vision','A technology company founded in 2026 in Nagpur, building software, AI solutions and digital products.'),
('services','Services - Software, Web, Mobile, AI and SaaS | Bennufly','Explore Bennufly software, web, mobile, AI, SaaS, design, cloud and automation services.'),
('careers','Careers at Bennufly Technology - Remote Opportunities','Remote full-time, internship and freelance opportunities at Bennufly Technology.'),
('contact','Contact Bennufly Technology - Talk to Our Team','Get in touch with Bennufly Technology in Nagpur, India for your next software project.');