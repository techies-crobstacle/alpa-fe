// app/components/MiniCart.tsx
"use client";

import Image from "next/image";
import { X, Plus, Minus, ShoppingBag, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useMemo } from "react";
import { useSharedEnhancedCart } from "@/app/hooks/useSharedEnhancedCart";
import confetti from "canvas-confetti";

export default function MiniCart({ onClose }: { onClose: () => void }) {
  const {
    cartData,
    loading,
    calculateTotals,
    updateQuantity,
    removeItem,
    fetchCartData,
    subscribeToUpdates,
  } = useSharedEnhancedCart();
  
  // Stable sorted cart items to prevent shuffling
  const cartItems = useMemo(() => {
    const items = cartData?.cart || [];
    // Sort by productId to maintain stable order regardless of API response order
    return [...items].sort((a, b) => a.productId.localeCompare(b.productId));
  }, [cartData?.cart]);
  
  const { subtotal } = calculateTotals;
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const router = useRouter();
  const confettiTriggered = useRef(false);

  const [syncTrigger, setSyncTrigger] = useState(0);

  // Subscribe to cart updates for real-time sync
  useEffect(() => {
    const unsubscribe = subscribeToUpdates(() => {
      // Force a re-render when cart updates from other components
      setSyncTrigger(prev => prev + 1);
      console.log('MiniCart synced with cart updates from other components');
    });

    return unsubscribe;
  }, [subscribeToUpdates]);

  // Optimized quantity update with loading state
  const handleQuantityUpdate = async (productId: string, newQuantity: number) => {
    setUpdatingItems(prev => new Set(prev).add(productId));
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      console.error("Failed to update quantity:", error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // Optimized remove with loading state
  const handleRemoveItem = async (productId: string) => {
    setUpdatingItems(prev => new Set(prev).add(productId));
    try {
      await removeItem(productId);
    } catch (error) {
      console.error("Failed to remove item:", error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    const handlePopState = () => onClose();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [onClose]);

  // Trigger confetti when reaching $100 free shipping
  useEffect(() => {
    if (subtotal >= 100 && !confettiTriggered.current) {
      confettiTriggered.current = true;
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        try {
          confetti({
            particleCount: 150, 
            spread: 90,
            origin: { x: 0.5, y: 0.5 },
            colors: ["#440C03", "#6F433A", "#A48068", "#FFD700", "#FFA500"]
          });
          // Second burst for more effect
          confetti({
            particleCount: 100,
            spread: 100,
            origin: { x: 0.5, y: 0.3 },
            colors: ["#FFD700", "#FFA500", "#440C03"]
          });
        } catch (error) {
          console.error("Confetti error:", error);
        }
      }, 100);
    } else if (subtotal < 100) {
      // Reset the trigger when subtotal drops below $100
      confettiTriggered.current = false;
    }
  }, [subtotal]);

  const navigate = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <div className="fixed inset-y-0 right-0 -top-5 pb-5 w-full sm:w-110 bg-linear-to-b from-white to-gray-50 z-50 flex flex-col shadow-2xl overflow-x-hidden">
      
      {/* HEADER */}
      <div className="relative bg-linear-to-r from-[#440C03] to-[#6F433A] px-6 py-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          aria-label="Close cart"
        >
          <X size={20} />
        </button>

        <button
          onClick={() => fetchCartData(true)}
          className="absolute top-4 right-16 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          aria-label="Refresh cart"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        
        <div className="flex items-center gap-3 text-white">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Shopping Cart</h2>
            <p className="text-white/80 text-sm mt-0.5">
              {loading ? (
                <span className="flex items-center gap-1">
                  <Loader className="h-3 w-3 animate-spin" />
                  Loading...
                </span>
              ) : (
                <>
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-6">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#440C03] mx-auto">
                <Loader className="h-12 w-12" />
              </div>
              <p className="mt-4 text-gray-600">Loading cart...</p>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-32 h-32 mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingBag size={48} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-8 max-w-xs">
              Discover amazing products and start adding them to your cart
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="px-8 py-3.5 bg-linear-to-r from-[#440C03] to-[#6F433A] text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
            >
              Explore Products
            </button>
          </div>
        ) : (
          <div className="space-y-4 overflow-x-hidden">
            {cartItems.map((item) => {
              const isUpdating = updatingItems.has(item.productId);
              return (
                <div
                  key={item.productId}
                  className={`group relative bg-white p-4 rounded-2xl border border-gray-200 hover:border-[#A48068] hover:shadow-md transition-all duration-200 ${
                    isUpdating ? 'opacity-70' : ''
                  }`}
                >
                  {isUpdating && (
                    <div className="absolute inset-0 bg-white/50 rounded-2xl flex items-center justify-center z-10">
                      <Loader className="h-5 w-5 animate-spin text-[#440C03]" />
                    </div>
                  )}
                  
                  <div className="flex gap-3 overflow-x-hidden w-full items-center">
                    {/* IMAGE */}
                    <div 
                      className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-50 shrink-0 cursor-pointer group-hover:scale-[1.02] transition-transform"
                      onClick={() => navigate(`/singleProduct/${item.productId}`)}
                    >
                      <Image
                        src={item.product.images?.[0] || "/images/placeholder.png"}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>

                    {/* INFO */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <h3
                        className="font-semibold text-gray-800 line-clamp-2 cursor-pointer hover:text-[#440C03] transition-colors mb-1 wrap-break-words max-w-full truncate"
                        style={{ maxWidth: '120px', overflowWrap: 'break-word', wordBreak: 'break-word' }}
                        onClick={() => navigate(`/singleProduct/${item.productId}`)}
                      >
                        {item.product.title}
                      </h3>

                      <p className="text-xs text-gray-500 mb-2 wrap-break-words max-w-full truncate" style={{ maxWidth: '120px', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                        ${parseFloat(item.product.price).toFixed(2)} each • Stock: {item.product.stock}
                      </p>

                      {/* QTY CONTROLS */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                          <button
                            onClick={() => handleQuantityUpdate(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isUpdating}
                            className="px-2 py-1 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>

                          <span className="px-2 py-1 text-xs font-semibold min-w-8 text-center bg-white">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => handleQuantityUpdate(item.productId, item.quantity + 1)}
                            disabled={(item.product.stock ? item.quantity >= item.product.stock : false) || isUpdating}
                            className="px-2 py-1 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="text-right ml-2">
                          <p className="font-bold text-base text-[#440C03]">
                            ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* REMOVE BUTTON */}
                  <button
                    onClick={() => handleRemoveItem(item.productId)}
                    disabled={isUpdating}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    aria-label="Remove item"
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FOOTER */}
      {cartItems.length > 0 && (
        <div className="border-t bg-white px-6 py-6 space-y-4">
          {/* Real-time status indicator */}
          <div className="text-xs text-gray-500 text-center">
            {updatingItems.size > 0 ? (
              <span className="flex items-center justify-center gap-1">
                <Loader className="h-3 w-3 animate-spin" />
                Updating cart...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                Cart synced • Real-time updates enabled
              </span>
            )}
          </div>

          {/* Shipping Progress */}
          {subtotal < 100 && (
            <div className="relative">
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <span className="flex-1">
                  <span className="font-semibold">${(100 - subtotal).toFixed(2)}</span> away from free shipping! 🎉
                </span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-linear-to-r from-green-400 to-green-500 transition-all duration-300"
                  style={{ width: `${Math.min((subtotal / 100) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Free Shipping Unlocked */}
          {subtotal >= 100 && (
            <div className="bg-green-100 border-2 border-green-400 text-green-800 px-4 py-3 rounded-xl text-sm flex items-center gap-3 animate-pulse">
              <span className="text-2xl">🎉</span>
              <span className="flex-1">
                <span className="font-bold block">Congratulations!</span>
                <span className="text-xs block mt-0.5">You've unlocked free shipping! 🚚</span>
              </span>
            </div>
          )}

          {/* Subtotal */}
          <div className="flex justify-between items-center py-3 border-t border-b border-gray-200">
            <span className="text-lg font-medium text-gray-700">Subtotal</span>
            <span className="text-2xl font-bold text-[#440C03]">
              ${loading ? "-.--" : subtotal.toFixed(2)}
            </span>
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/shop/cart")}
              className="border-2 border-gray-300 py-3 rounded-xl hover:bg-gray-50 hover:border-[#A48068] transition font-medium text-sm"
            >
              View Cart
            </button>
            <button
              onClick={() => navigate("/shop")}
              className="border-2 border-gray-300 py-3 rounded-xl hover:bg-gray-50 hover:border-[#A48068] transition font-medium text-sm"
            >
              Keep Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function subscribeToUpdates(arg0: () => void) {
  throw new Error("Function not implemented.");
}
