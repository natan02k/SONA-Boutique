import { db } from "@/lib/db";

const LOCK_DURATION_MIN = 15; // 15 Minuten Reservierung während der Kasse

/**
 * Locks a specific product for a specific locker (e.g. cartId or sessionId).
 * Returns true if lock was acquired or renewed, false if unavailable or locked by another user.
 */
export async function lockProduct(productId: string, lockerId: string): Promise<boolean> {
  const now = new Date();
  const lockExpiresAt = new Date(now.getTime() + LOCK_DURATION_MIN * 60 * 1000);

  return await db.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product || product.status !== "PUBLISHED") return false;
    if (product.inventoryQuantity <= 0) return false;

    // Check existing active lock
    if (product.lockedUntil && product.lockedUntil > now) {
      if (product.lockedBy === lockerId) {
        // Renew existing lock for this user
        await tx.product.update({
          where: { id: productId },
          data: { lockedUntil: lockExpiresAt },
        });
        return true;
      }
      // Locked by someone else!
      return false;
    }

    // Acquire new lock
    await tx.product.update({
      where: { id: productId },
      data: {
        lockedUntil: lockExpiresAt,
        lockedBy: lockerId,
      },
    });
    return true;
  });
}

/**
 * Locks all products in a given cart.
 */
export async function lockCartItems(cartId: string): Promise<{
  success: boolean;
  lockedProductIds: string[];
  failedProductId?: string;
  failedProductTitle?: string;
}> {
  const cart = await db.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    return { success: false, lockedProductIds: [] };
  }

  const lockedProductIds: string[] = [];

  for (const item of cart.items) {
    const acquired = await lockProduct(item.productId, cartId);
    if (!acquired) {
      // Rollback already acquired locks in this attempt
      for (const lockedId of lockedProductIds) {
        await unlockProduct(lockedId, cartId);
      }
      return {
        success: false,
        lockedProductIds: [],
        failedProductId: item.productId,
        failedProductTitle: item.product.title,
      };
    }
    lockedProductIds.push(item.productId);
  }

  return { success: true, lockedProductIds };
}

/**
 * Unlocks a specific product if locked by specified locker.
 */
export async function unlockProduct(productId: string, lockerId: string): Promise<void> {
  await db.product.updateMany({
    where: { id: productId, lockedBy: lockerId },
    data: { lockedUntil: null, lockedBy: null },
  });
}

/**
 * Unlocks all items locked by a cart ID.
 */
export async function unlockCartItems(cartId: string): Promise<void> {
  await db.product.updateMany({
    where: { lockedBy: cartId },
    data: { lockedUntil: null, lockedBy: null },
  });
}

/**
 * Checks if product is available for purchase (inventory > 0 and not locked by another user).
 */
export async function isProductAvailable(productId: string, lockerId?: string): Promise<boolean> {
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "PUBLISHED") return false;
  if (product.inventoryQuantity <= 0) return false;

  if (product.lockedUntil && product.lockedUntil > new Date()) {
    if (lockerId && product.lockedBy === lockerId) {
      return true; // Available to current locker
    }
    return false; // Locked by someone else
  }

  return true;
}

/**
 * Cronjob function: Cleans up expired locks.
 */
export async function cleanupExpiredLocks(): Promise<number> {
  const now = new Date();
  const result = await db.product.updateMany({
    where: {
      lockedUntil: { lt: now },
      NOT: { lockedUntil: null },
    },
    data: { lockedUntil: null, lockedBy: null },
  });
  return result.count;
}
