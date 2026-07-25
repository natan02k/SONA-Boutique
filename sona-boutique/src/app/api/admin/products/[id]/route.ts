import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { adminProductSchema } from "@/lib/validators/admin";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Produkt nicht gefunden" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = adminProductSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültige Produktdaten", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;

    let publishedAt = existing.publishedAt;
    if (data.status === "PUBLISHED" && !publishedAt) {
      publishedAt = new Date();
    }

    // Update images if provided (use !== undefined so empty [] is handled correctly)
    if (data.imageUrls !== undefined) {
      await db.productImage.deleteMany({ where: { productId: id } });
      if (data.imageUrls.length > 0) {
        await db.productImage.createMany({
          data: data.imageUrls.map((url, position) => ({
            productId: id,
            url,
            position,
            isPrimary: position === 0,
          })),
        });
      }
    }

    const { imageUrls, ...updateData } = data;

    // Normalize nullable fields: empty string → null to avoid foreign key violations
    const normalizedData = {
      ...updateData,
      categoryId: updateData.categoryId || null,
    };

    const product = await db.product.update({
      where: { id },
      data: {
        ...normalizedData,
        publishedAt,
      },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { position: "asc" } },
      },
    });

    return NextResponse.json({ product });
  } catch (error: any) {
    if (error?.status === 403 || error?.status === 401) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }
    console.error("[ADMIN_PRODUCT_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Fehler beim Aktualisieren des Produkts" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Soft delete -> ARCHIVED
    await db.product.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error?.status === 403 || error?.status === 401) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }
    console.error("[ADMIN_PRODUCT_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Fehler beim Archivieren des Produkts" }, { status: 500 });
  }
}
