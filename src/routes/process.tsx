import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/site-shell";
import { Section } from "@/components/site/primitives";
import { ProcessTimeline, FinalCta } from "@/components/site/sections";

const T = "Our Development Process — Bennufly Technology";
const D = "Discovery, planning, design, development, testing, deployment and support — how Bennufly delivers software.";

export const Route = createFileRoute("/process")({
  head: () => ({ meta: [{ title: T }, { name: "description", content: D }, { property: "og:title", content: T }, { property: "og:description", content: D }] }),
  component: Process,
});

function Process() {
  return (
    <SiteShell>
      <PageHero eyebrow="Process" title="Seven stages, no surprises." description="A predictable path from first conversation to a supported product in production." />
      <Section><ProcessTimeline /></Section>
      <FinalCta />
    </SiteShell>
  );
}
