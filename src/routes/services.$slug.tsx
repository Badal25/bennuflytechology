import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { SiteShell, PageHero } from "@/components/site/site-shell";
import { Section, EmptyState, CardSkeleton } from "@/components/site/primitives";
import { FinalCta } from "@/components/site/sections";
import { DynamicIcon } from "@/components/site/icon";
import { useService } from "@/lib/db";

export const Route = createFileRoute("/services/$slug")({
  head: ({ params }) => {
  const t = `${params.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} — Bennufly Technology`;
  const url = `https://official.bennufly.in/services/${params.slug}`;
  return {
    meta: [
      { title: t },
      { name: "description", content: `Bennufly Technology service: ${params.slug.replace(/-/g, " ")}.` },
      { property: "og:title", content: t },
      { property: "og:description", content: `Bennufly Technology service: ${params.slug.replace(/-/g, " ")}.` },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
    ],
    links: [{ rel: "canonical", href: url }],
  };
},
  component: ServiceDetail,
});

function ServiceDetail() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useService(slug);
  const s = data as any;

  return (
    <SiteShell>
      {isLoading ? (
        <Section><CardSkeleton count={1} /></Section>
      ) : !s ? (
        <Section><EmptyState title="Service not found." description="It may have been unpublished." /></Section>
      ) : (
        <>
          <PageHero eyebrow="Service" title={s.title} description={s.short_description}>
            <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <DynamicIcon name={s.icon} className="size-6" />
            </span>
          </PageHero>
          <Section>
            <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
              <div>
                <p className="text-lg leading-relaxed text-muted-foreground">{s.description}</p>
              </div>
              <div className="rounded-2xl border border-hairline bg-card p-7">
                <h2 className="font-display font-semibold">What is included</h2>
                <ul className="mt-4 space-y-3">
                  {(s.features ?? []).map((f: string) => (
                    <li key={f} className="flex gap-2.5 text-sm text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />{f}
                    </li>
                  ))}
                </ul>
                <Link to="/start-project" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">
                  Start a Project <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </Section>
        </>
      )}
      <FinalCta />
    </SiteShell>
  );
}
