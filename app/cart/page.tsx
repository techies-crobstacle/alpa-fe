"use client";

import { TruckElectric, Plus, Minus, Trash2, Loader, ArrowRight, Tag } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSharedEnhancedCart } from "@/hooks/useSharedEnhancedCart";
import { useProducts } from "@/hooks/useProducts";
import { motion, AnimatePresence } from "framer-motion";

export default function Page() {
  const router = useRouter();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

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

  // Fake coupon logic
  const [coupon, setCoupon] = useState("");
  const todayDiscount = "XXYY";
  const discount = 150;

  // Get calculated totals
  const { subtotal, shippingCost, gstAmount, grandTotal, gstPercentage } = calculateTotals;
  const [syncTrigger, setSyncTrigger] = useState(0);

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
                              src={item.product.images?.[0] || "/images/placeholder.png"}
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
                            {item.product.stock < 5 && (
                                <p className="text-xs text-orange-600 font-medium">Only {item.product.stock} left!</p>
                            )}
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
                               disabled={(item.product.stock ? item.quantity >= item.product.stock : false) || isUpdating}
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
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        placeholder="Enter coupon code"
                        className="flex-1 bg-[#FAF7F2] border border-[#E6DCC8] rounded-xl px-5 py-3 outline-none focus:border-[#8B5E3C] focus:ring-1 focus:ring-[#8B5E3C] transition-all"
                    />
                    <button
                        onClick={() => coupon == todayDiscount && alert(`Coupon Applied!`)}
                        className="px-8 py-3 bg-[#5A1E12] text-white rounded-xl font-medium hover:bg-[#4a180f] transition-colors"
                    >
                        Apply
                    </button>
                </div>
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
                    {cartData?.availableShipping.map((shipping) => (
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
                        <span>GST <span className="text-xs">({gstPercentage?.toFixed(1)}%)</span></span>
                        <span className="font-medium text-[#4A3728]">${gstAmount.toFixed(2)}</span>
                    </div>
                    
                    {coupon === todayDiscount && (
                    <div className="flex justify-between text-green-700 bg-green-50 p-2 rounded-lg">
                        <span>Discount Applied</span>
                        <span className="font-bold">-${discount.toFixed(2)}</span>
                    </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t-2 border-white/50 relative z-10">
                    <div className="flex justify-between items-end mb-6">
                        <span className="text-lg font-bold text-[#4A3728]">Grand Total</span>
                        <span className="text-2xl font-serif font-bold text-[#2C1810]">
                            ${coupon === todayDiscount
                            ? Math.max(0, grandTotal - discount).toFixed(2)
                            : grandTotal.toFixed(2)}
                        </span>
                    </div>

                    <button
                        onClick={() => router.push("/checkout")}
                        disabled={cartItems.length === 0}
                        className="group w-full py-4 bg-[#5A1E12] text-[#FAF7F2] rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-[#4a180f] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        Proceed to Checkout
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

    </motion.main>
  );
}
