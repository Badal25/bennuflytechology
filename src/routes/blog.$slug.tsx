import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteShell } from "@/components/site/site-shell";
import { Section, EmptyState, CardSkeleton, ErrorState } from "@/components/site/primitives";
import { useBlog } from "@/lib/db";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: "Article — Bennufly Technology" },
      { name: "description", content: "An article from the Bennufly Technology blog." },
      { property: "og:title", content: "Article — Bennufly Technology" },
      { property: "og:description", content: "An article from the Bennufly Technology blog." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `/blog/${params.slug}` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
  }),
  component: BlogDetail,
});

function BlogDetail() {
  const { slug } = Route.useParams();
  const { data, isLoading, error } = useBlog(slug);
  const post = data as any;

  return (
    <SiteShell>
      <Section>
        <Link
          to="/blog"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> All articles
        </Link>

        {isLoading ? (
          <CardSkeleton count={1} />
        ) : error ? (
          <ErrorState />
        ) : !post || post.status !== "published" ? (
          <EmptyState
            title="Article not found"
            description="This article may have been moved or is not published yet."
          />
        ) : (
          <article className="mx-auto max-w-3xl">
            {post.category && (
              <p className="text-[11px] font-semibold tracking-[0.24em] text-primary uppercase">
                {post.category}
              </p>
            )}
            <h1 className="mt-4 text-3xl font-bold text-balance sm:text-4xl">{post.title}</h1>
            <p className="mt-4 text-sm text-muted-foreground">
              {[
                post.author_name,
                post.published_at
                  ? new Date(post.published_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>

            {post.thumbnail && (
              <img
                src={post.thumbnail}
                alt={post.title}
                className="mt-8 w-full rounded-2xl border border-hairline object-cover"
              />
            )}

            {post.excerpt && (
              <p className="mt-8 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
            )}

            <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
              {String(post.content ?? "")
                .split(/\n{2,}/)
                .filter(Boolean)
                .map((para: string, i: number) => (
                  <p key={i}>{para}</p>
                ))}
            </div>

            {!!(post.tags ?? []).length && (
              <div className="mt-10 flex flex-wrap gap-1.5 border-t border-hairline pt-6">
                {(post.tags as string[]).map((t) => (
                  <span key={t} className="rounded-md bg-surface px-2 py-1 text-[11px] text-muted-foreground">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </article>
        )}
      </Section>
    </SiteShell>
  );
}