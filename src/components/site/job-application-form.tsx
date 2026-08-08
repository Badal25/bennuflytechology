import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Field, inputClass, SubmitButton } from "./form-controls";

const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXT = ["pdf", "doc", "docx"];

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z.string().trim().max(30).optional(),
  location: z.string().trim().max(120).optional(),
  experience: z.string().trim().max(120).optional(),
  education: z.string().trim().max(200).optional(),
  skills: z.string().trim().max(500).optional(),
  linkedin_url: z.string().trim().url("Enter a valid URL").max(255).optional().or(z.literal("")),
  github_url: z.string().trim().url("Enter a valid URL").max(255).optional().or(z.literal("")),
  portfolio_url: z.string().trim().url("Enter a valid URL").max(255).optional().or(z.literal("")),
  cover_letter: z.string().trim().max(3000).optional(),
});

type Job = { id: string; title: string } | null;

export function JobApplicationForm({ job, onDone }: { job: Job; onDone?: () => void }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  function set(key: string, v: string) {
    setValues((s) => ({ ...s, [key]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = String(issue.path[0]);
        if (!next[k]) next[k] = issue.message;
      }
      setErrors(next);
      toast.error("Please correct the highlighted fields.");
      return;
    }
    setErrors({});

    if (file) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!ALLOWED_EXT.includes(ext)) {
        toast.error("Resume must be a PDF, DOC or DOCX file.");
        return;
      }
      if (file.size > MAX_RESUME_BYTES) {
        toast.error("Resume must be smaller than 5 MB.");
        return;
      }
    }

    setBusy(true);
    try {
      let resumePath: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("resumes")
          .upload(path, file, { upsert: false, contentType: file.type || undefined });
        if (upErr) throw upErr;
        resumePath = path;
      }

      const d = parsed.data;
      const { error } = await supabase.from("job_applications").insert({
        job_id: job?.id ?? null,
        position: job?.title ?? values["position"] ?? null,
        full_name: d.full_name,
        email: d.email.toLowerCase(),
        phone: d.phone || null,
        location: d.location || null,
        experience: d.experience || null,
        education: d.education || null,
        skills: d.skills || null,
        linkedin_url: d.linkedin_url || null,
        github_url: d.github_url || null,
        portfolio_url: d.portfolio_url || null,
        cover_letter: d.cover_letter || null,
        resume_path: resumePath,
      });
      if (error) throw error;

      setDone(true);
      toast.success("Application submitted successfully. Our team will review your application.");
      onDone?.();
    } catch {
      toast.error("We could not submit your application right now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-hairline bg-card p-8 text-center">
        <p className="font-display text-lg font-semibold">Application submitted successfully.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Our team will review your application.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Full name" required error={errors["full_name"]}>
        <input className={inputClass} maxLength={100} value={values["full_name"] ?? ""} onChange={(e) => set("full_name", e.target.value)} required />
      </Field>
      <Field label="Email" required error={errors["email"]}>
        <input type="email" className={inputClass} maxLength={255} value={values["email"] ?? ""} onChange={(e) => set("email", e.target.value)} required />
      </Field>
      <Field label="Phone" error={errors["phone"]}>
        <input className={inputClass} maxLength={30} value={values["phone"] ?? ""} onChange={(e) => set("phone", e.target.value)} />
      </Field>
      <Field label="Current location" error={errors["location"]}>
        <input className={inputClass} maxLength={120} value={values["location"] ?? ""} onChange={(e) => set("location", e.target.value)} />
      </Field>
      <Field label="Experience" error={errors["experience"]}>
        <input className={inputClass} placeholder="e.g. Fresher, 2 years" maxLength={120} value={values["experience"] ?? ""} onChange={(e) => set("experience", e.target.value)} />
      </Field>
      <Field label="Education" error={errors["education"]}>
        <input className={inputClass} maxLength={200} value={values["education"] ?? ""} onChange={(e) => set("education", e.target.value)} />
      </Field>
      <Field label="Skills" className="sm:col-span-2" error={errors["skills"]}>
        <input className={inputClass} placeholder="React, Node.js, Python" maxLength={500} value={values["skills"] ?? ""} onChange={(e) => set("skills", e.target.value)} />
      </Field>
      <Field label="LinkedIn" error={errors["linkedin_url"]}>
        <input className={inputClass} placeholder="https://" maxLength={255} value={values["linkedin_url"] ?? ""} onChange={(e) => set("linkedin_url", e.target.value)} />
      </Field>
      <Field label="GitHub" error={errors["github_url"]}>
        <input className={inputClass} placeholder="https://" maxLength={255} value={values["github_url"] ?? ""} onChange={(e) => set("github_url", e.target.value)} />
      </Field>
      <Field label="Portfolio" className="sm:col-span-2" error={errors["portfolio_url"]}>
        <input className={inputClass} placeholder="https://" maxLength={255} value={values["portfolio_url"] ?? ""} onChange={(e) => set("portfolio_url", e.target.value)} />
      </Field>
      <Field label="Cover letter" className="sm:col-span-2" error={errors["cover_letter"]}>
        <textarea rows={5} className={inputClass} maxLength={3000} value={values["cover_letter"] ?? ""} onChange={(e) => set("cover_letter", e.target.value)} />
      </Field>
      <Field label="Resume (PDF, DOC or DOCX — max 5 MB)" className="sm:col-span-2">
        <input
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary"
        />
      </Field>
      <div className="sm:col-span-2">
        <SubmitButton busy={busy}>Submit application</SubmitButton>
        <p className="mt-3 text-xs text-muted-foreground">
          Your resume is stored privately and is only accessible to the Bennufly hiring team.
        </p>
      </div>
    </form>
  );
}