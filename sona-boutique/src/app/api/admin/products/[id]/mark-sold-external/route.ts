import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json().catch(() => ({}));
    const channel = body.channel || "External Channel";

    const product = await db.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Produkt nicht gefunden." }, { status: 404 });
    }

    const updated = await db.product.update({
      where: { id },
      data: {
        inventoryQuantity: 0,
        status: "ARCHIVED",
        lockedUntil: null,
        lockedBy: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Produkt wurde erfolgreich als auf ${channel} verkauft markiert.`,
      product: updated,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Mark sold external error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
