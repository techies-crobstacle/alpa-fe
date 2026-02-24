"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";

/* =======================
   TYPES
======================= */
export type CartItem = {
  cartId: string;
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
  isMergingCart: boolean;
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
  const [isMergingCart, setIsMergingCart] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Tracks previous token to detect the null → value transition (login event)
  const prevTokenRef = useRef<string | null>(undefined as any);

  /* ---------- LOAD TOKEN ---------- */
  useEffect(() => {
    setToken(localStorage.getItem("alpa_token"));
  }, []);

  /* ---------- LISTEN FOR TOKEN CHANGES (e.g. login from another tab / context) ---------- */
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "alpa_token") {
        setToken(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /* ---------- FETCH CART FROM BACKEND ---------- */
  const fetchCartFromBackend = async (authToken?: string) => {
    const activeToken = authToken ?? token;
    if (!activeToken) return;

    try {
      const res = await fetch(`${baseUrl}/api/cart/my-cart`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });

      if (!res.ok) return;

      const data = await res.json();

      // 🔥 MAP BACKEND → FRONTEND SHAPE
      const items: CartItem[] = data.cart.map((item: any) => ({
        cartId: item.id || item.cartId || "",
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

  /* ---------- MERGE GUEST CART → BACKEND (Shopify-style on login) ---------- */
  const mergeGuestCartToBackend = async (authToken: string) => {
    // Collect items from both guest storage keys
    const cartRaw = localStorage.getItem("cart");
    const guestRaw = localStorage.getItem("guest_cart_items");

    const localItems: CartItem[] = cartRaw ? JSON.parse(cartRaw) : [];
    const guestItems: Array<{ productId: string; quantity: number }> = guestRaw
      ? JSON.parse(guestRaw)
      : [];

    // Build a merged map: productId → total quantity
    const mergeMap = new Map<string, number>();
    localItems.forEach((item) =>
      mergeMap.set(item.id, (mergeMap.get(item.id) ?? 0) + item.qty)
    );
    guestItems.forEach((item) =>
      mergeMap.set(
        item.productId,
        (mergeMap.get(item.productId) ?? 0) + item.quantity
      )
    );

    if (mergeMap.size === 0) {
      // Nothing to merge — just fetch the backend cart
      await fetchCartFromBackend(authToken);
      return;
    }

    setIsMergingCart(true);

    // Push all guest items to backend in parallel
    await Promise.allSettled(
      Array.from(mergeMap.entries()).map(([productId, quantity]) =>
        fetch(`${baseUrl}/api/cart/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ productId, quantity }),
        })
      )
    );

    // Clear guest cart keys — backend is now the source of truth
    localStorage.removeItem("cart");
    localStorage.removeItem("guest_cart_items");
    localStorage.removeItem("guest_cart_metadata");

    // Fetch the fully merged cart from backend
    await fetchCartFromBackend(authToken);
    setIsMergingCart(false);
  };

  /* ---------- INIT CART ---------- */
  useEffect(() => {
    const init = async () => {
      // Show guest cart immediately while we work in the background
      const local = localStorage.getItem("cart");
      setCartItems(local ? JSON.parse(local) : []);

      if (token) {
        const isFirstLogin = prevTokenRef.current === null || prevTokenRef.current === undefined;
        if (isFirstLogin && prevTokenRef.current !== token) {
          // null → token: user just logged in → merge guest → backend
          await mergeGuestCartToBackend(token);
        } else {
          // token was already set (page refresh, re-render) → just fetch
          await fetchCartFromBackend(token);
        }
      }

      prevTokenRef.current = token;
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

  // Debounce helpers for API sync
  const addToCartTimeout = useRef<NodeJS.Timeout | null>(null);
  const updateQtyTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  // ADD TO CART: UI updates instantly, API sync is debounced
  const addToCart = async (item: Omit<CartItem, "qty">) => {
    setCartItems((prev) => {
      const found = prev.find((p) => p.id === item.id);
      return found
        ? prev.map((p) =>
            p.id === item.id ? { ...p, qty: p.qty + 1 } : p
          )
        : [...prev, { ...item, qty: 1, cartId: "" }];
    });

    if (token) {
      if (addToCartTimeout.current) clearTimeout(addToCartTimeout.current);
      addToCartTimeout.current = setTimeout(async () => {
        try {
          const response = await fetch(`${baseUrl}/api/cart/add`, {
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
          if (response.ok) {
            await fetchCartFromBackend();
          } else {
            console.error("Failed to add item to cart:", response.statusText);
          }
        } catch (error) {
          console.error("Error adding to cart:", error);
        }
      }, 2000); // 2 seconds debounce
    }
  };

  /* ---------- UPDATE QTY ---------- */
  const updateQty = async (productId: string, change: number) => {
    const item = cartItems.find((i) => i.id === productId);
    if (!item) return;

    const newQty = item.qty + change;

    // UI update instantly
    setCartItems((prev) =>
      newQty <= 0
        ? prev.filter((i) => i.id !== productId)
        : prev.map((i) =>
            i.id === productId ? { ...i, qty: newQty } : i
          )
    );

    if (token) {
      // Debounce per product
      if (updateQtyTimeouts.current[productId]) {
        clearTimeout(updateQtyTimeouts.current[productId]);
      }
      updateQtyTimeouts.current[productId] = setTimeout(async () => {
        try {
          if (newQty <= 0) {
            const response = await fetch(`${baseUrl}/api/cart/remove/${productId}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
              await fetchCartFromBackend();
            } else {
              console.error("Failed to remove item from cart:", response.statusText);
            }
          } else {
            const response = await fetch(`${baseUrl}/api/cart/update`, {
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
            if (response.ok) {
              await fetchCartFromBackend();
            } else {
              console.error("Failed to update cart:", response.statusText);
            }
          }
        } catch (error) {
          console.error("Error updating cart:", error);
        }
      }, 2000); // 2 seconds debounce
    }
  };

  /* ---------- REMOVE ---------- */
  const removeFromCart = async (productId: string) => {
    if (token) {
      try {
        const response = await fetch(`${baseUrl}/api/cart/remove/${productId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          await fetchCartFromBackend();
        } else {
          console.error("Failed to remove item from cart:", response.statusText);
        }
      } catch (error) {
        console.error("Error removing from cart:", error);
      }
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
        isMergingCart,
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
