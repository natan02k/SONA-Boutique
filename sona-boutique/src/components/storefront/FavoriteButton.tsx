"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useFavoritesStore } from "@/store/favorites-store";
import { useAuthStore } from "@/store/auth-store";
import { Heart } from "lucide-react";

type FavoriteButtonProps = {
  productId: string;
  size?: "sm" | "md";
  className?: string;
};

export function FavoriteButton({ productId, size = "sm", className = "" }: FavoriteButtonProps) {
  const router = useRouter();
  const { customer } = useAuthStore();
  const { isFavorite, toggle } = useFavoritesStore();

  const isFav = isFavorite(productId);
  const sizeClasses = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconSize = size === "sm" ? 16 : 20;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!customer) {
      // Redirect guests to login with return URL
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/login?redirect=${returnUrl}`);
      return;
    }

    await toggle(productId);
  };

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.85 }}
      className={`${sizeClasses} flex items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md ${className}`}
      aria-label={isFav ? "Von Favoriten entfernen" : "Zu Favoriten hinzufügen"}
    >
      <motion.div
        animate={{ scale: isFav ? [1, 1.3, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={`${isFav ? "fill-[#B91C1C] text-[#B91C1C]" : "text-[#6B6B6B]"} transition-colors hover:text-[#B91C1C]`}
          size={iconSize}
        />
      </motion.div>
    </motion.button>
  );
}