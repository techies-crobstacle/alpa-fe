"use client";

import { TruckElectric, Plus, Minus, Trash2, Loader, Loader2, ArrowRight, Tag, X, LogIn, User, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSharedEnhancedCart } from "@/hooks/useSharedEnhancedCart";
import { useProducts } from "@/hooks/useProducts";
import { useCartStock } from "@/hooks/useCartStock";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { sellerCouponsApi, AppliedSellerCoupon } from "@/lib/api";

// ─── Per-product coupon state (keyed by productId) ────────────────────────
interface ProductCouponState {
  input: string;
  applied: AppliedSellerCoupon | null;
  error: string;
  loading: boolean;
  showPicker: boolean;
  availableCoupons: any[];
  availableLoading: boolean;
  eligibilityMap: Record<string, boolean | null>; // null=checking, true=eligible, false=not eligible
}

function makeFreshCouponState(): ProductCouponState {
  return { input: "", applied: null, error: "", loading: false, showPicker: false, availableCoupons: [], availableLoading: false, eligibilityMap: {} };
}

// â”€â”€â”€ Available-coupon label helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getCouponLabel(coupon: any): string {
  if (coupon.couponType === "bundle") {
    return `Buy ${coupon.bundleQty} for $${Number(coupon.bundlePrice).toFixed(2)}`;
  }
  if (coupon.discountType === "percentage") {
    const cap = coupon.maxDiscount ? ` (up to $${coupon.maxDiscount} off)` : "";
    return `${coupon.discountValue}% off${cap}`;
  }
  return `$${Number(coupon.discountValue).toFixed(2)} off`;
}

export default function Page() {
  const router = useRouter();
  const { user } = useAuth();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const handleProceedToCheckout = () => {
    if (user) {
      router.push("/checkout");
    } else {
      setShowCheckoutModal(true);
    }
  };

  const { data: allProducts = [] } = useProducts();
  const productCategoryMap = useMemo(() => {
    return Object.fromEntries(allProducts.map(p => [p.id, p.category]));
  }, [allProducts]);
  const sellerProductMap = useMemo(
    () => Object.fromEntries(allProducts.map(p => [p.id, { sellerId: p.sellerId, sellerName: p.sellerName ?? p.sellerUserName }])),
    [allProducts]
  );

  // Use enhanced cart hook for real-time data
  const {
    cartData,
    selectedShipping,
    setSelectedShipping,
    loading,
    refreshing,
    error,
    calculateTotals,
    updateQuantity,
    removeItem,
    fetchCartData,
    subscribeToUpdates,
  } = useSharedEnhancedCart();
  const cartItems = cartData?.cart ?? [];

  // ── Per-product coupon state (keyed by productId) ───────────────────────
  const [productCoupons, setProductCoupons] = useState<Record<string, ProductCouponState>>({});

  const updateProductCoupon = useCallback((productId: string, patch: Partial<ProductCouponState>) => {
    setProductCoupons(prev => ({
      ...prev,
      [productId]: { ...(prev[productId] ?? makeFreshCouponState()), ...patch },
    }));
  }, []);

  // Restore persisted coupons on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cartProductCoupons");
      if (saved) {
        const parsed = JSON.parse(saved);
        setProductCoupons(prev => {
          const next = { ...prev };
          Object.entries(parsed).forEach(([pid, coupon]) => {
            next[pid] = { ...(next[pid] ?? makeFreshCouponState()), applied: coupon as AppliedSellerCoupon | null };
          });
          return next;
        });
      }
    } catch {}
  }, []);

  // Get calculated totals
  const { subtotal, shippingCost, gstAmount, grandTotal, gstPercentage } = calculateTotals;
  const [syncTrigger, setSyncTrigger] = useState(0);
  const [summaryRefreshing, setSummaryRefreshing] = useState(false);

  // Total discount — only count coupons whose key is an actual cart productId
  const totalDiscount = useMemo(() => {
    const cartPids = new Set(cartItems.map(i => i.productId));
    return Object.entries(productCoupons)
      .filter(([pid]) => cartPids.has(pid))
      .reduce((sum, [, s]) => sum + (s.applied?.savings ?? 0), 0);
  }, [productCoupons, cartItems]);

  // Clean up stale coupon entries (e.g. keyed by coupon code instead of productId)
  // that may have been written by the checkout pages
  useEffect(() => {
    if (cartItems.length === 0) return;
    const cartPids = new Set(cartItems.map(i => i.productId));
    setProductCoupons(prev => {
      const staleKeys = Object.keys(prev).filter(pid => !cartPids.has(pid));
      if (staleKeys.length === 0) return prev;
      const next = { ...prev };
      staleKeys.forEach(k => delete next[k]);
      const persisted: Record<string, any> = {};
      Object.entries(next).forEach(([pid, s]) => { if (s.applied) persisted[pid] = s.applied; });
      localStorage.setItem("cartProductCoupons", JSON.stringify(persisted));
      return next;
    });
  }, [cartItems]);
  // Handle quantity update — invalidates applied coupon for that product
  const handleQuantityUpdate = async (productId: string, newQuantity: number, variantId?: string | null) => {
    const itemKey = variantId ? `${productId}:${variantId}` : productId;
    setUpdatingItems((prev) => new Set(prev).add(itemKey));
    if (productCoupons[productId]?.applied) handleRemoveCoupon(productId);
    try {
      await updateQuantity(productId, newQuantity, variantId ?? undefined);
    } finally {
      setUpdatingItems((prev) => { const n = new Set(prev); n.delete(itemKey); return n; });
    }
  };

  // Handle remove item — clears applied coupon for that product
  const handleRemoveItem = async (productId: string, variantId?: string | null) => {
    const itemKey = variantId ? `${productId}:${variantId}` : productId;
    setUpdatingItems((prev) => new Set(prev).add(itemKey));
    setSummaryRefreshing(true);
    if (productCoupons[productId]?.applied) handleRemoveCoupon(productId);
    try {
      await removeItem(productId, variantId ?? undefined);
    } finally {
      setSummaryRefreshing(false);
      setUpdatingItems((prev) => { const n = new Set(prev); n.delete(itemKey); return n; });
    }
  };
  // ── Group cart items by seller ──────────────────────────────────────────
  const sellerGroups = useMemo(() => {
    const groups = new Map<string, { sellerName: string; items: typeof cartItems }>();
    cartItems.forEach((item) => {
      const sellerId = (item.product as any)?.sellerId ?? sellerProductMap[item.productId]?.sellerId ?? "unknown";
      const sellerName = (item.product as any)?.sellerName ?? (item.product as any)?.sellerUserName ?? sellerProductMap[item.productId]?.sellerName ?? sellerId;
      if (!groups.has(sellerId)) groups.set(sellerId, { sellerName, items: [] });
      groups.get(sellerId)!.items.push(item);
    });
    return [...groups.entries()].map(([sellerId, v]) => ({ sellerId, ...v }));
  }, [cartItems]);

  // Real-time stock validation â€” bulk REST snapshot + live socket updates
  const cartProductIds = useMemo(
    () => cartItems.map((i) => i.productId),
    [cartItems]
  );
  const cartQuantities = useMemo(
    () => Object.fromEntries(cartItems.map((i) => [i.productId, i.quantity])),
    [cartItems]
  );
  const { stockMap, canCheckout: stockCanCheckout } = useCartStock(cartProductIds, {
    cartQuantities,
    onOverstock: (productId, newStock) => handleQuantityUpdate(productId, newStock),
  });

  // ── Per-product coupon handlers ──────────────────────────────────────────
  const handleApplyCoupon = async (productId: string, sellerId: string, codeOverride?: string) => {
    const state = productCoupons[productId] ?? makeFreshCouponState();
    const code = (codeOverride ?? state.input).trim();
    if (!code) {
      updateProductCoupon(productId, { error: "Please enter a coupon code." });
      return;
    }
    updateProductCoupon(productId, { error: "", loading: true, applied: null });

    // Send all variants of this product
    const productVariants = cartItems.filter(i => i.productId === productId).map(item => ({
      productId: item.productId,
      variantId: item.variantId ?? null,
      quantity: item.quantity,
    }));

    try {
      const data = await sellerCouponsApi.applyCoupon(code, productVariants);
      if (!data.success) {
        updateProductCoupon(productId, { error: data.message || "Invalid coupon code.", loading: false });
        return;
      }
      if (!data.qualifyingItems || data.qualifyingItems.length === 0) {
        updateProductCoupon(productId, { error: "This product is not eligible for that coupon.", loading: false });
        return;
      }
      const applied: AppliedSellerCoupon = {
        code: data.coupon.code,
        couponType: data.coupon.couponType,
        eligibleSellerId: data.eligibleSellerId,
        savings: data.summary.totalSavingsExGST,
        total: data.summary.discountedInclTotal,
        nonQualifyingItems: data.nonQualifyingItems || [],
      };
      updateProductCoupon(productId, { applied, loading: false, error: "", showPicker: false });

      // Persist
      setProductCoupons(prev => {
        const persisted: Record<string, any> = {};
        Object.entries({ ...prev, [productId]: { ...(prev[productId] ?? makeFreshCouponState()), applied } })
          .forEach(([pid, s]) => { if (s.applied) persisted[pid] = s.applied; });
        localStorage.setItem("cartProductCoupons", JSON.stringify(persisted));
        return prev;
      });
    } catch (err: any) {
      updateProductCoupon(productId, { error: err?.message || "Failed to validate coupon. Please try again.", loading: false });
    }
  };

  const handleRemoveCoupon = (productId: string) => {
    updateProductCoupon(productId, { applied: null, input: "", error: "" });
    setProductCoupons(prev => {
      const persisted: Record<string, any> = {};
      Object.entries(prev).forEach(([pid, s]) => {
        if (pid !== productId && s.applied) persisted[pid] = s.applied;
      });
      localStorage.setItem("cartProductCoupons", JSON.stringify(persisted));
      return prev;
    });
  };

  const handleTogglePicker = async (productId: string, sellerId: string) => {
    const state = productCoupons[productId] ?? makeFreshCouponState();
    const nextOpen = !state.showPicker;
    updateProductCoupon(productId, { showPicker: nextOpen });

    const productVariants = cartItems.filter(i => i.productId === productId).map(item => ({
      productId: item.productId,
      variantId: item.variantId ?? null,
      quantity: item.quantity,
    }));

    const runEligibilityChecks = (coupons: any[]) => {
      const initialMap: Record<string, boolean | null> = {};
      coupons.forEach((c: any) => { initialMap[c.code] = null; });
      setProductCoupons(prev => ({
        ...prev,
        [productId]: { ...(prev[productId] ?? makeFreshCouponState()), eligibilityMap: initialMap },
      }));
      coupons.forEach(async (c: any) => {
        try {
          const data = await sellerCouponsApi.applyCoupon(c.code, productVariants);
          const eligible = !!(data.success && data.qualifyingItems?.length > 0);
          setProductCoupons(prev => {
            const cur = prev[productId] ?? makeFreshCouponState();
            return { ...prev, [productId]: { ...cur, eligibilityMap: { ...(cur.eligibilityMap ?? {}), [c.code]: eligible } } };
          });
        } catch {
          setProductCoupons(prev => {
            const cur = prev[productId] ?? makeFreshCouponState();
            return { ...prev, [productId]: { ...cur, eligibilityMap: { ...(cur.eligibilityMap ?? {}), [c.code]: false } } };
          });
        }
      });
    };

    if (nextOpen && state.availableCoupons.length === 0) {
      updateProductCoupon(productId, { availableLoading: true });
      try {
        const resp = await sellerCouponsApi.getActiveCoupons(sellerId);
        const coupons = resp.coupons || [];
        updateProductCoupon(productId, { availableCoupons: coupons, availableLoading: false });
        if (coupons.length > 0) runEligibilityChecks(coupons);
      } catch {
        updateProductCoupon(productId, { availableLoading: false });
      }
    } else if (nextOpen && state.availableCoupons.length > 0 && Object.keys(state.eligibilityMap ?? {}).length === 0) {
      // Coupons already loaded but eligibility never checked — run now
      runEligibilityChecks(state.availableCoupons);
    }
  };

  const handlePickCoupon = (productId: string, sellerId: string, code: string) => {
    updateProductCoupon(productId, { input: code, showPicker: false, error: "" });
    handleApplyCoupon(productId, sellerId, code);
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="bg-[#FAF7F2] min-h-screen flex flex-col items-center justify-center text-[#4A3728]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader className="h-10 w-10 text-[#8B5E3C]" />
        </motion.div>
        <p className="mt-4 font-medium tracking-wide animate-pulse">Curating your cart...</p>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error) {
    return (
      <div className="bg-[#FAF7F2] min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-xl border border-red-100">
          <p className="text-lg text-red-800 mb-6 font-medium">Unable to load cart: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#4A3728] text-white rounded-xl hover:bg-[#2C1810] transition-colors shadow-lg"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.main 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="bg-[#FAF7F2] min-h-screen font-sans text-[#4A3728]"
    >
      
      {/* --- HERO SECTION --- */}
      <section className="relative h-[80vh] overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/main.png')] bg-cover bg-center bg-fixed animate-slow-zoom">
          {/* Layered gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-b from-amber-900/70 via-amber-900/40 to-black/80" />
          <div className="absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
          <span className="mb-4 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 text-sm font-medium backdrop-blur-md">
            Review your items
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-2 md:mb-6 tracking-tight">Your Cart Summary</h1>
          <p className="text-sm md:text-xl text-gray-200 max-w-2xl leading-relaxed">
            Review your selected items and proceed to checkout when you&apos;re ready.
          </p>
        </div>
      </section>

      <div className="max-w-400 mx-auto px-4 md:px-8 py-12 relative z-20">
        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-8 items-start">
          
          {/* --- LEFT COLUMN: CART ITEMS GROUPED BY SELLER --- */}
          <div className="space-y-8">
            {/* Column header */}
            {cartItems.length > 0 && (
              <div className="px-2">
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 pb-3 border-b border-[#D6C0A9]">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#8B5E3C]">Product</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#8B5E3C] w-28 text-center">Quantity</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#8B5E3C] w-20 text-right">Price</span>
                </div>
              </div>
            )}
            {cartItems.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-3xl p-12 text-center shadow-sm border border-[#E6DCC8]"
              >
                <TruckElectric className="h-16 w-16 text-[#D6C0A9] mx-auto mb-4" />
                <p className="text-2xl font-serif text-[#4A3728] mb-2">Your cart is empty</p>
                <p className="text-[#8B5E3C]">Looks like you haven&apos;t made your choice yet.</p>
              </motion.div>
            ) : (
              sellerGroups.map(({ sellerId, sellerName, items: groupItems }) => {
                // Group variants of same product together
                type ProductGroup = { product: (typeof groupItems)[0]["product"]; productId: string; variants: typeof groupItems };
                const productMap = new Map<string, ProductGroup>();
                groupItems.forEach(item => {
                  if (!productMap.has(item.productId)) {
                    productMap.set(item.productId, { product: item.product, productId: item.productId, variants: [] });
                  }
                  productMap.get(item.productId)!.variants.push(item);
                });
                const productGroups = [...productMap.values()];

                const groupSubtotal = groupItems.reduce((sum, item) => {
                  const p = item.effectivePrice ?? parseFloat(item.product.price || "0");
                  return sum + p * item.quantity;
                }, 0);

                return (
                  <div key={sellerId} className="rounded-3xl border border-[#E6DCC8] overflow-hidden shadow-sm bg-white">
                    {/* Seller header */}
                    <div className="flex items-center justify-between px-6 py-4 bg-[#F5F1EB] border-b border-[#E6DCC8]">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#5A1E12]/10 flex items-center justify-center text-[#5A1E12] font-bold text-sm shrink-0">
                          {sellerName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-[#4A3728]">{sellerName}</span>
                        <span className="text-xs text-[#8B5E3C] bg-[#E6DCC8] px-2 py-0.5 rounded-full">
                          {productGroups.length} {productGroups.length === 1 ? "product" : "products"}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-[#4A3728]">${groupSubtotal.toFixed(2)}</span>
                    </div>

                    {/* Per-product blocks */}
                    <AnimatePresence>
                      {productGroups.map(({ productId, product, variants }, pIdx) => {
                        const couponState = productCoupons[productId] ?? makeFreshCouponState();

                        return (
                          <motion.div
                            key={productId}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -16 }}
                            transition={{ delay: pIdx * 0.04 }}
                            className="border-b border-[#F0EBE3] last:border-b-0"
                          >
                            {/* Combined product + variant rows */}
                            {variants.map((item) => {
                              const itemKey = item.variantId ? `${item.productId}:${item.variantId}` : item.productId;
                              const isUpdating = updatingItems.has(itemKey);
                              const effectivePrice = item.effectivePrice ?? parseFloat(item.product.price || "0");
                              const variantAttrs = item.variant?.attributes
                                ? Object.entries(item.variant.attributes as Record<string, { value: string; displayValue: string; hexColor?: string | null }>)
                                : null;

                              return (
                                <div
                                  key={itemKey}
                                  className="relative flex items-center gap-3 px-4 py-3 border-t border-[#F5F1EB] first:border-t-0 hover:bg-[#FAF7F2] transition-colors"
                                >
                                  {isUpdating && (
                                    <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                                      <Loader className="h-4 w-4 animate-spin text-[#8B5E3C]" />
                                    </div>
                                  )}

                                  {/* Product image */}
                                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#F5F1EB] shrink-0">
                                    <Image
                                      src={product.featuredImage || product.images?.[0] || "/images/placeholder.svg"}
                                      alt={product.title}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>

                                  {/* Title + category + variant chips */}
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-serif text-base font-semibold text-[#4A3728] leading-tight truncate">{product.title}</h3>
                                    {(product.category || productCategoryMap[productId]) && (
                                      <p className="text-xs text-[#8B5E3C] leading-none mt-0.5">{product.category || productCategoryMap[productId]}</p>
                                    )}
                                    {variantAttrs && variantAttrs.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {variantAttrs.map(([key, attr]) =>
                                          attr.hexColor ? (
                                            <span key={key} title={`${key}: ${attr.displayValue}`}
                                              className="inline-flex items-center gap-1 text-xs font-medium text-[#5A1E12] bg-[#EAD7B7]/50 border border-[#5A1E12]/15 rounded-full px-2 py-0.5">
                                              <span className="w-2 h-2 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: attr.hexColor }} />
                                              {attr.displayValue}
                                            </span>
                                          ) : (
                                            <span key={key} className="inline-flex items-center text-xs font-medium text-[#5A1E12] bg-[#EAD7B7]/50 border border-[#5A1E12]/15 rounded-full px-2 py-0.5">
                                              {attr.displayValue}
                                            </span>
                                          )
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* Qty stepper */}
                                  <div className="flex items-center bg-white rounded-xl border border-[#E6DCC8] p-0.5 shrink-0">
                                    <button
                                      onClick={() => handleQuantityUpdate(item.productId, item.quantity - 1, item.variantId)}
                                      disabled={item.quantity <= 1 || isUpdating}
                                      className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#FAF7F2] text-[#4A3728] disabled:opacity-30 transition-colors"
                                    >
                                      <Minus size={11} />
                                    </button>
                                    <span className="w-8 text-center text-base font-semibold text-[#4A3728]">{item.quantity}</span>
                                    <button
                                      onClick={() => handleQuantityUpdate(item.productId, item.quantity + 1, item.variantId)}
                                      disabled={(() => {
                                        const liveStock = stockMap[item.productId]?.stock;
                                        const stock = liveStock !== undefined ? liveStock : item.product.stock;
                                        return stock != null ? item.quantity >= stock : false;
                                      })() || isUpdating}
                                      className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#FAF7F2] text-[#4A3728] disabled:opacity-30 transition-colors"
                                    >
                                      <Plus size={11} />
                                    </button>
                                  </div>

                                  {/* Price */}
                                  <div className="text-right shrink-0 w-24">
                                    <p className="font-bold text-base text-[#4A3728]">${(effectivePrice * item.quantity).toFixed(2)}</p>
                                    <p className="text-xs text-[#8B5E3C]">${effectivePrice.toFixed(2)} each</p>
                                  </div>

                                  {/* Remove */}
                                  <button
                                    onClick={() => handleRemoveItem(item.productId, item.variantId)}
                                    disabled={isUpdating}
                                    className="p-1.5 text-[#D6C0A9] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              );
                            })}

                            {/* Per-product coupon section — dropdown only, no text input */}
                            <div className="px-4 py-2.5 bg-[#FDFCFA] border-t border-[#F0EBE3]">
                              {couponState.applied ? (
                                <div className="flex items-center gap-3 px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
                                  <CheckCircle className="h-3.5 w-3.5 text-green-600 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-green-800">{couponState.applied.code}</p>
                                    <p className="text-xs text-green-600">-${couponState.applied.savings.toFixed(2)} saved</p>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveCoupon(productId)}
                                    className="p-1 text-green-600 hover:text-red-500 rounded-lg transition-colors shrink-0"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  <button
                                    onClick={() => handleTogglePicker(productId, sellerId)}
                                    className="flex items-center gap-1.5 text-xs font-medium text-[#5A1E12] border border-[#5A1E12]/30 bg-white px-3 py-1.5 rounded-xl hover:bg-[#5A1E12] hover:text-white transition-colors"
                                  >
                                    {couponState.availableLoading ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Tag className="h-3 w-3" />
                                    )}
                                    Apply Coupon
                                    {couponState.showPicker ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                  </button>

                                  {couponState.error && (
                                    <p className="mt-1 text-xs text-red-500">{couponState.error}</p>
                                  )}

                                  <AnimatePresence>
                                    {couponState.showPicker && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.18 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="mt-2 rounded-xl border border-[#E6DCC8] bg-white overflow-hidden">
                                          <div className="px-3 py-1.5 bg-[#F5F1EB] border-b border-[#E6DCC8]">
                                            <p className="text-xs font-semibold text-[#8B5E3C] uppercase tracking-wide">Available Coupons</p>
                                          </div>
                                          {couponState.availableLoading ? (
                                            <div className="flex items-center justify-center py-4">
                                              <Loader2 className="h-4 w-4 animate-spin text-[#8B5E3C]" />
                                            </div>
                                          ) : couponState.availableCoupons.length === 0 ? (
                                            <p className="px-3 py-3 text-xs text-[#8B5E3C] text-center">No active coupons for this seller.</p>
                                          ) : (
                                            <ul className="divide-y divide-[#F0EBE3]">
                                              {[...couponState.availableCoupons]
                                                .sort((a, b) => {
                                                  const emap = couponState.eligibilityMap ?? {};
                                                  const score = (e: boolean | null | undefined) => e === true ? 0 : e === null ? 1 : 2;
                                                  return score(emap[a.code]) - score(emap[b.code]);
                                                })
                                                .map((c) => {
                                                  const eligibility = (couponState.eligibilityMap ?? {})[c.code];
                                                  const isChecking = eligibility === null;
                                                  const isIneligible = eligibility === false;
                                                  return (
                                                    <li key={c.id} className={`flex items-center gap-2 px-3 py-2 transition-colors ${isIneligible ? "bg-gray-50/80" : "hover:bg-[#FAF7F2]"}`}>
                                                      <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                          <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${isIneligible ? "text-gray-400 bg-gray-100" : "text-[#5A1E12] bg-[#EAD7B7]/60"}`}>
                                                            {c.code}
                                                          </span>
                                                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${isIneligible ? "text-gray-400 bg-gray-100" : "text-green-700 bg-green-50"}`}>
                                                            {getCouponLabel(c)}
                                                          </span>
                                                          {isChecking && <Loader2 className="h-3 w-3 animate-spin text-gray-400" />}
                                                          {eligibility === true && (
                                                            <span className="text-xs text-green-600 font-semibold">✓ Eligible</span>
                                                          )}
                                                          {isIneligible && (
                                                            <span className="text-xs text-red-400 font-medium">Not eligible</span>
                                                          )}
                                                        </div>
                                                        {c.expiresAt && (
                                                          <p className={`text-xs mt-0.5 ${isIneligible ? "text-gray-400" : "text-[#8B5E3C]"}`}>
                                                            Expires {new Date(c.expiresAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                                                          </p>
                                                        )}
                                                      </div>
                                                      <button
                                                        onClick={() => handlePickCoupon(productId, sellerId, c.code)}
                                                        disabled={couponState.loading || isIneligible || isChecking}
                                                        className={`shrink-0 text-xs font-semibold border px-2.5 py-1 rounded-lg transition-colors ${
                                                          isIneligible
                                                            ? "text-gray-300 border-gray-200 cursor-not-allowed"
                                                            : isChecking
                                                            ? "text-gray-400 border-gray-200 cursor-wait"
                                                            : "text-[#5A1E12] border-[#5A1E12]/30 hover:bg-[#5A1E12] hover:text-white disabled:opacity-50"
                                                        }`}
                                                      >
                                                        {couponState.loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Apply"}
                                                      </button>
                                                    </li>
                                                  );
                                                })}
                                            </ul>
                                          )}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>

          {/* --- RIGHT COLUMN: SUMMARY (Sticky) --- */}
          <div className="xl:sticky xl:top-22 h-fit">
            <div className="bg-[#EBE5D9] rounded-4xl p-8 shadow-lg border border-white/40 backdrop-blur-sm relative overflow-hidden">
                {/* Decorative background grain */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-white/20 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none" />

                {/* Refreshing overlay */}
                {(summaryRefreshing || refreshing) && (
                  <div className="absolute inset-0 z-50 rounded-4xl bg-[#EBE5D9]/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                    <Loader className="h-8 w-8 animate-spin text-[#8B5E3C]" />
                    <p className="text-sm font-medium text-[#6D5443]">Updating totals...</p>
                  </div>
                )}

                <div className="mb-8 relative z-10">
                    <h2 className="text-3xl font-serif text-[#2C1810]">Summary</h2>
                </div>

                {/* Shipping Selection */}
                <div className="space-y-3 mb-8 relative z-10">
                    <p className="text-sm font-semibold uppercase tracking-wider text-[#8B5E3C] mb-2">Shipping Method</p>
                    {cartData?.availableShipping.filter(s => !/cod|cash[\s_-]*on[\s_-]*delivery/i.test(s.name)).map((shipping) => (
                    <label
                        key={shipping.id}
                        className={`group cursor-pointer block relative p-4 rounded-xl border-2 transition-all duration-300 ${
                        selectedShipping?.id === shipping.id
                            ? "border-[#4A3728] bg-white shadow-md"
                            : "border-transparent bg-white/40 hover:bg-white/70"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedShipping?.id === shipping.id ? "border-[#4A3728]" : "border-[#D6C0A9]"}`}>
                                    {selectedShipping?.id === shipping.id && <div className="w-2.5 h-2.5 rounded-full bg-[#4A3728]" />}
                                </div>
                                <input
                                    type="radio"
                                    name="shipping"
                                    className="hidden"
                                    checked={selectedShipping?.id === shipping.id}
                                    onChange={() => setSelectedShipping(shipping)}
                                />
                                <div>
                                    <p className="font-bold text-[#4A3728] text-sm">{shipping.name}</p>
                                    <p className="text-xs text-[#8B5E3C]">{shipping.estimatedDays}</p>
                                </div>
                            </div>
                            <span className="font-bold text-[#4A3728]">
                                ${(Number(cartData?.shippingCalculations?.[shipping.id]?.totalShippingCost) || parseFloat(shipping.cost || "0")).toFixed(2)}
                            </span>
                        </div>
                    </label>
                    ))}
                </div>

                <div className="space-y-4 border-t border-[#D6C0A9]/30 pt-6 relative z-10">
                    <div className="flex justify-between text-[#6D5443]">
                        <span>Subtotal</span>
                        <span className="font-medium text-[#4A3728]">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[#6D5443]">
                        <span>Shipping</span>
                        <span className="font-medium text-[#4A3728]">${shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[#6D5443]">
                        <span>GST <span className="text-xs">(incl. {gstPercentage?.toFixed(1)}%)</span></span>
                        <span className="font-medium text-[#4A3728]">${gstAmount.toFixed(2)}</span>
                    </div>

                    {/* Per-product discount lines */}
                    {Object.entries(productCoupons).map(([pid, s]) =>
                      s.applied ? (
                        <div key={pid} className="flex justify-between text-green-700 bg-green-50/60 px-3 py-2 rounded-lg">
                          <span className="flex items-center gap-1.5 text-sm font-medium">
                            <Tag className="h-3.5 w-3.5 shrink-0" />
                            {s.applied.code}
                          </span>
                          <span className="font-bold text-sm">-${s.applied.savings.toFixed(2)}</span>
                        </div>
                      ) : null
                    )}

                    {/* Currency note */}
                    <div className="text-xs text-[#8B5E3C]/70 text-center pt-2 border-t border-[#D6C0A9]/20">
                        All prices are in AUD (Australian Dollars)
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t-2 border-white/50 relative z-10">
                    <div className="flex justify-between items-end mb-6">
                        <span className="text-lg font-bold text-[#4A3728]">Grand Total</span>
                        <div className="text-right">
                          {totalDiscount > 0 && (
                            <p className="text-xs text-green-600 font-medium mb-0.5">-${totalDiscount.toFixed(2)} saved</p>
                          )}
                          <span className="text-2xl font-serif font-bold text-[#2C1810]">
                            ${Math.max(0, grandTotal - totalDiscount).toFixed(2)}
                          </span>
                        </div>
                    </div>

                    <button
                        onClick={handleProceedToCheckout}
                        disabled={cartItems.length === 0}
                        className="group w-full py-4 bg-[#5A1E12] text-[#FAF7F2] rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-[#4a180f] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        Proceed to Checkout
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>

    {/* Guest Checkout Modal */}
    <AnimatePresence>
      {showCheckoutModal && (
        <motion.div
          key="checkout-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setShowCheckoutModal(false)}
        >
          <motion.div
            key="checkout-modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#FAF7F2] rounded-2xl shadow-2xl w-full max-w-md p-8"
          >
            {/* Close button */}
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-4 right-4 text-[#8B5E3C] hover:text-[#5A1E12] transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-[#5A1E12]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="h-7 w-7 text-[#5A1E12]" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#2C1810] mb-2">How would you like to proceed?</h2>
              <p className="text-sm text-[#8B5E3C]">
                You&apos;re currently not logged in. Please choose an option below to continue.
              </p>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                className="w-full py-3.5 bg-[#5A1E12] text-[#FAF7F2] rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-md hover:bg-[#4a180f] hover:scale-[1.02] active:scale-[0.98] transition-all"
                onClick={() => setShowCheckoutModal(false)}
              >
                <LogIn className="h-5 w-5" />
                Login to Your Account
              </Link>

              <button
                onClick={() => {
                  setShowCheckoutModal(false);
                  router.push("/checkout");
                }}
                className="w-full py-3.5 bg-white border-2 border-[#5A1E12] text-[#5A1E12] rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-[#5A1E12]/5 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <User className="h-5 w-5" />
                Continue as Guest
              </button>
            </div>

            <p className="text-center text-xs text-[#8B5E3C] mt-5">
              Logging in lets you track your orders and save your details for faster checkout.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    </motion.main>
  );
}
