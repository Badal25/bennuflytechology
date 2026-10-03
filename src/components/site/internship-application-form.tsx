import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Field, inputClass, SubmitButton, HoneypotField } from "./form-controls";
import { useSpamGuard } from "@/lib/spam-guard";
import type { LearningProgram, LearningCategory } from "@/lib/learning";

const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXT = ["pdf", "doc", "docx"];

const optionalUrl = z.string().trim().url("Enter a valid URL").max(255).optional().or(z.literal(""));

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z.string().trim().min(6, "Enter a valid phone number").max(30),
  college: z.string().trim().min(2, "Enter your college or university").max(160),
  course: z.string().trim().min(2, "Enter your course").max(160),
  graduation_year: z
    .string()
    .trim()
    .regex(/^(19|20)\d{2}$/, "Enter a valid year, e.g. 2027"),
  skills: z.string().trim().min(2, "List a few skills").max(500),
  interested_domain: z.string().trim().min(2, "Select an area of interest").max(120),
  linkedin_url: optionalUrl,
  github_url: optionalUrl,
  portfolio_url: optionalUrl,
  motivation: z
    .string()
    .trim()
    .min(20, "Tell us a little more (at least 20 characters)")
    .max(2000),
});

export function InternshipApplicationForm({
  program,
  categories = [],
  onDone,
}: {
  program?: LearningProgram | null;
  categories?: LearningCategory[];
  onDone?: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({
    interested_domain: program?.category ?? "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const guard = useSpamGuard("internship-application");

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

    const spam = guard.check();
    if (!spam.ok) {
      toast.error(spam.reason);
      return;
    }

    if (!file) {
      toast.error("Please attach your resume (PDF, DOC or DOCX).");
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXT.includes(ext)) {
      toast.error("Resume must be a PDF, DOC or DOCX file.");
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      toast.error("Resume must be smaller than 5 MB.");
      return;
    }

    setBusy(true);
    try {
      const path = `internships/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("resumes")
        .upload(path, file, { upsert: false, contentType: file.type || "application/octet-stream" });
      if (upErr) throw upErr;

      const d = parsed.data;
      const newId = crypto.randomUUID();
      const appNumber = `BNF-APP-${newId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
      const { error } = await supabase.from("internship_applications").insert({
        id: newId,
        application_number: appNumber,
        program_id: program?.id ?? null,
        program_name: program?.name ?? null,
        full_name: d.full_name,
        email: d.email.toLowerCase(),
        phone: d.phone,
        college: d.college,
        course: d.course,
        graduation_year: d.graduation_year,
        skills: d.skills,
        interested_domain: d.interested_domain,
        linkedin_url: d.linkedin_url || null,
        github_url: d.github_url || null,
        portfolio_url: d.portfolio_url || null,
        motivation: d.motivation,
        resume_path: path,
      });
      if (error) throw error;

      setDone(appNumber);
      guard.markSubmitted();
      toast.success("Application submitted successfully.");
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
        <p className="mt-3 text-sm text-muted-foreground">Your application ID</p>
        <p className="mt-1 font-mono text-xl font-semibold text-brand">{done}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Save this ID. Use it with your email to track your application status anytime.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-hairline px-3 py-2 text-sm"
            onClick={() => navigator.clipboard.writeText(done)}
          >
            Copy ID
          </button>
          <a href={`/verify?tab=application&app=${done}`} className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
            Track status
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <HoneypotField onChange={guard.setHoneypot} />

      {program && (
        <div className="rounded-xl border border-hairline bg-surface px-4 py-3 text-sm sm:col-span-2">
          <span className="text-muted-foreground">Applying for </span>
          <span className="font-semibold text-foreground">{program.name}</span>
        </div>
      )}

      <Field label="Full name" required error={errors["full_name"]}>
        <input className={inputClass} maxLength={100} value={values["full_name"] ?? ""} onChange={(e) => set("full_name", e.target.value)} required />
      </Field>
      <Field label="Email" required error={errors["email"]}>
        <input type="email" className={inputClass} maxLength={255} value={values["email"] ?? ""} onChange={(e) => set("email", e.target.value)} required />
      </Field>
      <Field label="Phone" required error={errors["phone"]}>
        <input className={inputClass} maxLength={30} value={values["phone"] ?? ""} onChange={(e) => set("phone", e.target.value)} required />
      </Field>
      <Field label="College / University" required error={errors["college"]}>
        <input className={inputClass} maxLength={160} value={values["college"] ?? ""} onChange={(e) => set("college", e.target.value)} required />
      </Field>
      <Field label="Course" required error={errors["course"]}>
        <input className={inputClass} placeholder="e.g. B.Tech Computer Science" maxLength={160} value={values["course"] ?? ""} onChange={(e) => set("course", e.target.value)} required />
      </Field>
      <Field label="Graduation year" required error={errors["graduation_year"]}>
        <input className={inputClass} inputMode="numeric" placeholder="2027" maxLength={4} value={values["graduation_year"] ?? ""} onChange={(e) => set("graduation_year", e.target.value)} required />
      </Field>
      <Field label="Interested domain" required className="sm:col-span-2" error={errors["interested_domain"]}>
        {categories.length > 0 ? (
          <select
            className={inputClass}
            value={values["interested_domain"] ?? ""}
            onChange={(e) => set("interested_domain", e.target.value)}
            required
          >
            <option value="">Select a domain…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        ) : (
          <input className={inputClass} maxLength={120} value={values["interested_domain"] ?? ""} onChange={(e) => set("interested_domain", e.target.value)} required />
        )}
      </Field>
      <Field label="Skills" required className="sm:col-span-2" error={errors["skills"]}>
        <input className={inputClass} placeholder="React, Python, SQL…" maxLength={500} value={values["skills"] ?? ""} onChange={(e) => set("skills", e.target.value)} required />
      </Field>
      <Field label="LinkedIn" error={errors["linkedin_url"]}>
        <input className={inputClass} placeholder="https://" maxLength={255} value={values["linkedin_url"] ?? ""} onChange={(e) => set("linkedin_url", e.target.value)} />
      </Field>
      <Field label="GitHub" error={errors["github_url"]}>
        <input className={inputClass} placeholder="https://" maxLength={255} value={values["github_url"] ?? ""} onChange={(e) => set("github_url", e.target.value)} />
      </Field>
      <Field label="Portfolio URL" className="sm:col-span-2" error={errors["portfolio_url"]}>
        <input className={inputClass} placeholder="https://" maxLength={255} value={values["portfolio_url"] ?? ""} onChange={(e) => set("portfolio_url", e.target.value)} />
      </Field>
      <Field label="Why do you want to join?" required className="sm:col-span-2" error={errors["motivation"]}>
        <textarea rows={5} className={inputClass} maxLength={2000} value={values["motivation"] ?? ""} onChange={(e) => set("motivation", e.target.value)} required />
      </Field>
      <Field label="Resume (PDF, DOC or DOCX — max 5 MB)" required className="sm:col-span-2">
        <input
          type="file"
          required
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary"
        />
      </Field>

      <div className="sm:col-span-2">
        <SubmitButton busy={busy}>Submit application</SubmitButton>
        <p className="mt-3 text-xs text-muted-foreground">
          Your resume is stored privately and is only accessible to the Bennufly team. No account is required to apply.
        </p>
      </div>
    </form>
  );
}
