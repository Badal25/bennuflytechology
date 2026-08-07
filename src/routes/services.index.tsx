import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/site-shell";
import { Section } from "@/components/site/primitives";
import { ServicesGrid, FinalCta } from "@/components/site/sections";

const T = "Services — Software, Web, Mobile, AI & SaaS | Bennufly Technology";
const D = "Software development, web and mobile apps, AI & machine learning, SaaS, UI/UX, cloud & DevOps, APIs and business automation.";

export const Route = createFileRoute("/services/")({
  head: () => ({ meta: [{ title: T }, { name: "description", content: D }, { property: "og:title", content: T }, { property: "og:description", content: D }] }),
  component: Services,
});

function Services() {
  return (
    <SiteShell>
      <PageHero eyebrow="Services" title="Everything needed to take a product from idea to launch." description="One team across strategy, design, engineering and operations — so nothing gets lost between hand-offs." />
      <Section><ServicesGrid /></Section>
      <FinalCta />
    </SiteShell>
  );
}
