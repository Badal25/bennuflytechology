import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FALLBACK_SETTINGS } from "./site";

/** Thin typed read helpers over Lovable Cloud. Public reads are guarded by RLS. */

async function unwrap<T>(p: PromiseLike<{ data: T | null; error: { message: string } | null }>) {
  const { data, error } = await p;
  if (error) throw new Error(error.message);
  return data as T;
}

export type Settings = {
  id: string;
  company_name: string;
  tagline: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  whatsapp_message: string | null;
  address: string | null;
  linkedin: string | null;
  instagram: string | null;
  facebook: string | null;
  github: string | null;
  youtube: string | null;
  working_hours: string | null;
  logo: string | null;
  footer_text: string | null;
  copyright: string | null;
  booking_url: string | null;
  ai_chat_enabled: boolean;
};

export function useSettings() {
  const q = useQuery({
    queryKey: ["website_settings"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () =>
      unwrap(supabase.from("website_settings").select("*").limit(1).maybeSingle()),
  });
  const settings = (q.data ?? null) as Settings | null;
  return {
    ...q,
    settings: {
      ...FALLBACK_SETTINGS,
      ...(settings ?? {}),
    } as Settings & typeof FALLBACK_SETTINGS,
  };
}

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () =>
      unwrap(
        supabase
          .from("services")
          .select("*")
          .eq("status", "published")
          .order("sort_order", { ascending: true }),
      ),
  });
}

export function useService(slug: string) {
  return useQuery({
    queryKey: ["service", slug],
    queryFn: async () =>
      unwrap(supabase.from("services").select("*").eq("slug", slug).maybeSingle()),
  });
}

export function useTechnologies() {
  return useQuery({
    queryKey: ["technologies"],
    queryFn: async () =>
      unwrap(
        supabase
          .from("technologies")
          .select("*")
          .eq("status", "published")
          .order("category")
          .order("sort_order"),
      ),
  });
}

export function useProjects(featuredOnly = false) {
  return useQuery({
    queryKey: ["projects", featuredOnly],
    queryFn: async () => {
      let q = supabase
        .from("portfolio_projects")
        .select("*")
        .eq("status", "published")
        .order("sort_order");
      if (featuredOnly) q = q.eq("featured", true);
      return unwrap(q);
    },
  });
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: ["project", slug],
    queryFn: async () =>
      unwrap(supabase.from("portfolio_projects").select("*").eq("slug", slug).maybeSingle()),
  });
}

export function useIndustries() {
  return useQuery({
    queryKey: ["industries"],
    queryFn: async () =>
      unwrap(
        supabase.from("industries").select("*").eq("status", "published").order("sort_order"),
      ),
  });
}

export function useJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: async () =>
      unwrap(
        supabase
          .from("jobs")
          .select("*")
          .eq("status", "published")
          .order("featured", { ascending: false })
          .order("created_at", { ascending: false }),
      ),
  });
}

export function useJob(slug: string) {
  return useQuery({
    queryKey: ["job", slug],
    queryFn: async () => unwrap(supabase.from("jobs").select("*").eq("slug", slug).maybeSingle()),
  });
}

export function useBlogs() {
  return useQuery({
    queryKey: ["blogs"],
    queryFn: async () =>
      unwrap(
        supabase
          .from("blogs")
          .select("*")
          .eq("status", "published")
          .order("published_at", { ascending: false, nullsFirst: false }),
      ),
  });
}

export function useBlog(slug: string) {
  return useQuery({
    queryKey: ["blog", slug],
    queryFn: async () => unwrap(supabase.from("blogs").select("*").eq("slug", slug).maybeSingle()),
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: async () =>
      unwrap(
        supabase.from("testimonials").select("*").eq("status", "published").order("sort_order"),
      ),
  });
}

export function useFaqs() {
  return useQuery({
    queryKey: ["faqs"],
    queryFn: async () =>
      unwrap(supabase.from("faqs").select("*").eq("status", "published").order("sort_order")),
  });
}

export function useTeam() {
  return useQuery({
    queryKey: ["team"],
    queryFn: async () =>
      unwrap(
        supabase.from("team_members").select("*").eq("status", "published").order("sort_order"),
      ),
  });
}

export function useStats() {
  return useQuery({
    queryKey: ["site_stats"],
    queryFn: async () =>
      unwrap(supabase.from("site_stats").select("*").eq("status", "published").order("sort_order")),
  });
}