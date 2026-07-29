import nodemailer from "nodemailer";

type SmtpOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

/**
 * Secondary SMTP Fallback Transporter for production resiliency.
 */
export async function sendSmtpEmail({ to, subject, html, text }: SmtpOptions) {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("[SMTP_FALLBACK_SKIP] SMTP credentials not fully configured in environment.");
    return null;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const from = process.env.EMAIL_FROM || "SONA Boutique <noreply@sona-boutique.de>";

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });

  console.log(`[SMTP_FALLBACK_SUCCESS] Message ID: ${info.messageId} to ${to}`);
  return { id: info.messageId };
}
