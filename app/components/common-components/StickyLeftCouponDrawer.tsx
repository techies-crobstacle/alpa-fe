"use client";

import { useState, useEffect } from "react";
import { X, Copy, Check, Tag } from "lucide-react";
import { useCoupons } from "@/app/hooks/useCoupons";

export function StickyLeftCouponDrawer() {
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Use React Query hook
  const { data: coupons = [], isLoading, error, refetch } = useCoupons();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open && !isLoading) {
      refetch();
    }
  }, [open]);

  // Handle copy to clipboard
  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Overlay - only show when drawer is open */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sticky Left Coupon Drawer Tab */}
      <div 
        className={`fixed left-0 top-1/2 transform -translate-y-1/2 z-50 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        {/* Drawer */}
        <div
          className="flex flex-col bg-white border-2 border-gray-200 shadow-2xl rounded-r-2xl w-72 max-h-96"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 bg-[#5A1E12] text-white border-b border-[#441208] rounded-tr-lg">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <h2 className="text-sm font-bold">Coupons</h2>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-0.5 hover:bg-[#441208] rounded transition"
              aria-label="Close coupons"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3">
            {isLoading && (
              <div className="text-xs text-gray-500 text-center py-2">
                Loading coupons...
              </div>
            )}
            {error && (
              <div className="text-xs text-red-500 text-center py-2">
                {error.message}
              </div>
            )}
            {!isLoading && !error && coupons.length === 0 && (
              <div className="text-xs text-gray-500 text-center py-2">
                No coupons available
              </div>
            )}
            {!isLoading && !error && coupons.length > 0 && (
              <div className="space-y-2">
                {coupons.map((coupon) => {
                  const couponId = (coupon.id || coupon._id) as string;
                  const isCopied = copiedId === couponId;
                  return (
                    <div
                      key={couponId}
                      className="p-2 border border-[#5A1E12]/20 rounded bg-[#EAD7B7]/20 hover:bg-[#EAD7B7]/40 transition"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1">
                          <div className="font-bold text-[#441208] text-sm">
                            {coupon.code}
                          </div>
                          <div className="text-xs text-[#5A1E12] line-clamp-1">
                            {coupon.description || coupon.discount || "Special Offer"}
                          </div>
                        </div>
                        <button
                          onClick={() => handleCopy(coupon.code, couponId)}
                          className="p-1 rounded hover:bg-[#EAD7B7] transition text-[#5A1E12] shrink-0"
                          title="Copy coupon code"
                        >
                          {isCopied ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {isCopied && (
                        <div className="text-xs text-green-600 font-medium">
                          ✓ Copied!
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Tab Button (visible when drawer is closed) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed left-0 top-1/2 transform -translate-y-1/2 z-50 w-10 h-28 bg-[#5A1E12] text-white flex flex-col items-center justify-center gap-1 rounded-r-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all outline-none"
          aria-label="Open coupons drawer"
          title="View Coupons"
        >
          <Tag className="w-4 h-4 mb-5" />
          <span className="text-xs font-bold transform -rotate-90 whitespace-nowrap mb-4">
            Coupons
          </span>
        </button>
      )}
    </>
  );
}
