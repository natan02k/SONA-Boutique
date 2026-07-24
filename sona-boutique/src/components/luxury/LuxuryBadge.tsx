import { ReactNode } from "react";

type LuxuryBadgeProps = {
  children: ReactNode;
  variant?: "default" | "gold" | "green" | "stone";
  className?: string;
};

export function LuxuryBadge({ children, variant = "default", className = "" }: LuxuryBadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "gold":
        return "bg-[#C5A880]/15 text-[#A4875E] border-[#C5A880]/40";
      case "green":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "stone":
        return "bg-[#F5F4EE] text-[#6B6B6B] border-[#E8E5DC]";
      case "default":
      default:
        return "bg-[#1A1A1A] text-[#FAF9F6] border-[#1A1A1A]";
    }
  };

  return (
    <span
      className={`inline-flex items-center border px-2 py-0.5 font-mono text-[9px] font-medium tracking-[0.15em] uppercase ${getVariantStyles()} ${className}`}
    >
      {children}
    </span>
  );
}
