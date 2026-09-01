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
  const { data: team } = useTeam();
  const members = (team ?? []) as any[];
  return (
    <SiteShell>
      <PageHero eyebrow="About" title="A technology company built for what comes next." description="Founded in 2026 at IT Park, Nagpur, Bennufly Technology Pvt. Ltd. builds software, websites, mobile applications, AI-powered solutions and SaaS products for businesses across India and international markets." />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <SectionHeading eyebrow="Our Story" title="Started in 2026, built for the long term." />
          <div className="space-y-4 leading-relaxed text-muted-foreground">
            <p>Bennufly began as a founder-led technology startup with a straightforward conviction: businesses do not need more software, they need software that actually fits how they work.</p>
            <p>We build digital products end to end — discovery, design, engineering, deployment and support — and we do it remotely with clients in India and abroad.</p>
            <p>Alongside client work, Bennufly runs learning and internship programs so students can gain practical experience on real projects rather than sample exercises.</p>
          </div>
        </div>
      </Section>
      <Section className="bg-surface/30">
        <SectionHeading eyebrow="What We Believe" title="The principles we work by" />
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
          {BELIEFS.map((b) => (
            <div key={b.t} className="bg-card px-6 py-7">
              <h3 className="font-display font-semibold">{b.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.d}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-hairline bg-card p-8">
            <h2 className="font-display text-xl font-bold">Mission</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{MISSION}</p>
          </div>
          <div className="rounded-2xl border border-hairline bg-card p-8">
            <h2 className="font-display text-xl font-bold">Vision</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{VISION}</p>
          </div>
        </div>
      </Section>
      <Section className="bg-surface/30">
        <SectionHeading eyebrow="Why Bennufly" title="Technology + Innovation + Learning + Digital Products" description="We combine client product engineering with a deliberate talent pipeline, so the work and the team grow together." />
        <div className="mt-10"><WhyBennufly /></div>
      </Section>
      <Section>
        <SectionHeading eyebrow="Team" title="A founder-led startup" />
        <div className="mt-10">
          {members.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((m) => (
                <div key={m.id} className="rounded-2xl border border-hairline bg-card p-6">
                  <p className="font-display font-semibold">{m.name}</p>
                  <p className="text-sm text-muted-foreground">{m.designation}</p>
                  {m.bio && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.bio}</p>}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Team profiles coming soon." description="Bennufly is a founder-led startup. Team members are published here as the team grows." />
          )}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">Want to be part of it? <Link to="/careers" className="font-semibold text-primary">View opportunities</Link>.</p>
      </Section>
      <FinalCta />
    </SiteShell>
  );
}
