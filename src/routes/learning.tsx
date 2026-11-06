import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  Clock,
  ExternalLink,
  FolderGit2,
  GraduationCap,
  Hammer,
  MapPin,
  Search,
  TrendingUp,
  Users,
  Sparkles,
} from "lucide-react";
import { SiteShell, PageHero } from "@/components/site/site-shell";
import { Section, Reveal, SectionHeading, EmptyState, CardSkeleton } from "@/components/site/primitives";
import { InternshipApplicationForm } from "@/components/site/internship-application-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  useLearningCategories,
  useLearningPrograms,
  useLearningResources,
  formatDate,
  type LearningProgram,
} from "@/lib/learning";

const T = "Learning & Internships — Bennufly Technology";
const D =
  "Practical technology learning and internship opportunities designed to help students build real-world skills through hands-on projects.";

export const Route = createFileRoute("/learning")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:url", content: "https://bennufly.in/learning" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: T },
      { name: "twitter:description", content: D },
    ],
    links: [{ rel: "canonical", href: "https://bennufly.in/learning" }],
  }),
  component: LearningPage,
});

const PILLARS = [
  {
    icon: BookOpen,
    title: "Technical Learning",
    text: "Structured fundamentals across programming, web, backend and data — taught the way they are used in production work, not as isolated theory.",
  },
  {
    icon: FolderGit2,
    title: "Project-Based Learning",
    text: "Every track is anchored to a buildable outcome. You write code, review it, break it, fix it and ship something you can explain end to end.",
  },
  {
    icon: GraduationCap,
    title: "Internship Programs",
    text: "Remote-first internship and project-based programs with defined durations, eligibility and skills covered. Applications are reviewed individually.",
  },
  {
    icon: Users,
    title: "Mentorship",
    text: "Guidance from the Bennufly team on engineering practice — version control, code review, testing, collaboration and clear communication.",
  },
  {
    icon: Brain,
    title: "AI & Emerging Technologies",
    text: "Applied exposure to machine learning workflows, AI-assisted development and the tooling shaping how modern software gets built.",
  },
  {
    icon: TrendingUp,
    title: "Career Development",
    text: "Portfolio quality, technical communication and interview readiness — practical work you can demonstrate and discuss with confidence.",
  },
];

function LearningPage() {
  const categories = useLearningCategories();
  const programs = useLearningPrograms();
  const resources = useLearningResources();

  const [applyFor, setApplyFor] = useState<LearningProgram | null | undefined>(undefined);
  const [programCategory, setProgramCategory] = useState("all");
  const [programType, setProgramType] = useState("all");
  const [programSearch, setProgramSearch] = useState("");
  const [resourceCategory, setResourceCategory] = useState("all");
  const [resourceType, setResourceType] = useState("all");
  const [resourceSearch, setResourceSearch] = useState("");

  const cats = categories.data ?? [];

  const filteredPrograms = useMemo(() => {
    const s = programSearch.trim().toLowerCase();
    return (programs.data ?? []).filter(
      (p) =>
        (programCategory === "all" || p.category === programCategory) &&
        (programType === "all" || p.program_type === programType) &&
        (!s ||
          [p.name, p.description, p.category, (p.skills ?? []).join(" ")]
            .some((v) => String(v ?? "").toLowerCase().includes(s))),
    );
  }, [programs.data, programCategory, programType, programSearch]);

  const filteredResources = useMemo(() => {
    const s = resourceSearch.trim().toLowerCase();
    return (resources.data ?? []).filter(
      (r) =>
        (resourceCategory === "all" || r.category === resourceCategory) &&
        (resourceType === "all" || r.resource_type === resourceType) &&
        (!s || [r.title, r.description, r.category].some((v) => String(v ?? "").toLowerCase().includes(s))),
    );
  }, [resources.data, resourceCategory, resourceType, resourceSearch]);

  const programTypes = useMemo(
    () => Array.from(new Set((programs.data ?? []).map((p) => p.program_type))).sort(),
    [programs.data],
  );
  const resourceTypes = useMemo(
    () => Array.from(new Set((resources.data ?? []).map((r) => r.resource_type))).sort(),
    [resources.data],
  );

  return (
    <SiteShell>
      <PageHero
        eyebrow="Learning & Internships"
        title="Learn. Build. Intern. Grow."
        description={D}
      >
        <div className="flex flex-wrap gap-3">
          <a
            href="#internship-programs"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            View internship programs <ArrowRight className="size-4" />
          </a>
          <a
            href="#learning-resources"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-6 py-3 text-sm font-semibold transition-colors hover:border-primary/50"
          >
            Browse learning resources
          </a>
        </div>
      </PageHero>

      {/* Six pillars */}
      <Section>
        <SectionHeading
          eyebrow="What we offer"
          title="A learning ecosystem built around real engineering work."
          description="Six areas that shape how students learn and contribute at Bennufly."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 60}>
              <div className="group h-full rounded-2xl border border-hairline bg-card p-7 transition-colors hover:border-primary/40">
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <p.icon className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold">{p.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Learning paths / categories */}
      <Section id="learning-paths" className="pt-0">
        <SectionHeading
          eyebrow="Learning paths"
          title="Choose a direction."
          description="Categories are maintained by our team and shape both internship programs and learning resources."
        />
        <div className="mt-12">
          {categories.isLoading ? (
            <CardSkeleton count={6} />
          ) : cats.length === 0 ? (
            <EmptyState title="Learning paths coming soon" description="We are preparing the first set of learning paths." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {cats.map((c, i) => (
                <Reveal key={c.id} delay={i * 40}>
                  <button
                    type="button"
                    onClick={() => {
                      setProgramCategory(c.name);
                      setResourceCategory(c.name);
                      document.getElementById("internship-programs")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`h-full w-full rounded-2xl border p-6 text-left transition-colors ${
                      programCategory === c.name
                        ? "border-primary/60 bg-primary/5"
                        : "border-hairline bg-card hover:border-primary/40"
                    }`}
                  >
                    <Sparkles className="size-4 text-primary" />
                    <p className="mt-4 font-display font-semibold">{c.name}</p>
                    {c.description && (
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{c.description}</p>
                    )}
                  </button>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Internship programs */}
      <Section id="internship-programs" className="pt-0">
        <SectionHeading
          eyebrow="Internship programs"
          title="Open programs."
          description="Only currently published programs appear here. Each application is reviewed individually — we do not promise placement or employment."
        />

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={programSearch}
              onChange={(e) => setProgramSearch(e.target.value)}
              placeholder="Search programs or skills…"
              aria-label="Search internship programs"
              className="w-full rounded-lg border border-border bg-surface py-2.5 pr-3.5 pl-9 text-sm outline-none focus:border-primary"
            />
          </div>
          <select
            value={programCategory}
            onChange={(e) => setProgramCategory(e.target.value)}
            aria-label="Filter programs by category"
            className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary"
          >
            <option value="all">All categories</option>
            {cats.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={programType}
            onChange={(e) => setProgramType(e.target.value)}
            aria-label="Filter programs by type"
            className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary"
          >
            <option value="all">All types</option>
            {programTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-8">
          {programs.isLoading ? (
            <CardSkeleton count={3} />
          ) : filteredPrograms.length === 0 ? (
            <EmptyState
              title="No open programs right now"
              description="New internship and project-based programs are published here as they open. You can still send us a general application below."
              icon={<GraduationCap className="size-7" />}
            />
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {filteredPrograms.map((p, i) => (
                <Reveal key={p.id} delay={i * 50}>
                  <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-hairline bg-card">
                    {p.thumbnail && (
                      <img
                        src={p.thumbnail}
                        alt={`${p.name} program`}
                        loading="lazy"
                        className="h-40 w-full object-cover"
                      />
                    )}
                    <div className="flex flex-1 flex-col p-7">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                          {p.program_type}
                        </span>
                        {p.category && (
                          <span className="rounded-full border border-hairline px-2.5 py-1 text-[11px] text-muted-foreground">
                            {p.category}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-4 font-display text-xl font-semibold">{p.name}</h3>
                      {p.description && (
                        <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                      )}

                      <dl className="mt-5 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                        {p.duration && <Meta icon={Clock} label="Duration" value={p.duration} />}
                        <Meta icon={MapPin} label="Mode" value={p.mode} />
                        {formatDate(p.start_date) && (
                          <Meta icon={CalendarDays} label="Starts" value={formatDate(p.start_date)!} />
                        )}
                        {formatDate(p.application_deadline) && (
                          <Meta icon={CalendarDays} label="Apply by" value={formatDate(p.application_deadline)!} />
                        )}
                        {typeof p.seats === "number" && (
                          <Meta icon={Users} label="Seats" value={String(p.seats)} />
                        )}
                      </dl>

                      {p.eligibility && (
                        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                          <span className="font-semibold text-foreground">Eligibility: </span>
                          {p.eligibility}
                        </p>
                      )}

                      {(p.skills ?? []).length > 0 && (
                        <ul className="mt-4 flex flex-wrap gap-1.5">
                          {p.skills.map((s) => (
                            <li key={s} className="rounded-md bg-surface px-2 py-1 text-[11px] text-muted-foreground">
                              {s}
                            </li>
                          ))}
                        </ul>
                      )}

                      <button
                        type="button"
                        onClick={() => setApplyFor(p)}
                        className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                      >
                        Apply now <ArrowRight className="size-4" />
                      </button>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 rounded-2xl border border-hairline bg-card p-7 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p className="font-display text-lg font-semibold">Nothing matching your interest?</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Send a general internship application and we will consider you for upcoming programs.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setApplyFor(null)}
            className="mt-5 inline-flex shrink-0 items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-semibold transition-colors hover:border-primary/50 sm:mt-0"
          >
            General application <ArrowRight className="size-4" />
          </button>
        </div>
      </Section>

      {/* Learning resources */}
      <Section id="learning-resources" className="pt-0">
        <SectionHeading
          eyebrow="Learning resources"
          title="Study material, roadmaps and practice work."
          description="Tutorials, notes, projects and roadmaps published by the Bennufly team."
        />

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={resourceSearch}
              onChange={(e) => setResourceSearch(e.target.value)}
              placeholder="Search resources…"
              aria-label="Search learning resources"
              className="w-full rounded-lg border border-border bg-surface py-2.5 pr-3.5 pl-9 text-sm outline-none focus:border-primary"
            />
          </div>
          <select
            value={resourceCategory}
            onChange={(e) => setResourceCategory(e.target.value)}
            aria-label="Filter resources by category"
            className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary"
          >
            <option value="all">All categories</option>
            {cats.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value)}
            aria-label="Filter resources by type"
            className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary"
          >
            <option value="all">All types</option>
            {resourceTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-8">
          {resources.isLoading ? (
            <CardSkeleton count={3} />
          ) : filteredResources.length === 0 ? (
            <EmptyState
              title="No resources published yet"
              description="Learning material will appear here as our team publishes it."
              icon={<BookOpen className="size-7" />}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredResources.map((r, i) => (
                <Reveal key={r.id} delay={i * 40}>
                  <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-hairline bg-card transition-colors hover:border-primary/40">
                    {r.thumbnail && (
                      <img src={r.thumbnail} alt={r.title} loading="lazy" className="h-36 w-full object-cover" />
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                          {r.resource_type}
                        </span>
                        <span className="rounded-full border border-hairline px-2.5 py-1 text-muted-foreground">
                          {r.difficulty}
                        </span>
                      </div>
                      <h3 className="mt-4 font-display font-semibold">{r.title}</h3>
                      {r.category && <p className="mt-1 text-xs text-muted-foreground">{r.category}</p>}
                      {r.description && (
                        <p className="mt-2.5 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                          {r.description}
                        </p>
                      )}
                      {r.url && (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-5 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                        >
                          Open resource <ExternalLink className="size-3.5" />
                        </a>
                      )}
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Closing */}
      <Section className="pt-0">
        <div className="relative overflow-hidden rounded-3xl border border-hairline bg-card px-6 py-14 text-center sm:px-10">
          <div className="pointer-events-none absolute inset-0" style={{ background: "var(--gradient-hero)" }} aria-hidden />
          <div className="relative">
            <SectionHeading
              align="center"
              title="Start with real work, not just theory."
              description="Apply to an open program or send a general application. Every application is reviewed by our team."
            />
            <button
              type="button"
              onClick={() => setApplyFor(null)}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Apply for an internship <Hammer className="size-4" />
            </button>
          </div>
        </div>
      </Section>

      <Dialog open={applyFor !== undefined} onOpenChange={(v) => !v && setApplyFor(undefined)}>
        <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{applyFor ? `Apply — ${applyFor.name}` : "Internship application"}</DialogTitle>
          </DialogHeader>
          <InternshipApplicationForm program={applyFor ?? null} categories={cats} />
        </DialogContent>
      </Dialog>
    </SiteShell>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-primary" />
      <div>
        <dt className="text-[11px] uppercase tracking-wide">{label}</dt>
        <dd className="text-foreground">{value}</dd>
      </div>
    </div>
  );
}
