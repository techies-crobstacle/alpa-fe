"use client";

import { useState } from "react";
import EmailCart from "../../../components/checkout/emailCart";
import AddressCart from "../../../components/checkout/addressCart";
import PaymentCart from "../../../components/checkout/paymentCart";

export default function CheckOutPage() {
  const [step, setStep] = useState(1);
  const [promoCode, setPromoCode] = useState("");

  const handleNext = () => {
    // Add validation logic here before proceeding
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handlePromoSubmit = () => {
    // Add promo code validation logic here
    console.log("Promo code applied:", promoCode);
  };

  console.log(step)

  return (
    <section className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-8 ">
          {/* LEFT: Checkout Steps */}
          <div className="lg:w-2/3">
            <div className=" rounded-xl shadow-sm  bg-[#E4E4E4] p-6 md:p-8">
              {/* Step Indicators */}
              <div className="flex justify-between mb-8 relative">
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= stepNumber ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {stepNumber}
                    </div>
                    <span className="text-sm mt-2">
                      {stepNumber === 1 ? "Email" : stepNumber === 2 ? "Address" : "Payment"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Step Content */}
              <div className="min-h-100">
                {step === 1 && <EmailCart />}
                {step === 2 && <AddressCart />}
                {step === 3 && <PaymentCart />}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 ">
                <button
                  onClick={handleBack}
                  className={`px-6 py-3 border rounded-lg transition-colors ${step > 1 ? 'hover:bg-gray-50' : 'invisible'}`}
                  disabled={step === 1}
                >
                  Back
                </button>
                
                {step < 3 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Continue to {step === 1 ? "Shipping" : "Payment"}
                  </button>
                ) : (
                  <button
                    onClick={() => console.log("Place order")}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Place Order
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm  p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6 pb-4 border-b">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">$222.55</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">$20.00</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">$12.55</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <label htmlFor="promo" className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Code
                </label>
                <div className="flex gap-2">
                  <input
                    id="promo"
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  />
                  <button
                    onClick={handlePromoSubmit}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <hr className="my-6" />

              <div className="flex justify-between text-lg font-bold mb-6">
                <span>Total</span>
                <span>$299.00</span>
              </div>

              {/* Order Items Preview */}
              <div className="mt-8 pt-6 border-t">
                <h3 className="font-medium mb-4">Items (3)</h3>
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <p className="font-medium">Product Name {item}</p>
                        <p className="text-sm text-gray-600">Qty: 1 • $99.00</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
            
    </section>
  );
}