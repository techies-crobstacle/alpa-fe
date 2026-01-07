"use client";
import React from "react";

export default function Page() {
  return (
    <section className="bg-[#EBE3D5]">

      {/* HERO SECTION */}
      <section>
        <div className="relative min-h-[35vh] bg-[url('/images/dislaimerbg.jpg')] bg-cover bg-center m-1 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-black/30" />

          <div className="relative z-10 flex flex-col items-center justify-center text-white text-center py-40">
            <h1 className="text-6xl font-bold -mb-4">Shop</h1>
            <svg className="mt-6 w-full h-6 mb-8" viewBox="0 1 400 30">
              <path
               d="M5 20 C80 10, 160 30, 240 22 C300 15, 350 25, 395 20"

                stroke="#000"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* MAIN SHOP LAYOUT */}
      <section className="max-w-378 mx-auto px-20 py-10 flex gap-8">

        {/* LEFT SIDEBAR */}
        <aside className="w-65 shrink-0">
          <h2 className="font-semibold mb-4">Filters:</h2>
          <hr className="mb-6 border-black/10" />

          {/* Brand */}
          <div className="mb-8">
            <div className="flex justify-between mb-3 text-sm font-medium">
              <span>Brand</span>
              <span className="opacity-60 cursor-pointer">Reset</span>
            </div>

            {["Nike", "Adidas", "Zara", "Puma"].map((b) => (
              <div key={b} className="flex justify-between text-sm mb-2">
                <label className="flex gap-2">
                  <input type="checkbox" /> {b}
                </label>
                <span className="opacity-60">32</span>
              </div>
            ))}

            <button className="mt-4 bg-[#3B0F06] text-white text-xs px-4 py-2 rounded-full">
              Show More
            </button>
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <section className="flex-1">

          {/* TOP BAR */}
          <div className="flex justify-between items-center mb-8">
            <p className="text-sm opacity-70">
              Showing 9 out of 18 Products
            </p>

            <div className="flex gap-4 text-sm items-center">
              <span className="bg-[#6B4A3E] text-white px-3 py-1 rounded-full">
                Brand ×
              </span>
              <span className="bg-[#6B4A3E] text-white px-3 py-1 rounded-full">
                Men ×
              </span>
              <span className="underline cursor-pointer">Clear All</span>
            </div>
          </div>

          {/* PRODUCTS GRID */}
          <div className="grid grid-cols-3 gap-8">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 flex flex-col"
              >
                <div className="h-90 bg-gray-200 rounded-xl mb-4" />
                <h3 className="font-semibold mb-1">Product Title</h3>
                <p className="text-sm opacity-70 mb-4">
                  Lorem Ipsum is dummy text.
                </p>
                <div className="mt-auto flex justify-between items-center">
                  <span className="font-semibold text-[#6B2C1A]">
                    29.99 AUD
                  </span>
                  <div className="flex gap-2">
                    <button className="w-9 h-9 bg-[#3B0F06] text-white rounded-full">
                      <span className="w-10">♥</span>
                    </button>
                    <button className="w-9 h-9 bg-[#3B0F06] text-white rounded-full">
                      🛒
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </section>
      </section>
    </section>
  );
}
