"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

interface ProductCardProps {
  id: string;
  photo: string;
  name: string;
  description: string;
  amount: number;
  stock?: number;
}

export default function ProductCard({
  id,
  photo,
  name,
  description,
  amount,
  stock = 50,
}: ProductCardProps) {
  const { cartItems, addToCart, updateQty, removeFromCart } = useCart();

  const [isAdded, setIsAdded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const cartItem = cartItems.find((item) => item.id === id);
  const qty = cartItem?.qty ?? 0;

  // SINGLE SOURCE OF TRUTH
  const itemStock = Math.max(0, stock - qty);
  const isInCart = qty > 0;
  const isOutOfStock = itemStock === 0;

  /* ---------- ADD TO CART ---------- */
  const handleAddToCart = () => {
    if (isOutOfStock) return;

    if (cartItem) {
      updateQty(id, +1);
    } else {
      addToCart({
        id,
        name,
        price: amount,
        image: photo,
      });
    }

    setIsAdded(true);
    setIsAnimating(true);

    setTimeout(() => setIsAnimating(false), 300);
    setTimeout(() => setIsAdded(false), 1200);
  };

  /* ---------- INCREASE ---------- */
  const handleIncrease = () => {
    if (isOutOfStock) return;

    updateQty(id, +1);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  /* ---------- DECREASE ---------- */
  const handleDecrease = () => {
    if (!cartItem) return;

    if (cartItem.qty === 1) {
      removeFromCart(id);
    } else {
      updateQty(id, -1);
    }

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <div className="group bg-white p-4 py-8 rounded-xl border shadow-sm hover:shadow-lg transition relative overflow-hidden">
      {/* Image */}
      <div className="relative  h-75 mb-6 rounded-lg overflow-hidden">
        <Image src={photo} alt={name} fill className="object-cover group-hover:scale-105 transition" />
      </div>

      {/* Info */}
      <h2 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1">{name}</h2>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>

      {/* Price + Cart */}
      <div className="flex justify-between items-center">
        <span className="font-bold text-xl">{formatPrice(amount)}</span>

        {isInCart ? (
          <div
            className={`flex items-center gap-2 bg-amber-900 text-white px-3 py-2 rounded-full transition ${
              isAnimating ? "scale-105" : ""
            }`}
          >
            <button onClick={handleDecrease} className="p-1 hover:bg-amber-800 rounded-full">
              <Minus size={16} />
            </button>

            <span className="min-w-5 text-center font-bold">{qty}</span>

            <button
              onClick={handleIncrease}
              disabled={isOutOfStock}
              className="p-1 hover:bg-amber-800 rounded-full disabled:opacity-50"
            >
              <Plus size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`p-2 rounded-full transition
              ${
                isOutOfStock
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-amber-900 text-white hover:bg-amber-800 active:scale-95"
              }
            `}
          >
            <ShoppingCart size={18} />
          </button>
        )}
      </div>

      
    </div>
  );
}
