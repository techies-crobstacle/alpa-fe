"use client";

import { TruckElectric, Plus, Minus, Trash2, Loader, Loader2, ArrowRight, Tag, X, LogIn, UserX } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSharedEnhancedCart } from "@/hooks/useSharedEnhancedCart";
import { useProducts } from "@/hooks/useProducts";
import { useCartStock } from "@/hooks/useCartStock";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { couponsApi, ValidatedCoupon } from "@/lib/api";

export default function Page() {
  const router = useRouter();
  const { user } = useAuth();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const handleProceedToCheckout = () => {
    if (user) {
      router.push("/checkout");
    } else {
      setShowCheckoutModal(true);
    }
  };

  const { data: allProducts = [] } = useProducts();
  const productCategoryMap = useMemo(() => {
    return Object.fromEntries(allProducts.map(p => [p.id, p.category]));
  }, [allProducts]);

  // Use enhanced cart hook for real-time data
  const {
    cartData,
    selectedShipping,
    setSelectedShipping,
    loading,
    refreshing,
    error,
    calculateTotals,
    updateQuantity,
    removeItem,
    fetchCartData,
    subscribeToUpdates,
  } = useSharedEnhancedCart();

  // Coupon logic
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<ValidatedCoupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Restore coupon persisted from a previous cart visit
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cartAppliedCoupon");
      if (saved) {
        setAppliedCoupon(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const handleCouponApply = async () => {
    const code = couponInput.trim();
    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }
    setCouponError("");
    setAppliedCoupon(null);
    localStorage.removeItem("cartAppliedCoupon");
    setIsValidatingCoupon(true);
    try {
      const data = await couponsApi.validateCoupon(code, grandTotal);
      if (!data.success || !data.coupon) {
        setCouponError(data.message || "Invalid coupon code.");
        return;
      }
      setAppliedCoupon(data.coupon);
      localStorage.setItem("cartAppliedCoupon", JSON.stringify(data.coupon));
    } catch (err: any) {
      setCouponError(err?.message || "Failed to validate coupon. Please try again.");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
    localStorage.removeItem("cartAppliedCoupon");
  };

  // Get calculated totals
  const { subtotal, shippingCost, gstAmount, grandTotal, gstPercentage } = calculateTotals;
  const [syncTrigger, setSyncTrigger] = useState(0);

  // Auto-invalidate coupon when cart subtotal drops below the coupon's minimum
  useEffect(() => {
    if (appliedCoupon && subtotal < appliedCoupon.minCartValue) {
      const removedCode = appliedCoupon.code;
      const minVal = appliedCoupon.minCartValue;
      setAppliedCoupon(null);
      setCouponInput(removedCode);
      setCouponError(
        `Coupon "${removedCode}" requires a minimum cart value of $${minVal.toFixed(2)}. It has been removed.`
      );
      localStorage.removeItem("cartAppliedCoupon");
    }
  }, [subtotal, appliedCoupon]);

  // Handle quantity update
  const handleQuantityUpdate = async (productId: string, newQuantity: number) => {
    setUpdatingItems((prev) => new Set(prev).add(productId));
    try {
      await updateQuantity(productId, newQuantity);
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // Handle remove item
  const handleRemoveItem = async (productId: string) => {
    setUpdatingItems((prev) => new Set(prev).add(productId));
    try {
      await removeItem(productId);
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCartData(true);
    }, 100);

    const unsubscribe = subscribeToUpdates(() => {
      setSyncTrigger((prev) => prev + 1);
    });

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [subscribeToUpdates, fetchCartData]);

  const cartItems = useMemo(() => {
    const items = cartData?.cart || [];
    return [...items].sort((a, b) => a.productId.localeCompare(b.productId));
  }, [cartData?.cart]);

  // Real-time stock validation — bulk REST snapshot + live socket updates
  const cartProductIds = useMemo(
    () => cartItems.map((i) => i.productId),
    [cartItems]
  );
  const cartQuantities = useMemo(
    () => Object.fromEntries(cartItems.map((i) => [i.productId, i.quantity])),
    [cartItems]
  );
  const { stockMap, canCheckout: stockCanCheckout } = useCartStock(cartProductIds, {
    cartQuantities,
    onOverstock: (productId, newStock) => handleQuantityUpdate(productId, newStock),
  });

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="bg-[#FAF7F2] min-h-screen flex flex-col items-center justify-center text-[#4A3728]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader className="h-10 w-10 text-[#8B5E3C]" />
        </motion.div>
        <p className="mt-4 font-medium tracking-wide animate-pulse">Curating your cart...</p>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error) {
    return (
      <div className="bg-[#FAF7F2] min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-xl border border-red-100">
          <p className="text-lg text-red-800 mb-6 font-medium">Unable to load cart: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#4A3728] text-white rounded-xl hover:bg-[#2C1810] transition-colors shadow-lg"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.main 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="bg-[#FAF7F2] min-h-screen font-sans text-[#4A3728]"
    >
      
      {/* --- HERO SECTION --- */}
      <section className="relative h-[80vh] overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/main.png')] bg-cover bg-center animate-slow-zoom">
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
          <span className="mb-4 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 text-sm font-medium backdrop-blur-md">
            Review your items
          </span>
          <h1 className="text-6xl font-bold mb-6 tracking-tight">Your Cart</h1>
          <p className="text-base text-gray-200 max-w-2xl leading-relaxed">
            Review your selected items and proceed to checkout when you're ready.
          </p>
        </div>
      </section>

      <div className="max-w-400 mx-auto px-4 md:px-8 py-12 relative z-20">
        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-8 items-start">
          
          {/* --- LEFT COLUMN: CART ITEMS --- */}
          <div className="space-y-6">
            {/* Headers (Hidden on Mobile) */}
            <div className="hidden md:grid grid-cols-[3fr_1fr_1fr_auto] gap-6 pb-4 px-6 border-b border-[#D6C0A9] text-[#8B5E3C] font-semibold text-sm uppercase tracking-wider">
              <span>Product</span>
              <span className="text-center">Quantity</span>
              <span className="text-right">Price</span>
              <span className="w-10"></span>
            </div>

            <AnimatePresence>
              {cartItems.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-3xl p-12 text-center shadow-sm border border-[#E6DCC8]"
                >
                  <TruckElectric className="h-16 w-16 text-[#D6C0A9] mx-auto mb-4" />
                  <p className="text-2xl font-serif text-[#4A3728] mb-2">Your cart is empty</p>
                  <p className="text-[#8B5E3C]">Looks like you haven't made your choice yet.</p>
                </motion.div>
              ) : (
                cartItems.map((item, index) => {
                  const isUpdating = updatingItems.has(item.productId);
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      key={item.productId}
                      className="group relative bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-transparent hover:border-[#D6C0A9] hover:shadow-md transition-all duration-300"
                    >
                      {isUpdating && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 rounded-3xl flex items-center justify-center">
                           <Loader className="h-6 w-6 animate-spin text-[#8B5E3C]" />
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr_1fr_auto] gap-6 items-center">
                        {/* Product Info */}
                        <div className="flex gap-5 items-center">
                          <div className="relative w-20 h-20 md:w-20 md:h-20 rounded-lg overflow-hidden bg-[#F5F1EB] shadow-inner shrink-0">
                            <Image
                              src={item.product.images?.[0] || "/images/placeholder.svg"}
                              alt={item.product.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div>
                            <h3 className="font-serif text-lg text-[#4A3728] leading-tight">
                              {item.product.title}
                            </h3>
                            {(item.product.category || productCategoryMap[item.productId]) && (
                              <p className="text-sm text-[#8B5E3C] bg-[#FAF7F2] inline-block px-2 py-1 rounded-md mb-2">
                                {item.product.category || productCategoryMap[item.productId]}
                              </p>
                            )}
                            {/* Real-time stock warning */}
                            {stockMap[item.productId] !== undefined && !stockMap[item.productId].isAvailable ? (
                              <p className="text-xs text-red-600 font-semibold">⚠️ No longer available</p>
                            ) : stockMap[item.productId]?.stock !== undefined && stockMap[item.productId].stock < 5 && stockMap[item.productId].stock > 0 ? (
                              <p className="text-xs text-orange-600 font-medium">Only {stockMap[item.productId].stock} left!</p>
                            ) : item.product.stock < 5 && item.product.stock > 0 ? (
                              <p className="text-xs text-orange-600 font-medium">Only {item.product.stock} left!</p>
                            ) : null}
                          </div>
                        </div>

                        {/* Quantity Control */}
                        <div className="flex justify-start md:justify-center">
                          <div className="flex items-center bg-[#FAF7F2] rounded-xl border border-[#E6DCC8] p-1">
                            <button
                              onClick={() => handleQuantityUpdate(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1 || isUpdating}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-[#4A3728] disabled:opacity-30 transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-10 text-center font-medium text-[#4A3728]">
                                {item.quantity}
                            </span>
                            <button
                               onClick={() => handleQuantityUpdate(item.productId, item.quantity + 1)}
                               disabled={(
                                 (() => {
                                   const liveStock = stockMap[item.productId]?.stock;
                                   const stock = liveStock !== undefined ? liveStock : item.product.stock;
                                   return stock != null ? item.quantity >= stock : false;
                                 })()
                               ) || isUpdating}
                               className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-[#4A3728] disabled:opacity-30 transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex flex-row md:flex-col justify-between items-center md:items-end">
                            <span className="md:hidden text-sm text-gray-500">Total:</span>
                            <div className="text-right">
                                <p className="font-bold text-lg text-[#4A3728]">
                                    ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                                </p>
                                <p className="text-xs text-[#8B5E3C]">
                                    ${parseFloat(item.product.price).toFixed(2)} each
                                </p>
                            </div>
                        </div>

                        {/* Remove */}
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleRemoveItem(item.productId)}
                            disabled={isUpdating}
                            className="p-2 text-[#D6C0A9] hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
            
            {/* Coupon Section */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#E6DCC8] mt-6">
                <h3 className="flex items-center gap-2 font-serif text-xl mb-4 text-[#4A3728]">
                    <Tag className="h-5 w-5" />
                    Discount Code
                </h3>
                {appliedCoupon ? (
                  <div className="flex items-center gap-3 px-5 py-3 bg-green-50 border border-green-300 rounded-xl">
                    <Tag className="h-4 w-4 text-green-600 shrink-0" />
                    <span className="flex-1 font-medium text-green-700">{appliedCoupon.code}</span>
                    <span className="text-sm font-semibold text-green-700 mr-2">-${appliedCoupon.discountAmount.toFixed(2)}</span>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-green-600 hover:text-red-500 transition-colors"
                      aria-label="Remove coupon"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => { setCouponInput(e.target.value); setCouponError(""); }}
                            onKeyDown={(e) => e.key === "Enter" && handleCouponApply()}
                            placeholder="Enter coupon code"
                            disabled={isValidatingCoupon}
                            className={`flex-1 bg-[#FAF7F2] border rounded-xl px-5 py-3 outline-none focus:ring-1 transition-all ${
                              couponError
                                ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                                : "border-[#E6DCC8] focus:border-[#8B5E3C] focus:ring-[#8B5E3C]"
                            }`}
                        />
                        <button
                            onClick={handleCouponApply}
                            disabled={isValidatingCoupon || !couponInput.trim()}
                            className="px-8 py-3 bg-[#5A1E12] text-white rounded-xl font-medium hover:bg-[#4a180f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isValidatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                        </button>
                    </div>
                    {couponError && (
                      <p className="mt-2 text-sm text-red-500">{couponError}</p>
                    )}
                  </>
                )}
            </div>
          </div>

          {/* --- RIGHT COLUMN: SUMMARY (Sticky) --- */}
          <div className="xl:sticky xl:top-22 h-fit">
            <div className="bg-[#EBE5D9] rounded-4xl p-8 shadow-lg border border-white/40 backdrop-blur-sm relative overflow-hidden">
                {/* Decorative background grain */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-white/20 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none" />

                <div className="mb-8 relative z-10">
                    <h2 className="text-3xl font-serif text-[#2C1810]">Summary</h2>
                </div>

                {/* Shipping Selection */}
                <div className="space-y-3 mb-8 relative z-10">
                    <p className="text-sm font-semibold uppercase tracking-wider text-[#8B5E3C] mb-2">Shipping Method</p>
                    {cartData?.availableShipping.filter(s => !/cod|cash[\s_-]*on[\s_-]*delivery/i.test(s.name)).map((shipping) => (
                    <label
                        key={shipping.id}
                        className={`group cursor-pointer block relative p-4 rounded-xl border-2 transition-all duration-300 ${
                        selectedShipping?.id === shipping.id
                            ? "border-[#4A3728] bg-white shadow-md"
                            : "border-transparent bg-white/40 hover:bg-white/70"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedShipping?.id === shipping.id ? "border-[#4A3728]" : "border-[#D6C0A9]"}`}>
                                    {selectedShipping?.id === shipping.id && <div className="w-2.5 h-2.5 rounded-full bg-[#4A3728]" />}
                                </div>
                                <input
                                    type="radio"
                                    name="shipping"
                                    className="hidden"
                                    checked={selectedShipping?.id === shipping.id}
                                    onChange={() => setSelectedShipping(shipping)}
                                />
                                <div>
                                    <p className="font-bold text-[#4A3728] text-sm">{shipping.name}</p>
                                    <p className="text-xs text-[#8B5E3C]">{shipping.estimatedDays}</p>
                                </div>
                            </div>
                            <span className="font-bold text-[#4A3728]">${parseFloat(shipping.cost).toFixed(2)}</span>
                        </div>
                    </label>
                    ))}
                </div>

                <div className="space-y-4 border-t border-[#D6C0A9]/30 pt-6 relative z-10">
                    <div className="flex justify-between text-[#6D5443]">
                        <span>Subtotal</span>
                        <span className="font-medium text-[#4A3728]">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[#6D5443]">
                        <span>Shipping</span>
                        <span className="font-medium text-[#4A3728]">${shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[#6D5443]">
                        <span>GST <span className="text-xs">(incl. {gstPercentage?.toFixed(1)}%)</span></span>
                        <span className="font-medium text-[#4A3728]">${gstAmount.toFixed(2)}</span>
                    </div>

                    {appliedCoupon && (
                    <div className="flex justify-between text-green-700 bg-green-50 p-2 rounded-lg">
                        <span className="flex items-center gap-1 text-sm font-medium">
                          <Tag className="h-3.5 w-3.5" /> Coupon {appliedCoupon.code}
                        </span>
                        <span className="font-bold">-${appliedCoupon.discountAmount.toFixed(2)}</span>
                    </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t-2 border-white/50 relative z-10">
                    <div className="flex justify-between items-end mb-6">
                        <span className="text-lg font-bold text-[#4A3728]">Grand Total</span>
                        <span className="text-2xl font-serif font-bold text-[#2C1810]">
                            ${appliedCoupon
                            ? Math.max(0, grandTotal - appliedCoupon.discountAmount).toFixed(2)
                            : grandTotal.toFixed(2)}
                        </span>
                    </div>

                    {/* Stock unavailability notice */}
                    {cartItems.length > 0 && !stockCanCheckout && (
                      <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                        ⚠️ Some items in your cart are no longer available. Please remove them to continue.
                      </div>
                    )}
                    <button
                        onClick={handleProceedToCheckout}
                        disabled={cartItems.length === 0 || !stockCanCheckout}
                        className="group w-full py-4 bg-[#5A1E12] text-[#FAF7F2] rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-[#4a180f] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        {stockCanCheckout ? 'Proceed to Checkout' : 'Some items are unavailable'}
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <p className="text-center text-xs text-[#8B5E3C] mt-4 flex items-center justify-center gap-1">
                        <TruckElectric size={12} /> Free returns within 30 days
                    </p>
                </div>
            </div>
          </div>
        </div>
      </div>

    {/* Guest Checkout Modal */}
    <AnimatePresence>
      {showCheckoutModal && (
        <motion.div
          key="checkout-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setShowCheckoutModal(false)}
        >
          <motion.div
            key="checkout-modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#FAF7F2] rounded-2xl shadow-2xl w-full max-w-md p-8"
          >
            {/* Close button */}
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-4 right-4 text-[#8B5E3C] hover:text-[#5A1E12] transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-[#5A1E12]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="h-7 w-7 text-[#5A1E12]" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#2C1810] mb-2">How would you like to proceed?</h2>
              <p className="text-sm text-[#8B5E3C]">
                You&apos;re currently not logged in. Please choose an option below to continue.
              </p>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                className="w-full py-3.5 bg-[#5A1E12] text-[#FAF7F2] rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-md hover:bg-[#4a180f] hover:scale-[1.02] active:scale-[0.98] transition-all"
                onClick={() => setShowCheckoutModal(false)}
              >
                <LogIn className="h-5 w-5" />
                Login to Your Account
              </Link>

              <button
                onClick={() => {
                  setShowCheckoutModal(false);
                  router.push("/checkout");
                }}
                className="w-full py-3.5 bg-white border-2 border-[#5A1E12] text-[#5A1E12] rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-[#5A1E12]/5 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <UserX className="h-5 w-5" />
                Continue as Guest
              </button>
            </div>

            <p className="text-center text-xs text-[#8B5E3C] mt-5">
              Logging in lets you track your orders and save your details for faster checkout.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    </motion.main>
  );
}
