
// "use client";
// import React, { useState, useEffect } from "react";
// import Image from "next/image";
// import { useParams, useRouter, useSearchParams } from "next/navigation";
// import {
//   ShoppingCart,
//   Heart,
//   Star,
//   Truck,
//   RotateCcw,
//   Shield,
//   Minus,
//   Plus,
//   Share2,
//   Check,
//   Loader2,
// } from "lucide-react";
// import { apiClient } from "@/lib/api";
// import { useSharedEnhancedCart } from "@/hooks/useSharedEnhancedCart";
// import { useToggleWishlist } from "@/hooks/useWishlistMutations";
// import { useWishlistCheck } from "@/hooks/useWishlist";
// import { useSingleProduct } from "@/hooks/useSingleProduct";

// interface Product {
//   id: string;
//   title: string;
//   description: string;
//   price: string;
//   images: string[];
//   featuredImage?: string;
//   galleryImages?: string[];
//   stock: number;
//   category?: string;
//   brand?: string;
//   sellerName?: string;
//   artistName?: string;
//   rating?: number;
//   reviews?: number;
//   discount?: number | boolean;
//   tags?: string[];
//   featured?: boolean;
//   seller?: {
//     id: string;
//     name: string;
//     email: string;
//   };
// }

// const baseURL =
//   process.env.NEXT_PUBLIC_API_BASE_URL || "https://alpa-be-1.onrender.com";


// export default function ShopSlugPage() {
//   const params = useParams();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const id = params?.slug as string; // Using 'slug' param name but it's actually the ID now

//   // Use React Query hook for single product data
//   const { data: product, isLoading: loading, error: queryError } = useSingleProduct(id);
//   const error = queryError?.message || null;

//   const [selectedImage, setSelectedImage] = useState(0);
//   const [addedToCart, setAddedToCart] = useState(false);
//   const [ratingScore, setRatingScore] = useState(0);
//   const [review, setReview] = useState("");
//   const [isSubmittingRating, setIsSubmittingRating] = useState(false);
//   const [ratingMessage, setRatingMessage] = useState("");
//   const [ratings, setRatings] = useState<any[]>([]);
//   const [ratingsLoading, setRatingsLoading] = useState(true);
//   const [ratingsError, setRatingsError] = useState<string | null>(null);

//   // Use shared enhanced cart
//   const { addToCart, cartData, loading: cartLoading } = useSharedEnhancedCart();
//   const { data: wishlistData } = useWishlistCheck(product?.id || "");
//   const toggleWishlistMutation = useToggleWishlist();
//   const [isWishlisted, setIsWishlisted] = useState(false);
//   const [isAddingToCart, setIsAddingToCart] = useState(false);

//   // Fetch all ratings for this product
//   useEffect(() => {
//     const fetchRatings = async () => {
//       if (!id) return;
//       try {
//         setRatingsLoading(true);
//         setRatingsError(null);
//         const response = await apiClient.get<any>(
//           `/ratings/products/${id}/ratings`
//         );
//         if (response && Array.isArray(response.ratings)) {
//           setRatings(response.ratings);
//         } else if (response && response.data && Array.isArray(response.data.ratings)) {
//           setRatings(response.data.ratings);
//         } else {
//           setRatings([]);
//         }
//       } catch (err) {
//         setRatingsError(
//           err instanceof Error ? err.message : "Failed to fetch ratings"
//         );
//         setRatings([]);
//       } finally {
//         setRatingsLoading(false);
//       }
//     };
//     fetchRatings();
//   }, [id]);

//   // Update wishlisted state
//   useEffect(() => {
//     setIsWishlisted(wishlistData?.inWishlist || false);
//   }, [wishlistData]);

//   // Navigation helpers
//   const handleBackToShop = () => {
//     const search = searchParams.get('search');
//     const filters = searchParams.get('filters');
//     const tab = searchParams.get('tab');
    
//     const queryParams = new URLSearchParams();
//     if (search) queryParams.set('search', search);
//     if (filters) queryParams.set('filters', filters);
//     if (tab) queryParams.set('tab', tab);
    
//     const queryString = queryParams.toString();
//     router.push(queryString ? `/shop?${queryString}` : '/shop');
//   };

//   // Check if item is in cart
//   const cartItem = cartData?.cart.find(item => item.productId === product?.id);
//   const currentQtyInCart = cartItem?.quantity || 0;
  
//   const remainingStock = Math.max(
//     0,
//     (product?.stock || 0) - currentQtyInCart,
//   );
//   const isOutOfStock = remainingStock === 0;

//   const handleAddToCart = async () => {
//     if (!product || isOutOfStock || isAddingToCart) return;

//     try {
//       setIsAddingToCart(true);
//       await addToCart(product.id, {
//         title: product.title,
//         price: product.price,
//         images: product.featuredImage
//           ? [product.featuredImage]
//           : product.images,
//       });

//       setAddedToCart(true);
      
//       // Dispatch event to open mini cart
//       window.dispatchEvent(new CustomEvent("open-cart"));
      
//       setTimeout(() => setAddedToCart(false), 2000);
//     } catch (err) {
//       console.error("Error adding to cart:", err);
//     } finally {
//       setIsAddingToCart(false);
//     }
//   };

//   const handleWishlist = () => {
//     setIsWishlisted(!isWishlisted);
//     // Use debounced mutation for better performance
//     toggleWishlistMutation.debouncedMutate({
//       productId: product?.id || "",
//       isCurrentlyWishlisted: isWishlisted,
//     });
//   };

//   // Removed quantity handlers since we removed quantity selection

//   const handleSubmitRating = async () => {
//     if (!product || ratingScore === 0 || review.trim() === "") {
//       setRatingMessage("Please provide both a rating and review");
//       return;
//     }

//     try {
//       setIsSubmittingRating(true);
//       const response = await apiClient.post(
//         `/ratings/products/${product.id}/rate`,
//         {
//           rating: ratingScore,
//           review: review,
//         }
//       );

//       if (response) {
//         setRatingMessage("Thank you! Your rating has been submitted successfully.");
//         setRatingScore(0);
//         setReview("");
//         setTimeout(() => setRatingMessage(""), 3000);
//       }
//     } catch (err) {
//       setRatingMessage(
//         err instanceof Error ? err.message : "Failed to submit rating"
//       );
//     } finally {
//       setIsSubmittingRating(false);
//     }
//   };

//   // Skeleton Loading Component
//   const SkeletonLoader = () => (
//     <div className="min-h-screen bg-[#ebe3d5] py-8 pt-36">
//       <div className="container mx-auto px-4 max-w-7xl">
//         {/* Breadcrumb Skeleton */}
//         <div className="mb-6">
//           <div className="h-4 bg-amber-200 rounded w-64 animate-pulse"></div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
//           {/* Image Section Skeleton */}
//           <div className="space-y-4">
//             <div className="relative aspect-square w-full bg-amber-100 rounded-2xl overflow-hidden animate-pulse"></div>

//             {/* Thumbnail Gallery Skeleton */}
//             <div className="flex gap-3">
//               {[...Array(4)].map((_, idx) => (
//                 <div
//                   key={idx}
//                   className="w-20 h-20 bg-amber-100 rounded-lg animate-pulse"
//                 ></div>
//               ))}
//             </div>
//           </div>

//           {/* Details Section Skeleton */}
//           <div className="space-y-6">
//             {/* Header Skeleton */}
//             <div className="space-y-3">
//               <div className="h-8 bg-amber-200 rounded w-3/4 animate-pulse"></div>
//               <div className="h-6 bg-amber-100 rounded w-32 animate-pulse"></div>
//             </div>

//             {/* Rating Skeleton */}
//             <div className="flex items-center gap-2">
//               {[...Array(5)].map((_, i) => (
//                 <div
//                   key={i}
//                   className="w-5 h-5 bg-amber-200 rounded animate-pulse"
//                 ></div>
//               ))}
//               <div className="h-4 bg-amber-200 rounded w-24 ml-2 animate-pulse"></div>
//             </div>

//             {/* Price Skeleton */}
//             <div className="h-10 bg-amber-200 rounded w-40 animate-pulse"></div>

//             {/* Stock Status Skeleton */}
//             <div className="h-6 bg-green-100 rounded w-24 animate-pulse"></div>

//             {/* Description Skeleton */}
//             <div className="space-y-2">
//               <div className="h-4 bg-amber-100 rounded w-full animate-pulse"></div>
//               <div className="h-4 bg-amber-100 rounded w-5/6 animate-pulse"></div>
//               <div className="h-4 bg-amber-100 rounded w-4/6 animate-pulse"></div>
//             </div>

//             {/* Category Skeleton */}
//             <div className="h-6 bg-amber-100 rounded w-48 animate-pulse"></div>

//             {/* Quantity Skeleton */}
//             <div className="h-12 bg-amber-100 rounded w-48 animate-pulse"></div>

//             {/* Action Buttons Skeleton */}
//             <div className="flex gap-3">
//               <div className="h-12 bg-amber-200 rounded-lg flex-1 animate-pulse"></div>
//               <div className="h-12 w-12 bg-amber-200 rounded-lg animate-pulse"></div>
//               <div className="h-12 w-12 bg-amber-200 rounded-lg animate-pulse"></div>
//             </div>

//             {/* Divider */}
//             <div className="h-px bg-amber-200 animate-pulse"></div>

//             {/* Benefits Skeleton */}
//             <div className="space-y-4">
//               {[...Array(3)].map((_, idx) => (
//                 <div key={idx} className="flex items-start gap-3">
//                   <div className="w-10 h-10 bg-amber-200 rounded-lg animate-pulse"></div>
//                   <div className="flex-1 space-y-2">
//                     <div className="h-5 bg-amber-200 rounded w-32 animate-pulse"></div>
//                     <div className="h-4 bg-amber-100 rounded w-48 animate-pulse"></div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   if (loading) {
//     return <SkeletonLoader />;
//   }

//   if (error || !product) {
//     return (
//       <div className="min-h-screen bg-linear-to-b from-amber-50 to-white flex items-center justify-center">
//         <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-amber-200">
//           <p className="text-xl font-semibold text-amber-900 mb-2">
//             {error || "Product not found"}
//           </p>
//           <p className="text-amber-700">
//             Please check the URL and try again.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   const discountPercentage = typeof product.discount === "number" ? product.discount : 0;
//   const originalPrice =
//     parseFloat(product.price) / (1 - discountPercentage / 100);

//   return (
//     <div className="min-h-screen bg-[#ebe3d5] py-8 pt-36">
//       <div className="container mx-auto px-4 max-w-7xl">
//         {/* Breadcrumb with Navigation */}
//         <div className="flex justify-between items-center mb-6">
//           <nav className="text-sm text-amber-700">
//             <span 
//               className="hover:text-amber-900 cursor-pointer transition"
//               onClick={() => router.push('/')}
//             >
//               Home
//             </span>
//             <span className="mx-2">/</span>
//             <span 
//               className="hover:text-amber-900 cursor-pointer transition"
//               onClick={handleBackToShop}
//             >
//               Shop
//             </span>
//             <span className="mx-2">/</span>
//             <span className="font-medium text-amber-900">{product.title}</span>
//           </nav>

//           {/* Navigation Buttons */}
//           <div className="flex gap-2">
//             <button
//               onClick={handleBackToShop}
//               className="px-4 py-2 text-sm font-medium text-amber-700 hover:text-amber-900 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors"
//             >
//               ← Back to Shop
//             </button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
//           {/* Image Section - Now on LEFT */}
//           <div className="space-y-4">
//             {/* Main / Featured Image */}
//             <div className="relative aspect-square w-full bg-white rounded-2xl overflow-hidden shadow-lg border border-amber-200">
//               {(() => {
//                 const allImages: string[] = [
//                   ...(product.featuredImage ? [product.featuredImage] : []),
//                   ...(product.galleryImages?.filter(
//                     (img) => img !== product.featuredImage
//                   ) ?? []),
//                   ...(product.images?.filter(
//                     (img) =>
//                       img !== product.featuredImage &&
//                       !(product.galleryImages ?? []).includes(img)
//                   ) ?? []),
//                 ];
//                 return allImages.length > 0 ? (
//                   <Image
//                     src={allImages[selectedImage] ?? allImages[0]}
//                     alt={product.title}
//                     fill
//                     className="object-cover"
//                     priority
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center bg-amber-50">
//                     <p className="text-amber-600">No image available</p>
//                   </div>
//                 );
//               })()}

//               {discountPercentage > 0 && (
//                 <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
//                   -{discountPercentage}%
//                 </div>
//               )}

//               {product.featured && (
//                 <div className="absolute top-4 left-4 bg-linear-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md flex items-center gap-1">
//                   ⭐ Featured
//                 </div>
//               )}
//             </div>

//             {/* Gallery Thumbnails */}
//             {(() => {
//               const allImages: string[] = [
//                 ...(product.featuredImage ? [product.featuredImage] : []),
//                 ...(product.galleryImages?.filter(
//                   (img) => img !== product.featuredImage
//                 ) ?? []),
//                 ...(product.images?.filter(
//                   (img) =>
//                     img !== product.featuredImage &&
//                     !(product.galleryImages ?? []).includes(img)
//                 ) ?? []),
//               ];
//               return allImages.length > 1 ? (
//                 <div className="space-y-2">
//                   {product.galleryImages && product.galleryImages.length > 0 && (
//                     <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">
//                       Gallery
//                     </p>
//                   )}
//                   <div className="flex gap-3 overflow-x-auto pb-2">
//                     {allImages.map((image, idx) => (
//                       <button
//                         key={idx}
//                         onClick={() => setSelectedImage(idx)}
//                         className={`relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
//                           selectedImage === idx
//                             ? "border-amber-600 shadow-md ring-2 ring-amber-300"
//                             : "border-amber-300 hover:border-amber-500"
//                         }`}
//                         title={idx === 0 ? "Featured Image" : `Gallery Image ${idx}`}
//                       >
//                         <Image
//                           src={image}
//                           alt={`${product.title} - ${idx === 0 ? "Featured" : `Gallery ${idx}`}`}
//                           fill
//                           className="object-cover"
//                         />
//                         {idx === 0 && (
//                           <span className="absolute bottom-0 left-0 right-0 bg-amber-600/80 text-white text-[9px] text-center py-0.5 font-semibold">
//                             Main
//                           </span>
//                         )}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               ) : null;
//             })()}
//           </div>

//           {/* Details Section - Now on RIGHT */}
//           <div className="space-y-6">
//             {/* Header */}
//             <div>
//               <h1 className="text-3xl lg:text-4xl font-bold text-amber-900 mb-2">
//                 {product.title}
//               </h1>
              
//               {/* Artist Name */}
//               {product.artistName && (
//                 <div className="mb-2 flex flox-row items-center gap-3">
//                   <p className="text-sm text-gray-600">Artist Name:</p>
//                   <h2 className="text-lg font-semibold text-[#441208]">
//                     {product.artistName}
//                   </h2>
//                 </div>
//               )}
              
//               {product.brand && (
//                 <p className="text-amber-700 font-medium bg-amber-100 inline-block px-3 py-1 rounded-full text-sm">
//                   {product.brand}
//                 </p>
//               )}
//             </div>

//             {/* Rating */}
//             <div className="flex items-center gap-2">
//               {[...Array(5)].map((_, i) => (
//                 <Star
//                   key={i}
//                   className={`w-5 h-5 ${
//                     i < Math.floor(product.rating || 4)
//                       ? "fill-amber-500 text-amber-500"
//                       : "text-amber-300"
//                   }`}
//                 />
//               ))}
//               <span className="text-amber-700 text-sm ml-2">
//                 ({product.reviews || 0} reviews)
//               </span>
//             </div>

//             {/* Price */}
//             <div className="flex items-baseline gap-3">
//               <span className="text-4xl font-bold text-amber-900">
//                 ${product.price}
//               </span>
//               {discountPercentage > 0 && (
//                 <span className="text-xl text-amber-600 line-through">
//                   ${originalPrice.toFixed(2)}
//                 </span>
//               )}
//             </div>

//             {/* Tags */}
//             {product.tags && product.tags.length > 0 && (
//               <div>
//                 {/* <h3 className="text-lg font-semibold text-amber-900 mb-2">Tags:</h3> */}
//                 <div className="flex flex-wrap gap-2">
//                   {product.tags.map((tag, index) => (
//                     <span
//                       key={index}
//                       className="bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded-full font-medium border border-amber-200"
//                     >
//                       {tag}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Stock Status */}
//             <div className="flex items-center gap-2">
//               {product.stock > 0 ? (
//                 <>
//                   <Check className="w-5 h-5 text-green-600" />
//                   <span className="text-green-700 font-medium">
//                     In Stock ({product.stock} available)
//                   </span>
//                 </>
//               ) : (
//                 <>
//                   <span className="w-5 h-5 text-red-600">✕</span>
//                   <span className="text-red-700 font-medium">Out of Stock</span>
//                 </>
//               )}
//             </div>

//             {/* Description */}
//             <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
//               <h3 className="font-semibold text-amber-900 mb-2">
//                 Description
//               </h3>
//               <p className="text-amber-800 leading-relaxed">
//                 {product.description}
//               </p>
//             </div>

//             {/* Category */}
//             {product.category && (
//               <div className="text-amber-800">
//                 <span className="font-semibold">Category:</span>{" "}
//                 <span className="text-amber-700 bg-amber-100 px-3 py-1 rounded-full text-sm">
//                   {product.category}
//                 </span>
//               </div>
//             )}

//             {/* Seller Information */}
//             {(product.sellerName || product.seller?.name) && (
//               <div className="">
//                 <h3 className="font-semibold text-amber-900 mb-2">
//                   Sold by
//                 </h3>
//                 <p className="text-amber-800 font-medium">
//                   {product.seller?.name || product.sellerName}
//                 </p>
//               </div>
//             )}

//             {/* Quantity Selector */}
//             {/* Action Buttons */}
//             <div className="flex gap-3">
//               <button
//                 onClick={handleAddToCart}
//                 disabled={isOutOfStock || isAddingToCart}
//                 className={`flex-1 py-3 px-6 rounded-lg font-semibold transition shadow-md flex items-center justify-center ${
//                   addedToCart
//                     ? "bg-green-500 text-white cursor-default"
//                     : isOutOfStock
//                       ? "bg-amber-200 text-amber-500 cursor-not-allowed"
//                       : "bg-amber-600 text-white hover:bg-amber-700 active:scale-95"
//                 }`}
//               >
//                 {isAddingToCart ? (
//                   <>
//                     <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
//                     Adding...
//                   </>
//                 ) : addedToCart ? (
//                   <>
//                     <Check className="w-5 h-5 inline mr-2" />
//                     Added to Cart
//                   </>
//                 ) : (
//                   <>
//                     <ShoppingCart className="w-5 h-5 inline mr-2" />
//                     Add to Cart
//                   </>
//                 )}
//               </button>

//               <button
//                 onClick={handleWishlist}
//                 className={`p-3 rounded-lg border-2 transition shadow-md ${
//                   isWishlisted
//                     ? "bg-red-50 border-red-400 text-red-600"
//                     : "bg-white border-amber-300 text-amber-600 hover:bg-amber-50 hover:border-amber-400"
//                 }`}
//               >
//                 <Heart
//                   className={`w-6 h-6 ${isWishlisted ? "fill-current" : ""}`}
//                 />
//               </button>

//               <button className="p-3 rounded-lg border-2 border-amber-300 text-amber-600 hover:bg-amber-50 hover:border-amber-400 transition shadow-md bg-white">
//                 <Share2 className="w-6 h-6" />
//               </button>
//             </div>

//             {/* Divider */}
//             <div className="border-t border-amber-200"></div>

//             {/* Benefits */}
//             <div className="space-y-4">
//               <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
//                 <div className="p-2 bg-amber-200 rounded-lg">
//                   <Truck className="w-6 h-6 text-amber-800" />
//                 </div>
//                 <div>
//                   <h4 className="font-semibold text-amber-900">
//                     Free Shipping
//                   </h4>
//                   <p className="text-sm text-amber-700">On orders over $100</p>
//                 </div>
//               </div>

//               <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
//                 <div className="p-2 bg-amber-200 rounded-lg">
//                   <RotateCcw className="w-6 h-6 text-amber-800" />
//                 </div>
//                 <div>
//                   <h4 className="font-semibold text-amber-900">Easy Returns</h4>
//                   <p className="text-sm text-amber-700">
//                     30-day return policy
//                   </p>
//                 </div>
//               </div>

//               <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
//                 <div className="p-2 bg-amber-200 rounded-lg">
//                   <Shield className="w-6 h-6 text-amber-800" />
//                 </div>
//                 <div>
//                   <h4 className="font-semibold text-amber-900">
//                     Secure Payment
//                   </h4>
//                   <p className="text-sm text-amber-700">
//                     100% secure checkout
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Full Width Sections Below */}
//         <div className="mt-12 space-y-8">
//           {/* Ratings & Reviews Section - Full Width */}
//           <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
//             <h3 className="font-semibold text-amber-900 mb-4 text-lg">
//               Customer Ratings & Reviews
//             </h3>
//             {ratingsLoading ? (
//               <div className="text-amber-700">Loading reviews...</div>
//             ) : ratingsError ? (
//               <div className="text-red-700">{ratingsError}</div>
//             ) : ratings.length === 0 ? (
//               <div className="text-amber-700">No reviews yet. Be the first to rate this product!</div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {ratings.map((r, idx) => (
//                   <div key={idx} className="p-4 bg-white rounded-lg border border-amber-100 shadow-sm">
//                     <div className="flex items-center gap-2 mb-2">
//                       {[1,2,3,4,5].map((star) => (
//                         <Star
//                           key={star}
//                           className={`w-4 h-4 ${star <= (r.rating || 0) ? "fill-amber-500 text-amber-500" : "text-amber-200"}`}
//                         />
//                       ))}
//                     </div>
//                     <div className="text-xs text-amber-700 font-medium mb-2">
//                       {r.user?.name || r.userName || "Anonymous"}
//                     </div>
//                     <div className="text-amber-900 text-sm mb-2">
//                       {r.comment}
//                     </div>
//                     {r.createdAt && (
//                       <div className="text-xs text-amber-400">
//                         {new Date(r.createdAt).toLocaleDateString()}
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Rating Section - Full Width */}
//           <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
//             <h3 className="font-semibold text-amber-900 mb-4 text-lg">
//               Rate This Product
//             </h3>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Star Rating */}
//               <div>
//                 <label className="block text-amber-900 font-medium mb-2">
//                   Your Rating (1-5 stars)
//                 </label>
//                 <div className="flex gap-2">
//                   {[1, 2, 3, 4, 5].map((star) => (
//                     <button
//                       key={star}
//                       onClick={() => setRatingScore(star)}
//                       className="transition-transform hover:scale-110"
//                     >
//                       <Star
//                         className={`w-8 h-8 ${
//                           star <= ratingScore
//                             ? "fill-amber-500 text-amber-500"
//                             : "text-amber-200"
//                         }`}
//                       />
//                     </button>
//                   ))}
//                 </div>
//                 {ratingScore > 0 && (
//                   <p className="text-amber-700 text-sm mt-2">
//                     You selected {ratingScore} star{ratingScore !== 1 ? "s" : ""}
//                   </p>
//                 )}
//               </div>

//               {/* Review Text */}
//               <div>
//                 <label className="block text-amber-900 font-medium mb-2">
//                   Your Review
//                 </label>
//                 <textarea
//                   value={review}
//                   onChange={(e) => setReview(e.target.value)}
//                   placeholder="Share your experience with this product..."
//                   maxLength={500}
//                   className="w-full p-3 border border-amber-300 rounded-lg bg-white text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none"
//                   rows={4}
//                 />
//                 <p className="text-amber-700 text-sm mt-1">
//                   {review.length}/500 characters
//                 </p>
//               </div>
//             </div>

//             {/* Message */}
//             {ratingMessage && (
//               <p
//                 className={`text-sm mt-4 mb-3 p-2 rounded ${
//                   ratingMessage.includes("successfully")
//                     ? "bg-green-100 text-green-700"
//                     : "bg-red-100 text-red-700"
//                 }`}
//               >
//                 {ratingMessage}
//               </p>
//             )}

//             {/* Submit Button */}
//             <button
//               onClick={handleSubmitRating}
//               disabled={isSubmittingRating || ratingScore === 0 || review.trim() === ""}
//               className="w-full md:w-auto mt-4 px-8 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
//             >
//               {isSubmittingRating ? "Submitting..." : "Submit Rating"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ShoppingCart,
  Heart,
  Star,
  Truck,
  RotateCcw,
  Shield,
  Share2,
  Check,
  Loader2,
  ArrowLeft,
  Package,
  Tag,
  User,
  Store,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useSharedEnhancedCart } from "@/hooks/useSharedEnhancedCart";
import { useToggleWishlist } from "@/hooks/useWishlistMutations";
import { useWishlistCheck } from "@/hooks/useWishlist";
import { useSingleProduct } from "@/hooks/useSingleProduct";
import { useProducts } from "@/hooks/useProducts";

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  images: string[];
  featuredImage?: string;
  galleryImages?: string[];
  stock: number;
  category?: string;
  brand?: string;
  sellerName?: string;
  artistName?: string;
  rating?: number;
  reviews?: number;
  discount?: number | boolean;
  tags?: string[];
  featured?: boolean;
  sellerId?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  sellerUserName?: string;
  seller?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function ShopSlugPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slugParam = params?.slug as string; // Title-based slug e.g. "rubber-toys"

  // Resolve slug → product ID by matching against the full products list
  const { data: allProducts, isLoading: allProductsLoading } = useProducts();
  const resolvedProductId = useMemo(() => {
    if (!allProducts || !slugParam) return undefined;
    const match = allProducts.find((p) => {
      const productSlug = p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return productSlug === slugParam;
    });
    return match?.id;
  }, [allProducts, slugParam]);

  // Use React Query hook for single product data
  const { data: product, isLoading: productLoading, error: queryError } = useSingleProduct(resolvedProductId);
  const loading = allProductsLoading || productLoading;
  const error = queryError?.message || null;

  const [addedToCart, setAddedToCart] = useState(false);
  const [ratingScore, setRatingScore] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingMessage, setRatingMessage] = useState("");
  const [ratings, setRatings] = useState<any[]>([]);
  const [ratingsLoading, setRatingsLoading] = useState(true);
  const [ratingsError, setRatingsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'write-review'>('description');

  // Modal Gallery State (Lightbox)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  // Use shared enhanced cart
  const { addToCart, cartData, loading: cartLoading } = useSharedEnhancedCart();
  const { data: wishlistData } = useWishlistCheck(product?.id || "");
  const toggleWishlistMutation = useToggleWishlist();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Build ordered image list for the main viewer.
  // Rule: featuredImage is index 0; galleryImages follow.
  // We use deduplication to ensure the same image doesn't appear twice in the thumbnails.
  const allImages = useMemo<string[]>(() => {
    if (!product) return [];

    const result: string[] = [];
    
    // 1. Prioritize featuredImage
    if (product.featuredImage && product.featuredImage.trim() !== "") {
      result.push(product.featuredImage);
    }
    
    // 2. Add gallery images, avoiding duplicates with the featured image
    if (Array.isArray(product.galleryImages)) {
      product.galleryImages.forEach(img => {
        if (img && img.trim() !== "" && !result.includes(img)) {
          result.push(img);
        }
      });
    }
    
    // 3. Last fallback: legacy images array (only if we have nothing yet)
    if (result.length === 0 && Array.isArray(product.images)) {
      product.images.forEach(img => {
        if (img && img.trim() !== "" && !result.includes(img)) {
          result.push(img);
        }
      });
    }

    return result;
  }, [product]);

  // Fetch all ratings for this product
  useEffect(() => {
    const fetchRatings = async () => {
      if (!product?.id) return;
      try {
        setRatingsLoading(true);
        setRatingsError(null);
        const response = await apiClient.get<any>(
          `/ratings/products/${product.id}/ratings`
        );
        if (response && Array.isArray(response.ratings)) {
          setRatings(response.ratings);
        } else if (response && response.data && Array.isArray(response.data.ratings)) {
          setRatings(response.data.ratings);
        } else {
          setRatings([]);
        }
      } catch (err) {
        setRatingsError(
          err instanceof Error ? err.message : "Failed to fetch ratings"
        );
        setRatings([]);
      } finally {
        setRatingsLoading(false);
      }
    };
    fetchRatings();
  }, [product?.id]);

  // Update wishlisted state
  useEffect(() => {
    setIsWishlisted(wishlistData?.inWishlist || false);
  }, [wishlistData]);

  // Modal scroll lock
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  // Navigation helpers
  const handleBackToShop = () => {
    const search = searchParams.get('search');
    const filters = searchParams.get('filters');
    const tab = searchParams.get('tab');
    
    const queryParams = new URLSearchParams();
    if (search) queryParams.set('search', search);
    if (filters) queryParams.set('filters', filters);
    if (tab) queryParams.set('tab', tab);
    
    const queryString = queryParams.toString();
    router.push(queryString ? `/shop?${queryString}` : '/shop');
  };

  // Check if item is in cart
  const cartItem = cartData?.cart.find(item => item.productId === product?.id);
  const currentQtyInCart = cartItem?.quantity || 0;
  
  const remainingStock = Math.max(
    0,
    (product?.stock || 0) - currentQtyInCart,
  );
  const isOutOfStock = remainingStock === 0;

  const handleAddToCart = async () => {
    if (!product || isOutOfStock || isAddingToCart) return;

    try {
      setIsAddingToCart(true);
      await addToCart(product.id, {
        title: product.title,
        price: product.price,
        images: product.featuredImage
          ? [product.featuredImage]
          : product.images,
      });

      setAddedToCart(true);
      
      // Dispatch event to open mini cart
      window.dispatchEvent(new CustomEvent("open-cart"));
      
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (err) {
      console.error("Error adding to cart:", err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // Use debounced mutation for better performance
    toggleWishlistMutation.debouncedMutate({
      productId: product?.id || "",
      isCurrentlyWishlisted: isWishlisted,
    });
  };

  // Removed quantity handlers since we removed quantity selection

  const handleSubmitRating = async () => {
    if (!product || ratingScore === 0 || review.trim() === "") {
      setRatingMessage("Please provide both a rating and review");
      return;
    }

    try {
      setIsSubmittingRating(true);
      const response = await apiClient.post(
        `/ratings/products/${product.id}/rate`,
        {
          rating: ratingScore,
          review: review,
        }
      );

      if (response) {
        setRatingMessage("Thank you! Your rating has been submitted successfully.");
        setRatingScore(0);
        setReview("");
        setTimeout(() => setRatingMessage(""), 3000);
      }
    } catch (err) {
      setRatingMessage(
        err instanceof Error ? err.message : "Failed to submit rating"
      );
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // ── Skeleton ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#ebe3d5] pt-36 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-4 bg-amber-200 rounded w-56 animate-pulse mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div className="aspect-square w-full rounded-3xl bg-amber-100 animate-pulse" />
              <div className="flex gap-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-20 h-20 rounded-xl bg-amber-100 animate-pulse" />
                ))}
              </div>
            </div>
            <div className="space-y-5 pt-2">
              <div className="h-9 bg-amber-200 rounded-xl w-3/4 animate-pulse" />
              <div className="h-5 bg-amber-100 rounded-lg w-1/3 animate-pulse" />
              <div className="h-10 bg-amber-200 rounded-xl w-36 animate-pulse" />
              <div className="h-4 bg-amber-100 rounded w-full animate-pulse" />
              <div className="h-4 bg-amber-100 rounded w-5/6 animate-pulse" />
              <div className="h-4 bg-amber-100 rounded w-4/6 animate-pulse" />
              <div className="flex gap-3 pt-2">
                <div className="h-14 flex-1 rounded-2xl bg-amber-200 animate-pulse" />
                <div className="h-14 w-14 rounded-2xl bg-amber-200 animate-pulse" />
                <div className="h-14 w-14 rounded-2xl bg-amber-200 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#ebe3d5] flex items-center justify-center">
        <div className="text-center p-10 bg-white rounded-3xl shadow-xl border border-amber-200 max-w-sm mx-4">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-amber-900 mb-2">
            {error || "Product not found"}
          </p>
          <p className="text-amber-600 mb-6">Please check the URL and try again.</p>
          <button
            onClick={handleBackToShop}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const mainImage = product.featuredImage || allImages[0];
  const galleryThumbnails = allImages.slice(1);

  const sellerDisplayName = product.seller?.name || product.sellerName;
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((s, r) => s + (r.rating || 0), 0) / ratings.length
      : product.rating || 0;

  const discountPercentage =
    typeof product?.discount === "number" ? product.discount : 0;

  return (
    <div className="min-h-screen bg-[#ebe3d5] pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Breadcrumb ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <nav className="flex items-center gap-1.5 text-sm">
            <span className="text-[#973c00]/70 hover:text-[#5A1E12] cursor-pointer font-medium transition" onClick={() => router.push('/')}>Home</span>
            <span className="text-[#973c00]/40">/</span>
            <span className="text-[#973c00]/70 hover:text-[#5A1E12] cursor-pointer font-medium transition" onClick={handleBackToShop}>Shop</span>
            <span className="text-[#973c00]/40">/</span>
            <span className="font-semibold text-[#3b1a08] truncate max-w-48">{product.title}</span>
          </nav>
          <button
            onClick={handleBackToShop}
            className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-[#5A1E12] hover:text-[#3b1a08] border border-[#973c00]/20 bg-white/60 hover:bg-white/90 px-4 py-2 rounded-xl transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </button>
        </div>

        {/* ── Hero Grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">

          {/* LEFT – Image Gallery */}
          <div className="space-y-5">
            <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-white shadow-lg border border-[#973c00]/10 group">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#fdf4ef] gap-3">
                  <Package className="w-12 h-12 text-[#973c00]/30" />
                  <p className="text-[#973c00]/50 text-sm">No image available</p>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.featured && (
                  <span className="inline-flex items-center gap-1 bg-[#5A1E12] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    ✦ Featured
                  </span>
                )}
                {discountPercentage > 0 && (
                  <span className="bg-[#973c00] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    -{discountPercentage}% OFF
                  </span>
                )}
              </div>

              {/* Wishlist on image */}
              <button
                onClick={handleWishlist}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all ${
                  isWishlisted ? "bg-[#5A1E12] text-white" : "bg-white/90 text-[#973c00] hover:bg-[#5A1E12]/10 hover:text-[#5A1E12]"
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Gallery Strip */}
            {galleryThumbnails.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#5A1E12] flex items-center gap-2">
                    <Maximize2 className="w-3.5 h-3.5" />
                    Gallery
                  </p>
                  <span className="text-[10px] font-semibold text-[#973c00]/50 uppercase tracking-widest">
                    {galleryThumbnails.length} {galleryThumbnails.length === 1 ? 'image' : 'images'}
                  </span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                  {galleryThumbnails.map((img, idx) => {
                    const actualIndex = allImages.indexOf(img);
                    return (
                      <button
                        key={idx}
                        onClick={() => { setModalImageIndex(actualIndex !== -1 ? actualIndex : 0); setIsModalOpen(true); }}
                        className="relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#973c00]/20 hover:border-[#5A1E12] hover:scale-105 hover:shadow-md transition-all duration-300 group/thumb"
                      >
                        <Image src={img} alt={`${product.title} gallery ${idx + 1}`} fill className="object-cover" />
                        <div className="absolute inset-0 bg-[#5A1E12]/0 group-hover/thumb:bg-[#5A1E12]/10 transition-colors" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                          <Maximize2 className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT – Product Details */}
          <div className="flex flex-col gap-5">

            {/* Category + Title */}
            <div>
              {product.category && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#973c00] bg-[#973c00]/8 border border-[#973c00]/15 px-3 py-1 rounded-full mb-3">
                  <Tag className="w-3 h-3" />
                  {product.category}
                </span>
              )}
              <h1 className="text-3xl lg:text-4xl font-extrabold text-[#3b1a08] leading-tight mt-1">{product.title}</h1>
              {product.artistName && (
                <div className="flex items-center gap-1.5 mt-2">
                  <User className="w-3.5 h-3.5 text-[#973c00]/70" />
                  <span className="text-sm text-[#973c00]/70">by </span>
                  <span className="text-sm font-semibold text-[#5A1E12]">{product.artistName}</span>
                </div>
              )}
            </div>

            {/* Rating row */}
            <div className="flex items-center gap-2.5">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? 'fill-[#973c00] text-[#973c00]' : 'text-[#973c00]/20 fill-[#973c00]/10'}`} />
                ))}
              </div>
              <span className="text-sm font-medium text-[#5A1E12]">
                {avgRating > 0 ? avgRating.toFixed(1) : 'No ratings yet'}
              </span>
              {ratings.length > 0 && (
                <button
                  onClick={() => setActiveTab('reviews')}
                  className="text-sm text-[#973c00]/60 hover:text-[#5A1E12] transition underline-offset-2 hover:underline"
                >
                  ({ratings.length} review{ratings.length !== 1 ? 's' : ''})
                </button>
              )}
            </div>

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="text-5xl font-black text-[#3b1a08] leading-none">₹{product.price}</span>
              {discountPercentage > 0 && (
                <span className="text-xl text-[#973c00]/40 line-through mb-1">
                  ₹{(parseFloat(product.price) / (1 - discountPercentage / 100)).toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock */}
            <div>
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 bg-[#5A1E12]/8 text-[#5A1E12] border border-[#5A1E12]/15 text-sm font-semibold px-3 py-1.5 rounded-full">
                  <Check className="w-3.5 h-3.5" />
                  In Stock
                  <span className="font-normal text-[#5A1E12]/60">· {product.stock} left</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-[#973c00]/8 text-[#973c00] border border-[#973c00]/15 text-sm font-semibold px-3 py-1.5 rounded-full">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, i) => (
                  <span key={i} className="text-xs font-medium text-[#973c00] bg-[#973c00]/6 border border-[#973c00]/12 px-3 py-1 rounded-full">#{tag}</span>
                ))}
              </div>
            )}

            {/* Seller */}
            {sellerDisplayName && (
              <div className="flex items-center gap-2">
                <Store className="w-3.5 h-3.5 text-[#973c00]/50 shrink-0" />
                <span className="text-xs text-[#973c00]/50">Sold by</span>
                <span className="text-sm font-semibold text-[#5A1E12]">{sellerDisplayName}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAddingToCart}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-base font-bold shadow-lg transition-all duration-200 ${
                  addedToCart
                    ? 'bg-[#5A1E12] text-white'
                    : isOutOfStock
                    ? 'bg-[#973c00]/10 text-[#973c00]/40 cursor-not-allowed shadow-none'
                    : 'bg-[#5A1E12] text-white hover:bg-[#3b1a08] active:scale-95 shadow-[#5A1E12]/20'
                }`}
              >
                {isAddingToCart ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Adding…</>
                ) : addedToCart ? (
                  <><Check className="w-5 h-5" />Added to Cart!</>
                ) : (
                  <><ShoppingCart className="w-5 h-5" />{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</>
                )}
              </button>

              <button
                onClick={handleWishlist}
                className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all shadow-sm ${
                  isWishlisted
                    ? 'bg-[#5A1E12] border-[#5A1E12] text-white'
                    : 'bg-white/60 border-[#973c00]/20 text-[#973c00] hover:border-[#5A1E12] hover:text-[#5A1E12]'
                }`}
              >
                <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>

              <button className="w-14 h-14 rounded-2xl border-2 border-[#973c00]/20 bg-white/60 text-[#973c00] hover:border-[#5A1E12] hover:text-[#5A1E12] flex items-center justify-center transition shadow-sm">
                <Share2 className="w-6 h-6" />
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-[#973c00]/10" />

            {/* Benefits strip */}
            {/* <div className="grid grid-cols-3 gap-2">
              {[
                { Icon: Truck, title: 'Free Shipping', sub: 'Orders over ₹1000' },
                { Icon: RotateCcw, title: 'Easy Returns', sub: '30-day policy' },
                { Icon: Shield, title: 'Secure Pay', sub: '100% safe' },
              ].map(({ Icon, title, sub }) => (
                <div key={title} className="flex flex-col items-center text-center gap-1">
                  <Icon className="w-5 h-5 text-[#973c00]/60" />
                  <p className="text-xs font-semibold text-[#3b1a08]">{title}</p>
                  <p className="text-[10px] text-[#973c00]/40">{sub}</p>
                </div>
              ))}
            </div> */}
          </div>
        </div>

        {/* ── Tabs – Description / Reviews / Write a Review ─────────── */}
        <div className="mt-16">

          {/* Tab Bar */}
          <div className="flex gap-1 border-b-2 border-[#973c00]/10 mb-8">
            {([
              { key: 'description', label: 'Description' },
              { key: 'reviews',     label: `Reviews${ratings.length > 0 ? ` (${ratings.length})` : ''}` },
              { key: 'write-review', label: 'Write a Review' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`relative px-5 py-3 text-sm font-semibold transition-colors rounded-t-xl ${
                  activeTab === key
                    ? 'text-[#5A1E12]'
                    : 'text-[#973c00]/50 hover:text-[#5A1E12]'
                }`}
              >
                {label}
                {activeTab === key && (
                  <span className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-[#5A1E12] rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Description Tab */}
          {activeTab === 'description' && (
            <div className="max-w-3xl">
              <p className="text-[#3b1a08] leading-relaxed text-base whitespace-pre-line">{product.description}</p>

              {/* Meta details */}
              <div className="mt-8 divide-y divide-[#973c00]/10">
                {product.category && (
                  <div className="flex items-center justify-between py-3">
                    <span className="text-xs font-semibold text-[#973c00]/50 uppercase tracking-wider">Category</span>
                    <span className="text-sm font-semibold text-[#3b1a08]">{product.category}</span>
                  </div>
                )}
                {product.brand && (
                  <div className="flex items-center justify-between py-3">
                    <span className="text-xs font-semibold text-[#973c00]/50 uppercase tracking-wider">Brand</span>
                    <span className="text-sm font-semibold text-[#3b1a08]">{product.brand}</span>
                  </div>
                )}
                {product.artistName && (
                  <div className="flex items-center justify-between py-3">
                    <span className="text-xs font-semibold text-[#973c00]/50 uppercase tracking-wider">Artist</span>
                    <span className="text-sm font-semibold text-[#3b1a08]">{product.artistName}</span>
                  </div>
                )}
                {sellerDisplayName && (
                  <div className="flex items-center justify-between py-3">
                    <span className="text-xs font-semibold text-[#973c00]/50 uppercase tracking-wider">Sold by</span>
                    <span className="text-sm font-semibold text-[#3b1a08]">{sellerDisplayName}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              {ratingsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-28 bg-white/50 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : ratingsError ? (
                <p className="text-[#973c00] text-sm">{ratingsError}</p>
              ) : ratings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-[#973c00]/8 flex items-center justify-center mx-auto mb-4">
                    <Star className="w-7 h-7 text-[#973c00]/30" />
                  </div>
                  <p className="text-[#3b1a08] font-semibold mb-1">No reviews yet</p>
                  <p className="text-sm text-[#973c00]/60 mb-5">Be the first to share your experience</p>
                  <button
                    onClick={() => setActiveTab('write-review')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5A1E12] text-white text-sm font-semibold rounded-xl hover:bg-[#3b1a08] transition"
                  >
                    Write a Review
                  </button>
                </div>
              ) : (
                <div>
                  {/* Summary bar */}
                  <div className="flex items-center gap-4 mb-8">
                    <p className="text-6xl font-black text-[#3b1a08] leading-none">{avgRating.toFixed(1)}</p>
                    <div>
                      <div className="flex gap-0.5 mb-1">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? 'fill-[#973c00] text-[#973c00]' : 'text-[#973c00]/15 fill-[#973c00]/8'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-[#973c00]/50">{ratings.length} review{ratings.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <div className="divide-y divide-[#973c00]/10">
                    {ratings.map((r, idx) => (
                      <div key={idx} className="py-5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#3b1a08]">{r.user?.name || r.userName || 'Anonymous'}</span>
                            {r.createdAt && (
                              <span className="text-[11px] text-[#973c00]/40">{new Date(r.createdAt).toLocaleDateString()}</span>
                            )}
                          </div>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-3.5 h-3.5 ${s <= (r.rating || 0) ? 'fill-[#973c00] text-[#973c00]' : 'text-[#973c00]/15 fill-[#973c00]/8'}`} />
                            ))}
                          </div>
                        </div>
                        {(r.comment || r.review) && (
                          <p className="text-sm text-[#3b1a08]/70 leading-relaxed">{r.comment || r.review}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Write a Review Tab */}
          {activeTab === 'write-review' && (
            <div className="max-w-xl">
              {/* Star picker */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#3b1a08] mb-3">Your Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map((star) => (
                    <button key={star} onClick={() => setRatingScore(star)} className="transition-transform hover:scale-110 active:scale-95">
                      <Star className={`w-10 h-10 transition-colors ${
                        star <= ratingScore ? 'fill-[#973c00] text-[#973c00]' : 'text-[#973c00]/20 fill-[#973c00]/6 hover:fill-[#973c00]/20'
                      }`} />
                    </button>
                  ))}
                </div>
                {ratingScore > 0 && (
                  <p className="text-xs text-[#973c00] mt-2 font-medium">
                    {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent!'][ratingScore - 1]} · {ratingScore}/5
                  </p>
                )}
              </div>

              {/* Review text */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#3b1a08] mb-2">Your Review</label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your experience with this product…"
                  maxLength={500}
                  rows={5}
                  className="w-full px-4 py-3.5 border border-[#973c00]/15 bg-white/60 rounded-2xl text-[#3b1a08] placeholder-[#973c00]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A1E12]/20 focus:border-[#5A1E12]/30 resize-none transition"
                />
                <p className="text-[11px] text-[#973c00]/40 mt-1 text-right">{review.length}/500</p>
              </div>

              {ratingMessage && (
                <div className={`text-sm px-4 py-3 rounded-xl mb-5 border ${
                  ratingMessage.includes('successfully')
                    ? 'bg-[#5A1E12]/5 text-[#5A1E12] border-[#5A1E12]/15'
                    : 'bg-[#973c00]/5 text-[#973c00] border-[#973c00]/15'
                }`}>
                  {ratingMessage}
                </div>
              )}

              <button
                onClick={handleSubmitRating}
                disabled={isSubmittingRating || ratingScore === 0 || review.trim() === ''}
                className="w-full py-4 bg-[#5A1E12] text-white font-bold rounded-2xl hover:bg-[#3b1a08] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-[#5A1E12]/15 active:scale-[.99]"
              >
                {isSubmittingRating ? (
                  <span className="inline-flex items-center gap-2 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting…
                  </span>
                ) : 'Submit Review'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Image Lightbox Modal ─────────────────────────────────────── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-110">
            <X className="w-6 h-6" />
          </button>
          {allImages.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); setModalImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1)); }} className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hidden md:block z-110">
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}
          {allImages.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); setModalImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0)); }} className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hidden md:block z-110">
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
          <div className="relative w-full h-[80vh] max-w-5xl mx-4 flex items-center justify-center pointer-events-none">
            <Image src={allImages[modalImageIndex]} alt={product.title} fill className="object-contain pointer-events-auto" quality={100} />
          </div>
          {allImages.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 px-6 py-3 bg-white/5 backdrop-blur-md rounded-2xl overflow-x-auto max-w-[90vw] z-110" onClick={(e) => e.stopPropagation()}>
              {allImages.map((img, idx) => (
                <button key={idx} onClick={() => setModalImageIndex(idx)} className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${modalImageIndex === idx ? 'border-[#973c00] scale-110 shadow-lg' : 'border-white/10 opacity-40 hover:opacity-100'}`}>
                  <Image src={img} alt="thumbnail" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
