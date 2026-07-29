import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { generateToken } from "@/lib/auth";
import { passwordResetRequestSchema } from "@/lib/validators/auth";
import { hash } from "@node-rs/argon2";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import PasswordResetEmail from "@/emails/password-reset";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 requests per 60 minutes per IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimitResult = checkRateLimit(`reset-request:${ip}`, 3, 60 * 60 * 1000);
    if (!rateLimitResult.success) {
      return Response.json(
        { error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = passwordResetRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ error: "Ungültige E-Mail-Adresse." }, { status: 422 });
    }

    const { email } = parsed.data;

    // Always return success to prevent email enumeration
    const customer = await db.customer.findUnique({ where: { email } });
    if (!customer) {
      return Response.json({
        message: "Wenn diese E-Mail-Adresse registriert ist, wurde ein Reset-Link gesendet.",
      });
    }

    // Generate reset token
    const token = generateToken(32);
    const tokenHash = await hash(token, {
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
      algorithm: 2, // Argon2id
    });

    // Save token hash (24h expiry)
    await db.passwordResetToken.create({
      data: {
        customerId: customer.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;

    // Trigger PasswordResetEmail asynchronously
    try {
      await sendEmail({
        to: email,
        subject: "Passwort zurücksetzen — SONA Boutique",
        react: PasswordResetEmail({
          customerName: `${customer.firstName} ${customer.lastName}`,
          resetUrl,
        }),
      });
    } catch (emailErr) {
      console.error("[PASSWORD_RESET_EMAIL_FAIL]", emailErr);
    }

    return Response.json({
      message: "Wenn diese E-Mail-Adresse registriert ist, wurde ein Reset-Link gesendet.",
      ...(process.env.NODE_ENV === "development" && { devToken: token }),
    });
  } catch (error) {
    console.error("[RESET_REQUEST_ERROR]", error);
    return Response.json({ error: "Ein interner Fehler ist aufgetreten." }, { status: 500 });
  }
}
