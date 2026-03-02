"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Loader2, Tag, X, CheckCircle, ChevronRight } from "lucide-react";
import { useSharedEnhancedCart } from "@/hooks/useSharedEnhancedCart";
import { couponsApi, ValidatedCoupon } from "@/lib/api";
import { guestCartUtils } from "@/lib/guestCartUtils";
import GuestStripePaymentForm from "@/components/checkout/GuestStripePaymentForm";
import Link from "next/link";

const stripePromise = loadStripe(
  "pk_test_51SzBiiFXXR0MHwRIutvfNBi6ADMB8qZ5UNXswOwLzlIOgLfy1qVuTciKWGaBtWyJrDBkkZVVclg477Wv8KuEGdp800PKT4ny3K"
);

interface OrderSummary {
  subtotal: string;
  subtotalExGST?: string;
  shippingCost: string;
  gstPercentage: string;
  gstAmount: string;
  grandTotal: string;
  originalTotal?: string;
  couponCode?: string;
  discountAmount?: string;
}

export default function GuestCheckoutForm() {
  const router = useRouter();

  // ── Stripe redirect-return detection ─────────────────────────────────────
  // When a redirect-based method (Klarna, Zip, Link) completes, Stripe lands
  // back on this page with ?payment_intent=...&redirect_status=succeeded.
  // We must handle this BEFORE any other Stripe logic runs.
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(false);
  const [redirectError,        setRedirectError]        = useState<string | null>(null);

  useEffect(() => {
    const params         = new URLSearchParams(window.location.search);
    const redirectStatus = params.get("redirect_status");
    const paymentIntentId = params.get("payment_intent");

    if (!redirectStatus || !paymentIntentId) return; // normal first load

    if (redirectStatus === "succeeded") {
      setIsProcessingRedirect(true);
      const customerEmail = sessionStorage.getItem("guestEmail");
      const storedOrderId = sessionStorage.getItem("guestOrderId");

      if (!customerEmail) {
        setRedirectError("Could not find your session. Please check your email for order confirmation.");
        setIsProcessingRedirect(false);
        return;
      }

      // Confirm with backend — do NOT call stripe.confirmPayment() again
      fetch("https://alpa-be.onrender.com/api/payments/guest/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId, customerEmail }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            sessionStorage.removeItem("guestEmail");
            sessionStorage.removeItem("guestOrderId");
            guestCartUtils.clearGuestCart();
            sessionStorage.setItem("guestOrderId",    data.orderId || storedOrderId || "");
            sessionStorage.setItem("guestOrderEmail", customerEmail);
            router.push("/guest/order-success");
          } else {
            setRedirectError(data.message || "Payment confirmation failed. Please contact support.");
            setIsProcessingRedirect(false);
          }
        })
        .catch(() => {
          setRedirectError("Network error confirming payment. Please contact support.");
          setIsProcessingRedirect(false);
        });

    } else if (redirectStatus === "failed") {
      setRedirectError("Your payment was declined. Please try a different payment method.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Use the same cart hook the cart page uses ─────────────────────────────
  const {
    cartData,
    selectedShipping,
    setSelectedShipping,
    loading: cartLoading,
    calculateTotals,
  } = useSharedEnhancedCart();

  const cartItems = cartData?.cart || [];
  // Filter out COD options so guests only see real shipping methods
  const shippingMethods = (cartData?.availableShipping || []).filter(
    (s) => !/cod|cash[\s_-]*on[\s_-]*delivery/i.test(s.name)
  );
  const { subtotal, shippingCost, gstAmount, gstPercentage, grandTotal } = calculateTotals;

  // ── Form fields ───────────────────────────────────────────────────────────
  const [customerName,  setCustomerName]  = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [addressLine,   setAddressLine]   = useState("");
  const [city,          setCity]          = useState("");
  const [state,         setState]         = useState("");
  const [zipCode,       setZipCode]       = useState("");
  const [country,       setCountry]       = useState("Australia");

  // ── Coupon ────────────────────────────────────────────────────────────────
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<ValidatedCoupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Pre-populate coupon applied on the cart page
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cartAppliedCoupon");
      if (saved) setAppliedCoupon(JSON.parse(saved));
    } catch {}
  }, []);

  // ── Steps ─────────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<"form" | "payment">("form");

  // ── Stripe state ──────────────────────────────────────────────────────────
  const [clientSecret,          setClientSecret]          = useState<string | null>(null);
  const [paymentIntentId,       setPaymentIntentId]       = useState<string | null>(null);
  const [stripeAmount,          setStripeAmount]          = useState(0);
  const [stripeCurrency,        setStripeCurrency]        = useState("aud");
  const [confirmedOrderId,      setConfirmedOrderId]      = useState("");
  const [confirmedOrderSummary, setConfirmedOrderSummary] = useState<OrderSummary | null>(null);
  const [isCreatingIntent,      setIsCreatingIntent]      = useState(false);

  // ── Field errors ──────────────────────────────────────────────────────────
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Final total after coupon
  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const finalTotal     = Math.max(0, grandTotal - discountAmount);

  // ── Coupon handlers ───────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) { setCouponError("Please enter a coupon code."); return; }
    setCouponError("");
    setIsValidatingCoupon(true);
    try {
      const data = await couponsApi.validateCoupon(code, grandTotal);
      if (!data.success || !data.coupon) {
        setCouponError(data.message || "Invalid coupon code.");
        setAppliedCoupon(null);
        return;
      }
      setAppliedCoupon(data.coupon);
      localStorage.setItem("cartAppliedCoupon", JSON.stringify(data.coupon));
    } catch {
      setCouponError("Failed to validate coupon. Please try again.");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    localStorage.removeItem("cartAppliedCoupon");
  };

  // ── Form validation ───────────────────────────────────────────────────────
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!customerName.trim())  errors.customerName  = "Full name is required.";
    if (!customerEmail.trim()) errors.customerEmail = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail))
      errors.customerEmail = "Invalid email address.";
    if (!customerPhone.trim()) errors.customerPhone = "Phone number is required.";
    if (!addressLine.trim())   errors.addressLine   = "Address is required.";
    if (!city.trim())          errors.city          = "City is required.";
    if (!state.trim())         errors.state         = "State is required.";
    if (!zipCode.trim())       errors.zipCode       = "Postcode is required.";
    if (!selectedShipping)     errors.shippingMethodId = "Please select a shipping method.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Step A: Create PaymentIntent ──────────────────────────────────────────
  const handleContinueToPayment = async () => {
    if (!validateForm()) { toast.error("Please fill in all required fields."); return; }
    if (cartItems.length === 0) { toast.error("Your cart is empty."); return; }

    setIsCreatingIntent(true);
    try {
      const gstId = cartData?.gst?.id;
      const body: Record<string, unknown> = {
        items: cartItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        customerName:  customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        shippingAddress: {
          addressLine: addressLine.trim(),
          city:   city.trim(),
          state:  state.trim(),
          country,
          zipCode: zipCode.trim(),
        },
        shippingMethodId: selectedShipping!.id,
        country,
        city:         city.trim(),
        state:        state.trim(),
        zipCode:      zipCode.trim(),
        mobileNumber: customerPhone.trim(),
        ...(gstId && { gstId }),
        ...(appliedCoupon?.code && { couponCode: appliedCoupon.code }),
      };

      const res  = await fetch("https://alpa-be.onrender.com/api/payments/guest/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        const msg = data.message || data.error || "Failed to create payment. Please try again.";
        toast.error(msg);
        if (msg.toLowerCase().includes("coupon")) {
          setCouponError(msg); setAppliedCoupon(null); setCouponCode("");
        }
        return;
      }

      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      setStripeAmount(data.amount);
      setStripeCurrency(data.currency || "aud");
      setConfirmedOrderId(data.orderId);
      setConfirmedOrderSummary(data.orderSummary);
      setCurrentStep("payment");

      sessionStorage.setItem("guestOrderId",    data.orderId);
      sessionStorage.setItem("guestOrderEmail", customerEmail.trim());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to initiate payment.");
    } finally {
      setIsCreatingIntent(false);
    }
  };

  // ── Loading / empty states ────────────────────────────────────────────────
  // Redirect return: show a full-screen loader while we confirm with the backend
  if (isProcessingRedirect) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-[#5A1E12]/70">
        <Loader2 className="w-8 h-8 animate-spin text-[#5A1E12]" />
        <p className="text-lg font-medium">Confirming your payment…</p>
        <p className="text-sm">Please do not close this page.</p>
      </div>
    );
  }

  // Redirect return: payment failed or session expired
  if (redirectError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 max-w-md mx-auto text-center">
        <p className="text-[#5A1E12] text-lg font-semibold">Payment issue</p>
        <p className="text-sm text-[#5A1E12]/70">{redirectError}</p>
        <Link href="/checkout" className="px-6 py-3 bg-[#5A1E12] text-white rounded-lg font-medium hover:bg-[#441208] transition">
          Try Again
        </Link>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-[#5A1E12]/60">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading checkout...</span>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-[#5A1E12] text-lg font-medium">Your cart is empty.</p>
        <Link href="/shop" className="px-6 py-3 bg-[#5A1E12] text-white rounded-lg font-medium hover:bg-[#441208] transition">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row flex-1 min-h-screen bg-[#ead7b7]">

      {/* ================= LEFT: FORM / PAYMENT ================= */}
      <div className="flex-1 px-4 md:px-8 lg:px-12 pt-20 pb-8">

        {/* Breadcrumb + header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-[#5A1E12]/60 mb-4">
            <span className={currentStep === "form" ? "font-bold text-[#5A1E12]" : ""}>1. Your Details</span>
            <ChevronRight className="w-4 h-4" />
            <span className={currentStep === "payment" ? "font-bold text-[#5A1E12]" : ""}>2. Payment</span>
          </div>
          <h2 className="text-2xl font-bold text-[#5A1E12]">
            {currentStep === "form" ? "Guest Checkout" : "Complete Payment"}
          </h2>
          <p className="text-[#5A1E12]/60 text-sm mt-1">
            {currentStep === "form"
              ? "Fill in your details below to proceed."
              : "Enter your card details to securely complete your order."}
          </p>
          <p className="text-sm mt-2 text-[#5A1E12]/70">
            Have an account?{" "}
            <Link href="/login" className="underline font-semibold text-[#5A1E12] hover:text-[#441208]">Log in</Link>
            {" "}or{" "}
            <Link href="/signup" className="underline font-semibold text-[#5A1E12] hover:text-[#441208]">Create Account</Link>
          </p>
        </div>

        {/* STEP 1: FORM */}
        {currentStep === "form" && (
          <div className="space-y-6 bg-white rounded-2xl p-6 shadow-sm">

            {/* Personal Details */}
            <div>
              <h3 className="text-base font-semibold text-[#5A1E12] mb-4">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#5A1E12] mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Jane Doe"
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5A1E12] text-sm ${fieldErrors.customerName ? "border-red-400" : "border-[#5A1E12]/20"}`} />
                  {fieldErrors.customerName && <p className="mt-1 text-xs text-red-500">{fieldErrors.customerName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5A1E12] mb-1">Phone Number <span className="text-red-500">*</span></label>
                  <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="0400 000 000"
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5A1E12] text-sm ${fieldErrors.customerPhone ? "border-red-400" : "border-[#5A1E12]/20"}`} />
                  {fieldErrors.customerPhone && <p className="mt-1 text-xs text-red-500">{fieldErrors.customerPhone}</p>}
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-[#5A1E12] mb-1">Email Address <span className="text-red-500">*</span></label>
                <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="jane@example.com"
                  className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5A1E12] text-sm ${fieldErrors.customerEmail ? "border-red-400" : "border-[#5A1E12]/20"}`} />
                {fieldErrors.customerEmail && <p className="mt-1 text-xs text-red-500">{fieldErrors.customerEmail}</p>}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="border-t border-[#5A1E12]/10 pt-6">
              <h3 className="text-base font-semibold text-[#5A1E12] mb-4">Shipping Address</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#5A1E12] mb-1">Address Line <span className="text-red-500">*</span></label>
                  <input type="text" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} placeholder="123 Main St"
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5A1E12] text-sm ${fieldErrors.addressLine ? "border-red-400" : "border-[#5A1E12]/20"}`} />
                  {fieldErrors.addressLine && <p className="mt-1 text-xs text-red-500">{fieldErrors.addressLine}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#5A1E12] mb-1">City <span className="text-red-500">*</span></label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Sydney"
                      className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5A1E12] text-sm ${fieldErrors.city ? "border-red-400" : "border-[#5A1E12]/20"}`} />
                    {fieldErrors.city && <p className="mt-1 text-xs text-red-500">{fieldErrors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5A1E12] mb-1">State <span className="text-red-500">*</span></label>
                    <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="NSW"
                      className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5A1E12] text-sm ${fieldErrors.state ? "border-red-400" : "border-[#5A1E12]/20"}`} />
                    {fieldErrors.state && <p className="mt-1 text-xs text-red-500">{fieldErrors.state}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#5A1E12] mb-1">Postcode <span className="text-red-500">*</span></label>
                    <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="2000"
                      className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5A1E12] text-sm ${fieldErrors.zipCode ? "border-red-400" : "border-[#5A1E12]/20"}`} />
                    {fieldErrors.zipCode && <p className="mt-1 text-xs text-red-500">{fieldErrors.zipCode}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5A1E12] mb-1">Country</label>
                    <input type="text" value={country} onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-[#5A1E12]/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5A1E12] text-sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="border-t border-[#5A1E12]/10 pt-6">
              <h3 className="text-base font-semibold text-[#5A1E12] mb-4">Shipping Method</h3>
              {fieldErrors.shippingMethodId && <p className="mb-2 text-xs text-red-500">{fieldErrors.shippingMethodId}</p>}
              <div className="space-y-3">
                {shippingMethods.map((method) => (
                  <label key={method.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedShipping?.id === method.id ? "border-[#5A1E12] bg-[#5A1E12]/5" : "border-[#5A1E12]/15 hover:border-[#5A1E12]/40"
                    }`}>
                    <input type="radio" name="shippingMethod" checked={selectedShipping?.id === method.id}
                      onChange={() => setSelectedShipping(method)} className="accent-[#5A1E12]" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-[#3b1a08]">{method.name}</p>
                      {method.estimatedDays && (
                        <p className="text-xs text-[#5A1E12]/60">Est. {method.estimatedDays} business days</p>
                      )}
                    </div>
                    <span className="font-semibold text-sm text-[#5A1E12]">${parseFloat(method.cost).toFixed(2)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Coupon */}
            <div className="border-t border-[#5A1E12]/10 pt-6">
              <h3 className="text-base font-semibold text-[#5A1E12] mb-4">Coupon Code (Optional)</h3>
              {appliedCoupon ? (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-300 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="flex-1 text-sm font-medium text-green-700">
                    {appliedCoupon.code} — -${appliedCoupon.discountAmount.toFixed(2)} discount applied
                  </span>
                  <button onClick={handleRemoveCoupon} className="text-green-600 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input type="text" value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value); setCouponError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    placeholder="Enter coupon code" disabled={isValidatingCoupon}
                    className={`flex-1 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                      couponError ? "border-red-400 focus:ring-red-400" : "border-[#5A1E12]/20 focus:ring-[#5A1E12]"
                    }`} />
                  <button onClick={handleApplyCoupon} disabled={isValidatingCoupon || !couponCode.trim()}
                    className="px-4 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                    {isValidatingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Tag className="w-3.5 h-3.5 mr-1" />Apply</>}
                  </button>
                </div>
              )}
              {couponError && <p className="mt-1.5 text-xs text-red-500">{couponError}</p>}
            </div>

            {/* Continue button */}
            <div className="pt-2">
              <button onClick={handleContinueToPayment} disabled={isCreatingIntent}
                className="w-full py-4 bg-[#5A1E12] text-white font-bold rounded-xl hover:bg-[#3b1a08] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2">
                {isCreatingIntent ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Creating Order...</>
                ) : "Continue to Payment"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PAYMENT */}
        {currentStep === "payment" && clientSecret && paymentIntentId && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            {confirmedOrderSummary && (
              <div className="mb-6 p-4 bg-[#5A1E12]/5 rounded-xl border border-[#5A1E12]/15">
                <p className="text-sm text-[#5A1E12]/70">Amount to pay</p>
                <p className="text-3xl font-bold text-[#5A1E12]">
                  ${parseFloat(confirmedOrderSummary.grandTotal).toFixed(2)} AUD
                </p>
                {confirmedOrderSummary.discountAmount && parseFloat(confirmedOrderSummary.discountAmount) > 0 && (
                  <p className="text-sm text-green-600 mt-1">
                    Includes {confirmedOrderSummary.couponCode} coupon saving of ${parseFloat(confirmedOrderSummary.discountAmount).toFixed(2)}
                  </p>
                )}
              </div>
            )}
            <Elements stripe={stripePromise} options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: { colorPrimary: "#5A1E12", colorBackground: "#ffffff", colorText: "#3b1a08", borderRadius: "12px", fontFamily: "inherit" },
              },
            }}>
              <GuestStripePaymentForm
                paymentIntentId={paymentIntentId}
                customerEmail={customerEmail}
                amount={stripeAmount}
                currency={stripeCurrency}
                orderId={confirmedOrderId}
                onSuccess={() => router.push("/guest/order-success")}
                onError={(msg) => toast.error(msg)}
              />
            </Elements>
            <button onClick={() => setCurrentStep("form")}
              className="mt-4 w-full py-2.5 text-sm text-[#5A1E12]/70 hover:text-[#5A1E12] transition-colors">
              Back to Details
            </button>
          </div>
        )}
      </div>

      {/* ================= RIGHT: ORDER SUMMARY ================= */}
      <div className="w-full lg:w-96 xl:w-105 shrink-0">
        <div className="bg-white lg:rounded-tl-xl shadow-sm lg:sticky lg:top-0 lg:h-screen flex flex-col">

          <div className="px-6 pt-6 pb-4 border-b shrink-0">
            <h2 className="text-xl font-bold">Order Summary</h2>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
            <h3 className="font-medium mb-4 text-sm text-gray-500 uppercase tracking-wide">Items ({cartItems.length})</h3>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <Image src={item.product?.images?.[0] || "/images/placeholder.png"} alt={item.product?.title || "Product"} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{item.product?.title || "Product"}</p>
                    <p className="text-sm text-gray-500">Qty {item.quantity} x ${parseFloat(item.product?.price || "0").toFixed(2)}</p>
                  </div>
                  <p className="font-medium text-sm">${(item.quantity * parseFloat(item.product?.price || "0")).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 pb-6 pt-4 border-t shrink-0 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">GST (incl. {gstPercentage?.toFixed(1)}%)</span>
              <span>${gstAmount.toFixed(2)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-sm text-green-600 font-medium">
                <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" />Coupon {appliedCoupon.code}</span>
                <span>-${appliedCoupon.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
