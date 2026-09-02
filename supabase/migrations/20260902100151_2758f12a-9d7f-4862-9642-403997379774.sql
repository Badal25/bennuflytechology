-- LEARNING CATEGORIES
CREATE TABLE public.learning_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  status content_status NOT NULL DEFAULT 'published',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.learning_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_categories TO authenticated;
GRANT ALL ON public.learning_categories TO service_role;
ALTER TABLE public.learning_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published learning categories" ON public.learning_categories
  FOR SELECT USING (status = 'published' OR public.can_manage_content(auth.uid()));
CREATE POLICY "Content managers manage learning categories" ON public.learning_categories
  FOR ALL TO authenticated USING (public.can_manage_content(auth.uid())) WITH CHECK (public.can_manage_content(auth.uid()));
CREATE TRIGGER t_learning_categories BEFORE UPDATE ON public.learning_categories
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- LEARNING PROGRAMS
CREATE TABLE public.learning_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text,
  description text,
  duration text,
  mode text NOT NULL DEFAULT 'Remote' CHECK (mode IN ('Remote','Hybrid')),
  program_type text NOT NULL DEFAULT 'Internship' CHECK (program_type IN ('Full-Time','Part-Time','Internship','Project-Based','Freelance')),
  eligibility text,
  skills text[] NOT NULL DEFAULT '{}',
  start_date date,
  application_deadline date,
  seats integer,
  thumbnail text,
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  status content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.learning_programs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_programs TO authenticated;
GRANT ALL ON public.learning_programs TO service_role;
ALTER TABLE public.learning_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published learning programs" ON public.learning_programs
  FOR SELECT USING (status = 'published' OR public.can_manage_content(auth.uid()) OR public.can_manage_hr(auth.uid()));
CREATE POLICY "Content managers manage learning programs" ON public.learning_programs
  FOR ALL TO authenticated USING (public.can_manage_content(auth.uid())) WITH CHECK (public.can_manage_content(auth.uid()));
CREATE TRIGGER t_learning_programs BEFORE UPDATE ON public.learning_programs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- LEARNING RESOURCES
CREATE TABLE public.learning_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  category text,
  resource_type text NOT NULL DEFAULT 'Article' CHECK (resource_type IN ('Tutorial','Article','Notes','Video','Project','Assignment','Roadmap','External Resource')),
  difficulty text NOT NULL DEFAULT 'Beginner' CHECK (difficulty IN ('Beginner','Intermediate','Advanced')),
  thumbnail text,
  content text,
  url text,
  sort_order integer NOT NULL DEFAULT 0,
  status content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.learning_resources TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_resources TO authenticated;
GRANT ALL ON public.learning_resources TO service_role;
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published learning resources" ON public.learning_resources
  FOR SELECT USING (status = 'published' OR public.can_manage_content(auth.uid()));
CREATE POLICY "Content managers manage learning resources" ON public.learning_resources
  FOR ALL TO authenticated USING (public.can_manage_content(auth.uid())) WITH CHECK (public.can_manage_content(auth.uid()));
CREATE TRIGGER t_learning_resources BEFORE UPDATE ON public.learning_resources
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- INTERNSHIP APPLICATIONS
CREATE TABLE public.internship_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES public.learning_programs(id) ON DELETE SET NULL,
  program_name text,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  college text,
  course text,
  graduation_year text,
  skills text,
  interested_domain text,
  linkedin_url text,
  github_url text,
  portfolio_url text,
  resume_path text,
  motivation text,
  status text NOT NULL DEFAULT 'New',
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.internship_applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.internship_applications TO authenticated;
GRANT ALL ON public.internship_applications TO service_role;
ALTER TABLE public.internship_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit an internship application" ON public.internship_applications
  FOR INSERT WITH CHECK (true);
CREATE POLICY "HR reads internship applications" ON public.internship_applications
  FOR SELECT TO authenticated USING (public.can_manage_hr(auth.uid()));
CREATE POLICY "HR updates internship applications" ON public.internship_applications
  FOR UPDATE TO authenticated USING (public.can_manage_hr(auth.uid())) WITH CHECK (public.can_manage_hr(auth.uid()));
CREATE POLICY "HR deletes internship applications" ON public.internship_applications
  FOR DELETE TO authenticated USING (public.can_manage_hr(auth.uid()));
CREATE TRIGGER t_internship_applications BEFORE UPDATE ON public.internship_applications
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_internship_applications_program ON public.internship_applications(program_id);
CREATE INDEX idx_internship_applications_created ON public.internship_applications(created_at DESC);

-- Seed starter categories
INSERT INTO public.learning_categories (name, slug, description, icon, sort_order, status) VALUES
  ('Web Development', 'web-development', 'HTML, CSS, JavaScript, React and modern full-stack web engineering.', 'Globe', 1, 'published'),
  ('Programming & DSA', 'programming-dsa', 'Core programming fundamentals, data structures and algorithmic problem solving.', 'Braces', 2, 'published'),
  ('AI & Machine Learning', 'ai-machine-learning', 'Applied machine learning, data workflows and practical AI integration.', 'Brain', 3, 'published'),
  ('Mobile App Development', 'mobile-app-development', 'Cross-platform and native mobile application development.', 'Smartphone', 4, 'published'),
  ('Software Engineering', 'software-engineering', 'Version control, testing, code review and professional engineering practice.', 'Code2', 5, 'published'),
  ('Cloud & DevOps', 'cloud-devops', 'Deployment pipelines, containers, cloud services and monitoring.', 'Cloud', 6, 'published'),
  ('Database & Backend Development', 'database-backend-development', 'APIs, relational data modelling, authentication and backend architecture.', 'Database', 7, 'published'),
  ('UI/UX Design', 'ui-ux-design', 'Interface design, design systems, prototyping and usability.', 'PenTool', 8, 'published');