import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/site-shell";
import { Section } from "@/components/site/primitives";

const T = "Privacy Policy — Bennufly Technology";
const D = "How Bennufly Technology Pvt. Ltd. collects, uses and protects personal information submitted through this website.";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/privacy" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

const SECTIONS = [
  ["Information we collect", "We collect the details you submit through our contact, project inquiry, newsletter and job application forms — such as your name, email address, phone number, company, project details and resume."],
  ["How we use information", "We use this information only to respond to your inquiry, evaluate job applications, deliver requested services and send updates you have opted into."],
  ["Storage and security", "Data is stored in a managed, access-controlled database. Resumes and uploaded files are stored in private storage and are accessible only to authorised team members."],
  ["Sharing", "We do not sell your personal data. Information is shared only with service providers required to operate this website, or when required by law."],
  ["Retention", "We retain inquiry and application data only as long as needed for the purpose it was collected, or as required by applicable law."],
  ["Your rights", "You can request access to, correction of, or deletion of your personal data by emailing us at support@bennufly.in."],
  ["Contact", "Bennufly Technology Pvt. Ltd., IT Park, Nagpur, Maharashtra, India — support@bennufly.in."],
];

function PrivacyPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="Legal" title="Privacy Policy" description="Last updated: January 2026" />
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