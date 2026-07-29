"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { ShoppingBag } from "lucide-react";

type ShimmerImageProps = ImageProps & {
  wrapperClassName?: string;
};

export function ShimmerImage({
  wrapperClassName = "",
  className = "",
  alt,
  onLoad,
  onError,
  ...props
}: ShimmerImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-[#F5F4EE] ${wrapperClassName}`}>
      {/* Shimmer loading background */}
      {!isLoaded && !hasError && (
        <div className="animate-shimmer pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-[#F5F4EE] via-[#E8E5DC] to-[#F5F4EE] bg-[length:200%_100%]" />
      )}

      {/* Luxury Fallback graphic if image fails to load */}
      {hasError ? (
        <div className="flex h-full w-full flex-col items-center justify-center border border-[#E8E5DC] bg-gradient-to-br from-[#FAF9F6] via-[#F5F4EE] to-[#E8E5DC] p-6 text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center border border-[#C5A880]/50 bg-white text-[#C5A880]">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <span className="font-serif text-sm tracking-widest text-[#1A1A1A]">SONA BOUTIQUE</span>
          <span className="font-mono text-[9px] tracking-widest text-[#6B6B6B] uppercase">
            Luxury Handbag
          </span>
        </div>
      ) : (
        <Image
          {...props}
          alt={alt}
          unoptimized
          onLoad={(e) => {
            setIsLoaded(true);
            if (onLoad) onLoad(e);
          }}
          onError={(e) => {
            setHasError(true);
            setIsLoaded(true);
            if (onError) onError(e);
          }}
          className={`transition-opacity duration-700 ease-out ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
        />
      )}
    </div>
  );
}
