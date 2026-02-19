// app/hooks/useProducts.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export interface Product {
  discount: boolean;
  id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  stock: number;
  images: string[];
  brand?: string;
  slug?: string;
  tags?: string[];
  featured?: boolean;
  artistName?: string;
  sellerName?: string;
}

export const productQueryKeys = {
  products: ["products"] as const,
  allProducts: ["products", "all"] as const,
};

export function useProducts() {
  return useQuery({
    queryKey: productQueryKeys.allProducts,
    queryFn: async (): Promise<Product[]> => {
      const data = await apiClient.get<{ products: Product[] }>("/products/all");
      
      // Extract brand from title if not provided and add slug
      return data.products.map((product: Product) => ({
        ...product,
        stock: product.stock ?? 0, // Ensure stock is always present
        brand: product.brand || product.title.split(" ")[0],
        slug: product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      }));
    },
    // Cache products for 20 minutes since they don't change frequently
    staleTime: 1000 * 60 * 20,
    // Keep in cache for 1 hour
    gcTime: 1000 * 60 * 60,
    // Never refetch automatically
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Only retry once on failure
    retry: 1,
  });
}