// app/components/MiniCart.tsx
"use client";

import Image from "next/image";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MiniCart({ onClose }: { onClose: () => void }) {
  const { cartItems, updateQty, removeFromCart, subtotal } = useCart();
  const router = useRouter();

  useEffect(() => {
    const handlePopState = () => onClose();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [onClose]);

  const navigate = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <div className="fixed inset-y-0 right-0 -top-5 pb-5 w-full sm:w-110 bg-linear-to-b from-white to-gray-50 z-50 flex flex-col shadow-2xl">
      
      {/* HEADER */}
      <div className="relative bg-linear-to-r from-[#440C03] to-[#6F433A] px-6 py-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          aria-label="Close cart"
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-3 text-white">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Shopping Cart</h2>
            <p className="text-white/80 text-sm mt-0.5">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {false ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#440C03] mx-auto"></div>
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
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.cartId || item.id}
                className="group relative bg-white p-4 rounded-2xl border border-gray-200 hover:border-[#A48068] hover:shadow-md transition-all duration-200"
              >
                <div className="flex gap-4">
                  {/* IMAGE */}
                  <div 
                    className="relative w-24 h-28 rounded-xl overflow-hidden bg-gray-50 shrink-0 cursor-pointer group-hover:scale-[1.02] transition-transform"
                    onClick={() => navigate(`/shop/${item.slug || item.id}`)}
                  >
                    <Image
                      src={item.image || "/images/placeholder.png"}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>

                  {/* INFO */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-semibold text-gray-800 line-clamp-2 cursor-pointer hover:text-[#440C03] transition-colors mb-2"
                      onClick={() => navigate(`/shop/${item.slug || item.id}`)}
                    >
                      {item.name}
                    </h3>

                    <p className="text-sm text-gray-500 mb-4">
                      ${item.price.toFixed(2)} each
                    </p>

                    {/* QTY CONTROLS */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          disabled={item.qty <= 1}
                          className="px-3 py-2 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>

                        <span className="px-4 py-2 text-sm font-semibold min-w-12 text-center bg-white">
                          {item.qty}
                        </span>

                        <button
                          onClick={() => updateQty(item.id, 1)}
                          disabled={(item.stock ? item.qty >= item.stock : false)}
                          className="px-3 py-2 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-lg text-[#440C03]">
                          ${(item.price * item.qty).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* REMOVE BUTTON */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  disabled={false}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100 disabled:opacity-50"
                  aria-label="Remove item"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      {cartItems.length > 0 && (
        <div className="border-t bg-white px-6 py-6 space-y-4">
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

          {/* Subtotal */}
          <div className="flex justify-between items-center py-3 border-t border-b border-gray-200">
            <span className="text-lg font-medium text-gray-700">Subtotal</span>
            <span className="text-2xl font-bold text-[#440C03]">
              ${subtotal.toFixed(2)}
            </span>
          </div>

          {/* Checkout Button */}
          {/* <button
            onClick={() => navigate("/shop/cart/checkout")}
            className="w-full bg-linear-to-r from-[#440C03] to-[#6F433A] text-white py-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 text-lg"
          >
            Proceed to Checkout
          </button> */}

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