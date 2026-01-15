"use client";
import Image from "next/image";
import { ShoppingCart, Heart } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

interface ProductCardProps {
  id: string;
  photo: string;
  name: string;
  description: string;
  amount: number;
}

export default function ProductCard({
  id,
  photo,
  name,
  description,
  amount,
}: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <div className="bg-amber-50 p-4 rounded-xl border shadow-sm">
      <div className="relative w-full h-64 mb-4">
        <Image src={photo} alt={name} fill className="object-cover rounded-lg" />
      </div>

      <h2 className="font-bold">{name}</h2>
      <p className="text-sm mb-3">{description}</p>

      <div className="flex justify-between items-center">
        <span className="font-bold">{amount} AUD</span>

        <button
          onClick={() =>
            addToCart({
              id,
              name,
              price: amount,
              image: photo,
            })
          }
          className="bg-amber-900 p-2 rounded-full"
        >
          <ShoppingCart className="text-[#E6CFAF]" />
        </button>
      </div>
    </div>
  );
}
