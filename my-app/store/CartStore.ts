"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { toast } from "sonner";

const CART_STORAGE_KEY = "cart-items";

export type CartItemId = string | number;

export type CartItem = {
  id: CartItemId;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  details?: string;
};

export type AddToCartInput = Omit<CartItem, "quantity"> & {
  quantity?: number;
};

type CartStore = {
  items: CartItem[];
  hasHydrated: boolean;
  totalItems: number;
  subtotal: number;
  addToCart: (item: AddToCartInput) => void;
  increaseQuantity: (id: CartItemId, amount?: number) => void;
  decreaseQuantity: (id: CartItemId, amount?: number) => void;
  setQuantity: (id: CartItemId, quantity: number) => void;
  removeFromCart: (id: CartItemId) => void;
  clearCart: () => void;
  getItemQuantity: (id: CartItemId) => number;
};

const normalizePositiveInt = (value: number | undefined, fallback = 1) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return Math.max(1, Math.floor(value));
};

const calculateTotalItems = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.quantity, 0);

const calculateSubtotal = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

const withDerivedValues = (items: CartItem[]) => ({
  items,
  totalItems: calculateTotalItems(items),
  subtotal: calculateSubtotal(items),
});

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,
      totalItems: 0,
      subtotal: 0,
      addToCart: (item) => {
        const quantityToAdd = normalizePositiveInt(item.quantity);
        const existingItems = get().items;
        const existingIndex = existingItems.findIndex((cartItem) => cartItem.id === item.id);

        if (existingIndex === -1) {
          const nextItems = [...existingItems, { ...item, quantity: quantityToAdd }];
          set(withDerivedValues(nextItems));
          toast.success(`${item.name} added to cart.`);
          return;
        }

        const nextItems = existingItems.map((cartItem, index) =>
          index === existingIndex
            ? { ...cartItem, quantity: cartItem.quantity + quantityToAdd }
            : cartItem,
        );
        set(withDerivedValues(nextItems));
        toast.success(`${item.name} quantity updated in cart.`);
      },
      increaseQuantity: (id, amount = 1) => {
        const amountToIncrease = normalizePositiveInt(amount);
        const nextItems = get().items.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + amountToIncrease } : item,
        );
        set(withDerivedValues(nextItems));
      },
      decreaseQuantity: (id, amount = 1) => {
        const amountToDecrease = normalizePositiveInt(amount);
        const nextItems = get()
          .items.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity - amountToDecrease } : item,
          )
          .filter((item) => item.quantity > 0);
        set(withDerivedValues(nextItems));
      },
      setQuantity: (id, quantity) => {
        if (quantity <= 0) {
          const nextItems = get().items.filter((item) => item.id !== id);
          set(withDerivedValues(nextItems));
          return;
        }

        const nextQuantity = Math.floor(quantity);
        const nextItems = get().items.map((item) =>
          item.id === id ? { ...item, quantity: nextQuantity } : item,
        );
        set(withDerivedValues(nextItems));
      },
      removeFromCart: (id) => {
        const existingItem = get().items.find((item) => item.id === id);
        const nextItems = get().items.filter((item) => item.id !== id);
        set(withDerivedValues(nextItems));

        if (existingItem) {
          toast.success(`${existingItem.name} removed from cart.`);
        }
      },
      clearCart: () => set(withDerivedValues([])),
      getItemQuantity: (id) => {
        const item = get().items.find((cartItem) => cartItem.id === id);
        return item?.quantity ?? 0;
      },
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true;
        }
      },
      partialize: (state) => ({ items: state.items }),
      merge: (persistedState, currentState) => {
        const persistedItems =
          (persistedState as Pick<CartStore, "items"> | undefined)?.items ?? [];
        return {
          ...currentState,
          ...withDerivedValues(persistedItems),
          hasHydrated: true,
        };
      },
    },
  ),
);
