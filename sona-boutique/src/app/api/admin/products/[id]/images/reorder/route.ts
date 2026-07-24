import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id: productId } = await params;
    const body = await request.json();

    const imageIds: string[] = body.imageIds;
    if (!Array.isArray(imageIds)) {
      return NextResponse.json({ error: "imageIds muss ein Array von String-IDs sein." }, { status: 400 });
    }

    await db.$transaction(async (tx) => {
      for (let idx = 0; idx < imageIds.length; idx++) {
        await tx.productImage.update({
          where: { id: imageIds[idx] },
          data: {
            position: idx,
            isPrimary: idx === 0,
          },
        });
      }
    });

    const updatedImages = await db.productImage.findMany({
      where: { productId },
      orderBy: { position: "asc" },
    });

    return NextResponse.json({ success: true, images: updatedImages });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Reorder images error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
