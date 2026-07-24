import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import OrderConfirmationEmail from "@/emails/order-confirmation";

export async function POST(request: NextRequest) {
  const bodyText = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  if (webhookSecret && signature) {
    try {
      event = stripe.webhooks.constructEvent(bodyText, signature, webhookSecret);
    } catch (err: any) {
      console.error("[STRIPE_WEBHOOK_SIGNATURE_ERROR]", err.message);
      return NextResponse.json({ error: "Ungültige Webhook-Signatur" }, { status: 400 });
    }
  } else {
    // If webhook secret not configured, parse body directly in dev
    try {
      event = JSON.parse(bodyText);
    } catch {
      return NextResponse.json({ error: "Ungültiger Event Body" }, { status: 400 });
    }
  }

  const eventType = event.type;
  console.log(`[STRIPE_WEBHOOK_RECEIVED] Event: ${eventType} (ID: ${event.id})`);

  try {
    switch (eventType) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          const order = await db.order.findUnique({
            where: { id: orderId },
            include: { items: true },
          });

          if (order && order.paymentStatus !== "PAID") {
            // Idempotency check: verify if payment already processed for this event/session
            const existingPayment = await db.payment.findFirst({
              where: { providerRef: session.id },
            });

            if (!existingPayment) {
              await db.$transaction(async (tx) => {
                // Update Order Status
                await tx.order.update({
                  where: { id: orderId },
                  data: {
                    paymentStatus: "PAID",
                    paidAt: new Date(),
                  },
                });

                // Record Payment
                await tx.payment.create({
                  data: {
                    orderId,
                    provider: "STRIPE",
                    providerRef: session.id,
                    amountCents: session.amount_total || order.totalCents,
                    status: "SUCCEEDED",
                  },
                });
              });

              // Send Order Confirmation Email asynchronously
              try {
                const totalEuro = (order.totalCents / 100).toLocaleString("de-DE", {
                  style: "currency",
                  currency: "EUR",
                });
                await sendEmail({
                  to: order.email,
                  subject: `Bestellbestätigung ${order.number} — SONA Boutique`,
                  react: OrderConfirmationEmail({
                    customerName: `${order.firstName} ${order.lastName}`,
                    orderNumber: order.number,
                    totalEuro,
                  }),
                });
              } catch (emailErr) {
                console.error("[EMAIL_CONFIRMATION_FAIL]", emailErr);
              }
            }
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as any;
        const orderId = paymentIntent.metadata?.orderId;

        if (orderId) {
          const order = await db.order.findUnique({
            where: { id: orderId },
            include: { items: true },
          });

          if (order && order.paymentStatus !== "PAID") {
            await db.$transaction(async (tx) => {
              // Update status to FAILED
              await tx.order.update({
                where: { id: orderId },
                data: { paymentStatus: "FAILED" },
              });

              // Restore inventory quantities
              for (const item of order.items) {
                if (item.productId) {
                  await tx.product.update({
                    where: { id: item.productId },
                    data: { inventoryQuantity: { increment: item.quantity } },
                  });
                }
              }
            });
          }
        }
        break;
      }

      case "charge.dispute.created": {
        const dispute = event.data.object as any;
        console.warn("[STRIPE_DISPUTE_CREATED]", dispute.id);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as any;
        console.log("[STRIPE_CHARGE_REFUNDED]", charge.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[STRIPE_WEBHOOK_HANDLER_ERROR]", err);
    return NextResponse.json({ error: "Fehler beim Verarbeiten des Webhooks" }, { status: 500 });
  }
}
