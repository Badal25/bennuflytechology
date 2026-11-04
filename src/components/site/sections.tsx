import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Quote, Plus, Minus, Linkedin, Github, Instagram, Mail } from "lucide-react";
import { useState } from "react";
import {
  useServices,
  useTechnologies,
  useIndustries,
  useProjects,
  useStats,
  useTestimonials,
  useFaqs,
  useTeam,
} from "@/lib/db";
import { PROCESS_STEPS, WHY_BENNUFLY } from "@/lib/site";
import { DynamicIcon } from "./icon";
import { Section, SectionHeading, Reveal, EmptyState, CardSkeleton } from "./primitives";

export function ServicesGrid({ limit }: { limit?: number }) {
  const { data, isLoading } = useServices();
  const items = (data ?? []).slice(0, limit);

  if (isLoading) return <CardSkeleton count={limit ?? 6} />;
  if (!items.length)
    return <EmptyState title="Services are being published." description="Check back shortly." />;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((s: any, i: number) => (
        <Reveal key={s.id} delay={i * 50}>
          <Link
            to="/services/$slug"
            params={{ slug: s.slug }}
            className="group flex h-full flex-col rounded-2xl border border-hairline bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40"
          >
            <span className="mb-5 inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <DynamicIcon name={s.icon} />
            </span>
            <h3 className="font-display text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
              {s.short_description}
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              Learn more
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

export function TechStackSection() {
  const { data, isLoading } = useTechnologies();
  const items = (data ?? []) as any[];
  const categories = Array.from(new Set(items.map((t) => t.category)));

  if (isLoading) return <CardSkeleton count={3} />;
  if (!items.length)
    return <EmptyState title="Technology stack coming soon." />;

  return (
    <div className="space-y-8">
      {categories.map((cat, ci) => (
        <Reveal key={cat} delay={ci * 40}>
          <div className="grid gap-4 border-t border-hairline pt-6 md:grid-cols-[200px_1fr]">
            <h3 className="font-display text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              {cat}
            </h3>
            <div className="flex flex-wrap gap-2">
              {items
                .filter((t) => t.category === cat)
                .map((t) => (
                  <span
                    key={t.id}
                    className="rounded-lg border border-hairline bg-surface px-3.5 py-2 text-sm font-medium"
                  >
                    {t.name}
                  </span>
                ))}
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export function ProcessTimeline() {
  return (
    <ol className="relative space-y-0 border-l border-hairline pl-0">
      {PROCESS_STEPS.map((s, i) => (
        <Reveal key={s.no} delay={i * 60}>
          <li className="relative grid gap-2 py-6 pl-8 md:grid-cols-[120px_1fr] md:gap-8">
            <span
              className="absolute top-9 -left-[5px] size-2.5 rounded-full bg-primary"
              aria-hidden
            />
            <span className="font-display text-3xl font-bold text-muted-foreground/40">
              {s.no}
            </span>
            <div>
              <h3 className="font-display text-xl font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
            </div>
          </li>
        </Reveal>
      ))}
    </ol>
  );
}

export function IndustriesGrid() {
  const { data, isLoading } = useIndustries();
  const items = (data ?? []) as any[];
  if (isLoading) return <CardSkeleton count={6} />;
  if (!items.length) return <EmptyState title="Industries coming soon." />;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it, i) => (
        <Reveal key={it.id} delay={i * 35}>
          <div className="flex h-full gap-4 rounded-xl border border-hairline bg-card p-5">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <DynamicIcon name={it.icon} className="size-4.5" />
            </span>
            <div className="min-w-0">
              <h3 className="font-display font-semibold">{it.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {it.description}
              </p>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export function FeaturedProject() {
  const { data, isLoading } = useProjects(true);
  const project = (data ?? [])[0] as any;

  if (isLoading) return <CardSkeleton count={1} />;
  if (!project)
    return (
      <EmptyState
        title="Our portfolio is growing."
        description="New projects will appear here soon."
      />
    );

  return (
    <Reveal>
      <Link
        to="/portfolio/$slug"
        params={{ slug: project.slug }}
        className="group grid overflow-hidden rounded-3xl border border-hairline bg-card md:grid-cols-2"
      >
        <div className="relative flex min-h-[240px] items-center justify-center overflow-hidden bg-surface-2">
          {project.cover_image ? (
            <img
              src={project.cover_image}
              alt={project.title}
              className="size-full object-cover"
              loading="lazy"
            />
          ) : (
            <>
              <div
                className="absolute inset-0 opacity-70"
                style={{ background: "var(--gradient-hero)" }}
                aria-hidden
              />
              <span className="relative font-display text-5xl font-extrabold text-muted-foreground/25">
                {project.category}
              </span>
            </>
          )}
        </div>
        <div className="p-8 md:p-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {project.project_status}
          </span>
          <h3 className="mt-5 font-display text-2xl font-bold sm:text-3xl">{project.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {project.short_description}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {(project.technologies ?? []).map((t: string) => (
              <span
                key={t}
                className="rounded-md border border-hairline px-2.5 py-1 text-xs text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
          <span className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            View project
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

export function StatsRow() {
  const { data } = useStats();
  const items = (data ?? []) as any[];
  if (!items.length) return null;

  return (
    <div className="grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
      {items.map((s) => (
        <div key={s.id} className="bg-card px-6 py-8">
          <p className="font-display text-3xl font-bold">
            {s.value ? s.value : <span className="text-xl text-muted-foreground">{s.fallback_text}</span>}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  const { data, isLoading } = useTestimonials();
  const items = (data ?? []) as any[];
  if (isLoading) return null;

  if (!items.length)
    return (
      <EmptyState
        title="Client stories coming soon."
        description="We publish testimonials only once clients have shared them in their own words."
        icon={<Quote className="size-6" />}
      />
    );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((t, i) => (
        <Reveal key={t.id} delay={i * 50}>
          <figure className="flex h-full flex-col rounded-2xl border border-hairline bg-card p-6 transition-colors hover:border-primary/40">
            <div className="flex items-center justify-between">
              <Quote className="size-5 text-primary" />
              {t.rating ? (
                <span className="text-sm tracking-widest text-primary" aria-label={`${t.rating} out of 5`}>
                  {"★".repeat(Math.min(5, t.rating))}
                </span>
              ) : null}
            </div>
            <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
              “{t.message}”
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3 border-t border-hairline pt-4">
              {t.image ? (
                <img src={t.image} alt={t.client_name} className="size-10 rounded-full object-cover" loading="lazy" />
              ) : (
                <span className="grid size-10 place-items-center rounded-full bg-primary/15 font-display text-sm font-semibold text-primary">
                  {String(t.client_name).split(" ").map((w: string) => w[0]).slice(0, 2).join("")}
                </span>
              )}
              <div>
                <p className="font-display text-sm font-semibold">{t.client_name}</p>
                <p className="text-xs text-muted-foreground">
                  {[t.designation, t.company].filter(Boolean).join(", ")}
                </p>
              </div>
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}

export function FaqSection({ limit }: { limit?: number }) {
  const { data, isLoading } = useFaqs();
  const items = ((data ?? []) as any[]).slice(0, limit);
  const [open, setOpen] = useState<string | null>(null);

  if (isLoading) return <CardSkeleton count={2} />;
  if (!items.length) return <EmptyState title="FAQs are being prepared." />;

  return (
    <div className="divide-y divide-hairline border-y border-hairline">
      {items.map((f) => {
        const isOpen = open === f.id;
        return (
          <div key={f.id}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : f.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
            >
              <span className="font-display text-base font-semibold">{f.question}</span>
              {isOpen ? (
                <Minus className="size-4 shrink-0 text-primary" />
              ) : (
                <Plus className="size-4 shrink-0 text-muted-foreground" />
              )}
            </button>
            {isOpen && (
              <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{f.answer}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function WhyBennufly() {
  return (
    <div className="grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
      {WHY_BENNUFLY.map((r, i) => (
        <Reveal key={r.title} delay={i * 40}>
          <div className="h-full bg-card px-6 py-7">
            <h3 className="font-display font-semibold">{r.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

const FOUNDER_FOCUS = [
  "Software & Digital Products",
  "AI & Emerging Technologies",
  "Web & Mobile Applications",
  "Student Learning & Internship Opportunities",
];

type TeamMember = {
  id: string;
  name: string;
  designation: string | null;
  bio: string | null;
  photo: string | null;
  linkedin: string | null;
  github: string | null;
  instagram: string | null;
  email: string | null;
};

function SocialLinks({ m, size = "size-9" }: { m: TeamMember; size?: string }) {
  const links = [
    { url: m.linkedin, label: `${m.name} on LinkedIn`, Icon: Linkedin },
    { url: m.github, label: `${m.name} on GitHub`, Icon: Github },
    { url: m.instagram, label: `${m.name} on Instagram`, Icon: Instagram },
  ].filter((l) => l.url);
  const showEmail = m.email && m.email.includes("@");

  return (
    <div className="flex flex-wrap gap-2">
      {links.map(({ url, label, Icon }) => (
        <a
          key={url}
          href={url!}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={`inline-flex ${size} items-center justify-center rounded-xl border border-hairline bg-card text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary`}
        >
          <Icon className="size-4" />
        </a>
      ))}
      {showEmail && (
        <a
          href={`mailto:${m.email}`}
          aria-label={`Email ${m.name}`}
          className={`inline-flex ${size} items-center justify-center rounded-xl border border-hairline bg-card text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary`}
        >
          <Mail className="size-4" />
        </a>
      )}
    </div>
  );
}

function MemberPhoto({ m, className }: { m: TeamMember; className?: string }) {
  if (m.photo)
    return (
      <img
        src={m.photo}
        alt={`${m.name}, ${m.designation ?? "team member"} at Bennufly Technology`}
        className={className}
        loading="lazy"
      />
    );
  return (
    <span
      className={`flex items-center justify-center font-display font-bold text-primary ${className}`}
    >
      {m.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}

export function TeamSection() {
  const { data, isLoading } = useTeam();
  const members = (data ?? []) as TeamMember[];
  const founder = members.find((m) => /founder/i.test(m.designation ?? ""));
  const others = members.filter((m) => m !== founder);

  if (isLoading) return <CardSkeleton count={2} />;
  if (!members.length)
    return (
      <EmptyState
        title="Team profiles coming soon."
        description="Bennufly is a founder-led startup. Team members are published here as the team grows."
      />
    );

  return (
    <div className="space-y-14">
      {founder && (
        <Reveal>
          <article className="relative overflow-hidden rounded-3xl border border-hairline bg-card">
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "var(--gradient-hero)" }}
              aria-hidden
            />
            <div className="relative grid gap-10 p-8 sm:p-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-center lg:gap-14">
              <div className="relative mx-auto w-full max-w-sm lg:mx-0">
                <div
                  className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-primary/15 blur-2xl"
                  aria-hidden
                />
                <div className="relative overflow-hidden rounded-3xl border border-hairline bg-surface-2 shadow-2xl">
                  <MemberPhoto
                    m={founder}
                    className="aspect-[4/5] w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/80 to-transparent p-4 backdrop-blur-[2px]">
                    <p className="font-display text-lg font-bold">{founder.name}</p>
                    <p className="text-sm text-primary">{founder.designation}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold tracking-[0.24em] text-primary uppercase">
                  Meet the Founder
                </p>
                <h3 className="mt-3 font-display text-2xl font-bold text-balance sm:text-3xl">
                  Building Bennufly from the ground up.
                </h3>
                <p className="mt-5 leading-relaxed text-muted-foreground">{founder.bio}</p>
                <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  {FOUNDER_FOCUS.map((f) => (
                    <li
                      key={f}
                      className="rounded-xl border border-hairline bg-surface px-4 py-3 text-sm font-medium"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  <SocialLinks m={founder} size="size-10" />
                </div>
              </div>
            </div>
          </article>
        </Reveal>
      )}

      {others.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((m, i) => (
            <Reveal key={m.id} delay={i * 50}>
              <article className="group flex h-full flex-col rounded-2xl border border-hairline bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40">
                <div className="mb-5 flex items-center gap-4">
                  <MemberPhoto
                    m={m}
                    className="size-14 shrink-0 overflow-hidden rounded-full border border-hairline bg-primary/10 object-cover"
                  />
                  <div className="min-w-0">
                    <p className="font-display font-semibold">{m.name}</p>
                    <p className="text-sm text-primary">{m.designation}</p>
                  </div>
                </div>
                {m.bio && (
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{m.bio}</p>
                )}
                <div className="mt-5 border-t border-hairline pt-4">
                  <SocialLinks m={m} />
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

export function FinalCta() {
  return (
    <Section>
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-hairline bg-card px-6 py-16 text-center sm:px-12">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "var(--gradient-hero)" }}
            aria-hidden
          />
          <div className="relative">
            <h2 className="text-3xl font-bold text-balance sm:text-4xl">
              Have an Idea? Let&apos;s Build It.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Tell us what you are trying to build. We will come back with a clear scope, timeline
              and a realistic path to launch.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/start-project"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Start a Project <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 font-semibold transition-colors hover:bg-surface"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

export { Section, SectionHeading, Reveal };