import { create } from "zustand";
import { useFavoritesStore } from "@/store/favorites-store";

export type Customer = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "CUSTOMER" | "ADMIN";
  phone?: string | null;
  isVerified: boolean;
};

type AuthState = {
  customer: Customer | null;
  loading: boolean;
  error: string | null;
  fetchMe: () => Promise<Customer | null>;
  login: (email: string, password: string) => Promise<Customer>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<Customer>;
  logout: () => Promise<void>;
  clearError: () => void;
};

// Lazy import to avoid circular dependency
function getFavoritesStore() {
  return useFavoritesStore;
}

export const useAuthStore = create<AuthState>((set) => ({
  customer: null,
  loading: false,
  error: null,

  fetchMe: async () => {
    try {
      set({ loading: true, error: null });
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        set({ customer: null, loading: false });
        return null;
      }
      const data = await res.json();
      set({ customer: data.customer, loading: false });

      // Pre-fetch favorites when user is logged in
      if (data.customer) {
        try {
          getFavoritesStore().getState().fetch();
        } catch {}
      }

      return data.customer as Customer;
    } catch {
      set({ customer: null, loading: false, error: "Verbindungsfehler" });
      return null;
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.error || "Anmeldefehler";
        set({ loading: false, error: errorMessage });
        throw new Error(errorMessage);
      }

      set({ customer: data.customer, loading: false });

      // Pre-fetch favorites after login
      if (data.customer) {
        try {
          getFavoritesStore().getState().fetch();
        } catch {}
      }

      return data.customer;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ein Fehler ist aufgetreten";
      set({ loading: false, error: message });
      throw err;
    }
  },

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        const errorMessage = json.error || "Registrierungsfehler";
        set({ loading: false, error: errorMessage });
        throw new Error(errorMessage);
      }

      set({ customer: json.customer, loading: false });
      return json.customer;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ein Fehler ist aufgetreten";
      set({ loading: false, error: message });
      throw err;
    }
  },

  logout: async () => {
    try {
      set({ loading: true });
      await fetch("/api/auth/logout", { method: "POST" });
      set({ customer: null, loading: false, error: null });
    } catch {
      set({ loading: false, error: "Fehler beim Abmelden" });
    }
  },

  clearError: () => set({ error: null }),
}));
