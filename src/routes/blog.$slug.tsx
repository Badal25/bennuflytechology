import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteShell } from "@/components/site/site-shell";
import { Section, EmptyState, CardSkeleton, ErrorState } from "@/components/site/primitives";
import { useBlog } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";
import { socialImageUrl, contentImage, OG_WIDTH, OG_HEIGHT } from "@/lib/og-image";

function truncate(s: string, n = 155) {
  const clean = s.replace(/\s+/g, " ").trim();
  return clean.length > n ? `${clean.slice(0, n - 1).trimEnd()}…` : clean;
}

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("blogs")
      .select(
        "title, excerpt, content, thumbnail, og_image, seo_title, seo_description, category, tags, author_name, published_at, updated_at, status",
      )
      .eq("slug", params.slug)
      .eq("status", "published")
      .maybeSingle();
    return { post: (data as any) ?? null };
  },
  head: ({ params, loaderData }) => {
    const post = loaderData?.post as any;
    const url = `/blog/${params.slug}`;
    if (!post) {
      return {
        meta: [
          { title: "Article not found — Bennufly Technology" },
          { name: "description", content: "This article is unavailable or has been moved." },
          { name: "robots", content: "noindex, follow" },
        ],
        links: [{ rel: "canonical", href: url }],
      };
    }
    const title = `${post.seo_title || post.title} — Bennufly Technology`;
    const description = truncate(
      post.seo_description || post.excerpt || String(post.content ?? "") || post.title,
    );
    const image: string | null = post.og_image || post.thumbnail || null;
    const card = socialImageUrl(image);

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "author", content: post.author_name || "Bennufly Technology Pvt. Ltd." },
        ...(post.tags?.length ? [{ name: "keywords", content: (post.tags as string[]).join(", ") }] : []),
        { property: "og:title", content: post.seo_title || post.title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:site_name", content: "Bennufly Technology" },
        ...(post.published_at
          ? [{ property: "article:published_time", content: new Date(post.published_at).toISOString() }]
          : []),
        ...(post.category ? [{ property: "article:section", content: post.category }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: post.seo_title || post.title },
        { name: "twitter:description", content: description },
        ...(card
          ? [
              { property: "og:image", content: card },
              { property: "og:image:secure_url", content: card },
              { property: "og:image:type", content: "image/jpeg" },
              { property: "og:image:width", content: String(OG_WIDTH) },
              { property: "og:image:height", content: String(OG_HEIGHT) },
              { property: "og:image:alt", content: post.title },
              { name: "twitter:image", content: card },
              { name: "twitter:image:alt", content: post.title },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description,
            ...(card ? { image: [card] } : {}),
            author: { "@type": "Person", name: post.author_name || "Bennufly Technology" },
            publisher: {
              "@type": "Organization",
              name: "Bennufly Technology Pvt. Ltd.",
            },
            ...(post.published_at ? { datePublished: new Date(post.published_at).toISOString() } : {}),
            ...(post.updated_at ? { dateModified: new Date(post.updated_at).toISOString() } : {}),
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            ...(post.category ? { articleSection: post.category } : {}),
            ...(post.tags?.length ? { keywords: (post.tags as string[]).join(", ") } : {}),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "/" },
              { "@type": "ListItem", position: 2, name: "Blog", item: "/blog" },
              { "@type": "ListItem", position: 3, name: post.title, item: url },
            ],
          }),
        },
      ],
    };
  },
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

            {post.thumbnail &&
              (() => {
                const img = contentImage(post.thumbnail);
                return (
                  <img
                    src={img?.src ?? post.thumbnail}
                    {...(img ? { srcSet: img.srcSet, sizes: img.sizes } : {})}
                    width={1200}
                    height={675}
                    loading="lazy"
                    decoding="async"
                    alt={post.title}
                    className="mt-8 aspect-video w-full rounded-2xl border border-hairline object-cover"
                  />
                );
              })()}

            {post.excerpt && (
              <p className="mt-8 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
            )}

            <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
              {String(post.content ?? "")
                .split(/\n{2,}/)
                .filter(Boolean)
                .map((para: string, i: number) => {
                  const t = para.trim();
                  if (t.startsWith("## "))
                    return (
                      <h2 key={i} className="pt-6 font-display text-2xl font-semibold tracking-tight text-foreground">
                        {t.slice(3)}
                      </h2>
                    );
                  if (t.startsWith("### "))
                    return (
                      <h3 key={i} className="pt-3 text-lg font-semibold text-foreground">
                        {t.slice(4)}
                      </h3>
                    );
                  const lines = t.split("\n");
                  if (lines.every((l) => l.trim().startsWith("- ")))
                    return (
                      <ul key={i} className="list-disc space-y-2 pl-5">
                        {lines.map((l, j) => (
                          <li key={j}>{l.trim().slice(2)}</li>
                        ))}
                      </ul>
                    );
                  return <p key={i}>{t}</p>;
                })}
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