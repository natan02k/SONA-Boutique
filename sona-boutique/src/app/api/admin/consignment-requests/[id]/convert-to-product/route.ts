import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const consignmentRequest = await db.consignmentRequest.findUnique({
      where: { id },
      include: { consignor: true },
    });

    if (!consignmentRequest) {
      return NextResponse.json({ error: "Anfrage nicht gefunden." }, { status: 404 });
    }

    // Find or create Brand
    const brandSlug = consignmentRequest.brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    let brand = await db.brand.findUnique({ where: { slug: brandSlug } });
    if (!brand) {
      brand = await db.brand.create({
        data: {
          name: consignmentRequest.brandName,
          slug: brandSlug,
        },
      });
    }

    const title = `${consignmentRequest.brandName} ${consignmentRequest.modelName}`;
    const productSlug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;
    const sku = `CONSIGN-${consignmentRequest.id.slice(0, 8).toUpperCase()}`;

    let photos: string[] = [];
    try {
      photos = JSON.parse(consignmentRequest.photos);
    } catch {
      photos = [];
    }

    const priceCents = consignmentRequest.offeredPriceCents || 100000;

    const product = await db.$transaction(async (tx) => {
      const prod = await tx.product.create({
        data: {
          title,
          slug: productSlug,
          description: consignmentRequest.description,
          status: "DRAFT",
          brandId: brand.id,
          condition: consignmentRequest.estimatedCondition,
          resalePriceCents: priceCents,
          sku,
          inventoryQuantity: 1,
          images: {
            create: photos.map((url, position) => ({
              url,
              position,
              altText: title,
            })),
          },
        },
      });

      await tx.consignmentRequest.update({
        where: { id },
        data: {
          status: "LISTED",
          convertedProductId: prod.id,
        },
      });

      return prod;
    });

    return NextResponse.json({ success: true, productId: product.id });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Convert to product error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
