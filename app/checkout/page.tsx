"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useSharedEnhancedCart } from "@/hooks/useSharedEnhancedCart";
import { guestCartUtils } from "@/lib/guestCartUtils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import EmailCart from "@/components/checkout/emailCart";
import AddressCart from "@/components/checkout/addressCart";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripePaymentForm from "@/components/checkout/StripePaymentForm";
import PayPalButton from "@/components/checkout/PayPalButton";
import { Loader2 } from "lucide-react";

const stripePromise = loadStripe(
  "pk_test_51SzBiiFXXR0MHwRIutvfNBi6ADMB8qZ5UNXswOwLzlIOgLfy1qVuTciKWGaBtWyJrDBkkZVVclg477Wv8KuEGdp800PKT4ny3K"
);

export default function CheckOutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // Start from Email step (optional)
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  // Guest checkout required fields
  const [guestEmail, setGuestEmail] = useState("");
  const [guestFirstName, setGuestFirstName] = useState("");
  const [guestLastName, setGuestLastName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingStreet, setShippingStreet] = useState("");
  const [shippingSuburb, setShippingSuburb] = useState("");
  const [shippingPostcode, setShippingPostcode] = useState("");
  const [shippingFullAddress, setShippingFullAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingZipCode, setShippingZipCode] = useState("");
  const [shippingCountry, setShippingCountry] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // ── Stripe payment state ──────────────────────────────────────────────────
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [stripeAmount, setStripeAmount] = useState(0);
  const [stripeCurrency, setStripeCurrency] = useState("aud");
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);

  const { cartData, selectedShipping, calculateTotals } =
    useSharedEnhancedCart();
  const { token, loading, user } = useAuth();

  // Track the name entered in step 1 for personalised headings
  const [userName, setUserName] = useState("");

  // Get cart items and totals from enhanced cart
  const cartItems = cartData?.cart || [];
  const { subtotal, shippingCost, gstAmount, grandTotal, gstPercentage } =
    calculateTotals;

  // Load checkout data from localStorage on mount
  useEffect(() => {
    const savedStep = localStorage.getItem("checkoutStep");
    const savedGuestForm = localStorage.getItem("showGuestForm");
    const savedGuestData = localStorage.getItem("guestCheckoutData");
    const savedPromoCode = localStorage.getItem("promoCode");
    const savedPaymentMethod = localStorage.getItem("paymentMethod");

    if (savedStep) {
      setStep(parseInt(savedStep, 10));
    }
    if (savedGuestForm) {
      setShowGuestForm(JSON.parse(savedGuestForm));
    }
    if (savedGuestData) {
      try {
        const guestData = JSON.parse(savedGuestData);
        setGuestEmail(guestData.guestEmail || "");
        setGuestFirstName(guestData.guestFirstName || "");
        setGuestLastName(guestData.guestLastName || "");
        setGuestPhone(guestData.guestPhone || "");
        setShippingStreet(guestData.shippingStreet || "");
        setShippingCity(guestData.shippingCity || "");
        setShippingState(guestData.shippingState || "");
        setShippingZipCode(guestData.shippingZipCode || "");
      } catch (error) {
        console.error("Failed to load guest data:", error);
      }
    }
    if (savedPromoCode) {
      setPromoCode(savedPromoCode);
    }
    if (savedPaymentMethod) {
      setPaymentMethod(savedPaymentMethod);
    }
  }, []);

  // Save checkout data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("checkoutStep", step.toString());
  }, [step]);

  useEffect(() => {
    localStorage.setItem("showGuestForm", JSON.stringify(showGuestForm));
  }, [showGuestForm]);

  useEffect(() => {
    localStorage.setItem(
      "guestCheckoutData",
      JSON.stringify({
        guestEmail,
        guestFirstName,
        guestLastName,
        guestPhone,
        shippingStreet,
        shippingCity,
        shippingState,
        shippingZipCode,
      }),
    );
  }, [
    guestEmail,
    guestFirstName,
    guestLastName,
    guestPhone,
    shippingStreet,
    shippingCity,
    shippingState,
    shippingZipCode,
  ]);

  useEffect(() => {
    localStorage.setItem("promoCode", promoCode);
  }, [promoCode]);

  useEffect(() => {
    localStorage.setItem("paymentMethod", paymentMethod);
  }, [paymentMethod]);

  /* ---------------- PRICE LOGIC (from enhanced cart) ---------------- */
  const shipping = shippingCost;
  const tax = gstAmount;
  const total = grandTotal;

  /* ---------------- STEP HANDLERS ---------------- */
  const handleNext = () => {
    setStep((s) => Math.min(3, s + 1));
  };
  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handleAddressChange = (data: {
    address: string;
    city: string;
    zip: string;
    state: string;
    country: string;
    phoneNumber: string;
  }) => {
    setShippingAddress(data.address);
    setShippingCity(data.city);
    setShippingZipCode(data.zip);
    setShippingState(data.state);
    setShippingCountry(data.country);
    setMobileNumber(data.phoneNumber);
  };

  const handlePromoSubmit = () => {
    console.log("Promo applied:", promoCode);
  };

  // ── Stripe: create payment intent ────────────────────────────────────────
  const handleCreateIntent = async () => {
    const currentToken = token || localStorage.getItem("token");
    if (!currentToken) {
      toast.error("Your session has expired. Please log in again.");
      return;
    }
    if (!selectedShipping) {
      toast.error("Please select a shipping method.");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setIsCreatingIntent(true);
    try {
      // Read address details saved by AddressCart into localStorage
      let addrLine  = shippingFullAddress || shippingStreet;
      let addrCity  = shippingCity;
      let addrState = shippingState;
      let addrZip   = shippingZipCode || shippingPostcode;
      let addrPhone = mobileNumber;
      try {
        const saved = localStorage.getItem("addressCartData");
        if (saved) {
          const d = JSON.parse(saved);
          addrLine  = addrLine  || d.address      || "";
          addrCity  = addrCity  || d.city         || "Sydney";
          addrState = addrState || d.state        || "NSW";
          addrZip   = addrZip   || d.zip          || "";
          addrPhone = addrPhone || d.phoneNumber  || "";
        }
      } catch {}

      const res = await fetch(
        "https://alpa-be-1.onrender.com/api/payments/create-intent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
          body: JSON.stringify({
            shippingAddress: { addressLine: addrLine },
            shippingMethodId: selectedShipping.id,
            country: "Australia",
            city: addrCity || "Sydney",
            state: addrState || "NSW",
            zipCode: addrZip,
            mobileNumber: addrPhone,
          }),
        }
      );

      if (!res.ok) {
        let msg = "Failed to create payment. Please try again.";
        try {
          const err = await res.json();
          msg = err.message || err.error || msg;
        } catch {}
        toast.error(msg);
        return;
      }

      const data = await res.json();
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      setStripeAmount(data.amount);
      setStripeCurrency(data.currency || "aud");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to initiate payment.");
    } finally {
      setIsCreatingIntent(false);
    }
  };

  // ── PayPal: build address from state + AddressCart localStorage ─────────
  const getPaypalAddress = () => {
    let addrLine  = shippingFullAddress || shippingStreet;
    let addrCity  = shippingCity;
    let addrState = shippingState;
    let addrZip   = shippingZipCode || shippingPostcode;
    let addrPhone = mobileNumber;
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("addressCartData") : null;
      if (saved) {
        const d = JSON.parse(saved);
        addrLine  = addrLine  || d.address      || "";
        addrCity  = addrCity  || d.city         || "Sydney";
        addrState = addrState || d.state        || "NSW";
        addrZip   = addrZip   || d.zip          || "";
        addrPhone = addrPhone || d.phoneNumber  || "";
      }
    } catch {}
    return {
      addressLine : addrLine,
      city        : addrCity,
      state       : addrState,
      zipCode     : addrZip,
      mobileNumber: addrPhone,
    };
  };

  const handlePlaceOrder = async () => {
    if (showGuestForm) {
      if (
        !guestEmail.trim() ||
        !guestFirstName.trim() ||
        !guestLastName.trim() ||
        !guestPhone.trim() ||
        !shippingStreet.trim() ||
        !shippingCity.trim() ||
        !shippingState.trim() ||
        !shippingZipCode.trim() ||
        !paymentMethod
      ) {
        toast.error("Please complete all required guest checkout fields");
        return;
      }
    } else {
      if (
        !shippingAddress.trim() ||
        !paymentMethod ||
        !shippingCity.trim() ||
        !shippingState.trim() ||
        !shippingZipCode.trim() ||
        !shippingCountry.trim() ||
        !mobileNumber.trim()
      ) {
        toast.error("Please complete all required fields");
        return;
      }
    }

    if (!selectedShipping) {
      toast.error("Please select a shipping method");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty. Please add items before placing an order");
      return;
    }

    setIsPlacingOrder(true);
    try {
      let response;

      const shippingMethodId = selectedShipping?.id;
      const gstId = cartData?.gst?.id;

      console.log("=== ORDER PLACEMENT DEBUG ===");
      console.log("cartData.availableShipping:", cartData?.availableShipping);
      console.log("selectedShipping:", selectedShipping);
      console.log("shippingMethodId:", shippingMethodId);
      console.log("cartData.gst:", cartData?.gst);
      console.log("gstId:", gstId);
      console.log("showGuestForm:", showGuestForm);

      if (showGuestForm) {
        const guestCartItems = guestCartUtils.getGuestCart();

        const requestBody = {
          items: guestCartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          customerName: `${guestFirstName} ${guestLastName}`,
          customerEmail: guestEmail,
          customerPhone: guestPhone,
          shippingAddress: {
            street: shippingStreet,
            city: shippingCity,
            state: shippingState,
            zipCode: shippingZipCode,
          },
          paymentMethod: paymentMethod,
          shippingMethodId: shippingMethodId,
          ...(gstId && { gstId }),
        };

        response = await fetch(
          "https://alpa-be-1.onrender.com/api/orders/guest/checkout",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          },
        );
      } else {
        const currentToken = token || localStorage.getItem("token");

        if (!currentToken) {
          toast.error("Your session has expired. Please log in again.");
          return;
        }

        const { subtotal, shippingCost, gstAmount, grandTotal, gstPercentage } =
          calculateTotals;

        const orderSummary = {
          subtotal: subtotal.toFixed(2),
          gstAmount: gstAmount.toFixed(2),
          grandTotal: grandTotal.toFixed(2),
          gstDetails: cartData?.calculations?.gstDetails || cartData?.gst,
          shippingCost: shippingCost.toFixed(2),
          gstPercentage: gstPercentage.toFixed(2),
          shippingMethod: {
            id: selectedShipping?.id,
            cost: parseFloat(selectedShipping?.cost || "0"),
            name: selectedShipping?.name,
            estimatedDays: selectedShipping?.estimatedDays,
          },
        };

        response = await fetch(
          "https://alpa-be-1.onrender.com/api/orders/create",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentToken}`,
            },
            body: JSON.stringify({
              shippingAddress: {
                address: shippingAddress,
              },
              shippingAddressLine: shippingAddress,
              shippingCity: shippingCity,
              shippingState: shippingState,
              shippingZipCode: shippingZipCode,
              shippingCountry: shippingCountry,
              shippingPhone: mobileNumber,
              customerPhone: mobileNumber,
              paymentMethod: paymentMethod,
              shippingMethodId: shippingMethodId,
              orderSummary: orderSummary,
              ...(gstId && { gstId }),
            }),
          },
        );
      }

      if (response.ok) {
        toast.dismiss();
        toast.success("Order placed successfully!");

        if (showGuestForm) {
          guestCartUtils.clearGuestCart();
        }

        localStorage.removeItem("checkoutStep");
        localStorage.removeItem("showGuestForm");
        localStorage.removeItem("guestCheckoutData");
        localStorage.removeItem("promoCode");
        localStorage.removeItem("paymentMethod");
        localStorage.removeItem("addressCartData");
        localStorage.removeItem("addressPlaceId");
        localStorage.removeItem("addressValidated");

        setTimeout(() => {
          router.push("/");
        }, 2500);
      } else {
        if (response.status === 401 || response.status === 403) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setTimeout(() => router.push("/login"), 2000);
          return;
        }

        let errorMessage = "Failed to place order";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }

        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <section className="relative min-h-screen bg-[#ead7b7] flex flex-col">
      {/* Absolute logo top-left */}
      <Link
        href="/"
        className="absolute top-5 left-5 z-50 font-bold transition-transform hover:scale-105 active:scale-95"
      >
        <Image
          src="/images/navbarLogo.png"
          width={500}
          height={500}
          alt="Logo"
          className="w-10 md:w-16"
          priority
        />
      </Link>

      <div className="flex flex-col lg:flex-row flex-1">
          {/* ================= LEFT: STEPS ================= */}
          <div className="flex-1 px-4 md:px-8 lg:px-12 pt-20 pb-8 overflow-x-hidden no-scrollbar">
            <div className="p-6">

              {/* Guest Checkout Form */}
              {showGuestForm ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-6 border-b border-[#5A1E12]/10 pb-4">
                    <h3 className="text-2xl font-bold text-[#5A1E12]">
                      Guest Checkout Details
                    </h3>
                    <button
                      className="text-sm font-medium text-[#5A1E12]/70 hover:text-[#5A1E12] transition-colors"
                      onClick={() => setShowGuestForm(false)}
                    >
                      ← Back to Login
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[#5A1E12]">First Name</label>
                      <input
                        type="text"
                        value={guestFirstName}
                        onChange={(e) => setGuestFirstName(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-[#5A1E12]/20 rounded-lg focus:outline-none focus:border-[#5A1E12] focus:ring-1 focus:ring-[#5A1E12] transition-all"
                        placeholder="John"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[#5A1E12]">Last Name</label>
                      <input
                        type="text"
                        value={guestLastName}
                        onChange={(e) => setGuestLastName(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-[#5A1E12]/20 rounded-lg focus:outline-none focus:border-[#5A1E12] focus:ring-1 focus:ring-[#5A1E12] transition-all"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#5A1E12]">Email</label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-[#5A1E12]/20 rounded-lg focus:outline-none focus:border-[#5A1E12] focus:ring-1 focus:ring-[#5A1E12] transition-all"
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#5A1E12]">Phone</label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-[#5A1E12]/20 rounded-lg focus:outline-none focus:border-[#5A1E12] focus:ring-1 focus:ring-[#5A1E12] transition-all"
                      placeholder="+1 (555) 000-0000"
                      required
                    />
                  </div>

                  <div className="border-t border-[#5A1E12]/10 pt-6 mt-6">
                    <h4 className="text-lg font-semibold text-[#5A1E12] mb-4">Shipping Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[#5A1E12]">Street Address</label>
                        <input
                          type="text"
                          value={shippingStreet}
                          onChange={(e) => setShippingStreet(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-[#5A1E12]/20 rounded-lg focus:outline-none focus:border-[#5A1E12] focus:ring-1 focus:ring-[#5A1E12] transition-all"
                          placeholder="123 Main St"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[#5A1E12]">City</label>
                        <input
                          type="text"
                          value={shippingCity}
                          onChange={(e) => setShippingCity(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-[#5A1E12]/20 rounded-lg focus:outline-none focus:border-[#5A1E12] focus:ring-1 focus:ring-[#5A1E12] transition-all"
                          placeholder="New York"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[#5A1E12]">State / Province</label>
                        <input
                          type="text"
                          value={shippingState}
                          onChange={(e) => setShippingState(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-[#5A1E12]/20 rounded-lg focus:outline-none focus:border-[#5A1E12] focus:ring-1 focus:ring-[#5A1E12] transition-all"
                          placeholder="NY"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[#5A1E12]">Zip / Postal Code</label>
                        <input
                          type="text"
                          value={shippingZipCode}
                          onChange={(e) => setShippingZipCode(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-[#5A1E12]/20 rounded-lg focus:outline-none focus:border-[#5A1E12] focus:ring-1 focus:ring-[#5A1E12] transition-all"
                          placeholder="10001"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      className="w-full px-8 py-4 bg-[#5A1E12] text-white rounded-lg font-bold text-lg hover:bg-[#441208] shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => {
                        if (
                          !guestFirstName.trim() ||
                          !guestLastName.trim() ||
                          !guestEmail.trim() ||
                          !guestPhone.trim() ||
                          !shippingStreet.trim() ||
                          !shippingCity.trim() ||
                          !shippingState.trim() ||
                          !shippingZipCode.trim()
                        ) {
                          toast.error("Please fill all guest checkout fields");
                          return;
                        }
                        setStep(3);
                      }}
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              ) : (
                // Normal 3-step checkout form
                <div className="relative min-h-100">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* <h2 className="text-2xl font-bold mb-6 text-[#5A1E12]">Contact Information</h2> */}
                        <EmailCart onEmailChange={() => {}} onNameChange={setUserName} />
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h2 className="text-2xl font-bold mb-2 text-[#5A1E12]">
                          Hi {(userName || user?.name || "").split(" ")[0] || "there"},
                        </h2>
                        <p className="text-[#5A1E12]/70 mb-6 text-sm">Please provide your address details so we can deliver to you.</p>
                        <div>
                          <AddressCart
                            key="address-cart-step2"
                            onAddressChange={handleAddressChange}
                          />
                        </div>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {clientSecret && paymentIntentId ? (
                          // ── Stripe payment UI ──────────────────────────
                          <div>
                            <div className="mb-6">
                              <h2 className="text-2xl font-bold text-[#5A1E12]">Complete Payment</h2>
                              <p className="text-[#5A1E12]/60 text-sm mt-1">Enter your card details to securely complete your order</p>
                            </div>
                            <Elements
                              stripe={stripePromise}
                              options={{
                                clientSecret,
                                appearance: {
                                  theme: "stripe",
                                  variables: {
                                    colorPrimary: "#5A1E12",
                                    colorBackground: "#ffffff",
                                    colorText: "#3b1a08",
                                    borderRadius: "12px",
                                    fontFamily: "inherit",
                                  },
                                },
                              }}
                            >
                              <StripePaymentForm
                                paymentIntentId={paymentIntentId}
                                token={token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || ""}
                                amount={stripeAmount}
                                currency={stripeCurrency}
                                onSuccess={(orderId) => {
                                  localStorage.removeItem("checkoutStep");
                                  localStorage.removeItem("showGuestForm");
                                  localStorage.removeItem("guestCheckoutData");
                                  localStorage.removeItem("promoCode");
                                  localStorage.removeItem("paymentMethod");
                                  localStorage.removeItem("addressCartData");
                                  localStorage.removeItem("addressPlaceId");
                                  localStorage.removeItem("addressValidated");
                                  router.push(`/order-confirmation?orderId=${orderId}`);
                                }}
                                onError={(msg) => toast.error(msg)}
                              />
                            </Elements>
                          </div>
                        ) : (
                          // ── Payment method selection ──────────────────────────
                          <div>
                            <div className="mb-8">
                              <div className="flex items-center gap-3 mb-1">
                                <div className="w-10 h-10 rounded-full bg-[#5A1E12]/10 flex items-center justify-center shrink-0">
                                  <svg className="w-5 h-5 text-[#5A1E12]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                  </svg>
                                </div>
                                <div>
                                  <h2 className="text-2xl font-bold text-[#5A1E12]">Payment Method</h2>
                                  <p className="text-[#5A1E12]/55 text-sm">Choose how you&apos;d like to complete your purchase</p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              {/* Stripe / Credit Card */}
                              <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                paymentMethod === "stripe"
                                  ? "border-[#5A1E12] bg-[#5A1E12]/5 shadow-sm"
                                  : "border-[#5A1E12]/15 hover:border-[#5A1E12]/40 hover:bg-[#5A1E12]/2"
                              }`}>
                                <input
                                  type="radio"
                                  name="paymentMethodSelect"
                                  value="stripe"
                                  checked={paymentMethod === "stripe"}
                                  onChange={() => setPaymentMethod("stripe")}
                                  className="accent-[#5A1E12] w-4 h-4 shrink-0"
                                />
                                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#635bff] to-[#4a44cc] flex items-center justify-center shrink-0 shadow-sm">
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-[#3b1a08] text-sm">Credit / Debit Card</p>
                                  <p className="text-xs text-gray-400 mt-0.5">Visa, Mastercard, Amex &middot; Powered by Stripe</p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded tracking-wide">VISA</span>
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-100 text-red-700 rounded tracking-wide">MC</span>
                                </div>
                              </label>

                              {/* PayPal */}
                              <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                paymentMethod === "paypal"
                                  ? "border-[#5A1E12] bg-[#5A1E12]/5 shadow-sm"
                                  : "border-[#5A1E12]/15 hover:border-[#5A1E12]/40 hover:bg-[#5A1E12]/2"
                              }`}>
                                <input
                                  type="radio"
                                  name="paymentMethodSelect"
                                  value="paypal"
                                  checked={paymentMethod === "paypal"}
                                  onChange={() => setPaymentMethod("paypal")}
                                  className="accent-[#5A1E12] w-4 h-4 shrink-0"
                                />
                                <div className="w-10 h-10 rounded-lg bg-[#003087] flex items-center justify-center shrink-0 shadow-sm">
                                  <span className="text-white font-extrabold text-xs tracking-tight">PP</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-[#3b1a08] text-sm">PayPal</p>
                                  <p className="text-xs text-gray-400 mt-0.5">Pay securely with your PayPal balance or linked card</p>
                                </div>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-900/10 text-[#003087] rounded shrink-0 tracking-wide">PayPal</span>
                              </label>

                              {/* Cash on Delivery */}
                              <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                paymentMethod === "cod"
                                  ? "border-[#5A1E12] bg-[#5A1E12]/5 shadow-sm"
                                  : "border-[#5A1E12]/15 hover:border-[#5A1E12]/40 hover:bg-[#5A1E12]/2"
                              }`}>
                                <input
                                  type="radio"
                                  name="paymentMethodSelect"
                                  value="cod"
                                  checked={paymentMethod === "cod"}
                                  onChange={() => setPaymentMethod("cod")}
                                  className="accent-[#5A1E12] w-4 h-4 shrink-0"
                                />
                                <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-[#3b1a08] text-sm">Cash on Delivery</p>
                                  <p className="text-xs text-gray-400 mt-0.5">Pay in cash when your order arrives at the door</p>
                                </div>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded shrink-0 tracking-wide">COD</span>
                              </label>
                            </div>

                            {/* Security assurance */}
                            <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              <span>All transactions are encrypted and secured with 256-bit SSL</span>
                            </div>

                            {/* ── PayPal smart buttons (rendered inline when PayPal is selected) ── */}
                            {paymentMethod === "paypal" && (
                              <div className="mt-6 pt-6 border-t border-[#5A1E12]/10">
                                <p className="text-xs text-[#5A1E12]/50 mb-3 text-center uppercase tracking-widest font-medium">Complete payment with PayPal</p>
                                <PayPalButton
                                  token={token || (typeof window !== "undefined" ? localStorage.getItem("token") : "") || ""}
                                  shippingMethodId={selectedShipping?.id || ""}
                                  gstId={cartData?.gst?.id}
                                  address={getPaypalAddress()}
                                  onSuccess={(orderId) => router.push(`/order-confirmation?orderId=${orderId}`)}
                                  onError={(msg) => toast.error(msg)}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* NAV BUTTONS */}
                  <div className="flex justify-between mt-8 pt-6">
                    <button
                      onClick={handleBack}
                      disabled={step === 1}
                      className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                        step === 1
                          ? "opacity-0 pointer-events-none"
                          : "text-[#5A1E12] border border-[#5A1E12] hover:bg-[#5A1E12] hover:text-white"
                      }`}
                    >
                      Back
                    </button>

                    {step < 3 ? (
                      <button
                        onClick={handleNext}
                        disabled={
                          cartItems.length === 0 ||
                          (step === 2 && !shippingAddress.trim())
                        }
                        className="px-8 py-3 bg-[#5A1E12] text-white rounded-lg font-medium hover:bg-[#441208] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                      >
                        Continue
                      </button>
                    ) : !clientSecret ? (
                      // PayPal: smart buttons appear inline above — no nav button needed
                      paymentMethod === "paypal" ? null
                      // COD: place order directly
                      : paymentMethod === "cod" ? (
                        <button
                          onClick={handlePlaceOrder}
                          disabled={isPlacingOrder || cartItems.length === 0}
                          className="px-8 py-3 bg-[#5A1E12] text-white rounded-lg font-medium hover:bg-[#441208] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                        >
                          {isPlacingOrder ? (
                            <><Loader2 className="w-4 h-4 animate-spin" />Placing Order&hellip;</>
                          ) : (
                            "Place Order"
                          )}
                        </button>
                      ) : (
                        // Stripe: create payment intent
                        <button
                          onClick={handleCreateIntent}
                          disabled={isCreatingIntent || cartItems.length === 0 || !paymentMethod}
                          className="px-8 py-3 bg-[#5A1E12] text-white rounded-lg font-medium hover:bg-[#441208] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                        >
                          {isCreatingIntent ? (
                            <><Loader2 className="w-4 h-4 animate-spin" />Creating Order&hellip;</>
                          ) : !paymentMethod ? (
                            "Select a Payment Method"
                          ) : (
                            "Proceed to Pay"
                          )}
                        </button>
                      )
                    ) : null /* Stripe form has its own submit button */}
                  </div>
                </div>
              )}

              {/* Guest Payment Step */}
              {showGuestForm && step === 3 && (
                <div className="border-t pt-8">
                  <h3 className="text-lg font-semibold text-[#5A1E12] mb-4">Payment Method</h3>
                  <div className="space-y-3 mb-6">
                    {["Credit Card", "Debit Card", "PayPal"].map((method) => (
                      <label
                        key={method}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          paymentMethod === method
                            ? "border-[#5A1E12] bg-[#5A1E12]/5"
                            : "border-[#5A1E12]/15 hover:border-[#5A1E12]/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="guestPayment"
                          value={method}
                          checked={paymentMethod === method}
                          onChange={() => setPaymentMethod(method)}
                          className="accent-[#5A1E12]"
                        />
                        <span className="text-sm font-medium text-[#3b1a08]">{method}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex justify-between gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-3 border border-[#5A1E12]/20 rounded-lg text-[#5A1E12] hover:bg-[#5A1E12]/5 transition text-sm font-medium"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder || !paymentMethod}
                      className="px-8 py-3 bg-[#5A1E12] text-white rounded-lg font-medium hover:bg-[#441208] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all flex items-center gap-2"
                    >
                      {isPlacingOrder ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Placing Order…</>
                      ) : (
                        "Place Order"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ================= RIGHT: ORDER SUMMARY ================= */}
          <div className="w-full lg:w-96 xl:w-105 shrink-0">
            <div className="bg-white lg:rounded-tl-xl shadow-sm lg:sticky lg:top-0 lg:h-screen flex flex-col">

              {/* ── Fixed header ── */}
              <div className="px-6 pt-6 pb-4 border-b shrink-0">
                <h2 className="text-xl font-bold">Order Summary</h2>
              </div>

              {/* ── Scrollable cart items ── */}
              <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
                <h3 className="font-medium mb-4 text-sm text-gray-500 uppercase tracking-wide">
                  Items ({cartItems.length})
                </h3>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="flex gap-4">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <Image
                          src={item.product.images?.[0] || "/images/placeholder.png"}
                          alt={item.product.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.product.title}</p>
                        <p className="text-sm text-gray-600">
                          Qty {item.quantity} × ${parseFloat(item.product.price).toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium text-sm">
                        ${(item.quantity * parseFloat(item.product.price)).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                {cartItems.length === 0 && (
                  <p className="text-sm text-gray-500 text-center mt-6">Your cart is empty</p>
                )}
              </div>

              {/* ── Fixed bottom: promo + totals ── */}
              <div className="px-6 pb-6 pt-4 border-t shrink-0 space-y-4">
                {/* PROMO */}
                <div>
                  <label className="block text-sm font-medium mb-2">Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 border rounded-lg px-4 py-2 text-sm"
                      placeholder="Enter code"
                    />
                    <button
                      onClick={handlePromoSubmit}
                      className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST ({gstPercentage?.toFixed(1)}%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <hr />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

            </div>
          </div>
      </div>
    </section>
  );
}
