import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validators/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import WelcomeEmail from "@/emails/welcome";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 requests per 60 minutes per IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimitResult = checkRateLimit(`register:${ip}`, 3, 60 * 60 * 1000);
    if (!rateLimitResult.success) {
      return Response.json(
        { error: "Zu viele Registrierungsversuche. Bitte versuchen Sie es später erneut." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          error: "Validierungsfehler",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 422 },
      );
    }

    const { email, password, firstName, lastName, phone } = parsed.data;

    // Check if email already exists
    const existing = await db.customer.findUnique({ where: { email } });
    if (existing) {
      return Response.json(
        { error: "Diese E-Mail-Adresse ist bereits registriert." },
        { status: 409 },
      );
    }

    // Hash password and create customer
    const passwordHash = await hashPassword(password);
    const customer = await db.customer.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        role: "CUSTOMER",
        isVerified: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    // Send Welcome Email asynchronously
    try {
      await sendEmail({
        to: email,
        subject: "Willkommen bei SONA Boutique — Ihr exklusiver Zugang",
        react: WelcomeEmail({
          customerName: `${firstName} ${lastName}`,
        }),
      });
    } catch (emailErr) {
      console.error("[WELCOME_EMAIL_FAIL]", emailErr);
    }

    // Create session and set cookie
    const { token, expiresAt } = await createSession(
      customer.id,
      ip,
      request.headers.get("user-agent") || undefined,
    );
    await setSessionCookie(token, expiresAt);

    return Response.json({ customer }, { status: 201 });
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return Response.json({ error: "Ein interner Fehler ist aufgetreten." }, { status: 500 });
  }
}
