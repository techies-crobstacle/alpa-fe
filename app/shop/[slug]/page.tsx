
"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ShoppingCart,
  Heart,
  Star,
  Truck,
  RotateCcw,
  Shield,
  Minus,
  Plus,
  Share2,
  Check,
  Loader2,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useSharedEnhancedCart } from "@/hooks/useSharedEnhancedCart";
import { useToggleWishlist } from "@/hooks/useWishlistMutations";
import { useWishlistCheck } from "@/hooks/useWishlist";
import { useSingleProduct } from "@/hooks/useSingleProduct";

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

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://alpa-be-1.onrender.com";


export default function ShopSlugPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.slug as string; // Using 'slug' param name but it's actually the ID now

  // Use React Query hook for single product data
  const { data: product, isLoading: loading, error: queryError } = useSingleProduct(id);
  const error = queryError?.message || null;

  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [ratingScore, setRatingScore] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingMessage, setRatingMessage] = useState("");
  const [ratings, setRatings] = useState<any[]>([]);
  const [ratingsLoading, setRatingsLoading] = useState(true);
  const [ratingsError, setRatingsError] = useState<string | null>(null);

  // Use shared enhanced cart
  const { addToCart, cartData, loading: cartLoading } = useSharedEnhancedCart();
  const { data: wishlistData } = useWishlistCheck(product?.id || "");
  const toggleWishlistMutation = useToggleWishlist();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Fetch all ratings for this product
  useEffect(() => {
    const fetchRatings = async () => {
      if (!id) return;
      try {
        setRatingsLoading(true);
        setRatingsError(null);
        const response = await apiClient.get<any>(
          `/ratings/products/${id}/ratings`
        );
        if (response && Array.isArray(response.ratings)) {
          setRatings(response.ratings);
        } else if (response && response.data && Array.isArray(response.data.ratings)) {
          setRatings(response.data.ratings);
        } else {
          setRatings([]);
        }
      } catch (err) {
        setRatingsError(
          err instanceof Error ? err.message : "Failed to fetch ratings"
        );
        setRatings([]);
      } finally {
        setRatingsLoading(false);
      }
    };
    fetchRatings();
  }, [id]);

  // Update wishlisted state
  useEffect(() => {
    setIsWishlisted(wishlistData?.inWishlist || false);
  }, [wishlistData]);

  // Navigation helpers
  const handleBackToShop = () => {
    const search = searchParams.get('search');
    const filters = searchParams.get('filters');
    const tab = searchParams.get('tab');
    
    const queryParams = new URLSearchParams();
    if (search) queryParams.set('search', search);
    if (filters) queryParams.set('filters', filters);
    if (tab) queryParams.set('tab', tab);
    
    const queryString = queryParams.toString();
    router.push(queryString ? `/shop?${queryString}` : '/shop');
  };

  // Check if item is in cart
  const cartItem = cartData?.cart.find(item => item.productId === product?.id);
  const currentQtyInCart = cartItem?.quantity || 0;
  
  const remainingStock = Math.max(
    0,
    (product?.stock || 0) - currentQtyInCart,
  );
  const isOutOfStock = remainingStock === 0;

  const handleAddToCart = async () => {
    if (!product || isOutOfStock || isAddingToCart) return;

    try {
      setIsAddingToCart(true);
      await addToCart(product.id, {
        title: product.title,
        price: product.price,
        images: product.images,
      });

      setAddedToCart(true);
      
      // Dispatch event to open mini cart
      window.dispatchEvent(new CustomEvent("open-cart"));
      
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (err) {
      console.error("Error adding to cart:", err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // Use debounced mutation for better performance
    toggleWishlistMutation.debouncedMutate({
      productId: product?.id || "",
      isCurrentlyWishlisted: isWishlisted,
    });
  };

  // Removed quantity handlers since we removed quantity selection

  const handleSubmitRating = async () => {
    if (!product || ratingScore === 0 || review.trim() === "") {
      setRatingMessage("Please provide both a rating and review");
      return;
    }

    try {
      setIsSubmittingRating(true);
      const response = await apiClient.post(
        `/ratings/products/${product.id}/rate`,
        {
          rating: ratingScore,
          review: review,
        }
      );

      if (response) {
        setRatingMessage("Thank you! Your rating has been submitted successfully.");
        setRatingScore(0);
        setReview("");
        setTimeout(() => setRatingMessage(""), 3000);
      }
    } catch (err) {
      setRatingMessage(
        err instanceof Error ? err.message : "Failed to submit rating"
      );
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Skeleton Loading Component
  const SkeletonLoader = () => (
    <div className="min-h-screen bg-[#ebe3d5] py-8 pt-36">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb Skeleton */}
        <div className="mb-6">
          <div className="h-4 bg-amber-200 rounded w-64 animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Section Skeleton */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full bg-amber-100 rounded-2xl overflow-hidden animate-pulse"></div>

            {/* Thumbnail Gallery Skeleton */}
            <div className="flex gap-3">
              {[...Array(4)].map((_, idx) => (
                <div
                  key={idx}
                  className="w-20 h-20 bg-amber-100 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          </div>

          {/* Details Section Skeleton */}
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="space-y-3">
              <div className="h-8 bg-amber-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-6 bg-amber-100 rounded w-32 animate-pulse"></div>
            </div>

            {/* Rating Skeleton */}
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-5 h-5 bg-amber-200 rounded animate-pulse"
                ></div>
              ))}
              <div className="h-4 bg-amber-200 rounded w-24 ml-2 animate-pulse"></div>
            </div>

            {/* Price Skeleton */}
            <div className="h-10 bg-amber-200 rounded w-40 animate-pulse"></div>

            {/* Stock Status Skeleton */}
            <div className="h-6 bg-green-100 rounded w-24 animate-pulse"></div>

            {/* Description Skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-amber-100 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-amber-100 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-amber-100 rounded w-4/6 animate-pulse"></div>
            </div>

            {/* Category Skeleton */}
            <div className="h-6 bg-amber-100 rounded w-48 animate-pulse"></div>

            {/* Quantity Skeleton */}
            <div className="h-12 bg-amber-100 rounded w-48 animate-pulse"></div>

            {/* Action Buttons Skeleton */}
            <div className="flex gap-3">
              <div className="h-12 bg-amber-200 rounded-lg flex-1 animate-pulse"></div>
              <div className="h-12 w-12 bg-amber-200 rounded-lg animate-pulse"></div>
              <div className="h-12 w-12 bg-amber-200 rounded-lg animate-pulse"></div>
            </div>

            {/* Divider */}
            <div className="h-px bg-amber-200 animate-pulse"></div>

            {/* Benefits Skeleton */}
            <div className="space-y-4">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-200 rounded-lg animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-amber-200 rounded w-32 animate-pulse"></div>
                    <div className="h-4 bg-amber-100 rounded w-48 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-linear-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-amber-200">
          <p className="text-xl font-semibold text-amber-900 mb-2">
            {error || "Product not found"}
          </p>
          <p className="text-amber-700">
            Please check the URL and try again.
          </p>
        </div>
      </div>
    );
  }

  const discountPercentage = typeof product.discount === "number" ? product.discount : 0;
  const originalPrice =
    parseFloat(product.price) / (1 - discountPercentage / 100);

  return (
    <div className="min-h-screen bg-[#ebe3d5] py-8 pt-36">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb with Navigation */}
        <div className="flex justify-between items-center mb-6">
          <nav className="text-sm text-amber-700">
            <span 
              className="hover:text-amber-900 cursor-pointer transition"
              onClick={() => router.push('/')}
            >
              Home
            </span>
            <span className="mx-2">/</span>
            <span 
              className="hover:text-amber-900 cursor-pointer transition"
              onClick={handleBackToShop}
            >
              Shop
            </span>
            <span className="mx-2">/</span>
            <span className="font-medium text-amber-900">{product.title}</span>
          </nav>

          {/* Navigation Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleBackToShop}
              className="px-4 py-2 text-sm font-medium text-amber-700 hover:text-amber-900 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors"
            >
              ← Back to Shop
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Section - Now on LEFT */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full bg-white rounded-2xl overflow-hidden shadow-lg border border-amber-200">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-amber-50">
                  <p className="text-amber-600">No image available</p>
                </div>
              )}

              {discountPercentage > 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                  -{discountPercentage}%
                </div>
              )}

              {product.featured && (
                <div className="absolute top-4 left-4 bg-linear-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md flex items-center gap-1">
                  ⭐ Featured
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? "border-amber-600 shadow-md ring-2 ring-amber-300"
                        : "border-amber-300 hover:border-amber-500"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} - ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section - Now on RIGHT */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-amber-900 mb-2">
                {product.title}
              </h1>
              
              {/* Artist Name */}
              {product.artistName && (
                <div className="mb-2 flex flox-row items-center gap-3">
                  <p className="text-sm text-gray-600">Artist Name:</p>
                  <h2 className="text-lg font-semibold text-[#441208]">
                    {product.artistName}
                  </h2>
                </div>
              )}
              
              {product.brand && (
                <p className="text-amber-700 font-medium bg-amber-100 inline-block px-3 py-1 rounded-full text-sm">
                  {product.brand}
                </p>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating || 4)
                      ? "fill-amber-500 text-amber-500"
                      : "text-amber-300"
                  }`}
                />
              ))}
              <span className="text-amber-700 text-sm ml-2">
                ({product.reviews || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-amber-900">
                ${product.price}
              </span>
              {discountPercentage > 0 && (
                <span className="text-xl text-amber-600 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div>
                {/* <h3 className="text-lg font-semibold text-amber-900 mb-2">Tags:</h3> */}
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded-full font-medium border border-amber-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium">
                    In Stock ({product.stock} available)
                  </span>
                </>
              ) : (
                <>
                  <span className="w-5 h-5 text-red-600">✕</span>
                  <span className="text-red-700 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Description */}
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-amber-900 mb-2">
                Description
              </h3>
              <p className="text-amber-800 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Category */}
            {product.category && (
              <div className="text-amber-800">
                <span className="font-semibold">Category:</span>{" "}
                <span className="text-amber-700 bg-amber-100 px-3 py-1 rounded-full text-sm">
                  {product.category}
                </span>
              </div>
            )}

            {/* Seller Information */}
            {(product.sellerName || product.seller?.name) && (
              <div className="">
                <h3 className="font-semibold text-amber-900 mb-2">
                  Sold by
                </h3>
                <p className="text-amber-800 font-medium">
                  {product.seller?.name || product.sellerName}
                </p>
              </div>
            )}

            {/* Quantity Selector */}
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAddingToCart}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition shadow-md flex items-center justify-center ${
                  addedToCart
                    ? "bg-green-500 text-white cursor-default"
                    : isOutOfStock
                      ? "bg-amber-200 text-amber-500 cursor-not-allowed"
                      : "bg-amber-600 text-white hover:bg-amber-700 active:scale-95"
                }`}
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                    Adding...
                  </>
                ) : addedToCart ? (
                  <>
                    <Check className="w-5 h-5 inline mr-2" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 inline mr-2" />
                    Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleWishlist}
                className={`p-3 rounded-lg border-2 transition shadow-md ${
                  isWishlisted
                    ? "bg-red-50 border-red-400 text-red-600"
                    : "bg-white border-amber-300 text-amber-600 hover:bg-amber-50 hover:border-amber-400"
                }`}
              >
                <Heart
                  className={`w-6 h-6 ${isWishlisted ? "fill-current" : ""}`}
                />
              </button>

              <button className="p-3 rounded-lg border-2 border-amber-300 text-amber-600 hover:bg-amber-50 hover:border-amber-400 transition shadow-md bg-white">
                <Share2 className="w-6 h-6" />
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-amber-200"></div>

            {/* Benefits */}
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="p-2 bg-amber-200 rounded-lg">
                  <Truck className="w-6 h-6 text-amber-800" />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900">
                    Free Shipping
                  </h4>
                  <p className="text-sm text-amber-700">On orders over $100</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="p-2 bg-amber-200 rounded-lg">
                  <RotateCcw className="w-6 h-6 text-amber-800" />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900">Easy Returns</h4>
                  <p className="text-sm text-amber-700">
                    30-day return policy
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="p-2 bg-amber-200 rounded-lg">
                  <Shield className="w-6 h-6 text-amber-800" />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900">
                    Secure Payment
                  </h4>
                  <p className="text-sm text-amber-700">
                    100% secure checkout
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Width Sections Below */}
        <div className="mt-12 space-y-8">
          {/* Ratings & Reviews Section - Full Width */}
          <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-4 text-lg">
              Customer Ratings & Reviews
            </h3>
            {ratingsLoading ? (
              <div className="text-amber-700">Loading reviews...</div>
            ) : ratingsError ? (
              <div className="text-red-700">{ratingsError}</div>
            ) : ratings.length === 0 ? (
              <div className="text-amber-700">No reviews yet. Be the first to rate this product!</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ratings.map((r, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-lg border border-amber-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      {[1,2,3,4,5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= (r.rating || 0) ? "fill-amber-500 text-amber-500" : "text-amber-200"}`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-amber-700 font-medium mb-2">
                      {r.user?.name || r.userName || "Anonymous"}
                    </div>
                    <div className="text-amber-900 text-sm mb-2">
                      {r.comment}
                    </div>
                    {r.createdAt && (
                      <div className="text-xs text-amber-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rating Section - Full Width */}
          <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-4 text-lg">
              Rate This Product
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Star Rating */}
              <div>
                <label className="block text-amber-900 font-medium mb-2">
                  Your Rating (1-5 stars)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingScore(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= ratingScore
                            ? "fill-amber-500 text-amber-500"
                            : "text-amber-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {ratingScore > 0 && (
                  <p className="text-amber-700 text-sm mt-2">
                    You selected {ratingScore} star{ratingScore !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-amber-900 font-medium mb-2">
                  Your Review
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your experience with this product..."
                  maxLength={500}
                  className="w-full p-3 border border-amber-300 rounded-lg bg-white text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none"
                  rows={4}
                />
                <p className="text-amber-700 text-sm mt-1">
                  {review.length}/500 characters
                </p>
              </div>
            </div>

            {/* Message */}
            {ratingMessage && (
              <p
                className={`text-sm mt-4 mb-3 p-2 rounded ${
                  ratingMessage.includes("successfully")
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {ratingMessage}
              </p>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmitRating}
              disabled={isSubmittingRating || ratingScore === 0 || review.trim() === ""}
              className="w-full md:w-auto mt-4 px-8 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSubmittingRating ? "Submitting..." : "Submit Rating"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}