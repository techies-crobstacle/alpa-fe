// app/hooks/useWishlistMutations.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useCallback } from "react";
import { wishlistApi } from "@/app/lib/api";
import { wishlistQueryKeys } from "./useWishlist";

interface WishlistItem {
  id: string;
  productId?: string;
  product?: { id: string };
}

// Add to wishlist with debouncing and optimistic update
export function useToggleWishlist() {
  const queryClient = useQueryClient();
  const timeout = useRef<NodeJS.Timeout | null>(null);

  const mutation = useMutation({
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
      // Cancel any outgoing refetches for both main wishlist and product check
      await queryClient.cancelQueries({ queryKey: wishlistQueryKeys.wishlist });
      await queryClient.cancelQueries({ queryKey: wishlistQueryKeys.wishlistCheck(productId) });

      // Snapshot the previous values
      const previousWishlistData = queryClient.getQueryData(wishlistQueryKeys.wishlist);
      const previousCheckData = queryClient.getQueryData(wishlistQueryKeys.wishlistCheck(productId));
      
      // Handle different response formats - ensure we work with an array
      const previousWishlist = Array.isArray(previousWishlistData)
        ? previousWishlistData
        : (previousWishlistData && typeof previousWishlistData === "object" && Array.isArray((previousWishlistData as any).wishlist))
          ? (previousWishlistData as any).wishlist
          : [];

      // Optimistically update both caches (add-only)
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
        
        // Update the individual product check cache
        queryClient.setQueryData(wishlistQueryKeys.wishlistCheck(productId), { inWishlist: true });
      }

      queryClient.setQueryData(wishlistQueryKeys.wishlist, optimisticWishlist);

      // Return a context object with the snapshotted values
      return { 
        previousWishlist: previousWishlistData, 
        previousCheckData,
        newWishlistState: !isCurrentlyWishlisted,
        productId 
      };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, variables, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(wishlistQueryKeys.wishlist, context.previousWishlist);
      }
      if (context?.previousCheckData && context?.productId) {
        queryClient.setQueryData(wishlistQueryKeys.wishlistCheck(context.productId), context.previousCheckData);
      }
    },
    // Always refetch after error or success to ensure consistency
    onSettled: (data, error, variables) => {
      const { productId } = variables;
      
      // Invalidate both the main wishlist and the specific product check
      queryClient.invalidateQueries({ queryKey: wishlistQueryKeys.wishlist });
      queryClient.invalidateQueries({ queryKey: wishlistQueryKeys.wishlistCheck(productId) });
    },
  });

  // Debounced version of mutate
  const debouncedMutate = useCallback((variables: { productId: string; isCurrentlyWishlisted: boolean }) => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      mutation.mutate(variables);
    }, 300); // 300ms debounce for wishlist
  }, [mutation]);

  return { ...mutation, debouncedMutate };
}