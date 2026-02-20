// app/hooks/useSingleProduct.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export interface SingleProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  images: string[];
  featuredImage?: string;
  galleryImages?: string[];
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
  sellerId?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  sellerUserName?: string;
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
    // Always fetch fresh data on mount so featuredImage / galleryImages are never stale
    staleTime: 0,
    // Keep in cache for 5 minutes to avoid re-fetching on rapid navigations
    gcTime: 1000 * 60 * 5,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Only retry once on failure
    retry: 1,
  });
}


