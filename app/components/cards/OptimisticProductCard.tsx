// app/components/cards/OptimisticProductCard.tsx
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Minus, Plus, Heart, Star, Loader2 } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useOptimisticAddToCart, useOptimisticUpdateCart } from "@/app/hooks/useCartMutations";
import { useToggleWishlist } from "@/app/hooks/useWishlistMutations";
import { useWishlistQuery } from "@/app/hooks/useWishlist";

interface OptimisticProductCardProps {
  id: string;
  photo: string;
  name: string;
  description: string;
  amount: number;
  stock?: number;
  slug?: string;
  rating?: number;
}

export default function OptimisticProductCard({
  id,
  photo,
  name,
  description,
  amount,
  stock = 50,
  slug,
  rating = 4.5,
}: OptimisticProductCardProps) {
  const { getItemQuantity } = useCart();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const [optimisticWishlist, setOptimisticWishlist] = useState<boolean | null>(null);

  // React Query hooks
  const { data: wishlistData } = useWishlistQuery();
  const addToCartMutation = useOptimisticAddToCart();
  const updateCartMutation = useOptimisticUpdateCart();
  const toggleWishlistMutation = useToggleWishlist();

  // Fast wishlist check using React Query data
  const isWishlisted = useMemo(() => {
    if (optimisticWishlist !== null) return optimisticWishlist;
    if (!wishlistData) return false;
    
    // Handle different response formats
    const wishlistArray = Array.isArray(wishlistData) 
      ? wishlistData 
      : Array.isArray(wishlistData.wishlist) 
        ? wishlistData.wishlist 
        : [];
    
    return wishlistArray.some((item: any) => {
      return item.id === id || item.productId === id || item.product?.id === id;
    });
  }, [wishlistData, id, optimisticWishlist]);

  const qty = getItemQuantity(id);
  const remainingStock = Math.max(0, (stock || 0) - qty);
  const isInCart = qty > 0;
  const isOutOfStock = remainingStock === 0;

  // Loading states for specific buttons
  const isAddToCartLoading = addToCartMutation.isPending;
  const isUpdateCartLoading = updateCartMutation.isPending;
  const isWishlistLoading = toggleWishlistMutation.isPending;

  /* ---------- INSTANT ADD TO CART ---------- */
  const handleAdd = async () => {
    if (isOutOfStock) return;

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    // Immediate UI feedback - the cart context handles optimistic updates
    addToCartMutation.mutate({
        id,
        name,
        price: amount,
        image: photo,
        slug,
        cartId: ""
    });
  };

  /* ---------- INSTANT QUANTITY CHANGES ---------- */
  const handleIncrease = () => {
    if (isOutOfStock) return;
    updateCartMutation.mutate({ productId: id, change: 1 });
  };

  const handleDecrease = () => {
    updateCartMutation.mutate({ productId: id, change: -1 });
  };

  /* ---------- INSTANT WISHLIST TOGGLE ---------- */
  const handleWishlist = async () => {
    // Don't allow removing from wishlist once added
    if (isWishlistLoading || isWishlisted) return;

    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 300);

    // Immediate UI update - only for adding
    setOptimisticWishlist(true);

    try {
      await toggleWishlistMutation.mutateAsync({
        productId: id,
        isCurrentlyWishlisted: isWishlisted,
      });
      // Reset optimistic state on success
      setOptimisticWishlist(null);
    } catch (error) {
      // Revert on error
      setOptimisticWishlist(null);
      console.error("Error adding to wishlist:", error);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(price);

  /* ---------- RENDER STARS ---------- */
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star
            key={i}
            size={14}
            className="fill-amber-500 text-amber-500 sm:w-4 sm:h-4"
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star size={14} className="text-gray-300 sm:w-4 sm:h-4" />
            <div className="absolute top-0 left-0 overflow-hidden w-1/2">
              <Star size={14} className="fill-amber-500 text-amber-500 sm:w-4 sm:h-4" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} size={14} className="text-gray-300 sm:w-4 sm:h-4" />
        );
      }
    }
    return stars;
  };

  return (
    <div className="group bg-white p-1 rounded-xl shadow-sm hover:shadow-lg transition relative flex flex-col h-full">
      {/* IMAGE CONTAINER */}
      <div className="relative mb-4 sm:mb-6 rounded-lg overflow-hidden bg-gray-50 grow flex items-center justify-center min-h-50 sm:min-h-55 md:min-h-60 lg:min-h-65">
        {slug ? (
          <Link
            href={`/shop/${slug}`}
            className="w-full h-full flex items-center justify-center sm:p-4"
          >
            <div className="relative w-full h-full">
              <Image
                src={photo || "/images/placeholder.png"}
                alt={name}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
          </Link>
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={photo || "/images/placeholder.png"}
              alt={name}
              fill
              className="object-contain p-1 sm:p-2 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
        )}
      </div>

      {/* INFO SECTION */}
      <div className="flex flex-col grow p-3">
        <Image
          className="absolute w-12 top-4 left-2"
          width={200}
          height={200}
          src="/images/navbarLogo.png"
          alt=""
        />
        <h2 className="font-bold text-base sm:text-lg text-gray-800 mb-1 line-clamp-1">
          {slug ? (
            <Link
              href={`/shop/${slug}`}
              className="hover:text-amber-900 transition-colors"
            >
              {name}
            </Link>
          ) : (
            name
          )}
        </h2>

        <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2 grow">
          {description}
        </p>

        <div className="flex flex-row justify-between items-center mb-1">
          {/* RATING STARS */}
          <div className="flex items-center gap-1 ">
            {renderStars()}
            <span className="text-xs sm:text-sm text-gray-600 ml-1">
              ({rating.toFixed(1)})
            </span>
          </div>
          <div><h3 className="text-sm text-red-600 font-bold">{stock} left</h3></div>
        </div>

        {/* PRICE + WISHLIST + CART */}
        <div className="flex justify-between items-center mt-auto pt-3">
          <span className="font-bold text-lg sm:text-xl text-gray-900">
            {formatPrice(amount)}
          </span>

          <div className="flex items-center gap-2">
            {/* WISHLIST BUTTON */}
            <button
              onClick={handleWishlist}
              disabled={isWishlistLoading || isWishlisted}
              className={`p-1.5 sm:p-2 rounded-full transition-all flex items-center justify-center ${
                isWishlisted 
                  ? "bg-gray-400 cursor-not-allowed opacity-70" 
                  : "bg-amber-900 hover:bg-amber-800"
              } ${isHeartAnimating ? "scale-125" : ""}`}
              aria-label={isWishlisted ? "Already in wishlist" : "Add to wishlist"}
              title={isWishlisted ? "Item is already in your wishlist" : "Add to wishlist"}
            >
              {isWishlistLoading ? (
                <Loader2 size={16} className="sm:w-5 sm:h-5 animate-spin text-[#e7d0b0]" />
              ) : (
                <Heart
                  size={16}
                  className={`sm:w-5 sm:h-5 transition-all ${isWishlisted ? "fill-[#e74c3c] text-[#e74c3c]" : "fill-none text-[#e7d0b0]"}`}
                  strokeWidth={isWishlisted ? 0 : 2}
                />
              )}
            </button>

            {/* CART BUTTON/CONTROLS */}
            {isInCart ? (
              <div
                className={`flex items-center gap-1 sm:gap-2 bg-amber-900 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-full transition-all ${
                  isAnimating ? "scale-105" : ""
                }`}
              >
                <button
                  onClick={handleDecrease}
                  disabled={isUpdateCartLoading}
                  className="p-1 hover:bg-amber-800 rounded-full transition-colors disabled:opacity-70"
                  aria-label="Decrease quantity"
                >
                  {isUpdateCartLoading ? (
                    <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin" />
                  ) : (
                    <Minus size={14} className="sm:w-4 sm:h-4" />
                  )}
                </button>

                <span className="min-w-4 sm:min-w-5 text-center font-bold text-sm sm:text-base">
                  {qty}
                </span>

                <button
                  onClick={handleIncrease}
                  disabled={isOutOfStock || isUpdateCartLoading}
                  className="p-1 hover:bg-amber-800 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                >
                  {isUpdateCartLoading ? (
                    <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin" />
                  ) : (
                    <Plus size={14} className="sm:w-4 sm:h-4" />
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                disabled={isOutOfStock || isAddToCartLoading}
                className={`p-1.5 sm:p-2 rounded-full transition-all flex items-center justify-center ${
                  isOutOfStock || isAddToCartLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-amber-900 text-white hover:bg-amber-800 active:scale-95"
                }`}
                aria-label={isOutOfStock ? "Out of stock" : isAddToCartLoading ? "Adding to cart..." : "Add to cart"}
              >
                {isAddToCartLoading ? (
                  <Loader2 color="#e7d0b0" size={16} className="sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <ShoppingCart color="#e7d0b0" fill="#e7d0b0" size={16} className="sm:w-5 sm:h-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}




