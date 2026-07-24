import { Resend } from "resend";
import { ReactElement } from "react";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

type SendEmailOptions = {
  to: string;
  subject: string;
  react?: ReactElement;
  text?: string;
};

/**
 * Sends an email using Resend with development console fallback.
 */
export async function sendEmail({ to, subject, react, text }: SendEmailOptions) {
  const from = process.env.EMAIL_FROM || "SONA Boutique <noreply@sona-boutique.de>";

  if (!resend || process.env.NODE_ENV === "development") {
    console.log("==========================================");
    console.log(`[EMAIL DEV LOG] To: ${to}`);
    console.log(`[EMAIL DEV LOG] From: ${from}`);
    console.log(`[EMAIL DEV LOG] Subject: ${subject}`);
    console.log(`[EMAIL DEV LOG] Text: ${text || "(React Template Rendered)"}`);
    console.log("==========================================");
    return { id: `dev_mock_${Date.now()}` };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      react,
      text,
    });

    if (error) {
      console.error("[EMAIL_SEND_ERROR]", error);
      throw new Error(`Fehler beim E-Mail-Versand: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error("[EMAIL_CLIENT_EXCEPTION]", err);
    throw err;
  }
}
