import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const fulfillmentStatus = searchParams.get("fulfillmentStatus") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Prisma.OrderWhereInput = {};

    if (fulfillmentStatus) {
      where.fulfillmentStatus = fulfillmentStatus;
    }
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }
    if (search) {
      where.OR = [
        { number: { contains: search } },
        { email: { contains: search } },
        { lastName: { contains: search } },
      ];
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        orderBy: { placedAt: "desc" },
        skip,
        take: limit,
        include: {
          items: true,
          customer: { select: { id: true, email: true, firstName: true, lastName: true } },
          payments: true,
          shipments: true,
        },
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    if (error?.status === 403 || error?.status === 401) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }
    console.error("[ADMIN_ORDERS_GET_ERROR]", error);
    return NextResponse.json({ error: "Fehler beim Laden der Bestellungen" }, { status: 500 });
  }
}
