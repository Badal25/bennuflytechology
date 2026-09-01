import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/site-shell";
import { Section, SectionHeading } from "@/components/site/primitives";
import { WhyBennufly, FinalCta, TeamSection } from "@/components/site/sections";
import { MISSION, VISION } from "@/lib/site";

const T = "About Bennufly Technology — Our Story, Mission & Vision";
const D = "Bennufly Technology Pvt. Ltd. is a technology company founded in 2026 in Nagpur, building software, AI solutions and digital products.";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: T }, { name: "description", content: D }, { property: "og:title", content: T }, { property: "og:description", content: D }] }),
  component: About,
});

const BELIEFS = [
  { t: "Innovation", d: "We choose modern, well-supported technology and apply it where it earns its place." },
  { t: "Quality", d: "Correctness, security and maintainability over shortcuts." },
  { t: "Learning", d: "We grow talent deliberately, through real work and mentorship." },
  { t: "Transparency", d: "Honest scope, honest timelines, visible progress." },
  { t: "Long-term relationships", d: "We stay after launch — that is where products are made." },
  { t: "Real-world impact", d: "Software is judged by what it changes for the people using it." },
];

function About() {
  return (
    <SiteShell>
      <PageHero eyebrow="About" title="A technology company built for what comes next." description="Founded in 2026 at IT Park, Nagpur, Bennufly Technology Pvt. Ltd. builds software, websites, mobile applications, AI-powered solutions and SaaS products for businesses across India and international markets." />
...
      </Section>
      <Section>
        <SectionHeading eyebrow="Team" title="A founder-led startup" />
        <div className="mt-10">
          <TeamSection />
        </div>
        <p className="mt-6 text-sm text-muted-foreground">Want to be part of it? <Link to="/careers" className="font-semibold text-primary">View Opportunities</Link>.</p>
      </Section>
      <FinalCta />
    </SiteShell>
  );
}
