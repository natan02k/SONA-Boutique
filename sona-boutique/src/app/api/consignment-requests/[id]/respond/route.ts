import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const action = body.action; // "ACCEPTED" | "REJECTED"

    if (action !== "ACCEPTED" && action !== "REJECTED") {
      return NextResponse.json({ error: "Ungültige Aktion" }, { status: 400 });
    }

    const updated = await db.consignmentRequest.update({
      where: { id },
      data: {
        status: action,
        offerAcceptedAt: action === "ACCEPTED" ? new Date() : undefined,
        offerRejectedAt: action === "REJECTED" ? new Date() : undefined,
      },
    });

    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    console.error("Offer response error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
