import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { adminPromoCodeSchema } from "@/lib/validators/admin";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const parsed = adminPromoCodeSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültige Gutscheindaten", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const promoCode = await db.promoCode.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ promoCode });
  } catch (error: any) {
    if (error?.status === 403 || error?.status === 401) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }
    console.error("[ADMIN_PROMO_PATCH_ERROR]", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren des Gutscheins" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await db.promoCode.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error?.status === 403 || error?.status === 401) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }
    console.error("[ADMIN_PROMO_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Fehler beim Löschen des Gutscheins" }, { status: 500 });
  }
}
