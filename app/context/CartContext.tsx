"use client";

import { createContext, useContext, useState, useEffect } from "react";

/* =======================
   TYPES
======================= */
export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "qty">) => void;
  updateQty: (id: string, change: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
};

/* =======================
   CONTEXT
======================= */
const CartContext = createContext<CartContextType | null>(null);

/* =======================
   PROVIDER
======================= */
export function CartProvider({ children }: { children: React.ReactNode }) {
  // Load cart from localStorage on initial render
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  /* ---------- ADD TO CART ---------- */
  const addToCart = (item: Omit<CartItem, "qty">) => {
    setCartItems((prev) => {
      const existingItem = prev.find((p) => p.id === item.id);
      
      // ✅ If item exists, increment quantity
      if (existingItem) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, qty: p.qty + 1 } : p
        );
      }
      
      // ✅ Add new item with qty = 1
      return [...prev, { ...item, qty: 1 }];
    });
  };

  /* ---------- UPDATE QTY ---------- */
  const updateQty = (id: string, change: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, qty: Math.max(1, item.qty + change) }
          : item
      )
    );
  };

  /* ---------- REMOVE ---------- */
  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  /* ---------- CLEAR CART ---------- */
  const clearCart = () => {
    setCartItems([]);
  };

  /* ---------- SUBTOTAL ---------- */
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  /* ---------- TOTAL ITEM COUNT ---------- */
  const itemCount = cartItems.reduce((total, item) => total + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        subtotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* =======================
   HOOK
======================= */
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};