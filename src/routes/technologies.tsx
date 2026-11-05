import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/site-shell";
import { Section } from "@/components/site/primitives";
import { TechStackSection, FinalCta } from "@/components/site/sections";

const T = "Technologies We Use — Bennufly Technology";
const D = "React, Next.js, Node.js, Python, Flutter, PostgreSQL, AWS, Docker, AI APIs and more — the stack behind Bennufly products.";

export const Route = createFileRoute("/technologies")({
  head: () => ({   meta: [     { title: T },     { name: "description", content: D },     { property: "og:title", content: T },     { property: "og:description", content: D },     {       property: "og:url",       content: "https://official.bennufly.in/technologies",     },   ],   links: [     {       rel: "canonical",       href: "https://official.bennufly.in/technologies",     },   ], }),
  component: Tech,
});

function Tech() {
  return (
    <SiteShell>
      <PageHero eyebrow="Technologies" title="A deliberately modern stack." description="We pick technology for longevity and hiring reality, not novelty." />
      <Section><TechStackSection /></Section>
      <FinalCta />
    </SiteShell>
  );
}
