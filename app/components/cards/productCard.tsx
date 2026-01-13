import Image from "next/image";
import { ShoppingCart, Heart } from "lucide-react";

interface ProductCardProps {
  photo: string;
  name: string;
  description: string;
  amount: number;
}

export default function ProductCard({
  photo,
  name,
  description,
  amount,
}: ProductCardProps) {
  return (
    <div
      className="bg-amber-50 p-4 rounded-xl flex flex-col h-full
border border-black/10
shadow-sm
hover:shadow-2xl hover:-translate-y-1 hover:shadow-black/30
transition-all duration-300 ease-out
"
    >
      <div className="relative w-full h-80 mb-5">
        <Image
          src={photo}
          alt={name}
          fill
          className="object-cover rounded-lg"
        />
      </div>

      <h1 className="font-bold text-lg ">{name}</h1>
      <p className="text-sm text-gray-700 grow mb-8 ">{description}</p>
      <div className="flex justify-between items-center">
        <h1 className="font-black text-xl">{amount} AUD</h1>
        <div className="flex gap-5">
          <button onClick={() =>{alert()}} className="bg-amber-900 p-2 rounded-full flex items-center justify-center">
            <Heart fill="#E6CFAF" className="h-6 w-6 text-[#E6CFAF]" />
          </button>
          <button onClick={() => {
            alert()
          }} className="bg-amber-900 p-2 rounded-full flex items-center justify-center">
            <ShoppingCart fill="#E6CFAF" className="h-6 w-6 text-[#E6CFAF]" />
          </button>
        </div>
      </div>
    </div>
  );
}
