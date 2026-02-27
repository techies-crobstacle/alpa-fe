"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Download, Package, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";

interface OrderItem {
  quantity: number;
  price: string;
  product: {
    title: string;
    images: string[];
  };
}

interface TrackOrder {
  id: string;
  status: string;
  totalAmount: string;
  customerName: string;
  shippingAddressLine: string;
  shippingCity: string;
  shippingState: string;
  shippingCountry: string;
  shippingZipCode: string;
  trackingNumber: string | null;
  estimatedDelivery: string | null;
  items: OrderItem[];
  createdAt: string;
}

const ORDER_STEPS = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [orderId, setOrderId] = useState(searchParams.get("orderId") || "");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [order, setOrder] = useState<TrackOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  // Pre-fill from sessionStorage if not in URL
  useEffect(() => {
    if (!orderId) {
      const id = sessionStorage.getItem("guestOrderId") || "";
      setOrderId(id);
    }
    if (!email) {
      const em = sessionStorage.getItem("guestOrderEmail") || "";
      setEmail(em);
    }
  }, [orderId, email]);

  // Auto-track if both values are pre-filled
  useEffect(() => {
    if (orderId && email) {
      handleTrack();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTrack = async () => {
    if (!orderId.trim() || !email.trim()) {
      setErrorMsg("Please enter both Order ID and Email.");
      return;
    }
    setIsLoading(true);
    setErrorMsg("");
    setOrder(null);
    try {
      const res = await fetch(
        `https://alpa-be.onrender.com/api/orders/guest/track?orderId=${encodeURIComponent(orderId.trim())}&customerEmail=${encodeURIComponent(email.trim())}`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Order not found.");
        return;
      }
      setOrder(data.order);
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    setIsDownloading(true);
    try {
      const url =
        `https://alpa-be.onrender.com/api/orders/guest/invoice` +
        `?orderId=${encodeURIComponent(orderId)}&customerEmail=${encodeURIComponent(email)}`;

      const res = await fetch(url);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Download failed" }));
        toast.error(err.message || "Invoice only available after DELIVERED status.");
        return;
      }

      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `invoice-${orderId}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      toast.error("Failed to download invoice. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const currentStepIndex = order
    ? ORDER_STEPS.indexOf(order.status as (typeof ORDER_STEPS)[number])
    : -1;

  return (
    <main className="min-h-screen bg-[#ead7b7] px-4 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-[#5A1E12]/10 transition-colors text-[#5A1E12]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#5A1E12]">Track Your Order</h1>
            <p className="text-sm text-[#5A1E12]/60">Enter your order ID and email to track your delivery</p>
          </div>
        </div>

        {/* Search form */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#5A1E12] mb-1">Order ID</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="cuid..."
                className="w-full px-4 py-3 border border-[#5A1E12]/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5A1E12] text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#5A1E12] mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full px-4 py-3 border border-[#5A1E12]/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5A1E12] text-sm"
              />
            </div>
            {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
            <button
              onClick={handleTrack}
              disabled={isLoading}
              className="w-full py-3 bg-[#5A1E12] text-white font-semibold rounded-xl hover:bg-[#441208] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Tracking…</>
              ) : (
                <><Package className="w-4 h-4" /> Track Order</>
              )}
            </button>
          </div>
        </div>

        {/* Order result */}
        {order && (
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
            {/* Status stepper */}
            <div>
              <h2 className="text-lg font-bold text-[#5A1E12] mb-4">Order Status</h2>
              <div className="flex items-center gap-0">
                {ORDER_STEPS.map((step, i) => {
                  const isCompleted = i <= currentStepIndex;
                  const isCurrent = i === currentStepIndex;
                  const isLast = i === ORDER_STEPS.length - 1;
                  return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCompleted
                              ? "bg-[#5A1E12] text-white"
                              : "bg-gray-100 text-gray-400"
                          } ${isCurrent ? "ring-2 ring-[#5A1E12] ring-offset-2" : ""}`}
                        >
                          {isCompleted ? "✓" : i + 1}
                        </div>
                        <span
                          className={`text-[10px] font-medium whitespace-nowrap ${
                            isCurrent ? "text-[#5A1E12]" : "text-gray-400"
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                      {!isLast && (
                        <div
                          className={`flex-1 h-0.5 mx-1 mb-4 ${
                            i < currentStepIndex ? "bg-[#5A1E12]" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order details */}
            <div className="border-t border-gray-100 pt-5 space-y-3">
              <h3 className="font-semibold text-[#5A1E12]">Order Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Order ID</p>
                  <p className="font-mono font-medium text-xs break-all">{order.id}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Total</p>
                  <p className="font-semibold">${parseFloat(order.totalAmount).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Customer</p>
                  <p className="font-medium">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Date</p>
                  <p>{new Date(order.createdAt).toLocaleDateString("en-AU")}</p>
                </div>
                {order.trackingNumber && (
                  <div className="col-span-2">
                    <p className="text-gray-500 text-xs">Tracking Number</p>
                    <p className="font-mono font-medium">{order.trackingNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping address */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="font-semibold text-[#5A1E12] mb-2 text-sm">Shipping To</h3>
              <p className="text-sm text-gray-600">
                {order.shippingAddressLine}, {order.shippingCity},{" "}
                {order.shippingState} {order.shippingZipCode},{" "}
                {order.shippingCountry}
              </p>
            </div>

            {/* Items */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="font-semibold text-[#5A1E12] mb-3 text-sm">
                Items ({order.items.length})
              </h3>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <Image
                        src={item.product?.images?.[0] || "/images/placeholder.png"}
                        alt={item.product?.title || "Product"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product?.title}</p>
                      <p className="text-xs text-gray-500">
                        Qty {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      ${(item.quantity * parseFloat(item.price)).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Download Invoice — only for DELIVERED */}
            {order.status === "DELIVERED" && (
              <div className="border-t border-gray-100 pt-5">
                <button
                  onClick={handleDownloadInvoice}
                  disabled={isDownloading}
                  className="flex items-center gap-2 px-5 py-3 bg-[#5A1E12] text-white font-medium rounded-xl hover:bg-[#441208] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                >
                  {isDownloading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Download Invoice
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/shop" className="text-sm text-[#5A1E12]/70 hover:text-[#5A1E12] underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function GuestTrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#ead7b7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#5A1E12]" />
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
