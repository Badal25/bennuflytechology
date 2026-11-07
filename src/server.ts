import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

const SERVER_ENV_BINDINGS = [
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  // Direct AI provider keys (used when the Lovable AI key is unavailable,
  // e.g. on the self-hosted Cloudflare Worker deployment).
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "GOOGLE_API_KEY",
  "OPENAI_MODEL",
  "ANTHROPIC_MODEL",
  "GOOGLE_MODEL",
    "BREVO_API_KEY",
] as const;

/**
 * Cloudflare passes Worker variables to fetch() as env bindings. The Node
 * process.env compatibility object is not populated unless a separate
 * compatibility flag is enabled, while the generated Supabase integration
 * reads process.env inside server handlers. Copy only the bindings used by
 * the server into that compatibility object before loading the app entry.
 *
 * Existing process.env values win so Lovable Cloud and local builds keep
 * their current environment-injection behavior.
 */
function bindWorkerEnvironment(request: Request, env: unknown): void {
  const candidates: unknown[] = [
    env,
    (request as { runtime?: { cloudflare?: { env?: unknown } } })
      .runtime?.cloudflare?.env,
    (globalThis as { __env__?: unknown }).__env__,
  ];

  for (const name of SERVER_ENV_BINDINGS) {
    if (process.env[name]) continue;

    for (const candidate of candidates) {
      if (!candidate || typeof candidate !== "object") continue;

      const value = Reflect.get(candidate, name);

      if (typeof value === "string" && value.length > 0) {
        process.env[name] = value;
        break;
      }
    }
  }
}

function bindWorkerEnvironment(request: Request, env: unknown): void {
  const source = resolveWorkerEnv(request, env);
  if (!source) return;

  for (const name of SERVER_ENV_BINDINGS) {
    if (process.env[name]) continue;
    const value = Reflect.get(source, name);
    if (typeof value === "string" && value.length > 0) {
      process.env[name] = value;
    }
  }
}

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      bindWorkerEnvironment(request, env);
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
