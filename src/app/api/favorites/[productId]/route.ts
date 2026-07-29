import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentCustomer } from "@/lib/auth";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
    }

    const { productId } = await params;

    await db.favorite.deleteMany({
      where: {
        customerId: customer.id,
        productId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[FAVORITES_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Fehler beim Entfernen des Favoriten" }, { status: 500 });
  }
}