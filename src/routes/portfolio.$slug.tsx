import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { SiteShell } from "@/components/site/site-shell";
import { Section, EmptyState, CardSkeleton, ErrorState } from "@/components/site/primitives";
import { FinalCta } from "@/components/site/sections";
import { useProject } from "@/lib/db";

export const Route = createFileRoute("/portfolio/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: "Project — Bennufly Technology" },
      { name: "description", content: "Project details and technology stack from the Bennufly Technology portfolio." },
      { property: "og:title", content: "Project — Bennufly Technology" },
      { property: "og:description", content: "Project details and technology stack from the Bennufly Technology portfolio." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `/portfolio/${params.slug}` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `/portfolio/${params.slug}` }],
  }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { slug } = Route.useParams();
  const { data, isLoading, error } = useProject(slug);
  const project = data as any;

  return (
    <SiteShell>
      <Section>
        <Link
          to="/portfolio"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> All projects
        </Link>

        {isLoading ? (
          <CardSkeleton count={1} />
        ) : error ? (
          <ErrorState />
        ) : !project || project.status !== "published" ? (
          <EmptyState
            title="Project not found"
            description="This project may have been moved or is not published yet."
          />
        ) : (
          <article>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {project.category && <span>{project.category}</span>}
              {project.project_status && (
                <span className="rounded-full border border-hairline px-2 py-0.5">
                  {project.project_status}
                </span>
              )}
            </div>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold text-balance sm:text-5xl">
              {project.title}
            </h1>
            {project.short_description && (
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                {project.short_description}
              </p>
            )}

            {project.cover_image && (
              <img
                src={project.cover_image}
                alt={project.title}
                className="mt-10 w-full rounded-2xl border border-hairline object-cover"
              />
            )}

            <div className="mt-10 grid gap-10 lg:grid-cols-[2fr_1fr]">
              <div className="prose-bennufly space-y-4 text-base leading-relaxed text-muted-foreground">
                {String(project.description ?? "")
                  .split(/\n{2,}/)
                  .filter(Boolean)
                  .map((para: string, i: number) => (
                    <p key={i}>{para}</p>
                  ))}
              </div>
              <aside className="h-fit rounded-2xl border border-hairline bg-card p-6">
                {!!(project.technologies ?? []).length && (
                  <>
                    <h2 className="font-display text-sm font-semibold">Technologies</h2>
                    <div className="mt-3 mb-6 flex flex-wrap gap-1.5">
                      {(project.technologies as string[]).map((t) => (
                        <span
                          key={t}
                          className="rounded-md bg-surface px-2 py-1 text-[11px] text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </>
                )}
                <div className="flex flex-col gap-2">
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                    >
                      <ExternalLink className="size-4" /> Visit live site
                    </a>
                  )}
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold"
                    >
                      <Github className="size-4" /> Source code
                    </a>
                  )}
                </div>
              </aside>
            </div>

            {!!(project.gallery ?? []).length && (
              <div className="mt-12 grid gap-4 sm:grid-cols-2">
                {(project.gallery as string[]).map((g) => (
                  <img
                    key={g}
                    src={g}
                    alt={`${project.title} screenshot`}
                    loading="lazy"
                    className="w-full rounded-xl border border-hairline object-cover"
                  />
                ))}
              </div>
            )}
          </article>
        )}
      </Section>
      <FinalCta />
    </SiteShell>
  );
}