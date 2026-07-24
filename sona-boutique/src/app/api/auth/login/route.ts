import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validators/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 requests per 15 minutes per IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimitResult = checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
    if (!rateLimitResult.success) {
      return Response.json(
        { error: "Zu viele Anmeldeversuche. Bitte versuchen Sie es später erneut." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ error: "Ungültige Anmeldedaten." }, { status: 401 });
    }

    const { email, password } = parsed.data;

    // Find customer by email
    const customer = await db.customer.findUnique({ where: { email } });
    if (!customer) {
      return Response.json({ error: "Ungültige Anmeldedaten." }, { status: 401 });
    }

    // Verify password
    const isValid = await verifyPassword(password, customer.passwordHash);
    if (!isValid) {
      return Response.json({ error: "Ungültige Anmeldedaten." }, { status: 401 });
    }

    // Create session and set cookie
    const { token, expiresAt } = await createSession(
      customer.id,
      ip,
      request.headers.get("user-agent") || undefined,
    );
    await setSessionCookie(token, expiresAt);

    // Update lastLoginAt
    await db.customer.update({
      where: { id: customer.id },
      data: { lastLoginAt: new Date() },
    });

    return Response.json({
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        role: customer.role,
      },
    });
  } catch (error) {
    console.error("[LOGIN_ERROR]", error);
    return Response.json({ error: "Ein interner Fehler ist aufgetreten." }, { status: 500 });
  }
}
