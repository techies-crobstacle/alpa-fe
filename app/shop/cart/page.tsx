// "use client";
// import { TruckElectric, Plus, Minus, Trash2 } from "lucide-react";
// import CheckOutPage from "./checkout/page";
// import { useState, useMemo } from "react";
// import { useCart } from "@/app/context/CartContext";
// import Image from "next/image";

// export default function Page() {
//   // cart value
//   const { updateQty, cartItems, removeFromCart, subtotal } = useCart();
//   const [shipping, setShipping] = useState<"free" | "express">("free");
//   const [open, setOpen] = useState(false);
//   const shippingCost = shipping === "free" ? 0 : 15;
//   const total = subtotal + shippingCost;

//   // fake coupon
//   const [coupon, setCoupon] = useState("");
//   const todayDiscount = "XXYY";
//   const discount = 150;

//   return (
//     <section className="bg-[#EBE3D5]">
//       {/* HERO SECTION */}
//       <section>
//         <div className="relative min-h-[35vh] bg-[url('/images/dislaimerbg.jpg')] bg-cover bg-center overflow-hidden">
//           <div className="absolute inset-0 bg-black/40" />
//           <div className="absolute inset-0 bg-white/10" />

//           <div className="relative z-10 flex flex-col items-center justify-center text-white text-center py-40 px-6">
//             <h1 className="text-6xl font-bold mb-4">Cart</h1>

//             <p className="max-w-xl mb-6 text-white/90">
//               Review your selected items and proceed to secure checkout.
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
//         <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center pb-4 border-b border-black/20 font-semibold text-gray-700 gap-4">
//           <h2 className="text-left">Product</h2>
//           <h2 className="text-center">Quantity</h2>
//           <h2 className="text-center">Price</h2>
//           <h2 className="text-center">Sub-Total</h2>
//           <h2 className="text-center">Remove</h2>
//         </div>

//         {/* Cart Items */}
//         {cartItems.length === 0 ? (
//           <div className="py-12 text-center">
//             <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
//             <p className="text-gray-500">Add some products to get started!</p>
//           </div>
//         ) : (
//           cartItems.map((item) => (
//             <div
//               key={item.id}
//               className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center py-6 border-b border-black/10 gap-4"
//             >
//               {/* Product */}
//               <div className="flex gap-4 items-center">
//                 <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
//                   <Image
//                     src={item.image || "/images/placeholder.png"}
//                     alt={item.name}
//                     fill
//                     className="object-cover"
//                     sizes="80px"
//                   />
//                 </div>
//                 <div>
//                   <h3 className="font-medium text-lg text-gray-800">{item.name}</h3>
//                   <p className="text-sm text-gray-500">Stock: {item.stock || 'N/A'}</p>
//                 </div>
//               </div>

//               {/* Quantity */}
//               <div className="flex justify-center">
//                 <div className="bg-white flex items-center gap-3 px-4 py-2 rounded-full border border-gray-200">
//                   <button
//                     className="text-lg font-bold hover:bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full transition-colors disabled:opacity-50"
//                     onClick={() => updateQty(item.id, -1)}
//                     disabled={item.qty <= 1}
//                   >
//                     <Minus size={16} />
//                   </button>

//                   <span className="text-base font-medium min-w-8 text-center">
//                     {item.qty}
//                   </span>

//                   <button
//                     className="text-lg font-bold hover:bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full transition-colors disabled:opacity-50"
//                     onClick={() => updateQty(item.id, 1)}
//                     disabled={(item.stock ? item.qty >= item.stock : false)}
//                   >
//                     <Plus size={16} />
//                   </button>
//                 </div>
//               </div>

//               {/* Price */}
//               <div className="text-center font-medium text-base">
//                 ${item.price.toFixed(2)}
//               </div>

//               {/* Sub Total */}
//               <div className="text-center font-semibold text-lg">
//                 ${(item.price * item.qty).toFixed(2)}
//               </div>

//               {/* Remove Button */}
//               <div className="flex justify-end">
//                 <button
//                   onClick={() => removeFromCart(item.id)}
//                   className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
//                   aria-label={`Remove ${item.name} from cart`}
//                 >
//                   <Trash2 className="h-5 w-5" />
//                 </button>
//               </div>
//             </div>
//           ))
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
//             <h2 className="text-2xl font-bold mb-6">Cart Summary</h2>

//             {/* Shipping Options */}
//             <div className="space-y-4">
//               <label
//                 className={`flex items-center justify-between p-4 rounded-lg cursor-pointer border transition-all ${
//                   shipping === "free"
//                     ? "border-black bg-[#EFE7DA]"
//                     : "border-transparent bg-white/40"
//                 }`}
//               >
//                 <div className="flex items-center gap-3">
//                   <input
//                     type="radio"
//                     name="shipping"
//                     value="free"
//                     checked={shipping === "free"}
//                     onChange={() => setShipping("free")}
//                     className="accent-black w-4 h-4"
//                   />
//                   <span className="font-medium">Free Shipping</span>
//                 </div>
//                 <span className="font-bold">$0.00</span>
//               </label>

//               <label
//                 className={`flex items-center justify-between p-4 rounded-lg cursor-pointer border transition-all ${
//                   shipping === "express"
//                     ? "border-black bg-[#EFE7DA]"
//                     : "border-transparent bg-white/40"
//                 }`}
//               >
//                 <div className="flex items-center gap-3">
//                   <input
//                     type="radio"
//                     name="shipping"
//                     value="express"
//                     checked={shipping === "express"}
//                     onChange={() => setShipping("express")}
//                     className="accent-black w-4 h-4"
//                   />
//                   <span className="font-medium">Express Shipping</span>
//                 </div>
//                 <span className="font-bold">$15.00</span>
//               </label>
//             </div>

//             <div className="my-6 h-px bg-black/10" />

//             <div className="flex justify-between mb-4">
//               <span className="text-lg">Subtotal</span>
//               <span className="text-lg font-medium">
//                 ${subtotal.toFixed(2)}
//               </span>
//             </div>

//             {coupon === todayDiscount && (
//               <div className="flex justify-between mb-4">
//                 <span className="text-lg">Discount</span>
//                 <span className="text-lg font-medium">
//                   -${discount.toFixed(2)}
//                 </span>
//               </div>
//             )}

//             <div className="mb-4 h-px bg-black/10" />

//             <div className="flex justify-between text-xl font-bold mb-10">
//               <span>Total</span>
//               {/* Temp coupon applied */}
//               <span>
//                 $
//                 {coupon == todayDiscount
//                   ? (total - discount).toFixed(2)
//                   : total.toFixed(2)}
//               </span>
//             </div>

//             <div className="flex">
//               <button
//                 onClick={() => setOpen(true)}
//                 // disabled={items.length === 0}
//                 className="w-full px-10 py-4 bg-black rounded-2xl text-white flex justify-center items-center hover:bg-black/80 transition-all active:scale-[0.98] disabled:bg-gray-400"
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
//               <div className="font-bold">
              //   Total: $
              //   {coupon === todayDiscount
              //     ? Math.max(0, grandTotal - discount).toFixed(2)
              //     : grandTotal.toFixed(2)}
              // </div>
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
import { TruckElectric, Plus, Minus, Trash2, Loader } from "lucide-react";
import CheckOutPage from "./checkout/page";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSharedEnhancedCart } from "@/app/hooks/useSharedEnhancedCart";
import { section } from "framer-motion/client";

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

  // fake coupon
  const [coupon, setCoupon] = useState("");
  const todayDiscount = "XXYY";
  const discount = 150;

  // Get calculated totals
  const { subtotal, shippingCost, gstAmount, grandTotal, gstPercentage } = calculateTotals;

  const [syncTrigger, setSyncTrigger] = useState(0);

  // Handle quantity update with loading state
  const handleQuantityUpdate = async (productId: string, newQuantity: number) => {
    setUpdatingItems(prev => new Set(prev).add(productId));
    try {
      await updateQuantity(productId, newQuantity);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // Handle remove item with loading state
  const handleRemoveItem = async (productId: string) => {
    setUpdatingItems(prev => new Set(prev).add(productId));
    try {
      await removeItem(productId);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // Subscribe to cart updates for real-time sync between cart page and mini cart
  useEffect(() => {
    const unsubscribe = subscribeToUpdates(() => {
      // Force a re-render when cart updates from other components (like MiniCart)
      setSyncTrigger(prev => prev + 1);
      console.log('Cart page synced with cart updates from other components');
    });

    return unsubscribe;
  }, [subscribeToUpdates]);

  // Loading state
  if (loading) {
    return (
      <section className="bg-[#EBE3D5] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading your cart...</p>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="bg-[#EBE3D5] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">Failed to load cart: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  // Stable sorted cart items to prevent shuffling
  const cartItems = useMemo(() => {
    const items = cartData?.cart || [];
    // Sort by productId to maintain stable order regardless of API response order
    return [...items].sort((a, b) => a.productId.localeCompare(b.productId));
  }, [cartData?.cart]);

  return (
    <section className="bg-[#EBE3D5]">
      {/* HERO SECTION */}
      <section>
        <div className="relative min-h-[35vh] bg-[url('/images/dislaimerbg.jpg')] bg-cover bg-center overflow-hidden">
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-white/10" />

          <div className="relative z-10 flex flex-col items-center justify-center text-white text-center py-40 px-6">
            <h1 className="text-6xl font-bold mb-4">
              Cart 
              {cartItems.length > 0 && (
                <span className="text-2xl ml-4 text-white/80">
                  ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                </span>
              )}
            </h1>

            <p className="max-w-xl mb-6 text-white/90">
              Review your selected items and proceed to secure checkout
            </p>

            <div className="flex items-center gap-4 w-full max-w-xl">
              <span className="flex-1 h-px bg-[#E6CFAF]" />
              <TruckElectric className="h-8 w-8 text-white/80 shrink-0" />
              <span className="flex-1 h-px bg-white/60" />
            </div>
          </div>
        </div>
      </section>

      {/* CART TABLE - Reduced size */}
      <section className="py-15 px-14 max-w-screen-2xl m-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-black/20">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center font-semibold text-gray-700 gap-4 flex-1">
            <h2 className="text-left">Product</h2>
            <h2 className="text-center">Quantity</h2>
            <h2 className="text-center">Price</h2>
            <h2 className="text-center">Sub-Total</h2>
            <h2 className="text-center">Remove</h2>
          </div>
        </div>

        {/* Cart Items */}
        {cartItems.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
            <p className="text-gray-500">Add some products to get started!</p>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                Error loading cart: {error}
              </div>
            )}
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                Warning: Cart data may not be up to date. {error}
              </div>
            )}
            {cartItems.map((item) => {
              const isUpdating = updatingItems.has(item.productId);
              return (
            <div
              key={item.productId}
              className={`relative grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center py-6 border-b border-black/10 gap-4`}
            >
              {isUpdating && (
                <div className="absolute left-0 top-0 right-0 bottom-0 bg-white/20 rounded-sm flex items-center justify-center z-20 pointer-events-none">
                  <Loader className="h-6 w-6 animate-spin text-amber-900" />
                </div>
              )}
                {/* Product */}
                <div className="flex gap-4 items-center">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={item.product.images?.[0] || "/images/placeholder.png"}
                      alt={item.product.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg text-gray-800">
                      {item.product.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Stock: {item.product.stock || "N/A"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Category: {item.product.category}
                    </p>
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex justify-center">
                  <div className="bg-white flex items-center gap-3 px-3 py-1 rounded-full border border-gray-200">
                    <button
                      className="text-lg font-bold hover:bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full transition-colors disabled:opacity-50"
                      onClick={() => handleQuantityUpdate(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1 || isUpdating}
                    >
                      <Minus size={16} />
                    </button>

                    <span className="text-base font-medium min-w-8 text-center">
                      {item.quantity}
                    </span>

                    <button
                      className="text-lg font-bold hover:bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full transition-colors disabled:opacity-50"
                      onClick={() => handleQuantityUpdate(item.productId, item.quantity + 1)}
                      disabled={(item.product.stock ? item.quantity >= item.product.stock : false) || isUpdating}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="text-center font-medium text-base">
                  ${parseFloat(item.product.price).toFixed(2)}
                </div>

                {/* Sub Total */}
                <div className="text-center font-semibold text-lg">
                  ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                </div>

                {/* Remove Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => handleRemoveItem(item.productId)}
                    disabled={isUpdating}
                    className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Remove ${item.product.title} from cart`}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
            </div>
            );
            })}
          </>
        )}
      </section>

      {/* CHECKOUT SECTION */}
      <section className="p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full items-start">
          {/* LEFT – COUPON */}
          <div>
            <h1 className="font-bold text-2xl mb-4">Have a Coupon?</h1>

            <p className="mb-8 text-black/70 max-w-md">
              Add your promotional code to receive a discount on your order.
            </p>

            <div className="flex bg-white rounded-2xl overflow-hidden w-fit border border-black/5">
              <input
                type="text"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Enter coupon code"
                className="px-5 py-3 outline-none text-black"
              />
              <button
                onClick={() =>
                  coupon == todayDiscount &&
                  alert(`Coupon ${coupon} applied an amount of $${150} !`)
                }
                className="px-6 font-semibold hover:bg-black hover:text-white transition-colors"
              >
                Apply
              </button>
            </div>
          </div>

          {/* RIGHT – SUMMARY */}
          <div className="bg-[#EFE7DA] rounded-2xl border border-white p-8 w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Cart Summary</h2>
              <div className="flex flex-col items-end text-xs text-gray-500">
                {refreshing ? (
                  <span className="flex items-center gap-1">
                    <Loader className="h-3 w-3 animate-spin" />
                    Updating...
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    Real-time sync enabled
                  </span>
                )}
                <span className="text-[10px] text-gray-400 mt-1">
                  Auto-updates every 30s
                </span>
              </div>
            </div>

            {/* Shipping Progress */}
            {/* {subtotal < 100 && (
              <div className="relative mb-6">
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
            )} */}

            {/* Free Shipping Unlocked */}
            {/* {subtotal >= 100 && (
              <div className="bg-green-100 border-2 border-green-400 text-green-800 px-4 py-3 rounded-xl text-sm flex items-center gap-3 mb-6 animate-pulse">
                <span className="text-2xl">🎉</span>
                <span className="flex-1">
                  <span className="font-bold block">Congratulations!</span>
                  <span className="text-xs block mt-0.5">You've unlocked free shipping! 🚚</span>
                </span>
              </div>
            )} */}

            {/* Shipping Options */}
            <div className="space-y-4">
              {cartData?.availableShipping.map((shipping) => (
                <label
                  key={shipping.id}
                  className={`flex items-center justify-between p-4 rounded-lg cursor-pointer border transition-all ${
                    selectedShipping?.id === shipping.id
                      ? "border-black bg-[#EFE7DA]"
                      : "border-transparent bg-white/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      value={shipping.id}
                      checked={selectedShipping?.id === shipping.id}
                      onChange={() => setSelectedShipping(shipping)}
                      className="accent-black w-4 h-4"
                    />
                    <div>
                      <span className="font-medium">{shipping.name}</span>
                      <p className="text-sm text-gray-600">{shipping.description}</p>
                      <p className="text-xs text-gray-500">{shipping.estimatedDays}</p>
                    </div>
                  </div>
                  <span className="font-bold">${parseFloat(shipping.cost).toFixed(2)}</span>
                </label>
              ))}
            </div>

            <div className="my-6 h-px bg-black/10" />

            <div className="flex justify-between mb-4">
              <span className="text-lg">Subtotal</span>
              <span className="text-lg font-medium">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between mb-4">
              <span className="text-lg">Shipping</span>
              <span className="text-lg font-medium">
                ${shippingCost.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between mb-4">
              <span className="text-lg">GST ({gstPercentage?.toFixed(1)}%)</span>
              <span className="text-lg font-medium">
                ${gstAmount.toFixed(2)}
              </span>
            </div>

            {coupon === todayDiscount && (
              <div className="flex justify-between mb-4">
                <span className="text-lg text-green-600">Discount</span>
                <span className="text-lg font-medium text-green-600">
                  -${discount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="mb-4 h-px bg-black/10" />

            <div className="flex justify-between text-xl font-bold mb-10">
              <span>Grand Total</span>
              <span>
                $
                {coupon === todayDiscount
                  ? Math.max(0, grandTotal - discount).toFixed(2)
                  : grandTotal.toFixed(2)}
              </span>
            </div>

            <div className="flex">
              <button
                onClick={() => router.push("/shop/cart/checkout")}
                disabled={cartItems.length === 0}
                className="w-full px-10 py-4 bg-black rounded-2xl text-white flex justify-center items-center hover:bg-black/80 transition-all active:scale-[0.98] disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CHECKOUT OVERLAY PAGE */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="absolute top-0 right-0 h-full w-full lg:w-[75%] bg-white overflow-y-auto shadow-2xl animate-in slide-in-from-right">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setOpen(false)}
                  className="text-sm font-bold hover:underline"
                >
                  ← Back to Cart
                </button>
                <h2 className="text-xl font-bold">Checkout</h2>
              </div>
              <div className="font-bold">Total: ${grandTotal.toFixed(2)}</div>
            </div>

            <div className="p-10">
              <CheckOutPage />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
