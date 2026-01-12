"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiViewGrid,
} from "react-icons/hi";
import ProductCard from "../components/cards/productCard";

/* =======================
   TYPES
======================= */

type Product = {
  id: number;
  brand: "Nike" | "Adidas" | "Zara" | "Puma";
  category: "T-Shirt" | "Shirt" | "SweatShirt" | "Hoodies";
  gender: "Male" | "Female";
  photo: string;
  name: string;
  description: string;
  amount: string;
};

/* =======================
   PAGE
======================= */

export default function Page() {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [products, setProducts] = useState<Product[]>([]);
  const [sort, setSort] = useState("");
  const [view, setView] = useState<3 | 4>(3); // for grid view

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);

  /* ---------- DATA FETCH ---------- */
  useEffect(() => {
    fetch(`/api/products?page=${page}&limit=12`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.data);
        setTotalPages(data.totalPages);
      });
  }, [page]);

  /* ---------- TOGGLE FILTER ---------- */
  const toggleFilter = (
    value: string,
    setState: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setState((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  /* ---------- SORT ---------- */
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      if (sort === "price-low-high") {
        return Number(a.amount) - Number(b.amount);
      }
      if (sort === "price-high-low") {
        return Number(b.amount) - Number(a.amount);
      }
      return 0;
    });
  }, [products, sort]);

  /* ---------- FILTER ---------- */
  const filteredProducts = useMemo(() => {
    return sortedProducts.filter((product) => {
      const brandMatch =
        selectedBrands.length === 0 || selectedBrands.includes(product.brand);

      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category);

      const genderMatch =
        selectedGenders.length === 0 ||
        selectedGenders.includes(product.gender);

      return brandMatch && categoryMatch && genderMatch;
    });
  }, [sortedProducts, selectedBrands, selectedCategories, selectedGenders]);

  /* ---------- ACTIVE FILTER LABELS ---------- */
  const activeFilters = [
    ...selectedBrands,
    ...selectedCategories,
    ...selectedGenders,
  ];

  // clear section (ALL)
  const clearAll = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedGenders([]);
  };


  // fir test delete it later
  useEffect(() => {
    console.log(products);
  }, [products]);

  // for remove filter (single)
  const removeActiveFilter = (value: string) => {
    setSelectedBrands((prev) => prev.filter((b) => b !== value));
    setSelectedCategories((prev) => prev.filter((c) => c !== value));
    setSelectedGenders((prev) => prev.filter((g) => g !== value));
  };

  const ThreeGridIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="5" height="16" stroke="currentColor" />
      <rect x="9.5" y="4" width="5" height="16" stroke="currentColor" />
      <rect x="17" y="4" width="5" height="16" stroke="currentColor" />
    </svg>
  );

  return (
    <section className="bg-[#EBE3D5] p-2">
      {/* HERO SECTION */}{" "}
      <section>
        {" "}
        <div className="relative min-h-[35vh] bg-[url('/images/dislaimerbg.jpg')] bg-cover bg-center  rounded-2xl overflow-hidden">
          {" "}
          <div className="absolute inset-0 bg-black/30" />{" "}
          <div className="relative z-10 flex flex-col items-center justify-center text-white text-center py-40">
            {" "}
            <h1 className="text-6xl font-bold -mb-4">Shop</h1>{" "}
            <svg className="mt-6 w-full h-6 mb-8" viewBox="0 1 400 30">
              {" "}
              <path
                d="M5 20 C80 10, 160 30, 240 22 C300 15, 350 25, 395 20"
                stroke="#000"
                strokeWidth="6"
                strokeLinecap="round"
              />{" "}
            </svg>{" "}
          </div>{" "}
        </div>{" "}
      </section>
      {/* MAIN SHOP LAYOUT */}
      <section className=" mx-auto px-20 py-10 flex gap-14 mt-5">
        {/* LEFT SIDEBAR */}
        <aside className="w-65 shrink-0 sticky top-24 h-fit">

          <h2 className="font-semibold mb-4">Filters:</h2>
          <hr className="mb-6 border-black/10" />

          {/* Brand */}
          <div className="mb-8">
            <div className="flex justify-between mb-3 text-sm font-medium">
              <span>Brand</span>
              <span
                className="opacity-60 cursor-pointer"
                onClick={() => setSelectedBrands([])}
              >
                Reset
              </span>
            </div>

            {["Nike", "Adidas", "Zara", "Puma"].map((b) => (
              <label
                key={b}
                className="flex justify-between items-center text-lg mb-2"
              >
                <span className="flex gap-4 items-center">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(b)}
                    onChange={() => toggleFilter(b, setSelectedBrands)}
                    className="accent-[#441208] scale-160"
                  />
                  {b}
                </span>
                <span className="opacity-60">32</span>
              </label>
            ))}
          </div>

          {/* Category */}
          <div className="mb-8">
            <div className="flex justify-between mb-3 text-sm font-medium">
              <span>Category</span>
              <span
                className="opacity-60 cursor-pointer"
                onClick={() => setSelectedCategories([])}
              >
                Reset
              </span>
            </div>

            {["T-Shirt", "Shirt", "SweatShirt", "Hoodies"].map((c) => (
              <label
                key={c}
                className="flex justify-between items-center text-md mb-2"
              >
                <span className="flex gap-4 items-center">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(c)}
                    onChange={() => toggleFilter(c, setSelectedCategories)}
                    className="accent-[#441208] scale-160"
                  />
                  {c}
                </span>
                <span className="opacity-60">32</span>
              </label>
            ))}
          </div>

          {/* Gender */}
          <div className="mb-8">
            <div className="flex justify-between mb-3 text-sm font-medium">
              <span>Gender</span>
              <span
                className="opacity-60 cursor-pointer"
                onClick={() => setSelectedGenders([])}
              >
                Reset
              </span>
            </div>

            {["Male", "Female"].map((g) => (
              <label
                key={g}
                className="flex justify-between items-center text-lg mb-2"
              >
                <span className="flex gap-4 items-center">
                  <input
                    type="checkbox"
                    checked={selectedGenders.includes(g)}
                    onChange={() => toggleFilter(g, setSelectedGenders)}
                    className="accent-[#441208] scale-160"
                  />
                  {g}
                </span>
                <span className="opacity-60">32</span>
              </label>
            ))}
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <section className="flex-1">
          {/* INFO Left */}
          <div className="mb-3">
            <h1>
              Showing {filteredProducts.length} out of {products.length}{" "}
              Products
            </h1>
          </div>

          {/* Info Right */}
          <div className="flex justify-between mb-5">
            {/* ACTIVE FILTERS */}
            <div className="flex items-center gap-7 py-4">
              <h1 className="font-bold">Active Filters:</h1>

              {activeFilters.map((f) => (
                <div
                  key={f}
                  className="bg-[#6F433A] text-white px-4 py-1 rounded flex items-center gap-2"
                >
                  {f}
                  <span
                    className="cursor-pointer font-bold"
                    onClick={() => removeActiveFilter(f)}
                  >
                    ×
                  </span>
                </div>
              ))}

              <button
                onClick={clearAll}
                className="underline text-sm text-gray-700 hover:text-black"
              >
                Clear All
              </button>
            </div>

            {/* SORT + VIEW */}
            <div className="flex gap-4 items-center justify-between py-4">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="py-2"
              >
                <option value="">Default sorting</option>
                <option value="price-low-high">Price: low to high</option>
                <option value="price-high-low">Price: high to low</option>
              </select>

              <div className="flex gap-3">
                {/* for three grid */}
                <button
                  onClick={() => setView(3)}
                  className={`p-2 border rounded text-black ${
                    view === 3 ? "border-black" : "border-gray-400"
                  }`}
                >
                  <ThreeGridIcon />
                </button>
                {/* for four grid */}
                <button
                  onClick={() => setView(4)}
                  className={`p-2 border rounded ${
                    view === 4 ? "border-black" : "border-gray-400"
                  }`}
                >
                  <HiViewGrid size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* PRODUCTS */}
          <div
            className={`grid gap-8 ${
              view === 3 ? "grid-cols-3" : "grid-cols-4"
            }`}
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex gap-3 justify-center mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            <span className="px-4 py-2 font-semibold">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </section>
      </section>
    </section>
  );
}
