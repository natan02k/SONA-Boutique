import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateCart, recomputeCart } from "@/lib/cart";
import { validatePromoCode, calculateDiscount } from "@/lib/promo";
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

    // Use shared validatePromoCode from lib/promo.ts
    const result = await validatePromoCode(code, cart.subtotalCents, cart.customerId ?? undefined);

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const promo = result.promo;

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
