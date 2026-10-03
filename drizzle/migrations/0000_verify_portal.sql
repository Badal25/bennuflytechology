ALTER TABLE public.internship_applications ADD COLUMN IF NOT EXISTS application_number text;

CREATE OR REPLACE FUNCTION public.set_application_number()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
begin
  if new.application_number is null or new.application_number = '' then
    new.application_number := 'BNF-APP-' || upper(substr(replace(new.id::text,'-',''),1,8));
  end if;
  return new;
end; $$;

DROP TRIGGER IF EXISTS t_internship_app_number ON public.internship_applications;
CREATE TRIGGER t_internship_app_number BEFORE INSERT ON public.internship_applications
FOR EACH ROW EXECUTE FUNCTION public.set_application_number();

UPDATE public.internship_applications
SET application_number = 'BNF-APP-' || upper(substr(replace(id::text,'-',''),1,8))
WHERE application_number IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS internship_applications_app_number_key ON public.internship_applications(application_number);

CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id text NOT NULL UNIQUE,
  application_id uuid REFERENCES public.internship_applications(id) ON DELETE SET NULL,
  recipient_name text NOT NULL,
  recipient_email text,
  program_name text NOT NULL,
  domain text,
  duration text,
  start_date date,
  end_date date,
  issue_date date NOT NULL DEFAULT current_date,
  performance text,
  status text NOT NULL DEFAULT 'valid' CHECK (status IN ('valid','revoked')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.set_certificate_id()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
begin
  if new.certificate_id is null or new.certificate_id = '' then
    new.certificate_id := 'BNF-CERT-' || to_char(coalesce(new.issue_date, current_date),'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));
  end if;
  new.certificate_id := upper(trim(new.certificate_id));
  return new;
end; $$;

CREATE TRIGGER t_certificates_id BEFORE INSERT ON public.certificates FOR EACH ROW EXECUTE FUNCTION public.set_certificate_id();
CREATE TRIGGER t_certificates BEFORE UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "HR manage certificates" ON public.certificates FOR ALL TO authenticated
USING (public.can_manage_hr(auth.uid())) WITH CHECK (public.can_manage_hr(auth.uid()));

CREATE OR REPLACE FUNCTION public.verify_certificate(_certificate_id text)
RETURNS TABLE(certificate_id text, recipient_name text, program_name text, domain text, duration text, start_date date, end_date date, issue_date date, performance text, status text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select c.certificate_id, c.recipient_name, c.program_name, c.domain, c.duration, c.start_date, c.end_date, c.issue_date, c.performance, c.status
  from public.certificates c
  where c.certificate_id = upper(trim(_certificate_id)) and length(trim(_certificate_id)) between 6 and 40
  limit 1
$$;

CREATE OR REPLACE FUNCTION public.track_internship_application(_application_number text, _email text)
RETURNS TABLE(application_number text, first_name text, program_name text, interested_domain text, status text, submitted_at timestamptz, updated_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select a.application_number, split_part(a.full_name,' ',1), coalesce(a.program_name,'General Internship Application'), a.interested_domain, a.status, a.created_at, a.updated_at
  from public.internship_applications a
  where a.application_number = upper(trim(_application_number))
    and lower(a.email) = lower(trim(_email))
  limit 1
$$;

REVOKE ALL ON FUNCTION public.verify_certificate(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.track_internship_application(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.track_internship_application(text, text) TO anon, authenticated;