import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Hammer, GraduationCap, FolderGit2, Users, TrendingUp } from "lucide-react";
import { SiteShell, PageHero } from "@/components/site/site-shell";
import { Section, Reveal, SectionHeading } from "@/components/site/primitives";

const T = "Bennufly Learning & Internship Opportunities";
const D = "Practical learning, remote internships and real project experience for students with Bennufly Technology.";

export const Route = createFileRoute("/learning")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/learning" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/learning" }],
  }),
  component: LearningPage,
});

const BLOCKS = [
  {
    icon: Hammer,
    title: "Learn by Building",
    text: "Learning at Bennufly happens inside real development work — writing code, reviewing it, fixing it and shipping it. Instead of isolated exercises, you work the way a product team actually works.",
  },
  {
    icon: GraduationCap,
    title: "Internship Opportunities",
    text: "We open internships for students who want structured, practical exposure to software engineering, design and product delivery. Internships are remote-first and published on the Careers page when available.",
  },
  {
    icon: FolderGit2,
    title: "Real Project Experience",
    text: "Interns contribute to genuine project work — features, testing, documentation and iterations — so what you learn maps directly onto how software is built and maintained.",
  },
  {
    icon: Users,
    title: "Skills & Mentorship",
    text: "You work alongside the team, with reviews and guidance on engineering practices, tooling, version control, collaboration and communication.",
  },
  {
    icon: TrendingUp,
    title: "Career Growth",
    text: "The goal is practical experience you can show and explain: contributions you understand, work you can talk through in interviews and habits that carry into a professional role.",
  },
];

function LearningPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Learning & Internships"
        title="Practical experience, built on real work."
        description="Bennufly is committed to helping students learn software development the way it is actually practised — through building, reviewing and shipping."
      />

      <Section>
        <div className="grid gap-5 md:grid-cols-2">
          {BLOCKS.map((b, i) => (
            <Reveal key={b.title} delay={i * 50} className={i === 0 ? "md:col-span-2" : ""}>
              <div className="h-full rounded-2xl border border-hairline bg-card p-7">
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <b.icon className="size-5" />
                </span>
                <h2 className="mt-5 font-display text-xl font-semibold">{b.title}</h2>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{b.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="relative overflow-hidden rounded-3xl border border-hairline bg-card px-6 py-14 text-center sm:px-10">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "var(--gradient-hero)" }}
            aria-hidden
          />
          <div className="relative">
            <SectionHeading
              align="center"
              title="Ready to start learning with us?"
              description="Internship and entry-level opportunities are published on our Careers page as they open."
            />
            <Link
              to="/careers"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Explore Opportunities <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </Section>
    </SiteShell>
  );
}