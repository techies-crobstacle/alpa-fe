// hooks/useCartStock.ts
// Provides real-time stock data for all products currently in the cart.
//
// Strategy (matches REALTIME_STOCK_BRIDGE.md §4 + §5):
//   1. On mount → call POST /api/products/bulk-stock for a snapshot of all items.
//   2. Connect socket + emit `watch:cart` with all product IDs.
//   3. Listen for `stock:update` and merge into a stockMap keyed by productId.
//   4. Derive `canCheckout` — false if any item is unavailable.
"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { getSocket, StockUpdatePayload } from "@/lib/socket";

const API_BASE = "https://alpa-be.onrender.com/api";

export interface StockEntry {
  stock: number;
  isAvailable: boolean;
  isActive: boolean;
}

export type StockMap = Record<string, StockEntry>;

interface BulkStockResponse {
  success: boolean;
  stock: Record<
    string,
    { productId: string; stock: number; isAvailable: boolean; isActive: boolean }
  >;
}

/**
 * @param productIds – list of product IDs currently in the cart; pass an empty
 *                     array before the cart has loaded.
 */
export function useCartStock(productIds: string[]) {
  const [stockMap, setStockMap] = useState<StockMap>({});
  const [isLoading, setIsLoading] = useState(false);

  // ── Bulk REST snapshot ───────────────────────────────────────────────────
  const fetchBulkSnapshot = useCallback(async (ids: string[]) => {
    if (!ids.length) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products/bulk-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: ids }),
      });
      if (!res.ok) return;
      const data: BulkStockResponse = await res.json();
      if (data.success && data.stock) {
        const map: StockMap = {};
        for (const [id, entry] of Object.entries(data.stock)) {
          map[id] = {
            stock: entry.stock,
            isAvailable: entry.isAvailable,
            isActive: entry.isActive,
          };
        }
        setStockMap(map);
      }
    } catch {
      // Network failure — silently fall back; socket will still provide updates
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Socket subscription ──────────────────────────────────────────────────
  useEffect(() => {
    if (!productIds.length || typeof window === "undefined") return;

    // Bulk REST snapshot on every cart change (new items added / removed)
    fetchBulkSnapshot(productIds);

    // Store for reconnect handler in socket singleton
    (window as any).__socketCartProductIds = productIds;

    let socket: ReturnType<typeof getSocket>;
    try {
      socket = getSocket();
    } catch {
      return; // SSR guard
    }

    if (!socket.connected) socket.connect();
    socket.emit("watch:cart", productIds);

    const handleStockUpdate = (data: StockUpdatePayload) => {
      if (!productIds.includes(data.productId)) return;

      setStockMap((prev) => {
        const prevEntry = prev[data.productId];
        // Notify user only when availability *changes*
        if (prevEntry?.isAvailable && !data.isAvailable) {
          toast.error(`⚠️ An item in your cart just went out of stock.`);
        } else if (prevEntry && !prevEntry.isAvailable && data.isAvailable) {
          toast.success(`✅ An item in your cart is back in stock.`);
        }
        return {
          ...prev,
          [data.productId]: {
            stock: data.stock,
            isAvailable: data.isAvailable,
            isActive: data.isAvailable, // treat same as isAvailable for display
          },
        };
      });
    };

    socket.on("stock:update", handleStockUpdate);

    return () => {
      socket.off("stock:update", handleStockUpdate);
      (window as any).__socketCartProductIds = undefined;
    };
  }, [productIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  // Derive checkout eligibility
  const canCheckout =
    productIds.length > 0 &&
    productIds.every((id) => stockMap[id]?.isAvailable !== false);

  return { stockMap, isLoading, canCheckout };
}
