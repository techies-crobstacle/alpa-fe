// app/hooks/useWishlist.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { wishlistApi } from "@/app/lib/api";

export const wishlistQueryKeys = {
  wishlist: ["wishlist"] as const,
  wishlistCheck: (productId: string | number) => ["wishlist", "check", productId] as const,
};

export function useWishlistQuery() {
  // Always call useQuery - never conditionally
  // The queryFn will return empty array if no token
  return useQuery({
    queryKey: wishlistQueryKeys.wishlist,
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        return []; // Return empty array if not authenticated
      }
      const data = await wishlistApi.getWishlist();
      // Ensure we always return an array
      return Array.isArray(data) ? data : Array.isArray((data as any)?.wishlist) ? (data as any).wishlist : [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

// Hook to check if a product is in the wishlist using the fast API
import { useQuery as useCheckQuery } from "@tanstack/react-query";
export function useWishlistCheck(productId: string | number) {
  return useCheckQuery({
    queryKey: wishlistQueryKeys.wishlistCheck(productId),
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token || !productId) {
        return { inWishlist: false };
      }
      return wishlistApi.checkWishlist(productId);
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}