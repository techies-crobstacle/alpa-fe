"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";

import EmailCart from "../../../components/checkout/emailCart";
import AddressCart from "../../../components/checkout/addressCart";
import PaymentCart from "../../../components/checkout/paymentCart";

export default function CheckOutPage() {
  const [step, setStep] = useState(1);
  const [promoCode, setPromoCode] = useState("");

  const { cartItems, subtotal } = useCart();

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

  return (
    <section className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-[#f5f5f5]">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ================= LEFT: STEPS ================= */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
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
              <div className="min-h-[300px]">
                {step === 1 && <EmailCart />}
                {step === 2 && <AddressCart />}
                {step === 3 && <PaymentCart />}
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
                    disabled={cartItems.length === 0}
                    className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={() => console.log("Place order")}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Place Order
                  </button>
                )}
              </div>
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
