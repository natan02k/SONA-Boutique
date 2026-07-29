import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { adminPromoCodeSchema } from "@/lib/validators/admin";

export async function GET() {
  try {
    await requireAdmin();

    const promoCodes = await db.promoCode.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ promoCodes });
  } catch (error: any) {
    if (error?.status === 403 || error?.status === 401) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }
    console.error("[ADMIN_PROMO_GET_ERROR]", error);
    return NextResponse.json({ error: "Fehler beim Laden der Gutscheine" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const parsed = adminPromoCodeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültige Gutscheindaten", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const existing = await db.promoCode.findUnique({ where: { code: data.code } });
    if (existing) {
      return NextResponse.json(
        { error: "Ein Gutscheincode mit diesem Namen existiert bereits." },
        { status: 400 },
      );
    }

    const promoCode = await db.promoCode.create({
      data: {
        code: data.code,
        description: data.description,
        type: data.type,
        value: data.value,
        minOrderCents: data.minOrderCents,
        usageLimit: data.usageLimit,
        perCustomerLimit: data.perCustomerLimit,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        isActive: data.isActive,
      },
    });

    return NextResponse.json({ promoCode }, { status: 201 });
  } catch (error: any) {
    if (error?.status === 403 || error?.status === 401) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }
    console.error("[ADMIN_PROMO_POST_ERROR]", error);
    return NextResponse.json({ error: "Fehler beim Erstellen des Gutscheins" }, { status: 500 });
  }
}
