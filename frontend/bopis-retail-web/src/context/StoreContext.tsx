"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Product, Store } from "@/types";
import { fetchStores } from "@/services/api";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface StoreContextType {
  currentStore: Store | null;
  stores: Store[];
  setCurrentStore: (store: Store) => void;
  isLoadingStores: boolean;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [stores, setStores] = useState<Store[]>([]);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    async function loadStores() {
      try {
        const data = await fetchStores();
        setStores(data);
        if (data.length > 0) {
          // Check saved preference or default to first store
          const savedStoreId = typeof window !== 'undefined' ? localStorage.getItem('omni_preferred_store') : null;
          const matched = savedStoreId ? data.find(s => s.id === parseInt(savedStoreId)) : null;
          setCurrentStore(matched || data[0]);
        }
      } catch (err) {
        console.error("Failed to load stores:", err);
      } finally {
        setIsLoadingStores(false);
      }
    }
    loadStores();
  }, []);

  const handleSetCurrentStore = (store: Store) => {
    setCurrentStore(store);
    if (typeof window !== 'undefined') {
      localStorage.setItem('omni_preferred_store', store.id.toString());
    }
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        currentStore,
        stores,
        setCurrentStore: handleSetCurrentStore,
        isLoadingStores,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartItemCount,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
