"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";

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
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const { cartItems, subtotal } = useCart();
  const { token, loading } = useAuth();

  /* ---------------- PRICE LOGIC ---------------- */
  const shipping = subtotal > 100 ? 0 : 20;
  const tax = +(subtotal * 0.05).toFixed(2);
  const total = subtotal + shipping + tax;

  /* ---------------- STEP HANDLERS ---------------- */
  const handleNext = () => setStep((s) => Math.min(3, s + 1));
  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handlePromoSubmit = () => {
    console.log("Promo applied:", promoCode);
  };

  const handlePlaceOrder = async () => {
    // Check if using guest checkout
    if (showGuestForm) {
      if (!guestEmail.trim() || !guestFirstName.trim() || !guestLastName.trim() || !guestPhone.trim() || !shippingStreet.trim() || !shippingSuburb.trim() || !shippingPostcode.trim() || !shippingFullAddress.trim() || !paymentMethod) {
        alert("Please complete all required guest checkout fields");
        return;
      }
    } else {
      if (!shippingAddress.trim() || !paymentMethod) {
        alert("Please complete all required fields");
        return;
      }
    }

    setIsPlacingOrder(true);
    try {
      let response;
      if (showGuestForm) {
        // Guest checkout API call
        response = await fetch("https://alpa-be-1.onrender.com/api/orders/guest/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: cartItems.map((item) => ({
              productId: item.id,
              quantity: item.qty,
            })),
            customerName: `${guestFirstName} ${guestLastName}`.trim(),
            customerEmail: guestEmail,
            customerPhone: guestPhone,
            shippingAddress: {
              street: shippingStreet,
              suburb: shippingSuburb,
              postcode: shippingPostcode,
              fullAddress: shippingFullAddress,
            },
            paymentMethod,
          }),
        });
      } else {
        // Authenticated user order
        response = await fetch("https://alpa-be-1.onrender.com/api/orders/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            shippingAddress,
            paymentMethod: paymentMethod.toUpperCase(),
          }),
        });
      }

      if (response.ok) {
        const data = await response.json();
        alert("Order placed successfully!");
        window.location.href = "/";
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };


  return (
    <section className="min-h-screen py-20  px-4 sm:px-6 lg:px-8 bg-[#f5f5f5]">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-12"></h1>

        <div className="flex flex-col lg:flex-row gap-8 ">
          {/* ================= LEFT: STEPS ================= */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
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
                      <label className="block text-sm font-medium">Suburb</label>
                      <input
                        type="text"
                        value={shippingSuburb}
                        onChange={e => setShippingSuburb(e.target.value)}
                        className="border-b px-2 py-1 outline-none w-full"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">Postcode</label>
                      <input
                        type="text"
                        value={shippingPostcode}
                        onChange={e => setShippingPostcode(e.target.value)}
                        className="border-b px-2 py-1 outline-none w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Full Address</label>
                      <input
                        type="text"
                        value={shippingFullAddress}
                        onChange={e => setShippingFullAddress(e.target.value)}
                        className="border-b px-2 py-1 outline-none w-full"
                        required
                      />
                    </div>
                  </div>
                  <button
                    className="mt-4 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
                    onClick={() => {
                      // Validate guest fields before proceeding
                      if (!guestFirstName.trim() || !guestLastName.trim() || !guestEmail.trim() || !guestPhone.trim() || !shippingStreet.trim() || !shippingSuburb.trim() || !shippingPostcode.trim() || !shippingFullAddress.trim()) {
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
                      <AddressCart onAddressChange={setShippingAddress} />
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
                        disabled={cartItems.length === 0 || (step === 2 && !shippingAddress.trim())}
                        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
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
                  <span className="text-gray-600">Tax (5%)</span>
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
                    <div key={item.id} className="flex gap-4">
                      {/* IMAGE */}
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <Image
                          src={item.image || "/images/placeholder.png"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* INFO */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          Qty {item.qty} × ${item.price.toFixed(2)}
                        </p>
                      </div>

                      {/* ITEM TOTAL */}
                      <p className="font-medium text-sm">
                        ${(item.qty * item.price).toFixed(2)}
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
