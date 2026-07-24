import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { adminOrderUpdateSchema } from "@/lib/validators/admin";
import { sendEmail } from "@/lib/email";
import ShippingUpdateEmail from "@/emails/shipping-update";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Bestellung nicht gefunden" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = adminOrderUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültige Statusdaten", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { fulfillmentStatus, paymentStatus, carrier, trackingNo } = parsed.data;

    // Transactional Status Update
    const updatedOrder = await db.$transaction(async (tx) => {
      const dataToUpdate: any = {};

      if (paymentStatus) {
        dataToUpdate.paymentStatus = paymentStatus;
      }

      if (fulfillmentStatus && fulfillmentStatus !== order.fulfillmentStatus) {
        dataToUpdate.fulfillmentStatus = fulfillmentStatus;

        if (fulfillmentStatus === "SHIPPED") {
          dataToUpdate.shippedAt = new Date();

          // Create Shipment entry if carrier provided
          await tx.shipment.create({
            data: {
              orderId: id,
              carrier: carrier || "DHL Express",
              trackingNo: trackingNo || null,
              shippedAt: new Date(),
            },
          });
        } else if (fulfillmentStatus === "DELIVERED") {
          dataToUpdate.deliveredAt = new Date();
        } else if (fulfillmentStatus === "CANCELLED" && order.fulfillmentStatus !== "CANCELLED") {
          dataToUpdate.cancelledAt = new Date();

          // Restore inventory for all items in order
          for (const item of order.items) {
            if (item.productId) {
              await tx.product.update({
                where: { id: item.productId },
                data: {
                  inventoryQuantity: {
                    increment: item.quantity,
                  },
                },
              });
            }
          }
        }
      }

      return tx.order.update({
        where: { id },
        data: dataToUpdate,
        include: {
          items: true,
          customer: true,
          payments: true,
          shipments: true,
        },
      });
    });

    // Send Shipping Update Email asynchronously if status changed to SHIPPED
    if (fulfillmentStatus === "SHIPPED" && order.fulfillmentStatus !== "SHIPPED") {
      try {
        await sendEmail({
          to: order.email,
          subject: `Versandbestätigung ${order.number} — SONA Boutique`,
          react: ShippingUpdateEmail({
            customerName: `${order.firstName} ${order.lastName}`,
            orderNumber: order.number,
            carrier: carrier || "DHL Express",
            trackingNo: trackingNo || "JJD000300000000",
          }),
        });
      } catch (emailErr) {
        console.error("[SHIPPING_EMAIL_FAIL]", emailErr);
      }
    }

    return NextResponse.json({ order: updatedOrder });
  } catch (error: any) {
    if (error?.status === 403 || error?.status === 401) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }
    console.error("[ADMIN_ORDER_PATCH_ERROR]", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren der Bestellung" },
      { status: 500 },
    );
  }
}
