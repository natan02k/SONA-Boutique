"use client";

import { motion } from "framer-motion";
import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";

type KenBurnsImageProps = ImageProps & {
  className?: string;
  duration?: number;
};

export function KenBurnsImage({
  className = "",
  duration = 20,
  alt,
  onLoad,
  onError,
  ...props
}: KenBurnsImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-[#F5F4EE] ${className}`}>
      {hasError ? (
        <div className="flex h-full w-full flex-col items-center justify-center border border-[#E8E5DC] bg-gradient-to-br from-[#FAF9F6] via-[#F5F4EE] to-[#E8E5DC] p-8 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center border border-[#C5A880]/50 bg-white text-[#C5A880]">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <span className="font-serif text-lg tracking-widest text-[#1A1A1A]">SONA BOUTIQUE</span>
          <span className="font-mono text-[10px] tracking-widest text-[#6B6B6B] uppercase">
            Exclusive Collection
          </span>
        </div>
      ) : (
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: isLoaded ? 1.06 : 1 }}
          transition={{
            duration,
            ease: "linear",
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="h-full w-full"
        >
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
            className={`h-full w-full object-cover transition-opacity duration-700 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </motion.div>
      )}
    </div>
  );
}
