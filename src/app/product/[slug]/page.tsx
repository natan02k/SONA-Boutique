import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { PLACEHOLDER_IMAGE } from "@/lib/placeholder";
import { ProductGallery } from "@/components/storefront/ProductGallery";
import { ProductInfo } from "@/components/storefront/ProductInfo";
import { Reviews } from "@/components/storefront/Reviews";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const products = await db.product.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true },
    });
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    console.warn("[generateStaticParams] DB not reachable, returning empty");
    return [];
  }
}

function conditionToSchema(condition: string): string {
  const map: Record<string, string> = {
    PRISTINE: "https://schema.org/NewCondition",
    EXCELLENT: "https://schema.org/LikeNewCondition",
    VERY_GOOD: "https://schema.org/UsedCondition",
    GOOD: "https://schema.org/UsedCondition",
    FAIR: "https://schema.org/UsedCondition",
  };
  return map[condition] || "https://schema.org/UsedCondition";
}

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
    product.images[0]?.url || PLACEHOLDER_IMAGE;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description.substring(0, 500),
    image: product.images.map((img) => img.url),
    brand: {
      "@type": "Brand",
      name: product.brand.name,
    },
    sku: product.sku,
    mpn: product.sku,
    offers: {
      "@type": "Offer",
      price: (product.resalePriceCents / 100).toFixed(2),
      priceCurrency: product.currencyCode,
      availability:
        product.inventoryQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: conditionToSchema(product.condition),
      url: `${process.env.NEXT_PUBLIC_APP_URL || "https://sona-boutique.de"}/product/${slug}`,
    },
    ...(product.reviews.length > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: (
              product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
            ).toFixed(1),
            reviewCount: product.reviews.length,
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${process.env.NEXT_PUBLIC_APP_URL || "https://sona-boutique.de"}/` },
      { "@type": "ListItem", position: 2, name: product.brand.name, item: `${process.env.NEXT_PUBLIC_APP_URL || "https://sona-boutique.de"}/catalog?brand=${product.brand.slug}` },
      { "@type": "ListItem", position: 3, name: product.title },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
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

          {/* Right Column: Product Info & Actions */}
          <div className="lg:col-span-5">
            <ProductInfo
              product={{
                ...product,
                primaryImage,
              }}
            />
          </div>
        </div>

        {/* Reviews Section */}
        <Reviews reviews={product.reviews} />
        </div>
      </div>
    </>
  );
}
