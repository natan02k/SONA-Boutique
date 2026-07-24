import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { clearSessionCookie } from "@/lib/auth";

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME || "sona_session";

export async function POST() {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;

    if (token) {
      // Delete session from database
      await db.session.deleteMany({ where: { token } });
    }

    // Clear the cookie
    await clearSessionCookie();

    return Response.json({ ok: true });
  } catch (error) {
    console.error("[LOGOUT_ERROR]", error);
    return Response.json({ error: "Ein interner Fehler ist aufgetreten." }, { status: 500 });
  }
}
