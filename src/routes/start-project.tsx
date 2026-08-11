import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { SiteShell, PageHero } from "@/components/site/site-shell";
import { Section, Reveal } from "@/components/site/primitives";
import { Field, inputClass, SubmitButton } from "@/components/site/form-controls";
import { supabase } from "@/integrations/supabase/client";
import { useServices } from "@/lib/db";
import { BUDGETS, TIMELINES } from "@/lib/site";

const T = "Start a Project with Bennufly Technology";
const D = "Tell us about your product idea and get a tailored proposal from Bennufly Technology Pvt. Ltd.";

export const Route = createFileRoute("/start-project")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/start-project" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/start-project" }],
  }),
  component: StartProjectPage,
});

const PROJECT_TYPES = [
  "New product / MVP",
  "Existing product improvement",
  "Website / marketing site",
  "Mobile application",
  "AI / automation",
  "Team extension",
];

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z.string().trim().max(30).optional(),
  company: z.string().trim().max(120).optional(),
  project_type: z.string().trim().min(1, "Select a project type").max(120),
  services: z.array(z.string()).min(1, "Select at least one service"),
  budget: z.string().trim().min(1, "Select a budget").max(80),
  timeline: z.string().trim().min(1, "Select a timeline").max(80),
  description: z.string().trim().min(20, "Please describe your project in a little more detail").max(3000),
});

function StartProjectPage() {
  const { data } = useServices();
  const serviceOptions = ((data ?? []) as any[]).map((s) => s.title as string);

  return (
    <SiteShell>
      <PageHero
        eyebrow="Start a project"
        title="Tell us what you want to build."
        description="Share a few details and we will come back with scope, approach and an indicative estimate."
      />
      <Section>
        <Reveal>
          <QuoteForm serviceOptions={serviceOptions.length ? serviceOptions : PROJECT_TYPES} />
        </Reveal>
      </Section>
    </SiteShell>
  );
}

function QuoteForm({ serviceOptions }: { serviceOptions: string[] }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [services, setServices] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  function set(k: string, v: string) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  function toggleService(s: string) {
    setServices((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ ...values, services });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = String(issue.path[0]);
        if (!next[k]) next[k] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setBusy(true);
    const d = parsed.data;

    const { error: submitError } = await supabase.rpc("submit_project_inquiry", {
      _name: d.name,
      _email: d.email.toLowerCase(),
      _phone: d.phone || "",
      _company: d.company || "",
      _project_type: d.project_type,
      _services: d.services,
      _budget: d.budget,
      _timeline: d.timeline,
      _description: d.description,
    });

    setBusy(false);
    if (submitError) {
      toast.error("We could not submit your request right now. Please try again.");
      return;
    }
    setDone(true);
    toast.success("Thanks for reaching out. Our team will get back to you soon.");
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-hairline bg-card p-12 text-center">
        <CheckCircle2 className="mx-auto size-10 text-primary" />
        <p className="mt-5 font-display text-xl font-semibold">Thanks — your request is in.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Our team will review the details and get back to you with next steps.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-hairline bg-card p-6 sm:grid-cols-2 sm:p-8">
      <Field label="Name" required error={errors["name"]}>
        <input className={inputClass} maxLength={100} value={values["name"] ?? ""} onChange={(e) => set("name", e.target.value)} required />
      </Field>
      <Field label="Email" required error={errors["email"]}>
        <input type="email" className={inputClass} maxLength={255} value={values["email"] ?? ""} onChange={(e) => set("email", e.target.value)} required />
      </Field>
      <Field label="Phone" error={errors["phone"]}>
        <input className={inputClass} maxLength={30} value={values["phone"] ?? ""} onChange={(e) => set("phone", e.target.value)} />
      </Field>
      <Field label="Company" error={errors["company"]}>
        <input className={inputClass} maxLength={120} value={values["company"] ?? ""} onChange={(e) => set("company", e.target.value)} />
      </Field>

      <Field label="Project type" required className="sm:col-span-2" error={errors["project_type"]}>
        <select className={inputClass} value={values["project_type"] ?? ""} onChange={(e) => set("project_type", e.target.value)}>
          <option value="">Select a project type</option>
          {PROJECT_TYPES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Services needed" required className="sm:col-span-2" error={errors["services"]}>
        <div className="flex flex-wrap gap-2 pt-1">
          {serviceOptions.map((s) => {
            const active = services.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active}
                onClick={() => toggleService(s)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-hairline text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Budget" required error={errors["budget"]}>
        <select className={inputClass} value={values["budget"] ?? ""} onChange={(e) => set("budget", e.target.value)}>
          <option value="">Select a budget</option>
          {BUDGETS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Timeline" required error={errors["timeline"]}>
        <select className={inputClass} value={values["timeline"] ?? ""} onChange={(e) => set("timeline", e.target.value)}>
          <option value="">Select a timeline</option>
          {TIMELINES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Project description" required className="sm:col-span-2" error={errors["description"]}>
        <textarea
          rows={7}
          className={inputClass}
          maxLength={3000}
          placeholder="Goals, users, key features, current status…"
          value={values["description"] ?? ""}
          onChange={(e) => set("description", e.target.value)}
          required
        />
      </Field>

      <div className="sm:col-span-2">
        <SubmitButton busy={busy}>Submit request</SubmitButton>
      </div>
    </form>
  );
}