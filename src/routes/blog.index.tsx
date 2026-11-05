import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ArrowUpRight } from "lucide-react";
import { SiteShell, PageHero } from "@/components/site/site-shell";
import { Section, Reveal, EmptyState, CardSkeleton, ErrorState } from "@/components/site/primitives";
import { useBlogs } from "@/lib/db";
import { inputClass } from "@/components/site/form-controls";

const T = "Bennufly Technology — Insights & Technology Blog";
const D = "Engineering notes, product thinking and technology insights from the Bennufly Technology team.";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://official.bennufly.in/blog" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [   {     rel: "canonical",     href: "https://official.bennufly.in/blog",   }, ],
  }),
  component: BlogIndex,
});

function formatDate(v?: string | null) {
  if (!v) return null;
  return new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function BlogIndex() {
  const { data, isLoading, error } = useBlogs();
  const posts = (data ?? []) as any[];
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () => Array.from(new Set(posts.map((p) => p.category).filter(Boolean))) as string[],
    [posts],
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return posts.filter((p) => {
      const catOk = category === "all" || p.category === category;
      const termOk =
        !term ||
        String(p.title ?? "").toLowerCase().includes(term) ||
        String(p.excerpt ?? "").toLowerCase().includes(term);
      return catOk && termOk;
    });
  }, [posts, q, category]);

  const [featured, ...rest] = filtered;

  return (
    <SiteShell>
      <PageHero
        eyebrow="Blog"
        title="Insights from the build."
        description="Notes on engineering, product and the technology we use to ship real software."
      />

      <Section>
        {isLoading ? (
          <CardSkeleton count={3} />
        ) : error ? (
          <ErrorState message="We could not load articles right now." />
        ) : !posts.length ? (
          <EmptyState title="Insights and stories are coming soon." />
        ) : (
          <>
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-xs">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search articles"
                  aria-label="Search articles"
                  maxLength={100}
                  className={`${inputClass} pl-9`}
                />
              </div>
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {["all", ...categories].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                        category === c
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-hairline text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {c === "all" ? "All" : c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!filtered.length ? (
              <EmptyState title="No articles match your search." description="Try a different keyword or category." />
            ) : (
              <>
                {featured && (
                  <Reveal>
                    <Link
                      to="/blog/$slug"
                      params={{ slug: featured.slug }}
                      className="group mb-10 grid overflow-hidden rounded-3xl border border-hairline bg-card md:grid-cols-2"
                    >
                      <div className="flex min-h-[220px] items-center justify-center overflow-hidden bg-surface-2">
                        {featured.thumbnail ? (
                          <img src={featured.thumbnail} alt={featured.title} className="size-full object-cover" />
                        ) : (
                          <span className="font-display text-3xl font-extrabold text-muted-foreground/25">
                            {featured.category ?? "Article"}
                          </span>
                        )}
                      </div>
                      <div className="p-8 md:p-10">
                        <p className="text-[11px] font-semibold tracking-[0.24em] text-primary uppercase">
                          Featured
                        </p>
                        <h2 className="mt-4 font-display text-2xl font-bold text-balance">{featured.title}</h2>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{featured.excerpt}</p>
                        <p className="mt-5 text-xs text-muted-foreground">
                          {[featured.author_name, formatDate(featured.published_at)].filter(Boolean).join(" · ")}
                        </p>
                        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                          Read article <ArrowUpRight className="size-3.5" />
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                )}

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((p, i) => (
                    <Reveal key={p.id} delay={i * 40}>
                      <Link
                        to="/blog/$slug"
                        params={{ slug: p.slug }}
                        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-hairline bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40"
                      >
                        <div className="flex h-40 items-center justify-center overflow-hidden bg-surface-2">
                          {p.thumbnail ? (
                            <img src={p.thumbnail} alt={p.title} loading="lazy" className="size-full object-cover" />
                          ) : (
                            <span className="font-display text-2xl font-extrabold text-muted-foreground/25">
                              {p.category ?? "Article"}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col p-6">
                          {p.category && (
                            <p className="mb-2 text-[11px] text-muted-foreground">{p.category}</p>
                          )}
                          <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{p.excerpt}</p>
                          <p className="mt-4 text-xs text-muted-foreground">
                            {[p.author_name, formatDate(p.published_at)].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </Section>
    </SiteShell>
  );
}
