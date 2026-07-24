"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/ui-store";
import { useCartStore } from "@/store/cart-store";
import { ShimmerImage } from "@/components/luxury/ShimmerImage";
import { PriceTag } from "@/components/luxury/PriceTag";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { ConditionBadge } from "@/components/luxury/ConditionBadge";
import { X, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { EASE_LUXURY } from "@/lib/motion-presets";

export function CartDrawer() {
  const { isCartDrawerOpen, closeCartDrawer } = useUIStore();
  const { items, removeItem, updateQuantity, getSubtotalCents } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartDrawerOpen) {
        closeCartDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartDrawerOpen, closeCartDrawer]);

  const subtotal = mounted ? getSubtotalCents() : 0;
  const cartItems = mounted ? items : [];

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
              <div className="mb-6 flex items-center justify-between border-b border-[#E8E5DC] pb-4">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 text-[#C5A880]" />
                  <h3 className="font-serif text-xl tracking-tight text-[#1A1A1A]">
                    Warenkorb ({cartItems.length})
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
                <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-2">
                  {cartItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between gap-4 border-b border-[#E8E5DC] pb-4"
                    >
                      <div className="relative h-20 w-20 flex-shrink-0 border border-[#E8E5DC] bg-[#F5F4EE]">
                        <ShimmerImage
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <span className="label-luxury block text-[9px]">{item.brandName}</span>
                        <h4 className="truncate font-serif text-sm font-medium text-[#1A1A1A]">
                          {item.title}
                        </h4>
                        <ConditionBadge condition={item.condition} />

                        <div className="flex items-center gap-3 pt-1">
                          <PriceTag resalePriceCents={item.priceCents} size="sm" />
                          <div className="flex items-center border border-[#E8E5DC] text-xs">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="px-2 py-0.5 hover:bg-[#F5F4EE]"
                            >
                              -
                            </button>
                            <span className="px-2 py-0.5 font-mono">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="px-2 py-0.5 hover:bg-[#F5F4EE]"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-2 text-[#6B6B6B] transition-colors hover:text-[#B91C1C]"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Subtotal & Checkout CTA */}
            {cartItems.length > 0 && (
              <div className="space-y-4 border-t border-[#E8E5DC] pt-6">
                <div className="flex items-baseline justify-between">
                  <span className="label-luxury">Zwischensumme</span>
                  <PriceTag resalePriceCents={subtotal} size="lg" />
                </div>
                <p className="font-mono text-[10px] text-[#6B6B6B]">
                  Inkl. MwSt., kostenfreier DHL Express Versand
                </p>

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
