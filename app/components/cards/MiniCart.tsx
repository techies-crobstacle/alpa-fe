"use client";

import Image from "next/image";
import { X, Plus, Minus } from "lucide-react";
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
    <div className="fixed inset-y-0 right-0 w-full sm:w-105 py-5 bg-white z-50 flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.15)]">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-5 border-b">
        <div>
          <h2 className="text-xl font-semibold">Your Cart</h2>
          <p className="text-sm text-gray-500">
            {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Image
              src="/images/empty-cart.svg"
              alt="Empty cart"
              width={120}
              height={120}
              className="opacity-60 mb-4"
            />
            <p className="text-gray-600 mb-6">Your cart is empty</p>
            <button
              onClick={() => navigate("/shop")}
              className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 rounded-xl border hover:shadow-sm transition"
              >
                {/* IMAGE */}
                <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  <Image
                    src={item.image || "/images/placeholder.png"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* INFO */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold text-sm truncate cursor-pointer hover:text-[#441208]"
                    onClick={() =>
                      navigate(`/shop/${item.slug || item.id}`)
                    }
                  >
                    {item.name}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    ${item.price.toFixed(2)} each
                  </p>

                  {/* QTY */}
                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex items-center border rounded-full overflow-hidden">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        disabled={item.qty <= 1}
                        className="px-3 py-2 hover:bg-gray-100 disabled:opacity-40"
                      >
                        <Minus size={14} />
                      </button>

                      <span className="px-4 text-sm font-medium">
                        {item.qty}
                      </span>

                      <button
                        onClick={() => updateQty(item.id, 1)}
                        disabled={item.stock ? item.qty >= item.stock : false}
                        className="px-3 py-2 hover:bg-gray-100 disabled:opacity-40"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* PRICE + REMOVE */}
                <div className="flex flex-col items-end justify-between">
                  <p className="font-semibold text-sm">
                    ${(item.price * item.qty).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      {cartItems.length > 0 && (
        <div className="border-t px-6 py-5 bg-white">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-xl font-semibold">
              ${subtotal.toFixed(2)}
            </span>
          </div>

          {subtotal < 100 && (
            <div className="text-sm bg-green-50 text-green-700 px-4 py-2 rounded-lg mb-4">
              Add ${(100 - subtotal).toFixed(2)} more for free shipping
            </div>
          )}

          <button
            onClick={() => navigate("/shop/cart/checkout")}
            className="w-full bg-black text-white py-3.5 rounded-xl font-medium hover:bg-gray-800 transition mb-3"
          >
            Proceed to Checkout
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/shop/cart")}
              className="flex-1 border py-3 rounded-xl hover:bg-gray-50 transition"
            >
              View Cart
            </button>
            <button
              onClick={() => navigate("/shop")}
              className="flex-1 border py-3 rounded-xl hover:bg-gray-50 transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
