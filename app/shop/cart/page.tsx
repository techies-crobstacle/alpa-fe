"use client";
import { TruckElectric } from "lucide-react";
import CartItem from "../../components/cards/shopCart";
import { useState } from "react";

 


export default function Page() {
  const [shipping, setShipping] = useState<"free" | "express">("free");
  // temp

  const subtotal = 150;
  const shippingCost = shipping === "free" ? 0 : 15;
  const total = subtotal + shippingCost;

 

  return (
    <section className="bg-[#EBE3D5]">
      {/* HERO SECTION */}
      <section>
        <div className="relative min-h-[35vh] bg-[url('/images/dislaimerbg.jpg')] bg-cover bg-center overflow-hidden">
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-white/10" />

          <div className="relative z-10 flex flex-col items-center justify-center text-white text-center py-40 px-6">
            <h1 className="text-6xl font-bold mb-4">Cart</h1>

            <p className="max-w-xl mb-6 text-white/90">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Asperiores, dignissimos.
            </p>

            <div className="flex items-center gap-4 w-full max-w-xl">
              <span className="flex-1 h-px bg-[#E6CFAF]" />
              <TruckElectric className="h-8 w-8 text-white/80 shrink-0" />
              <span className="flex-1 h-px bg-white/60" />
            </div>
          </div>
        </div>
      </section>
      <section className="p-10">
        {/* CART TABLE */}
      <section className="p-10">
        {/* Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-6 items-center pb-4 border-b border-black/30 font-bold text-xl">
          <h2 className="text-left">Product</h2>
          <h2 className="text-center">Quantity</h2>
          <h2 className="text-center">Price</h2>
          <h2 className="text-center">Sub-Total</h2>
        </div>

        {Array.from({ length: 3 }).map((_, index) => (
          <CartItem key={index} />
        ))}
      </section>

      {/* CHECKOUT SECTION */}
      <section className="p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full items-start">
          {/* LEFT – COUPON */}
          <div>
            <h1 className="font-bold text-2xl mb-4">Have a Coupon?</h1>

            <p className="mb-8 text-black/70 max-w-md">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit.
            </p>

            <div className="flex bg-white rounded-2xl overflow-hidden w-fit">
              <input
                type="text"
                placeholder="Enter coupon code"
                className="px-5 py-3 outline-none text-black"
              />
              <button className="px-6 font-semibold hover:bg-black/5">
                Apply
              </button>
            </div>
          </div>

          {/* RIGHT – SUMMARY */}
          <div className="bg-[#EFE7DA] rounded-2xl border border-white p-8 w-full">
            <h2 className="text-2xl font-bold mb-6">Cart Summary</h2>

            {/* Shipping Options */}
            <div className="space-y-4">
              {/* Free Shipping */}
              <label
                className={`flex items-center justify-between p-4 rounded-lg cursor-pointer border ${
                  shipping === "free"
                    ? "border-black bg-[#EFE7DA]"
                    : "border-transparent bg-white/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    value="free"
                    checked={shipping === "free"}
                    onChange={() => setShipping("free")}
                    className="accent-black w-4 h-4"
                  />
                  <span className="font-medium">Free Shipping</span>
                </div>
                <span className="font-bold">$0.00</span>
              </label>

              {/* Express Shipping */}
              <label
                className={`flex items-center justify-between p-4 rounded-lg cursor-pointer ${
                  shipping === "express"
                    ? "border border-black bg-[#EFE7DA]"
                    : "bg-white/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    value="express"
                    checked={shipping === "express"}
                    onChange={() => setShipping("express")}
                    className="accent-black w-4 h-4"
                  />
                  <span className="font-medium">Express Shipping</span>
                </div>
                <span className="font-bold">$15.00</span>
              </label>
            </div>

            {/* Divider */}
            <div className="my-6 h-px bg-black/10" />

            {/* Subtotal */}
            <div className="flex justify-between mb-4">
              <span className="text-lg">Subtotal</span>
              <span className="text-lg">${subtotal.toFixed(2)}</span>
            </div>

            {/* Divider */}
            <div className="mb-4 h-px bg-black/10" />

            {/* Total */}
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </section>
      </section>

      
    </section>
  );
}
