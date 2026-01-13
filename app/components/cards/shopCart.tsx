import { Trash2 } from "lucide-react";
import { useState,useEffect } from "react";

// fake api
type Product = {
    id : string,
    name : string,
    data : {
        year?: number,
        price?: number,
        "CPU model"?: string;
        "Hard disk size"?: string;
    };
  };


export default function CartItem() {
  const quantity = 1;
  const price = 120;
  const subtotal = quantity * price;


  // temp
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState< Product | null>(null)

    useEffect(() =>{
        fetch("https://api.restful-api.dev/objects/7")
        .then((res) =>res.json())
        .then((data) =>{
            setProduct(data)
            setLoading(false)
        })
        .catch((err) =>{
            console.log(err)
            setLoading(false)
        });
    },[])

  return (
    <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-6 items-center py-6 border-t border-black/30">
      {/* Product */}
      <div className="flex gap-4 items-center">
        <img
          src="/images/temp/1.jpg"
          alt="product"
          className="h-24 w-24 rounded-2xl object-cover"
        />
        <div>
          <h3 className="font-bold mb-1">Description</h3>
          <p className="text-sm">Color: Red</p>
          <p className="text-sm">Size: SM</p>
          <Trash2 className="mt-2 text-red-600 cursor-pointer" />
        </div>
      </div>

      {/* Quantity */}
      <div className="flex justify-center">
        <div className="bg-white flex items-center gap-4 px-4 py-2 rounded-full border">
          <button className="text-lg font-bold">−</button>
          <span>{quantity}</span>
          <button className="text-lg font-bold">+</button>
        </div>
      </div>

      {/* Price */}
      <div className="text-center font-semibold">${product?.data.price}</div>

      {/* Subtotal */}
      <div className="text-center font-semibold">${subtotal}</div>
    </div>
  );
}
