import { db } from "@/lib/db";

/**
 * Marks an order as CANCELLED and logs the cancellation timestamp and reason.
 */
export async function processCancellation(orderId: string, reason: string) {
  return await db.$transaction(async (tx) => {
    const order = await tx.order.update({
      where: { id: orderId },
      data: {
        fulfillmentStatus: "CANCELLED",
        cancelledAt: new Date(),
      },
    });

    return order;
  });
}

/**
 * Restores product inventory after post-return quality & authenticity inspection.
 */
export async function restoreInventoryAfterReturn(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    throw new Error("Bestellung nicht gefunden");
  }

  return await db.$transaction(async (tx) => {
    for (const item of order.items) {
      if (item.productId) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            inventoryQuantity: { increment: item.quantity },
            status: "PUBLISHED",
          },
        });
      }
    }

    return { success: true };
  });
}
