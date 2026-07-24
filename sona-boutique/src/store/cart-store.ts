import { create } from "zustand";

export type ServerCartItem = {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  unitPriceCents: number;
  product: {
    id: string;
    slug: string;
    title: string;
    resalePriceCents: number;
    inventoryQuantity: number;
    condition: string;
    sku: string;
    brand: { id: string; name: string; slug: string };
    images: Array<{ id: string; url: string; altText?: string | null }>;
  };
};

export type ServerCart = {
  id: string;
  customerId?: string | null;
  status: string;
  currencyCode: string;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  discountCents: number;
  totalCents: number;
  promoCode?: string | null;
  items: ServerCartItem[];
};

type CartStoreState = {
  cart: ServerCart | null;
  loading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyPromo: (code: string) => Promise<void>;
  removePromo: () => Promise<void>;
  clearError: () => void;
};

export const useCartStore = create<CartStoreState>((set, get) => ({
  cart: null,
  loading: false,
  error: null,

  fetchCart: async () => {
    try {
      set({ loading: true, error: null });
      const res = await fetch("/api/cart");
      if (!res.ok) {
        set({ loading: false });
        return;
      }
      const data = await res.json();
      set({ cart: data.cart, loading: false });
    } catch {
      set({ loading: false, error: "Warenkorb konnte nicht geladen werden" });
    }
  },

  addItem: async (productId: string, quantity = 1) => {
    try {
      set({ loading: true, error: null });
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || "Fehler beim Hinzufügen zum Warenkorb";
        set({ loading: false, error: errorMsg });
        throw new Error(errorMsg);
      }

      set({ cart: data.cart, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  updateItem: async (itemId: string, quantity: number) => {
    try {
      set({ loading: true, error: null });
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || "Fehler beim Aktualisieren des Warenkorbs";
        set({ loading: false, error: errorMsg });
        throw new Error(errorMsg);
      }

      set({ cart: data.cart, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  removeItem: async (itemId: string) => {
    try {
      set({ loading: true, error: null });
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || "Fehler beim Entfernen des Artikels";
        set({ loading: false, error: errorMsg });
        throw new Error(errorMsg);
      }

      set({ cart: data.cart, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  applyPromo: async (code: string) => {
    try {
      set({ loading: true, error: null });
      const res = await fetch("/api/cart/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || "Gutscheincode ungültig";
        set({ loading: false, error: errorMsg });
        throw new Error(errorMsg);
      }

      set({ cart: data.cart, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  removePromo: async () => {
    try {
      set({ loading: true, error: null });
      const res = await fetch("/api/cart/promo", {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || "Gutscheincode konnte nicht entfernt werden";
        set({ loading: false, error: errorMsg });
        throw new Error(errorMsg);
      }

      set({ cart: data.cart, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
