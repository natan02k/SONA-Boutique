import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateCart, recomputeCart } from "@/lib/cart";
import { addToCartSchema } from "@/lib/validators/cart";

export async function GET() {
  try {
    const cart = await getOrCreateCart();
    return NextResponse.json({ cart });
  } catch (error) {
    console.error("[CART_GET_ERROR]", error);
    return NextResponse.json({ error: "Fehler beim Laden des Warenkorbs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = addToCartSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültige Eingabedaten", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { productId, quantity } = parsed.data;

    // Check if product exists & published
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product || product.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Produkt nicht gefunden oder nicht verfügbar" },
        { status: 404 },
      );
    }

    if (product.inventoryQuantity <= 0) {
      return NextResponse.json(
        { error: "Dieses exklusive Stück ist leider bereits ausverkauft." },
        { status: 400 },
      );
    }

    const cart = await getOrCreateCart();
    if (!cart) {
      return NextResponse.json(
        { error: "Warenkorb konnte nicht erstellt werden" },
        { status: 500 },
      );
    }

    const existingItem = cart.items.find((it) => it.productId === productId);

    if (existingItem) {
      const requestedTotal = existingItem.quantity + quantity;
      if (requestedTotal > product.inventoryQuantity) {
        return NextResponse.json(
          {
            error: `Dieses exklusive Stück ist nur ${product.inventoryQuantity}x verfügbar.`,
          },
          { status: 400 },
        );
      }

      await db.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: requestedTotal,
          unitPriceCents: product.resalePriceCents,
        },
      });
    } else {
      if (quantity > product.inventoryQuantity) {
        return NextResponse.json(
          {
            error: `Dieses exklusive Stück ist nur ${product.inventoryQuantity}x verfügbar.`,
          },
          { status: 400 },
        );
      }

      await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity,
          unitPriceCents: product.resalePriceCents,
        },
      });
    }

    const updatedCart = await recomputeCart(cart.id);
    return NextResponse.json({ cart: updatedCart });
  } catch (error) {
    console.error("[CART_POST_ERROR]", error);
    return NextResponse.json({ error: "Fehler beim Hinzufügen zum Warenkorb" }, { status: 500 });
  }
}
