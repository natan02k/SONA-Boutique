import { Resend } from "resend";
import { ReactElement } from "react";
import { sendSmtpEmail } from "./email-smtp";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

type SendEmailOptions = {
  to: string;
  subject: string;
  react?: ReactElement;
  text?: string;
};

/**
 * High-resiliency transactional email sender (Resend Primary + SMTP Fallback + Dev Logger).
 */
export async function sendEmail({ to, subject, react, text }: SendEmailOptions) {
  const from = process.env.EMAIL_FROM || "SONA Boutique <noreply@sona-boutique.de>";

  // Development Console Logger
  if (!resend || process.env.NODE_ENV === "development") {
    console.log("=================================================");
    console.log(`[EMAIL LOG - DEV MODE]`);
    console.log(`To: ${to}`);
    console.log(`From: ${from}`);
    console.log(`Subject: ${subject}`);
    if (text) console.log(`Text: ${text}`);
    console.log("=================================================");
    return { id: `dev_mock_${Date.now()}` };
  }

  // Primary: Resend API
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      react,
      text,
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (resendError: any) {
    console.error("[RESEND_FAILED_ATTEMPTING_SMTP_FALLBACK]", resendError?.message || resendError);

    // Fallback: Secondary SMTP Transporter with dynamic server markup
    try {
      const { renderToStaticMarkup } = await import("react-dom/server");
      const htmlContent = react ? renderToStaticMarkup(react) : text || "";

      const smtpResult = await sendSmtpEmail({
        to,
        subject,
        html: htmlContent,
        text,
      });

      if (smtpResult) {
        return smtpResult;
      }
    } catch (smtpErr) {
      console.error("[SMTP_FALLBACK_CRITICAL_FAIL]", smtpErr);
    }

    throw new Error(
      `E-Mail Versand fehlgeschlagen: ${resendError?.message || "Unbekannter Fehler"}`,
    );
  }
}
