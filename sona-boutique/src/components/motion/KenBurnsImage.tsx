"use client";

import { motion } from "framer-motion";
import Image, { ImageProps } from "next/image";
import { useState } from "react";

type KenBurnsImageProps = ImageProps & {
  className?: string;
  duration?: number;
};

export function KenBurnsImage({
  className = "",
  duration = 20,
  alt,
  ...props
}: KenBurnsImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
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
          onLoad={() => setIsLoaded(true)}
          className={`h-full w-full object-cover transition-opacity duration-700 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      </motion.div>
    </div>
  );
}
