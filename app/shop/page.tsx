"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { HiOutlineViewGrid, HiOutlineViewList } from "react-icons/hi";
import ProductCard from "../components/cards/productCard";

type Product = {
  id: number;
  photo: string;
  name: string;
  description: string;
  amount: string;
};

export default function Page() {
  const [view, setView] = useState("grid");
 const [products, setProducts] = useState<Product[]>([]);

  // for Products Images, with descriptions
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts);
  }, []);

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
              <div key={b} className="flex justify-between text-lg mb-2">
                <label className="flex gap-5 items-center ">
                  <input
                    type="checkbox"
                    className="accent-[#441208] scale-200"
                  />
                  {b}
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
          <div className="mb-5">
            <h1>
              Showing {1} out {9} of Product
            </h1>
          </div>
          {/* Active Filter Se */}
          <div className="flex items-center justify-between py-4">
            {/* Left: Active Filters */}
            <div className="flex items-center gap-6">
              <h1 className="font-bold">Active Filters:</h1>

              <div className="bg-[#6F433A] text-white px-4 py-1 rounded flex items-center gap-3">
                Brand
                <button className="font-bold">×</button>
              </div>

              <div className="bg-[#6F433A] text-white px-4 py-1 rounded flex items-center gap-3">
                Men
                <button className="font-bold">×</button>
              </div>

              <button className="underline text-sm text-gray-700 hover:text-black">
                Clear All
              </button>
            </div>

            {/* Right: Sorting */}

            <div className="flex gap-5">
              <select
                // value={sort}
                // onChange={(e) => setSort(e.target.value)}
                className="py-2"
              >
                <option value="">Default sorting</option>
                <option value="popularity">Sort by popularity</option>
                <option value="rating">Sort by average rating</option>
                <option value="latest">Sort by latest</option>
                <option value="price-low-high">
                  Sort by price: low to high
                </option>
                <option value="price-high-low">
                  Sort by price: high to low
                </option>
              </select>
              <div className="flex gap-4">
                <button
                  // onClick={() => setView("grid")}
                  className={`p-2  rounded ${
                    view === "grid" ? "border-black" : "border-gray-400"
                  }`}
                >
                  <HiOutlineViewGrid size={20} />
                </button>

                <button
                  // onClick={() => setView("list")}
                  className={`p-2 border rounded ${
                    view === "list" ? "border-black" : "border-gray-400"
                  }`}
                >
                  <HiOutlineViewList size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Product Carts  */}
          {/* 1 row ________________________________________API__________________________________________________*/}
          <div className="grid grid-cols-3 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
            <h1>Hello</h1>
          </div>
        </section>
      </section>
    </section>
  );
}

<div className="grid grid-cols-3 gap-3 items-stretch">
  {/* Column 1 */}
  <div className="bg-amber-50 p-4 rounded-xl flex flex-col h-full">
    {/* Image */}
    <div className="relative w-full h-80 mb-3">
      <Image
        src="/images/temp/1.jpg"
        alt="Nike Jordan"
        fill
        className="object-cover rounded-lg"
      />
    </div>
    {/* Title */}
    <h1 className="font-bold text-lg mb-1">Nike Jordan</h1>
    {/* Description */}
    <p className="text-sm text-gray-700 grow">
      Nike Jordan is famous because of basketball legend Michael Jordan's
      partnership with Nike, which started in 1984.
    </p>
    <div className="flex flex-row">
      <h1 className="font-black text-2xl">29.00 AUD</h1>
    </div>
  </div>
</div>;
