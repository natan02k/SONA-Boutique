"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import { ShimmerImage } from "@/components/luxury/ShimmerImage";
import { PriceTag } from "@/components/luxury/PriceTag";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { ConditionBadge } from "@/components/luxury/ConditionBadge";
import {
  Trash2,
  ShoppingBag,
  ArrowRight,
  Tag,
  ShieldCheck,
  Truck,
  RefreshCw,
  X,
  AlertCircle,
} from "lucide-react";
import { QuantityStepper } from "@/components/storefront/QuantityStepper";
import { PLACEHOLDER_IMAGE } from "@/lib/placeholder";
import { trackClientEvent } from "@/providers/PostHogProvider";

export default function CartPage() {
  const { cart, fetchCart, updateItem, removeItem, applyPromo, removePromo, error, clearError } =
    useCartStore();
  const [mounted, setMounted] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string | null>(null);
  const cartTracked = useRef(false);

  useEffect(() => {
    setMounted(true);
    fetchCart();
  }, [fetchCart]);

  // Track "Cart Viewed" once when cart loads
  useEffect(() => {
    if (!mounted || !cart || cartTracked.current) return;
    if (cart.items.length === 0) return;

    cartTracked.current = true;
    trackClientEvent("Cart Viewed", {
      item_count: cart.items.length,
      cart_value_cents: cart.subtotalCents,
      promo_code: cart.promoCode || undefined,
    });
  }, [mounted, cart]);

  const cartItems = mounted ? cart?.items || [] : [];
  const subtotal = cart?.subtotalCents || 0;
  const shipping = cart?.shippingCents || 0;
  const discount = cart?.discountCents || 0;
  const tax = cart?.taxCents || 0;
  const total = cart?.totalCents || 0;

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;
    try {
      setPromoLoading(true);
      setPromoSuccessMsg(null);
      await applyPromo(promoCodeInput.trim());
      setPromoSuccessMsg(
        `Gutscheincode ${promoCodeInput.trim().toUpperCase()} erfolgreich eingelöst!`,
      );
      setPromoCodeInput("");
    } catch {
      // Error in store
    } finally {
      setPromoLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FAF9F6]">
        <span className="font-mono text-xs text-[#6B6B6B]">Warenkorb wird geladen...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-8 pb-24">
      <div className="container-luxury space-y-8">
        {/* Page Header */}
        <div className="space-y-2 border-b border-[#E8E5DC] pb-6">
          <span className="label-luxury text-xs">Einkaufstasche</span>
          <h1 className="font-serif text-3xl font-light text-[#1A1A1A] sm:text-5xl">
            Ihr Warenkorb
          </h1>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="flex items-center justify-between border border-[#B91C1C]/30 bg-[#B91C1C]/10 p-4 text-xs text-[#B91C1C]">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
            <button onClick={clearError} className="p-1 hover:opacity-80">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Empty State */}
        {cartItems.length === 0 ? (
          <div className="mx-auto my-12 max-w-2xl space-y-6 border border-[#E8E5DC] bg-white p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center border border-[#C5A880]/30 bg-[#F5F4EE] text-[#C5A880]">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl text-[#1A1A1A]">Ihr Warenkorb ist aktuell leer</h2>
              <p className="mx-auto max-w-md text-xs leading-relaxed text-[#6B6B6B]">
                Entdecken Sie zertifizierte Unikate von Hermès, Chanel, Louis Vuitton und weiteren
                Luxusmodemarken.
              </p>
            </div>
            <div>
              <Link href="/catalog">
                <LuxuryButton variant="gold" size="lg" shimmer>
                  Kollektion Entdecken
                </LuxuryButton>
              </Link>
            </div>
          </div>
        ) : (
          /* Main Cart Content Grid */
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
            {/* Left: Items List */}
            <div className="space-y-4 lg:col-span-8">
              <div className="divide-y divide-[#E8E5DC] border border-[#E8E5DC] bg-white">
                {cartItems.map((item) => {
                  const primaryImage =
                    item.product.images[0]?.url ||
                    PLACEHOLDER_IMAGE;

                  const isSinglePiece = item.product.inventoryQuantity === 1;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col items-start justify-between gap-6 p-6 sm:flex-row"
                    >
                      {/* Image Thumbnail */}
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="group relative h-24 w-24 flex-shrink-0 overflow-hidden border border-[#E8E5DC] bg-[#F5F4EE]"
                      >
                        <ShimmerImage
                          src={primaryImage}
                          alt={item.product.title}
                          fill
                          sizes="96px"
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </Link>

                      {/* Details */}
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <span className="label-luxury text-[9px]">
                            {item.product.brand?.name || "Luxusmarke"}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="flex items-center gap-1 text-xs text-[#6B6B6B] transition-colors hover:text-[#B91C1C]"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Entfernen</span>
                          </button>
                        </div>

                        <Link href={`/product/${item.product.slug}`}>
                          <h3 className="truncate font-serif text-lg font-medium text-[#1A1A1A] transition-colors hover:text-[#C5A880]">
                            {item.product.title}
                          </h3>
                        </Link>

                        <div className="flex items-center gap-3">
                          <ConditionBadge condition={item.product.condition} />
                          {isSinglePiece && (
                            <span className="font-mono text-[9px] font-semibold text-[#B91C1C] uppercase">
                              Einzelstück — Nur 1 verfügbar
                            </span>
                          )}
                        </div>

                        <p className="font-mono text-[10px] text-[#6B6B6B]">
                          SKU: {item.product.sku}
                        </p>
                      </div>

                      {/* Quantity & Price */}
                      <div className="flex w-full items-center justify-between gap-4 border-t border-[#E8E5DC] pt-2 sm:w-auto sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                        <PriceTag
                          resalePriceCents={item.unitPriceCents * item.quantity}
                          size="md"
                        />

                        <QuantityStepper
                          value={item.quantity}
                          min={1}
                          max={item.product.inventoryQuantity}
                          onChange={(newQty) => updateItem(item.id, newQty)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Security Banner */}
              <div className="grid grid-cols-1 gap-4 border border-[#E8E5DC] bg-white p-4 text-center sm:grid-cols-3">
                <div className="flex items-center justify-center gap-2 text-xs text-[#6B6B6B]">
                  <Truck className="h-4 w-4 text-[#C5A880]" />
                  <span>Versicherter DHL Express Versand</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-[#6B6B6B]">
                  <ShieldCheck className="h-4 w-4 text-[#C5A880]" />
                  <span>Certified Authenticity</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-[#6B6B6B]">
                  <RefreshCw className="h-4 w-4 text-[#C5A880]" />
                  <span>14 Tage Rückgaberecht</span>
                </div>
              </div>
            </div>

            {/* Right: Summary Box */}
            <div className="space-y-6 lg:col-span-4">
              <div className="space-y-6 border border-[#E8E5DC] bg-white p-6">
                <h3 className="border-b border-[#E8E5DC] pb-4 font-serif text-xl text-[#1A1A1A]">
                  Bestellübersicht
                </h3>

                {/* Promo Code Form */}
                <div className="space-y-3">
                  <span className="label-luxury block text-[10px]">Gutscheincode</span>
                  {cart?.promoCode ? (
                    <div className="flex items-center justify-between border border-[#C5A880]/40 bg-[#FAF4EB] p-3 text-xs">
                      <div className="flex items-center gap-2 text-[#C5A880]">
                        <Tag className="h-4 w-4" />
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
                        placeholder="Gutscheincode eingeben"
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value)}
                        className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] uppercase focus:border-[#C5A880] focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={promoLoading}
                        className="bg-[#1A1A1A] px-4 py-2 font-mono text-[10px] tracking-widest text-[#FAF9F6] uppercase transition-colors hover:bg-[#C5A880] hover:text-[#1A1A1A]"
                      >
                        Anwenden
                      </button>
                    </form>
                  )}

                  {promoSuccessMsg && (
                    <p className="font-mono text-xs text-[#15803D]">{promoSuccessMsg}</p>
                  )}

                  <p className="font-mono text-[10px] text-[#6B6B6B]">
                    Test-Codes: <span className="font-semibold text-[#1A1A1A]">WELCOME10</span> (10%
                    ab 500€), <span className="font-semibold text-[#1A1A1A]">VIP500</span> (500€ ab
                    5.000€)
                  </p>
                </div>

                {/* Price Breakdown */}
                <dl className="space-y-3 border-t border-[#E8E5DC] pt-4 text-xs">
                  <div className="flex justify-between text-[#6B6B6B]">
                    <dt>Zwischensumme</dt>
                    <dd className="font-mono font-medium text-[#1A1A1A]">
                      {(subtotal / 100).toLocaleString("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </dd>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-[#15803D]">
                      <dt>Rabatt ({cart?.promoCode})</dt>
                      <dd className="font-mono font-medium">
                        -
                        {(discount / 100).toLocaleString("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </dd>
                    </div>
                  )}

                  <div className="flex justify-between text-[#6B6B6B]">
                    <dt>Versand (DHL Express)</dt>
                    <dd className="font-mono font-medium text-[#1A1A1A]">
                      {shipping === 0 ? "Kostenfrei" : "15,00 €"}
                    </dd>
                  </div>

                  <div className="flex items-baseline justify-between border-t border-[#E8E5DC] pt-3">
                    <dt className="font-serif text-lg text-[#1A1A1A]">Gesamtsumme</dt>
                    <dd className="font-mono text-xl font-bold text-[#1A1A1A]">
                      {(total / 100).toLocaleString("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </dd>
                  </div>
                </dl>

                <p className="font-mono text-[10px] text-[#6B6B6B]">
                  Enthält 19% MwSt. (
                  {(tax / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR" })})
                </p>

                {/* Checkout CTA */}
                <Link href="/checkout" className="block w-full">
                  <LuxuryButton variant="gold" size="lg" shimmer className="w-full">
                    Zur Kasse <ArrowRight className="ml-2 h-4 w-4" />
                  </LuxuryButton>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
