import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateCart, recomputeCart } from "@/lib/cart";
import { updateCartItemSchema } from "@/lib/validators/cart";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const { itemId } = await params;
    const body = await request.json();
    const parsed = updateCartItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültige Eingabedaten", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { quantity } = parsed.data;
    const cart = await getOrCreateCart();
    if (!cart) {
      return NextResponse.json({ error: "Warenkorb nicht gefunden" }, { status: 404 });
    }

    const item = await db.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true },
    });

    if (!item || item.cartId !== cart.id) {
      return NextResponse.json({ error: "Artikel nicht im Warenkorb gefunden" }, { status: 404 });
    }

    if (quantity === 0) {
      await db.cartItem.delete({ where: { id: itemId } });
    } else {
      const allowedQuantity = Math.min(quantity, item.product.inventoryQuantity);
      await db.cartItem.update({
        where: { id: itemId },
        data: { quantity: allowedQuantity },
      });
    }

    const updatedCart = await recomputeCart(cart.id);
    return NextResponse.json({ cart: updatedCart });
  } catch (error) {
    console.error("[CART_ITEM_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Fehler beim Aktualisieren des Artikels" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const { itemId } = await params;
    const cart = await getOrCreateCart();

    if (!cart) {
      return NextResponse.json({ error: "Warenkorb nicht gefunden" }, { status: 404 });
    }

    const item = await db.cartItem.findUnique({ where: { id: itemId } });
    if (!item || item.cartId !== cart.id) {
      return NextResponse.json({ error: "Artikel nicht im Warenkorb gefunden" }, { status: 404 });
    }

    await db.cartItem.delete({ where: { id: itemId } });

    const updatedCart = await recomputeCart(cart.id);
    return NextResponse.json({ cart: updatedCart });
  } catch (error) {
    console.error("[CART_ITEM_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Fehler beim Entfernen des Artikels" }, { status: 500 });
  }
}
