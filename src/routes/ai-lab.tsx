import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import { ArrowRight, Bot, Code2, Cpu, Loader2, Rocket, Square, Wand2 } from "lucide-react";
import { SiteShell, PageHero } from "@/components/site/site-shell";
import { Section, Reveal, SectionHeading } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const T = "AI Demo Lab — Try Live AI Tools | Bennufly Technology";
const D =
  "Try Bennufly's live AI demos: a customer-support agent simulator, a product idea to MVP architecture generator, and an AI code reviewer.";

export const Route = createFileRoute("/ai-lab")({
  
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://official.bennufly.in/ai-lab" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://official.bennufly.in/ai-lab",
      },
    ],
  }),

  component: AiLabPage,
});

type DemoId = "support" | "mvp" | "code";

const INDUSTRIES = ["E-commerce", "Healthcare", "Real Estate", "EdTech", "Restaurant"];

const DEMOS: {
  id: DemoId;
  icon: typeof Bot;
  title: string;
  blurb: string;
  placeholder: string;
  samples: string[];
  max: number;
}[] = [
  {
    id: "support",
    icon: Bot,
    title: "Customer Support Agent",
    blurb: "See how an AI agent replies to your customers, reads their mood and suggests the next action.",
    placeholder: "e.g. My order was supposed to arrive yesterday and it still hasn't come. This is the second time!",
    samples: [
      "My order was supposed to arrive yesterday and it still hasn't come. This is the second time!",
      "Do you have any 2BHK flats near Dharampeth under budget? I want to visit this weekend.",
      "Can I reschedule my doctor appointment from Friday to Monday morning?",
    ],
    max: 700,
  },
  {
    id: "mvp",
    icon: Rocket,
    title: "Idea → MVP Architect",
    blurb: "Describe a product in one line. Get features, tech stack, timeline and risks in seconds.",
    placeholder: "e.g. An AI invoice scanner for CA firms in India",
    samples: [
      "An AI invoice scanner for CA firms in India",
      "Uber for laundry pickup in Nagpur",
      "A WhatsApp-based appointment booking system for clinics",
    ],
    max: 400,
  },
  {
    id: "code",
    icon: Code2,
    title: "AI Code Reviewer",
    blurb: "Paste a snippet. The AI flags security risks, speed issues and returns a cleaner version.",
    placeholder: "Paste your JavaScript, Python, SQL or any code here…",
    samples: [
      `app.get("/user", (req, res) => {\n  db.query("SELECT * FROM users WHERE id = " + req.query.id, (err, rows) => {\n    res.send(rows);\n  });\n});`,
      `def get_total(items):\n    total = 0\n    for i in range(len(items)):\n        total = total + items[i]["price"] * items[i]["qty"]\n    return total`,
    ],
    max: 4000,
  },
];

function AiLabPage() {
  const [active, setActive] = useState<DemoId>("support");
  const demo = DEMOS.find((d) => d.id === active)!;

  return (
    <SiteShell>
      <PageHero
        eyebrow="Bennufly AI Lab"
        title={
          <>
            Don't just read about AI. <span className="text-gradient">Try it live.</span>
          </>
        }
        description="Three working AI tools built by our team. Type something real and watch the AI respond in seconds — the same capabilities we build into client products."
      >
        <div className="flex flex-wrap gap-2 text-xs">
          {["Live AI responses", "No sign-up needed", "Built in Nagpur, India"].map((t) => (
            <span key={t} className="surface-panel inline-flex items-center gap-2 rounded-full px-3 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> {t}
            </span>
          ))}
        </div>
      </PageHero>

      <Section>
        <div className="grid gap-3 sm:grid-cols-3">
          {DEMOS.map((d) => {
            const Icon = d.icon;
            const on = d.id === active;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setActive(d.id)}
                className={`surface-panel rounded-2xl p-5 text-left transition ${
                  on ? "ring-2 ring-primary" : "opacity-80 hover:opacity-100"
                }`}
              >
                <Icon className="h-5 w-5 text-primary" />
                <p className="mt-3 font-semibold">{d.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{d.blurb}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          <DemoPanel key={demo.id} demo={demo} />
        </div>
      </Section>

      <Section>
        <Reveal>
          <div className="surface-panel rounded-3xl p-8 text-center md:p-12">
            <Cpu className="mx-auto h-8 w-8 text-primary" />
            <SectionHeading
              eyebrow="Deploy it for real"
              title="Want this AI inside your business?"
              description="We build custom AI agents, automations and smart products — connected to your data, WhatsApp, website and tools."
            />
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/start-project">
                  Start an AI project <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact">Book a free consultation</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </Section>
    </SiteShell>
  );
}

function DemoPanel({ demo }: { demo: (typeof DEMOS)[number] }) {
  const [input, setInput] = useState("");
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function run() {
    const text = input.trim();
    if (!text || loading) return;
    setOutput("");
    setError("");
    setLoading(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const payload = demo.id === "support" ? `Industry: ${industry}\nCustomer message: ${text}` : text;
      const res = await fetch("/api/ai-lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demo: demo.id, input: payload }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "Something went wrong. Please try again.");
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        setOutput((o) => o + dec.decode(value, { stream: true }));
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError("Connection lost. Please try again.");
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="surface-panel rounded-3xl p-6">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Wand2 className="h-4 w-4 text-primary" /> {demo.title}
        </div>

        {demo.id === "support" && (
          <div className="mt-4 flex flex-wrap gap-2">
            {INDUSTRIES.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndustry(i)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  industry === i ? "border-primary bg-primary/10 text-primary" : "border-hairline text-muted-foreground"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        )}

        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, demo.max))}
          placeholder={demo.placeholder}
          rows={demo.id === "code" ? 10 : 5}
          className={`mt-4 ${demo.id === "code" ? "font-mono text-xs" : ""}`}
        />
        <div className="mt-1 text-right text-[11px] text-muted-foreground">
          {input.length}/{demo.max}
        </div>

        <p className="mt-3 text-xs text-muted-foreground">Try a sample:</p>
        <div className="mt-2 flex flex-col gap-2">
          {demo.samples.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setInput(s)}
              className="truncate rounded-lg border border-hairline px-3 py-2 text-left text-xs text-muted-foreground transition hover:border-primary hover:text-foreground"
            >
              {s.split("\n")[0]}
            </button>
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <Button onClick={run} disabled={loading || !input.trim()} className="flex-1">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            {loading ? "Thinking…" : "Run AI"}
          </Button>
          {loading && (
            <Button variant="outline" onClick={() => abortRef.current?.abort()}>
              <Square className="mr-1 h-3.5 w-3.5" /> Stop
            </Button>
          )}
        </div>
      </div>

      <div className="surface-panel min-h-[320px] rounded-3xl p-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold tracking-[0.2em] uppercase">AI output</span>
          {loading && (
            <span className="inline-flex items-center gap-1.5 text-primary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> live
            </span>
          )}
        </div>
        <div className="mt-4">
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : output ? (
            <div className="prose prose-sm max-w-none text-sm leading-relaxed dark:prose-invert [&_h3]:mt-4 [&_h3]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-primary [&_li]:ml-4 [&_li]:list-disc [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:text-xs">
              <ReactMarkdown>{output}</ReactMarkdown>
            </div>
          ) : loading ? (
            <p className="text-sm text-muted-foreground">AI is working on it…</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Pick a sample or type your own, then press <strong>Run AI</strong>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
