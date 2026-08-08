import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/site-shell";
import { Section } from "@/components/site/primitives";

const T = "Terms & Conditions — Bennufly Technology";
const D = "Terms governing the use of the Bennufly Technology Pvt. Ltd. website and services.";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/terms" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: TermsPage,
});

const SECTIONS = [
  ["Use of this website", "This website is provided for information about Bennufly Technology Pvt. Ltd. and its services. You agree not to misuse the site or attempt unauthorised access to any part of it."],
  ["Inquiries and proposals", "Information shown on this site, including indicative budgets and timelines, does not constitute a binding offer. Project scope, pricing and delivery terms are agreed in a written proposal or contract."],
  ["Intellectual property", "All content, branding, designs and code on this website are the property of Bennufly Technology Pvt. Ltd. unless stated otherwise, and may not be reproduced without permission."],
  ["Job applications", "Submitting an application does not guarantee an interview or offer. Applications are reviewed at our discretion."],
  ["Limitation of liability", "We work to keep information accurate and the site available, but we are not liable for indirect or consequential losses arising from use of this website."],
  ["Governing law", "These terms are governed by the laws of India, with jurisdiction in Nagpur, Maharashtra."],
  ["Contact", "Questions about these terms can be sent to supportbennufly@gmail.com."],
];

function TermsPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="Legal" title="Terms & Conditions" description="Last updated: January 2026" />
      <Section>
        <div className="mx-auto max-w-3xl space-y-8">
          {SECTIONS.map(([title, body]) => (
            <div key={title}>
              <h2 className="font-display text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </Section>
    </SiteShell>
  );
}