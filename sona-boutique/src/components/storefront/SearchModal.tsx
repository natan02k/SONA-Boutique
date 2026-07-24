"use client";

import { useEffect, useState } from "react";
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
  title: string;
  brand: string;
  condition: string;
  priceCents: number;
  imageUrl: string;
};

const sampleSearchResults: SearchResultItem[] = [
  {
    id: "1",
    title: "Birkin 30 Gold Togo",
    brand: "Hermès",
    condition: "PRISTINE",
    priceCents: 2250000,
    imageUrl:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "2",
    title: "Classic Medium Flap Bag",
    brand: "Chanel",
    condition: "EXCELLENT",
    priceCents: 890000,
    imageUrl:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "3",
    title: "Speedy Bandoulière 25",
    brand: "Louis Vuitton",
    condition: "VERY_GOOD",
    priceCents: 145000,
    imageUrl:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1000&auto=format&fit=crop",
  },
];

export function SearchModal() {
  const { isSearchOpen, closeSearch, openSearch } = useUIStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
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

  // Filter search results
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const filtered = sampleSearchResults.filter(
      (item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.brand.toLowerCase().includes(query.toLowerCase()),
    );
    setResults(filtered);
  }, [query]);

  const handleSelectResult = (id: string) => {
    closeSearch();
    router.push(`/products/${id}`);
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
                      {[
                        "Hermès Birkin",
                        "Chanel Classic Flap",
                        "Louis Vuitton Speedy",
                        "Dior Lady",
                      ].map((tag) => (
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
                        onClick={() => handleSelectResult(item.id)}
                        className="group flex cursor-pointer items-center justify-between border border-[#E8E5DC] bg-white p-3 transition-colors hover:border-[#C5A880]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative h-14 w-14 bg-[#F5F4EE]">
                            <ShimmerImage
                              src={item.imageUrl}
                              alt={item.title}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <span className="label-luxury block text-[9px]">{item.brand}</span>
                            <h4 className="font-serif text-sm font-medium text-[#1A1A1A]">
                              {item.title}
                            </h4>
                            <ConditionBadge condition={item.condition} />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <PriceTag resalePriceCents={item.priceCents} size="sm" />
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
