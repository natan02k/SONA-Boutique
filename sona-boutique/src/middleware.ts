import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME || "sona_session";

// Security headers (also set in next.config.ts for production)
const securityHeaders = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

/**
 * Middleware runs on every request.
 * Handles:
 * - Admin route protection (redirects to login if no session cookie)
 * - Security headers
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Security headers
  const response = NextResponse.next();

  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  // 2. Admin route protection
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;

    if (!sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. CSRF check for API routes (except webhooks)
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/webhooks/")) {
    if (
      request.method === "POST" ||
      request.method === "PATCH" ||
      request.method === "PUT" ||
      request.method === "DELETE"
    ) {
      const origin = request.headers.get("origin") || request.headers.get("referer");
      if (origin) {
        const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"];
        const isValid = allowedOrigins.some((allowed) => origin?.startsWith(allowed));
        if (!isValid) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Apply to all routes except static files, images, etc.
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.webp).*)",
  ],
};
