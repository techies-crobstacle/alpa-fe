import Image from "next/image";

interface ProductCardProps {
  photo: string;
  name: string;
  description: string;
  amount: string;
}

export default function ProductCard({
  photo,
  name,
  description,
  amount,
}: ProductCardProps) {
  return (
    <div className="bg-amber-50 p-4 rounded-xl flex flex-col h-full">
      <div className="relative w-full h-80 mb-5">
        <Image
          src={photo}
          alt={name}
          fill
          className="object-cover rounded-lg"
        />
      </div>

      <h1 className="font-bold text-lg mb-2">{name}</h1>
      <p className="text-sm text-gray-700 grow mb-5 ">{description}</p>
      <h1 className="font-black text-2xl">{amount} AUD</h1>
      
    </div>
  );
}
