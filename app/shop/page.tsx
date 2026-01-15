"use client";
import React, { useEffect, useMemo, useState } from "react";
import { HiViewGrid } from "react-icons/hi";
import ProductCard from "../components/cards/productCard";
import { useCart } from "../context/CartContext";

/* =======================
   TYPES
======================= */
type Product = {
  id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  stock: number;
  images: string[];
};

/* =======================
   PAGE
======================= */

export default function Page() {
  const baseURL = "https://alpa-be-1.onrender.com";

  const [products, setProducts] = useState<Product[]>([]);
  const [sort, setSort] = useState("");
  const [view, setView] = useState<3 | 4>(3);

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [page, setPage] = useState(1);
  const PRODUCTS_PER_PAGE = 8;
  const [totalPages, setTotalPages] = useState(1);

  /* ---------- CART ---------- */
  const { addToCart } = useCart();

  /* ---------- DATA FETCH ---------- */
  useEffect(() => {
    fetch(`${baseURL}/api/products/all`)
      .then((res) => res.json())
      .then((data) => setProducts(data.products));
  }, []);

  /* ---------- TOGGLE FILTER ---------- */
  const toggleFilter = (
    value: string,
    setState: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setPage(1);
    setState((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  /* ---------- SORT ---------- */
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const priceA = Number(a.price);
      const priceB = Number(b.price);

      if (sort === "price-low-high") return priceA - priceB;
      if (sort === "price-high-low") return priceB - priceA;
      return 0;
    });
  }, [products, sort]);

  /* ---------- FILTER ---------- */
  const filteredProducts = useMemo(() => {
    return sortedProducts.filter((product) => {
      const brandMatch =
        selectedBrands.length === 0 ||
        selectedBrands.some((b) =>
          product.title.toLowerCase().includes(b.toLowerCase())
        );

      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category);

      return brandMatch && categoryMatch;
    });
  }, [sortedProducts, selectedBrands, selectedCategories]);

  /* ---------- PAGINATION ---------- */
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, page]);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  }, [filteredProducts]);

  /* ---------- ACTIVE FILTER LABELS ---------- */
  const activeFilters = useMemo(
    () => [...selectedBrands, ...selectedCategories],
    [selectedBrands, selectedCategories]
  );

  const clearAll = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
  };

  const removeActiveFilter = (value: string) => {
    setSelectedBrands((prev) => prev.filter((b) => b !== value));
    setSelectedCategories((prev) => prev.filter((c) => c !== value));
  };

  const hasActiveFilters = selectedBrands.length || selectedCategories.length;

  const ThreeGridIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="5" height="16" stroke="currentColor" />
      <rect x="9.5" y="4" width="5" height="16" stroke="currentColor" />
      <rect x="17" y="4" width="5" height="16" stroke="currentColor" />
    </svg>
  );

  return (
    <section className="bg-[#EBE3D5] p-2">
      {/* HERO SECTION */}
      <section>
        <div className="relative min-h-[35vh] bg-[url('/images/dislaimerbg.jpg')] bg-cover bg-center rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-10 flex flex-col items-center justify-center text-white text-center py-40">
            <h1 className="text-6xl font-bold -mb-4">Shop</h1>
          </div>
        </div>
      </section>

      {/* MAIN SHOP LAYOUT */}
      <section className="mx-auto px-20 py-10 flex gap-14 mt-5">
        {/* LEFT SIDEBAR */}
        <aside className="w-64 shrink-0 sticky top-24 h-fit">
          <h2 className="font-semibold mb-4">Filters</h2>

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
              <label key={b} className="flex gap-4 items-center mb-2">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(b)}
                  onChange={() => toggleFilter(b, setSelectedBrands)}
                  className="accent-[#441208]"
                />
                {b}
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

            {["Electronics", "Furniture", "Clothes"].map((c) => (
              <label key={c} className="flex gap-4 items-center mb-2">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(c)}
                  onChange={() => toggleFilter(c, setSelectedCategories)}
                  className="accent-[#441208]"
                />
                {c}
              </label>
            ))}
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <section className="flex-1">
          {/* INFO + SORT */}
          <div className="flex justify-between mb-5">
            <h1>
              Showing {filteredProducts.length} of {products.length} products
            </h1>

            <div className="flex gap-4 items-center">
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="">Default sorting</option>
                <option value="price-low-high">Price: low to high</option>
                <option value="price-high-low">Price: high to low</option>
              </select>

              <button onClick={() => setView(3)}>
                <ThreeGridIcon />
              </button>
              <button onClick={() => setView(4)}>
                <HiViewGrid size={20} />
              </button>
            </div>
          </div>

          {/* ACTIVE FILTERS */}
          {hasActiveFilters && (
            <div className="flex gap-4 mb-6">
              {activeFilters.map((f) => (
                <span
                  key={f}
                  className="bg-[#6F433A] text-white px-3 py-1 rounded cursor-pointer"
                  onClick={() => removeActiveFilter(f)}
                >
                  {f} ×
                </span>
              ))}
              <button onClick={clearAll} className="underline">
                Clear all
              </button>
            </div>
          )}

          {/* PRODUCTS */}
          {paginatedProducts.length === 0 ? (
            <p className="text-center mt-16">No products found</p>
          ) : (
            <div
              className={`grid gap-8 ${
                view === 3 ? "grid-cols-3" : "grid-cols-4"
              }`}
            >
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  photo={product.images?.[0] || "/images/placeholder.png"}
                  name={product.title}
                  description={product.description}
                  amount={Number(product.price)}
                />
              ))}
            </div>
          )}

          {/* PAGINATION */}
          <div className="flex justify-center gap-4 mt-10">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 border rounded"
            >
              Prev
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 border rounded"
            >
              Next
            </button>
          </div>
        </section>
      </section>
    </section>
  );
}
