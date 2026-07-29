"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCard } from "@/components/storefront/ProductCard";
import { GoldDivider } from "@/components/luxury/GoldDivider";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { Filter, SlidersHorizontal, RotateCcw, ChevronDown } from "lucide-react";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";

type Product = {
  id: string;
  slug: string;
  title: string;
  brand: { name: string; slug: string };
  condition: string;
  resalePriceCents: number;
  compareAtPriceCents?: number | null;
  retailPriceCents?: number | null;
  isFeatured?: boolean;
  images?: Array<{ id: string; url: string; altText?: string | null }>;
};

type Brand = { id: string; name: string; slug: string; _count: { products: number } };
type Category = { id: string; name: string; slug: string; _count: { products: number } };

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Active filters derived from searchParams
  const activeSearch = searchParams.get("search") || "";
  const activeBrand = searchParams.get("brand") || "";
  const activeCategory = searchParams.get("category") || "";
  const activeCondition = searchParams.get("condition") || "";
  const activeMinPrice = searchParams.get("minPrice") || "";
  const activeMaxPrice = searchParams.get("maxPrice") || "";
  const activeSort = searchParams.get("sort") || "featured";

  // Fetch filter options (Brands & Categories)
  useEffect(() => {
    async function fetchOptions() {
      try {
        const [bRes, cRes] = await Promise.all([fetch("/api/brands"), fetch("/api/categories")]);
        if (bRes.ok) {
          const bData = await bRes.json();
          setBrands(bData.brands || []);
        }
        if (cRes.ok) {
          const cData = await cRes.json();
          setCategories(cData.categories || []);
        }
      } catch (err) {
        console.error("Fehler beim Laden der Filteroptionen", err);
      }
    }
    fetchOptions();
  }, []);

  // Fetch products function
  const fetchProducts = useCallback(
    async (isLoadMore = false, targetPage = 1) => {
      try {
        setLoading(true);
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", targetPage.toString());
        params.set("limit", "12");

        const res = await fetch(`/api/products?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (isLoadMore) {
            setProducts((prev) => [...prev, ...data.products]);
          } else {
            setProducts(data.products || []);
          }
          setTotal(data.total || 0);
          setPage(data.page || 1);
          setHasMore(data.page < data.totalPages);
        }
      } catch (err) {
        console.error("Fehler beim Laden der Produkte", err);
      } finally {
        setLoading(false);
      }
    },
    [searchParams],
  );

  useEffect(() => {
    fetchProducts(false, 1);
  }, [fetchProducts]);

  // Update query params in URL
  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/catalog?${params.toString()}`);
  };

  const resetFilters = () => {
    router.push("/catalog");
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchProducts(true, page + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24">
      {/* Catalog Banner Header */}
      <section className="border-b border-[#E8E5DC] bg-[#F5F4EE] py-12 lg:py-16">
        <div className="container-luxury space-y-3 text-center">
          <span className="label-luxury">Kuratierter Katalog</span>
          <h1 className="font-serif text-3xl font-light tracking-tight text-[#1A1A1A] sm:text-5xl">
            {activeBrand
              ? `Kollektion ${brands.find((b) => b.slug === activeBrand)?.name || activeBrand}`
              : activeCategory
                ? categories.find((c) => c.slug === activeCategory)?.name || activeCategory
                : "Zertifizierte Luxushandtaschen"}
          </h1>
          <p className="mx-auto max-w-xl text-xs leading-relaxed font-normal text-[#6B6B6B]">
            Jedes Einzelstück von unabhängigen Experten auf Authentizität geprüft.
          </p>
        </div>
      </section>

      <div className="container-luxury pt-8">
        {/* Toolbar Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8E5DC] pb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className="inline-flex items-center gap-2 border border-[#E8E5DC] bg-white px-4 py-2 text-xs font-medium tracking-widest text-[#1A1A1A] uppercase transition-colors hover:border-[#C5A880]"
            >
              <Filter className="h-4 w-4 text-[#C5A880]" />
              <span>Filter {showFilterDrawer ? "Ausblenden" : "Anzeigen"}</span>
            </button>
            <span className="font-mono text-xs text-[#6B6B6B]">{total} Ergebnisse</span>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="label-luxury hidden sm:inline">Sortieren:</span>
            <div className="relative">
              <select
                value={activeSort}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="cursor-pointer appearance-none border border-[#E8E5DC] bg-white px-4 py-2 pr-8 text-xs font-medium tracking-widest text-[#1A1A1A] uppercase focus:border-[#C5A880] focus:outline-none"
              >
                <option value="featured">Empfohlen</option>
                <option value="newest">Neueste zuerst</option>
                <option value="price-asc">Preis: Aufsteigend</option>
                <option value="price-desc">Preis: Absteigend</option>
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-[#6B6B6B]" />
            </div>
          </div>
        </div>

        {/* Catalog Main Layout (Sidebar + Grid) */}
        <div className="grid grid-cols-1 gap-8 pt-8 lg:grid-cols-12">
          {/* Filter Sidebar */}
          <aside
            className={`space-y-6 lg:col-span-3 ${showFilterDrawer ? "block" : "hidden lg:block"}`}
          >
            <div className="space-y-6 border border-[#E8E5DC] bg-white p-6">
              <div className="flex items-center justify-between border-b border-[#E8E5DC] pb-3">
                <span className="label-luxury text-xs">Filter-Optionen</span>
                {(activeBrand ||
                  activeCategory ||
                  activeCondition ||
                  activeMinPrice ||
                  activeMaxPrice) && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1 font-mono text-[10px] text-[#B91C1C] uppercase hover:underline"
                  >
                    <RotateCcw className="h-3 w-3" /> Zurücksetzen
                  </button>
                )}
              </div>

              {/* Brand Filter */}
              <div className="space-y-2">
                <label className="label-luxury block text-[10px]">Marke</label>
                <select
                  value={activeBrand}
                  onChange={(e) => updateParam("brand", e.target.value)}
                  className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                >
                  <option value="">
                    Alle Marken ({brands.reduce((acc, b) => acc + (b._count?.products || 0), 0)})
                  </option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.slug}>
                      {b.name} ({b._count?.products || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="label-luxury block text-[10px]">Kategorie</label>
                <select
                  value={activeCategory}
                  onChange={(e) => updateParam("category", e.target.value)}
                  className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                >
                  <option value="">Alle Kategorien</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name} ({c._count?.products || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Condition Filter */}
              <div className="space-y-2">
                <label className="label-luxury block text-[10px]">Zustand</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { key: "", label: "Alle" },
                    { key: "PRISTINE", label: "Neuwertig" },
                    { key: "EXCELLENT", label: "Hervorragend" },
                    { key: "VERY_GOOD", label: "Sehr gut" },
                  ].map((cond) => (
                    <button
                      key={cond.key}
                      onClick={() => updateParam("condition", cond.key)}
                      className={`border px-2.5 py-1 font-mono text-[10px] tracking-wider uppercase transition-colors ${
                        activeCondition === cond.key
                          ? "border-[#1A1A1A] bg-[#1A1A1A] text-[#FAF9F6]"
                          : "border-[#E8E5DC] bg-[#FAF9F6] text-[#6B6B6B] hover:border-[#C5A880]"
                      }`}
                    >
                      {cond.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-2">
                <label className="label-luxury block text-[10px]">Preisbereich (€)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={activeMinPrice}
                    onChange={(e) => updateParam("minPrice", e.target.value)}
                    className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-2.5 py-1.5 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                  />
                  <span className="text-[#6B6B6B]">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={activeMaxPrice}
                    onChange={(e) => updateParam("maxPrice", e.target.value)}
                    className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-2.5 py-1.5 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main
            className={`${showFilterDrawer ? "lg:col-span-9" : "lg:col-span-12"} space-y-8 transition-all`}
          >
            {loading && products.length === 0 ? (
              /* Skeleton Cards */
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3 border border-[#E8E5DC] bg-white p-4">
                    <div className="animate-shimmer aspect-square bg-gradient-to-r from-[#F5F4EE] via-[#E8E5DC] to-[#F5F4EE] bg-[length:200%_100%]" />
                    <div className="h-3 w-1/3 bg-[#E8E5DC]" />
                    <div className="h-4 w-2/3 bg-[#E8E5DC]" />
                    <div className="h-4 w-1/2 bg-[#E8E5DC]" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              /* Empty State */
              <div className="space-y-4 border border-[#E8E5DC] bg-white p-16 text-center">
                <SlidersHorizontal className="mx-auto h-10 w-10 text-[#C5A880]" />
                <h3 className="font-serif text-2xl text-[#1A1A1A]">Keine Taschen gefunden</h3>
                <p className="mx-auto max-w-sm text-xs leading-relaxed text-[#6B6B6B]">
                  Für die gewählten Filter liegen aktuell keine zertifizierten Einzelstücke vor.
                </p>
                <div className="pt-2">
                  <LuxuryButton onClick={resetFilters} variant="gold" size="sm">
                    Filter Zurücksetzen
                  </LuxuryButton>
                </div>
              </div>
            ) : (
              /* Products Grid */
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {products.map((prod, idx) => (
                    <RevealOnScroll key={prod.id} delay={(idx % 4) * 0.08} direction="up">
                      <ProductCard product={prod} />
                    </RevealOnScroll>
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="pt-8 text-center">
                    <LuxuryButton
                      onClick={handleLoadMore}
                      disabled={loading}
                      variant="outline"
                      size="lg"
                    >
                      {loading ? "Wird geladen..." : "Weitere Taschen Laden"}
                    </LuxuryButton>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={<div className="p-16 text-center font-mono text-xs">Katalog wird geladen...</div>}
    >
      <CatalogContent />
    </Suspense>
  );
}
