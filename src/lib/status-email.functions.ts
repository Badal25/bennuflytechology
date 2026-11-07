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

type StatusEmailConfig = {
  badgeBg: string;
  badgeText: string;
  borderAccent: string;
  headline: string;
  body: string;
  note?: string;
};

const STATUS_CONFIG: Record<string, StatusEmailConfig> = {
  REJECTED: {
    badgeBg: "#f1f5f9",
    badgeText: "#475569",
    borderAccent: "#94a3b8",
    headline: "Update regarding your application",
    body: "Thank you for taking the time to apply and share your journey with Bennufly Technology. After careful evaluation of all submissions, we have decided not to move forward with your application for this specific opening at this time.<br/><br/>Our hiring decisions are often tough due to high applicant volumes, and this is by no means a reflection of your potential. We have retained your resume in our talent network and will gladly reach out if a future opportunity aligns with your expertise.",
    note: "We sincerely appreciate your effort and wish you immense success in your professional journey.",
  },
  Rejected: {
    badgeBg: "#f1f5f9",
    badgeText: "#475569",
    borderAccent: "#94a3b8",
    headline: "Update regarding your application",
    body: "Thank you for taking the time to apply and share your journey with Bennufly Technology. After careful evaluation of all submissions, we have decided not to move forward with your application for this specific opening at this time.<br/><br/>Our hiring decisions are often tough due to high applicant volumes, and this is by no means a reflection of your potential. We have retained your resume in our talent network and will gladly reach out if a future opportunity aligns with your expertise.",
    note: "We sincerely appreciate your effort and wish you immense success in your professional journey.",
  },
  SHORTLISTED: {
    badgeBg: "#eef2ff",
    badgeText: "#4338ca",
    borderAccent: "#6366f1",
    headline: "Great news! Your profile is shortlisted",
    body: "Congratulations! We were thoroughly impressed with your profile and qualifications, and have shortlisted your application. Our talent acquisition team is preparing the next round and will get in touch with you shortly.",
    note: "Please keep an eye on your inbox and phone for upcoming scheduling details.",
  },
  Shortlisted: {
    badgeBg: "#eef2ff",
    badgeText: "#4338ca",
    borderAccent: "#6366f1",
    headline: "Great news! Your profile is shortlisted",
    body: "Congratulations! We were thoroughly impressed with your profile and qualifications, and have shortlisted your application. Our talent acquisition team is preparing the next round and will get in touch with you shortly.",
    note: "Please keep an eye on your inbox and phone for upcoming scheduling details.",
  },
  INTERVIEW: {
    badgeBg: "#fef3c7",
    badgeText: "#92400e",
    borderAccent: "#f59e0b",
    headline: "Interview stage has commenced",
    body: "Your application has successfully advanced to the interview stage. Our recruitment team will share your calendar invite, meeting details, and interview format with you very soon.",
    note: "Please ensure a quiet environment and stable internet connectivity for your session.",
  },
  "Interview Scheduled": {
    badgeBg: "#fef3c7",
    badgeText: "#92400e",
    borderAccent: "#f59e0b",
    headline: "Interview stage has commenced",
    body: "Your application has successfully advanced to the interview stage. Our recruitment team will share your calendar invite, meeting details, and interview format with you very soon.",
    note: "Please ensure a quiet environment and stable internet connectivity for your session.",
  },
  SELECTED: {
    badgeBg: "#ecfdf5",
    badgeText: "#065f46",
    borderAccent: "#10b981",
    headline: "Congratulations! You have been selected",
    body: "We are thrilled to offer you a position at Bennufly Technology! Your skills, passion, and vision truly stood out during our selection process. Welcome to our team!",
    note: "Our HR department will contact you shortly with your formal offer letter and onboarding schedule.",
  },
  Selected: {
    badgeBg: "#ecfdf5",
    badgeText: "#065f46",
    borderAccent: "#10b981",
    headline: "Congratulations! You have been selected",
    body: "We are thrilled to offer you a position at Bennufly Technology! Your skills, passion, and vision truly stood out during our selection process. Welcome to our team!",
    note: "Our HR department will contact you shortly with your formal offer letter and onboarding schedule.",
  },
  ACTIVE: {
    badgeBg: "#ecfdf5",
    badgeText: "#065f46",
    borderAccent: "#10b981",
    headline: "Your position is now active",
    body: "Welcome aboard! Your tenure with Bennufly Technology is now officially active. We are excited to collaborate and build impactful solutions together.",
  },
  Active: {
    badgeBg: "#ecfdf5",
    badgeText: "#065f46",
    borderAccent: "#10b981",
    headline: "Your position is now active",
    body: "Welcome aboard! Your tenure with Bennufly Technology is now officially active. We are excited to collaborate and build impactful solutions together.",
  },
  COMPLETED: {
    badgeBg: "#f0fdf4",
    badgeText: "#15803d",
    borderAccent: "#22c55e",
    headline: "Internship successfully completed",
    body: "Congratulations on successfully completing your internship at Bennufly Technology! We deeply appreciate your hard work, curiosity, and contributions during your tenure with us.",
  },
  Completed: {
    badgeBg: "#f0fdf4",
    badgeText: "#15803d",
    borderAccent: "#22c55e",
    headline: "Internship successfully completed",
    body: "Congratulations on successfully completing your internship at Bennufly Technology! We deeply appreciate your hard work, curiosity, and contributions during your tenure with us.",
  },
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
          ? row.program_name || "Internship Program"
          : row.position || "Job Application";

      const config = STATUS_CONFIG[status] ?? {
        badgeBg: "#f8fafc",
        badgeText: "#1e293b",
        borderAccent: "#64748b",
        headline: "Application status updated",
        body: "Your application status has been updated by our recruitment team.",
      };

      const sender = "careers@bennufly.in";

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Bennufly Technology Application Update</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">
          
          <!-- Brand Header -->
          <tr>
            <td style="padding:28px 36px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);">
              <h1 style="margin:0;font-size:22px;font-weight:700;letter-spacing:-0.4px;color:#ffffff;">
                Bennufly Technology
              </h1>
              <p style="margin:4px 0 0;font-size:13px;color:#94a3b8;letter-spacing:0.2px;">
                Talent & Recruitment Department
              </p>
            </td>
          </tr>

          <!-- Email Content -->
          <tr>
            <td style="padding:36px;">
              <p style="margin:0 0 16px;font-size:16px;color:#334155;">
                Dear <strong>${esc(row.full_name || "Applicant")}</strong>,
              </p>

              <h2 style="margin:0 0 10px;font-size:18px;font-weight:600;color:#0f172a;">
                ${config.headline}
              </h2>

              <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6;">
                Regarding your application for <strong>${esc(what)}</strong>
                ${ref ? ` <span style="color:#94a3b8;">(ID: ${esc(ref)})</span>` : ""}.
              </p>

              <!-- Dynamic Status Pill -->
              <div style="background:${config.badgeBg};border-left:4px solid ${config.borderAccent};border-radius:8px;padding:16px 20px;margin:0 0 24px;">
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:${config.badgeText};margin-bottom:4px;">
                  Current Status
                </div>
                <div style="font-size:20px;font-weight:700;color:${config.badgeText};">
                  ${esc(status)}
                </div>
              </div>

              <!-- Message Body -->
              <div style="font-size:15px;line-height:1.7;color:#334155;margin:0 0 24px;">
                ${config.body}
              </div>

              ${
                config.note
                  ? `
              <div style="background:#f8fafc;border-radius:8px;padding:14px 18px;margin:0 0 28px;border:1px dashed #cbd5e1;font-size:13px;color:#475569;line-height:1.5;">
                💡 <strong>Note:</strong> ${config.note}
              </div>
              `
                  : ""
              }

              <!-- Portal Track Button -->
              <div style="text-align:center;margin:32px 0 20px;">
                <a href="${SITE_URL}/verify" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:14px;letter-spacing:0.2px;">
                  Track Application on Portal →
                </a>
              </div>

              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
                You can track updates anytime using Application ID <strong>${esc(ref || "N/A")}</strong> and your registered email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:22px 36px;background-color:#f8fafc;border-top:1px solid #f1f5f9;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#475569;">
                Bennufly Technology Pvt. Ltd.
              </p>
              <p style="margin:0 0 10px;font-size:12px;color:#94a3b8;">
                Empowering Digital Innovation · India
              </p>
              <p style="margin:0;font-size:11px;color:#94a3b8;">
                Need help? Contact <a href="mailto:careers@bennufly.in" style="color:#2563eb;text-decoration:none;">careers@bennufly.in</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
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
          subject: `Application Update: ${status}${ref ? ` (${ref})` : ""} | Bennufly Technology`,
          htmlContent: html,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Brevo email failed [${response.status}]: ${errorBody}`);

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
