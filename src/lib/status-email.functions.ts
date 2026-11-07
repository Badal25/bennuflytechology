
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";
const SITE_URL = "https://bennufly.in";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[c]!,
  );

const MESSAGES: Record<string, string> = {
  NEW: "We have received your application and it is now under review.",
  "Under Review": "Our team is currently reviewing your application.",

  SHORTLISTED:
    "Congratulations! You have been shortlisted. Our team will contact you soon with next steps.",
  Shortlisted:
    "Congratulations! You have been shortlisted. Our team will contact you soon with next steps.",

  INTERVIEW:
    "Your application has moved to the interview stage. Our team will contact you with the interview details.",
  "Interview Scheduled":
    "Your interview has been scheduled. Please watch your inbox and phone for details.",

  SELECTED:
    "Congratulations! You have been selected. Our team will reach out with onboarding details.",
  Selected:
    "Congratulations! You have been selected. Our team will reach out with onboarding details.",

  ACTIVE: "Your internship is now active. Welcome to Bennufly Technology!",
  Active: "Your internship is now active. Welcome to Bennufly Technology!",

  COMPLETED:
    "You have successfully completed your internship. Thank you for your hard work.",
  Completed:
    "You have successfully completed your internship. Thank you for your hard work.",

  REJECTED:
    "Thank you for your interest. After careful review, we will not be moving forward at this time. We encourage you to apply again in the future.",
  Rejected:
    "Thank you for your interest. After careful review, we will not be moving forward at this time. We encourage you to apply again in the future.",
};

export const sendApplicationStatusEmail = createServerFn({
  method: "POST",
})
  .inputValidator((input: unknown) =>
    z
      .object({
        kind: z.enum(["internship", "job"]),
        id: z.string().uuid(),
        accessToken: z.string().min(1),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const workerEnv = (
  globalThis as typeof globalThis & {
    __env__?: Record<string, unknown>;
  }
).__env__;

const getEnv = (name: string): string | undefined => {
  const workerValue = workerEnv?.[name];

  if (typeof workerValue === "string" && workerValue.length > 0) {
    return workerValue;
  }

  const processValue = process.env[name];

  return typeof processValue === "string" && processValue.length > 0
    ? processValue
    : undefined;
};

const supabaseUrl = getEnv("SUPABASE_URL");
const supabaseKey = getEnv("SUPABASE_PUBLISHABLE_KEY");
const brevoKey =
  getEnv("BREVO_API_KEY") ?? getEnv("BREVO_DIRECT_API_KEY");

console.log("[STATUS EMAIL ENV CHECK]", {
  supabaseUrlPresent: Boolean(supabaseUrl),
  supabaseKeyPresent: Boolean(supabaseKey),
  brevoKeyPresent: Boolean(brevoKey),
});

      if (!supabaseUrl || !supabaseKey) {
        console.error("Status email: Supabase configuration missing.");
        return { sent: false, reason: "Supabase configuration missing" };
      }

      if (!brevoKey) {
        console.error("Status email: BREVO_API_KEY missing.");
        return { sent: false, reason: "Brevo API key not configured" };
      }

      const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
        global: {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });

      // Validate the current admin's Supabase session.
      const { data: claimsData, error: claimsError } =
        await supabase.auth.getClaims(data.accessToken);

      const userId = claimsData?.claims?.sub;

      if (claimsError || !userId) {
        console.error("Status email authentication failed:", claimsError);
        return {
          sent: false,
          reason: "Admin session expired. Please sign in again.",
        };
      }

      // Only authorized staff can trigger application status emails.
      const roles = ["super_admin", "hr", "developer"];
      let authorized = false;

      for (const role of roles) {
        const { data: hasRole, error: roleError } = await supabase.rpc(
          "has_role",
          {
            _user_id: userId,
            _role: role,
          },
        );

        if (!roleError && hasRole === true) {
          authorized = true;
          break;
        }
      }

      if (!authorized) {
        return {
          sent: false,
          reason: "You are not authorized to send application emails.",
        };
      }

      const table =
        data.kind === "internship"
          ? "internship_applications"
          : "job_applications";

      const { data: row, error } = await (supabase.from(table) as any)
        .select("*")
        .eq("id", data.id)
        .maybeSingle();

      if (error || !row) {
        console.error("Application lookup failed:", error);
        return {
          sent: false,
          reason: "Application not found or access denied.",
        };
      }

      if (!row.email || typeof row.email !== "string") {
        return {
          sent: false,
          reason: "Applicant email address is missing.",
        };
      }

      const status: string = row.status || "Updated";
      const ref: string = row.application_number ?? "";

      const what =
        data.kind === "internship"
          ? row.program_name || "Internship"
          : row.position || "Job application";

      const message =
        MESSAGES[status] ??
        "Your application status has been updated by our team.";

      const sender = "careers@bennufly.in";

      const html = `
        <div style="font-family:Arial,sans-serif;background:#ffffff;padding:24px;color:#111">
          <div style="max-width:560px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;padding:28px">
            <h2 style="margin:0 0 4px">Bennufly Technology</h2>

            <p style="color:#6b7280;margin:0 0 20px;font-size:13px">
              Application status update
            </p>

            <p>Hi ${esc(row.full_name || "there")},</p>

            <p>
              The status of your application for
              <b>${esc(what)}</b> has been updated to:
            </p>

            <p style="font-size:20px;font-weight:bold;background:#f3f4f6;border-radius:8px;padding:12px 16px;display:inline-block">
              ${esc(status)}
            </p>

            <p>${esc(message)}</p>

            ${
              ref
                ? `<p>Your application ID: <b>${esc(ref)}</b></p>`
                : ""
            }

            <p>
              <a href="${SITE_URL}/verify"
                style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px">
                Track your application
              </a>
            </p>

            <p style="font-size:13px;color:#6b7280">
              On the tracking page, enter your application ID and this email address.
            </p>

            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>

            <p style="font-size:12px;color:#6b7280">
              Bennufly Technology, India.<br/>
              Questions? Contact careers@bennufly.in
            </p>
          </div>
        </div>
      `;

      const response = await fetch(BREVO_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": brevoKey,
          Accept: "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: "Bennufly Technology",
            email: sender,
          },
          replyTo: {
            name: "Bennufly Careers",
            email: sender,
          },
          to: [
            {
              email: row.email,
              name: row.full_name || "Applicant",
            },
          ],
          subject: `Application update: ${status}${ref ? ` (${ref})` : ""}`,
          htmlContent: html,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();

        console.error(
          `Brevo email failed [${response.status}]: ${errorBody}`,
        );

        return {
          sent: false,
          reason: `Brevo email failed (${response.status}). Check Brevo logs.`,
        };
      }

      const result = await response.json();
      console.log("Application status email accepted by Brevo:", result);

      return { sent: true, reason: null };
    } catch (error) {
      console.error("Application status email error:", error);

      return {
        sent: false,
        reason: "Email service encountered an unexpected error.",
      };
    }
  });
