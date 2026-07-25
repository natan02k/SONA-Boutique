import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Quick DB query to verify connection
    await db.$queryRaw`SELECT 1`;

    // Test if Sentry DSN is configured
    const sentryConfigured = !!(
      process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN
    );

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
      database: "connected",
      sentry: sentryConfigured ? "configured" : "missing DSN",
    });
  } catch (error) {
    console.error("[HEALTH_CHECK_ERROR]", error);
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        database: "disconnected",
      },
      { status: 503 },
    );
  }
}
