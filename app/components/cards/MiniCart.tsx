// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { X, Plus, Minus, Truck, Tag, ShoppingCart as CartIcon } from "lucide-react";

// type CartItem = {
//   id: number;
//   name: string;
//   size: string;
//   price: number;
//   image: string;
//   qty: number;
// };

// const MOCK_CART: CartItem[] = [
//   {
//     id: 1,
//     name: "Bal d'Afrique",
//     size: "225 ml",
//     price: 40,
//     qty: 1,
//     image: "/images/temp/1.jpg",
//   },
//   {
//     id: 2,
//     name: "Seven Veils",
//     size: "100 ml",
//     price: 180,
//     qty: 1,
//     image: "/images/temp/2.jpg",
//   },
//   {
//     id: 3,
//     name: "Rose of No Man's Land",
//     size: "30 ml",
//     price: 32,
//     qty: 1,
//     image: "/images/temp/3.jpg",
//   },
// ];

// export default function MiniCart({ onClose }: { onClose: () => void }) {
//   const [cartItems, setCartItems] = useState<CartItem[]>(MOCK_CART);
//   const [isAnimating, setIsAnimating] = useState<number | null>(null);

//   const subtotal = cartItems.reduce(
//     (sum, item) => sum + item.price * item.qty,
//     0
//   );

//   const shippingThreshold = 100;
//   const isFreeShipping = subtotal >= shippingThreshold;

//   const updateQuantity = (id: number, change: number) => {
//     setCartItems(prev =>
//       prev.map(item =>
//         item.id === id
//           ? { ...item, qty: Math.max(1, item.qty + change) }
//           : item
//       )
//     );
//     setIsAnimating(id);
//     setTimeout(() => setIsAnimating(null), 300);
//   };

//   const removeItem = (id: number) => {
//     setCartItems(prev => prev.filter(item => item.id !== id));
//   };

//   return (
//     <div className="h-full w-full flex flex-col">
//       {/* Cart Items */}
//       <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
//         {cartItems.length === 0 ? (
//           <div className="h-full flex flex-col items-center justify-center text-gray-500 py-12">
//             <div className="w-20 h-20 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
//               <CartIcon className="h-10 w-10 text-gray-400" />
//             </div>
//             <p className="text-lg font-medium text-gray-700">Your cart is empty</p>
//             <p className="text-sm mt-1 text-gray-500">Add items to get started</p>
//             <button
//               onClick={onClose}
//               className="mt-6 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
//             >
//               Continue Shopping
//             </button>
//           </div>
//         ) : (
//           cartItems.map((item) => (
//             <div
//               key={item.id}
//               className={`relative p-4 rounded-xl border transition-all duration-300
//                 ${isAnimating === item.id 
//                   ? 'scale-105 bg-blue-50 border-blue-200 shadow-md' 
//                   : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
//                 }
//               `}
//             >
//               <div className="flex gap-4">
//                 {/* Product Image */}
//                 <div className="relative">
//                   <div className="relative w-16 h-20 shrink-0 overflow-hidden rounded-lg">
//                     <Image
//                       src={item.image}
//                       alt={item.name}
//                       fill
//                       className="object-cover transition-transform duration-300 hover:scale-110"
//                     />
//                   </div>
//                 </div>

//                 {/* Product Info */}
//                 <div className="flex-1 min-w-0">
//                   <div className="flex justify-between items-start">
//                     <div className="pr-2">
//                       <p className="font-semibold text-gray-900 truncate">
//                         {item.name}
//                       </p>
//                       <p className="text-sm text-gray-500 mt-1">{item.size}</p>
//                       <p className="text-lg font-bold text-gray-900 mt-2">
//                         €{(item.price * item.qty).toFixed(2)}
//                       </p>
//                     </div>
//                     <button
//                       onClick={() => removeItem(item.id)}
//                       className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50 ml-2 shrink-0"
//                       aria-label={`Remove ${item.name} from cart`}
//                     >
//                       <X size={18} />
//                     </button>
//                   </div>

//                   {/* Quantity Controls */}
//                   <div className="flex items-center justify-between mt-4">
//                     <div className="flex items-center border rounded-full">
//                       <button
//                         onClick={() => updateQuantity(item.id, -1)}
//                         className="p-2 hover:bg-gray-100 rounded-l-full transition-colors"
//                         aria-label="Decrease quantity"
//                       >
//                         <Minus size={14} />
//                       </button>
//                       <span className="px-4 py-1 text-sm font-medium min-w-10 text-center">
//                         {item.qty}
//                       </span>
//                       <button
//                         onClick={() => updateQuantity(item.id, 1)}
//                         className="p-2 hover:bg-gray-100 rounded-r-full transition-colors"
//                         aria-label="Increase quantity"
//                       >
//                         <Plus size={14} />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       {/* Summary & Checkout - Only show if cart has items */}
//       {cartItems.length > 0 && (
//         <div className="sticky bottom-0 border-t border-gray-100 bg-white/95  p-6 space-y-4">
//           {/* Shipping Progress */}
          

          

//           {/* Total */}
//           <div className="pt-4 border-t border-gray-200">
//             <div className="flex justify-between items-center">
//               <div>
//                 <p className="text-lg font-bold text-gray-900">Total</p>
//                 <p className="text-sm text-gray-500">Including VAT</p>
//               </div>
//               <p className="text-2xl font-bold text-gray-900">
//                 €{subtotal.toFixed(2)}
//               </p>
//             </div>
//           </div>

//           {/* CTA Buttons */}
//           <div className="space-y-3 pt-2">
            
//             <Link
//               href="/cart"
//               onClick={onClose}
//               className="block w-full text-center border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
//             >
//               View Full Cart
//             </Link>
//           </div>

//           {/* Close cart hint */}
          
//         </div>
//       )}
//     </div>
//   );
// }

// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { X, Plus, Minus, Truck, Tag, ShoppingCart as CartIcon } from "lucide-react";

// type CartItem = {
//   id: number;
//   name: string;
//   size: string;
//   price: number;
//   image: string;
//   qty: number;
// };

// const MOCK_CART: CartItem[] = [
//   {
//     id: 1,
//     name: "Bal d'Afrique",
//     size: "225 ml",
//     price: 40,
//     qty: 1,
//     image: "/images/temp/1.jpg",
//   },
//   {
//     id: 2,
//     name: "Seven Veils",
//     size: "100 ml",
//     price: 180,
//     qty: 1,
//     image: "/images/temp/2.jpg",
//   },
//   {
//     id: 3,
//     name: "Rose of No Man's Land",
//     size: "30 ml",
//     price: 32,
//     qty: 1,
//     image: "/images/temp/3.jpg",
//   },
//   {
//     id: 4,
//     name: "Rose of No Man's Land",
//     size: "30 ml",
//     price: 32,
//     qty: 1,
//     image: "/images/temp/3.jpg",
//   },
// ];

// export default function MiniCart({ onClose }: { onClose: () => void }) {
//   const [cartItems, setCartItems] = useState<CartItem[]>(MOCK_CART);
//   const [isAnimating, setIsAnimating] = useState<number | null>(null);


//   const subtotal = cartItems.reduce(
//     (sum, item) => sum + item.price * item.qty,
//     0
//   );

//   const cartItemCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

//   const shippingThreshold = 100;
//   const isFreeShipping = subtotal >= shippingThreshold;

//   const updateQuantity = (id: number, change: number) => {
//     setCartItems(prev =>
//       prev.map(item =>
//         item.id === id
//           ? { ...item, qty: Math.max(1, item.qty + change) }
//           : item
//       )
//     );
//     setIsAnimating(id);
//     setTimeout(() => setIsAnimating(null), 300);
//   };

//   const removeItem = (id: number) => {
//     setCartItems(prev => prev.filter(item => item.id !== id));
//   };

//   return (
//     <div className="fixed top-0 right-0 h-screen w-full max-w-sm flex flex-col bg-white/95 rounded-l-2xl shadow-2xl border-l border-gray-100 z-50">
//       {/* Close button */}
//       <div className="absolute top-6 right-6 z-10">
//         <button
//           onClick={onClose}
//           className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors hover:shadow-md group"
//           aria-label="Close cart"
//         >
//           <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
//         </button>
//       </div>
      
//       {/* Cart Header */}
//       <div className="p-5">
//         <div className="flex items-center justify-between">
//           <div>
//             <div className="flex flex-row gap-3 justify-center items-center">
//             <CartIcon />
//             <h2 className="text-2xl font-bold text-black bg-clip-text">
//               Your Cart
//             </h2></div>
//             <p className="text-sm text-gray-500 mt-1">
//               {cartItemCount} item{cartItemCount !== 1 ? 's' : ''}
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
//             aria-label="Close cart"
//           >
//             <X size={24} />
//           </button>
//         </div>
//       </div>
      
//       {/* Cart Items */}
//       <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
//         {cartItems.length === 0 ? (
//           <div className="h-full flex flex-col items-center justify-center text-gray-500 py-12">
//             <div className="w-20 h-20 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
//               <CartIcon className="h-10 w-10 text-gray-400" />
//             </div>
//             <p className="text-lg font-medium text-gray-700">Your cart is empty</p>
//             <p className="text-sm mt-1 text-gray-500">Add items to get started</p>
//             <button
//               onClick={onClose}
//               className="mt-6 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
//             >
//               Continue Shopping
//             </button>
//           </div>
//         ) : (
//           cartItems.map((item) => (
//             <div
//               key={item.id}
//               className={`relative p-3 rounded-lg border transition-all duration-300 flex flex-col gap-2
//                 ${isAnimating === item.id 
//                   ? 'scale-105 bg-blue-50 border-blue-200 shadow-md' 
//                   : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
//                 }
//               `}
//             >
//               <div className="flex gap-3">
//                 {/* Product Image */}
//                 <div className="relative">
//                   <div className="relative w-14 h-16 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
//                     <Image
//                       src={item.image}
//                       alt={item.name}
//                       fill
//                       className="object-cover transition-transform duration-300 hover:scale-110"
//                     />
//                   </div>
//                 </div>

//                 {/* Product Info */}
//                 <div className="flex-1 min-w-0">
//                   <div className="flex justify-between items-start gap-2">
//                     <div className="pr-1">
//                       <p className="font-semibold text-gray-900 truncate text-sm">
//                         {item.name}
//                       </p>
//                       <p className="text-xs text-gray-500 mt-0.5">{item.size}</p>
//                       <p className="text-base font-bold text-gray-900 mt-1">
//                         €{(item.price * item.qty).toFixed(2)}
//                       </p>
//                     </div>
//                     <button
//                       onClick={() => removeItem(item.id)}
//                       className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 ml-1 shrink-0"
//                       aria-label={`Remove ${item.name} from cart`}
//                     >
//                       <X size={16} />
//                     </button>
//                   </div>

//                   {/* Quantity Controls */}
//                   <div className="flex items-center justify-between mt-3">
//                     <div className="flex items-center border rounded-full bg-gray-50">
//                       <button
//                         onClick={() => updateQuantity(item.id, -1)}
//                         className="px-2 py-1 hover:bg-gray-100 rounded-l-full transition-colors"
//                         aria-label="Decrease quantity"
//                       >
//                         <Minus size={12} />
//                       </button>
//                       <span className="px-3 py-0.5 text-xs font-medium min-w-8 text-center">
//                         {item.qty}
//                       </span>
//                       <button
//                         onClick={() => updateQuantity(item.id, 1)}
//                         className="px-2 py-1 hover:bg-gray-100 rounded-r-full transition-colors"
//                         aria-label="Increase quantity"
//                       >
//                         <Plus size={12} />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       {/* Summary & Checkout - Only show if cart has items */}
//       {cartItems.length > 0 && (
//         <div className="sticky bottom-0 border-t border-gray-100 bg-white/95 rounded-b-2xl p-4 space-y-4 shadow-inner">
//           {/* Shipping Progress */}
          

          

//           {/* Total */}
//           <div className="pt-3 border-t border-gray-200">
//             <div className="flex justify-between items-center">
//               <div>
//                 <p className="text-base font-bold text-gray-900">Total</p>
//                 <p className="text-xs text-gray-500">Including VAT</p>
//               </div>
//               <p className="text-xl font-bold text-gray-900">
//                 €{subtotal.toFixed(2)}
//               </p>
//             </div>
//           </div>

//           {/* CTA Buttons */}
//           <div className="space-y-2 pt-1">
//             <Link
//               href="../shop/cart"
//               onClick={onClose}
//               className="block w-full text-center border-2 border-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
//             >
//               View Full Cart
//             </Link>
//           </div>

//           {/* Close cart hint */}
          
//         </div>
//       )}
//     </div>
//   );
// }


// ##############################___using api 

"use client";

import Image from "next/image";
import { X, Plus, Minus } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";


export default function MiniCart({ onClose }: { onClose: () => void }) {
  const { cartItems, updateQty, removeFromCart, subtotal } = useCart();

  const router = useRouter();

  return (
    <div className="fixed top-0 right-0 h-screen w-90 bg-white shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center shrink-0">
        <h2 className="font-bold text-lg">Your Cart</h2>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close cart"
        >
          <X size={20} />
        </button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {cartItems.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 text-center">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div 
                key={item.id} 
                className="flex gap-3 items-start p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {/* Image */}
                <div className="relative w-16 h-16 shrink-0">
                  <Image
                    src={item.image || "/images/placeholder.png"}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-cover rounded-md"
                    priority={false}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    ${(item.price * item.qty).toFixed(2)}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="border border-gray-300 w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={item.qty <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>

                    <span className="w-8 text-center">{item.qty}</span>

                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="border border-gray-300 w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                  aria-label="Remove item"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {cartItems.length > 0 && (
        <div className="border-t p-4 shrink-0 bg-white">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-bold text-lg">${subtotal.toFixed(2)}</span>
          </div>
          
          <div className="space-y-2">
            <button 
              className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              onClick={() => {
                // Add checkout logic here
                router.push("/shop/cart/checkout");
              }}
            >
              Checkout
            </button>
            
            <button 
              className="w-full border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              onClick={() =>{
                router.push("shop/cart")
              }}
            >
              View Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}