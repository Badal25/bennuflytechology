import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Public read helpers for the Learning & Internships ecosystem. Guarded by RLS. */

async function unwrap<T>(p: PromiseLike<{ data: T | null; error: { message: string } | null }>) {
  const { data, error } = await p;
  if (error) throw new Error(error.message);
  return data as T;
}

export const PROGRAM_TYPES = [
  "Full-Time",
  "Part-Time",
  "Internship",
  "Project-Based",
  "Freelance",
] as const;

export const WORK_MODES = ["Remote", "Hybrid"] as const;

export const RESOURCE_TYPES = [
  "Tutorial",
  "Article",
  "Notes",
  "Video",
  "Project",
  "Assignment",
  "Roadmap",
  "External Resource",
] as const;

export const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;

export const INTERNSHIP_APPLICATION_STATUSES = [
  "New",
  "Under Review",
  "Shortlisted",
  "Selected",
  "Active",
  "Completed",
  "Rejected",
] as const;

export type LearningCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
};

export type LearningProgram = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  description: string | null;
  duration: string | null;
  mode: string;
  program_type: string;
  eligibility: string | null;
  skills: string[];
  start_date: string | null;
  application_deadline: string | null;
  seats: number | null;
  thumbnail: string | null;
  featured: boolean;
};

export type LearningResource = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  resource_type: string;
  difficulty: string;
  thumbnail: string | null;
  content: string | null;
  url: string | null;
};

export function useLearningCategories() {
  return useQuery({
    queryKey: ["learning_categories"],
    queryFn: async () =>
      unwrap<LearningCategory[]>(
        supabase
          .from("learning_categories")
          .select("id, name, slug, description, icon, sort_order")
          .eq("status", "published")
          .order("sort_order") as any,
      ),
  });
}

export function useLearningPrograms() {
  return useQuery({
    queryKey: ["learning_programs", "public"],
    queryFn: async () =>
      unwrap<LearningProgram[]>(
        supabase
          .from("learning_programs")
          .select("*")
          .eq("status", "published")
          .order("featured", { ascending: false })
          .order("sort_order") as any,
      ),
  });
}

export function useLearningResources() {
  return useQuery({
    queryKey: ["learning_resources", "public"],
    queryFn: async () =>
      unwrap<LearningResource[]>(
        supabase
          .from("learning_resources")
          .select("*")
          .eq("status", "published")
          .order("sort_order")
          .order("created_at", { ascending: false }) as any,
      ),
  });
}

export function formatDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
