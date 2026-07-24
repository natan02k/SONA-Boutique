import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  productId: string;
  title: string;
  brandName: string;
  priceCents: number;
  imageUrl: string;
  condition: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id" | "quantity"> & { id?: string; quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalCount: () => number;
  getSubtotalCents: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [
        // Default sample item for demonstration
        {
          id: "cart-sample-1",
          productId: "1",
          title: "Birkin 30 Gold Togo",
          brandName: "Hermès",
          priceCents: 2250000,
          imageUrl:
            "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop",
          condition: "PRISTINE",
          quantity: 1,
        },
      ],

      addItem: (newItem) => {
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex(
          (item) => item.productId === newItem.productId,
        );

        if (existingIndex > -1) {
          const updated = [...currentItems];
          const existing = updated[existingIndex];
          if (existing) {
            updated[existingIndex] = {
              ...existing,
              quantity: existing.quantity + (newItem.quantity || 1),
            };
          }
          set({ items: updated });
        } else {
          set({
            items: [
              ...currentItems,
              {
                id: newItem.id || `cart-${newItem.productId}`,
                ...newItem,
                quantity: newItem.quantity || 1,
              },
            ],
          });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.productId !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item,
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotalCents: () => {
        return get().items.reduce((total, item) => total + item.priceCents * item.quantity, 0);
      },
    }),
    {
      name: "sona_cart_storage",
    },
  ),
);
