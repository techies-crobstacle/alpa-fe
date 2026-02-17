"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";
import { useSharedEnhancedCart } from "@/app/hooks/useSharedEnhancedCart";
import { guestCartUtils } from "@/app/lib/guestCartUtils";
import Link from "next/link";
import EmailCart from "../../../components/checkout/emailCart";
import AddressCart from "../../../components/checkout/addressCart";
import PaymentCart from "../../../components/checkout/paymentCart";

export default function CheckOutPage() {
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
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isAddressValidated, setIsAddressValidated] = useState(false);

  const { cartData, selectedShipping, calculateTotals } = useSharedEnhancedCart();
  const { token, loading } = useAuth();
  
  // Get cart items and totals from enhanced cart
  const cartItems = cartData?.cart || [];
  const { subtotal, shippingCost, gstAmount, grandTotal, gstPercentage } = calculateTotals;

  // Load checkout data from localStorage on mount
  useEffect(() => {
    const savedStep = localStorage.getItem("checkoutStep");
    const savedGuestForm = localStorage.getItem("showGuestForm");
    const savedGuestData = localStorage.getItem("guestCheckoutData");
    const savedPromoCode = localStorage.getItem("promoCode");
    const savedPaymentMethod = localStorage.getItem("paymentMethod");
    const savedAddressValidated = localStorage.getItem("addressValidated");

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
    if (savedAddressValidated === "true") {
      setIsAddressValidated(true);
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
    localStorage.setItem("guestCheckoutData", JSON.stringify({
      guestEmail,
      guestFirstName,
      guestLastName,
      guestPhone,
      shippingStreet,
      shippingCity,
      shippingState,
      shippingZipCode,
    }));
  }, [guestEmail, guestFirstName, guestLastName, guestPhone, shippingStreet, shippingCity, shippingState, shippingZipCode]);

  useEffect(() => {
    localStorage.setItem("promoCode", promoCode);
  }, [promoCode]);

  useEffect(() => {
    localStorage.setItem("paymentMethod", paymentMethod);
  }, [paymentMethod]);

  /* ---------------- PRICE LOGIC (from enhanced cart) ---------------- */
  // Use pre-calculated totals from enhanced cart
  const shipping = shippingCost;
  const tax = gstAmount;
  const total = grandTotal;

  /* ---------------- STEP HANDLERS ---------------- */
  const handleNext = () => {
    // When on step 2 (address), require validation before proceeding
    if (step === 2 && !isAddressValidated) {
      alert("Please validate your address before proceeding");
      return;
    }
    setStep((s) => Math.min(3, s + 1));
  };
  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handlePromoSubmit = () => {
    console.log("Promo applied:", promoCode);
  };

  const handlePlaceOrder = async () => {
    // Check if using guest checkout
    if (showGuestForm) {
      if (!guestEmail.trim() || !guestFirstName.trim() || !guestLastName.trim() || !guestPhone.trim() || !shippingStreet.trim() || !shippingCity.trim() || !shippingState.trim() || !shippingZipCode.trim() || !paymentMethod) {
        alert("Please complete all required guest checkout fields");
        return;
      }
    } else {
      if (!shippingAddress.trim() || !paymentMethod) {
        alert("Please complete all required fields");
        return;
      }
    }

    // Validate shipping method selection
    if (!selectedShipping) {
      alert("Please select a shipping method");
      return;
    }

    // Check cart is not empty
    if (cartItems.length === 0) {
      alert("Your cart is empty. Please add items before placing an order");
      return;
    }

    setIsPlacingOrder(true);
    try {
      let response;
      
      // Get shipping and GST IDs dynamically from cart data
      const shippingMethodId = selectedShipping?.id;
      const gstId = cartData?.gst?.id;
      
      console.log('=== ORDER PLACEMENT DEBUG ===');
      console.log('cartData.availableShipping:', cartData?.availableShipping);
      console.log('selectedShipping:', selectedShipping);
      console.log('shippingMethodId:', shippingMethodId);
      console.log('cartData.gst:', cartData?.gst);
      console.log('gstId:', gstId);
      console.log('showGuestForm:', showGuestForm);

      if (showGuestForm) {
        // Guest checkout API call with guest cart items
        const guestCartItems = guestCartUtils.getGuestCart();
        
        console.log('=== GUEST CHECKOUT DEBUG ===');
        console.log('Cart items:', guestCartItems);
        console.log('Guest name:', `${guestFirstName} ${guestLastName}`);
        console.log('Guest email:', guestEmail);
        console.log('Guest phone:', guestPhone);
        console.log('Shipping address:', {
          street: shippingStreet,
          city: shippingCity,
          state: shippingState,
          zipCode: shippingZipCode,
        });
        console.log('Payment method:', paymentMethod);
        console.log('Shipping method ID:', shippingMethodId);
        console.log('GST ID:', gstId);
        
        const requestBody = {
          items: guestCartItems.map(item => ({
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
          ...(gstId && { gstId }), // Include gstId only if available
        };
        
        console.log('Full request body:', requestBody);
        console.log('Request body as JSON string:', JSON.stringify(requestBody));
        
        response = await fetch("https://alpa-be-1.onrender.com/api/orders/guest/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });
      } else {
        // Authenticated user order with new body format
        response = await fetch("https://alpa-be-1.onrender.com/api/orders/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            shippingAddress: {
              street: shippingStreet,
              suburb: shippingSuburb,
              postcode: shippingPostcode,
              fullAddress: shippingFullAddress,
            },
            paymentMethod: paymentMethod,
            shippingMethodId: shippingMethodId,
            ...(gstId && { gstId }), // Include gstId only if available
          }),
        });
      }

      if (response.ok) {
        const data = await response.json();
        alert("Order placed successfully!");
        
        // Clear guest cart from localStorage if guest checkout
        if (showGuestForm) {
          guestCartUtils.clearGuestCart();
        }
        
        // Clear checkout data from localStorage
        localStorage.removeItem("checkoutStep");
        localStorage.removeItem("showGuestForm");
        localStorage.removeItem("guestCheckoutData");
        localStorage.removeItem("promoCode");
        localStorage.removeItem("paymentMethod");
        localStorage.removeItem("addressCartData");
        localStorage.removeItem("addressPlaceId");
        localStorage.removeItem("addressValidated");
        window.location.href = "/";
      } else {
        // Try to parse error response
        let errorMessage = "Failed to place order";
        try {
          const errorData = await response.json();
          console.error('Backend JSON error response:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          // Response is not JSON, get raw text
          const errorText = await response.text();
          console.error('Backend raw error response:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          });
          errorMessage = errorText || errorMessage;
        }
        
        console.error('Full error details:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
        });
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };


  return (
    <section className=" p-12 bg-[#f5f5f5]">
      <Link
                  href="/"
                  className="absolute top-6 left-6 font-bold transition-transform hover:scale-105 active:scale-95 shrink-0"
                >
                  <Image
                    src="/images/navbarLogo.png"
                    width={500}
                    height={500}
                    alt="Logo"
                    className="w-10 md:w-20"
                    priority
                  />
                </Link>
      
      <div className="max-w-7xl  mx-auto">
        <h1 className="text-3xl font-bold "></h1>

        <div className="flex flex-col lg:flex-row gap-8 ">
          {/* ================= LEFT: STEPS ================= */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Continue as Guest Option */}
              {!showGuestForm && (
                <div className="mb-6 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      {/* <h3 className="font-medium text-gray-900">Guest Checkout Available</h3> */}
                      <p className="text-sm text-gray-600">Don't have account? </p>
                    </div>
                    <button
                      className="px-4 py-2 text-blue-500 rounded-lg font-medium hover:underline transition-colors"
                      onClick={() => setShowGuestForm(true)}
                    >
                      Continue as Guest
                    </button>
                  </div>
                </div>
              )}

              {/* Guest Checkout Form */}
              {/* Guest Checkout Form */}
              {showGuestForm ? (
                <div className="space-y-4 bg-amber-50 p-6 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Guest Checkout Details</h3>
                    <button
                      className="text-sm text-gray-600 hover:text-gray-800 underline"
                      onClick={() => setShowGuestForm(false)}
                    >
                      Back to Normal Checkout
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">First Name</label>
                      <input
                        type="text"
                        value={guestFirstName}
                        onChange={e => setGuestFirstName(e.target.value)}
                        className="border-b px-2 py-1 outline-none w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Last Name</label>
                      <input
                        type="text"
                        value={guestLastName}
                        onChange={e => setGuestLastName(e.target.value)}
                        className="border-b px-2 py-1 outline-none w-full"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={e => setGuestEmail(e.target.value)}
                      className="border-b px-2 py-1 outline-none w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Phone</label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={e => setGuestPhone(e.target.value)}
                      className="border-b px-2 py-1 outline-none w-full"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">Street</label>
                      <input
                        type="text"
                        value={shippingStreet}
                        onChange={e => setShippingStreet(e.target.value)}
                        className="border-b px-2 py-1 outline-none w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">City</label>
                      <input
                        type="text"
                        value={shippingCity}
                        onChange={e => setShippingCity(e.target.value)}
                        className="border-b px-2 py-1 outline-none w-full"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">State</label>
                      <input
                        type="text"
                        value={shippingState}
                        onChange={e => setShippingState(e.target.value)}
                        className="border-b px-2 py-1 outline-none w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Zip Code</label>
                      <input
                        type="text"
                        value={shippingZipCode}
                        onChange={e => setShippingZipCode(e.target.value)}
                        className="border-b px-2 py-1 outline-none w-full"
                        required
                      />
                    </div>
                  </div>
                  <button
                    className="mt-4 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
                    onClick={() => {
                      // Validate guest fields before proceeding
                      if (!guestFirstName.trim() || !guestLastName.trim() || !guestEmail.trim() || !guestPhone.trim() || !shippingStreet.trim() || !shippingCity.trim() || !shippingState.trim() || !shippingZipCode.trim()) {
                        alert("Please fill all guest checkout fields");
                        return;
                      }
                      setStep(3); // Go directly to payment step
                    }}
                  >
                    Continue to Payment
                  </button>
                </div>
              ) : (
                // Normal 3-step checkout form
                <>
                  {/* STEP INDICATORS */}
                  <div className="flex justify-between mb-8 relative">
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step >= n
                              ? "bg-black text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {n}
                        </div>
                        <span className="text-sm mt-2">
                          {n === 1 ? "Email" : n === 2 ? "Address" : "Payment"}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* STEP CONTENT */}
                  <div className="min-h-75">
                    {step === 1 && (
                      <EmailCart onEmailChange={() => {}} />
                    )}
                    {step === 2 && (
                      <>
                        {!isAddressValidated && (
                          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-800 font-medium">
                              ⚠️ Address validation is required to proceed. Please validate your address using the "Validate" button.
                            </p>
                          </div>
                        )}
                        <AddressCart 
                          key="address-cart-step2" 
                          onAddressChange={setShippingAddress} 
                          onValidationChange={setIsAddressValidated} 
                        />
                      </>
                    )}
                    {step === 3 && <PaymentCart onPaymentMethodChange={setPaymentMethod} />}
                  </div>

                  {/* NAV BUTTONS */}
                  <div className="flex justify-between mt-8 pt-6">
                    <button
                      onClick={handleBack}
                      disabled={step === 1}
                      className={`px-6 py-3 border rounded-lg ${
                        step === 1
                          ? "opacity-0 pointer-events-none"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      Back
                    </button>

                    {step < 3 ? (
                      <button
                        onClick={handleNext}
                        disabled={cartItems.length === 0 || (step === 2 && !shippingAddress.trim()) || (step === 2 && !isAddressValidated)}
                        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                        title={step === 2 && !isAddressValidated ? "Please validate your address to continue" : ""}
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        onClick={handlePlaceOrder}
                        disabled={isPlacingOrder || !paymentMethod}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {isPlacingOrder ? "Placing Order..." : "Place Order"}
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* Guest Payment Step */}
              {showGuestForm && step === 3 && (
                <div className="border-t pt-8">
                  <PaymentCart onPaymentMethodChange={setPaymentMethod} />
                  <div className="flex justify-between mt-8 gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-3 border rounded-lg hover:bg-gray-50"
                    >
                      Back  
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder || !paymentMethod}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {isPlacingOrder ? "Placing Order..." : "Place Order"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ================= RIGHT: ORDER SUMMARY ================= */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6 pb-4 border-b">
                Order Summary
              </h2>

              {/* PRICE SUMMARY */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span>
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST ({gstPercentage?.toFixed(1)}%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              {/* PROMO */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Promo Code
                </label>
                <div className="flex gap-2">
                  <input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 border rounded-lg px-4 py-2"
                    placeholder="Enter code"
                  />
                  <button
                    onClick={handlePromoSubmit}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <hr className="my-6" />

              {/* TOTAL */}
              <div className="flex justify-between text-lg font-bold mb-6">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {/* CART ITEMS */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-medium mb-4">
                  Items ({cartItems.length})
                </h3>

                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="flex gap-4">
                      {/* IMAGE */}
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <Image
                          src={item.product.images?.[0] || "/images/placeholder.png"}
                          alt={item.product.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* INFO */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.product.title}</p>
                        <p className="text-sm text-gray-600">
                          Qty {item.quantity} × ${parseFloat(item.product.price).toFixed(2)}
                        </p>
                      </div>

                      {/* ITEM TOTAL */}
                      <p className="font-medium text-sm">
                        ${(item.quantity * parseFloat(item.product.price)).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {cartItems.length === 0 && (
                  <p className="text-sm text-gray-500 text-center mt-6">
                    Your cart is empty
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
