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
//               <div className="font-bold">Total: ${total.toFixed(2)}</div>
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
import { TruckElectric, Plus, Minus, Trash2 } from "lucide-react";
import CheckOutPage from "./checkout/page";
import { useState, useMemo } from "react";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Page() {
  // cart value
  const { updateQty, cartItems, removeFromCart, subtotal } = useCart();
  const [shipping, setShipping] = useState<"free" | "express">("free");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const shippingCost = shipping === "free" ? 0 : 15;
  const total = subtotal + shippingCost;

  // fake coupon
  const [coupon, setCoupon] = useState("");
  const todayDiscount = "XXYY";
  const discount = 150;

  return (
    <section className="bg-[#EBE3D5]">
      {/* HERO SECTION */}
      <section>
        <div className="relative min-h-[35vh] bg-[url('/images/dislaimerbg.jpg')] bg-cover bg-center overflow-hidden">
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-white/10" />

          <div className="relative z-10 flex flex-col items-center justify-center text-white text-center py-40 px-6">
            <h1 className="text-6xl font-bold mb-4">Cart</h1>

            <p className="max-w-xl mb-6 text-white/90">
              Review your selected items and proceed to secure checkout.
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
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center pb-4 border-b border-black/20 font-semibold text-gray-700 gap-4">
          <h2 className="text-left">Product</h2>
          <h2 className="text-center">Quantity</h2>
          <h2 className="text-center">Price</h2>
          <h2 className="text-center">Sub-Total</h2>
          <h2 className="text-center">Remove</h2>
        </div>

        {/* Cart Items */}
        {cartItems.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
            <p className="text-gray-500">Add some products to get started!</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center py-6 border-b border-black/10 gap-4"
            >
              {/* Product */}
              <div className="flex gap-4 items-center">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={item.image || "/images/placeholder.png"}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-lg text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-500">Stock: {item.stock || 'N/A'}</p>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex justify-center">
                <div className="bg-white flex items-center gap-3 px-4 py-2 rounded-full border border-gray-200">
                  <button
                    className="text-lg font-bold hover:bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full transition-colors disabled:opacity-50"
                    onClick={() => updateQty(item.id, -1)}
                    disabled={item.qty <= 1}
                  >
                    <Minus size={16} />
                  </button>

                  <span className="text-base font-medium min-w-8 text-center">
                    {item.qty}
                  </span>

                  <button
                    className="text-lg font-bold hover:bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full transition-colors disabled:opacity-50"
                    onClick={() => updateQty(item.id, 1)}
                    disabled={(item.stock ? item.qty >= item.stock : false)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="text-center font-medium text-base">
                ${item.price.toFixed(2)}
              </div>

              {/* Sub Total */}
              <div className="text-center font-semibold text-lg">
                ${(item.price * item.qty).toFixed(2)}
              </div>

              {/* Remove Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
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
            <h2 className="text-2xl font-bold mb-6">Cart Summary</h2>

            {/* Shipping Options */}
            <div className="space-y-4">
              <label
                className={`flex items-center justify-between p-4 rounded-lg cursor-pointer border transition-all ${
                  shipping === "free"
                    ? "border-black bg-[#EFE7DA]"
                    : "border-transparent bg-white/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    value="free"
                    checked={shipping === "free"}
                    onChange={() => setShipping("free")}
                    className="accent-black w-4 h-4"
                  />
                  <span className="font-medium">Free Shipping</span>
                </div>
                <span className="font-bold">$0.00</span>
              </label>

              <label
                className={`flex items-center justify-between p-4 rounded-lg cursor-pointer border transition-all ${
                  shipping === "express"
                    ? "border-black bg-[#EFE7DA]"
                    : "border-transparent bg-white/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    value="express"
                    checked={shipping === "express"}
                    onChange={() => setShipping("express")}
                    className="accent-black w-4 h-4"
                  />
                  <span className="font-medium">Express Shipping</span>
                </div>
                <span className="font-bold">$15.00</span>
              </label>
            </div>

            <div className="my-6 h-px bg-black/10" />

            <div className="flex justify-between mb-4">
              <span className="text-lg">Subtotal</span>
              <span className="text-lg font-medium">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            {coupon === todayDiscount && (
              <div className="flex justify-between mb-4">
                <span className="text-lg">Discount</span>
                <span className="text-lg font-medium">
                  -${discount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="mb-4 h-px bg-black/10" />

            <div className="flex justify-between text-xl font-bold mb-10">
              <span>Total</span>
              {/* Temp coupon applied */}
              <span>
                $
                {coupon == todayDiscount
                  ? (total - discount).toFixed(2)
                  : total.toFixed(2)}
              </span>
            </div>

            <div className="flex">
              <button
                onClick={() => router.push('/shop/cart/checkout')}
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
              <div className="font-bold">Total: ${total.toFixed(2)}</div>
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
