"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { useCartStore } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
import { ShoppingBag, Zap } from "lucide-react";

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

  const handleAddToCart = () => {
    if (isSoldOut) return;
    addItem({
      productId: product.id,
      title: product.title,
      brandName: product.brandName,
      priceCents: product.priceCents,
      imageUrl: product.imageUrl,
      condition: product.condition,
      quantity,
    });
    openCartDrawer();
  };

  const handleBuyNow = () => {
    if (isSoldOut) return;
    addItem({
      productId: product.id,
      title: product.title,
      brandName: product.brandName,
      priceCents: product.priceCents,
      imageUrl: product.imageUrl,
      condition: product.condition,
      quantity,
    });
    router.push("/checkout");
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
        <span className="font-mono text-[10px] text-[#6B6B6B]">(Nur 1x verfügbar)</span>
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
