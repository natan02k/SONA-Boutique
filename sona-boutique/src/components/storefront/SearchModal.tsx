"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/ui-store";
import { ShimmerImage } from "@/components/luxury/ShimmerImage";
import { PriceTag } from "@/components/luxury/PriceTag";
import { ConditionBadge } from "@/components/luxury/ConditionBadge";
import { Search, X, ArrowRight } from "lucide-react";
import { EASE_LUXURY } from "@/lib/motion-presets";

type SearchResultItem = {
  id: string;
  slug: string;
  title: string;
  brand: { name: string };
  condition: string;
  resalePriceCents: number;
  images: { url: string; altText: string | null }[];
};

const popularTags = [
  "Hermès Birkin",
  "Chanel Classic Flap",
  "Louis Vuitton Speedy",
  "Dior Lady",
];

export function SearchModal() {
  const { isSearchOpen, closeSearch, openSearch } = useUIStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Listen for Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isSearchOpen) {
          closeSearch();
        } else {
          openSearch();
        }
      }
      if (e.key === "Escape" && isSearchOpen) {
        closeSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, closeSearch, openSearch]);

  // Debounced API search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/products?search=${encodeURIComponent(query.trim())}&limit=6`,
        );
        const data = await res.json();
        setResults(data.products || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectResult = (slug: string) => {
    closeSearch();
    router.push(`/catalog?search=${encodeURIComponent(slug)}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      closeSearch();
      router.push(`/catalog?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
            className="fixed inset-0 z-50 bg-[#1A1A1A]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -20 }}
            transition={{ duration: 0.3, ease: EASE_LUXURY }}
            className="fixed top-16 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 px-4 sm:top-24"
          >
            <div className="overflow-hidden border border-[#E8E5DC] bg-[#FAF9F6] shadow-2xl">
              {/* Search Form Input */}
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center border-b border-[#E8E5DC] px-4 py-3"
              >
                <Search className="mr-3 h-5 w-5 text-[#C5A880]" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Suchen nach Marke, Modell (z.B. Birkin, Chanel Flap)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-[#1A1A1A] placeholder-[#6B6B6B] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={closeSearch}
                  aria-label="Close search"
                  className="p-1 text-[#6B6B6B] transition-colors hover:text-[#1A1A1A]"
                >
                  <X className="h-5 w-5" />
                </button>
              </form>

              {/* Results Area */}
              <div className="max-h-[60vh] overflow-y-auto p-4">
                {!query.trim() ? (
                  <div className="space-y-2 py-8 text-center text-xs text-[#6B6B6B]">
                    <p className="font-mono text-[10px] tracking-widest uppercase">
                      Beliebte Suchanfragen
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 pt-2">
                      {popularTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setQuery(tag)}
                          className="border border-[#E8E5DC] bg-[#F5F4EE] px-3 py-1 text-xs transition-colors hover:border-[#C5A880]"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : loading ? (
                  <div className="py-8 text-center text-xs text-[#6B6B6B]">
                    Suchergebnisse werden geladen…
                  </div>
                ) : results.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#6B6B6B]">
                    Keine Ergebnisse für &quot;{query}&quot; gefunden.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <span className="label-luxury block">Suchergebnisse ({results.length})</span>
                    {results.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => router.push(`/product/${item.slug}`)}
                        className="group flex cursor-pointer items-center justify-between border border-[#E8E5DC] bg-white p-3 transition-colors hover:border-[#C5A880]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative h-14 w-14 bg-[#F5F4EE]">
                            <ShimmerImage
                              src={item.images[0]?.url || ""}
                              alt={item.images[0]?.altText || item.title}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <span className="label-luxury block text-[9px]">{item.brand.name}</span>
                            <h4 className="font-serif text-sm font-medium text-[#1A1A1A]">
                              {item.title}
                            </h4>
                            <ConditionBadge condition={item.condition} />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <PriceTag resalePriceCents={item.resalePriceCents} size="sm" />
                          <ArrowRight className="h-4 w-4 text-[#C5A880] transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
