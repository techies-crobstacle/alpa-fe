// app/context/CartContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

/* =======================
   TYPES
======================= */
export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  stock?: number;
  slug?: string;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "qty"> & { stock?: number }) => void;
  updateQty: (id: string, change: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
  getItemQuantity: (id: string) => number;
  isHydrated: boolean; // Add this to track hydration state
};

/* =======================
   CONTEXT
======================= */
const CartContext = createContext<CartContextType | null>(null);

/* =======================
   PROVIDER
======================= */
export function CartProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage ONLY on client side
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    try {
      setCartItems(savedCart ? JSON.parse(savedCart) : []);
    } catch (error) {
      console.error('Error parsing cart from localStorage:', error);
      setCartItems([]);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem('cart', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cartItems, isHydrated]);

  /* ---------- ADD TO CART ---------- */
  const addToCart = (item: Omit<CartItem, "qty"> & { stock?: number }) => {
    if (!isHydrated) return;
    
    setCartItems((prev) => {
      const existingItem = prev.find((p) => p.id === item.id);
      
      if (existingItem) {
        const newQty = existingItem.qty + 1;
        if (item.stock && newQty > item.stock) {
          alert(`Only ${item.stock} items available in stock`);
          return prev;
        }
        return prev.map((p) =>
          p.id === item.id ? { ...p, qty: newQty } : p
        );
      }
      
      if (item.stock && 1 > item.stock) {
        alert(`Only ${item.stock} items available in stock`);
        return prev;
      }
      
      return [...prev, { ...item, qty: 1 }];
    });
  };

  /* ---------- UPDATE QTY ---------- */
const updateQty = (id: string, change: number) => {
  if (!isHydrated) return;

  setCartItems((prev) => {
    const item = prev.find((i) => i.id === id);
    if (!item) return prev;

    const newQty = item.qty + change;

    // ✅ If user clicks "-" at qty = 1 → remove item
    if (newQty <= 0) {
      return prev.filter((i) => i.id !== id);
    }

    // ✅ Stock check
    if (item.stock && newQty > item.stock) {
      alert(`Only ${item.stock} items available in stock`);
      return prev;
    }

    //  Normal update
    return prev.map((i) =>
      i.id === id ? { ...i, qty: newQty } : i
    );
  });
};


  /* ---------- GET ITEM QUANTITY ---------- */
  const getItemQuantity = (id: string) => {
    if (!isHydrated) return 0;
    const item = cartItems.find(item => item.id === id);
    return item ? item.qty : 0;
  };

  /* ---------- REMOVE ---------- */
  const removeFromCart = (id: string) => {
    if (!isHydrated) return;
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  /* ---------- CLEAR CART ---------- */
  const clearCart = () => {
    if (!isHydrated) return;
    setCartItems([]);
  };

  /* ---------- SUBTOTAL ---------- */
  const subtotal = isHydrated ? cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  ) : 0;

  /* ---------- TOTAL ITEM COUNT ---------- */
  const itemCount = isHydrated ? cartItems.reduce((total, item) => total + item.qty, 0) : 0;

  return (
    <CartContext.Provider
      value={{
        cartItems: isHydrated ? cartItems : [],
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        subtotal,
        itemCount,
        getItemQuantity,
        isHydrated,
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