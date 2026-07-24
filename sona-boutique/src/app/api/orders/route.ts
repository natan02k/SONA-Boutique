import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentCustomer } from "@/lib/auth";

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await db.order.findMany({
      where: { customerId: customer.id },
      orderBy: { placedAt: "desc" },
      include: {
        items: {
          select: { title: true, quantity: true, totalCents: true },
        },
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Fetch customer orders error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
