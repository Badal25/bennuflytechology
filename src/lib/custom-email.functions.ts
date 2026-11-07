import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

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

export const ALLOWED_SENDERS = [
  { email: "careers@bennufly.in", name: "Bennufly Careers" },
  { email: "info@bennufly.in", name: "Bennufly Technology" },
  { email: "support@bennufly.in", name: "Bennufly Support" },
  { email: "noreply@bennufly.in", name: "Bennufly Notifications" },
] as const;

const sendCustomEmailSchema = z.object({
  accessToken: z.string().min(1, "Access token required"),
  senderEmail: z.enum([
    "careers@bennufly.in",
    "info@bennufly.in",
    "support@bennufly.in",
    "noreply@bennufly.in",
  ]),
  toEmail: z.string().email("Valid recipient email required"),
  toName: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  messageHtml: z.string().min(1, "Message content is required"),
  applyBranding: z.boolean().default(true),
});

export const sendCustomEmailFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => sendCustomEmailSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const supabaseUrl =
        process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey =
        process.env.SUPABASE_PUBLISHABLE_KEY ||
        process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const brevoKey = process.env.BREVO_API_KEY;

      if (!supabaseUrl || !supabaseKey) {
        return { sent: false, reason: "Supabase configuration missing" };
      }
      if (!brevoKey) {
        return { sent: false, reason: "Brevo API key not configured" };
      }

      // Verify Admin Auth
      const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: `Bearer ${data.accessToken}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data: claimsData, error: claimsError } =
        await supabase.auth.getClaims(data.accessToken);
      const userId = claimsData?.claims?.sub;

      if (claimsError || !userId) {
        return { sent: false, reason: "Admin session expired. Please sign in again." };
      }

      const allowedRoles = ["super_admin", "hr", "sales", "developer"];
      let authorized = false;

      for (const role of allowedRoles) {
        const { data: hasRole, error: roleError } = await supabase.rpc("has_role", {
          _user_id: userId,
          _role: role,
        });
        if (!roleError && hasRole === true) {
          authorized = true;
          break;
        }
      }

      if (!authorized) {
        return { sent: false, reason: "You are not authorized to send official emails." };
      }

      const senderConfig = ALLOWED_SENDERS.find((s) => s.email === data.senderEmail) || {
        email: "info@bennufly.in",
        name: "Bennufly Technology",
      };

      // Wrap in branded responsive template if requested
      const formattedBody = data.messageHtml
        .split("\n")
        .map((para) => (para.trim() ? `<p style="margin: 0 0 16px 0; line-height: 1.6;">${esc(para)}</p>` : ""))
        .join("");

      const finalHtml = data.applyBranding
        ? `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 32px 16px; color: #1e293b;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
            <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 28px 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">Bennufly Technology</h1>
              <p style="color: #e0f2fe; margin: 6px 0 0 0; font-size: 13px;">Official Communication</p>
            </div>
            <div style="padding: 32px; font-size: 15px; color: #334155;">
              ${formattedBody}
            </div>
            <div style="background-color: #f1f5f9; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
              <p style="margin: 0 0 4px 0;">Sent via Bennufly Technology Mail Services</p>
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} Bennufly Technology. All rights reserved.</p>
            </div>
          </div>
        </div>
      `
        : `<div style="font-family: sans-serif; font-size: 15px; line-height: 1.6; color: #111;">${formattedBody}</div>`;

      const response = await fetch(BREVO_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": brevoKey,
          Accept: "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: senderConfig.name,
            email: senderConfig.email,
          },
          replyTo: {
            name: senderConfig.name,
            email: senderConfig.email,
          },
          to: [
            {
              email: data.toEmail,
              name: data.toName || data.toEmail,
            },
          ],
          subject: data.subject,
          htmlContent: finalHtml,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Brevo custom email failed [${response.status}]:`, errorText);
        return { sent: false, reason: `Brevo error (${response.status})` };
      }

      return { sent: true, reason: null };
    } catch (err: any) {
      console.error("Custom email error:", err);
      return { sent: false, reason: err?.message || "Internal server error" };
    }
  });
