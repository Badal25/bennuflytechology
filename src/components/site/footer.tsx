import { Link } from "@tanstack/react-router";
import { Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Wordmark } from "@/components/brand/logo";
import { useSettings } from "@/lib/db";
import { NewsletterForm } from "./newsletter-form";

const COMPANY = [
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/careers", label: "Careers" },
  { to: "/blog", label: "Blog" },
] as const;

const SERVICES = [
  { to: "/services/software-development", label: "Software Development" },
  { to: "/services/web-development", label: "Web Development" },
  { to: "/services/mobile-app-development", label: "Mobile Apps" },
  { to: "/services/ai-machine-learning", label: "AI Solutions" },
  { to: "/services/saas-development", label: "SaaS" },
  { to: "/services/ui-ux-design", label: "UI/UX" },
] as const;

const RESOURCES = [
  { to: "/blog", label: "Blog" },
  { to: "/faq", label: "FAQ" },
  { to: "/learning", label: "Learning & Internships" },
  { to: "/verify", label: "Verify Certificate" },
  { to: "/ai-lab", label: "AI Demo Lab" },
  { to: "/industries", label: "Industries" },
] as const;

export function SiteFooter() {
  const { settings } = useSettings();

  return (
    <footer className="hairline-top mt-10 bg-surface/40">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Wordmark />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {settings.tagline}
            </p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {settings.footer_text}
            </p>
            <div className="mt-6 flex gap-2">
              {settings.linkedin && (
                <a
                  href={settings.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Bennufly on LinkedIn"
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-hairline text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Linkedin className="size-4" />
                </a>
              )}
              {settings.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Bennufly on Instagram"
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-hairline text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Instagram className="size-4" />
                </a>
              )}
            </div>
          </div>

          <FooterCol title="Company" links={COMPANY} />
          <FooterCol title="Services" links={SERVICES} />
          <FooterCol title="Resources" links={RESOURCES} />
        </div>

        <div className="mt-12 grid gap-8 border-t border-hairline pt-10 md:grid-cols-2">
          <div>
            <h3 className="font-display text-sm font-semibold">Contact</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>{settings.address}</span>
              </li>
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 size-4 shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-foreground">
                  {settings.email}
                </a>
              </li>
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 size-4 shrink-0" />
                <a href={`tel:${settings.phone?.replace(/\s/g, "")}`} className="hover:text-foreground">
                  {settings.phone}
                </a>
              </li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">{settings.working_hours}</p>
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold">Newsletter</h3>
            <p className="mt-2 mb-4 text-sm text-muted-foreground">
              Occasional notes on what we are building. No noise.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-hairline pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {settings.copyright}</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-foreground">
              Terms &amp; Conditions
            </Link>
            <Link to="/admin/login" className="hover:text-foreground">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: readonly { to: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="font-display text-sm font-semibold">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.to + l.label}>
            <Link
              to={l.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}