
import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (
    request: Request,
    env: unknown,
    ctx: unknown,
  ) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

const SERVER_ENV_BINDINGS = [
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "GOOGLE_API_KEY",
  "OPENAI_MODEL",
  "ANTHROPIC_MODEL",
  "GOOGLE_MODEL",
  "BREVO_API_KEY",
] as const;

function exposeWorkerEnvironment(env: unknown): void {
  (globalThis as typeof globalThis & {
    __env__?: unknown;
  }).__env__ = env;
}
/**
 * Copies Cloudflare Worker environment bindings into process.env
 * so server-side integrations can access them.
 *
 * Existing process.env values are preserved.
 */
function bindWorkerEnvironment(request: Request, env: unknown): void {
  const candidates: unknown[] = [
    env,
    (request as {
      runtime?: {
        cloudflare?: {
          env?: unknown;
        };
      };
    }).runtime?.cloudflare?.env,
    (globalThis as {
      __env__?: unknown;
    }).__env__,
  ];

  for (const name of SERVER_ENV_BINDINGS) {
    if (process.env[name]) continue;

    for (const candidate of candidates) {
      if (!candidate || typeof candidate !== "object") {
        continue;
      }

      const value = Reflect.get(candidate, name);

      if (typeof value === "string" && value.length > 0) {
        process.env[name] = value;
        break;
      }
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

// h3 can convert in-handler errors into a normal 500 JSON response.
// Detect that response and display the custom error page.
async function normalizeCatastrophicSsrResponse(
  response: Response,
): Promise<Response> {
  if (response.status < 500) {
    return response;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return response;
  }

  const body = await response.clone().text();

  if (!isH3SwallowedErrorBody(body)) {
    return response;
  }

  console.error(
    consumeLastCapturedError() ??
      new Error(`h3 swallowed SSR error: ${body}`),
  );

  return new Response(renderErrorPage(), {
    status: 500,
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as {
      unhandled?: unknown;
      message?: unknown;
    };

    return (
      payload.unhandled === true &&
      payload.message === "HTTPError"
    );
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      exposeWorkerEnvironment(env);
bindWorkerEnvironment(request, env);

      const handler = await getServerEntry();

      const response = await handler.fetch(request, env, ctx);

      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);

      return new Response(renderErrorPage(), {
        status: 500,
        headers: {
          "content-type": "text/html; charset=utf-8",
        },
      });
    }
  },
};
