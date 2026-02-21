"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";

const BASE_URL = "https://alpa-be-1.onrender.com";
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;

// Extend Window to hold the PayPal SDK
declare global {
  interface Window {
    paypal?: any;
  }
}

export interface PayPalAddressData {
  addressLine: string;
  city: string;
  state: string;
  zipCode: string;
  mobileNumber: string;
}

interface PayPalButtonProps {
  token: string;
  shippingMethodId: string;
  gstId?: string;
  address: PayPalAddressData;
  onSuccess: (orderId: string) => void;
  onError: (msg: string) => void;
}

/** Loads the PayPal JS SDK script once, resolves when ready. */
function loadPayPalScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Already loaded
    if (window.paypal) {
      resolve();
      return;
    }

    // Script already injected — wait for it
    const existing = document.querySelector(
      `script[data-paypal-sdk]`
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("PayPal SDK failed to load")));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=AUD`;
    script.setAttribute("data-paypal-sdk", "true");
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("PayPal SDK failed to load"));
    document.head.appendChild(script);
  });
}

export default function PayPalButton({
  token,
  shippingMethodId,
  gstId,
  address,
  onSuccess,
  onError,
}: PayPalButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonsRenderedRef = useRef(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Load the SDK on mount
  useEffect(() => {
    loadPayPalScript()
      .then(() => setSdkReady(true))
      .catch((err) => setSdkError(err.message ?? "Failed to load PayPal"));
  }, []);

  const renderButtons = useCallback(() => {
    if (!window.paypal || !containerRef.current || buttonsRenderedRef.current) return;

    // Clear any stale content
    containerRef.current.innerHTML = "";
    buttonsRenderedRef.current = true;

    window.paypal
      .Buttons({
        style: {
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "pay",
          height: 48,
        },
        // Skip the PayPal review step — user pays immediately after approval
        userAction: "PAY_NOW",

        // ── Step 1: create PayPal order on our backend ──────────────────────
        createOrder: async () => {
          setIsCreatingOrder(true);
          try {
            const res = await fetch(
              `${BASE_URL}/api/payments/paypal/create-order`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  shippingAddress: { addressLine: address.addressLine },
                  shippingMethodId,
                  ...(gstId ? { gstId } : {}),
                  country: "Australia",
                  city: address.city || "Sydney",
                  state: address.state || "NSW",
                  zipCode: address.zipCode,
                  mobileNumber: address.mobileNumber,
                }),
              }
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
              const msg =
                data.message ||
                (res.status === 400
                  ? "Invalid order details. Please check your information."
                  : "Failed to create PayPal order. Please try again.");
              onError(msg);
              throw new Error(msg);
            }

            return data.paypalOrderId; // SDK takes over from here
          } finally {
            setIsCreatingOrder(false);
          }
        },

        // ── Step 2: capture after user approves on PayPal popup ─────────────
        onApprove: async ({ orderID }: { orderID: string }) => {
          try {
            const res = await fetch(
              `${BASE_URL}/api/payments/paypal/capture-order`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ paypalOrderId: orderID }),
              }
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
              const msg =
                data.message ||
                (res.status === 400
                  ? "Payment capture failed. Please contact support."
                  : "Server error while confirming payment. Please try again.");
              onError(msg);
              return;
            }

            // Clear localStorage checkout keys before redirecting
            [
              "checkoutStep",
              "showGuestForm",
              "guestCheckoutData",
              "promoCode",
              "paymentMethod",
              "addressCartData",
              "addressPlaceId",
              "addressValidated",
            ].forEach((k) => localStorage.removeItem(k));

            onSuccess(data.orderId);
          } catch (err) {
            const msg =
              err instanceof Error
                ? err.message
                : "Unexpected error capturing payment.";
            onError(msg);
          }
        },

        onError: (err: unknown) => {
          console.error("PayPal SDK error:", err);
          onError("PayPal encountered an error. Please try again.");
        },

        onCancel: () => {
          // Non-fatal — user closed the PayPal popup
          // Toast handled by parent if needed; we just log
          console.info("PayPal payment cancelled by user.");
        },
      })
      .render(containerRef.current);
  }, [token, shippingMethodId, gstId, address, onSuccess, onError]);

  // Render buttons once the SDK is ready
  useEffect(() => {
    if (sdkReady) {
      renderButtons();
    }
  }, [sdkReady, renderButtons]);

  if (sdkError) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{sdkError}</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* SDK / order-creation loader */}
      {(!sdkReady || isCreatingOrder) && (
        <div className="flex items-center justify-center gap-2 py-4 text-[#5A1E12]/60 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>
            {isCreatingOrder ? "Creating your order…" : "Loading PayPal…"}
          </span>
        </div>
      )}

      {/* PayPal smart buttons mount here */}
      <div
        ref={containerRef}
        id="paypal-button-container"
        className={!sdkReady ? "opacity-0 pointer-events-none h-0 overflow-hidden" : ""}
      />

      {/* Fine-print */}
      {sdkReady && (
        <p className="text-center text-xs text-gray-400 pt-1">
          You will be redirected to PayPal to complete your payment securely.
        </p>
      )}
    </div>
  );
}
