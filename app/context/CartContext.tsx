"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

/* =======================
   TYPES
======================= */
export type CartItem = {
  id: string; // ✅ productId ONLY
  name: string;
  price: number;
  image: string;
  qty: number;
  stock?: number;
  slug?: string;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "qty">) => Promise<void>;
  updateQty: (productId: string, change: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
  getItemQuantity: (productId: string) => number;
  isHydrated: boolean;
  fetchCartFromBackend: () => Promise<void>;
};

/* =======================
   CONTEXT
======================= */
const CartContext = createContext<CartContextType | null>(null);
const baseUrl = "https://alpa-be-1.onrender.com";

/* =======================
   PROVIDER
======================= */
export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  /* ---------- LOAD TOKEN ---------- */
  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  /* ---------- FETCH CART FROM BACKEND ---------- */
  const fetchCartFromBackend = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${baseUrl}/api/cart/my-cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const data = await res.json();

      // 🔥 MAP BACKEND → FRONTEND SHAPE
      const items: CartItem[] = data.cart.map((item: any) => ({
        id: item.productId,
        name: item.product.title,
        price: Number(item.product.price),
        image: item.product.images?.[0] || "/images/placeholder.png",
        qty: item.quantity,
        stock: item.product.stock,
        slug: item.product.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-"),
      }));

      setCartItems(items);
      localStorage.setItem("cart", JSON.stringify(items));
    } catch (err) {
      console.error("Fetch cart failed", err);
    }
  };

  /* ---------- INIT CART ---------- */
  useEffect(() => {
    const init = async () => {
      const local = localStorage.getItem("cart");
      setCartItems(local ? JSON.parse(local) : []);

      if (token) await fetchCartFromBackend();

      setIsHydrated(true);
    };

    init();
  }, [token]);

  /* ---------- SYNC LOCAL STORAGE ---------- */
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isHydrated]);

  /* ---------- ADD TO CART ---------- */
  const addToCart = async (item: Omit<CartItem, "qty">) => {
    if (token) {
      await fetch(`${baseUrl}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: item.id,
          quantity: 1,
        }),
      });

      await fetchCartFromBackend();
      return;
    }

    // guest fallback
    setCartItems((prev) => {
      const found = prev.find((p) => p.id === item.id);
      return found
        ? prev.map((p) =>
            p.id === item.id ? { ...p, qty: p.qty + 1 } : p
          )
        : [...prev, { ...item, qty: 1 }];
    });
  };

  /* ---------- UPDATE QTY ---------- */
  const updateQty = async (productId: string, change: number) => {
    const item = cartItems.find((i) => i.id === productId);
    if (!item) return;

    const newQty = item.qty + change;

    if (token) {
      if (newQty <= 0) {
        await fetch(`${baseUrl}/api/cart/remove/${productId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await fetch(`${baseUrl}/api/cart/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId,
            quantity: newQty,
          }),
        });
      }

      await fetchCartFromBackend();
      return;
    }

    // guest fallback
    setCartItems((prev) =>
      newQty <= 0
        ? prev.filter((i) => i.id !== productId)
        : prev.map((i) =>
            i.id === productId ? { ...i, qty: newQty } : i
          )
    );
  };

  /* ---------- REMOVE ---------- */
  const removeFromCart = async (productId: string) => {
    if (token) {
      await fetch(`${baseUrl}/api/cart/remove/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchCartFromBackend();
      return;
    }

    setCartItems((prev) => prev.filter((i) => i.id !== productId));
  };

  /* ---------- CLEAR ---------- */
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  /* ---------- HELPERS ---------- */
  const subtotal = cartItems.reduce(
    (sum, i) => sum + i.price * i.qty,
    0
  );

  const itemCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  const getItemQuantity = (productId: string) =>
    cartItems.find((i) => i.id === productId)?.qty || 0;

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
        getItemQuantity,
        isHydrated,
        fetchCartFromBackend,
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
