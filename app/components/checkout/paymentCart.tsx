"use client";
import { useState } from "react";

export default function PaymentCart() {
  const [paymentMethod, setPaymentMethod] = useState("card");

  return (
    <section className="p-10 flex flex-col gap-6">

      <h1 className="text-2xl font-bold">
        How would you like to pay?
      </h1>

      {/* Payment Method */}
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="paymentMethod"
            value="card"
            checked={paymentMethod === "card"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Pay with Card
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="paymentMethod"
            value="paypal"
            checked={paymentMethod === "paypal"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Pay with PayPal
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="paymentMethod"
            value="gift"
            checked={paymentMethod === "gift"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Use Gift Card
        </label>
      </div>

      {/* Card Details (ONLY if card selected) */}
      {paymentMethod === "card" && (
        <div className="flex flex-col gap-4">

          <div className="flex flex-col gap-1">
            <label htmlFor="cardName" className="text-sm font-medium">
              Name on Card
            </label>
            <input
              id="cardName"
              name="cardName"
              type="text"
              placeholder="John Doe"
              className="border-b px-2 py-1 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="cardNumber" className="text-sm font-medium">
              Card Number
            </label>
            <input
              id="cardNumber"
              name="cardNumber"
              type="text"
              inputMode="numeric"
              placeholder="1234 5678 9012 3456"
              className="border-b px-2 py-1 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="expiry" className="text-sm font-medium">
                Expiry Date
              </label>
              <input
                id="expiry"
                name="expiry"
                type="text"
                placeholder="MM/YY"
                className="border-b px-2 py-1 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="cvv" className="text-sm font-medium">
                CVV
              </label>
              <input
                id="cvv"
                name="cvv"
                type="password"
                placeholder="123"
                className="border-b px-2 py-1 outline-none"
              />
            </div>
          </div>

        </div>
      )}

      {/* PayPal message */}
      {paymentMethod === "paypal" && (
        <p className="text-sm text-gray-600">
          You’ll be redirected to PayPal to complete your payment.
        </p>
      )}

      {/* Gift Card */}
      {paymentMethod === "gift" && (
        <div className="flex flex-col gap-1">
          <label htmlFor="giftCode" className="text-sm font-medium">
            Gift Card Code
          </label>
          <input
            id="giftCode"
            name="giftCode"
            type="text"
            placeholder="XXXX-XXXX"
            className="border-b px-2 py-1 outline-none"
          />
        </div>
      )}

      {/* <button className="bg-black px-10 py-3 text-white">
        Proceed to checkout
      </button> */}

    </section>
  );
}
