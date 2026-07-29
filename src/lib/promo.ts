import { db } from "@/lib/db";
import type { PromoCode } from "@prisma/client";

/**
 * Validates a promo code against all business rules.
 * Returns { valid: true, promo } on success, or { valid: false, error } on failure.
 */
export async function validatePromoCode(
  code: string,
  cartSubtotalCents: number,
  customerId?: string,
): Promise<{ valid: true; promo: PromoCode } | { valid: false; error: string }> {
  const promo = await db.promoCode.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!promo) {
    return { valid: false, error: "Gutscheincode nicht gefunden." };
  }

  if (!promo.isActive) {
    return { valid: false, error: "Dieser Gutscheincode ist nicht mehr aktiv." };
  }

  const now = new Date();

  if (promo.startsAt && promo.startsAt > now) {
    return { valid: false, error: "Dieser Gutscheincode ist noch nicht gültig." };
  }

  if (promo.endsAt && promo.endsAt < now) {
    return { valid: false, error: "Dieser Gutscheincode ist abgelaufen." };
  }

  if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
    return { valid: false, error: "Dieser Gutscheincode wurde bereits maximal verwendet." };
  }

  if (cartSubtotalCents < promo.minOrderCents) {
    const minEuro = (promo.minOrderCents / 100).toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
    return {
      valid: false,
      error: `Mindestbestellwert von ${minEuro} nicht erreicht.`,
    };
  }

  // Per-customer-limit check
  if (promo.perCustomerLimit && customerId) {
    const customerUsage = await db.order.count({
      where: {
        customerId,
        promoCode: code.toUpperCase(),
        paymentStatus: "PAID",
      },
    });

    if (customerUsage >= promo.perCustomerLimit) {
      return {
        valid: false,
        error: "Sie haben diesen Gutscheincode bereits verwendet.",
      };
    }
  }

  return { valid: true, promo };
}

/**
 * Calculates the discount amount in cents for a given promo code and subtotal.
 */
export function calculateDiscount(promo: PromoCode, subtotalCents: number): number {
  if (promo.type === "PERCENTAGE") {
    return Math.floor((subtotalCents * promo.value) / 100);
  }
  // FIXED
  return Math.min(promo.value, subtotalCents);
}