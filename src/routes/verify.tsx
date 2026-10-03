import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { BadgeCheck, CheckCircle2, Circle, Printer, Search, ShieldAlert, XCircle } from "lucide-react";
import { SiteShell, PageHero } from "@/components/site/site-shell";
import { Section } from "@/components/site/primitives";
import { inputClass } from "@/components/site/form-controls";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/learning";

const T = "Verify Certificate & Track Application — Bennufly Technology";
const D =
  "Verify a Bennufly Technology internship certificate by its ID, or track the status of your internship application.";

const searchSchema = z.object({
  cert: z.string().optional(),
  app: z.string().optional(),
  tab: z.enum(["certificate", "application"]).optional(),
});

export const Route = createFileRoute("/verify")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/verify" }],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const search = Route.useSearch();
  const initialTab = search.tab ?? (search.app ? "application" : "certificate");
  return (
    <SiteShell>
      <PageHero
        eyebrow="Verification Portal"
        title={<>Verify. Track. <span className="text-gradient">Trust.</span></>}
        description="Confirm the authenticity of a Bennufly certificate, or check where your internship application stands."
      />
      <Section>
        <div className="mx-auto max-w-3xl">
          <Tabs defaultValue={initialTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="certificate">Verify Certificate</TabsTrigger>
              <TabsTrigger value="application">Track Application</TabsTrigger>
            </TabsList>
            <TabsContent value="certificate">
              <CertificateVerifier initial={search.cert} />
            </TabsContent>
            <TabsContent value="application">
              <ApplicationTracker initial={search.app} />
            </TabsContent>
          </Tabs>
        </div>
      </Section>
    </SiteShell>
  );
}

type Cert = {
  certificate_id: string;
  recipient_name: string;
  program_name: string;
  domain: string | null;
  duration: string | null;
  start_date: string | null;
  end_date: string | null;
  issue_date: string;
  performance: string | null;
  status: string;
};

function CertificateVerifier({ initial }: { initial?: string }) {
  const [id, setId] = useState(initial ?? "");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Cert | null | undefined>(undefined);
  const [err, setErr] = useState("");

  async function run(value: string) {
    const v = value.trim().toUpperCase();
    if (v.length < 6 || v.length > 40) {
      setErr("Enter a valid certificate ID, e.g. BNF-CERT-2026-AB12CD");
      return;
    }
    setErr("");
    setBusy(true);
    const { data, error } = await (supabase.rpc as any)("verify_certificate", { _certificate_id: v });
    setBusy(false);
    if (error) {
      setErr("Verification is unavailable right now. Please try again.");
      return;
    }
    setResult(((data as Cert[]) ?? [])[0] ?? null);
  }

  useEffect(() => {
    if (initial) run(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <form
        className="surface-panel flex flex-col gap-3 rounded-2xl p-5 sm:flex-row"
        onSubmit={(e) => { e.preventDefault(); run(id); }}
      >
        <input
          className={inputClass}
          placeholder="Certificate ID (e.g. BNF-CERT-2026-AB12CD)"
          value={id}
          maxLength={40}
          onChange={(e) => setId(e.target.value)}
          aria-label="Certificate ID"
        />
        <Button type="submit" disabled={busy} className="shrink-0">
          <Search className="mr-2 size-4" /> {busy ? "Verifying..." : "Verify"}
        </Button>
      </form>
      {err && <p className="text-sm text-destructive">{err}</p>}

      {result === null && (
        <div className="surface-panel rounded-2xl p-8 text-center">
          <XCircle className="mx-auto size-10 text-destructive" />
          <p className="mt-3 font-display text-lg font-semibold">No certificate found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Check the ID and try again. If you believe this is an error, contact us.
          </p>
        </div>
      )}

      {result && (
        <div className="surface-panel relative overflow-hidden rounded-2xl p-8 print:shadow-none">
          {result.status === "valid" ? (
            <div className="flex items-center gap-2 text-sm font-semibold text-brand">
              <BadgeCheck className="size-5" /> Verified — issued by Bennufly Technology Pvt. Ltd.
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
              <ShieldAlert className="size-5" /> This certificate has been revoked and is no longer valid.
            </div>
          )}
          <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">Awarded to</p>
          <p className="font-display text-3xl font-semibold">{result.recipient_name}</p>
          <p className="mt-4 text-muted-foreground">for successfully completing</p>
          <p className="font-display text-xl font-semibold text-gradient">{result.program_name}</p>
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <Item label="Certificate ID" value={result.certificate_id} />
            <Item label="Issued on" value={formatDate(result.issue_date)} />
            <Item label="Domain" value={result.domain} />
            <Item label="Duration" value={result.duration} />
            <Item
              label="Period"
              value={result.start_date ? `${formatDate(result.start_date)} – ${result.end_date ? formatDate(result.end_date) : "Present"}` : null}
            />
            <Item label="Performance" value={result.performance} />
          </dl>
          <div className="mt-6 flex flex-wrap gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-2 size-4" /> Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/verify?cert=${result.certificate_id}`);
              }}
            >
              Copy verification link
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Item({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

type Track = {
  application_number: string;
  first_name: string;
  program_name: string;
  interested_domain: string | null;
  status: string;
  submitted_at: string;
  updated_at: string;
};

const STAGES = ["Submitted", "Under Review", "Shortlisted", "Selected", "Active", "Completed"];

function stageIndex(status: string) {
  switch (status) {
    case "New": return 0;
    case "Under Review": return 1;
    case "Shortlisted": return 2;
    case "Selected": return 3;
    case "Active": return 4;
    case "Completed": return 5;
    default: return -1;
  }
}

const NEXT_STEPS: Record<string, string> = {
  New: "We have received your application. Our team will begin reviewing it shortly.",
  "Under Review": "Your profile is being reviewed by our team. This usually takes a few working days.",
  Shortlisted: "You have been shortlisted. Watch your email and phone for an interview or task invitation.",
  Selected: "Congratulations! You have been selected. Onboarding details will be shared by email.",
  Active: "Your internship is in progress. Keep shipping — your mentor is tracking your work.",
  Completed: "You have completed the program. Your certificate will be issued and can be verified here.",
  Rejected: "Thank you for applying. We are unable to move forward this time — you are welcome to apply for future programs.",
};

function ApplicationTracker({ initial }: { initial?: string }) {
  const [num, setNum] = useState(initial ?? "");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Track | null | undefined>(undefined);
  const [err, setErr] = useState("");

  async function run(e: React.FormEvent) {
    e.preventDefault();
    const parsed = z
      .object({
        num: z.string().trim().regex(/^BNF-APP-[A-Z0-9]{8}$/i, "Enter your application ID, e.g. BNF-APP-1A2B3C4D"),
        email: z.string().trim().email("Enter the email used in your application").max(255),
      })
      .safeParse({ num, email });
    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setErr("");
    setBusy(true);
    const { data, error } = await (supabase.rpc as any)("track_internship_application", {
      _application_number: parsed.data.num,
      _email: parsed.data.email,
    });
    setBusy(false);
    if (error) {
      setErr("Tracking is unavailable right now. Please try again.");
      return;
    }
    setResult(((data as Track[]) ?? [])[0] ?? null);
  }

  const idx = result ? stageIndex(result.status) : -1;

  return (
    <div className="space-y-6">
      <form onSubmit={run} className="surface-panel grid gap-3 rounded-2xl p-5 sm:grid-cols-[1fr_1fr_auto]">
        <input className={inputClass} placeholder="Application ID (BNF-APP-...)" maxLength={20} value={num} onChange={(e) => setNum(e.target.value)} aria-label="Application ID" />
        <input type="email" className={inputClass} placeholder="Email used to apply" maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
        <Button type="submit" disabled={busy}>
          <Search className="mr-2 size-4" /> {busy ? "Checking..." : "Track"}
        </Button>
      </form>
      <p className="text-xs text-muted-foreground">
        For your privacy, both your application ID and email are required. Your ID was shown after you applied.
      </p>
      {err && <p className="text-sm text-destructive">{err}</p>}

      {result === null && (
        <div className="surface-panel rounded-2xl p-8 text-center">
          <XCircle className="mx-auto size-10 text-destructive" />
          <p className="mt-3 font-display text-lg font-semibold">No matching application</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Make sure the ID and email match what you submitted. Need help? <Link to="/contact" className="text-brand underline">Contact us</Link>.
          </p>
        </div>
      )}

      {result && (
        <div className="surface-panel rounded-2xl p-6 sm:p-8">
          <p className="text-sm text-muted-foreground">Hi {result.first_name},</p>
          <p className="font-display text-xl font-semibold">{result.program_name}</p>
          <p className="text-xs text-muted-foreground">
            {result.application_number} · Applied {formatDate(result.submitted_at)} · Updated {formatDate(result.updated_at)}
          </p>

          {result.status === "Rejected" ? (
            <div className="mt-6 rounded-xl border border-hairline bg-surface p-4 text-sm">
              <span className="font-semibold">Status: Not selected</span>
            </div>
          ) : (
            <ol className="mt-6 space-y-3">
              {STAGES.map((s, i) => {
                const done = i <= idx;
                return (
                  <li key={s} className="flex items-center gap-3 text-sm">
                    {done ? <CheckCircle2 className="size-5 text-brand" /> : <Circle className="size-5 text-muted-foreground" />}
                    <span className={done ? "font-medium text-foreground" : "text-muted-foreground"}>{s}</span>
                    {i === idx && <span className="rounded-full bg-brand/15 px-2 py-0.5 text-xs text-brand">Current</span>}
                  </li>
                );
              })}
            </ol>
          )}
          <div className="mt-6 rounded-xl border border-hairline bg-surface p-4 text-sm">
            <p className="font-semibold">Next steps</p>
            <p className="mt-1 text-muted-foreground">{NEXT_STEPS[result.status] ?? "Our team will contact you with updates."}</p>
          </div>
        </div>
      )}
    </div>
  );
}
