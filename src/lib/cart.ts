import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getCurrentCustomer } from "@/lib/auth";
import { getTaxRate } from "@/lib/tax";

export const CART_COOKIE = "sona_cart";
const CART_TTL_DAYS = 30;

/**
 * Recomputes Subtotal, Promo Discount, Shipping, Tax, and Total on the Server.
 * Dynamically applies EU-OSS tax rates depending on destination shipping country.
 */
export async function recomputeCart(cartId: string, shippingCountry: string = "DE") {
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
    const itemSubtotal = item.product.resalePriceCents * item.quantity;
    subtotal += itemSubtotal;

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
      await db.cart.update({
        where: { id: cartId },
        data: { promoCode: null },
      });
    }
  }

  // 3. Shipping: Free if subtotal >= 500€ (50000 cents), else 15€ (1500 cents) for international
  const shipping = subtotal === 0 || subtotal >= 50000 ? 0 : 1500;

  // 4. Dynamic EU-OSS Tax Rate calculation
  const taxRate = getTaxRate(shippingCountry);
  const taxable = Math.max(0, subtotal - discount) + shipping;
  const tax = Math.floor(taxable * taxRate);

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

  if (customer) {
    let customerCart = await db.cart.findFirst({
      where: { customerId: customer.id, status: "ACTIVE" },
    });

    if (customerCart) {
      if (cartCookieId && cartCookieId !== customerCart.id) {
        await mergeAnonymousCartToCustomerCart(cartCookieId, customer.id);
      }
      await setCartCookie(customerCart.id);
      return recomputeCart(customerCart.id);
    }

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

    customerCart = await db.cart.create({
      data: { customerId: customer.id, status: "ACTIVE" },
    });
    await setCartCookie(customerCart.id);
    return recomputeCart(customerCart.id);
  }

  if (cartCookieId) {
    const existingCart = await db.cart.findUnique({ where: { id: cartCookieId } });
    if (existingCart && existingCart.status === "ACTIVE") {
      return recomputeCart(existingCart.id);
    }
  }

  const newCart = await db.cart.create({
    data: { status: "ACTIVE" },
  });
  await setCartCookie(newCart.id);
  return recomputeCart(newCart.id);
}

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
    await db.cart.update({
      where: { id: anonymousCartId },
      data: { customerId },
    });
    return;
  }

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

  await db.cart.update({
    where: { id: anonymousCartId },
    data: { status: "MERGED" },
  });

  await recomputeCart(customerCart.id);
}
