"use client";

import { useState } from "react";
import Link from "next/link";
import { ShimmerImage } from "@/components/luxury/ShimmerImage";
import { PriceTag } from "@/components/luxury/PriceTag";
import { ConditionBadge } from "@/components/luxury/ConditionBadge";
import { LuxuryBadge } from "@/components/luxury/LuxuryBadge";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";

type ProductCardProps = {
  product: {
    id: string;
    slug: string;
    title: string;
    brand: { name: string; slug: string };
    condition: string;
    resalePriceCents: number;
    compareAtPriceCents?: number | null;
    retailPriceCents?: number | null;
    isFeatured?: boolean;
    images?: Array<{ id: string; url: string; altText?: string | null }>;
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCartStore();
  const { openCartDrawer } = useUIStore();

  const primaryImage =
    product.images && product.images.length > 0
      ? product.images[0]?.url
      : "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop";

  const secondaryImage =
    product.images && product.images.length > 1 ? product.images[1]?.url : primaryImage;

  const discountPercent =
    product.compareAtPriceCents && product.compareAtPriceCents > product.resalePriceCents
      ? Math.round(
          ((product.compareAtPriceCents - product.resalePriceCents) / product.compareAtPriceCents) *
            100,
        )
      : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      title: product.title,
      brandName: product.brand.name,
      priceCents: product.resalePriceCents,
      imageUrl: primaryImage!,
      condition: product.condition,
    });
    openCartDrawer();
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex flex-col justify-between border border-[#E8E5DC] bg-white p-4 transition-all duration-300 hover:border-[#C5A880] hover:shadow-xl"
    >
      <div>
        {/* Image Area */}
        <Link
          href={`/product/${product.slug}`}
          className="relative mb-4 block aspect-square overflow-hidden bg-[#F5F4EE]"
        >
          <ShimmerImage
            src={isHovered && secondaryImage ? secondaryImage : primaryImage!}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            {product.isFeatured && <LuxuryBadge variant="gold">Featured</LuxuryBadge>}
            {discountPercent && (
              <span className="bg-[#B91C1C] px-2 py-0.5 font-mono text-[9px] tracking-widest text-[#FAF9F6] uppercase">
                -{discountPercent}%
              </span>
            )}
            <ConditionBadge condition={product.condition} />
          </div>

          {/* Quick Add Overlay on Hover */}
          <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <button
              onClick={handleQuickAdd}
              className="flex w-full items-center justify-center gap-2 bg-[#1A1A1A] px-3 py-2.5 text-[10px] font-medium tracking-widest text-[#FAF9F6] uppercase transition-colors hover:bg-[#C5A880] hover:text-[#1A1A1A]"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Schnell Hinzufügen</span>
            </button>
          </div>
        </Link>

        {/* Product Details */}
        <div className="space-y-1.5">
          <span className="label-luxury text-[9px]">{product.brand.name}</span>
          <Link href={`/product/${product.slug}`} className="block">
            <h4 className="truncate font-serif text-lg font-medium text-[#1A1A1A] transition-colors hover:text-[#C5A880]">
              {product.title}
            </h4>
          </Link>
        </div>
      </div>

      {/* Price & Action Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-[#E8E5DC] pt-3">
        <PriceTag
          resalePriceCents={product.resalePriceCents}
          compareAtPriceCents={product.compareAtPriceCents}
          retailPriceCents={product.retailPriceCents}
          size="sm"
        />

        <Link
          href={`/product/${product.slug}`}
          className="p-1 text-[#C5A880] transition-transform hover:translate-x-1"
          aria-label="Details ansehen"
        >
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
