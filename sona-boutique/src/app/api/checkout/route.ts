import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateCart, recomputeCart, CART_COOKIE } from "@/lib/cart";
import { getCurrentCustomer } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validators/checkout";
import { stripe } from "@/lib/stripe";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Bitte überprüfen Sie Ihre Formulareingaben.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Get current cart and recompute
    const cart = await getOrCreateCart();
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Ihr Warenkorb ist leer." }, { status: 400 });
    }

    const recomputedCart = await recomputeCart(cart.id);
    if (!recomputedCart || recomputedCart.items.length === 0) {
      return NextResponse.json({ error: "Warenkorb ist leer." }, { status: 400 });
    }

    const customer = await getCurrentCustomer();

    // Generate unique order number (SONA-2026-XXXXX)
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `SONA-2026-${randomSuffix}`;

    // Execute ACID Transaction
    const order = await db.$transaction(async (tx) => {
      // 1. Double check inventory inside transaction (Race-Condition Defense)
      for (const item of recomputedCart.items) {
        const prod = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!prod || prod.status !== "PUBLISHED" || prod.inventoryQuantity < item.quantity) {
          throw new Error(`DAS_EXKLUSIVE_STUECK_IST_LEIDER_AUSVERKAUFT: ${item.product.title}`);
        }
      }

      const billingFirstName = data.sameAsShipping
        ? data.firstName
        : data.billingFirstName || data.firstName;
      const billingLastName = data.sameAsShipping
        ? data.lastName
        : data.billingLastName || data.lastName;
      const billingStreet1 = data.sameAsShipping
        ? data.shippingStreet1
        : data.billingStreet1 || data.shippingStreet1;
      const billingStreet2 = data.sameAsShipping ? data.shippingStreet2 : data.billingStreet2;
      const billingCity = data.sameAsShipping
        ? data.shippingCity
        : data.billingCity || data.shippingCity;
      const billingPostalCode = data.sameAsShipping
        ? data.shippingPostalCode
        : data.billingPostalCode || data.shippingPostalCode;
      const billingCountry = data.sameAsShipping
        ? data.shippingCountry
        : data.billingCountry || data.shippingCountry;

      // 2. Create Order + OrderItems
      const newOrder = await tx.order.create({
        data: {
          number: orderNumber,
          customerId: customer?.id || null,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,

          shippingFirstName: data.firstName,
          shippingLastName: data.lastName,
          shippingStreet1: data.shippingStreet1,
          shippingStreet2: data.shippingStreet2,
          shippingCity: data.shippingCity,
          shippingPostalCode: data.shippingPostalCode,
          shippingCountry: data.shippingCountry,

          billingFirstName,
          billingLastName,
          billingStreet1,
          billingStreet2,
          billingCity,
          billingPostalCode,
          billingCountry,

          subtotalCents: recomputedCart.subtotalCents,
          shippingCents: recomputedCart.shippingCents,
          taxCents: recomputedCart.taxCents,
          discountCents: recomputedCart.discountCents,
          totalCents: recomputedCart.totalCents,
          currencyCode: "EUR",
          promoCode: recomputedCart.promoCode,

          fulfillmentStatus: "PENDING",
          paymentStatus: "PENDING",

          items: {
            create: recomputedCart.items.map((it) => ({
              productId: it.productId,
              title: it.product.title,
              brandName: it.product.brand?.name || "SONA Boutique",
              sku: it.product.sku,
              quantity: it.quantity,
              unitPriceCents: it.unitPriceCents,
              totalCents: it.unitPriceCents * it.quantity,
            })),
          },
        },
      });

      // 3. Reserve Inventory
      for (const item of recomputedCart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            inventoryQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 4. Increment promo code usage if promo code was used
      if (recomputedCart.promoCode) {
        await tx.promoCode.update({
          where: { code: recomputedCart.promoCode },
          data: {
            usageCount: {
              increment: 1,
            },
          },
        });
      }

      // 5. Mark Cart as Completed
      await tx.cart.update({
        where: { id: recomputedCart.id },
        data: {
          status: "COMPLETED",
        },
      });

      return newOrder;
    });

    // Clear cart cookie
    const store = await cookies();
    store.delete(CART_COOKIE);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // If real Stripe API key configured, create Stripe Checkout Session
    if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("mock")) {
      const lineItems = recomputedCart.items.map((it) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: it.product.title,
            description: `Marke: ${it.product.brand?.name} | SKU: ${it.product.sku}`,
            images: it.product.images[0]?.url ? [it.product.images[0].url] : [],
          },
          unit_amount: it.unitPriceCents,
        },
        quantity: it.quantity,
      }));

      // Add shipping line item if shippingCents > 0
      if (recomputedCart.shippingCents > 0) {
        lineItems.push({
          price_data: {
            currency: "eur",
            product_data: {
              name: "Versicherter DHL Express Versand",
              description: "Express-Zustellung inkl. Transportversicherung",
              images: [],
            },
            unit_amount: recomputedCart.shippingCents,
          },
          quantity: 1,
        });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        customer_email: data.email,
        metadata: {
          orderId: order.id,
          orderNumber: order.number,
          customerId: customer?.id || "",
        },
        success_url: `${baseUrl}/order/${order.id}?success=true`,
        cancel_url: `${baseUrl}/checkout?canceled=true`,
      });

      return NextResponse.json({
        checkoutUrl: session.url,
        order: { id: order.id, number: order.number },
      });
    }

    // Dev Fallback / Mock Mode: Auto-approve Order & return direct confirmation URL
    await db.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        paidAt: new Date(),
      },
    });

    await db.payment.create({
      data: {
        orderId: order.id,
        provider: "MOCK",
        providerRef: `mock_${Date.now()}`,
        amountCents: order.totalCents,
        status: "SUCCEEDED",
      },
    });

    return NextResponse.json({
      checkoutUrl: `${baseUrl}/order/${order.id}`,
      order: { id: order.id, number: order.number },
    });
  } catch (error: any) {
    console.error("[CHECKOUT_POST_ERROR]", error);
    if (error?.message?.includes("DAS_EXKLUSIVE_STUECK_IST_LEIDER_AUSVERKAUFT")) {
      return NextResponse.json(
        {
          error:
            "Eines der gewählten Einzelstücke ist leider während des Bezahlvorgangs ausverkauft worden.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Fehler beim Erstellen der Bestellung. Bitte versuchen Sie es erneut." },
      { status: 500 },
    );
  }
}
