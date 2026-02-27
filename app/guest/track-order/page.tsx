"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Loader2, Download, Package, ArrowLeft, Search,
  CheckCircle2, Settings2, Truck, PackageCheck,
  MapPin, Hash, CalendarDays, User, Tag,
} from "lucide-react";
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

const ORDER_STEPS = [
  { key: "CONFIRMED",  label: "Confirmed",  icon: CheckCircle2 },
  { key: "PROCESSING", label: "Processing", icon: Settings2 },
  { key: "SHIPPED",    label: "Shipped",    icon: Truck },
  { key: "DELIVERED",  label: "Delivered",  icon: PackageCheck },
] as const;

function TrackOrderContent() {
  const searchParams = useSearchParams();

  const [orderId, setOrderId] = useState(searchParams.get("orderId") || "");
  const [email, setEmail]     = useState(searchParams.get("email")   || "");
  const [order, setOrder]     = useState<TrackOrder | null>(null);
  const [isLoading, setIsLoading]       = useState(false);
  const [errorMsg, setErrorMsg]         = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!orderId) setOrderId(sessionStorage.getItem("guestOrderId")    || "");
    if (!email)   setEmail  (sessionStorage.getItem("guestOrderEmail") || "");
  }, [orderId, email]);

  useEffect(() => {
    if (orderId && email) handleTrack();
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
      const res  = await fetch(
        `https://alpa-be.onrender.com/api/orders/guest/track?orderId=${encodeURIComponent(orderId.trim())}&customerEmail=${encodeURIComponent(email.trim())}`
      );
      const data = await res.json();
      if (!res.ok || !data.success) { setErrorMsg(data.message || "Order not found."); return; }
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
      const url = `https://alpa-be.onrender.com/api/orders/guest/invoice?orderId=${encodeURIComponent(orderId)}&customerEmail=${encodeURIComponent(email)}`;
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
    ? ORDER_STEPS.findIndex((s) => s.key === order.status)
    : -1;

  return (
    <div className="h-screen flex flex-col lg:flex-row font-sans overflow-hidden">

      {/* ─── LEFT PANEL ─────────────────────────────────────────────── */}
      <aside className="lg:w-[420px] xl:w-[460px] shrink-0 bg-[#5A1E12] flex flex-col h-full overflow-y-auto">

        {/* Top brand strip */}
        <div className="px-8 pt-10 pb-6 border-b border-white/10">
          <Link href="/" className="inline-flex items-center gap-2 text-[#ead7b7]/70 hover:text-[#ead7b7] text-sm transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[#ead7b7]/15 flex items-center justify-center">
              <Package className="w-5 h-5 text-[#ead7b7]" />
            </div>
            <span className="text-[#ead7b7]/50 text-xs font-semibold uppercase tracking-widest">Order Tracker</span>
          </div>
          <h1 className="text-3xl font-bold text-white mt-3 leading-tight">Track Your<br/>Delivery</h1>
          <p className="text-[#ead7b7]/60 text-sm mt-2">Enter your details below to see real-time status updates.</p>
        </div>

        {/* Search form */}
        <div className="px-8 py-8 flex-1">
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[#ead7b7]/50 mb-2">Order ID</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                placeholder="Enter your order ID"
                className="w-full bg-white/10 border border-white/15 text-white placeholder:text-white/30 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#ead7b7]/50 focus:ring-1 focus:ring-[#ead7b7]/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[#ead7b7]/50 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                placeholder="jane@example.com"
                className="w-full bg-white/10 border border-white/15 text-white placeholder:text-white/30 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#ead7b7]/50 focus:ring-1 focus:ring-[#ead7b7]/30 transition-all"
              />
            </div>

            {errorMsg && (
              <p className="text-red-300 text-sm bg-red-500/10 border border-red-400/20 rounded-lg px-4 py-2.5">{errorMsg}</p>
            )}

            <button
              onClick={handleTrack}
              disabled={isLoading}
              className="w-full py-3.5 bg-[#ead7b7] text-[#5A1E12] font-bold rounded-xl hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm"
            >
              {isLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Tracking…</>
                : <><Search className="w-4 h-4" /> Track Order</>
              }
            </button>
          </div>

        </div>

        {/* Bottom link */}
        <div className="px-8 pb-8">
          <Link href="/shop" className="text-xs text-[#ead7b7]/40 hover:text-[#ead7b7]/70 transition-colors">
            ← Continue Shopping
          </Link>
        </div>
      </aside>

      {/* ─── RIGHT PANEL ────────────────────────────────────────────── */}
      <main className="flex-1 bg-[#FAF7F2] overflow-y-auto h-full">

        {/* Empty state */}
        {!order && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center px-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-[#5A1E12]/8 flex items-center justify-center mb-6">
              <Package className="w-9 h-9 text-[#5A1E12]/40" />
            </div>
            <h2 className="text-xl font-bold text-[#5A1E12] mb-2">No order loaded yet</h2>
            <p className="text-sm text-[#5A1E12]/50 max-w-xs">Enter your Order ID and email on the left to see your delivery details here.</p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-[#5A1E12]/40 mx-auto mb-4" />
              <p className="text-sm text-[#5A1E12]/50">Fetching your order…</p>
            </div>
          </div>
        )}

        {/* Order details */}
        {order && !isLoading && (
          <div className="px-8 py-10 w-full">

            {/* Delivery Progress stepper — horizontal */}
            <div className="bg-white rounded-2xl border border-[#5A1E12]/8 p-6 mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#5A1E12]/40 mb-6">Delivery Progress</p>
              <div className="flex items-start">
                {ORDER_STEPS.map((step, i) => {
                  const isCompleted = i <= currentStepIndex;
                  const isCurrent   = i === currentStepIndex;
                  const isLast      = i === ORDER_STEPS.length - 1;
                  const StepIcon    = step.icon;
                  return (
                    <div key={step.key} className="flex items-start flex-1 last:flex-none">
                      {/* Step node + label */}
                      <div className="flex flex-col items-center gap-2 shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isCompleted ? "bg-[#5A1E12]" : "bg-[#5A1E12]/8 border border-[#5A1E12]/15"
                        } ${isCurrent ? "ring-2 ring-[#5A1E12]/30 ring-offset-2 ring-offset-white" : ""}`}>
                          <StepIcon className={`w-4 h-4 ${isCompleted ? "text-[#ead7b7]" : "text-[#5A1E12]/30"}`} />
                        </div>
                        <p className={`text-xs font-semibold text-center whitespace-nowrap ${
                          isCurrent ? "text-[#5A1E12]" : isCompleted ? "text-[#5A1E12]/60" : "text-[#5A1E12]/25"
                        }`}>
                          {step.label}
                        </p>
                        {isCurrent && (
                          <span className="text-[10px] text-[#5A1E12]/40 -mt-1">Now</span>
                        )}
                      </div>
                      {/* Connector line between steps */}
                      {!isLast && (
                        <div className="flex-1 h-0.5 mt-5 mx-2 relative">
                          <div className="absolute inset-0 bg-[#5A1E12]/10 rounded-full" />
                          <div
                            className="absolute inset-y-0 left-0 bg-[#5A1E12] rounded-full transition-all duration-700"
                            style={{ width: i < currentStepIndex ? "100%" : "0%" }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Page heading */}
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#5A1E12]/40 mb-1">Order Summary</p>
              <h2 className="text-2xl font-bold text-[#5A1E12]">Hello, {order.customerName.split(" ")[0]} 👋</h2>
              <p className="text-sm text-[#5A1E12]/50 mt-1">Here's the latest on your order.</p>
            </div>

            {/* Key stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              {[
                { icon: Hash,         label: "Order ID",  value: order.id.slice(0, 12) + "…" },
                { icon: CalendarDays, label: "Placed",    value: new Date(order.createdAt).toLocaleDateString("en-AU") },
                { icon: User,         label: "Customer",  value: order.customerName },
                { icon: Tag,          label: "Total",     value: `$${parseFloat(order.totalAmount).toFixed(2)}` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white rounded-2xl p-4 border border-[#5A1E12]/8">
                  <div className="w-8 h-8 rounded-lg bg-[#5A1E12]/8 flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4 text-[#5A1E12]" />
                  </div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5A1E12]/40 mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-[#5A1E12] truncate">{value}</p>
                </div>
              ))}
            </div>

            {/* Tracking number banner */}
            {order.trackingNumber && (
              <div className="flex items-center gap-3 bg-[#5A1E12]/5 border border-[#5A1E12]/10 rounded-2xl px-5 py-4 mb-8">
                <Truck className="w-5 h-5 text-[#5A1E12] shrink-0" />
                <div>
                  <p className="text-xs text-[#5A1E12]/50 font-medium">Tracking Number</p>
                  <p className="text-sm font-mono font-bold text-[#5A1E12]">{order.trackingNumber}</p>
                </div>
              </div>
            )}

            {/* Shipping address */}
            <div className="bg-white rounded-2xl border border-[#5A1E12]/8 p-6 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-[#5A1E12]" />
                <h3 className="text-sm font-bold text-[#5A1E12]">Shipping Address</h3>
              </div>
              <p className="text-sm text-[#5A1E12]/70 leading-relaxed">
                {order.shippingAddressLine}, {order.shippingCity},{" "}
                {order.shippingState} {order.shippingZipCode}, {order.shippingCountry}
              </p>
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl border border-[#5A1E12]/8 p-6 mb-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-[#5A1E12]">Items in this order</h3>
                <span className="text-xs bg-[#5A1E12]/8 text-[#5A1E12] font-semibold px-2.5 py-1 rounded-full">
                  {order.items.length} {order.items.length === 1 ? "item" : "items"}
                </span>
              </div>
              <div className="divide-y divide-[#5A1E12]/6">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#ead7b7]/40 shrink-0">
                      <Image
                        src={item.product?.images?.[0] || "/images/placeholder.png"}
                        alt={item.product?.title || "Product"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="font-semibold text-sm text-[#5A1E12] truncate">{item.product?.title}</p>
                      <p className="text-xs text-[#5A1E12]/50 mt-0.5">
                        Qty {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center shrink-0">
                      <p className="text-sm font-bold text-[#5A1E12]">
                        ${(item.quantity * parseFloat(item.price)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-[#5A1E12]/8 flex justify-between items-center">
                <span className="text-sm font-bold text-[#5A1E12]">Order Total</span>
                <span className="text-lg font-bold text-[#5A1E12]">${parseFloat(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>

            {/* Download Invoice — only for DELIVERED */}
            {order.status === "DELIVERED" && (
              <button
                onClick={handleDownloadInvoice}
                disabled={isDownloading}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-[#5A1E12] text-white font-semibold rounded-xl hover:bg-[#441208] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
              >
                {isDownloading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Download className="w-4 h-4" />
                }
                Download Invoice
              </button>
            )}
          </div>
        )}
      </main>
    </div>
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
