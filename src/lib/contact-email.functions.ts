
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

const SENDER = {
  name: "Bennufly Technology",
  email: "support@bennufly.in",
};

const contactEmailSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional().default(""),
  company: z.string().trim().max(120).optional().default(""),
  service: z.string().trim().max(120).optional().default(""),
  budget: z.string().trim().max(80).optional().default(""),
  timeline: z.string().trim().max(80).optional().default(""),
  message: z.string().trim().min(10).max(2000),
});

const esc = (value: string) =>
  value.replace(/[&<>"']/g, (character) =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]!,
  );

async function sendBrevoEmail(
  apiKey: string,
  payload: Record<string, unknown>,
): Promise<boolean> {
  try {
    const response = await fetch(BREVO_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `Brevo email failed [${response.status}]: ${errorBody}`,
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Brevo request failed:", error);
    return false;
  }
}

/**
 * Sends a fixed internal notification and customer acknowledgement.
 */
export const sendContactEmails = createServerFn({
  method: "POST",
})
  .inputValidator((input) => contactEmailSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["BREVO_API_KEY"];

    if (!apiKey) {
      console.error("BREVO_API_KEY is not configured.");
      return {
        notificationSent: false,
        confirmationSent: false,
      };
    }

    const name = esc(data.name);
    const email = esc(data.email.toLowerCase());
    const phone = esc(data.phone || "Not provided");
    const company = esc(data.company || "Not provided");
    const service = esc(data.service || "Not specified");
    const budget = esc(data.budget || "Not specified");
    const timeline = esc(data.timeline || "Not specified");
    const message = esc(data.message).replace(/\n/g, "<br/>");

    // Internal notification to Bennufly Support
    const notificationSent = await sendBrevoEmail(apiKey, {
      sender: SENDER,
      replyTo: {
        name: data.name,
        email: data.email.toLowerCase(),
      },
      to: [
        {
          email: "support@bennufly.in",
          name: "Bennufly Support",
        },
      ],
      subject: `New website inquiry from ${data.name}`,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;color:#111;max-width:640px;margin:auto;padding:24px">
          <h2>New Contact Inquiry</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Phone:</b> ${phone}</p>
          <p><b>Company:</b> ${company}</p>
          <p><b>Service:</b> ${service}</p>
          <p><b>Budget:</b> ${budget}</p>
          <p><b>Timeline:</b> ${timeline}</p>
          <p><b>Message:</b><br/>${message}</p>
          <hr/>
          <p style="font-size:12px;color:#666">
            Submitted through the Bennufly Technology contact form.
          </p>
        </div>
      `,
    });

    // Confirmation to the person who submitted the form
    const confirmationSent = await sendBrevoEmail(apiKey, {
      sender: SENDER,
      to: [
        {
          email: data.email.toLowerCase(),
          name: data.name,
        },
      ],
      subject: "We received your message | Bennufly Technology",
      htmlContent: `
        <div style="font-family:Arial,sans-serif;color:#111;max-width:600px;margin:auto;padding:24px">
          <h2>Bennufly Technology</h2>
          <p>Hi ${name},</p>
          <p>
            Thank you for contacting Bennufly Technology.
            We have received your inquiry successfully.
          </p>
          <p>
            Our team will review your message and get back to you
            as soon as possible.
          </p>
          <p style="margin-top:28px">
            Regards,<br/>
            <b>Bennufly Technology Support Team</b><br/>
            <a href="mailto:support@bennufly.in">
              support@bennufly.in
            </a>
          </p>
        </div>
      `,
    });

    return {
      notificationSent,
      confirmationSent,
    };
  });
