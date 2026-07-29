"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/ui-store";
import { useCartStore } from "@/store/cart-store";
import { ShimmerImage } from "@/components/luxury/ShimmerImage";
import { PLACEHOLDER_IMAGE } from "@/lib/placeholder";
import { PriceTag } from "@/components/luxury/PriceTag";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { ConditionBadge } from "@/components/luxury/ConditionBadge";
import { X, Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { EASE_LUXURY } from "@/lib/motion-presets";

export function CartDrawer() {
  const { isCartDrawerOpen, closeCartDrawer } = useUIStore();
  const { cart, fetchCart, updateItem, removeItem, applyPromo, removePromo, error, clearError } =
    useCartStore();
  const [mounted, setMounted] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartDrawerOpen) {
        closeCartDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartDrawerOpen, closeCartDrawer]);

  const cartItems = mounted ? cart?.items || [] : [];
  const subtotal = cart?.subtotalCents || 0;
  const shipping = cart?.shippingCents || 0;
  const discount = cart?.discountCents || 0;
  const total = cart?.totalCents || 0;

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;
    try {
      setPromoLoading(true);
      await applyPromo(promoCodeInput.trim());
      setPromoCodeInput("");
    } catch {
      // Error handled by store
    } finally {
      setPromoLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={closeCartDrawer}
            className="fixed inset-0 z-50 bg-[#1A1A1A]"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: EASE_LUXURY }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col justify-between border-l border-[#E8E5DC] bg-[#FAF9F6] p-6 shadow-2xl"
          >
            {/* Header */}
            <div>
              <div className="mb-4 flex items-center justify-between border-b border-[#E8E5DC] pb-4">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 text-[#C5A880]" />
                  <h3 className="font-serif text-xl tracking-tight text-[#1A1A1A]">
                    Warenkorb ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
                  </h3>
                </div>
                <button
                  onClick={closeCartDrawer}
                  aria-label="Close cart"
                  className="p-2 text-[#1A1A1A] transition-colors hover:text-[#C5A880]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Error Notice */}
              {error && (
                <div className="mb-4 flex items-center justify-between border border-[#B91C1C]/30 bg-[#B91C1C]/10 p-2.5 text-xs text-[#B91C1C]">
                  <span>{error}</span>
                  <button onClick={clearError} className="p-1 hover:opacity-80">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Items List */}
              {cartItems.length === 0 ? (
                <div className="space-y-4 py-16 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-none border border-[#C5A880]/30 bg-[#F5F4EE] text-[#C5A880]">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <p className="font-serif text-lg text-[#1A1A1A]">Ihr Warenkorb ist leer.</p>
                  <p className="mx-auto max-w-xs text-xs text-[#6B6B6B]">
                    Entdecken Sie unsere kuratierte Auswahl an zertifizierten Luxushandtaschen.
                  </p>
                  <div className="pt-4">
                    <Link href="/catalog" onClick={closeCartDrawer}>
                      <LuxuryButton variant="gold" size="sm" shimmer>
                        Kollektion Entdecken
                      </LuxuryButton>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-2">
                  {cartItems.map((item) => {
                    const primaryImage =
                      item.product.images[0]?.url ||
                      PLACEHOLDER_IMAGE;

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 border-b border-[#E8E5DC] pb-4"
                      >
                        <div className="relative h-16 w-16 flex-shrink-0 border border-[#E8E5DC] bg-[#F5F4EE]">
                          <ShimmerImage
                            src={primaryImage}
                            alt={item.product.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <span className="label-luxury block text-[9px]">
                            {item.product.brand?.name || "Luxusmarke"}
                          </span>
                          <h4 className="truncate font-serif text-sm font-medium text-[#1A1A1A]">
                            {item.product.title}
                          </h4>
                          <ConditionBadge condition={item.product.condition} />

                          <div className="flex items-center gap-3 pt-1">
                            <PriceTag resalePriceCents={item.unitPriceCents} size="sm" />
                            <div className="flex items-center border border-[#E8E5DC] bg-white text-xs">
                              <button
                                onClick={() => updateItem(item.id, item.quantity - 1)}
                                className="px-2 py-0.5 hover:bg-[#F5F4EE]"
                              >
                                -
                              </button>
                              <span className="px-2 py-0.5 font-mono">{item.quantity}</span>
                              <button
                                onClick={() => updateItem(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.product.inventoryQuantity}
                                className="px-2 py-0.5 hover:bg-[#F5F4EE] disabled:opacity-30"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-[#6B6B6B] transition-colors hover:text-[#B91C1C]"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {cartItems.length > 0 && (
              <div className="space-y-3 border-t border-[#E8E5DC] pt-4">
                {/* Promo Code Form */}
                {cart?.promoCode ? (
                  <div className="flex items-center justify-between border border-[#C5A880]/40 bg-[#FAF4EB] px-3 py-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-[#C5A880]">
                      <Tag className="h-3.5 w-3.5" />
                      <span className="font-mono font-semibold text-[#1A1A1A]">
                        {cart.promoCode}
                      </span>
                    </div>
                    <button
                      onClick={removePromo}
                      className="font-mono text-[10px] text-[#B91C1C] uppercase hover:underline"
                    >
                      Entfernen
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Gutscheincode (z.B. WELCOME10)"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      className="w-full border border-[#E8E5DC] bg-white px-3 py-1.5 text-xs text-[#1A1A1A] uppercase focus:border-[#C5A880] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={promoLoading}
                      className="bg-[#1A1A1A] px-3 py-1.5 font-mono text-[10px] tracking-widest text-[#FAF9F6] uppercase transition-colors hover:bg-[#C5A880] hover:text-[#1A1A1A]"
                    >
                      Einlösen
                    </button>
                  </form>
                )}

                {/* Subtotal Breakdown */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[#6B6B6B]">
                    <span>Zwischensumme:</span>
                    <PriceTag resalePriceCents={subtotal} size="sm" />
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[#15803D]">
                      <span>Rabatt ({cart?.promoCode}):</span>
                      <span>-{(discount / 100).toFixed(2)} €</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#6B6B6B]">
                    <span>Versand (DHL Express):</span>
                    <span>{shipping === 0 ? "Gratis" : "15,00 €"}</span>
                  </div>
                  <div className="flex items-baseline justify-between border-t border-[#E8E5DC] pt-2 font-semibold text-[#1A1A1A]">
                    <span>Gesamtsumme:</span>
                    <PriceTag resalePriceCents={total} size="lg" />
                  </div>
                </div>

                <p className="font-mono text-[10px] text-[#6B6B6B]">
                  Inkl. 19% MwSt. ({((cart?.taxCents || 0) / 100).toFixed(2)} €)
                </p>

                <Link href="/cart" onClick={closeCartDrawer} className="block w-full">
                  <LuxuryButton variant="dark" size="md" className="mb-2 w-full">
                    Warenkorb Bearbeiten
                  </LuxuryButton>
                </Link>

                <Link href="/checkout" onClick={closeCartDrawer} className="block w-full">
                  <LuxuryButton variant="gold" size="lg" shimmer className="w-full">
                    Zur Kasse <ArrowRight className="ml-2 h-4 w-4" />
                  </LuxuryButton>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
