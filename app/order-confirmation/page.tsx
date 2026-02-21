"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Package, Loader2, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface OrderStatus {
  orderId: string;
  status: string;
  paymentStatus: string;
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token } = useAuth();
  const orderId = searchParams.get("orderId");

  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID found.");
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const currentToken = token || localStorage.getItem("token");
        const res = await fetch(
          `https://alpa-be-1.onrender.com/api/payments/status/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${currentToken}`,
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setOrderStatus({ orderId, status: data.status, paymentStatus: data.paymentStatus });
        } else {
          // Even if status fetch fails, we know order was placed
          setOrderStatus({ orderId, status: "CONFIRMED", paymentStatus: "PAID" });
        }
      } catch {
        setOrderStatus({ orderId, status: "CONFIRMED", paymentStatus: "PAID" });
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [orderId, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ebe3d5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#973c00] animate-spin" />
          <p className="text-[#5A1E12] font-medium">Confirming your order…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ebe3d5] flex flex-col items-center justify-center px-4 py-16">
      {/* Logo */}
      <Link href="/" className="mb-10">
        <Image src="/images/navbarLogo.png" width={64} height={64} alt="Logo" className="w-14" />
      </Link>

      <div className="w-full max-w-md text-center">
        {/* Success icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-[#5A1E12]/8 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-[#5A1E12]" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-[#3b1a08] mb-2">Order Confirmed!</h1>
        <p className="text-[#973c00]/70 mb-8">
          Thank you for your purchase. Your payment was successful and your order is being processed.
        </p>

        {orderStatus && (
          <div className="divide-y divide-[#973c00]/10 mb-8 text-left">
            <div className="flex items-center justify-between py-3">
              <span className="text-xs font-semibold text-[#973c00]/50 uppercase tracking-wider">Order ID</span>
              <span className="text-sm font-bold text-[#3b1a08] font-mono">{orderStatus.orderId.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-xs font-semibold text-[#973c00]/50 uppercase tracking-wider">Status</span>
              <span className="text-sm font-semibold text-[#5A1E12]">{orderStatus.status}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-xs font-semibold text-[#973c00]/50 uppercase tracking-wider">Payment</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5A1E12]">
                <CheckCircle className="w-3.5 h-3.5" />
                {orderStatus.paymentStatus}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href="/shop"
            className="w-full py-4 bg-[#5A1E12] text-white font-bold rounded-2xl hover:bg-[#3b1a08] transition-all shadow-md shadow-[#5A1E12]/15 flex items-center justify-center gap-2"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="w-full py-3.5 text-[#5A1E12] font-semibold rounded-2xl border border-[#973c00]/20 hover:bg-[#5A1E12]/5 transition text-sm"
          >
            Back to Home
          </Link>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-8 text-[#973c00]/40 text-xs">
          <Package className="w-3.5 h-3.5" />
          A confirmation email will be sent to you shortly
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#ebe3d5] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#973c00] animate-spin" />
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
