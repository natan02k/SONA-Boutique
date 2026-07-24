import { NextRequest, NextResponse } from "next/server";
import { cleanupExpiredLocks } from "@/lib/inventory-lock";

export async function GET(request: NextRequest) {
  try {
    // Validate authorization header if CRON_SECRET is configured
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cleanedCount = await cleanupExpiredLocks();

    return NextResponse.json({
      status: "ok",
      cleaned: cleanedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron Cleanup Locks Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
