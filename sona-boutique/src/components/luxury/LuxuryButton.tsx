"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";

type LuxuryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "gold" | "outline" | "dark" | "ghost";
  size?: "sm" | "md" | "lg";
  shimmer?: boolean;
  className?: string;
};

export function LuxuryButton({
  children,
  variant = "dark",
  size = "md",
  shimmer = false,
  className = "",
  disabled,
  ...props
}: LuxuryButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "gold":
        return "bg-gradient-to-r from-[#C5A880] via-[#DFCBAB] to-[#C5A880] text-[#1A1A1A] font-semibold border border-[#C5A880] shadow-sm hover:shadow-md";
      case "outline":
        return "bg-transparent text-[#1A1A1A] border border-[#C5A880] hover:bg-[#C5A880]/10";
      case "dark":
        return "bg-[#1A1A1A] text-[#FAF9F6] border border-[#1A1A1A] hover:bg-[#2A2A2A]";
      case "ghost":
        return "bg-transparent text-[#1A1A1A] border border-transparent hover:bg-[#F5F4EE]";
      default:
        return "bg-[#1A1A1A] text-[#FAF9F6]";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "px-4 py-2 text-[10px] min-h-[44px]";
      case "md":
        return "px-6 py-3 text-xs min-h-[44px]";
      case "lg":
        return "px-8 py-4 text-xs min-h-[50px]";
      default:
        return "px-6 py-3 text-xs min-h-[44px]";
    }
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center overflow-hidden font-medium tracking-widest uppercase transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${getVariantStyles()} ${getSizeStyles()} ${className}`}
      {...(props as any)}
    >
      {shimmer && variant === "gold" && (
        <span className="animate-shimmer pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent bg-[length:200%_100%]" />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
