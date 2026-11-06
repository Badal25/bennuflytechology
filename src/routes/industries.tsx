import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/site-shell";
import { Section } from "@/components/site/primitives";
import { IndustriesGrid, FinalCta } from "@/components/site/sections";

const T = "Industries We Serve — Bennufly Technology";
const D = "Startups, education, healthcare, finance, retail, real estate, manufacturing, logistics, travel and professional services.";

export const Route = createFileRoute("/industries")({
  head: () => ({   meta: [     { title: T },     { name: "description", content: D },     { property: "og:title", content: T },     { property: "og:description", content: D },     {       property: "og:url",       content: "https://bennufly.in/industries",     },   ],   links: [     {       rel: "canonical",       href: "https://bennufly.in/industries",     },   ], }),
  component: Industries,
});

function Industries() {
  return (
    <SiteShell>
      <PageHero eyebrow="Industries" title="Where our work lands." description="Different sectors, same discipline: understand the operation first, then build for it." />
      <Section><IndustriesGrid /></Section>
      <FinalCta />
    </SiteShell>
  );
}
