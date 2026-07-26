"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { ProductCard } from "@/components/storefront/ProductCard";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { Heart, ArrowLeft } from "lucide-react";

export default function FavoritesPage() {
  const router = useRouter();
  const { customer, fetchMe } = useAuthStore();
  const { favorites, loading, initialized, fetch, toggle } = useFavoritesStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchMe().then((cust) => {
      if (!cust) router.replace("/login?redirect=/account/favorites");
    });
  }, [fetchMe, router]);

  useEffect(() => {
    if (customer && !initialized) {
      fetch();
    }
  }, [customer, initialized, fetch]);

  const handleRemoveAll = async () => {
    if (!confirm("Alle Favoriten entfernen?")) return;
    for (const fav of favorites) {
      await toggle(fav.id);
    }
  };

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FAF9F6]">
        <span className="font-mono text-xs text-[#6B6B6B]">Wird geladen...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-8 pb-24">
      <div className="container-luxury space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E5DC] pb-6">
          <div className="space-y-1">
            <Link
              href="/account"
              className="inline-flex items-center gap-1 font-mono text-[10px] tracking-widest text-[#6B6B6B] uppercase hover:text-[#1A1A1A]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Zurück zum Konto
            </Link>
            <h1 className="font-serif text-3xl font-light text-[#1A1A1A] sm:text-4xl">
              Meine Merkliste
            </h1>
          </div>
          {favorites.length > 0 && (
            <LuxuryButton variant="outline" size="sm" onClick={handleRemoveAll}>
              Alle entfernen
            </LuxuryButton>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-16 text-center text-xs text-[#6B6B6B]">
            Favoriten werden geladen…
          </div>
        )}

        {/* Empty State */}
        {!loading && favorites.length === 0 && (
          <div className="mx-auto max-w-md space-y-6 border border-[#E8E5DC] bg-white p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center border border-[#C5A880]/30 bg-[#F5F4EE] text-[#C5A880]">
              <Heart className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl text-[#1A1A1A]">
                Ihre Merkliste ist aktuell leer
              </h2>
              <p className="text-xs leading-relaxed text-[#6B6B6B]">
                Markieren Sie Ihre Lieblingsstücke mit dem Herz-Symbol, um sie später
                wiederzufinden.
              </p>
            </div>
            <Link href="/catalog">
              <LuxuryButton variant="gold" size="lg" shimmer>
                Kollektion Entdecken
              </LuxuryButton>
            </Link>
          </div>
        )}

        {/* Favorites Grid */}
        {!loading && favorites.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}