// app/hooks/useWishlistMutations.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistApi } from "@/app/lib/api";

export const wishlistQueryKeys = {
  wishlist: ["wishlist"] as const,
};

interface WishlistItem {
  id: string;
  productId?: string;
  product?: { id: string };
}

// Add to wishlist with optimistic update (ADD-ONLY: once added, items cannot be removed)
export function useToggleWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, isCurrentlyWishlisted }: { productId: string; isCurrentlyWishlisted: boolean }) => {
      // Only allow adding to wishlist, not removing
      if (!isCurrentlyWishlisted) {
        console.log("Adding to wishlist, productId:", productId, typeof productId);
        // Convert to number if the API expects numeric IDs
        const numericId = parseInt(productId, 10);
        const idToSend = isNaN(numericId) ? productId : numericId;
        console.log("Sending ID:", idToSend, typeof idToSend);
        
        return wishlistApi.addToWishlist({ productId: idToSend });
      }
      // If already wishlisted, do nothing
      return Promise.resolve({ success: true, message: "Already in wishlist" });
    },
    // Optimistic update - immediately update UI
    onMutate: async ({ productId, isCurrentlyWishlisted }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: wishlistQueryKeys.wishlist });

      // Snapshot the previous value
      const previousWishlistData = queryClient.getQueryData(wishlistQueryKeys.wishlist);
      
      // Handle different response formats - ensure we work with an array
      const previousWishlist = Array.isArray(previousWishlistData)
        ? previousWishlistData
        : (previousWishlistData && typeof previousWishlistData === "object" && Array.isArray((previousWishlistData as any).wishlist))
          ? (previousWishlistData as any).wishlist
          : [];

      // Optimistically update the cache (add-only)
      let optimisticWishlist: WishlistItem[];
      if (isCurrentlyWishlisted) {
        // If already wishlisted, keep current state
        optimisticWishlist = previousWishlist;
      } else {
        // Add to wishlist
        const newItem: WishlistItem = {
          id: productId,
          productId: productId,
        };
        optimisticWishlist = [...previousWishlist, newItem];
      }

      queryClient.setQueryData(wishlistQueryKeys.wishlist, optimisticWishlist);

      // Return a context object with the snapshotted value and new state
      return { previousWishlist: previousWishlistData, newWishlistState: !isCurrentlyWishlisted };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, variables, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(wishlistQueryKeys.wishlist, context.previousWishlist);
      }
    },
    // Always refetch after error or success to ensure consistency
    onSettled: (data) => {
      // Handle the response data format
      if (data) {
        let serverData: WishlistItem[] = [];
        if (Array.isArray(data)) {
          serverData = data;
        } else if (
          typeof data === "object" &&
          data !== null &&
          "wishlist" in data &&
          Array.isArray((data as any).wishlist)
        ) {
          serverData = (data as any).wishlist;
        }
        queryClient.setQueryData(wishlistQueryKeys.wishlist, serverData);
      } else {
        queryClient.invalidateQueries({ queryKey: wishlistQueryKeys.wishlist });
      }
    },
  });
}