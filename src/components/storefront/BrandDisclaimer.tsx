import { ShieldCheck } from "lucide-react";

type BrandDisclaimerProps = {
  className?: string;
};

export function BrandDisclaimer({ className = "" }: BrandDisclaimerProps) {
  return (
    <div className={`space-y-2 border border-[#E8E5DC] bg-[#FAF9F6] p-6 text-xs ${className}`}>
      <div className="flex items-center gap-2 text-[11px] font-semibold text-[#C5A880]">
        <ShieldCheck className="h-4 w-4 flex-shrink-0" />
        <span>Markenrechtlicher Hinweis & Unabhängigkeitsgarantie</span>
      </div>
      <p className="text-[11px] leading-relaxed text-[#6B6B6B]">
        SONA Boutique ist ein unabhängiger Reseller zertifizierter Pre-Owned Luxusartikel. Es
        besteht keine direkte Kooperation, Autorisierung oder offizielle Handelspartnerschaft mit
        den genannten Modehäusern (wie Hermès, Chanel, Louis Vuitton, Bottega Veneta, Dior, Gucci
        u.a.). Alle genannten Markenrechte und geistigen Eigentumsrechte verbleiben uneingeschränkt
        bei den jeweiligen Rechteinhabern.
      </p>
    </div>
  );
}
