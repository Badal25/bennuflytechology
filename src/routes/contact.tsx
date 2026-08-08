import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Phone, MapPin, MessageCircle, Clock } from "lucide-react";
import { SiteShell, PageHero } from "@/components/site/site-shell";
import { Section, Reveal } from "@/components/site/primitives";
import { Field, inputClass, SubmitButton } from "@/components/site/form-controls";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/lib/db";
import { useServices } from "@/lib/db";
import { BUDGETS, TIMELINES, whatsappHref } from "@/lib/site";

const T = "Contact Bennufly Technology";
const D = "Talk to Bennufly Technology Pvt. Ltd. — IT Park, Nagpur. Email, phone, WhatsApp or send us a project inquiry.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/contact" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z.string().trim().max(30).optional(),
  company: z.string().trim().max(120).optional(),
  service: z.string().trim().max(120).optional(),
  budget: z.string().trim().max(80).optional(),
  timeline: z.string().trim().max(80).optional(),
  message: z.string().trim().min(10, "Tell us a little more").max(2000),
});

const HOURS = [
  "Monday – Friday: 9:30 AM – 6:30 PM IST",
  "Saturday: 10:00 AM – 2:00 PM IST",
  "Sunday: Closed",
];

function ContactPage() {
  const { settings } = useSettings();
  const { data: services } = useServices();

  return (
    <SiteShell>
      <PageHero
        eyebrow="Contact"
        title="Let's talk about what you are building."
        description="Reach us by email, phone or WhatsApp — or send the form and our team will get back to you."
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <div className="space-y-6">
              <div className="rounded-2xl border border-hairline bg-card p-6">
                <h2 className="font-display text-lg font-semibold">Bennufly Technology Pvt. Ltd.</h2>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-2.5">
                    <MapPin className="mt-0.5 size-4 shrink-0" />
                    <span>IT Park, Nagpur, Maharashtra, India</span>
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
                  <li className="flex gap-2.5">
                    <MessageCircle className="mt-0.5 size-4 shrink-0" />
                    <a
                      href={whatsappHref(settings.whatsapp, settings.whatsapp_message)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground"
                    >
                      WhatsApp {settings.phone}
                    </a>
                  </li>
                </ul>
                <div className="mt-6 flex flex-wrap gap-2">
                  <a
                    href={whatsappHref(settings.whatsapp, settings.whatsapp_message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                  >
                    Chat on WhatsApp
                  </a>
                  <a
                    href={`mailto:${settings.email}`}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-semibold"
                  >
                    Email us
                  </a>
                  <a
                    href={`tel:${settings.phone?.replace(/\s/g, "")}`}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-semibold"
                  >
                    Call us
                  </a>
                </div>
              </div>

              <div className="rounded-2xl border border-hairline bg-card p-6">
                <h2 className="inline-flex items-center gap-2 font-display text-lg font-semibold">
                  <Clock className="size-4 text-primary" /> Working hours
                </h2>
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  {HOURS.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">
                  Online inquiries can be submitted 24/7.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-hairline">
                <iframe
                  title="Bennufly Technology location — IT Park, Nagpur"
                  src="https://www.google.com/maps?q=IT%20Park%2C%20Nagpur%2C%20Maharashtra%2C%20India&output=embed"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-64 w-full border-0"
                />
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <ContactForm serviceOptions={((services ?? []) as any[]).map((s) => s.title)} />
          </Reveal>
        </div>
      </Section>
    </SiteShell>
  );
}

function ContactForm({ serviceOptions }: { serviceOptions: string[] }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  function set(k: string, v: string) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = String(issue.path[0]);
        if (!next[k]) next[k] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setBusy(true);
    const d = parsed.data;
    const { error } = await supabase.from("leads").insert({
      name: d.name,
      email: d.email.toLowerCase(),
      phone: d.phone || null,
      company: d.company || null,
      service: d.service || null,
      budget: d.budget || null,
      timeline: d.timeline || null,
      message: d.message,
      source: "contact",
    });
    setBusy(false);
    if (error) {
      toast.error("We could not send your message right now. Please try again.");
      return;
    }
    setDone(true);
    toast.success("Thanks for reaching out. Our team will get back to you soon.");
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-hairline bg-card p-10 text-center">
        <p className="font-display text-lg font-semibold">Thanks for reaching out.</p>
        <p className="mt-2 text-sm text-muted-foreground">Our team will get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-hairline bg-card p-6 sm:grid-cols-2 sm:p-8">
      <Field label="Name" required error={errors["name"]}>
        <input className={inputClass} maxLength={100} value={values["name"] ?? ""} onChange={(e) => set("name", e.target.value)} required />
      </Field>
      <Field label="Email" required error={errors["email"]}>
        <input type="email" className={inputClass} maxLength={255} value={values["email"] ?? ""} onChange={(e) => set("email", e.target.value)} required />
      </Field>
      <Field label="Phone" error={errors["phone"]}>
        <input className={inputClass} maxLength={30} value={values["phone"] ?? ""} onChange={(e) => set("phone", e.target.value)} />
      </Field>
      <Field label="Company" error={errors["company"]}>
        <input className={inputClass} maxLength={120} value={values["company"] ?? ""} onChange={(e) => set("company", e.target.value)} />
      </Field>
      <Field label="Service" error={errors["service"]}>
        <select className={inputClass} value={values["service"] ?? ""} onChange={(e) => set("service", e.target.value)}>
          <option value="">Select a service</option>
          {serviceOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
          <option value="Other">Other</option>
        </select>
      </Field>
      <Field label="Budget" error={errors["budget"]}>
        <select className={inputClass} value={values["budget"] ?? ""} onChange={(e) => set("budget", e.target.value)}>
          <option value="">Select a budget</option>
          {BUDGETS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Timeline" className="sm:col-span-2" error={errors["timeline"]}>
        <select className={inputClass} value={values["timeline"] ?? ""} onChange={(e) => set("timeline", e.target.value)}>
          <option value="">Select a timeline</option>
          {TIMELINES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Message" required className="sm:col-span-2" error={errors["message"]}>
        <textarea rows={6} className={inputClass} maxLength={2000} value={values["message"] ?? ""} onChange={(e) => set("message", e.target.value)} required />
      </Field>
      <div className="sm:col-span-2">
        <SubmitButton busy={busy}>Send message</SubmitButton>
      </div>
    </form>
  );
}