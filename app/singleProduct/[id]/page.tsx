"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ShoppingCart, Heart, Star, Truck, RotateCcw, Shield, Minus, Plus, Share2, Check } from "lucide-react";
import { apiClient } from "@/app/lib/api";
import { useCart } from "@/app/context/CartContext";
import { useToggleWishlist } from "@/app/hooks/useWishlistMutations";
import { useWishlistCheck } from "@/app/hooks/useWishlist";

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  images: string[];
  stock: number;
  category?: string;
  brand?: string;
  sellerName?: string;
  rating?: number;
  reviews?: number;
  discount?: number;
  tags?: string[];
  featured?: boolean;
}

interface ProductResponse {
  success: boolean;
  product: Product;
}

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";

export default function SingleProductPage() {
  const params = useParams();
  const productId = params?.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const { addToCart, getItemQuantity } = useCart();
  const { data: wishlistData } = useWishlistCheck(productId);
  const toggleWishlistMutation = useToggleWishlist();
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Fetch single product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<ProductResponse>(`/products/${productId}`);
        // Handle both wrapped and unwrapped responses
        const productData = response.product || response as any as Product;
        setProduct(productData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Update wishlisted state
  useEffect(() => {
    setIsWishlisted(wishlistData?.inWishlist || false);
  }, [wishlistData]);

  const currentQtyInCart = getItemQuantity(productId);
  const remainingStock = Math.max(0, (product?.stock || 0) - quantity - currentQtyInCart);
  const isOutOfStock = remainingStock < 0 || (product?.stock || 0) === 0;

  const handleAddToCart = async () => {
    if (!product || isOutOfStock) return;

    try {
      await addToCart({
        cartId: "",
        id: product.id,
        name: product.title,
        price: parseFloat(product.price),
        image: product.images?.[0] || "",
        stock: product.stock,
        slug: product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toggleWishlistMutation.mutate({
        productId,
        isCurrentlyWishlisted: false
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-lg font-semibold">{error || "Product not found"}</p>
        </div>
      </div>
    );
  }

  const discountPercentage = product.discount || 0;
  const originalPrice = parseFloat(product.price) / (1 - discountPercentage / 100);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <a href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Home</a>
          <span>/</span>
          <a href="/shop" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Shop</a>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Section */}
          <div className="flex flex-col gap-4">
            <div className="relative w-full aspect-square bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400">No image available</span>
                </div>
              )}

              {discountPercentage > 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                  -{discountPercentage}%
                </div>
              )}

              {product.featured && (
                <div className="absolute top-4 left-4 bg-linear-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg flex items-center gap-1">
                  ⭐ Featured
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? "border-blue-600 shadow-md"
                        : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                    }`}
                  >
                    <Image src={image} alt={`${product.title} ${idx}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {product.title}
                  </h1>
                  {product.brand && (
                    <p className="text-blue-600 dark:text-blue-400 font-semibold">{product.brand}</p>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={`${
                        i < Math.round(product.rating || 4)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  ({product.reviews || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  ${product.price}
                </span>
                {discountPercentage > 0 && (
                  <span className="text-xl text-gray-400 line-through">
                    ${originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-sm px-3 py-1 rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-6">
                {product.stock > 0 ? (
                  <>
                    <Check size={20} className="text-green-500" />
                    <span className="text-green-600 dark:text-green-400 font-semibold">In Stock</span>
                  </>
                ) : (
                  <>
                    <span className="text-red-600 dark:text-red-400 font-semibold">Out of Stock</span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                {product.description}
              </p>
            </div>

            {/* Category */}
            {product.category && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Category: </span>
                <span className="font-semibold text-gray-900 dark:text-white">{product.category}</span>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Quantity:</span>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity === 1 || isOutOfStock}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Minus size={18} className="text-gray-600 dark:text-gray-400" />
                </button>
                <span className="px-6 py-2 font-semibold text-gray-900 dark:text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(remainingStock, quantity + 1))}
                  disabled={isOutOfStock || remainingStock <= 0}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Plus size={18} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-300 text-white ${
                  isOutOfStock
                    ? "bg-gray-400 cursor-not-allowed"
                    : addedToCart
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl"
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check size={20} />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleWishlist}
                className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                  isWishlisted
                    ? "bg-red-50 dark:bg-red-950 border-red-500 text-red-600 dark:text-red-400"
                    : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-red-500 hover:text-red-600"
                }`}
              >
                <Heart size={24} className={isWishlisted ? "fill-current" : ""} />
              </button>

              <button className="p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 transition-all duration-300">
                <Share2 size={24} />
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700"></div>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex gap-3 items-start">
                <Truck size={24} className="text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Free Shipping</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">On orders over $50</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <RotateCcw size={24} className="text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Easy Returns</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">30-day return policy</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Shield size={24} className="text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Secure Payment</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">100% secure checkout</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
