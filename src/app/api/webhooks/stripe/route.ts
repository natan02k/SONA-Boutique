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
            const existingPayment = await db.payment.findFirst({
              where: { providerRef: session.id },
            });

            if (!existingPayment) {
              await db.$transaction(async (tx) => {
                await tx.order.update({
                  where: { id: orderId },
                  data: {
                    paymentStatus: "PAID",
                    paidAt: new Date(),
                  },
                });

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
              await tx.order.update({
                where: { id: orderId },
                data: { paymentStatus: "FAILED" },
              });

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
        const paymentIntentId = dispute.payment_intent;

        console.warn(
          `[STRIPE_DISPUTE_CREATED] Dispute ID: ${dispute.id}, PaymentIntent: ${paymentIntentId}`,
        );

        // Find payment & order
        const payment = await db.payment.findFirst({
          where: { providerRef: paymentIntentId },
          include: { order: true },
        });

        if (payment && payment.order) {
          const order = payment.order;
          // Idempotent update: set status to CANCELLED to block order processing
          if (order.fulfillmentStatus !== "CANCELLED") {
            await db.order.update({
              where: { id: order.id },
              data: { fulfillmentStatus: "CANCELLED" },
            });
          }

          // Send Support Alert Email
          try {
            await sendEmail({
              to: "support@sona-boutique.de",
              subject: `[DISPUTE ALERT] Stripe Dispute für Bestellung ${order.number}`,
              text: `Ein Stripe Dispute wurde eröffnet.\nDispute ID: ${dispute.id}\nBestellung: ${order.number}\nBetrag: ${(dispute.amount / 100).toFixed(2)} €\nGrund: ${dispute.reason}`,
            });
          } catch (emailErr) {
            console.error("[DISPUTE_EMAIL_FAIL]", emailErr);
          }
        }
        break;
      }

      case "charge.dispute.closed": {
        const dispute = event.data.object as any;
        const paymentIntentId = dispute.payment_intent;
        const disputeStatus = dispute.status; // "won" | "lost"

        console.log(`[STRIPE_DISPUTE_CLOSED] Dispute ID: ${dispute.id}, Status: ${disputeStatus}`);

        const payment = await db.payment.findFirst({
          where: { providerRef: paymentIntentId },
          include: { order: true },
        });

        if (payment && payment.order) {
          const order = payment.order;
          if (disputeStatus === "won") {
            // Restore order status to PENDING
            await db.order.update({
              where: { id: order.id },
              data: { fulfillmentStatus: "PENDING" },
            });
          } else if (disputeStatus === "lost") {
            // Mark payment as REFUNDED
            await db.order.update({
              where: { id: order.id },
              data: { paymentStatus: "REFUNDED" },
            });
          }
        }
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
