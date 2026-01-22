"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Minus, Plus, Heart, Star } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

interface ProductCardProps {
  id: string;
  photo: string;
  name: string;
  description: string;
  amount: number;
  stock?: number;
  slug?: string;
  rating?: number;
}

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://alpa-be-1.onrender.com";

export default function ProductCard({
  id,
  photo,
  name,
  description,
  amount,
  stock = 50,
  slug,
  rating = 4.5,
}: ProductCardProps) {
  const { cartItems, addToCart, updateQty, removeFromCart } = useCart();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Find the cart item by product ID
  const cartItem = cartItems.find((item) => item.id === id);
  const qty = cartItem?.qty || 0;

  // Calculate remaining stock
  const remainingStock = Math.max(0, (stock || 0) - qty);
  const isInCart = qty > 0;
  const isOutOfStock = remainingStock === 0;

  /* ---------- CHECK WISHLIST STATUS ---------- */
  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          setIsWishlisted(false);
          return;
        }

        const response = await fetch(`${baseURL}/api/wishlist/`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Wishlist data:', data, 'Looking for product ID:', id);
          // Check if current product is in the wishlist array
          if (Array.isArray(data)) {
            const isInWishlist = data.some((item: any) => {
              console.log('Checking item:', item, 'against product id:', id);
              return item.id === id || item.productId === id || item.product?.id === id;
            });
            console.log('Is in wishlist:', isInWishlist);
            setIsWishlisted(isInWishlist);
          } else if (data && data.wishlist && Array.isArray(data.wishlist)) {
            const isInWishlist = data.wishlist.some((item: any) => {
              console.log('Checking wishlist item:', item, 'against product id:', id);
              return item.id === id || item.productId === id || item.product?.id === id;
            });
            console.log('Is in wishlist (nested):', isInWishlist);
            setIsWishlisted(isInWishlist);
          } else {
            console.log('No valid wishlist data found');
            setIsWishlisted(false);
          }
        } else {
          setIsWishlisted(false);
          let errorText = '';
          try { errorText = await response.text(); } catch {}
          console.error('Wishlist fetch failed:', response.status, errorText);
        }
      } catch (error) {
        setIsWishlisted(false);
        console.error("Error fetching wishlist:", error);
      }
    };

    checkWishlistStatus();
  }, [id]);

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

  /* ---------- ADD TO WISHLIST ---------- */
  const handleWishlist = async () => {
    if (wishlistLoading || isWishlisted) return; // Don't allow if already in wishlist
    
    setWishlistLoading(true);
    setIsHeartAnimating(true);
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await fetch(`${baseURL}/api/wishlist/${id}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsWishlisted(true);
        }
      } else {
        let errorText = '';
        try { errorText = await response.text(); } catch {}
        console.error("Failed to add to wishlist", response.status, errorText);
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    } finally {
      setWishlistLoading(false);
      setTimeout(() => setIsHeartAnimating(false), 300);
    }
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

  /* ---------- RENDER STARS ---------- */
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star
            key={i}
            size={14}
            className="fill-amber-500 text-amber-500 sm:w-4 sm:h-4"
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star size={14} className="text-gray-300 sm:w-4 sm:h-4" />
            <div className="absolute top-0 left-0 overflow-hidden w-1/2">
              <Star size={14} className="fill-amber-500 text-amber-500 sm:w-4 sm:h-4" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} size={14} className="text-gray-300 sm:w-4 sm:h-4" />
        );
      }
    }
    return stars;
  };

  return (
    <div className="group bg-white p-1 rounded-xl shadow-sm hover:shadow-lg transition relative flex flex-col h-full">
      {/* IMAGE CONTAINER */}

      <div className="relative mb-4 sm:mb-6 rounded-lg overflow-hidden bg-gray-50 grow flex items-center justify-center min-h-50 sm:min-h-55 md:min-h-60 lg:min-h-65">
        {slug ? (
          <Link
            href={`/shop/${slug}`}
            className="w-full h-full flex items-center justify-center sm:p-4"
          >
            <div className="relative w-full h-full">
              <Image
                src={photo || "/images/placeholder.png"}
                alt={name}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-300"
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
      <div className="flex flex-col grow p-3">
        <Image
          className="absolute w-12 top-4 left-2"
          width={200}
          height={200}
          src="/images/navbarLogo.png"
          alt=""
        />
        <h2 className="font-bold text-base sm:text-lg text-gray-800 mb-1 line-clamp-1">
          {slug ? (
            <Link
              href={`/shop/${slug}`}
              className="hover:text-amber-900 transition-colors"
            >
              {name}
            </Link>
          ) : (
            name
          )}
        </h2>

        <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2 grow">
          {description}
        </p>

        <div className="flex flex-row justify-between items-center mb-1">
          {/* RATING STARS */}
          <div className="flex items-center gap-1 ">
            {renderStars()}
            <span className="text-xs sm:text-sm text-gray-600 ml-1">
              ({rating.toFixed(1)})
            </span>
          </div>
          <div><h3 className="text-sm text-red-600 font-bold">{stock} left</h3></div>
        </div>

        {/* PRICE + WISHLIST + CART */}
        <div className="flex justify-between items-center mt-auto pt-3">
          <span className="font-bold text-lg sm:text-xl text-gray-900">
            {formatPrice(amount)}
          </span>

          <div className="flex items-center gap-2">
            {/* WISHLIST BUTTON */}
            <button
              onClick={handleWishlist}
              disabled={isWishlisted || wishlistLoading}
              className={`p-1.5 sm:p-2 rounded-full transition-all flex items-center justify-center ${
                isWishlisted 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-amber-900 hover:bg-amber-800"
              } ${isHeartAnimating ? "scale-125" : ""}`}
              aria-label={isWishlisted ? "Already in wishlist" : "Add to wishlist"}
            >
              <Heart
                size={16}
                className={`sm:w-5 sm:h-5 transition-all ${isWishlisted ? "fill-[#e74c3c] text-[#e74c3c]" : "fill-none text-[#e7d0b0]"}`}
                strokeWidth={isWishlisted ? 0 : 2}
              />
            </button>

            {/* CART BUTTON/CONTROLS */}
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

                <span className="min-w-4 sm:min-w-5 text-center font-bold text-sm sm:text-base">
                  {qty}
                </span>

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
                <ShoppingCart color="#e7d0b0" fill="#e7d0b0" size={16} className="sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { ShoppingCart, Minus, Plus, Heart, Star } from "lucide-react";
// import { useCart } from "@/app/context/CartContext";

// interface ProductCardProps {
//   id: string;
//   photo: string;
//   name: string;
//   description: string;
//   amount: number;
//   stock?: number;
//   slug?: string;
//   rating?: number;
// }

// export default function ProductCard({
//   id,
//   photo,
//   name,
//   description,
//   amount,
//   stock = 50,
//   slug,
//   rating = 4.5,
// }: ProductCardProps) {
//   const { cartItems, addToCart, updateQty, removeFromCart } = useCart();
//   const [isAnimating, setIsAnimating] = useState(false);
//   const [isWishlisted, setIsWishlisted] = useState(false);
//   const [isHeartAnimating, setIsHeartAnimating] = useState(false);

//   // Find the cart item by product ID
//   const cartItem = cartItems.find((item) => item.id === id);
//   const qty = cartItem?.qty || 0;

//   // Calculate remaining stock
//   const remainingStock = Math.max(0, (stock || 0) - qty);
//   const isInCart = qty > 0;
//   const isOutOfStock = remainingStock === 0;

//   /* ---------- ADD ---------- */
//   const handleAdd = async () => {
//     if (isOutOfStock) return;

//     await addToCart({
//       cartId: "",
//       id,
//       name,
//       price: amount,
//       image: photo,
//       stock,
//       slug,
//     });

//     animate();
//   };

//   /* ---------- INCREASE ---------- */
//   const handleIncrease = async () => {
//     if (isOutOfStock || !cartItem) return;

//     await updateQty(id, 1);
//     animate();
//   };

//   /* ---------- DECREASE ---------- */
//   const handleDecrease = async () => {
//     if (!cartItem || qty === 0) return;

//     if (qty === 1) {
//       // Remove item completely
//       await removeFromCart(id);
//     } else {
//       // Decrease quantity
//       await updateQty(id, -1);
//     }

//     animate();
//   };

//   /* ---------- WISHLIST ---------- */
//   const handleWishlist = () => {
//     setIsWishlisted(!isWishlisted);
//     setIsHeartAnimating(true);
//     setTimeout(() => setIsHeartAnimating(false), 300);
//   };

//   const animate = () => {
//     setIsAnimating(true);
//     setTimeout(() => setIsAnimating(false), 300);
//   };

//   const formatPrice = (price: number) =>
//     new Intl.NumberFormat("en-AU", {
//       style: "currency",
//       currency: "AUD",
//     }).format(price);

//   /* ---------- RENDER STARS ---------- */
//   const renderStars = () => {
//     const stars = [];
//     const fullStars = Math.floor(rating);
//     const hasHalfStar = rating % 1 >= 0.5;

//     for (let i = 0; i < 5; i++) {
//       if (i < fullStars) {
//         stars.push(
//           <Star
//             key={i}
//             size={14}
//             className="fill-amber-500 text-amber-500 sm:w-4 sm:h-4"
//           />
//         );
//       } else if (i === fullStars && hasHalfStar) {
//         stars.push(
//           <div key={i} className="relative">
//             <Star size={14} className="text-gray-300 sm:w-4 sm:h-4" />
//             <div className="absolute top-0 left-0 overflow-hidden w-1/2">
//               <Star size={14} className="fill-amber-500 text-amber-500 sm:w-4 sm:h-4" />
//             </div>
//           </div>
//         );
//       } else {
//         stars.push(
//           <Star key={i} size={14} className="text-gray-300 sm:w-4 sm:h-4" />
//         );
//       }
//     }
//     return stars;
//   };

//   return (
//     <div className="group bg-white p-1 rounded-xl shadow-sm hover:shadow-lg transition relative flex flex-col h-full">
//       {/* IMAGE CONTAINER */}

//       <div className="relative mb-4 sm:mb-6 rounded-lg overflow-hidden bg-gray-50 grow flex items-center justify-center min-h-50 sm:min-h-55 md:min-h-60 lg:min-h-65">
//         {slug ? (
//           <Link
//             href={`/shop/${slug}`}
//             className="w-full h-full flex items-center justify-center sm:p-4"
//           >
//             <div className="relative w-full h-full">
//               <Image
//                 src={photo || "/images/placeholder.png"}
//                 alt={name}
//                 fill
//                 className="object-contain group-hover:scale-105 transition-transform duration-300"
//                 sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
//               />
//             </div>
//           </Link>
//         ) : (
//           <div className="relative w-full h-full">
//             <Image
//               src={photo || "/images/placeholder.png"}
//               alt={name}
//               fill
//               className="object-contain p-1 sm:p-2 group-hover:scale-105 transition-transform duration-300"
//               sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
//             />
//           </div>
//         )}
//       </div>

//       {/* INFO SECTION */}
//       <div className="flex flex-col grow p-3">
//         <Image
//           className="absolute w-12 top-4 left-2"
//           width={200}
//           height={200}
//           src="/images/navbarLogo.png"
//           alt=""
//         />
//         <h2 className="font-bold text-base sm:text-lg text-gray-800 mb-1 line-clamp-1">
//           {slug ? (
//             <Link
//               href={`/shop/${slug}`}
//               className="hover:text-amber-900 transition-colors"
//             >
//               {name}
//             </Link>
//           ) : (
//             name
//           )}
//         </h2>

//         <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2 grow">
//           {description}
//         </p>
// <div className="flex flex-row justify-between items-center mb-1">
//            {/* RATING STARS */}
//            <div className="flex items-center gap-1 ">
//              {renderStars()}
//              <span className="text-xs sm:text-sm text-gray-600 ml-1">
//                ({rating.toFixed(1)})
//              </span>
//            </div>
//            <div>8 left</div>
//          </div>
//         {/* PRICE + WISHLIST + CART */}
//         <div className="flex justify-between items-center mt-auto pt-3">
//           <span className="font-bold text-lg sm:text-xl text-gray-900">
//             {formatPrice(amount)}
//           </span>

//           <div className="flex items-center gap-2">
//             {/* WISHLIST BUTTON */}
//             <button
//               onClick={handleWishlist}
//               className={`p-1.5 sm:p-2 rounded-full transition-all flex items-center justify-center ${
//                 isWishlisted
//                   ? "bg-amber-900 hover:bg-amber-800"
//                   : "bg-amber-900 hover:bg-amber-800"
//               } ${isHeartAnimating ? "scale-125" : ""}`}
//               aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
//             >
//               <Heart
//                 size={16}
//                 className={`sm:w-5 sm:h-5 transition-all ${
//                   isWishlisted ? "fill-[#e7d0b0] text-[#e7d0b0]" : "text-[#e7d0b0]"
//                 }`}
//               />
//             </button>

//             {/* CART BUTTON/CONTROLS */}
//             {isInCart ? (
//               <div
//                 className={`flex items-center gap-1 sm:gap-2 bg-amber-900 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-full transition-all ${
//                   isAnimating ? "scale-105" : ""
//                 }`}
//               >
//                 <button
//                   onClick={handleDecrease}
//                   className="p-1 hover:bg-amber-800 rounded-full transition-colors"
//                   aria-label="Decrease quantity"
//                 >
//                   <Minus size={14} className="sm:w-4 sm:h-4" />
//                 </button>

//                 <span className="min-w-4 sm:min-w-5 text-center font-bold text-sm sm:text-base">
//                   {qty}
//                 </span>

//                 <button
//                   onClick={handleIncrease}
//                   disabled={isOutOfStock}
//                   className="p-1 hover:bg-amber-800 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                   aria-label="Increase quantity"
//                 >
//                   <Plus size={14} className="sm:w-4 sm:h-4" />
//                 </button>
//               </div>
//             ) : (
//               <button
//                 onClick={handleAdd}
//                 disabled={isOutOfStock}
//                 className={`p-1.5 sm:p-2 rounded-full transition-all flex items-center justify-center ${
//                   isOutOfStock
//                     ? "bg-gray-400 cursor-not-allowed"
//                     : "bg-amber-900 text-white hover:bg-amber-800 active:scale-95"
//                 }`}
//                 aria-label={isOutOfStock ? "Out of stock" : "Add to cart"}
//               >
//                 <ShoppingCart color="#e7d0b0" fill="#e7d0b0" size={16} className="sm:w-5 sm:h-5" />
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { ShoppingCart, Minus, Plus, Heart, Star } from "lucide-react";
// import { useCart } from "@/app/context/CartContext";

// interface ProductCardProps {
//   id: string;
//   photo: string;
//   name: string;
//   description: string;
//   amount: number;
//   stock?: number;
//   slug?: string;
//   rating?: number;
// }

// const baseURL =
//   process.env.NEXT_PUBLIC_API_BASE_URL || "https://alpa-be-1.onrender.com";

// export default function ProductCard({
//   id,
//   photo,
//   name,
//   description,
//   amount,
//   stock = 50,
//   slug,
//   rating = 4.5,
// }: ProductCardProps) {
//   const { cartItems, addToCart, updateQty, removeFromCart } = useCart();
//   const [isAnimating, setIsAnimating] = useState(false);
//   const [isWishlisted, setIsWishlisted] = useState(false);
//   const [isHeartAnimating, setIsHeartAnimating] = useState(false);
//   const [wishlistLoading, setWishlistLoading] = useState(false);

//   // Find the cart item by product ID
//   const cartItem = cartItems.find((item) => item.id === id);
//   const qty = cartItem?.qty || 0;

//   // Calculate remaining stock
//   const remainingStock = Math.max(0, (stock || 0) - qty);
//   const isInCart = qty > 0;
//   const isOutOfStock = remainingStock === 0;

//   /* ---------- ADD ---------- */
//   const handleAdd = async () => {
//     if (isOutOfStock) return;

//     await addToCart({
//       cartId: "",
//       id,
//       name,
//       price: amount,
//       image: photo,
//       stock,
//       slug,
//     });

//     animate();
//   };

//   /* ---------- INCREASE ---------- */
//   const handleIncrease = async () => {
//     if (isOutOfStock || !cartItem) return;

//     await updateQty(id, 1);
//     animate();
//   };

//   /* ---------- DECREASE ---------- */
//   const handleDecrease = async () => {
//     if (!cartItem || qty === 0) return;

//     if (qty === 1) {
//       // Remove item completely
//       await removeFromCart(id);
//     } else {
//       // Decrease quantity
//       await updateQty(id, -1);
//     }

//     animate();
//   };

//   /* ---------- WISHLIST ---------- */
//   const handleWishlist = async () => {
//     setWishlistLoading(true);
//     try {
//       const res = await fetch(`${baseURL}/api/wishlist/toggle/${id}`, {
//         method: "PUT",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//       if (res.ok) {
//         setIsWishlisted((prev) => !prev);
//       } else {
//         // Optionally handle error
//       }
//     } catch (err) {
//       // Optionally handle error
//     } finally {
//       setIsHeartAnimating(true);
//       setTimeout(() => setIsHeartAnimating(false), 300);
//       setWishlistLoading(false);
//     }
//   };

//   const animate = () => {
//     setIsAnimating(true);
//     setTimeout(() => setIsAnimating(false), 300);
//   };

//   const formatPrice = (price: number) =>
//     new Intl.NumberFormat("en-AU", {
//       style: "currency",
//       currency: "AUD",
//     }).format(price);

//   /* ---------- RENDER STARS ---------- */
//   const renderStars = () => {
//     const stars = [];
//     const fullStars = Math.floor(rating);
//     const hasHalfStar = rating % 1 >= 0.5;

//     for (let i = 0; i < 5; i++) {
//       if (i < fullStars) {
//         stars.push(
//           <Star
//             key={i}
//             size={14}
//             className="fill-amber-500 text-amber-500 sm:w-4 sm:h-4"
//           />,
//         );
//       } else if (i === fullStars && hasHalfStar) {
//         stars.push(
//           <div key={i} className="relative">
//             <Star size={14} className="text-gray-300 sm:w-4 sm:h-4" />
//             <div className="absolute top-0 left-0 overflow-hidden w-1/2">
//               <Star
//                 size={14}
//                 className="fill-amber-500 text-amber-500 sm:w-4 sm:h-4"
//               />
//             </div>
//           </div>,
//         );
//       } else {
//         stars.push(
//           <Star key={i} size={14} className="text-gray-300 sm:w-4 sm:h-4" />,
//         );
//       }
//     }
//     return stars;
//   };

//   return (
//     <div className="group bg-white p-1 rounded-xl shadow-sm hover:shadow-lg transition relative flex flex-col h-full">
//       {/* IMAGE CONTAINER */}

//       <div className="relative mb-4 sm:mb-6 rounded-lg overflow-hidden bg-gray-50 grow flex items-center justify-center min-h-50 sm:min-h-55 md:min-h-60 lg:min-h-65">
//         {slug ? (
//           <Link
//             href={`/shop/${slug}`}
//             className="w-full h-full flex items-center justify-center sm:p-4"
//           >
//             <div className="relative w-full h-full">
//               <Image
//                 src={photo || "/images/placeholder.png"}
//                 alt={name}
//                 fill
//                 className="object-contain group-hover:scale-105 transition-transform duration-300"
//                 sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
//               />
//             </div>
//           </Link>
//         ) : (
//           <div className="relative w-full h-full">
//             <Image
//               src={photo || "/images/placeholder.png"}
//               alt={name}
//               fill
//               className="object-contain p-1 sm:p-2 group-hover:scale-105 transition-transform duration-300"
//               sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
//             />
//           </div>
//         )}
//       </div>

//       {/* INFO SECTION */}
//       <div className="flex flex-col grow p-3">
//         <Image
//           className="absolute w-12 top-4 left-2"
//           width={200}
//           height={200}
//           src="/images/navbarLogo.png"
//           alt=""
//         />
//         <h2 className="font-bold text-base sm:text-lg text-gray-800 mb-1 line-clamp-1">
//           {slug ? (
//             <Link
//               href={`/shop/${slug}`}
//               className="hover:text-amber-900 transition-colors"
//             >
//               {name}
//             </Link>
//           ) : (
//             name
//           )}
//         </h2>

//         <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2 grow">
//           {description}
//         </p>

//         <div className="flex flex-row justify-between items-center mb-1">
//           {/* RATING STARS */}
//           <div className="flex items-center gap-1 ">
//             {renderStars()}
//             <span className="text-xs sm:text-sm text-gray-600 ml-1">
//               ({rating.toFixed(1)})
//             </span>
//           </div>
//           <div>8 left</div>
//         </div>
//         {/* PRICE + WISHLIST + CART */}
//         <div className="flex justify-between items-center mt-auto pt-3">
//           <span className="font-bold text-lg sm:text-xl text-gray-900">
//             {formatPrice(amount)}
//           </span>

//           <div className="flex items-center gap-2">
//             {/* WISHLIST BUTTON */}
//             <button
//               onClick={handleWishlist}
//               className={`p-1.5 sm:p-2 rounded-full transition-all flex items-center justify-center ${
//                 isWishlisted
//                   ? "bg-amber-900 hover:bg-amber-800"
//                   : "bg-amber-900 hover:bg-amber-800"
//               } ${isHeartAnimating ? "scale-125" : ""}`}
//               aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
//             >
//               <Heart
//                 size={16}
//                 className={`sm:w-5 sm:h-5 transition-all ${
//                   isWishlisted ? "fill-[#e7d0b0] text-[#e7d0b0]" : "text-[#e7d0b0]"
//                 }`}
//               />
//             </button>

//             {/* CART BUTTON/CONTROLS */}
//             {isInCart ? (
//               <div
//                 className={`flex items-center gap-1 sm:gap-2 bg-amber-900 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-full transition-all ${
//                   isAnimating ? "scale-105" : ""
//                 }`}
//               >
//                 <button
//                   onClick={handleDecrease}
//                   className="p-1 hover:bg-amber-800 rounded-full transition-colors"
//                   aria-label="Decrease quantity"
//                 >
//                   <Minus size={14} className="sm:w-4 sm:h-4" />
//                 </button>

//                 <span className="min-w-4 sm:min-w-5 text-center font-bold text-sm sm:text-base">
//                   {qty}
//                 </span>

//                 <button
//                   onClick={handleIncrease}
//                   disabled={isOutOfStock}
//                   className="p-1 hover:bg-amber-800 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                   aria-label="Increase quantity"
//                 >
//                   <Plus size={14} className="sm:w-4 sm:h-4" />
//                 </button>
//               </div>
//             ) : (
//               <button
//                 onClick={handleAdd}
//                 disabled={isOutOfStock}
//                 className={`p-1.5 sm:p-2 rounded-full transition-all flex items-center justify-center ${
//                   isOutOfStock
//                     ? "bg-gray-400 cursor-not-allowed"
//                     : "bg-amber-900 text-white hover:bg-amber-800 active:scale-95"
//                 }`}
//                 aria-label={isOutOfStock ? "Out of stock" : "Add to cart"}
//               >
//                 <ShoppingCart color="#e7d0b0" fill="#e7d0b0" size={16} className="sm:w-5 sm:h-5" />
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
