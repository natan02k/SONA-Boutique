import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const promo = await db.promoCode.findUnique({ where: { id } });
    if (!promo) {
      return NextResponse.json({ error: "Gutschein nicht gefunden" }, { status: 404 });
    }

    // Collect usage stats
    const totalOrders = await db.order.count({
      where: { promoCode: promo.code },
    });

    const revenueCents = await db.order.aggregate({
      where: { promoCode: promo.code, paymentStatus: "PAID" },
      _sum: { totalCents: true },
    });

    return NextResponse.json({
      totalOrders,
      totalRevenueCents: revenueCents._sum.totalCents || 0,
    });
  } catch (error: any) {
    if (error?.status === 403 || error?.status === 401) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }
    console.error("[ADMIN_PROMO_USAGE_ERROR]", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Verbrauchsstatistik" },
      { status: 500 },
    );
  }
}