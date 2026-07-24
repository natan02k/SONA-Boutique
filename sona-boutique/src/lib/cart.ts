import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getCurrentCustomer } from "@/lib/auth";

export const CART_COOKIE = "sona_cart";
const CART_TTL_DAYS = 30;

/**
 * Recomputes Subtotal, Promo Discount, Shipping, Tax, and Total on the Server.
 * Server-side Source of Truth (Client cannot manipulate prices!).
 */
export async function recomputeCart(cartId: string) {
  const cart = await db.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart) return null;

  // 1. Subtotal: Sum of (unitPriceCents * quantity)
  let subtotal = 0;
  for (const item of cart.items) {
    // Sync price from DB product to prevent stale prices
    const itemSubtotal = item.product.resalePriceCents * item.quantity;
    subtotal += itemSubtotal;

    // Update item unitPriceCents if it changed
    if (item.unitPriceCents !== item.product.resalePriceCents) {
      await db.cartItem.update({
        where: { id: item.id },
        data: { unitPriceCents: item.product.resalePriceCents },
      });
    }
  }

  // 2. Discount: Validate promoCode if set
  let discount = 0;
  if (cart.promoCode) {
    const promo = await db.promoCode.findUnique({
      where: { code: cart.promoCode },
    });

    const now = new Date();
    const isValid =
      promo &&
      promo.isActive &&
      (!promo.startsAt || promo.startsAt <= now) &&
      (!promo.endsAt || promo.endsAt >= now) &&
      (!promo.usageLimit || promo.usageCount < promo.usageLimit) &&
      subtotal >= promo.minOrderCents;

    if (isValid) {
      if (promo.type === "PERCENTAGE") {
        discount = Math.floor((subtotal * promo.value) / 100);
      } else if (promo.type === "FIXED") {
        discount = Math.min(promo.value, subtotal);
      }
    } else {
      // Promo no longer valid, remove code
      await db.cart.update({
        where: { id: cartId },
        data: { promoCode: null },
      });
    }
  }

  // 3. Shipping: Free if subtotal >= 500€ (50000 cents), else 15€ (1500 cents)
  const shipping = subtotal === 0 || subtotal >= 50000 ? 0 : 1500;

  // 4. Taxable amount & Tax: 19% MwSt.
  const taxable = Math.max(0, subtotal - discount) + shipping;
  const tax = Math.floor(taxable * 0.19);

  // 5. Total
  const total = taxable + tax;

  // Save updated figures to DB
  return db.cart.update({
    where: { id: cartId },
    data: {
      subtotalCents: subtotal,
      discountCents: discount,
      shippingCents: shipping,
      taxCents: tax,
      totalCents: total,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              brand: { select: { id: true, name: true, slug: true } },
              images: { orderBy: { position: "asc" } },
            },
          },
        },
      },
    },
  });
}

/**
 * Gets active Cart for customer or anonymous guest via cookie, or creates a new one.
 */
export async function getOrCreateCart() {
  const store = await cookies();
  const cartCookieId = store.get(CART_COOKIE)?.value;
  const customer = await getCurrentCustomer();

  // If customer logged in, look for their active cart
  if (customer) {
    let customerCart = await db.cart.findFirst({
      where: { customerId: customer.id, status: "ACTIVE" },
    });

    if (customerCart) {
      // If anonymous cart cookie exists, merge it into customer cart
      if (cartCookieId && cartCookieId !== customerCart.id) {
        await mergeAnonymousCartToCustomerCart(cartCookieId, customer.id);
      }
      await setCartCookie(customerCart.id);
      return recomputeCart(customerCart.id);
    }

    // Customer has no cart, but guest cart cookie exists -> assign to customer
    if (cartCookieId) {
      const guestCart = await db.cart.findUnique({ where: { id: cartCookieId } });
      if (guestCart && guestCart.status === "ACTIVE") {
        await db.cart.update({
          where: { id: cartCookieId },
          data: { customerId: customer.id },
        });
        await setCartCookie(cartCookieId);
        return recomputeCart(cartCookieId);
      }
    }

    // Create new cart for customer
    customerCart = await db.cart.create({
      data: { customerId: customer.id, status: "ACTIVE" },
    });
    await setCartCookie(customerCart.id);
    return recomputeCart(customerCart.id);
  }

  // Anonymous Guest Flow
  if (cartCookieId) {
    const existingCart = await db.cart.findUnique({ where: { id: cartCookieId } });
    if (existingCart && existingCart.status === "ACTIVE") {
      return recomputeCart(existingCart.id);
    }
  }

  // Create new anonymous cart
  const newCart = await db.cart.create({
    data: { status: "ACTIVE" },
  });
  await setCartCookie(newCart.id);
  return recomputeCart(newCart.id);
}

/**
 * Sets the sona_cart cookie on the response.
 */
export async function setCartCookie(cartId: string) {
  const store = await cookies();
  const expiresAt = new Date(Date.now() + CART_TTL_DAYS * 86400 * 1000);
  store.set(CART_COOKIE, cartId, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * Merges anonymous guest cart into logged-in customer cart.
 */
export async function mergeAnonymousCartToCustomerCart(
  anonymousCartId: string,
  customerId: string,
) {
  const anonymousCart = await db.cart.findUnique({
    where: { id: anonymousCartId },
    include: { items: { include: { product: true } } },
  });

  if (!anonymousCart || anonymousCart.status !== "ACTIVE" || anonymousCart.items.length === 0) {
    return;
  }

  let customerCart = await db.cart.findFirst({
    where: { customerId, status: "ACTIVE" },
    include: { items: true },
  });

  if (!customerCart) {
    // Simply transfer anonymous cart to customer
    await db.cart.update({
      where: { id: anonymousCartId },
      data: { customerId },
    });
    return;
  }

  // Merge items
  for (const anonItem of anonymousCart.items) {
    const existingItem = customerCart.items.find((it) => it.productId === anonItem.productId);
    const maxInventory = anonItem.product.inventoryQuantity;

    if (existingItem) {
      const newQuantity = Math.min(existingItem.quantity + anonItem.quantity, maxInventory);
      await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await db.cartItem.create({
        data: {
          cartId: customerCart.id,
          productId: anonItem.productId,
          quantity: Math.min(anonItem.quantity, maxInventory),
          unitPriceCents: anonItem.unitPriceCents,
        },
      });
    }
  }

  // Mark anonymous cart as merged
  await db.cart.update({
    where: { id: anonymousCartId },
    data: { status: "MERGED" },
  });

  await recomputeCart(customerCart.id);
}
