"use client";
import { Link, Trash2 } from "lucide-react";

type CartItemProps = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  onUpdate: (id: number, change: number) => void;
  onRemove: (id: number) => void;
};

export default function CartItem({
  id,
  name,
  price,
  quantity,
  onUpdate,
  onRemove,
}: CartItemProps) {
  const subtotal = price * quantity;

  return (
    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center py-4 border-b border-black/20">

      {/* Product */}
      <div className="flex gap-2 items-center">
        <img
          src="/images/temp/1.jpg"
          alt={name}
          className="h-16 w-20 rounded-lg object-cover"
          
        />
        <h3 className="font-medium text">{name}</h3>
      </div>

      {/* Quantity */}
      <div className="flex justify-center">
        <div className="bg-white flex items-center gap-3 px-3 py-1 rounded-full border">
          <button
            className="text-sm font-bold"
            onClick={() => onUpdate(id, -1)}
          >
            −
          </button>

          <span className="text-sm">{quantity}</span>

          <button
            className="text-sm font-bold"
            onClick={() => onUpdate(id, 1)}
          >
            +
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="text-center font-medium text-sm">
        ${price}
      </div>

      {/* Subtotal */}
      <div className="text-center font-medium text-sm">
        ${subtotal}
      </div>

      {/* Delete (RIGHTMOST) */}
      <div className="flex justify-end">
        <button
          onClick={() => onRemove(id)}
          className="text-red-500 hover:text-red-700"
          aria-label="Remove item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
