// app/components/cards/OptimisticProductCard.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Minus, Plus, Heart, Star, Loader2, Check } from "lucide-react";
import { useSharedEnhancedCart } from "@/app/hooks/useSharedEnhancedCart";
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
  tags?: string[];
  featured?: boolean;
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
  tags = [],
  featured = false,
}: OptimisticProductCardProps) {
  // Use shared enhanced cart for real-time synchronization
  const { 
    cartData,
    updateQuantity,
    addToCart,
    loading,
    subscribeToUpdates
  } = useSharedEnhancedCart();
  
  // Local state for UI animations and loading
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const [optimisticWishlist, setOptimisticWishlist] = useState<boolean | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [syncTrigger, setSyncTrigger] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // React Query hooks for wishlist
  const { data: wishlistData } = useWishlistQuery();
  const toggleWishlistMutation = useToggleWishlist();

  // Subscribe to cart updates for real-time sync
  useEffect(() => {
    const unsubscribe = subscribeToUpdates(() => {
      setSyncTrigger(prev => prev + 1);
    });
    return unsubscribe;
  }, [subscribeToUpdates]);

  // Get current quantity from enhanced cart data
  const currentCartItem = useMemo(() => {
    return cartData?.cart.find(item => item.productId === id);
  }, [cartData, id, syncTrigger]);

  const qty = currentCartItem?.quantity || 0;
  const remainingStock = Math.max(0, (stock || 0) - qty);
  const isInCart = qty > 0;
  const isOutOfStock = remainingStock === 0;

  // Loading states for specific buttons
  const isWishlistLoading = toggleWishlistMutation.isPending;

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

  /* ---------- REAL-TIME ADD TO CART ---------- */
  const handleAdd = async () => {
    if (isOutOfStock || isAddingToCart) return;

    setIsAnimating(true);
    setIsAddingToCart(true);
    
    try {
      // Add item to cart using the shared enhanced cart
      await addToCart(id, {
        title: name,
        price: amount.toString(),
        images: [photo]
      });
      
      // Show success indicator
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      
      // Visual feedback
      setTimeout(() => setIsAnimating(false), 300);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  /* ---------- INSTANT WISHLIST TOGGLE ---------- */
  const handleWishlist = () => {
    // Don't allow if already wishlisted
    if (isWishlisted) return;

    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 300);

    // Immediate UI update - instantly fill the heart
    setOptimisticWishlist(true);

    // Use debounced mutation in background without blocking UI
    toggleWishlistMutation.debouncedMutate({
      productId: id,
      isCurrentlyWishlisted: false,
    });
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(price);

  /* ---------- RENDER STARS ---------- */
  const renderStars = (rating: number) => {
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
      {/* Cart sync overlay */}
      {isAddingToCart && (
        <div className="absolute inset-0 bg-amber-100/30 rounded-xl z-10 flex items-center justify-center">
          <div className="bg-amber-900 text-white px-3 py-1 rounded-full flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" />
            <span className="text-xs font-medium">Adding to cart...</span>
          </div>
        </div>
      )}

      {/* Success indicator */}
      {showSuccess && (
        <div className="absolute inset-0 bg-green-100/30 rounded-xl z-10 flex items-center justify-center">
          <div className="bg-green-600 text-white px-3 py-1 rounded-full flex items-center gap-2">
            <div className="h-3 w-3 bg-green-300 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium">Added to cart!</span>
          </div>
        </div>
      )}
      
      {/* Real-time sync indicator */}
      {/* <div className="absolute top-1 left-1 z-20">
        <div className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-lg px-2 py-1">
          <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] text-green-700 font-medium">Live</span>
        </div>
      </div> */}

      {/* IMAGE CONTAINER */}
      <div className="relative mb-2 sm:mb-3 rounded-lg overflow-hidden bg-gray-50 grow flex items-center justify-center min-h-50 sm:min-h-55 md:min-h-60 lg:min-h-65">
        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-2 right-2 bg-linear-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-lg">
            ⭐ Featured
          </div>
        )}
        <Link
          href={`/shop/${id}`}
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
          <Link
            href={`/shop/${id}`}
            className="hover:text-amber-900 transition-colors"
          >
            {name}
          </Link>
        </h2>

        <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2 grow">
          {description}
        </p>

        {/* TAGS */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="text-gray-500 text-xs self-center">+{tags.length - 2}</span>
            )}
          </div>
        )}

        <div className="flex flex-row justify-between items-center mb-1">
          {/* RATING STARS */}
          <div className="flex items-center gap-1 ">
            {renderStars(rating)}
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
              disabled={isWishlisted}
              className={`p-1.5 sm:p-2 rounded-full transition-all flex items-center justify-center ${
                isWishlisted 
                  ? "bg-gray-400 cursor-not-allowed opacity-70" 
                  : "bg-amber-900 hover:bg-amber-800 active:scale-95"
              } ${isHeartAnimating ? "scale-125" : ""}`}
              aria-label={isWishlisted ? "Already in wishlist" : "Add to wishlist"}
              title={isWishlisted ? "Item is already in your wishlist" : "Add to wishlist"}
            >
              <Heart
                size={16}
                className={`sm:w-5 sm:h-5 transition-all ${isWishlisted ? "fill-[#e74c3c] text-[#e74c3c]" : "fill-none text-[#e7d0b0]"}`}
                strokeWidth={isWishlisted ? 0 : 2}
              />
            </button>

            {/* CART BUTTON */}
            <div className="relative">
              {/* Success tick overlay */}
              {isInCart && (
                <div className="absolute -top-1 -right-1 z-10 flex items-center justify-center">
                  <div className="bg-green-500 rounded-full p-0.5 shadow-sm animate-pulse">
                    <Check size={10} className="text-white" strokeWidth={3} />
                  </div>
                </div>
              )}
              
              <button
                onClick={handleAdd}
                disabled={isOutOfStock || isAddingToCart || isInCart}
                className={`relative p-1.5 sm:p-2 rounded-full transition-all flex items-center justify-center ${
                  isOutOfStock || isAddingToCart || isInCart
                    ? "bg-gray-400 cursor-not-allowed opacity-70"
                    : "bg-amber-900 text-white hover:bg-amber-800 active:scale-95"
                } ${isAnimating ? "scale-110" : ""}`}
                aria-label={isInCart ? "Already in cart" : isOutOfStock ? "Out of stock" : isAddingToCart ? "Adding to cart..." : "Add to cart"}
                title={isInCart ? "Item is already in your cart" : isOutOfStock ? "Item is out of stock" : "Add to cart"}
              >
                {isAddingToCart ? (
                  <Loader2 color="#e7d0b0" size={16} className="sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <ShoppingCart 
                    color="#e7d0b0" 
                    fill="#e7d0b0" 
                    size={16} 
                    className="sm:w-5 sm:h-5" 
                  />
                )}
              </button>
            </div>

            {/* Show quantity if item is already in cart */}
            {/* {isInCart && (
              <div className="bg-gray-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                {qty}
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
}

