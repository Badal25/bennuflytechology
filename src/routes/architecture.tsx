import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, Brain, Cloud, Database, Globe, Lock, Server, ShieldCheck, Smartphone, Zap, Activity, CreditCard, Bell, type LucideIcon,
} from "lucide-react";
import { SiteShell, PageHero } from "@/components/site/site-shell";
import { Section, Reveal, SectionHeading } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";

const T = "Live Architecture Visualizer — How We Build | Bennufly Technology";
const D =
  "Explore interactive system blueprints for e-commerce, AI SaaS and fintech apps. See how Bennufly designs secure, scalable architecture layer by layer.";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ArchitecturePage,
});

type Node = {
  id: string;
  label: string;
  tech: string;
  icon: LucideIcon;
  x: number; // 0-100
  y: number; // 0-100
  role: string;
  scale: string;
  security: string;
};

type Blueprint = {
  id: string;
  title: string;
  tagline: string;
  metrics: { label: string; value: string }[];
  nodes: Node[];
  edges: [string, string][];
};

const BLUEPRINTS: Blueprint[] = [
  {
    id: "ecommerce",
    title: "High-Traffic E-Commerce",
    tagline: "Flash sales, lakhs of visitors, zero downtime.",
    metrics: [
      { label: "Target uptime", value: "99.9%" },
      { label: "Page load", value: "< 1.5s" },
      { label: "Peak traffic", value: "50k+ users" },
    ],
    nodes: [
      { id: "web", label: "Storefront", tech: "React · TanStack Start", icon: Globe, x: 10, y: 30, role: "Fast, SEO-friendly storefront rendered at the edge so product pages load instantly.", scale: "Static assets cached on a global CDN; pages server-rendered close to the buyer.", security: "Strict content policies, bot protection on checkout." },
      { id: "app", label: "Mobile App", tech: "Flutter", icon: Smartphone, x: 10, y: 72, role: "Native Android & iOS shopping app sharing the same backend.", scale: "Offline cart, image caching and push-driven re-engagement.", security: "Token-based sessions, secure storage on device." },
      { id: "edge", label: "Edge API Gateway", tech: "Cloudflare Workers", icon: Cloud, x: 38, y: 50, role: "Single entry point that routes every request, applies rate limits and caching.", scale: "Runs in 300+ cities, scales automatically with traffic spikes.", security: "DDoS protection, rate limiting, WAF rules." },
      { id: "pay", label: "Payments", tech: "Razorpay · Stripe", icon: CreditCard, x: 64, y: 18, role: "UPI, cards and wallets with verified webhooks for order confirmation.", scale: "Idempotent order handling so retries never double-charge.", security: "PCI-compliant provider; signed webhook verification." },
      { id: "db", label: "Database", tech: "PostgreSQL", icon: Database, x: 64, y: 55, role: "Products, orders, inventory and customers in a relational store.", scale: "Indexes, read replicas and connection pooling for heavy reads.", security: "Row-level security, encrypted backups." },
      { id: "notify", label: "Notifications", tech: "Email · WhatsApp · Push", icon: Bell, x: 64, y: 86, role: "Order updates, abandoned-cart reminders and delivery alerts.", scale: "Queued delivery so bursts never slow checkout.", security: "Opt-in tracking and unsubscribe handling." },
      { id: "ai", label: "AI Recommendations", tech: "LLM Gateway", icon: Brain, x: 90, y: 40, role: "Personalised product suggestions and smart search.", scale: "Results cached per segment to keep costs predictable.", security: "No raw personal data sent to AI models." },
      { id: "mon", label: "Monitoring", tech: "Logs · Alerts", icon: Activity, x: 90, y: 76, role: "Live dashboards for errors, latency and sales funnels.", scale: "Alerts before customers notice issues.", security: "Audit logs for every admin action." },
    ],
    edges: [["web", "edge"], ["app", "edge"], ["edge", "pay"], ["edge", "db"], ["edge", "notify"], ["db", "ai"], ["db", "mon"], ["pay", "db"]],
  },
  {
    id: "ai-saas",
    title: "AI SaaS Product",
    tagline: "Multi-tenant AI platform with usage-based billing.",
    metrics: [
      { label: "AI response", value: "< 3s" },
      { label: "Tenants", value: "Unlimited" },
      { label: "Data isolation", value: "Per tenant" },
    ],
    nodes: [
      { id: "web", label: "Web Dashboard", tech: "React · TypeScript", icon: Globe, x: 10, y: 50, role: "The workspace where customers chat, upload documents and view insights.", scale: "Streaming responses so answers appear word by word.", security: "Sign-in with Google or email, role-based access." },
      { id: "auth", label: "Auth & Teams", tech: "Auth · Roles", icon: Lock, x: 36, y: 20, role: "Organisations, members and permissions.", scale: "Stateless tokens verified at the edge.", security: "Roles in a protected table, never trusted from the browser." },
      { id: "edge", label: "API Layer", tech: "Server Functions", icon: Server, x: 36, y: 62, role: "Business logic, usage metering and AI orchestration.", scale: "Serverless — scales to zero and up instantly.", security: "Every request checked against the caller's workspace." },
      { id: "ai", label: "AI Engine", tech: "Gemini · GPT", icon: Brain, x: 64, y: 30, role: "Prompting, tool calling and structured outputs.", scale: "Model routing picks the cheapest model that fits the task.", security: "Prompt-injection guards and output validation." },
      { id: "vec", label: "Knowledge Base", tech: "pgvector", icon: Database, x: 64, y: 75, role: "Customer documents turned into searchable embeddings (RAG).", scale: "Vector indexes for millisecond semantic search.", security: "Tenant-scoped rows — no cross-customer leakage." },
      { id: "bill", label: "Billing", tech: "Subscriptions", icon: CreditCard, x: 90, y: 30, role: "Plans, credits and invoices tied to real usage.", scale: "Usage events aggregated in the background.", security: "Webhook signatures verified server-side." },
      { id: "mon", label: "Observability", tech: "Traces · Cost", icon: Activity, x: 90, y: 75, role: "Track latency, token cost and quality per feature.", scale: "Spot expensive prompts before the bill arrives.", security: "PII redacted from logs." },
    ],
    edges: [["web", "auth"], ["web", "edge"], ["edge", "ai"], ["edge", "vec"], ["ai", "vec"], ["edge", "bill"], ["ai", "mon"], ["auth", "edge"]],
  },
  {
    id: "fintech",
    title: "Fintech Mobile App",
    tagline: "Bank-grade security for money, KYC and transactions.",
    metrics: [
      { label: "Encryption", value: "AES-256" },
      { label: "Audit trail", value: "100%" },
      { label: "Fraud checks", value: "Real-time" },
    ],
    nodes: [
      { id: "app", label: "Mobile App", tech: "Flutter", icon: Smartphone, x: 10, y: 50, role: "Wallet, payments, statements and budgeting on Android & iOS.", scale: "Optimised for low-end devices and slow networks.", security: "Biometric lock, certificate pinning, root detection." },
      { id: "sec", label: "Security Layer", tech: "MFA · OTP", icon: ShieldCheck, x: 36, y: 25, role: "Multi-factor login, device binding and session control.", scale: "OTP and device checks run at the edge.", security: "Short-lived tokens, suspicious-login alerts." },
      { id: "edge", label: "Core API", tech: "Node.js", icon: Server, x: 36, y: 72, role: "Ledger logic, transfers and account services.", scale: "Idempotent transactions with retries and queues.", security: "Every money movement double-entry recorded." },
      { id: "kyc", label: "KYC & Compliance", tech: "eKYC APIs", icon: Lock, x: 64, y: 18, role: "PAN / Aadhaar verification and RBI-aligned onboarding.", scale: "Async verification so users aren't left waiting.", security: "Documents stored encrypted with restricted access." },
      { id: "db", label: "Ledger Database", tech: "PostgreSQL", icon: Database, x: 64, y: 55, role: "Immutable ledger of every transaction.", scale: "Partitioned tables for years of history.", security: "Encryption at rest, point-in-time recovery." },
      { id: "fraud", label: "Fraud Detection", tech: "AI Risk Scoring", icon: Brain, x: 90, y: 35, role: "Scores each transaction for unusual behaviour.", scale: "Decisions in milliseconds, inline with payments.", security: "Flags hold funds for manual review." },
      { id: "pay", label: "Payment Rails", tech: "UPI · NEFT", icon: Zap, x: 64, y: 88, role: "Connects to banking partners for real money movement.", scale: "Reconciliation jobs match every rupee daily.", security: "Signed, verified callbacks only." },
      { id: "audit", label: "Audit & Reports", tech: "Compliance Logs", icon: Activity, x: 90, y: 75, role: "Regulator-ready reports and full activity history.", scale: "Exports generated in the background.", security: "Tamper-evident audit logs." },
    ],
    edges: [["app", "sec"], ["app", "edge"], ["sec", "kyc"], ["edge", "db"], ["edge", "pay"], ["db", "fraud"], ["db", "audit"], ["kyc", "db"]],
  },
];

function ArchitecturePage() {
  const [bpId, setBpId] = useState(BLUEPRINTS[0].id);
  const bp = BLUEPRINTS.find((b) => b.id === bpId)!;
  const [selId, setSelId] = useState(bp.nodes[0].id);
  const sel = bp.nodes.find((n) => n.id === selId) ?? bp.nodes[0];
  const pos = (id: string) => bp.nodes.find((n) => n.id === id)!;
  const linked = new Set(bp.edges.filter((e) => e.includes(sel.id)).flat());

  return (
    <SiteShell>
      <PageHero
        eyebrow="Architecture Visualizer"
        title={<>See how your product is <span className="text-gradient">engineered.</span></>}
        description="Pick a product type and explore the live blueprint we use to build it — every layer, how it scales and how it stays secure."
      />

      <Section>
        <div className="grid gap-3 sm:grid-cols-3">
          {BLUEPRINTS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => { setBpId(b.id); setSelId(b.nodes[0].id); }}
              className={`surface-panel rounded-2xl p-5 text-left transition ${b.id === bpId ? "ring-2 ring-primary" : "opacity-80 hover:opacity-100"}`}
            >
              <p className="font-semibold">{b.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{b.tagline}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="surface-panel relative overflow-x-auto rounded-3xl p-4">
            <div className="relative mx-auto aspect-[16/10] min-w-[620px]">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                {bp.edges.map(([a, b]) => {
                  const A = pos(a), B = pos(b);
                  const on = a === sel.id || b === sel.id;
                  return (
                    <line
                      key={`${bp.id}-${a}-${b}`}
                      x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                      vectorEffect="non-scaling-stroke"
                      className={on ? "arch-flow stroke-primary" : "stroke-muted-foreground/30"}
                      strokeWidth={on ? 2 : 1}
                      strokeDasharray="6 6"
                    />
                  );
                })}
              </svg>
              {bp.nodes.map((n) => {
                const Icon = n.icon;
                const active = n.id === sel.id;
                const near = linked.has(n.id);
                return (
                  <button
                    key={`${bp.id}-${n.id}`}
                    type="button"
                    onClick={() => setSelId(n.id)}
                    style={{ left: `${n.x}%`, top: `${n.y}%` }}
                    className={`absolute w-32 -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background/90 p-2.5 text-left backdrop-blur transition ${
                      active ? "border-primary shadow-lg ring-2 ring-primary/40 scale-105" : near ? "border-primary/50" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="mt-1 text-xs font-semibold leading-tight">{n.label}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{n.tech}</p>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">Click any block to inspect it.</p>
          </div>

          <aside className="surface-panel rounded-3xl p-6">
            <sel.icon className="h-7 w-7 text-primary" />
            <h3 className="mt-3 text-xl font-semibold">{sel.label}</h3>
            <p className="text-sm text-primary">{sel.tech}</p>
            <dl className="mt-5 space-y-4 text-sm">
              <div><dt className="font-medium">What it does</dt><dd className="mt-1 text-muted-foreground">{sel.role}</dd></div>
              <div><dt className="font-medium">How it scales</dt><dd className="mt-1 text-muted-foreground">{sel.scale}</dd></div>
              <div><dt className="font-medium">How it stays secure</dt><dd className="mt-1 text-muted-foreground">{sel.security}</dd></div>
            </dl>
            <div className="mt-6 grid grid-cols-3 gap-2 border-t border-border pt-5">
              {bp.metrics.map((m) => (
                <div key={m.label}>
                  <p className="text-sm font-semibold text-gradient">{m.value}</p>
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </Section>

      <Section>
        <Reveal>
          <div className="surface-panel rounded-3xl p-8 text-center md:p-12">
            <SectionHeading
              eyebrow="Your blueprint"
              title="Want an architecture like this for your product?"
              description="Share your idea and we'll design a custom, scalable system plan for it — free first consultation."
            />
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/start-project">Start your project <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline"><Link to="/ai-lab">Try the AI Lab</Link></Button>
            </div>
          </div>
        </Reveal>
      </Section>
    </SiteShell>
  );
}
