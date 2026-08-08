import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Github, ExternalLink } from "lucide-react";
import { SiteShell, PageHero } from "@/components/site/site-shell";
import { Section, Reveal, EmptyState, CardSkeleton, ErrorState } from "@/components/site/primitives";
import { FinalCta } from "@/components/site/sections";
import { useProjects } from "@/lib/db";

const T = "Bennufly Technology — Our Work & Projects";
const D = "Selected software, web, mobile and AI projects built by Bennufly Technology in Nagpur, India.";

export const Route = createFileRoute("/portfolio/")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/portfolio" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/portfolio" }],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const { data, isLoading, error } = useProjects();
  const items = (data ?? []) as any[];
  const categories = Array.from(new Set(items.map((p) => p.category).filter(Boolean))) as string[];
  const [filter, setFilter] = useState("all");
  const visible = filter === "all" ? items : items.filter((p) => p.category === filter);

  return (
    <SiteShell>
      <PageHero
        eyebrow="Portfolio"
        title="Work we are building, in the open."
        description="A young studio with real projects in motion. Everything below reflects what we are actually shipping."
      />
      <Section>
        {isLoading ? (
          <CardSkeleton count={3} />
        ) : error ? (
          <ErrorState message="We could not load projects right now." />
        ) : !items.length ? (
          <EmptyState
            title="Our portfolio is growing."
            description="New projects will appear here soon."
          />
        ) : (
          <>
            {categories.length > 1 && (
              <div className="mb-8 flex flex-wrap gap-2">
                {["all", ...categories].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFilter(c)}
                    className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                      filter === c
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-hairline text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {c === "all" ? "All" : c}
                  </button>
                ))}
              </div>
            )}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((p, i) => (
                <Reveal key={p.id} delay={i * 50}>
                  <ProjectCard project={p} />
                </Reveal>
              ))}
            </div>
          </>
        )}
      </Section>
      <FinalCta />
    </SiteShell>
  );
}

function ProjectCard({ project }: { project: any }) {
  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-hairline bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40">
      <Link
        to="/portfolio/$slug"
        params={{ slug: project.slug }}
        className="relative flex h-44 items-center justify-center overflow-hidden bg-surface-2"
      >
        {project.cover_image ? (
          <img
            src={project.cover_image}
            alt={project.title}
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <span className="font-display text-3xl font-extrabold text-muted-foreground/25">
            {project.category ?? "Project"}
          </span>
        )}
        {project.featured && (
          <span className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold tracking-wide text-primary-foreground uppercase">
            Featured
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          {project.category && <span>{project.category}</span>}
          {project.project_status && (
            <span className="rounded-full border border-hairline px-2 py-0.5">
              {project.project_status}
            </span>
          )}
        </div>
        <h2 className="font-display text-lg font-semibold">
          <Link to="/portfolio/$slug" params={{ slug: project.slug }}>
            {project.title}
          </Link>
        </h2>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {project.short_description}
        </p>
        {!!(project.technologies ?? []).length && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {(project.technologies as string[]).slice(0, 5).map((t) => (
              <span key={t} className="rounded-md bg-surface px-2 py-0.5 text-[11px] text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="mt-5 flex items-center gap-4 text-sm">
          <Link
            to="/portfolio/$slug"
            params={{ slug: project.slug }}
            className="inline-flex items-center gap-1.5 font-medium text-primary"
          >
            View project <ArrowUpRight className="size-3.5" />
          </Link>
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} live site`}
              className="text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="size-4" />
            </a>
          )}
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} source code`}
              className="text-muted-foreground hover:text-foreground"
            >
              <Github className="size-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}