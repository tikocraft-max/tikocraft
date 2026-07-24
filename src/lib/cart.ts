"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================================
// Cart store — persists to localStorage so cart survives
// page refresh, browser close, and return visits.
// No account required.
// ============================================================

export interface CartItem {
  slug: string;
  name: string;
  image: string;
  priceUSD: number; // stored in USD, converted at display time
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  // Actions
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  // Computed
  getTotalItems: () => number;
  getTotalUSD: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.slug === item.slug);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.slug === item.slug
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
              isOpen: true, // open cart drawer when item added
            };
          }
          return {
            items: [...state.items, { ...item, quantity }],
            isOpen: true,
          };
        });
      },

      removeItem: (slug) => {
        set((state) => ({
          items: state.items.filter((i) => i.slug !== slug),
        }));
      },

      updateQuantity: (slug, quantity) => {
        if (quantity <= 0) {
          get().removeItem(slug);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.slug === slug ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getTotalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      getTotalUSD: () =>
        get().items.reduce((sum, i) => sum + i.priceUSD * i.quantity, 0),
    }),
    {
      name: "tikocraft-cart", // localStorage key
      // Only persist items, not isOpen (drawer should start closed)
      partialize: (state) => ({ items: state.items }),
    }
  )
);
