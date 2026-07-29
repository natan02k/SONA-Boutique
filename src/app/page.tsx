"use client";

import { useEffect, useState } from "react";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { KenBurnsImage } from "@/components/motion/KenBurnsImage";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { GoldDivider } from "@/components/luxury/GoldDivider";
import { PriceTag } from "@/components/luxury/PriceTag";
import { ConditionBadge } from "@/components/luxury/ConditionBadge";
import { LuxuryBadge } from "@/components/luxury/LuxuryBadge";
import { ShimmerImage } from "@/components/luxury/ShimmerImage";
import { ShieldCheck, Truck, RefreshCw, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";

type FeaturedProduct = {
  id: string;
  slug: string;
  title: string;
  brand: { name: string };
  condition: string;
  resalePriceCents: number;
  compareAtPriceCents: number | null;
  retailPriceCents: number | null;
  images: { url: string; altText: string | null }[];
};

export default function HomePage() {
  const { addItem } = useCartStore();
  const { openCartDrawer } = useUIStore();

  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [heroProduct, setHeroProduct] = useState<FeaturedProduct | null>(null);

  useEffect(() => {
    fetch("/api/products?sort=featured&limit=4")
      .then((r) => r.json())
      .then((data) => {
        const products: FeaturedProduct[] = data.products || [];
        setFeaturedProducts(products);
        if (products.length > 0) setHeroProduct(products[0] ?? null);
      })
      .catch(() => {});
  }, []);

  const handleAddToCart = async (product: FeaturedProduct) => {
    try {
      await addItem(product.id, 1);
      openCartDrawer();
    } catch {
      // Error in store
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="container-luxury grid items-center gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <RevealOnScroll direction="up" delay={0.1}>
              <span className="label-luxury">Pre-Owned Luxury Handbags</span>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={0.2}>
              <h2 className="text-primary font-serif text-4xl leading-[1.1] font-light tracking-tight sm:text-6xl lg:text-7xl">
                Kuratierte Luxusikonen im Zweitmarkt.
              </h2>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={0.3}>
              <p className="text-muted-foreground max-w-xl text-sm leading-relaxed font-normal sm:text-base">
                Handverlesene Einzelstücke von Chanel, Hermès und Louis Vuitton — von unabhängigen
                Experten auf 100% Authentizität geprüft.
              </p>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={0.4}>
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <MagneticButton>
                  <LuxuryButton
                    variant="gold"
                    size="lg"
                    shimmer
                    disabled={!heroProduct}
                    onClick={() => heroProduct && handleAddToCart(heroProduct)}
                  >
                    In den Warenkorb <ArrowRight className="ml-2 h-4 w-4" />
                  </LuxuryButton>
                </MagneticButton>
                <LuxuryButton variant="outline" size="lg">
                  Echtheitsgarantie
                </LuxuryButton>
              </div>
            </RevealOnScroll>
          </div>

          <div className="lg:col-span-5">
            <RevealOnScroll direction="left" delay={0.3}>
              <div className="border-border relative aspect-[4/5] border shadow-xl">
                {heroProduct ? (
                  <>
                    <KenBurnsImage
                      src={heroProduct.images[0]?.url || ""}
                      alt={heroProduct.title}
                      fill
                      priority
                    />
                    <div className="border-border absolute right-6 bottom-6 left-6 border bg-white/90 p-4 backdrop-blur-md">
                      <span className="label-luxury mb-1 block">Featured Piece</span>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-primary font-serif text-lg">{heroProduct.title}</p>
                          <ConditionBadge condition={heroProduct.condition} />
                        </div>
                        <PriceTag resalePriceCents={heroProduct.resalePriceCents} size="md" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center bg-[#F5F4EE]">
                    <span className="font-mono text-xs text-[#6B6B6B]">Loading…</span>
                  </div>
                )}
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      <div className="container-luxury">
        <GoldDivider withDiamond />
      </div>

      {/* Featured Collection Grid */}
      <section id="kollektion" className="py-16">
        <div className="container-luxury space-y-12">
          <RevealOnScroll direction="up">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <span className="label-luxury">Kollektion</span>
                <h3 className="heading-luxury mt-1 text-3xl sm:text-4xl">
                  Neu Eingetroffene Unikate
                </h3>
              </div>
              <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
                Jedes Stück existiert nur 1x auf Lager
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product, idx) => (
              <RevealOnScroll key={product.id} delay={idx * 0.1} direction="up">
                <div className="group bg-card border-border hover:border-accent border p-4 transition-all duration-300 hover:shadow-lg">
                  <div className="relative mb-4 aspect-square overflow-hidden">
                    <ShimmerImage
                      src={product.images[0]?.url || ""}
                      alt={product.images[0]?.altText || product.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      <ConditionBadge condition={product.condition} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="label-luxury">{product.brand.name}</p>
                    <h4 className="text-primary truncate font-serif text-lg">{product.title}</h4>
                    <PriceTag
                      resalePriceCents={product.resalePriceCents}
                      compareAtPriceCents={product.compareAtPriceCents}
                      retailPriceCents={product.retailPriceCents}
                    />

                    <div className="pt-3">
                      <LuxuryButton
                        variant="dark"
                        size="sm"
                        className="w-full"
                        onClick={() => handleAddToCart(product)}
                      >
                        In den Warenkorb
                      </LuxuryButton>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Promises Section */}
      <section id="versprechen" className="border-border border-y bg-[#F5F4EE] py-20">
        <div className="container-luxury">
          <RevealOnScroll direction="up">
            <div className="mx-auto mb-16 max-w-2xl space-y-3 text-center">
              <span className="label-luxury">Echtheitsgarantie</span>
              <h3 className="heading-luxury text-3xl sm:text-4xl">Das SONA Boutique Versprechen</h3>
              <p className="text-muted-foreground text-xs">
                Sicherheit und Transparenz beim Kauf gebrauchter Luxusgüter.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid gap-8 md:grid-cols-3">
            <RevealOnScroll delay={0.1} direction="up">
              <div className="border-border space-y-4 border bg-white p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-none border border-[#C5A880]/40 bg-[#FAF9F6] text-[#C5A880]">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h4 className="text-primary font-serif text-xl">Physische Echtheitsprüfung</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Jedes Produkt wird von zertifizierten Gutachtern Seriennummer für Seriennummer und
                  Naht für Naht analysiert.
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.2} direction="up">
              <div className="border-border space-y-4 border bg-white p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-none border border-[#C5A880]/40 bg-[#FAF9F6] text-[#C5A880]">
                  <Truck className="h-6 w-6" />
                </div>
                <h4 className="text-primary font-serif text-xl">Versicherter Expressversand</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Versand via DHL Express mit Wertversicherung bis 25.000 €. Kostenlos ab 500 €
                  Bestellwert.
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.3} direction="up">
              <div className="border-border space-y-4 border bg-white p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-none border border-[#C5A880]/40 bg-[#FAF9F6] text-[#C5A880]">
                  <RefreshCw className="h-6 w-6" />
                </div>
                <h4 className="text-primary font-serif text-xl">14 Tage Widerrufsrecht</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Testen Sie Ihre Traumhandtasche in Ruhe zu Hause mit voller
                  Rückerstattungsgarantie.
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </div>
  );
}
