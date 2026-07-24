import { NextRequest } from "next/server";

/**
 * Performs a basic CSRF check by verifying the Origin/Referer header
 * against the allowed application URL.
 * SameSite=Strict cookies already provide significant CSRF protection,
 * this is an additional defense-in-depth layer for critical POST routes.
 *
 * @param req - The incoming NextRequest.
 * @returns true if the request passes the CSRF check.
 */
export function checkCsrf(req: NextRequest): boolean {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return true;
  }

  const origin = req.headers.get("origin") || req.headers.get("referer");
  if (!origin) {
    // Allow requests without origin for server-side calls (webhooks, cron)
    return true;
  }

  const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"];

  return allowedOrigins.some((allowed) => origin?.startsWith(allowed));
}
