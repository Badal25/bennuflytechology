import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/site-shell";
import { Section } from "@/components/site/primitives";
import { FaqSection, FinalCta } from "@/components/site/sections";

const T = "Frequently Asked Questions — Bennufly Technology";
const D = "Answers about Bennufly services, project timelines, international clients, internships and support.";

export const Route = createFileRoute("/faq")({
  head: () => ({   meta: [     { title: T },     { name: "description", content: D },     { property: "og:title", content: T },     { property: "og:description", content: D },     {       property: "og:url",       content: "https://bennufly.in/faq",     },   ],   links: [     {       rel: "canonical",       href: "https://bennufly.in/faq",     },   ], }),
  component: Faq,
});

function Faq() {
  return (
    <SiteShell>
      <PageHero eyebrow="FAQ" title="Questions, answered." />
      <Section><FaqSection /></Section>
      <FinalCta />
    </SiteShell>
  );
}
