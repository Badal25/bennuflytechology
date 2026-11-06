import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/site/site-shell";
import { Section, SectionHeading, Reveal } from "@/components/site/primitives";
import {
  ServicesGrid,
  TechStackSection,
  ProcessTimeline,
  IndustriesGrid,
  FeaturedProject,
  StatsRow,
  TestimonialsSection,
  FaqSection,
  WhyBennufly,
  FinalCta,
} from "@/components/site/sections";
import { MISSION } from "@/lib/site";

const TITLE = "Bennufly Technology — Building Ideas. Engineering the Future.";
const DESC =
  "Bennufly Technology Pvt. Ltd. builds modern software, AI solutions, mobile applications and digital products that help businesses turn ideas into scalable technology.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      {
        property: "og:url",
        content: "https://bennufly.in/",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://bennufly.in/",
      },
    ],
  }),
  component: Home,
});

function Hero() {
  return (
    <div className="relative overflow-hidden">
      <div className="grid-backdrop pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
        aria-hidden
      />
      <div className="relative mx-auto grid w-full max-w-6xl gap-14 px-5 pt-16 pb-20 sm:px-8 md:pt-24 md:pb-28 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Technology &amp; Digital Product Development · Nagpur, India
          </span>
          <h1 className="mt-6 text-4xl font-bold text-balance sm:text-5xl md:text-6xl lg:text-[4.2rem] lg:leading-[1.02]">
            Build. Innovate.{" "}
            <span className="text-gradient">Transform.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Bennufly Technology helps startups, businesses and ambitious teams turn ideas into
            powerful digital products with modern software, AI and emerging technologies.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/start-project"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <CalendarCheck className="size-4" /> Start a Project
            </Link>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3.5 font-semibold transition-colors hover:bg-surface"
            >
              Explore Our Work
            </Link>
            <Link
              to="/careers"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Join Bennufly <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <HeroVisual />
      </div>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative hidden h-[380px] lg:block" aria-hidden>
      <div className="animate-drift absolute top-6 right-10 size-56 rounded-full bg-primary/25 blur-3xl" />
      <div className="animate-drift absolute bottom-8 left-6 size-44 rounded-full bg-cyan/20 blur-3xl" />

      <div className="surface-panel animate-float absolute top-2 left-0 w-60 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-cyan" />
          <span className="text-xs font-semibold tracking-wide text-muted-foreground">
            DEPLOYMENT
          </span>
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-2 w-full rounded bg-foreground/10" />
          <div className="h-2 w-4/5 rounded bg-foreground/10" />
          <div className="h-2 w-2/3 rounded bg-primary/40" />
        </div>
      </div>

      <div
        className="surface-panel animate-float absolute top-28 right-0 w-64 rounded-2xl p-5"
        style={{ animationDelay: "1.2s" }}
      >
        <p className="font-display text-sm font-semibold">AI Assistant</p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Intelligent workflows embedded directly into your product.
        </p>
        <div className="mt-4 grid grid-cols-4 gap-1.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-6 rounded"
              style={{
                background:
                  i % 3 === 0
                    ? "color-mix(in oklab, var(--brand) 55%, transparent)"
                    : "color-mix(in oklab, var(--foreground) 8%, transparent)",
              }}
            />
          ))}
        </div>
      </div>

      <div
        className="surface-panel animate-float absolute bottom-2 left-12 w-56 rounded-2xl p-4"
        style={{ animationDelay: "2.1s" }}
      >
        <div className="flex items-end gap-1.5">
          {[38, 22, 54, 30, 66, 44, 72].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t"
              style={{
                height: h,
                background: "var(--gradient-brand)",
                opacity: 0.35 + i * 0.08,
              }}
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Scalable by design</p>
      </div>
    </div>
  );
}

function Home() {
  return (
    <SiteShell>
      <Hero />

      <Section className="border-y border-hairline bg-surface/30 !py-12">
        <p className="text-center font-display text-lg leading-relaxed text-balance sm:text-xl">
          From software and mobile applications to AI-powered solutions and scalable digital
          products, Bennufly Technology helps businesses transform ideas into technology that
          creates real-world impact.
        </p>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <SectionHeading
            eyebrow="About Bennufly"
            title="A technology company built for what comes next."
          />
          <div className="space-y-4 text-muted-foreground">
            <p className="leading-relaxed">
              Founded in 2026 and based at IT Park, Nagpur, Bennufly Technology Pvt. Ltd. builds
              modern software, websites, mobile applications, AI-powered solutions and SaaS products
              for businesses, startups and entrepreneurs across India and international markets.
            </p>
            <p className="leading-relaxed">{MISSION}</p>
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 font-semibold text-primary"
            >
              More about us <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </Section>

      <Section className="bg-surface/30">
        <SectionHeading
          eyebrow="What We Build"
          title="Featured services"
          description="Product engineering across the full stack — from first prototype to production platform."
        />
        <div className="mt-10">
          <ServicesGrid limit={6} />
        </div>
        <div className="mt-8">
          <Link to="/services" className="inline-flex items-center gap-1.5 font-semibold text-primary">
            View all services <ArrowRight className="size-4" />
          </Link>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Why Bennufly" title="Reasons teams choose us" />
        <div className="mt-10">
          <WhyBennufly />
        </div>
      </Section>

      <Section className="bg-surface/30">
        <SectionHeading eyebrow="Technology Stack" title="The tools we build with" />
        <div className="mt-10">
          <TechStackSection />
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Development Process" title="How a project moves forward" />
        <div className="mt-10">
          <ProcessTimeline />
        </div>
      </Section>

      <Section className="bg-surface/30">
        <SectionHeading eyebrow="Featured Project" title="What we are building now" />
        <div className="mt-10">
          <FeaturedProject />
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Industries" title="Where we work" />
        <div className="mt-10">
          <IndustriesGrid />
        </div>
      </Section>

      <Section className="bg-surface/30">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Learning & Internships"
              title="Real projects. Real mentorship."
              description="Bennufly creates opportunities for students and aspiring technology professionals through practical learning, internships and real-world project experience."
            />
            <Link
              to="/learning"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Explore Opportunities <ArrowRight className="size-4" />
            </Link>
          </div>
          <Reveal>
            <ul className="grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-2">
              {[
                "Practical experience",
                "Industry exposure",
                "Real-world projects",
                "Mentorship",
                "Development experience",
                "Team collaboration",
              ].map((t) => (
                <li key={t} className="bg-card px-5 py-6 text-sm font-medium">
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      <Section>
        <StatsRow />
      </Section>

      <Section className="bg-surface/30">
        <SectionHeading eyebrow="Testimonials" title="Client stories" />
        <div className="mt-10">
          <TestimonialsSection />
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="FAQ" title="Questions we hear often" />
        <div className="mt-10">
          <FaqSection limit={6} />
        </div>
      </Section>

      <FinalCta />
    </SiteShell>
  );
}
