import { create } from "zustand";

type FavoriteProduct = {
  id: string;
  slug: string;
  title: string;
  brand: { name: string; slug: string };
  condition: string;
  resalePriceCents: number;
  compareAtPriceCents?: number | null;
  retailPriceCents?: number | null;
  images: { id: string; url: string; altText: string | null }[];
};

type FavoritesState = {
  favorites: FavoriteProduct[];
  favoriteIds: Set<string>;
  loading: boolean;
  initialized: boolean;

  fetch: () => Promise<void>;
  toggle: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  clear: () => void;
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  favoriteIds: new Set(),
  loading: false,
  initialized: false,

  fetch: async () => {
    try {
      set({ loading: true });
      const res = await fetch("/api/favorites");
      if (!res.ok) {
        set({ favorites: [], favoriteIds: new Set(), loading: false, initialized: true });
        return;
      }
      const data = await res.json();
      const faves = (data.favorites || []).map((f: any) => f.product);
      const ids = new Set<string>((data.favorites || []).map((f: any) => f.productId));
      set({ favorites: faves, favoriteIds: ids, loading: false, initialized: true });
    } catch {
      set({ favorites: [], favoriteIds: new Set(), loading: false, initialized: true });
    }
  },

  toggle: async (productId: string) => {
    const { favoriteIds, favorites } = get();
    const isCurrentlyFav = favoriteIds.has(productId);

    // Optimistic update – no re-fetch to avoid flicker
    const newIds = new Set(favoriteIds);
    if (isCurrentlyFav) {
      newIds.delete(productId);
    } else {
      newIds.add(productId);
    }
    set({ favoriteIds: newIds });

    try {
      if (isCurrentlyFav) {
        const res = await fetch(`/api/favorites/${productId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to remove");
        // Remove from local favorites array
        set({ favorites: favorites.filter((f) => f.id !== productId) });
      } else {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        if (!res.ok) throw new Error("Failed to add");
        // Re-fetch to get the full product data for the new favorite
        get().fetch();
      }
    } catch {
      // Revert on error
      set({ favoriteIds });
    }
  },

  isFavorite: (productId: string) => {
    return get().favoriteIds.has(productId);
  },

  clear: () => {
    set({ favorites: [], favoriteIds: new Set(), initialized: false });
  },
}));