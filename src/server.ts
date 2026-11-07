
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

type WorkerEnvironment = Record<string, unknown>;

let serverEntryPromise: Promise<ServerEntry> | undefined;

const SERVER_ENV_BINDINGS = [
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "GOOGLE_API_KEY",
  "OPENAI_MODEL",
  "ANTHROPIC_MODEL",
  "GOOGLE_MODEL",
  "BREVO_API_KEY",
  "BREVO_DIRECT_API_KEY",
] as const;

function isObject(value: unknown): value is WorkerEnvironment {
  return typeof value === "object" && value !== null;
}

function getString(
  source: unknown,
  name: string,
): string | undefined {
  if (!isObject(source)) return undefined;

  const value = source[name];

  return typeof value === "string" && value.length > 0
    ? value
    : undefined;
}

function getRequestRuntimeEnvironment(
  request: Request,
): unknown {
  return (
    request as Request & {
      runtime?: {
        cloudflare?: {
          env?: unknown;
        };
      };
    }
  ).runtime?.cloudflare?.env;
}

/**
 * Makes Worker bindings available to server-side code.
 * Supports both standard and VITE-prefixed Supabase names.
 */
function bindWorkerEnvironment(
  request: Request,
  env: unknown,
): void {
  const candidates = [
    env,
    getRequestRuntimeEnvironment(request),
    (globalThis as typeof globalThis & {
      __env__?: unknown;
    }).__env__,
  ];

  const aliases: Record<string, string[]> = {
    SUPABASE_URL: [
      "SUPABASE_URL",
      "VITE_SUPABASE_URL",
    ],
    SUPABASE_PUBLISHABLE_KEY: [
      "SUPABASE_PUBLISHABLE_KEY",
      "VITE_SUPABASE_PUBLISHABLE_KEY",
    ],
    BREVO_API_KEY: [
      "BREVO_API_KEY",
      "BREVO_DIRECT_API_KEY",
    ],
  };

  for (const name of SERVER_ENV_BINDINGS) {
    if (process.env[name]) continue;

    const possibleNames = aliases[name] ?? [name];

    let value: string | undefined;

    for (const candidate of candidates) {
      for (const possibleName of possibleNames) {
        value = getString(candidate, possibleName);

        if (value) break;
      }

      if (value) break;
    }

    if (value) {
      process.env[name] = value;
    }
  }
}

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (module) => (module.default ?? module) as ServerEntry,
    );
  }

  return serverEntryPromise;
}

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
  async fetch(
    request: Request,
    env: unknown,
    ctx: unknown,
  ): Promise<Response> {
    try {
      // Expose the current request's Worker environment.
      (
        globalThis as typeof globalThis & {
          __env__?: unknown;
        }
      ).__env__ = env;

      // Bind runtime variables before loading the application.
      bindWorkerEnvironment(request, env);

      // Safe diagnostics: values themselves are never logged.
      const runtimeEnv = [
        env,
        getRequestRuntimeEnvironment(request),
      ];

      const hasSupabaseUrl = runtimeEnv.some(
        (source) =>
          Boolean(
            getString(source, "SUPABASE_URL") ??
              getString(source, "VITE_SUPABASE_URL"),
          ),
      );

      const hasSupabaseKey = runtimeEnv.some(
        (source) =>
          Boolean(
            getString(source, "SUPABASE_PUBLISHABLE_KEY") ??
              getString(source, "VITE_SUPABASE_PUBLISHABLE_KEY"),
          ),
      );

      const hasBrevoKey = runtimeEnv.some(
        (source) =>
          Boolean(
            getString(source, "BREVO_API_KEY") ??
              getString(source, "BREVO_DIRECT_API_KEY"),
          ),
      );

      console.log("[WORKER ENV CHECK]", {
        supabaseUrlPresent:
          hasSupabaseUrl || Boolean(process.env.SUPABASE_URL),
        supabaseKeyPresent:
          hasSupabaseKey ||
          Boolean(process.env.SUPABASE_PUBLISHABLE_KEY),
        brevoKeyPresent:
          hasBrevoKey ||
          Boolean(
            process.env.BREVO_API_KEY ??
              process.env.BREVO_DIRECT_API_KEY,
          ),
      });

      const handler = await getServerEntry();

      const response = await handler.fetch(request, env, ctx);

      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error("Worker request failed:", error);

      return new Response(renderErrorPage(), {
        status: 500,
        headers: {
          "content-type": "text/html; charset=utf-8",
        },
      });
    }
  },
};
