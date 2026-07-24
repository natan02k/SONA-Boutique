import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    await requireAdmin();
    const { id: productId, imageId } = await params;

    await db.productImage.delete({
      where: { id: imageId },
    });

    // Re-index remaining images
    const remainingImages = await db.productImage.findMany({
      where: { productId },
      orderBy: { position: "asc" },
    });

    for (let idx = 0; idx < remainingImages.length; idx++) {
      const img = remainingImages[idx];
      if (!img) continue;
      await db.productImage.update({
        where: { id: img.id },
        data: {
          position: idx,
          isPrimary: idx === 0,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Delete product image error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
