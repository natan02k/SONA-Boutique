import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productQuerySchema } from "@/lib/validators/product";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());
    const parsed = productQuerySchema.safeParse(rawParams);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültige Filterparameter", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { search, brand, category, condition, minPrice, maxPrice, sort, limit, page } =
      parsed.data;

    // Build Prisma Where Clause (CRITICAL: status MUST be PUBLISHED)
    const where: Prisma.ProductWhereInput = {
      status: "PUBLISHED",
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { brand: { name: { contains: search } } },
        { sku: { contains: search } },
      ];
    }

    if (brand) {
      where.brand = { slug: brand };
    }

    if (category) {
      where.category = { slug: category };
    }

    if (condition) {
      where.condition = condition;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.resalePriceCents = {};
      if (minPrice !== undefined) {
        where.resalePriceCents.gte = Math.round(minPrice * 100);
      }
      if (maxPrice !== undefined) {
        where.resalePriceCents.lte = Math.round(maxPrice * 100);
      }
    }

    // Determine Sort Order
    let orderBy: Prisma.ProductOrderByWithRelationInput[] = [];
    switch (sort) {
      case "newest":
        orderBy = [{ createdAt: "desc" }];
        break;
      case "price-asc":
        orderBy = [{ resalePriceCents: "asc" }];
        break;
      case "price-desc":
        orderBy = [{ resalePriceCents: "desc" }];
        break;
      case "featured":
      default:
        orderBy = [{ isFeatured: "desc" }, { featuredRank: "asc" }, { createdAt: "desc" }];
        break;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          brand: { select: { id: true, name: true, slug: true } },
          category: { select: { id: true, name: true, slug: true } },
          images: {
            orderBy: { position: "asc" },
            select: { id: true, url: true, altText: true, position: true, isPrimary: true },
          },
        },
      }),
      db.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      products,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("[PRODUCTS_GET_ERROR]", error);
    return NextResponse.json({ error: "Fehler beim Laden der Produkte" }, { status: 500 });
  }
}
