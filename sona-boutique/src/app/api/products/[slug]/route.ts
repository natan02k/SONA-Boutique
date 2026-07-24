import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: "Slug erforderlich" }, { status: 400 });
    }

    const product = await db.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        category: true,
        images: {
          orderBy: { position: "asc" },
        },
        reviews: {
          where: { isVerified: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product || product.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Produkt nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("[PRODUCT_SLUG_GET_ERROR]", error);
    return NextResponse.json({ error: "Fehler beim Laden des Produkts" }, { status: 500 });
  }
}
