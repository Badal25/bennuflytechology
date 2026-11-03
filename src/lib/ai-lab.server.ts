// Server-only: AI Lab demos via Lovable AI Gateway (Responses API, streamed).
const MODEL = "openai/gpt-6-astra";
const RUN_HEADER = "X-Lovable-AIG-Run-ID";

const PROMPTS: Record<string, string> = {
  support: `You are a demo AI customer-support agent built by Bennufly Technology (Nagpur, India).
The user gives an industry and a customer message. Reply in markdown with exactly these sections:
### Agent reply
(a warm, helpful reply to the customer, max 90 words, as that business)
### Sentiment
(one of: Positive / Neutral / Negative / Urgent — plus one short reason)
### Recommended business action
(2-3 bullet points for the business team)
Never invent real prices or policies; keep it plausible and generic.`,
  mvp: `You are Bennufly Technology's AI solutions architect. The user gives a one-line product idea.
Respond in concise markdown with these sections:
### Product summary (2 sentences)
### Core MVP features (5-7 bullets)
### Recommended tech stack (Frontend, Backend, Database, AI/ML, Cloud — one line each)
### MVP timeline (3-4 phases with week ranges)
### Key risks (2-3 bullets)
Keep the whole answer under 350 words. Do not give cost figures.`,
  code: `You are a senior code reviewer at Bennufly Technology. The user pastes a code snippet.
Respond in concise markdown with these sections:
### Security issues
### Performance improvements
### Clean-code suggestions
### Improved version (one fenced code block)
If a section has nothing, say "None found". Keep explanations under 250 words excluding code.`,
};

PROMPTS["assistant"] = `You are the Bennufly AI Assistant on the website of Bennufly Technology Pvt. Ltd. (Nagpur, Maharashtra, India).
Bennufly offers: software development, web development, mobile apps (Android/iOS, Flutter, React Native), AI & machine learning, SaaS products, UI/UX design, cloud & DevOps, APIs/backend, business automation, custom CRM/ERP, Digital Marketing (Meta & Google ads, SEO, social media), Email Marketing (drip sequences, newsletters, outreach, deliverability), AI Chatbots & Agents (website and WhatsApp bots trained on business documents), and remote student internships & learning programs.
Useful pages: /services, /portfolio, /start-project (get a quote), /contact, /careers, /learning (internships), /verify (track applications, verify certificates), /ai-lab, /blog.
Contact: supportbennufly@gmail.com, +91 94041 44550 (WhatsApp available).
The input is the conversation so far. Reply only as the assistant to the latest user message, in the user's language (Hindi/Hinglish/English), short (max 90 words), friendly, markdown allowed.
Never invent prices, guarantees, client names or placement promises. For pricing say it depends on scope and suggest /start-project. When a visitor shows project interest, invite them to share requirements on /start-project or WhatsApp.`;

const LIMITS: Record<string, number> = { support: 800, mvp: 400, code: 4000, assistant: 4000 };

export async function handleAiLab(request: Request): Promise<Response> {
  let body: { demo?: string; input?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const demo = String(body.demo ?? "");
  const input = String(body.input ?? "").trim();
  if (!PROMPTS[demo]) return Response.json({ error: "Unknown demo." }, { status: 400 });
  if (!input) return Response.json({ error: "Please enter something to try." }, { status: 400 });
  if (input.length > (LIMITS[demo] ?? 0))
    return Response.json(
      { error: `Please keep it under ${LIMITS[demo]} characters.` },
      { status: 400 },
    );

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    const fallback = await providerFallbackResponse(demo, input, request);
    if (fallback) return fallback;
    return Response.json({ error: "AI is not configured." }, { status: 500 });
  }

  let upstream: Response;
  try {
    upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      signal: request.signal,
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: MODEL,
        instructions: PROMPTS[demo],
        input,
        stream: true,
        store: false,
        reasoning: { effort: "low", summary: "auto" },
        include: ["reasoning.encrypted_content"],
      }),
    });
  } catch (e) {
    if (request.signal.aborted) return new Response(null, { status: 499 });
    throw e;
  }

  if (!upstream.ok || !upstream.body) {
    const status = upstream.status;
    const msg =
      status === 429
        ? "Too many people are trying the lab right now. Please wait a minute and retry."
        : status === 402
          ? "The AI demo is temporarily unavailable. Please try again later."
          : "The AI demo could not respond. Please try again.";
    return Response.json({ error: msg }, { status });
  }

  // Convert SSE into a plain text stream of output deltas.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const evt = JSON.parse(data);
              if (evt.type === "response.output_text.delta" && evt.delta) {
                controller.enqueue(encoder.encode(evt.delta));
              } else if (evt.type === "response.failed" || evt.type === "error") {
                controller.enqueue(
                  encoder.encode("\n\n_The AI demo stopped unexpectedly. Please try again._"),
                );
              }
            } catch {
              /* ignore partial */
            }
          }
        }
      } catch {
        /* upstream aborted */
      }
      controller.close();
    },
    cancel() {
      reader.cancel();
    },
  });

  const headers = new Headers({
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  });
  const runId = upstream.headers.get(RUN_HEADER);
  if (runId) headers.set(RUN_HEADER, runId);
  return new Response(stream, { headers });
}
