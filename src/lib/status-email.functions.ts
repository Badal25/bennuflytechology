import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/brevo";
const SITE_URL = "https://bennufly.in";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const MESSAGES: Record<string, string> = {
  "Under Review": "Our team is currently reviewing your application.",
  Shortlisted: "Congratulations! You have been shortlisted. Our team will contact you soon with next steps.",
  "Interview Scheduled": "Your interview has been scheduled. Please watch your inbox and phone for details.",
  Selected: "Congratulations! You have been selected. Our team will reach out with onboarding details.",
  Active: "Your internship is now active. Welcome to Bennufly Technology!",
  Completed: "You have successfully completed your internship. Thank you for your hard work!",
  Rejected:
    "Thank you for your interest. After careful review, we will not be moving forward at this time. We encourage you to apply again in the future.",
};

/**
 * Emails the applicant their new status + a /verify tracking link.
 * Authorization: the row is read through RLS as the signed-in user, so only
 * staff who can see the application can trigger the email.
 */
export const sendApplicationStatusEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ kind: z.enum(["internship", "job"]), id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const lovableKey = process.env["LOVABLE_API_KEY"];
    const brevoKey = process.env["BREVO_API_KEY"];
    if (!lovableKey || !brevoKey) return { sent: false, reason: "Email service not configured" };

    const table = data.kind === "internship" ? "internship_applications" : "job_applications";
    const { data: row, error } = await (context.supabase.from(table) as any)
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error || !row) return { sent: false, reason: "Application not found" };

    const status: string = row.status;
    const ref: string = row.application_number ?? "";
    const what = data.kind === "internship" ? row.program_name || "Internship" : row.position || "Job application";
    const trackUrl = `${SITE_URL}/verify`;
    const msg = MESSAGES[status] ?? "Your application status has been updated.";
    const sender = data.kind === "internship" ? "careers@bennufly.in" : "careers@bennufly.in";

    const html = `<div style="font-family:Arial,sans-serif;background:#ffffff;padding:24px;color:#111">
<div style="max-width:560px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;padding:28px">
<h2 style="margin:0 0 4px">Bennufly Technology</h2>
<p style="color:#6b7280;margin:0 0 20px;font-size:13px">Application status update</p>
<p>Hi ${esc(row.full_name || "there")},</p>
<p>The status of your application for <b>${esc(what)}</b> has been updated to:</p>
<p style="font-size:20px;font-weight:bold;background:#f3f4f6;border-radius:8px;padding:12px 16px;display:inline-block">${esc(status)}</p>
<p>${esc(msg)}</p>
${ref ? `<p>Your application ID: <b>${esc(ref)}</b></p>` : ""}
<p><a href="${trackUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px">Track your application</a></p>
<p style="font-size:13px;color:#6b7280">On the tracking page, enter your application ID and this email address.</p>
<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
<p style="font-size:12px;color:#6b7280">Bennufly Technology Pvt. Ltd., Nagpur, India · Questions? Reply to this email or write to careers@bennufly.in</p>
</div></div>`;

    const res = await fetch(`${GATEWAY_URL}/smtp/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": brevoKey,
      },
      body: JSON.stringify({
        sender: { name: "Bennufly Technology", email: sender },
        replyTo: { email: "careers@bennufly.in" },
        to: [{ email: row.email, name: row.full_name }],
        subject: `Application update: ${status}${ref ? ` (${ref})` : ""}`,
        htmlContent: html,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`Brevo send failed [${res.status}]: ${body}`);
      return { sent: false, reason: `Email failed (${res.status})` };
    }
    return { sent: true, reason: null };
  });
