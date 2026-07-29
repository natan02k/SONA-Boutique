import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { refundSchema } from "@/lib/validators/refund";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: true,
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Bestellung nicht gefunden" }, { status: 404 });
    }

    if (order.paymentStatus === "REFUNDED") {
      return NextResponse.json(
        { error: "Diese Bestellung wurde bereits vollständig zurückerstattet." },
        { status: 400 },
      );
    }

    const body = await request.json();
    const parsed = refundSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Ungültige Angaben zur Rückerstattung",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { type, amountEuro, reason } = parsed.data;

    const remainingRefundableCents = order.totalCents - order.partialRefundCents;

    let refundAmountCents = 0;
    if (type === "FULL") {
      refundAmountCents = remainingRefundableCents;
    } else {
      if (!amountEuro || amountEuro <= 0) {
        return NextResponse.json(
          { error: "Bitte geben Sie einen gültigen Rückerstattungsbetrag in € an." },
          { status: 400 },
        );
      }
      refundAmountCents = Math.round(amountEuro * 100);
    }

    if (refundAmountCents <= 0) {
      return NextResponse.json(
        { error: "Rückerstattungsbetrag muss größer als 0 sein." },
        { status: 400 },
      );
    }

    if (refundAmountCents > remainingRefundableCents) {
      const maxEuro = (remainingRefundableCents / 100).toLocaleString("de-DE", {
        style: "currency",
        currency: "EUR",
      });
      return NextResponse.json(
        { error: `Der maximale Erstattungsbetrag beträgt ${maxEuro}.` },
        { status: 400 },
      );
    }

    const newPartialRefundCents = order.partialRefundCents + refundAmountCents;
    const isFullRefund = newPartialRefundCents >= order.totalCents;

    // Process Stripe Refund if Stripe Payment exists
    const stripePayment = order.payments.find(
      (p) => p.provider === "STRIPE" && p.status === "SUCCEEDED",
    );

    let stripeRefundId = `refund_${Date.now()}`;

    if (
      stripePayment &&
      process.env.STRIPE_SECRET_KEY &&
      !process.env.STRIPE_SECRET_KEY.includes("mock")
    ) {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: stripePayment.providerRef,
          amount: refundAmountCents,
          reason: "requested_by_customer",
        });
        stripeRefundId = refund.id;
      } catch (stripeErr: any) {
        console.error("[STRIPE_REFUND_API_ERROR]", stripeErr);
        return NextResponse.json({ error: `Stripe Fehler: ${stripeErr.message}` }, { status: 500 });
      }
    }

    // ACID Transaction for DB Update & Inventory Restoration
    const updatedOrder = await db.$transaction(async (tx) => {
      const newPaymentStatus = isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED";

      // 1. Update Order
      const updated = await tx.order.update({
        where: { id },
        data: {
          paymentStatus: newPaymentStatus,
          partialRefundCents: newPartialRefundCents,
        },
        include: {
          items: true,
          payments: true,
        },
      });

      // 2. Add negative Payment entry for accounting log
      await tx.payment.create({
        data: {
          orderId: id,
          provider: stripePayment ? "STRIPE" : "MOCK",
          providerRef: stripeRefundId,
          amountCents: -refundAmountCents,
          status: "SUCCEEDED",
        },
      });

      // 3. CRITICAL RULE: Restore inventory ONLY if it's a FULL refund!
      if (isFullRefund) {
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

      return updated;
    });

    return NextResponse.json({
      order: updatedOrder,
      message: isFullRefund
        ? "Volle Rückerstattung erfolgreich veranlasst und Lagerbestand restauriert."
        : `Partielle Rückerstattung über ${(refundAmountCents / 100).toFixed(2)} € erfolgreich gebucht.`,
    });
  } catch (error: any) {
    if (error?.status === 403 || error?.status === 401) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }
    console.error("[ADMIN_REFUND_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Fehler beim Verarbeiten der Rückerstattung" },
      { status: 500 },
    );
  }
}
