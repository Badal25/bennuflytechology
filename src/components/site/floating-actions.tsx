import { useState } from "react";
import { MessageCircle, Bot, X, Send } from "lucide-react";
import { useSettings } from "@/lib/db";
import { whatsappHref } from "@/lib/site";

/**
 * AI assistant shell. The model integration is intentionally modular: when an
 * assistant endpoint is configured it can be wired into `sendMessage` below.
 * Until then it answers from a small local knowledge base and always offers a
 * human contact route instead of failing.
 */
const LOCAL_ANSWERS: { match: RegExp; answer: string }[] = [
  {
    match: /service|build|develop|software|app|website/i,
    answer:
      "We build software, websites, mobile apps, AI solutions, SaaS products, UI/UX design, cloud & DevOps, APIs and business automation. The Services page has the full breakdown.",
  },
  {
    match: /intern|student|learn|training/i,
    answer:
      "Bennufly runs remote internships and learning programs where students work on real projects with mentorship. See Learning & Internships, or apply through Careers.",
  },
  {
    match: /career|job|hiring|apply|role/i,
    answer:
      "Open roles are listed on the Careers page — full-time, internship and freelance, remote by default. You can apply directly with a resume.",
  },
  {
    match: /contact|email|phone|reach|call|talk/i,
    answer:
      "You can reach us at supportbennufly@gmail.com or +91 94041 44550. The Contact page also has a form that reaches our team directly.",
  },
  {
    match: /process|timeline|how long|start/i,
    answer:
      "Our process runs Discovery → Planning → Design → Development → Testing → Deployment → Support. A focused MVP usually takes a few weeks; larger platforms run in staged releases.",
  },
  {
    match: /technolog|stack|react|python|flutter/i,
    answer:
      "We work with React, Next.js, TypeScript, Node.js, Python, Java, Flutter, React Native, PostgreSQL, AWS, Docker and modern AI APIs. Full list on the Technologies page.",
  },
  {
    match: /price|cost|quote|budget/i,
    answer:
      "Pricing depends on scope. Share your requirements through Start a Project and we will come back with a scoped proposal.",
  },
];

type Msg = { role: "user" | "bot"; text: string };

export function FloatingActions() {
  const { settings } = useSettings();
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text: "Hi, I'm the Bennufly AI Assistant. Ask me about our services, technologies, process, careers or internships.",
    },
  ]);

  const [busy, setBusy] = useState(false);

  function localAnswer(text: string) {
    return (
      LOCAL_ANSWERS.find((a) => a.match.test(text))?.answer ??
      "I don't have that answer yet. The quickest route is our team — email supportbennufly@gmail.com or use the Contact page and we'll reply personally."
    );
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim().slice(0, 500);
    if (!text || busy) return;
    const history = [...messages, { role: "user" as const, text }];
    setMessages([...history, { role: "bot", text: "…" }]);
    setInput("");
    setBusy(true);
    const transcript = history
      .slice(-10)
      .map((m) => `${m.role === "user" ? "Visitor" : "Assistant"}: ${m.text}`)
      .join("\n")
      .slice(-3800);
    let out = "";
    const setLast = (t: string) =>
      setMessages((m) => [...m.slice(0, -1), { role: "bot", text: t }]);
    try {
      const res = await fetch("/api/ai-lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demo: "assistant", input: transcript }),
      });
      if (!res.ok || !res.body) throw new Error("ai");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        out += dec.decode(value, { stream: true });
        setLast(out);
      }
      if (!out.trim()) setLast(localAnswer(text));
    } catch {
      setLast(out || localAnswer(text));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
        {chatOpen && (
          <div className="surface-panel flex h-[26rem] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl shadow-xl">
            <div className="flex items-center justify-between border-b border-hairline bg-background/60 px-4 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <Bot className="size-4 shrink-0 text-primary" />
                <span className="truncate font-display text-sm font-semibold">
                  Bennufly AI Assistant
                </span>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                aria-label="Close assistant"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-surface-2 text-foreground"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2 border-t border-hairline p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={500}
                placeholder="Ask a question…"
                aria-label="Message"
                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                aria-label="Send"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
              >
                <Send className="size-4" />
              </button>
            </form>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {settings.ai_chat_enabled !== false && (
            <button
              type="button"
              onClick={() => setChatOpen((v) => !v)}
              aria-label="Open Bennufly AI Assistant"
              className="inline-flex size-12 items-center justify-center rounded-full border border-hairline bg-surface text-foreground shadow-lg transition-transform hover:scale-105"
            >
              <Bot className="size-5" />
            </button>
          )}
          <a
            href={whatsappHref(settings.whatsapp, settings.whatsapp_message)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with Bennufly on WhatsApp"
            className="inline-flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
          >
            <MessageCircle className="size-5" />
          </a>
        </div>
      </div>
    </>
  );
}