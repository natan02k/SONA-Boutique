import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentCustomer } from "@/lib/auth";

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
    }

    const favorites = await db.favorite.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          include: {
            brand: { select: { id: true, name: true, slug: true } },
            images: { orderBy: { position: "asc" }, take: 2 },
          },
        },
      },
    });

    return NextResponse.json({
      favorites: favorites.map((f) => ({
        id: f.id,
        productId: f.productId,
        createdAt: f.createdAt,
        product: f.product,
      })),
    });
  } catch (error) {
    console.error("[FAVORITES_GET_ERROR]", error);
    return NextResponse.json({ error: "Fehler beim Laden der Favoriten" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: "productId erforderlich" }, { status: 400 });
    }

    // Check if product exists
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Produkt nicht gefunden" }, { status: 404 });
    }

    // Upsert to avoid duplicates
    const favorite = await db.favorite.upsert({
      where: {
        customerId_productId: { customerId: customer.id, productId },
      },
      create: { customerId: customer.id, productId },
      update: {},
    });

    return NextResponse.json({ favorite }, { status: 201 });
  } catch (error) {
    console.error("[FAVORITES_POST_ERROR]", error);
    return NextResponse.json({ error: "Fehler beim Hinzufügen des Favoriten" }, { status: 500 });
  }
}