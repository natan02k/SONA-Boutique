import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id: productId } = await params;
    const body = await request.json();

    const url = body.url;
    const altText = body.altText || null;

    if (!url) {
      return NextResponse.json({ error: "Bild-URL ist erforderlich." }, { status: 400 });
    }

    const product = await db.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Produkt nicht gefunden." }, { status: 404 });
    }

    const position = product.images.length;
    const isPrimary = position === 0;

    const image = await db.productImage.create({
      data: {
        productId,
        url,
        altText,
        position,
        isPrimary,
      },
    });

    return NextResponse.json({ success: true, image });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Add product image error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
