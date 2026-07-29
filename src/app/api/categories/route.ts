import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const categories = await db.category.findMany({
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

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("[CATEGORIES_GET_ERROR]", error);
    return NextResponse.json({ error: "Fehler beim Laden der Kategorien" }, { status: 500 });
  }
}
