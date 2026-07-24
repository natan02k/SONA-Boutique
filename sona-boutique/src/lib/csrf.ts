import { NextRequest } from "next/server";

/**
 * Validates request Origin and Referer headers against CSRF attacks.
 */
export function checkCsrf(req: NextRequest): boolean {
  // Safe HTTP Methods bypass CSRF checks
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return true;
  }

  const path = req.nextUrl.pathname;

  // Stripe Webhooks come from external Stripe servers with raw signature verification
  if (path.startsWith("/api/webhooks/stripe")) {
    return true;
  }

  const originHeader = req.headers.get("origin");
  const refererHeader = req.headers.get("referer");

  const targetOrigin = originHeader || (refererHeader ? new URL(refererHeader).origin : null);
  if (!targetOrigin) {
    // If no origin or referer provided on mutating request, reject
    return false;
  }

  const requestOrigin = req.nextUrl.origin;
  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL).origin
    : null;

  const allowedOrigins = [requestOrigin];
  if (configuredAppUrl) {
    allowedOrigins.push(configuredAppUrl);
  }

  return allowedOrigins.some((allowed) => targetOrigin.startsWith(allowed));
}
