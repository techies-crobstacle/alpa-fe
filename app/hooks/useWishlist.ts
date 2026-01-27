// app/hooks/useWishlist.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { wishlistApi } from "@/app/lib/api";

export const wishlistQueryKeys = {
  wishlist: ["wishlist"] as const,
};

export function useWishlistQuery() {
  return useQuery({
    queryKey: wishlistQueryKeys.wishlist,
    queryFn: async () => {
      const data = await wishlistApi.getWishlist();
      // Ensure we always return an array
      return Array.isArray(data) ? data : Array.isArray(data?.wishlist) ? data.wishlist : [];
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}