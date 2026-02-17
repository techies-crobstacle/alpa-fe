// app/hooks/useSingleProduct.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/lib/api";

export interface SingleProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  images: string[];
  stock: number;
  category?: string;
  brand?: string;
  sellerName?: string;
  artistName?: string;
  rating?: number;
  reviews?: number;
  discount?: number | boolean;
  tags?: string[];
  featured?: boolean;
  seller?: {
    id: string;
    name: string;
    email: string;
  };
}

interface ProductResponse {
  success: boolean;
  product: SingleProduct;
}

export const singleProductQueryKeys = {
  all: ["product"] as const,
  detail: (id: string) => [...singleProductQueryKeys.all, id] as const,
};

export function useSingleProduct(productId: string | undefined) {
  return useQuery({
    queryKey: singleProductQueryKeys.detail(productId || ""),
    queryFn: async (): Promise<SingleProduct> => {
      if (!productId) throw new Error("Product ID is required");
      
      const response = await apiClient.get<ProductResponse>(`/products/${productId}`);
      
      // Handle both wrapped and unwrapped responses
      const productData = response.product || (response as any as SingleProduct);
      
      return {
        ...productData,
        stock: productData.stock ?? 0, // Ensure stock is always present
      };
    },
    // Only fetch if we have a productId
    enabled: !!productId,
    // Cache product for 30 minutes since it's a specific product
    staleTime: 1000 * 60 * 30,
    // Keep in cache for 2 hours
    gcTime: 1000 * 60 * 120,
    // Never refetch automatically
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Only retry once on failure
    retry: 1,
  });
}
