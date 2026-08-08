import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, MapPin, Clock, Laptop, CalendarDays } from "lucide-react";
import { SiteShell, PageHero } from "@/components/site/site-shell";
import { Section, Reveal, EmptyState, CardSkeleton, ErrorState, SectionHeading } from "@/components/site/primitives";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { JobApplicationForm } from "@/components/site/job-application-form";
import { useJobs } from "@/lib/db";

const T = "Careers at Bennufly Technology";
const D = "Full-time, internship, freelance and remote opportunities at Bennufly Technology Pvt. Ltd., Nagpur.";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/careers" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/careers" }],
  }),
  component: CareersPage,
});

const OPPORTUNITY_TYPES = [
  { icon: Briefcase, title: "Full-time", text: "Core team roles across engineering, design and delivery." },
  { icon: Laptop, title: "Internships", text: "Structured internships for students working on real projects." },
  { icon: Clock, title: "Freelance", text: "Project-based collaborations with specialists." },
  { icon: MapPin, title: "Remote", text: "Remote-first by default, with flexible working." },
];

function CareersPage() {
  const { data, isLoading, error } = useJobs();
  const jobs = (data ?? []) as any[];
  const [active, setActive] = useState<any | null>(null);

  return (
    <SiteShell>
      <PageHero
        eyebrow="Careers"
        title="Build the future with Bennufly."
        description="We are a young technology company in Nagpur building products, platforms and AI solutions — and we hire people who want to build with us."
      />

      <Section>
        <SectionHeading
          eyebrow="How we work with people"
          title="Opportunities at Bennufly"
          description="We work remote-first, so most roles do not require relocation."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {OPPORTUNITY_TYPES.map((o, i) => (
            <Reveal key={o.title} delay={i * 50}>
              <div className="h-full rounded-2xl border border-hairline bg-card p-6">
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <o.icon className="size-4.5" />
                </span>
                <h3 className="mt-4 font-display font-semibold">{o.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{o.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <SectionHeading eyebrow="Open roles" title="Current openings" />
        <div className="mt-10">
          {isLoading ? (
            <CardSkeleton count={3} />
          ) : error ? (
            <ErrorState message="We could not load open positions right now." />
          ) : !jobs.length ? (
            <EmptyState
              title="No open positions at the moment."
              description="Check back soon — we publish new roles here as the team grows."
            />
          ) : (
            <div className="grid gap-4">
              {jobs.map((job, i) => (
                <Reveal key={job.id} delay={i * 40}>
                  <JobCard job={job} onApply={() => setActive(job)} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </Section>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply — {active?.title}</DialogTitle>
          </DialogHeader>
          {active && (
            <JobApplicationForm job={{ id: active.id, title: active.title }} />
          )}
        </DialogContent>
      </Dialog>
    </SiteShell>
  );
}

function JobCard({ job, onApply }: { job: any; onApply: () => void }) {
  return (
    <div className="rounded-2xl border border-hairline bg-card p-6 transition-colors hover:border-primary/40">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-semibold">{job.title}</h3>
            {job.featured && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary uppercase">
                Featured
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            {job.department && <span>{job.department}</span>}
            {job.employment_type && <span className="inline-flex items-center gap-1"><Briefcase className="size-3" />{job.employment_type}</span>}
            {job.work_mode && <span className="inline-flex items-center gap-1"><Laptop className="size-3" />{job.work_mode}</span>}
            {job.location && <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{job.location}</span>}
            {job.experience && <span className="inline-flex items-center gap-1"><Clock className="size-3" />{job.experience}</span>}
            {job.deadline && (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3" />
                Apply by {new Date(job.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
          </div>
          {job.description && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {job.description}
            </p>
          )}
          {!!(job.skills ?? []).length && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {(job.skills as string[]).map((s) => (
                <span key={s} className="rounded-md bg-surface px-2 py-0.5 text-[11px] text-muted-foreground">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onApply}
          className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Apply
        </button>
      </div>
    </div>
  );
}