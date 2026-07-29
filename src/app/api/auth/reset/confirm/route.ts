import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { passwordResetConfirmSchema } from "@/lib/validators/auth";
import { hash, verify } from "@node-rs/argon2";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 requests per 60 minutes per IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimitResult = checkRateLimit(`reset-confirm:${ip}`, 3, 60 * 60 * 1000);
    if (!rateLimitResult.success) {
      return Response.json(
        { error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = passwordResetConfirmSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ error: "Ungültiges Token oder Passwort." }, { status: 422 });
    }

    const { token, password } = parsed.data;

    // Find all valid (unused, not expired) reset tokens
    const resetTokens = await db.passwordResetToken.findMany({
      where: {
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { customer: true },
    });

    // Verify the token against stored hashes
    let matchedToken = null;
    for (const rt of resetTokens) {
      const isValid = await verify(rt.tokenHash, token);
      if (isValid) {
        matchedToken = rt;
        break;
      }
    }

    if (!matchedToken) {
      return Response.json({ error: "Ungültiger oder abgelaufener Reset-Token." }, { status: 400 });
    }

    // Hash new password and update customer
    const newPasswordHash = await hashPassword(password);
    await db.customer.update({
      where: { id: matchedToken.customerId },
      data: { passwordHash: newPasswordHash },
    });

    // Mark token as used
    await db.passwordResetToken.update({
      where: { id: matchedToken.id },
      data: { usedAt: new Date() },
    });

    // Delete all existing sessions for this customer (force re-login)
    await db.session.deleteMany({
      where: { customerId: matchedToken.customerId },
    });

    return Response.json({ message: "Passwort erfolgreich zurückgesetzt." });
  } catch (error) {
    console.error("[RESET_CONFIRM_ERROR]", error);
    return Response.json({ error: "Ein interner Fehler ist aufgetreten." }, { status: 500 });
  }
}
