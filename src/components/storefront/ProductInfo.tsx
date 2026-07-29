import { ProductActions } from "@/components/storefront/ProductActions";
import { PriceTag } from "@/components/luxury/PriceTag";
import { ConditionBadge } from "@/components/luxury/ConditionBadge";
import { GoldDivider } from "@/components/luxury/GoldDivider";
import { LuxuryBadge } from "@/components/luxury/LuxuryBadge";
import { ShieldCheck, Truck, RefreshCw, Box, FileText, CheckCircle2 } from "lucide-react";

type ProductInfoProps = {
  product: {
    id: string;
    title: string;
    subtitle?: string | null;
    description: string;
    sku: string;
    condition: string;
    conditionNotes?: string | null;
    isAuthenticityVerified: boolean;
    authenticityCertNo?: string | null;
    certificateUrl?: string | null;
    includesOriginalBox: boolean;
    includesDustBag: boolean;
    includesReceipt: boolean;
    includesAuthenticityCard: boolean;
    material?: string | null;
    color?: string | null;
    hardware?: string | null;
    manufacturingYear?: number | null;
    originCountry?: string | null;
    resalePriceCents: number;
    compareAtPriceCents?: number | null;
    retailPriceCents?: number | null;
    inventoryQuantity: number;
    brand: { name: string; slug: string };
    primaryImage: string;
  };
};

export function ProductInfo({ product }: ProductInfoProps) {
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="space-y-2">
        <span className="label-luxury text-xs text-[#C5A880]">{product.brand.name}</span>
        <h1 className="font-serif text-3xl leading-tight font-light text-[#1A1A1A] sm:text-4xl">
          {product.title}
        </h1>
        {product.subtitle && (
          <p className="text-xs font-normal text-[#6B6B6B]">{product.subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <ConditionBadge condition={product.condition} />
        {product.certificateUrl && (
          <a
            href={product.certificateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 border border-[#C5A880] bg-[#FAF4EB] px-2.5 py-1 text-[9px] font-medium tracking-wider text-[#C5A880] uppercase transition-colors hover:bg-[#C5A880] hover:text-white"
          >
            <FileText className="h-3 w-3" />
            Prüfzertifikat
          </a>
        )}
        {product.authenticityCertNo && (
          <span className="font-mono text-[9px] text-[#6B6B6B]">
            Zert.-Nr: {product.authenticityCertNo}
          </span>
        )}
      </div>

      <GoldDivider withDiamond={false} />

      {/* Pricing Area */}
      <div className="space-y-1">
        <PriceTag
          resalePriceCents={product.resalePriceCents}
          compareAtPriceCents={product.compareAtPriceCents}
          retailPriceCents={product.retailPriceCents}
          size="lg"
        />
        <p className="font-mono text-[10px] text-[#6B6B6B]">
          Inkl. 19% MwSt., kostenfreier DHL Express Versand
        </p>
        <p className="font-mono text-[10px] text-[#6B6B6B]">
          SKU: <span className="font-semibold text-[#1A1A1A]">{product.sku}</span>
        </p>
      </div>

      {/* Interactive Actions (Quantity Stepper, Add-to-Cart, Buy Now) */}
      <ProductActions
        product={{
          id: product.id,
          title: product.title,
          brandName: product.brand.name,
          priceCents: product.resalePriceCents,
          imageUrl: product.primaryImage,
          condition: product.condition,
          inventoryQuantity: product.inventoryQuantity,
        }}
      />

      {/* Inclusions Badges */}
      <div className="space-y-3 border border-[#E8E5DC] bg-white p-4">
        <span className="label-luxury block text-[10px]">Lieferumfang & Beigaben</span>
        <div className="grid grid-cols-2 gap-2 text-xs text-[#1A1A1A]">
          <div className="flex items-center gap-2">
            <Box
              className={`h-4 w-4 ${product.includesOriginalBox ? "text-[#15803D]" : "text-[#6B6B6B]/40"}`}
            />
            <span
              className={
                product.includesOriginalBox ? "font-medium" : "text-[#6B6B6B] line-through"
              }
            >
              Originalkarton
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Box
              className={`h-4 w-4 ${product.includesDustBag ? "text-[#15803D]" : "text-[#6B6B6B]/40"}`}
            />
            <span
              className={product.includesDustBag ? "font-medium" : "text-[#6B6B6B] line-through"}
            >
              Staubbeutel
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FileText
              className={`h-4 w-4 ${product.includesReceipt ? "text-[#15803D]" : "text-[#6B6B6B]/40"}`}
            />
            <span
              className={product.includesReceipt ? "font-medium" : "text-[#6B6B6B] line-through"}
            >
              Kaufbeleg
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2
              className={`h-4 w-4 ${product.includesAuthenticityCard ? "text-[#15803D]" : "text-[#6B6B6B]/40"}`}
            />
            <span
              className={
                product.includesAuthenticityCard ? "font-medium" : "text-[#6B6B6B] line-through"
              }
            >
              Echtheitskarte
            </span>
          </div>
        </div>
      </div>

      {/* Prüfzertifikat (externer Dienstleister) */}
      {(product.certificateUrl || product.authenticityCertNo) && (
        <div className="space-y-2 border border-[#C5A880]/50 bg-[#FAF4EB] p-5">
          <div className="flex items-center gap-2 text-[#C5A880]">
            <ShieldCheck className="h-5 w-5" />
            <h3 className="font-serif text-lg font-medium text-[#1A1A1A]">
              Geprüfte Authentizität
            </h3>
          </div>
          {product.certificateUrl && (
            <a
              href={product.certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C5A880] underline hover:no-underline"
            >
              <FileText className="h-4 w-4" />
              Prüfzertifikat externer Dienstleister ansehen
            </a>
          )}
          {product.authenticityCertNo && (
            <p className="text-xs leading-relaxed text-[#6B6B6B]">
              Zertifikats-Nr:{" "}
              <span className="font-mono font-semibold text-[#1A1A1A]">
                {product.authenticityCertNo}
              </span>
            </p>
          )}
          {product.conditionNotes && (
            <p className="pt-1 text-xs text-[#1A1A1A] italic">
              &quot;{product.conditionNotes}&quot;
            </p>
          )}
        </div>
      )}

      {/* Specifications Table */}
      <div className="space-y-3 border border-[#E8E5DC] bg-white p-5">
        <span className="label-luxury block text-[10px]">Produktspezifikationen</span>
        <dl className="grid grid-cols-2 gap-y-2.5 text-xs">
          {product.material && (
            <>
              <dt className="font-mono text-[10px] text-[#6B6B6B] uppercase">Material</dt>
              <dd className="font-medium text-[#1A1A1A]">{product.material}</dd>
            </>
          )}
          {product.color && (
            <>
              <dt className="font-mono text-[10px] text-[#6B6B6B] uppercase">Farbe</dt>
              <dd className="font-medium text-[#1A1A1A]">{product.color}</dd>
            </>
          )}
          {product.hardware && (
            <>
              <dt className="font-mono text-[10px] text-[#6B6B6B] uppercase">Hardware</dt>
              <dd className="font-medium text-[#1A1A1A]">{product.hardware}</dd>
            </>
          )}
          {product.manufacturingYear && (
            <>
              <dt className="font-mono text-[10px] text-[#6B6B6B] uppercase">Baujahr</dt>
              <dd className="font-medium text-[#1A1A1A]">{product.manufacturingYear}</dd>
            </>
          )}
          {product.originCountry && (
            <>
              <dt className="font-mono text-[10px] text-[#6B6B6B] uppercase">Herstellungsland</dt>
              <dd className="font-medium text-[#1A1A1A]">{product.originCountry}</dd>
            </>
          )}
        </dl>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <span className="label-luxury block text-[10px]">Beschreibung</span>
        <p className="text-xs leading-relaxed font-normal text-[#6B6B6B]">{product.description}</p>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-3 border-t border-[#E8E5DC] pt-4">
        <div className="space-y-1 text-center">
          <Truck className="mx-auto h-4 w-4 text-[#C5A880]" />
          <span className="block font-mono text-[10px] text-[#6B6B6B] uppercase">
            Expressversand
          </span>
        </div>
        <div className="space-y-1 text-center">
          <RefreshCw className="mx-auto h-4 w-4 text-[#C5A880]" />
          <span className="block font-mono text-[10px] text-[#6B6B6B] uppercase">
            14 Tage Rückgabe
          </span>
        </div>
        <div className="space-y-1 text-center">
          <ShieldCheck className="mx-auto h-4 w-4 text-[#C5A880]" />
          <span className="block font-mono text-[10px] text-[#6B6B6B] uppercase">
            Full Security
          </span>
        </div>
      </div>
    </div>
  );
}
