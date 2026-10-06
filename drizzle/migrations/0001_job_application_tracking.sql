ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS application_number text;
UPDATE public.job_applications SET application_number = 'BNF-JOB-' || upper(substr(replace(id::text,'-',''),1,8)) WHERE application_number IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS job_applications_application_number_key ON public.job_applications(application_number);

CREATE OR REPLACE FUNCTION public.set_job_application_number()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.id IS NULL THEN NEW.id := gen_random_uuid(); END IF;
  IF NEW.application_number IS NULL THEN
    NEW.application_number := 'BNF-JOB-' || upper(substr(replace(NEW.id::text,'-',''),1,8));
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_set_job_application_number ON public.job_applications;
CREATE TRIGGER trg_set_job_application_number BEFORE INSERT ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION public.set_job_application_number();

CREATE OR REPLACE FUNCTION public.track_job_application(_application_number text, _email text)
RETURNS TABLE(application_number text, first_name text, position_title text, status text, submitted_at timestamptz, updated_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT a.application_number, split_part(a.full_name,' ',1),
         COALESCE(j.title, a.position, 'General application'), a.status, a.created_at, a.updated_at
  FROM public.job_applications a LEFT JOIN public.jobs j ON j.id = a.job_id
  WHERE upper(a.application_number) = upper(trim(_application_number))
    AND lower(a.email) = lower(trim(_email))
  LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.track_job_application(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_job_application(text,text) TO anon, authenticated;