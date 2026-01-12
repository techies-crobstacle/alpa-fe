"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, Truck, Tag, ShoppingCart as CartIcon } from "lucide-react";

type CartItem = {
  id: number;
  name: string;
  size: string;
  price: number;
  image: string;
  qty: number;
};

const MOCK_CART: CartItem[] = [
  {
    id: 1,
    name: "Bal d'Afrique",
    size: "225 ml",
    price: 40,
    qty: 1,
    image: "/images/temp/1.jpg",
  },
  {
    id: 2,
    name: "Seven Veils",
    size: "100 ml",
    price: 180,
    qty: 1,
    image: "/images/temp/2.jpg",
  },
  {
    id: 3,
    name: "Rose of No Man's Land",
    size: "30 ml",
    price: 32,
    qty: 1,
    image: "/images/temp/3.jpg",
  },
];

export default function MiniCart({ onClose }: { onClose: () => void }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(MOCK_CART);
  const [isAnimating, setIsAnimating] = useState<number | null>(null);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const shippingThreshold = 100;
  const isFreeShipping = subtotal >= shippingThreshold;

  const updateQuantity = (id: number, change: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, qty: Math.max(1, item.qty + change) }
          : item
      )
    );
    setIsAnimating(id);
    setTimeout(() => setIsAnimating(null), 300);
  };

  const removeItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="h-full w-full flex flex-col">
      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 py-12">
            <div className="w-20 h-20 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <CartIcon className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-700">Your cart is empty</p>
            <p className="text-sm mt-1 text-gray-500">Add items to get started</p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          cartItems.map((item) => (
            <div
              key={item.id}
              className={`relative p-4 rounded-xl border transition-all duration-300
                ${isAnimating === item.id 
                  ? 'scale-105 bg-blue-50 border-blue-200 shadow-md' 
                  : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                }
              `}
            >
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="relative">
                  <div className="relative w-16 h-20 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="pr-2">
                      <p className="font-semibold text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{item.size}</p>
                      <p className="text-lg font-bold text-gray-900 mt-2">
                        €{(item.price * item.qty).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50 ml-2 shrink-0"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border rounded-full">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-2 hover:bg-gray-100 rounded-l-full transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-4 py-1 text-sm font-medium min-w-[40px] text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-2 hover:bg-gray-100 rounded-r-full transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary & Checkout - Only show if cart has items */}
      {cartItems.length > 0 && (
        <div className="sticky bottom-0 border-t border-gray-100 bg-white/95  p-6 space-y-4">
          {/* Shipping Progress */}
          

          

          {/* Total */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-bold text-gray-900">Total</p>
                <p className="text-sm text-gray-500">Including VAT</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                €{subtotal.toFixed(2)}
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3 pt-2">
            
            <Link
              href="/cart"
              onClick={onClose}
              className="block w-full text-center border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              View Full Cart
            </Link>
          </div>

          {/* Close cart hint */}
          
        </div>
      )}
    </div>
  );
}