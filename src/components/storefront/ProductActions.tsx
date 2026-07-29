"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { useCartStore } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
import { trackClientEvent } from "@/providers/PostHogProvider";
import { FavoriteButton } from "@/components/storefront/FavoriteButton";
import { ShoppingBag, Zap, Heart } from "lucide-react";

type ProductActionsProps = {
  product: {
    id: string;
    title: string;
    brandName: string;
    priceCents: number;
    imageUrl: string;
    condition: string;
    inventoryQuantity: number;
  };
};

export function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();
  const { openCartDrawer } = useUIStore();
  const router = useRouter();

  const isSoldOut = product.inventoryQuantity <= 0;

  // Track "Product Viewed" on mount
  useEffect(() => {
    trackClientEvent("Product Viewed", {
      product_id: product.id,
      product_title: product.title,
      brand: product.brandName,
      price_cents: product.priceCents,
      condition: product.condition,
    });
  }, [product.id, product.title, product.brandName, product.priceCents, product.condition]);

  const handleAddToCart = async () => {
    if (isSoldOut) return;
    try {
      await addItem(product.id, quantity);
      trackClientEvent("Add to Cart", {
        product_id: product.id,
        product_title: product.title,
        brand: product.brandName,
        price_cents: product.priceCents * quantity,
        quantity,
        condition: product.condition,
      });
      openCartDrawer();
    } catch {
      // Error handled in store
    }
  };

  const handleBuyNow = async () => {
    if (isSoldOut) return;
    try {
      await addItem(product.id, quantity);
      trackClientEvent("Buy Now", {
        product_id: product.id,
        product_title: product.title,
        brand: product.brandName,
        price_cents: product.priceCents * quantity,
        quantity,
        condition: product.condition,
      });
      router.push("/checkout");
    } catch {
      // Error handled in store
    }
  };

  if (isSoldOut) {
    return (
      <div className="border border-[#E8E5DC] bg-[#F5F4EE] p-4 text-center">
        <span className="font-serif text-lg font-medium text-[#1A1A1A]">Leider ausverkauft</span>
        <p className="mt-1 font-mono text-xs text-[#6B6B6B]">
          Dieses Einzelstück wurde bereits verkauft.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="label-luxury text-[10px]">Anzahl:</span>
        <div className="flex items-center border border-[#E8E5DC] bg-white">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="px-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#F5F4EE] disabled:opacity-30"
          >
            -
          </button>
          <span className="px-4 py-1.5 font-mono text-xs font-medium text-[#1A1A1A]">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => Math.min(product.inventoryQuantity, q + 1))}
            disabled={quantity >= product.inventoryQuantity}
            className="px-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#F5F4EE] disabled:opacity-30"
          >
            +
          </button>
        </div>
        <span className="font-mono text-[10px] text-[#6B6B6B]">
          (Nur {product.inventoryQuantity}x verfügbar)
        </span>
      </div>

      {/* Favorites Button */}
      <div className="flex items-center justify-center gap-2 border border-[#E8E5DC] bg-white p-3">
        <FavoriteButton productId={product.id} size="md" />
        <span className="font-mono text-[10px] text-[#6B6B6B]">
          Zur Merkliste hinzufügen
        </span>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
        <LuxuryButton variant="gold" size="lg" shimmer onClick={handleAddToCart} className="w-full">
          <ShoppingBag className="mr-2 h-4 w-4" /> In den Warenkorb
        </LuxuryButton>

        <LuxuryButton variant="dark" size="lg" onClick={handleBuyNow} className="w-full">
          <Zap className="mr-2 h-4 w-4" /> Jetzt Kaufen
        </LuxuryButton>
      </div>
    </div>
  );
}
