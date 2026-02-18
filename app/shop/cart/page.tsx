// "use client";
// import { TruckElectric, Plus, Minus, Trash2, Loader } from "lucide-react";
// import CheckOutPage from "./checkout/page";
// import { useState, useMemo, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import { useSharedEnhancedCart } from "@/app/hooks/useSharedEnhancedCart";
// import { section } from "framer-motion/client";

// export default function Page() {
//   const router = useRouter();
//   const [open, setOpen] = useState(false);
//   const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  
//   // Use enhanced cart hook for real-time data
//   const {
//     cartData,
//     selectedShipping,
//     setSelectedShipping,
//     loading,
//     refreshing,
//     error,
//     calculateTotals,
//     updateQuantity,
//     removeItem,
//     fetchCartData,
//     subscribeToUpdates,
//   } = useSharedEnhancedCart();

//   // fake coupon
//   const [coupon, setCoupon] = useState("");
//   const todayDiscount = "XXYY";
//   const discount = 150;

//   // Get calculated totals
//   const { subtotal, shippingCost, gstAmount, grandTotal, gstPercentage } = calculateTotals;

//   const [syncTrigger, setSyncTrigger] = useState(0);

//   // Handle quantity update with loading state
//   const handleQuantityUpdate = async (productId: string, newQuantity: number) => {
//     setUpdatingItems(prev => new Set(prev).add(productId));
//     try {
//       await updateQuantity(productId, newQuantity);
//     } finally {
//       setUpdatingItems(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(productId);
//         return newSet;
//       });
//     }
//   };

//   // Handle remove item with loading state
//   const handleRemoveItem = async (productId: string) => {
//     setUpdatingItems(prev => new Set(prev).add(productId));
//     try {
//       await removeItem(productId);
//     } finally {
//       setUpdatingItems(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(productId);
//         return newSet;
//       });
//     }
//   };

//   // Subscribe to cart updates for real-time sync between cart page and mini cart
//   useEffect(() => {
//     // Initial fetch when landing on cart page to ensure fresh data
//     const timer = setTimeout(() => {
//       fetchCartData(true);
//     }, 100);

//     const unsubscribe = subscribeToUpdates(() => {
//       // Force a re-render when cart updates from other components (like MiniCart)
//       setSyncTrigger(prev => prev + 1);
//       console.log('Cart page synced with cart updates from other components');
//     });

//     return () => {
//       unsubscribe();
//       clearTimeout(timer);
//     };
//   }, [subscribeToUpdates, fetchCartData]);

//   // Stable sorted cart items to prevent shuffling
//   const cartItems = useMemo(() => {
//     const items = cartData?.cart || [];
//     // Sort by productId to maintain stable order regardless of API response order
//     return [...items].sort((a, b) => a.productId.localeCompare(b.productId));
//   }, [cartData?.cart]);

//   // Loading state
//   if (loading) {
//     return (
//       <section className="bg-[#EBE3D5] min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
//           <p className="text-lg">Loading your cart...</p>
//         </div>
//       </section>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <section className="bg-[#EBE3D5] min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-lg text-red-600 mb-4">Failed to load cart: {error}</p>
//           <button 
//             onClick={() => window.location.reload()} 
//             className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
//           >
//             Retry
//           </button>
//         </div>
//       </section>
//     );
//   }

//   return (
//     <section className="bg-[#EBE3D5]">
//       {/* HERO SECTION */}
//       <section>
//         <div className="relative min-h-[35vh] bg-[url('/images/main.png')] bg-cover bg-center overflow-hidden">
//           <div className="absolute inset-0 bg-black/40" />
//           <div className="absolute inset-0 bg-white/10" />

//           <div className="relative z-10 flex flex-col items-center justify-center text-white text-center py-40 px-6">
//             <h1 className="text-6xl font-bold mb-4">
//               Cart 
//               {cartItems.length > 0 && (
//                 <span className="text-2xl ml-4 text-white/80">
//                   ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
//                 </span>
//               )}
//             </h1>

//             <p className="max-w-xl mb-6 text-white/90">
//               Review your selected items and proceed to secure checkout
//             </p>

//             <div className="flex items-center gap-4 w-full max-w-xl">
//               <span className="flex-1 h-px bg-[#E6CFAF]" />
//               <TruckElectric className="h-8 w-8 text-white/80 shrink-0" />
//               <span className="flex-1 h-px bg-white/60" />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CART TABLE - Reduced size */}
//       <section className="py-15 px-14 max-w-screen-2xl m-auto">
//         {/* Header */}
//         <div className="flex justify-between items-center pb-4 border-b border-black/20">
//           <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center font-semibold text-gray-700 gap-4 flex-1">
//             <h2 className="text-left">Product</h2>
//             <h2 className="text-center">Quantity</h2>
//             <h2 className="text-center">Price</h2>
//             <h2 className="text-center">Sub-Total</h2>
//             <h2 className="text-center">Remove</h2>
//           </div>
//         </div>

//         {/* Cart Items */}
//         {cartItems.length === 0 ? (
//           <div className="py-12 text-center">
//             <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
//             <p className="text-gray-500">Add some products to get started!</p>
//             {error && (
//               <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
//                 Error loading cart: {error}
//               </div>
//             )}
//           </div>
//         ) : (
//           <>
//             {error && (
//               <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
//                 Warning: Cart data may not be up to date. {error}
//               </div>
//             )}
//             {cartItems.map((item) => {
//               const isUpdating = updatingItems.has(item.productId);
//               return (
//             <div
//               key={item.productId}
//               className={`relative grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center py-6 border-b border-black/10 gap-4`}
//             >
//               {isUpdating && (
//                 <div className="absolute left-0 top-0 right-0 bottom-0 bg-white/20 rounded-sm flex items-center justify-center z-20 pointer-events-none">
//                   <Loader className="h-6 w-6 animate-spin text-amber-900" />
//                 </div>
//               )}
//                 {/* Product */}
//                 <div className="flex gap-4 items-center">
//                   <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
//                     <Image
//                       src={item.product.images?.[0] || "/images/placeholder.png"}
//                       alt={item.product.title}
//                       fill
//                       className="object-cover"
//                       sizes="80px"
//                     />
//                   </div>
//                   <div>
//                     <h3 className="font-medium text-lg text-gray-800">
//                       {item.product.title}
//                     </h3>
//                     <p className="text-sm text-gray-500">
//                       Stock: {item.product.stock || "N/A"}
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       Category: {item.product.category}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Quantity */}
//                 <div className="flex justify-center">
//                   <div className="bg-white flex items-center gap-3 px-3 py-1 rounded-full border border-gray-200">
//                     <button
//                       className="text-lg font-bold hover:bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full transition-colors disabled:opacity-50"
//                       onClick={() => handleQuantityUpdate(item.productId, item.quantity - 1)}
//                       disabled={item.quantity <= 1 || isUpdating}
//                     >
//                       <Minus size={16} />
//                     </button>

//                     <span className="text-base font-medium min-w-8 text-center">
//                       {item.quantity}
//                     </span>

//                     <button
//                       className="text-lg font-bold hover:bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full transition-colors disabled:opacity-50"
//                       onClick={() => handleQuantityUpdate(item.productId, item.quantity + 1)}
//                       disabled={(item.product.stock ? item.quantity >= item.product.stock : false) || isUpdating}
//                     >
//                       <Plus size={16} />
//                     </button>
//                   </div>
//                 </div>

//                 {/* Price */}
//                 <div className="text-center font-medium text-base">
//                   ${parseFloat(item.product.price).toFixed(2)}
//                 </div>

//                 {/* Sub Total */}
//                 <div className="text-center font-semibold text-lg">
//                   ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
//                 </div>

//                 {/* Remove Button */}
//                 <div className="flex justify-end">
//                   <button
//                     onClick={() => handleRemoveItem(item.productId)}
//                     disabled={isUpdating}
//                     className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                     aria-label={`Remove ${item.product.title} from cart`}
//                   >
//                     <Trash2 className="h-5 w-5" />
//                   </button>
//                 </div>
//             </div>
//             );
//             })}
//           </>
//         )}
//       </section>

//       {/* CHECKOUT SECTION */}
//       <section className="p-12">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full items-start">
//           {/* LEFT – COUPON */}
//           <div>
//             <h1 className="font-bold text-2xl mb-4">Have a Coupon?</h1>

//             <p className="mb-8 text-black/70 max-w-md">
//               Add your promotional code to receive a discount on your order.
//             </p>

//             <div className="flex bg-white rounded-2xl overflow-hidden w-fit border border-black/5">
//               <input
//                 type="text"
//                 value={coupon}
//                 onChange={(e) => setCoupon(e.target.value)}
//                 placeholder="Enter coupon code"
//                 className="px-5 py-3 outline-none text-black"
//               />
//               <button
//                 onClick={() =>
//                   coupon == todayDiscount &&
//                   alert(`Coupon ${coupon} applied an amount of $${150} !`)
//                 }
//                 className="px-6 font-semibold hover:bg-black hover:text-white transition-colors"
//               >
//                 Apply
//               </button>
//             </div>
//           </div>

//           {/* RIGHT – SUMMARY */}
//           <div className="bg-[#EFE7DA] rounded-2xl border border-white p-8 w-full">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-2xl font-bold">Cart Summary</h2>
//               <div className="flex flex-col items-end text-xs text-gray-500">
//                 {refreshing ? (
//                   <span className="flex items-center gap-1">
//                     <Loader className="h-3 w-3 animate-spin" />
//                     Updating...
//                   </span>
//                 ) : (
//                   <span className="flex items-center gap-1">
//                     <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
//                     Real-time sync enabled
//                   </span>
//                 )}
//                 <span className="text-[10px] text-gray-400 mt-1">
//                   Auto-updates every 30s
//                 </span>
//               </div>
//             </div>

//             {/* Shipping Options */}
//             <div className="space-y-4">
//               {cartData?.availableShipping.map((shipping) => (
//                 <label
//                   key={shipping.id}
//                   className={`flex items-center justify-between p-4 rounded-lg cursor-pointer border transition-all ${
//                     selectedShipping?.id === shipping.id
//                       ? "border-black bg-[#EFE7DA]"
//                       : "border-transparent bg-white/40"
//                   }`}
//                 >
//                   <div className="flex items-center gap-3">
//                     <input
//                       type="radio"
//                       name="shipping"
//                       value={shipping.id}
//                       checked={selectedShipping?.id === shipping.id}
//                       onChange={() => setSelectedShipping(shipping)}
//                       className="accent-black w-4 h-4"
//                     />
//                     <div>
//                       <span className="font-medium">{shipping.name}</span>
//                       <p className="text-sm text-gray-600">{shipping.description}</p>
//                       <p className="text-xs text-gray-500">{shipping.estimatedDays}</p>
//                     </div>
//                   </div>
//                   <span className="font-bold">${parseFloat(shipping.cost).toFixed(2)}</span>
//                 </label>
//               ))}
//             </div>

//             <div className="my-6 h-px bg-black/10" />

//             <div className="flex justify-between mb-4">
//               <span className="text-lg">Subtotal</span>
//               <span className="text-lg font-medium">
//                 ${subtotal.toFixed(2)}
//               </span>
//             </div>

//             <div className="flex justify-between mb-4">
//               <span className="text-lg">Shipping</span>
//               <span className="text-lg font-medium">
//                 ${shippingCost.toFixed(2)}
//               </span>
//             </div>

//             <div className="flex justify-between mb-4">
//               <span className="text-lg">GST ({gstPercentage?.toFixed(1)}%)</span>
//               <span className="text-lg font-medium">
//                 ${gstAmount.toFixed(2)}
//               </span>
//             </div>

//             {coupon === todayDiscount && (
//               <div className="flex justify-between mb-4">
//                 <span className="text-lg text-green-600">Discount</span>
//                 <span className="text-lg font-medium text-green-600">
//                   -${discount.toFixed(2)}
//                 </span>
//               </div>
//             )}

//             <div className="mb-4 h-px bg-black/10" />

//             <div className="flex justify-between text-xl font-bold mb-10">
//               <span>Grand Total</span>
//               <span>
//                 $
//                 {coupon === todayDiscount
//                   ? Math.max(0, grandTotal - discount).toFixed(2)
//                   : grandTotal.toFixed(2)}
//               </span>
//             </div>

//             <div className="flex">
//               <button
//                 onClick={() => router.push("/shop/cart/checkout")}
//                 disabled={cartItems.length === 0}
//                 className="w-full px-10 py-4 bg-black rounded-2xl text-white flex justify-center items-center hover:bg-black/80 transition-all active:scale-[0.98] disabled:bg-gray-400 disabled:cursor-not-allowed"
//               >
//                 Proceed to Checkout
//               </button>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CHECKOUT OVERLAY PAGE */}
//       {open && (
//         <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity">
//           <div className="absolute top-0 right-0 h-full w-full lg:w-[75%] bg-white overflow-y-auto shadow-2xl animate-in slide-in-from-right">
//             {/* Header */}
//             <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
//               <div className="flex items-center gap-4">
//                 <button
//                   onClick={() => setOpen(false)}
//                   className="text-sm font-bold hover:underline"
//                 >
//                   ← Back to Cart
//                 </button>
//                 <h2 className="text-xl font-bold">Checkout</h2>
//               </div>
//               <div className="font-bold">Total: ${grandTotal.toFixed(2)}</div>
//             </div>

//             <div className="p-10">
//               <CheckOutPage />
//             </div>
//           </div>
//         </div>
//       )}
//     </section>
//   );
// }



"use client";

import { TruckElectric, Plus, Minus, Trash2, Loader, ArrowRight, Tag } from "lucide-react";
import CheckOutPage from "./checkout/page";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSharedEnhancedCart } from "@/app/hooks/useSharedEnhancedCart";
import { motion, AnimatePresence } from "framer-motion";

export default function Page() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

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
      <section className="relative h-[40vh] w-full overflow-hidden">
        {/* Background Image with warm overlay */}
        <div className="absolute inset-0">
            <Image
                src="/images/main.png"
                alt="Cart Hero"
                fill
                className="object-cover"
                priority
            />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#4A3728]/40 to-[#FAF7F2]" />
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-7xl font-serif text-white mb-4 drop-shadow-md">
              Your Selection
            </h1>
            <div className="flex items-center justify-center gap-3 text-white/90">
              <span className="h-[1px] w-12 bg-white/50" />
              <p className="text-lg font-light tracking-wider uppercase">
                {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
              </p>
              <span className="h-[1px] w-12 bg-white/50" />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-12 -mt-20 relative z-20">
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
                          <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-[#F5F1EB] shadow-inner shrink-0">
                            <Image
                              src={item.product.images?.[0] || "/images/placeholder.png"}
                              alt={item.product.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div>
                            <h3 className="font-serif text-xl text-[#4A3728] mb-1 leading-tight">
                              {item.product.title}
                            </h3>
                            <p className="text-sm text-[#8B5E3C] bg-[#FAF7F2] inline-block px-2 py-1 rounded-md mb-2">
                              {item.product.category}
                            </p>
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
            
            {/* Coupon Section - Moved here for better flow */}
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
                        className="px-8 py-3 bg-[#4A3728] text-white rounded-xl font-medium hover:bg-[#2C1810] transition-colors"
                    >
                        Apply
                    </button>
                </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: SUMMARY (Sticky) --- */}
          <div className="xl:sticky xl:top-22 h-fit">
            <div className="bg-[#EBE5D9] rounded-[2rem] p-8 shadow-lg border border-white/40 backdrop-blur-sm relative overflow-hidden">
                {/* Decorative background grain */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/20 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none" />

                <div className="flex justify-between items-start mb-8 relative z-10">
                    <h2 className="text-3xl font-serif text-[#2C1810]">Summary</h2>
                    <div className="flex flex-col items-end">
                        {refreshing ? (
                             <span className="flex items-center gap-2 text-xs font-medium text-[#8B5E3C] bg-white/50 px-3 py-1 rounded-full">
                                <Loader className="h-3 w-3 animate-spin" /> Syncing
                             </span>
                        ) : (
                            <span className="flex items-center gap-2 text-xs font-medium text-green-700 bg-green-100/50 px-3 py-1 rounded-full border border-green-200/50">
                                <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" /> Live
                             </span>
                        )}
                    </div>
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
                        <span className="text-4xl font-serif text-[#2C1810]">
                            ${coupon === todayDiscount
                            ? Math.max(0, grandTotal - discount).toFixed(2)
                            : grandTotal.toFixed(2)}
                        </span>
                    </div>

                    <button
                        onClick={() => router.push("/shop/cart/checkout")}
                        disabled={cartItems.length === 0}
                        className="group w-full py-4 bg-[#2C1810] text-[#FAF7F2] rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-[#4A3728] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
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

      {/* --- CHECKOUT OVERLAY --- */}
      <AnimatePresence>
        {open && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-[#2C1810]/40 backdrop-blur-sm"
            >
            <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute top-0 right-0 h-full w-full lg:w-[70%] bg-[#FAF7F2] shadow-2xl overflow-y-auto"
            >
                {/* Header */}
                <div className="sticky top-0 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#D6C0A9] p-6 flex items-center justify-between z-10">
                <button
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 text-sm font-bold text-[#4A3728] hover:text-[#8B5E3C] transition-colors"
                >
                    <div className="p-2 bg-white rounded-full border border-[#D6C0A9]">
                        <ArrowRight className="h-4 w-4 rotate-180" />
                    </div>
                    Back to Cart
                </button>
                <div className="font-serif font-bold text-xl text-[#2C1810]">Checkout</div>
                </div>

                <div className="p-8 lg:p-12">
                   <CheckOutPage />
                </div>
            </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}