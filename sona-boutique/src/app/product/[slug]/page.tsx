import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { ProductGallery } from "@/components/storefront/ProductGallery";
import { ProductActions } from "@/components/storefront/ProductActions";
import { PriceTag } from "@/components/luxury/PriceTag";
import { ConditionBadge } from "@/components/luxury/ConditionBadge";
import { GoldDivider } from "@/components/luxury/GoldDivider";
import { LuxuryBadge } from "@/components/luxury/LuxuryBadge";
import { ShieldCheck, Truck, RefreshCw, Box, FileText, CheckCircle2, Star } from "lucide-react";

export const revalidate = 60; // ISR revalidate 60 seconds

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    include: { brand: true, images: true },
  });

  if (!product || product.status !== "PUBLISHED") {
    return {
      title: "Produkt nicht gefunden | SONA Boutique",
    };
  }

  const primaryImage = product.images[0]?.url;

  return {
    title: `${product.title} — ${product.brand.name} | SONA Boutique`,
    description: product.description.substring(0, 160),
    openGraph: {
      title: `${product.title} — ${product.brand.name}`,
      description: product.description.substring(0, 160),
      images: primaryImage ? [{ url: primaryImage }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const product = await db.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: true,
      images: {
        orderBy: { position: "asc" },
      },
      reviews: {
        where: { isVerified: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product || product.status !== "PUBLISHED") {
    notFound();
  }

  const primaryImage =
    product.images[0]?.url ||
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-6 pb-24">
      <div className="container-luxury space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-[#6B6B6B] uppercase">
          <Link href="/" className="hover:text-[#1A1A1A]">
            Home
          </Link>
          <span>/</span>
          <Link href={`/catalog?brand=${product.brand.slug}`} className="hover:text-[#1A1A1A]">
            {product.brand.name}
          </Link>
          <span>/</span>
          <span className="max-w-xs truncate text-[#1A1A1A]">{product.title}</span>
        </nav>

        {/* Main Product Layout (2 Columns) */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} title={product.title} />
          </div>

          {/* Right Column: Product Information & Actions */}
          <div className="space-y-6 lg:col-span-5">
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
              {product.isAuthenticityVerified && (
                <LuxuryBadge variant="gold">Echtheit Verifiziert</LuxuryBadge>
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
                imageUrl: primaryImage,
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
                    className={
                      product.includesDustBag ? "font-medium" : "text-[#6B6B6B] line-through"
                    }
                  >
                    Staubbeutel
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText
                    className={`h-4 w-4 ${product.includesReceipt ? "text-[#15803D]" : "text-[#6B6B6B]/40"}`}
                  />
                  <span
                    className={
                      product.includesReceipt ? "font-medium" : "text-[#6B6B6B] line-through"
                    }
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
                      product.includesAuthenticityCard
                        ? "font-medium"
                        : "text-[#6B6B6B] line-through"
                    }
                  >
                    Echtheitskarte
                  </span>
                </div>
              </div>
            </div>

            {/* Authenticity Certificate Box */}
            {product.authenticityCertNo && (
              <div className="space-y-2 border border-[#C5A880]/50 bg-[#FAF4EB] p-5">
                <div className="flex items-center gap-2 text-[#C5A880]">
                  <ShieldCheck className="h-5 w-5" />
                  <h3 className="font-serif text-lg font-medium text-[#1A1A1A]">
                    SONA Echtheitszertifikat
                  </h3>
                </div>
                <p className="text-xs leading-relaxed text-[#6B6B6B]">
                  Zertifikats-Nr:{" "}
                  <span className="font-mono font-semibold text-[#1A1A1A]">
                    {product.authenticityCertNo}
                  </span>
                </p>
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
                    <dt className="font-mono text-[10px] text-[#6B6B6B] uppercase">
                      Herstellungsland
                    </dt>
                    <dd className="font-medium text-[#1A1A1A]">{product.originCountry}</dd>
                  </>
                )}
              </dl>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <span className="label-luxury block text-[10px]">Beschreibung</span>
              <p className="text-xs leading-relaxed font-normal text-[#6B6B6B]">
                {product.description}
              </p>
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
        </div>

        {/* Reviews Section */}
        <section className="space-y-6 border-t border-[#E8E5DC] pt-16">
          <div className="flex items-center justify-between">
            <div>
              <span className="label-luxury block">Kundenmeinungen</span>
              <h3 className="font-serif text-2xl text-[#1A1A1A]">Verifizierte Bewertungen</h3>
            </div>
            <div className="flex items-center gap-1 text-[#C5A880]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-[#C5A880]" />
              ))}
              <span className="ml-2 font-mono text-xs text-[#1A1A1A]">5.0 / 5.0</span>
            </div>
          </div>

          {product.reviews.length === 0 ? (
            <div className="border border-[#E8E5DC] bg-white p-8 text-center text-xs text-[#6B6B6B]">
              Noch keine Bewertungen für diese Tasche abgegeben.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {product.reviews.map((rev) => (
                <div key={rev.id} className="space-y-3 border border-[#E8E5DC] bg-white p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#1A1A1A]">{rev.authorName}</span>
                    <LuxuryBadge variant="green">Verifizierter Kauf</LuxuryBadge>
                  </div>
                  <div className="flex text-[#C5A880]">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-[#C5A880]" />
                    ))}
                  </div>
                  {rev.title && <h4 className="font-serif text-sm font-medium">{rev.title}</h4>}
                  <p className="text-xs leading-relaxed text-[#6B6B6B]">{rev.body}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
