"use client";

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

export default function HomePage() {
  const sampleProducts = [
    {
      id: "1",
      title: "Birkin 30 Gold Togo",
      brand: "Hermès",
      condition: "PRISTINE",
      priceCents: 2250000,
      compareAtCents: 2400000,
      imageUrl:
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop",
      tag: "Must-Have",
    },
    {
      id: "2",
      title: "Classic Medium Flap Bag",
      brand: "Chanel",
      condition: "EXCELLENT",
      priceCents: 890000,
      compareAtCents: 980000,
      imageUrl:
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop",
      tag: "Iconic",
    },
    {
      id: "3",
      title: "Speedy Bandoulière 25",
      brand: "Louis Vuitton",
      condition: "VERY_GOOD",
      priceCents: 145000,
      retailCents: 175000,
      imageUrl:
        "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1000&auto=format&fit=crop",
      tag: "Bestseller",
    },
    {
      id: "4",
      title: "Lady Dior Medium Cannage",
      brand: "Dior",
      condition: "PRISTINE",
      priceCents: 495000,
      imageUrl:
        "https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=1000&auto=format&fit=crop",
      tag: "Zertifiziert",
    },
  ];

  return (
    <div className="bg-background text-foreground selection:bg-accent selection:text-primary-foreground min-h-screen">
      {/* Top Banner Notice */}
      <div className="border-b border-[#C5A880]/30 bg-[#1A1A1A] px-4 py-2.5 text-center font-mono text-[11px] tracking-widest text-[#FAF9F6] uppercase">
        ✦ 100% Authentifiziert • Versicherter Expressversand • 14 Tage Rückgaberecht ✦
      </div>

      {/* Navigation Header */}
      <header className="border-border sticky top-0 z-40 border-b bg-[#FAF9F6]/90 backdrop-blur-md">
        <div className="container-luxury flex h-20 items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-primary font-serif text-2xl font-light tracking-[0.2em]">
              SONA BOUTIQUE
            </h1>
            <nav className="text-muted-foreground hidden items-center gap-6 text-xs font-medium tracking-widest uppercase md:flex">
              <a href="#kollektion" className="hover:text-primary transition-colors">
                Kollektion
              </a>
              <a href="#designer" className="hover:text-primary transition-colors">
                Designer
              </a>
              <a href="#versprechen" className="hover:text-primary transition-colors">
                Authentizität
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <LuxuryBadge variant="gold">Phase 1 Dev</LuxuryBadge>
            <LuxuryButton variant="dark" size="sm">
              Anmelden
            </LuxuryButton>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32">
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
                  <LuxuryButton variant="gold" size="lg" shimmer>
                    Kollektion Entdecken <ArrowRight className="ml-2 h-4 w-4" />
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
                <KenBurnsImage
                  src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop"
                  alt="Hermès Birkin Handbag"
                  fill
                  priority
                />
                <div className="border-border absolute right-6 bottom-6 left-6 border bg-white/90 p-4 backdrop-blur-md">
                  <span className="label-luxury mb-1 block">Featured Piece</span>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-primary font-serif text-lg">Hermès Birkin 30</p>
                      <ConditionBadge condition="PRISTINE" />
                    </div>
                    <PriceTag resalePriceCents={2250000} size="md" />
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      <div className="container-luxury">
        <GoldDivider withDiamond />
      </div>

      {/* Featured Collection Grid */}
      <section id="kollektion" className="py-20">
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

          <div className="sm:grid-[#1A1A1A] grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {sampleProducts.map((product, idx) => (
              <RevealOnScroll key={product.id} delay={idx * 0.1} direction="up">
                <div className="group bg-card border-border hover:border-accent border p-4 transition-all duration-300 hover:shadow-lg">
                  <div className="relative mb-4 aspect-square overflow-hidden">
                    <ShimmerImage
                      src={product.imageUrl}
                      alt={product.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      <LuxuryBadge variant="gold">{product.tag}</LuxuryBadge>
                      <ConditionBadge condition={product.condition} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="label-luxury">{product.brand}</p>
                    <h4 className="text-primary truncate font-serif text-lg">{product.title}</h4>
                    <PriceTag
                      resalePriceCents={product.priceCents}
                      compareAtPriceCents={product.compareAtCents}
                      retailPriceCents={product.retailCents}
                    />

                    <div className="pt-3">
                      <LuxuryButton variant="dark" size="sm" className="w-full">
                        Details Ansehen
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

      {/* Footer */}
      <footer className="border-t border-[#C5A880]/30 bg-[#1A1A1A] pt-16 pb-12 text-[#FAF9F6]">
        <div className="container-luxury space-y-12">
          <div className="grid gap-8 border-b border-white/10 pb-12 md:grid-cols-4">
            <div className="space-y-4">
              <h4 className="font-serif text-xl tracking-widest">SONA BOUTIQUE</h4>
              <p className="text-xs leading-relaxed text-white/60">
                Der verlässliche Marktplatz für geprüfte Luxushandtaschen aus zweiter Hand.
              </p>
            </div>
            <div>
              <h5 className="label-luxury mb-4 text-white/40">Kollektion</h5>
              <ul className="space-y-2 text-xs text-white/70">
                <li>
                  <a href="#" className="hover:text-accent">
                    Hermès Birkin & Kelly
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent">
                    Chanel Classic Flap
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent">
                    Louis Vuitton Monogram
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="label-luxury mb-4 text-white/40">Service</h5>
              <ul className="space-y-2 text-xs text-white/70">
                <li>
                  <a href="#" className="hover:text-accent">
                    Echtheitszertifikate
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent">
                    Zustandsbewertung
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent">
                    FAQ & Kontakt
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="label-luxury mb-4 text-white/40">Rechtliches</h5>
              <ul className="space-y-2 text-xs text-white/70">
                <li>
                  <a href="#" className="hover:text-accent">
                    Impressum
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent">
                    Datenschutz
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent">
                    AGB & Widerruf
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-4 text-center">
            <p className="mx-auto max-w-4xl text-[10px] leading-relaxed text-white/40">
              SONA Boutique ist ein unabhängiger Reseller von gebrauchten Luxusartikeln. Es besteht
              keine Kooperation, Autorisierung oder offizielle Partnerschaft mit den genannten
              Marken (Hermès, Chanel, Louis Vuitton, Dior etc.). Alle Markenrechte verbleiben bei
              den jeweiligen Inhabern.
            </p>
            <p className="font-mono text-xs text-white/60">
              © {new Date().getFullYear()} SONA Boutique. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
