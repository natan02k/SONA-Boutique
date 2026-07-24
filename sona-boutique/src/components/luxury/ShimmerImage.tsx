"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";

type ShimmerImageProps = ImageProps & {
  wrapperClassName?: string;
};

export function ShimmerImage({
  wrapperClassName = "",
  className = "",
  alt,
  onLoad,
  ...props
}: ShimmerImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-[#F5F4EE] ${wrapperClassName}`}>
      {/* Shimmer loading background */}
      {!isLoaded && (
        <div className="animate-shimmer pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-[#F5F4EE] via-[#E8E5DC] to-[#F5F4EE] bg-[length:200%_100%]" />
      )}

      <Image
        {...props}
        alt={alt}
        onLoad={(e) => {
          setIsLoaded(true);
          if (onLoad) onLoad(e);
        }}
        className={`transition-opacity duration-700 ease-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        } ${className}`}
      />
    </div>
  );
}
