import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { adminProductSchema } from "@/lib/validators/admin";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const brand = searchParams.get("brand") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { sku: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (brand) {
      where.brand = { slug: brand };
    }

    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          brand: { select: { id: true, name: true, slug: true } },
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { position: "asc" } },
        },
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    if (error?.status === 403 || error?.status === 401) {
      return NextResponse.json(
        { error: "Zugriff verweigert (Admin erforderlich)" },
        { status: 403 },
      );
    }
    console.error("[ADMIN_PRODUCTS_GET_ERROR]", error);
    return NextResponse.json({ error: "Fehler beim Laden der Produkte" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const parsed = adminProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültige Produktdaten", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Auto-generate slug from title
    const baseSlug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Auto-generate SKU if not provided
    const sku = data.sku || `SKU-${Date.now()}`;

    const publishedAt = data.status === "PUBLISHED" ? new Date() : null;

    const product = await db.product.create({
      data: {
        slug,
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        brandId: data.brandId,
        categoryId: data.categoryId || null,
        status: data.status,
        sku,
        material: data.material,
        color: data.color,
        hardware: data.hardware,
        originCountry: data.originCountry,
        manufacturingYear: data.manufacturingYear,
        condition: data.condition,
        conditionNotes: data.conditionNotes,
        authenticityCertNo: data.authenticityCertNo,
        certificateUrl: data.certificateUrl || null,
        includesOriginalBox: data.includesOriginalBox,
        includesDustBag: data.includesDustBag,
        includesReceipt: data.includesReceipt,
        includesAuthenticityCard: data.includesAuthenticityCard,
        resalePriceCents: data.resalePriceCents,
        compareAtPriceCents: data.compareAtPriceCents,
        retailPriceCents: data.retailPriceCents,
        inventoryQuantity: data.inventoryQuantity,
        weightGrams: data.weightGrams,
        dimensions: data.dimensions,
        tags: data.tags,
        isFeatured: data.isFeatured,
        featuredRank: data.featuredRank,
        publishedAt,
        images: {
          create: data.imageUrls.map((url, position) => ({
            url,
            position,
            isPrimary: position === 0,
          })),
        },
      },
      include: {
        brand: true,
        category: true,
        images: true,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    if (error?.status === 403 || error?.status === 401) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }
    console.error("[ADMIN_PRODUCTS_POST_ERROR]", error);
    return NextResponse.json({ error: "Fehler beim Erstellen des Produkts" }, { status: 500 });
  }
}
