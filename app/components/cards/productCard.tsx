// app/components/cards/ProductCard.tsx
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

  // Find the cart item by product ID
  const cartItem = cartItems.find((item) => item.id === id);
  const qty = cartItem?.qty || 0;

  // Calculate remaining stock
  const remainingStock = Math.max(0, (stock || 0) - qty);
  const isInCart = qty > 0;
  const isOutOfStock = remainingStock === 0;

  /* ---------- ADD ---------- */
  const handleAdd = async () => {
    if (isOutOfStock) return;

    await addToCart({
      cartId: "",
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
  const handleIncrease = async () => {
    if (isOutOfStock || !cartItem) return;
    
    await updateQty(id, 1);
    animate();
  };

  /* ---------- DECREASE ---------- */
  const handleDecrease = async () => {
    if (!cartItem || qty === 0) return;

    if (qty === 1) {
      // Remove item completely
      await removeFromCart(id);
    } else {
      // Decrease quantity
      await updateQty(id, -1);
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
    }).format(price);

  return (
    <div className="group bg-white p-4 sm:p-6 py-6 sm:py-8 rounded-xl border shadow-sm hover:shadow-lg transition relative flex flex-col h-full">
      {/* IMAGE CONTAINER */}
      <div className="relative mb-4 sm:mb-6 rounded-lg overflow-hidden bg-gray-50 grow flex items-center justify-center min-h-50 sm:min-h-55 md:min-h-60 lg:min-h-65">
        {slug ? (
          <Link href={`/shop/${slug}`} className="w-full h-full flex items-center justify-center p-2 sm:p-4">
            <div className="relative w-full h-full">
              <Image
                src={photo || "/images/placeholder.png"}
                alt={name}
                fill
                className="object-contain p-1 sm:p-2 group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
          </Link>
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={photo || "/images/placeholder.png"}
              alt={name}
              fill
              className="object-contain p-1 sm:p-2 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
        )}
      </div>

      {/* INFO SECTION */}
      <div className="flex flex-col grow">
        <h2 className="font-bold text-base sm:text-lg text-gray-800 mb-1 line-clamp-1">
          {slug ? (
            <Link href={`/shop/${slug}`} className="hover:text-amber-900 transition-colors">
              {name}
            </Link>
          ) : (
            name
          )}
        </h2>

        <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2 grow">
          {description}
        </p>

        {/* PRICE + CART */}
        <div className="flex justify-between items-center mt-auto pt-3">
          <span className="font-bold text-lg sm:text-xl text-gray-900">{formatPrice(amount)}</span>

          {isInCart ? (
            <div
              className={`flex items-center gap-1 sm:gap-2 bg-amber-900 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-full transition-all ${
                isAnimating ? "scale-105" : ""
              }`}
            >
              <button
                onClick={handleDecrease}
                className="p-1 hover:bg-amber-800 rounded-full transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={14} className="sm:w-4 sm:h-4" />
              </button>

              <span className="min-w-4 sm:min-w-5 text-center font-bold text-sm sm:text-base">{qty}</span>

              <button
                onClick={handleIncrease}
                disabled={isOutOfStock}
                className="p-1 hover:bg-amber-800 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Increase quantity"
              >
                <Plus size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={`p-1.5 sm:p-2 rounded-full transition-all flex items-center justify-center ${
                isOutOfStock
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-amber-900 text-white hover:bg-amber-800 active:scale-95"
              }`}
              aria-label={isOutOfStock ? "Out of stock" : "Add to cart"}
            >
              <ShoppingCart size={16} className="sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}