// app/components/cards/OptimisticProductCard.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Loader2, Check, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSharedEnhancedCart } from "@/hooks/useSharedEnhancedCart";
import { useToggleWishlist } from "@/hooks/useWishlistMutations";
import { useWishlistQuery } from "@/hooks/useWishlist";

// --- INTERFACE DEFINITION (Fixes the TS Error) ---
export interface OptimisticProductCardProps {
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
  artistName?: string;
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
  artistName,
}: OptimisticProductCardProps) {
  // --- HOOKS & LOGIC ---
  const { 
    cartData,
    addToCart,
    subscribeToUpdates
  } = useSharedEnhancedCart();
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const [optimisticWishlist, setOptimisticWishlist] = useState<boolean | null>(null);
  const [optimisticAdded, setOptimisticAdded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [syncTrigger, setSyncTrigger] = useState(0);

  const { data: wishlistData } = useWishlistQuery();
  const toggleWishlistMutation = useToggleWishlist();

  // Subscribe to cart updates
  useEffect(() => {
    const unsubscribe = subscribeToUpdates(() => {
      setSyncTrigger(prev => prev + 1);
    });
    return unsubscribe;
  }, [subscribeToUpdates]);

  // Derived State
  const currentCartItem = useMemo(() => {
    return cartData?.cart.find(item => item.productId === id);
  }, [cartData, id, syncTrigger]);

  const qty = currentCartItem?.quantity || 0;
  const remainingStock = Math.max(0, (stock || 0) - qty);
  const isInCart = optimisticAdded || (qty > 0);
  const isOutOfStock = remainingStock === 0;

  // Check Wishlist Status
  const isWishlisted = useMemo(() => {
    if (optimisticWishlist !== null) return optimisticWishlist;
    if (!wishlistData) return false;
    
    const wishlistArray = Array.isArray(wishlistData) 
      ? wishlistData 
      : Array.isArray(wishlistData.wishlist) 
        ? wishlistData.wishlist 
        : [];
    
    return wishlistArray.some((item: any) => {
      return item.id === id || item.productId === id || item.product?.id === id;
    });
  }, [wishlistData, id, optimisticWishlist]);

  // Sync Optimistic State — reset in both directions:
  // qty > 0 means real cart confirmed, clear optimistic flag
  // qty === 0 means item was removed, revert CTA to "Add to Cart"
  useEffect(() => {
    if (qty === 0) {
      setOptimisticAdded(false);
    }
  }, [qty]);

  // --- HANDLERS ---

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock || isAddingToCart || isInCart) return;

    // 1. Start the loading animation
    setIsAddingToCart(true);

    // 2. Trigger the API call in the background (Fire & Forget)
    // We do NOT 'await' this for the UI. This prevents the "stuck" state.
    addToCart(id, {
      title: name,
      price: amount.toString(),
      images: [photo]
    }).catch((error) => {
      console.error('Failed to add to cart:', error);
      // If it fails, we revert the UI changes silently or show a toast
      setOptimisticAdded(false);
    });

    // 3. Force the UI to transition to "Success" after a smooth delay
    // This ensures the user NEVER gets stuck on loading, even if the server is slow.
    setTimeout(() => {
      setOptimisticAdded(true); // Show checkmark
      setIsAddingToCart(false); // Hide loader
    }, 600); // 600ms allows the user to see the spinner briefly (good feedback)
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isWishlisted) return;

    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 300);
    setOptimisticWishlist(true);

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

  // --- RENDER HELPERS ---
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={12}
            className={`${
              i < Math.floor(rating) 
                ? "fill-[#973c00] text-[#973c00]" // Brown star
                : "text-stone-300 fill-stone-100" // Muted empty star
            }`}
          />
        ))}
      </div>
    );
  };

  // --- COMPONENT JSX ---
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className={`group bg-white rounded-xl border border-stone-100 shadow-sm hover:shadow-xl hover:shadow-[#973c00]/5 transition-all duration-300 relative flex flex-col h-full overflow-hidden ${isOutOfStock ? "opacity-60 grayscale" : ""}`}
    >
      {/* IMAGE SECTION */}
      <div className="relative aspect-6/4 bg-stone-50 overflow-hidden">
        
        {/* PLATFORM IDENTITY LOGO (New Badge) */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
           {/* <div className="bg-white/80 backdrop-blur-md p-1 rounded-lg border border-stone-200 shadow-sm transition-transform group-hover:scale-110 duration-500">
             
           </div> */}
           <Image
               src="/images/navbarLogo.png"
               alt="Platform Logo"
               width={80}
               height={80}
               className="object-contain w-10"
             />
           
           {/* If you still want the 'Featured' text, we move it next to the logo or below it */}
           {featured && (
             <span className="bg-[#973c00] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 shadow-sm">
               Featured
             </span>
           )}
        </div>

        {/* Stock Warning - Kept on the right */}
        {!isOutOfStock && stock < 5 && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#973c00] text-[10px] font-bold px-2 py-1 rounded-full z-10 border border-[#973c00]/20">
            Low Stock
          </div>
        )}

        <Link
          href={`/shop/${slug || id}`}
          className="w-full h-full block"
        >
          <Image
            src={photo || "/images/placeholder.png"}
            alt={name}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/5 transition-colors duration-300" />
        </Link>
      </div>

      {/* DETAILS SECTION */}
      <div className="flex flex-col grow p-4 bg-white">
        {/* Header: Artist & Rating */}
        <div className="flex justify-between items-start mb-2">
           <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
             {artistName || "Collection"}
           </span>
           {renderStars(rating)}
        </div>

        {/* Title */}
        <h2 className="font-serif text-lg font-medium text-stone-800 mb-1 leading-tight group-hover:text-[#973c00] transition-colors">
          <Link href={`/shop/${slug || id}`}>
            {name}
          </Link>
        </h2>

        {/* Description */}
        <p className="text-xs text-stone-500 mb-3 line-clamp-2 font-light">
          {description}
        </p>

        {/* Tags - Brown Theme */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="bg-[#fdf4ef] text-[#973c00] border border-[#973c00]/10 text-[10px] px-2 py-0.5 rounded-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer: Price & Actions */}
        <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider font-medium">Price</span>
            <span className="font-medium text-lg text-stone-900">
              {formatPrice(amount)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Wishlist Button */}
            <button
              onClick={handleWishlist}
              disabled={isWishlisted}
              className={`p-2 rounded-full transition-all duration-300 relative group/btn ${
                isWishlisted 
                  ? "bg-stone-100 cursor-not-allowed" 
                  : "bg-white hover:bg-[#fdf4ef] border border-stone-200 hover:border-[#973c00]/20"
              }`}
            >
              <Heart
                size={18}
                className={`transition-all duration-300 ${
                  isWishlisted 
                    ? "fill-[#973c00] text-[#973c00]" 
                    : "text-stone-400 group-hover/btn:text-[#973c00]"
                } ${isHeartAnimating ? "scale-125" : ""}`}
              />
            </button>

            {/* Add to Cart Button */}
            <button
              onClick={handleAdd}
              disabled={isOutOfStock || isAddingToCart || isInCart}
              className={`
                relative h-10 px-4 min-w-25 rounded-full flex items-center justify-center transition-all duration-300
                ${isOutOfStock 
                  ? "bg-stone-200 text-stone-400 cursor-not-allowed" 
                  : isInCart
                    ? "bg-[#f8efe9] text-[#973c00] border border-[#973c00]/30 cursor-default"
                    : "bg-[#973c00] text-white hover:bg-[#7a3100] shadow-md hover:shadow-lg shadow-[#973c00]/20 active:scale-95"
                }
              `}
            >
              <AnimatePresence mode="wait">
                {isAddingToCart ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    <Loader2 size={16} className="animate-spin" />
                  </motion.div>
                ) : isInCart ? (
                  <motion.div
                    key="check"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5"
                  >
                    <Check size={14} strokeWidth={3} />
                    <span className="text-xs font-bold uppercase tracking-wide">Added</span>
                  </motion.div>
                ) : isOutOfStock ? (
                  <span className="text-xs font-bold uppercase tracking-wide">Sold Out</span>
                ) : (
                  <motion.div
                    key="add"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5"
                  >
                    <ShoppingBag size={14} />
                    <span className="text-xs font-bold uppercase tracking-wide">Add</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}