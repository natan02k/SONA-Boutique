import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateCart, recomputeCart } from "@/lib/cart";
import { applyPromoSchema } from "@/lib/validators/cart";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = applyPromoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Bitte geben Sie einen Rabattcode ein." }, { status: 400 });
    }

    const code = parsed.data.code.toUpperCase();
    const cart = await getOrCreateCart();
    if (!cart) {
      return NextResponse.json({ error: "Warenkorb nicht gefunden" }, { status: 404 });
    }

    const promo = await db.promoCode.findUnique({ where: { code } });

    if (!promo || !promo.isActive) {
      return NextResponse.json(
        { error: "Ungültiger oder abgelaufener Rabattcode." },
        { status: 400 },
      );
    }

    const now = new Date();
    if (promo.startsAt && promo.startsAt > now) {
      return NextResponse.json(
        { error: "Dieser Rabattcode ist noch nicht gültig." },
        { status: 400 },
      );
    }
    if (promo.endsAt && promo.endsAt < now) {
      return NextResponse.json(
        { error: "Dieser Rabattcode ist bereits abgelaufen." },
        { status: 400 },
      );
    }
    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      return NextResponse.json(
        { error: "Dieser Rabattcode wurde bereits aufgebraucht." },
        { status: 400 },
      );
    }

    if (cart.subtotalCents < promo.minOrderCents) {
      const minEuro = (promo.minOrderCents / 100).toLocaleString("de-DE", {
        style: "currency",
        currency: "EUR",
      });
      return NextResponse.json(
        { error: `Mindestbestellwert für diesen Gutschein ist ${minEuro}.` },
        { status: 400 },
      );
    }

    // Save promoCode to cart
    await db.cart.update({
      where: { id: cart.id },
      data: { promoCode: code },
    });

    const updatedCart = await recomputeCart(cart.id);
    return NextResponse.json({
      cart: updatedCart,
      message: `Rabattcode ${code} erfolgreich angewendet!`,
    });
  } catch (error) {
    console.error("[PROMO_POST_ERROR]", error);
    return NextResponse.json({ error: "Fehler beim Anwenden des Rabattcodes" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cart = await getOrCreateCart();
    if (!cart) {
      return NextResponse.json({ error: "Warenkorb nicht gefunden" }, { status: 404 });
    }

    await db.cart.update({
      where: { id: cart.id },
      data: { promoCode: null },
    });

    const updatedCart = await recomputeCart(cart.id);
    return NextResponse.json({ cart: updatedCart, message: "Rabattcode entfernt." });
  } catch (error) {
    console.error("[PROMO_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Fehler beim Entfernen des Rabattcodes" }, { status: 500 });
  }
}
