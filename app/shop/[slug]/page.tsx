"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
import { useProductStock } from "@/hooks/useProductStock";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

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

// ─── Avatar initials helper ────────────────────────────────────────────────
function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ShopSlugPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slugParam = params?.slug as string;

  // Resolve slug → product ID
  const { data: allProducts, isLoading: allProductsLoading } = useProducts();
  const resolvedProductId = useMemo(() => {
    if (!allProducts || !slugParam) return undefined;
    const match = allProducts.find((p) => {
      const productSlug = p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return productSlug === slugParam;
    });
    return match?.id;
  }, [allProducts, slugParam]);

  const { data: product, isLoading: productLoading, error: queryError } = useSingleProduct(resolvedProductId);
  const loading = allProductsLoading || productLoading;
  const error = queryError?.message || null;

  // Real-time stock — REST snapshot on mount + live socket updates thereafter
  const {
    stock: liveStock,
    isAvailable: liveIsAvailable,
  } = useProductStock(product?.id, product?.stock ?? 0);

  // UI state
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageFading, setImageFading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [ratingScore, setRatingScore] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingMessage, setRatingMessage] = useState("");
  const [ratings, setRatings] = useState<any[]>([]);
  const [ratingsLoading, setRatingsLoading] = useState(true);
  const [ratingsError, setRatingsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'write-review'>('description');
  const [tabMounted, setTabMounted] = useState(true);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [pageMounted, setPageMounted] = useState(false);

  // Lightbox
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  // Refs
  const cartBtnRef = useRef<HTMLButtonElement>(null);

  // Cart / wishlist
  const { addToCart, cartData, loading: cartLoading } = useSharedEnhancedCart();
  const { data: wishlistData } = useWishlistCheck(product?.id || "");
  const { token, user: authUser } = useAuth();
  const toggleWishlistMutation = useToggleWishlist();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  // Check if user is authenticated (either token or user object exists)
  const isAuthenticated = !!(token || authUser);

  // Build ordered image list
  const allImages = useMemo<string[]>(() => {
    if (!product) return [];
    const result: string[] = [];
    if (product.featuredImage && product.featuredImage.trim() !== "") result.push(product.featuredImage);
    if (Array.isArray(product.galleryImages)) {
      product.galleryImages.forEach(img => { if (img && img.trim() !== "" && !result.includes(img)) result.push(img); });
    }
    if (result.length === 0 && Array.isArray(product.images)) {
      product.images.forEach(img => { if (img && img.trim() !== "" && !result.includes(img)) result.push(img); });
    }
    return result;
  }, [product]);

  // Page mount animation
  useEffect(() => { const t = setTimeout(() => setPageMounted(true), 30); return () => clearTimeout(t); }, []);

  // Sticky bar via IntersectionObserver
  useEffect(() => {
    const btn = cartBtnRef.current;
    if (!btn) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(btn);
    return () => observer.disconnect();
  }, [product]);

  // Fetch ratings
  useEffect(() => {
    const fetchRatings = async () => {
      if (!product?.id) return;
      try {
        setRatingsLoading(true);
        setRatingsError(null);
        const response = await apiClient.get<any>(`/ratings/products/${product.id}/ratings`);
        if (response && Array.isArray(response.ratings)) setRatings(response.ratings);
        else if (response?.data && Array.isArray(response.data.ratings)) setRatings(response.data.ratings);
        else setRatings([]);
      } catch (err) {
        setRatingsError(err instanceof Error ? err.message : "Failed to fetch ratings");
        setRatings([]);
      } finally { setRatingsLoading(false); }
    };
    fetchRatings();
  }, [product?.id]);

  // Sync wishlist
  useEffect(() => { setIsWishlisted(wishlistData?.inWishlist || false); }, [wishlistData]);

  // Modal scroll lock
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  // Tab fade helper
  const switchTab = useCallback((tab: 'description' | 'reviews' | 'write-review') => {
    setTabMounted(false);
    setTimeout(() => { setActiveTab(tab); setTabMounted(true); }, 150);
  }, []);

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
  
  // Use real-time liveStock so the button reflects instant server-side changes
  const remainingStock = Math.max(0, liveStock - currentQtyInCart);
  const isOutOfStock = !liveIsAvailable || remainingStock === 0;

  const handleAddToCart = async () => {
    if (!product || isOutOfStock || isAddingToCart) return;

    try {
      setIsAddingToCart(true);
      await addToCart(product.id, {
        title: product.title,
        price: product.price,
        featuredImage: product.featuredImage,
        images: product.images || [],
        galleryImages: product.galleryImages || [],
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

  const handleWishlist = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    // Debug: Log auth state
    console.log('Auth state check:', { 
      token: !!token, 
      authUser: !!authUser, 
      isAuthenticated,
      tokenValue: token ? 'exists' : 'missing',
      userValue: authUser ? 'exists' : 'missing'
    });

    if (!isAuthenticated) {
      toast.info("🔐 Please log in to add items to your Wishlist", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // Only add to wishlist, don't toggle
    if (isWishlisted) {
      return; // Already in wishlist, do nothing
    }

    // Heart animation
    setIsHeartAnimating(true);
    setTimeout(() => setIsHeartAnimating(false), 300);
    
    // Optimistically update UI
    setIsWishlisted(true);

    // Call API to add to wishlist
    toggleWishlistMutation.debouncedMutate({
      productId: product?.id || "",
      isCurrentlyWishlisted: false, // Always pass false since we only add
    });

    // Show success toast
    toast.success("❤️ Added to Wishlist!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
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
      <div className="min-h-screen bg-[#f1eee9] pt-36 pb-16">
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

  // Crossfade image switch
  const switchImage = (idx: number) => {
    if (idx === selectedImage) return;
    setImageFading(true);
    setTimeout(() => { setSelectedImage(idx); setImageFading(false); }, 180);
  };

  const currentImageSrc = allImages[selectedImage] || allImages[0];
  const sellerDisplayName = product.seller?.name || product.sellerName;
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((s, r) => s + (r.rating || 0), 0) / ratings.length
      : product.rating || 0;
  const discountPercentage = typeof product?.discount === "number" ? product.discount : 0;

  return (
    <>
      {/* ── Sticky Add-to-Cart bar (appears when CTA scrolls out) ────── */}
      <div
        className={`fixed bottom-0 inset-x-0 z-50 transition-all duration-300 ${
          showStickyBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-white/80 backdrop-blur-xl border-t border-[#973c00]/10 shadow-2xl shadow-[#3b1a08]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
            {currentImageSrc && (
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#973c00]/10 shrink-0">
                <Image src={currentImageSrc} alt={product.title} fill className="object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#3b1a08] truncate">{product.title}</p>
              <p className="text-sm font-black text-[#973c00]">₹{product.price}</p>
            </div>
            <button
              onClick={handleWishlist}
              disabled={!token || isWishlisted}
              className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 disabled:opacity-60 disabled:cursor-not-allowed ${
                isWishlisted 
                  ? 'bg-[#5A1E12] text-white' 
                  : 'bg-white/90 text-[#973c00] hover:bg-[#5A1E12] hover:text-white'
              }`}
              title={
                !token 
                  ? "Please log in to add to wishlist" 
                  : isWishlisted 
                    ? "Already in wishlist" 
                    : "Add to wishlist"
              }
            >
              <Heart 
                className={`w-5 h-5 transition-all duration-200 ${
                  isWishlisted ? 'fill-current scale-110' : ''
                } ${isHeartAnimating ? 'animate-pulse scale-125' : ''}`} 
              />
            </button>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAddingToCart}
              className={`shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold shadow-lg transition-all duration-200 ${
                addedToCart
                  ? 'bg-[#5A1E12] text-white'
                  : isOutOfStock
                  ? 'bg-[#973c00]/10 text-[#973c00]/40 cursor-not-allowed shadow-none'
                  : 'bg-[#5A1E12] text-white hover:bg-[#3b1a08] active:scale-95'
              }`}
            >
              {isAddingToCart ? <Loader2 className="w-4 h-4 animate-spin" /> : addedToCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
              {isAddingToCart ? 'Adding…' : addedToCart ? 'Added!' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Page ───────────────────────────────────────────────── */}
      <div
        className={`min-h-screen bg-[#ebe3d5] pt-28 pb-32 transition-all duration-700 ease-out ${
          pageMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Breadcrumb ────────────────────────────────────────────── */}
          <div
            className={`flex items-center justify-between mb-8 transition-all duration-500 delay-100 ${
              pageMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            <nav className="flex items-center gap-1.5 text-sm">
              <span className="text-[#973c00]/70 hover:text-[#5A1E12] cursor-pointer font-medium transition-colors" onClick={() => router.push('/')}>Home</span>
              <span className="text-[#973c00]/40">/</span>
              <span className="text-[#973c00]/70 hover:text-[#5A1E12] cursor-pointer font-medium transition-colors" onClick={handleBackToShop}>Shop</span>
              <span className="text-[#973c00]/40">/</span>
              <span className="font-semibold text-[#3b1a08] truncate max-w-48">{product.title}</span>
            </nav>
            <button
              onClick={handleBackToShop}
              className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-[#5A1E12] hover:text-[#3b1a08] border border-[#973c00]/20 bg-white/60 hover:bg-white/90 px-4 py-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </button>
          </div>

          {/* ── Hero Grid ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

            {/* LEFT – Image Gallery */}
            <div
              className={`space-y-4 transition-all duration-700 delay-150 ${
                pageMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`}
            >
              {/* Main image */}
              <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-white shadow-xl shadow-[#3b1a08]/8 border border-[#973c00]/10 group">
                {currentImageSrc ? (
                  <Image
                    key={selectedImage}
                    src={currentImageSrc}
                    alt={product.title}
                    fill
                    className={`object-cover transition-all duration-500 group-hover:scale-[1.03] ${
                      imageFading ? 'opacity-0 scale-[1.02]' : 'opacity-100 scale-100'
                    }`}
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#fdf4ef] gap-3">
                    <Package className="w-12 h-12 text-[#973c00]/30" />
                    <p className="text-[#973c00]/50 text-sm">No image available</p>
                  </div>
                )}

                {/* Top badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.featured && (
                    <span className="inline-flex items-center gap-1 bg-[#5A1E12] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                      ✦ Featured
                    </span>
                  )}
                  {discountPercentage > 0 && (
                    <span className="bg-[#973c00] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      -{discountPercentage}% OFF
                    </span>
                  )}
                </div>

                {/* Top-right actions */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button
                    onClick={handleWishlist}
                    disabled={!token || isWishlisted}
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 disabled:opacity-60 disabled:cursor-not-allowed ${
                      isWishlisted 
                        ? 'bg-[#5A1E12] text-white' 
                        : 'bg-white/90 backdrop-blur-sm text-[#973c00] hover:bg-[#5A1E12] hover:text-white'
                    }`}
                    title={
                      !token 
                        ? "Please log in to add to wishlist" 
                        : isWishlisted 
                          ? "Already in wishlist" 
                          : "Add to wishlist"
                    }
                  >
                    <Heart 
                      className={`w-5 h-5 transition-all duration-200 ${
                        isWishlisted ? 'fill-current scale-110' : ''
                      } ${isHeartAnimating ? 'animate-pulse scale-125' : ''}`} 
                    />
                  </button>
                  {allImages.length > 1 && (
                    <button
                      onClick={() => { setModalImageIndex(selectedImage); setIsModalOpen(true); }}
                      className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-[#973c00] hover:bg-[#5A1E12] hover:text-white flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110"
                      title="View full screen"
                    >
                      <Maximize2 className="w-4.5 h-4.5" />
                    </button>
                  )}
                </div>

                {/* Image counter */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    {selectedImage + 1} / {allImages.length}
                  </div>
                )}
              </div>

              {/* Thumbnail strip – all images */}
              {allImages.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => switchImage(idx)}
                      className={`relative shrink-0 w-18 h-18 rounded-2xl overflow-hidden border-2 transition-all hover:scale-105 ${
                        selectedImage === idx
                          ? 'border-[#5A1E12] shadow-md shadow-[#5A1E12]/20 scale-105'
                          : 'border-[#973c00]/20 opacity-60 hover:opacity-100 hover:border-[#973c00]/50'
                      }`}
                    >
                      <Image src={img} alt={`${product.title} ${idx + 1}`} fill className="object-cover" />
                      {selectedImage === idx && (
                        <div className="absolute inset-0 ring-2 ring-inset ring-[#5A1E12]/30 rounded-2xl" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT – Product Details */}
            <div
              className={`flex flex-col gap-5 transition-all duration-700 delay-200 ${
                pageMounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
              }`}
            >
              {/* Category pill + Title */}
              <div className="space-y-2">
                {product.category && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#973c00] bg-[#973c00]/8 border border-[#973c00]/15 px-3 py-1 rounded-full">
                    <Tag className="w-3 h-3" />
                    {product.category}
                  </span>
                )}
                <h1 className="text-3xl lg:text-4xl font-extrabold text-[#3b1a08] leading-tight">{product.title}</h1>
                {product.artistName && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#973c00]/60" />
                    <span className="text-sm text-[#973c00]/60">by</span>
                    <span className="text-sm font-semibold text-[#5A1E12]">{product.artistName}</span>
                  </div>
                )}
              </div>

              {/* Rating row */}
              <div className="flex items-center gap-2.5">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`w-4 h-4 transition-colors ${s <= Math.round(avgRating) ? 'fill-[#973c00] text-[#973c00]' : 'text-[#973c00]/20 fill-[#973c00]/10'}`} />
                  ))}
                </div>
                <span className="text-sm font-semibold text-[#5A1E12]">
                  {avgRating > 0 ? avgRating.toFixed(1) : 'No ratings yet'}
                </span>
                {ratings.length > 0 && (
                  <button
                    onClick={() => switchTab('reviews')}
                    className="text-sm text-[#973c00]/60 hover:text-[#5A1E12] transition-colors underline-offset-2 hover:underline"
                  >
                    ({ratings.length} review{ratings.length !== 1 ? 's' : ''})
                  </button>
                )}
              </div>

              {/* Price */}
              <div className="flex items-end gap-3">
                <span className="text-5xl font-black text-[#3b1a08] leading-none tracking-tight">₹{product.price}</span>
                {discountPercentage > 0 && (
                  <>
                    <span className="text-xl text-[#973c00]/40 line-through mb-1">
                      ₹{(parseFloat(product.price) / (1 - discountPercentage / 100)).toFixed(2)}
                    </span>
                    <span className="mb-1 text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">
                      Save {discountPercentage}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock badge */}
              <div>
                {liveIsAvailable && liveStock > 0 ? (
                <span className="inline-flex items-center gap-1.5 bg-[#5A1E12]/8 text-[#5A1E12] border border-[#5A1E12]/15 text-sm font-semibold px-3 py-1.5 rounded-full">
                  <Check className="w-3.5 h-3.5" />
                  In Stock
                  <span className="font-normal text-[#5A1E12]/60">· {liveStock} left</span>
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
                    <span key={i} className="text-xs font-medium text-[#973c00] bg-[#973c00]/6 border border-[#973c00]/12 px-3 py-1 rounded-full hover:bg-[#973c00]/10 transition-colors cursor-default">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Seller */}
              {sellerDisplayName && (
                <div className="flex items-center gap-2 text-sm">
                  <Store className="w-3.5 h-3.5 text-[#973c00]/50 shrink-0" />
                  <span className="text-[#973c00]/50">Sold by</span>
                  <span className="font-semibold text-[#5A1E12]">{sellerDisplayName}</span>
                </div>
              )}

              {/* ── Action Buttons ────────────────────────────────────── */}
              <div className="flex gap-3 pt-1">
                <button
                  ref={cartBtnRef}
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAddingToCart}
                  className={`flex-1 inline-flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl text-base font-bold transition-all duration-200 ${
                    addedToCart
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                      : isOutOfStock
                      ? 'bg-[#973c00]/10 text-[#973c00]/40 cursor-not-allowed'
                      : 'bg-[#5A1E12] text-white hover:bg-[#3b1a08] active:scale-[.98] shadow-lg shadow-[#5A1E12]/25 hover:shadow-xl hover:shadow-[#5A1E12]/30'
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
                  className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-200 hover:scale-105 ${
                    isWishlisted
                      ? 'bg-[#5A1E12] border-[#5A1E12] text-white shadow-lg shadow-[#5A1E12]/20'
                      : 'bg-white/60 border-[#973c00]/20 text-[#973c00] hover:border-[#5A1E12] hover:text-[#5A1E12] hover:bg-white'
                  }`}
                >
                  <Heart className={`w-6 h-6 transition-transform duration-200 ${isWishlisted ? 'fill-current scale-110' : ''}`} />
                </button>

                <button className="w-14 h-14 rounded-2xl border-2 border-[#973c00]/20 bg-white/60 text-[#973c00] hover:border-[#5A1E12] hover:text-[#5A1E12] hover:bg-white flex items-center justify-center transition-all duration-200 hover:scale-105">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-[#973c00]/10" />

              {/* Benefits strip */}
              {/* <div className="grid grid-cols-3 gap-3">
                {[
                  { Icon: Truck, title: 'Free Shipping', sub: 'Orders over ₹1000' },
                  { Icon: RotateCcw, title: 'Easy Returns', sub: '30-day policy' },
                  { Icon: Shield, title: 'Secure Pay', sub: '100% safe checkout' },
                ].map(({ Icon, title, sub }) => (
                  <div key={title} className="flex flex-col items-center text-center gap-1.5 p-3 bg-white/50 rounded-2xl border border-[#973c00]/8 hover:bg-white/80 hover:border-[#973c00]/15 transition-all duration-200">
                    <div className="w-8 h-8 rounded-xl bg-[#973c00]/8 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[#973c00]/70" />
                    </div>
                    <p className="text-xs font-semibold text-[#3b1a08] leading-tight">{title}</p>
                    <p className="text-[10px] text-[#973c00]/40 leading-tight">{sub}</p>
                  </div>
                ))}
              </div> */}
            </div>
          </div>

          {/* ── Tabs ──────────────────────────────────────────────────── */}
          <div
            className={`mt-16 transition-all duration-700 delay-300 ${
              pageMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {/* Tab Bar */}
            <div className="flex gap-0.5 border-b-2 border-[#973c00]/10 mb-8">
              {([
                { key: 'description', label: 'Description' },
                { key: 'reviews', label: `Reviews${ratings.length > 0 ? ` (${ratings.length})` : ''}` },
                { key: 'write-review', label: 'Write a Review' },
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => switchTab(key)}
                  className={`relative px-5 py-3 text-sm font-semibold transition-all duration-200 rounded-t-xl ${
                    activeTab === key
                      ? 'text-[#5A1E12] bg-white/40'
                      : 'text-[#973c00]/50 hover:text-[#5A1E12] hover:bg-white/20'
                  }`}
                >
                  {label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-0.5 bg-[#5A1E12] rounded-full transition-all duration-300 ${
                      activeTab === key ? 'w-full opacity-100' : 'w-0 opacity-0'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Tab Content – fades in/out */}
            <div
              className={`transition-all duration-200 ${
                tabMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
              }`}
            >

              {/* Description Tab */}
              {activeTab === 'description' && (
                <div className="max-w-3xl">
                  <p className="text-[#3b1a08]/80 leading-relaxed text-base whitespace-pre-line">{product.description}</p>
                  <div className="mt-8 bg-white/50 rounded-2xl border border-[#973c00]/8 overflow-hidden">
                    {[
                      product.category && { label: 'Category', value: product.category },
                      product.brand && { label: 'Brand', value: product.brand },
                      product.artistName && { label: 'Artist', value: product.artistName },
                      sellerDisplayName && { label: 'Sold by', value: sellerDisplayName },
                    ].filter(Boolean).map((row: any, i, arr) => (
                      <div key={row.label} className={`flex items-center justify-between px-5 py-3.5 ${i < arr.length - 1 ? 'border-b border-[#973c00]/8' : ''}`}>
                        <span className="text-xs font-semibold text-[#973c00]/50 uppercase tracking-wider">{row.label}</span>
                        <span className="text-sm font-semibold text-[#3b1a08]">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div>
                  {ratingsLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-32 bg-white/50 rounded-2xl animate-pulse" />
                      ))}
                    </div>
                  ) : ratingsError ? (
                    <p className="text-[#973c00] text-sm">{ratingsError}</p>
                  ) : ratings.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-16 h-16 rounded-full bg-[#973c00]/8 flex items-center justify-center mx-auto mb-4">
                        <Star className="w-7 h-7 text-[#973c00]/30" />
                      </div>
                      <p className="text-[#3b1a08] font-semibold mb-1">No reviews yet</p>
                      <p className="text-sm text-[#973c00]/60 mb-6">Be the first to share your experience</p>
                      <button
                        onClick={() => switchTab('write-review')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5A1E12] text-white text-sm font-semibold rounded-xl hover:bg-[#3b1a08] transition-colors shadow-md shadow-[#5A1E12]/20"
                      >
                        Write a Review
                      </button>
                    </div>
                  ) : (
                    <div>
                      {/* Summary */}
                      <div className="flex items-center gap-6 mb-10 p-6 bg-white/50 rounded-2xl border border-[#973c00]/8">
                        <div className="text-center">
                          <p className="text-6xl font-black text-[#3b1a08] leading-none">{avgRating.toFixed(1)}</p>
                          <p className="text-xs text-[#973c00]/50 mt-1">out of 5</p>
                        </div>
                        <div className="flex-1">
                          <div className="flex gap-1 mb-2">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-5 h-5 ${s <= Math.round(avgRating) ? 'fill-[#973c00] text-[#973c00]' : 'text-[#973c00]/15 fill-[#973c00]/8'}`} />
                            ))}
                          </div>
                          <p className="text-sm text-[#973c00]/60">{ratings.length} review{ratings.length !== 1 ? 's' : ''}</p>
                        </div>
                        <button
                          onClick={() => switchTab('write-review')}
                          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 border-2 border-[#5A1E12]/20 text-[#5A1E12] text-sm font-semibold rounded-xl hover:bg-[#5A1E12]/5 transition-all duration-200"
                        >
                          Write a Review
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ratings.map((r, idx) => {
                          const name = r.user?.name || r.userName || 'Anonymous';
                          const initials = getInitials(name);
                          return (
                            <div
                              key={idx}
                              className="group p-5 bg-white/60 hover:bg-white/90 rounded-2xl border border-[#973c00]/8 hover:border-[#973c00]/20 shadow-sm hover:shadow-md transition-all duration-250"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-9 h-9 rounded-full bg-[#5A1E12] text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
                                    {initials || '?'}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-[#3b1a08] leading-tight">{name}</p>
                                    {r.createdAt && (
                                      <p className="text-[11px] text-[#973c00]/40">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-0.5 shrink-0">
                                  {[1,2,3,4,5].map(s => (
                                    <Star key={s} className={`w-3.5 h-3.5 ${s <= (r.rating || 0) ? 'fill-[#973c00] text-[#973c00]' : 'text-[#973c00]/15 fill-[#973c00]/8'}`} />
                                  ))}
                                </div>
                              </div>
                              {(r.comment || r.review) && (
                                <p className="text-sm text-[#3b1a08]/70 leading-relaxed line-clamp-4">{r.comment || r.review}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Write a Review Tab */}
              {activeTab === 'write-review' && (
                <div className="max-w-lg">
                  {/* Star picker */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-[#3b1a08] mb-3">Your Rating</label>
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRatingScore(star)}
                          className="transition-transform duration-150 hover:scale-110 active:scale-95"
                        >
                          <Star className={`w-10 h-10 transition-all duration-150 ${
                            star <= ratingScore
                              ? 'fill-[#973c00] text-[#973c00] drop-shadow-sm'
                              : 'text-[#973c00]/20 fill-[#973c00]/6 hover:fill-[#973c00]/20 hover:text-[#973c00]/40'
                          }`} />
                        </button>
                      ))}
                    </div>
                    {ratingScore > 0 && (
                      <p className="text-xs text-[#973c00] mt-2 font-semibold">
                        {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent!'][ratingScore - 1]} · {ratingScore}/5
                      </p>
                    )}
                  </div>

                  {/* Review textarea */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-[#3b1a08] mb-2">Your Review</label>
                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="Share your experience with this product…"
                      maxLength={500}
                      rows={5}
                      className="w-full px-4 py-3.5 border border-[#973c00]/15 bg-white/70 rounded-2xl text-[#3b1a08] placeholder-[#973c00]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A1E12]/20 focus:border-[#5A1E12]/30 resize-none transition-all duration-200 hover:bg-white/90"
                    />
                    <p className="text-[11px] text-[#973c00]/40 mt-1.5 text-right">{review.length}/500</p>
                  </div>

                  {ratingMessage && (
                    <div className={`text-sm px-4 py-3 rounded-xl mb-5 border flex items-center gap-2 ${
                      ratingMessage.includes('successfully')
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-[#973c00]/5 text-[#973c00] border-[#973c00]/15'
                    }`}>
                      {ratingMessage.includes('successfully') && <Check className="w-4 h-4 shrink-0" />}
                      {ratingMessage}
                    </div>
                  )}

                  <button
                    onClick={handleSubmitRating}
                    disabled={isSubmittingRating || ratingScore === 0 || review.trim() === ''}
                    className="w-full py-4 bg-[#5A1E12] text-white font-bold rounded-2xl hover:bg-[#3b1a08] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-[#5A1E12]/20 hover:shadow-xl hover:shadow-[#5A1E12]/25 active:scale-[.99]"
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
        </div>

        {/* ── Image Lightbox Modal ──────────────────────────────────── */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/96 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsModalOpen(false)}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 hover:scale-110 z-110"
            >
              <X className="w-6 h-6" />
            </button>
            {allImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setModalImageIndex(prev => prev > 0 ? prev - 1 : allImages.length - 1); }}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 hover:scale-110 hidden md:flex z-110"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}
            {allImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setModalImageIndex(prev => prev < allImages.length - 1 ? prev + 1 : 0); }}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 hover:scale-110 hidden md:flex z-110"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}
            <div
              className="relative w-full h-[80vh] max-w-5xl mx-4 pointer-events-none"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={allImages[modalImageIndex]}
                alt={product.title}
                fill
                className="object-contain pointer-events-auto"
                quality={100}
              />
            </div>
            {allImages.length > 1 && (
              <div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5 px-5 py-3 bg-white/5 backdrop-blur-xl rounded-2xl overflow-x-auto max-w-[90vw] z-110"
                onClick={(e) => e.stopPropagation()}
              >
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setModalImageIndex(idx)}
                    className={`relative shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                      modalImageIndex === idx
                        ? 'border-[#973c00] scale-110 shadow-lg shadow-[#973c00]/30'
                        : 'border-white/10 opacity-40 hover:opacity-90'
                    }`}
                  >
                    <Image src={img} alt="thumbnail" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
