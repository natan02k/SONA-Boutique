import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const brands = await db.brand.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: {
            products: {
              where: { status: "PUBLISHED" },
            },
          },
        },
      },
    });

    return NextResponse.json({ brands });
  } catch (error) {
    console.error("[BRANDS_GET_ERROR]", error);
    return NextResponse.json({ error: "Fehler beim Laden der Marken" }, { status: 500 });
  }
}
