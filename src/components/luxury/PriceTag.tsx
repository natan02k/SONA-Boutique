type PriceTagProps = {
  resalePriceCents: number;
  compareAtPriceCents?: number | null;
  retailPriceCents?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function PriceTag({
  resalePriceCents,
  compareAtPriceCents,
  retailPriceCents,
  size = "md",
  className = "",
}: PriceTagProps) {
  const formatEuro = (cents: number) => {
    return (cents / 100).toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-sm font-semibold";
      case "md":
        return "text-base font-semibold";
      case "lg":
        return "text-2xl font-light font-serif tracking-tight";
      default:
        return "text-base font-semibold";
    }
  };

  return (
    <div className={`inline-flex flex-wrap items-baseline gap-2 ${className}`}>
      {/* Resale Price */}
      <span className={`text-[#1A1A1A] ${getSizeClasses()}`}>{formatEuro(resalePriceCents)}</span>

      {/* Compare At Price (Strike-through) */}
      {compareAtPriceCents && compareAtPriceCents > resalePriceCents && (
        <span className="text-xs font-normal text-[#6B6B6B] line-through">
          {formatEuro(compareAtPriceCents)}
        </span>
      )}

      {/* Retail Price Hint */}
      {retailPriceCents && (
        <span className="font-mono text-[11px] text-[#6B6B6B]">
          (Neupreis ca. {formatEuro(retailPriceCents)})
        </span>
      )}
    </div>
  );
}
