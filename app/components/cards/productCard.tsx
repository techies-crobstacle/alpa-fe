"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

interface ProductCardProps {
  id: string;
  photo: string;
  name: string;
  description: string;
  amount: number;
  stock?: number;
  slug?: string;
}

export default function ProductCard({
  id,
  photo,
  name,
  description,
  amount,
  stock = 50,
  slug,
}: ProductCardProps) {
  const { cartItems, addToCart, updateQty, removeFromCart } = useCart();

  const [isAnimating, setIsAnimating] = useState(false);

  const cartItem = cartItems.find((item) => item.id === id);
  const qty = cartItem?.qty ?? 0;

  // SINGLE SOURCE OF TRUTH
  const remainingStock = Math.max(0, stock - qty);
  const isInCart = qty > 0;
  const isOutOfStock = remainingStock === 0;

  /* ---------- ADD ---------- */
  const handleAdd = () => {
    if (isOutOfStock) return;

    addToCart({
      id,
      name,
      price: amount,
      image: photo,
      stock,
      slug,
    });

    animate();
  };

  /* ---------- INCREASE ---------- */
  const handleIncrease = () => {
    if (isOutOfStock) return;
    updateQty(id, +1);
    animate();
  };

  /* ---------- DECREASE ---------- */
  const handleDecrease = () => {
    if (!cartItem) return;

    if (cartItem.qty === 1) {
      removeFromCart(id);
    } else {
      updateQty(id, -1);
    }

    animate();
  };

  const animate = () => {
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
    <div className="group bg-white p-4 py-8 rounded-xl border shadow-sm hover:shadow-lg transition relative">
      {/* IMAGE */}
      <div className="relative h-64 mb-6 rounded-lg overflow-hidden">
        {slug ? (
          <Link href={`/shop/${slug}`}>
            <Image
              src={photo}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition"
            />
          </Link>
        ) : (
          <Image
            src={photo}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition"
          />
        )}
      </div>

      {/* INFO */}
      <h2 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1">
        {slug ? <Link href={`/shop/${slug}`}>{name}</Link> : name}
      </h2>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {description}
      </p>

      {/* PRICE + CART */}
      <div className="flex justify-between items-center">
        <span className="font-bold text-xl">{formatPrice(amount)}</span>

        {isInCart ? (
          <div
            className={`flex items-center gap-2 bg-amber-900 text-white px-3 py-2 rounded-full transition ${
              isAnimating ? "scale-105" : ""
            }`}
          >
            <button
              onClick={handleDecrease}
              className="p-1 hover:bg-amber-800 rounded-full"
            >
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
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`p-2 rounded-full transition ${
              isOutOfStock
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-amber-900 text-white hover:bg-amber-800 active:scale-95"
            }`}
          >
            <ShoppingCart size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
