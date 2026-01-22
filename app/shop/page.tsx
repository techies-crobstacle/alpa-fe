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
  brand?: string;
  slug?: string;
};

/* =======================
   PAGE
======================= */

export default function Page() {
  const baseURL = "https://alpa-be-1.onrender.com";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState("");
  const [view, setView] = useState<3 | 4>(3);

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [page, setPage] = useState(1);
  const PRODUCTS_PER_PAGE = 8;
  const [totalPages, setTotalPages] = useState(1);

  // Show more states for filters
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const INITIAL_ITEMS_TO_SHOW = 5;

  // Mobile filter drawer state
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { addToCart, getItemQuantity } = useCart();

  /* ---------- DATA FETCH ---------- */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseURL}/api/products/all`);
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();

        // Extract brand from title if not provided
        const productsWithBrand = data.products.map((product: Product) => ({
          ...product,
          stock: product.stock ?? 0, // Ensure stock is always present
          brand: product.brand || product.title.split(" ")[0],
          slug: product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        }));

        setProducts(productsWithBrand);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /* ---------- TOGGLE FILTER ---------- */
  const toggleFilter = (
    value: string,
    setState: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setPage(1);
    setState((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  /* ---------- SORT ---------- */
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const priceA = parseFloat(a.price);
      const priceB = parseFloat(b.price);

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
        (product.brand && selectedBrands.includes(product.brand));

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
    // Reset to page 1 if current page is invalid after filtering
    if (page > Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)) {
      setPage(1);
    }
  }, [filteredProducts, page]);

  /* ---------- ACTIVE FILTER LABELS ---------- */
  const activeFilters = useMemo(
    () => [...selectedBrands, ...selectedCategories],
    [selectedBrands, selectedCategories],
  );

  /* ---------- UNIQUE CATEGORIES WITH COUNTS ---------- */
  const categoriesWithCounts = useMemo(() => {
    const categoryMap = new Map<string, number>();

    products.forEach((product) => {
      if (product.category) {
        categoryMap.set(
          product.category,
          (categoryMap.get(product.category) || 0) + 1,
        );
      }
    });

    return Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }, [products]);

  /* ---------- UNIQUE BRANDS WITH COUNTS ---------- */
  const brandsWithCounts = useMemo(() => {
    const brandMap = new Map<string, number>();

    products.forEach((product) => {
      const brand = product.brand || product.title.split(" ")[0];
      if (brand) {
        brandMap.set(brand, (brandMap.get(brand) || 0) + 1);
      }
    });

    return Array.from(brandMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }, [products]);

  const clearAll = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setPage(1);
    setShowMobileFilters(false);
  };

  const removeActiveFilter = (value: string) => {
    setSelectedBrands((prev) => prev.filter((b) => b !== value));
    setSelectedCategories((prev) => prev.filter((c) => c !== value));
    setPage(1);
  };

  const hasActiveFilters =
    selectedBrands.length > 0 || selectedCategories.length > 0;

  const ThreeGridIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="5" height="16" stroke="currentColor" />
      <rect x="9.5" y="4" width="5" height="16" stroke="currentColor" />
      <rect x="17" y="4" width="5" height="16" stroke="currentColor" />
    </svg>
  );

  // Skeleton loader
  const SkeletonLoader = () => (
    <div
      className={`grid gap-4 sm:gap-6 ${
        view === 3
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      }`}
    >
      {[...Array(PRODUCTS_PER_PAGE)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-300 h-48 sm:h-56 md:h-64 w-full rounded-lg mb-4"></div>
          <div className="bg-gray-300 h-4 rounded w-3/4 mb-2"></div>
          <div className="bg-gray-300 h-4 rounded w-1/2 mb-4"></div>
          <div className="bg-gray-300 h-10 rounded"></div>
        </div>
      ))}
    </div>
  );

  // Filter items to display based on showMore state
  const displayBrands = showAllBrands
    ? brandsWithCounts
    : brandsWithCounts.slice(0, INITIAL_ITEMS_TO_SHOW);

  const displayCategories = showAllCategories
    ? categoriesWithCounts
    : categoriesWithCounts.slice(0, INITIAL_ITEMS_TO_SHOW);

  if (error) {
    return (
      <div className="min-h-screen bg-[#EBE3D5] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#EBE3D5]">
      {/* HERO SECTION */}
<section className="bg-[#e6e6e6]">
    {/* OUTER FRAME */}
    <div className="max-w-full mx-auto overflow-hidden">
      {/* FULL IMAGE */}
      <div
        className="relative h-[30vh] sm:h-[35vh] md:h-[40vh] lg:h-[60vh]
                   bg-[url('/images/shop-banner.jpg')] bg-cover bg-center"
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Center Text */}
        <div className="relative z-10 h-full flex items-center justify-center text-white text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">
            Shop
          </h1>
        </div>
      </div>
    </div>
  </section>

      {/* MOBILE FILTER BUTTON */}
      <div className="lg:hidden mx-auto px-4 md:px-8 py-4">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="w-full py-3 bg-white rounded-xl border shadow-sm flex items-center justify-center gap-2 font-medium"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filters {hasActiveFilters && `(${activeFilters.length})`}
        </button>
      </div>

      {/* MAIN SHOP LAYOUT */}
      <section className="mx-auto px-4 md:px-8 lg:px-20 py-4 lg:py-10 flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* MOBILE FILTER DRAWER */}
        {showMobileFilters && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setShowMobileFilters(false)}
            />
            <aside className="fixed left-0 top-0 h-full w-80 bg-white z-50 p-6 overflow-y-auto lg:hidden">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-xl">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Brand Filter - Mobile */}
              <div className="mb-8">
                <div className="flex justify-between mb-3 text-sm font-medium">
                  <span>Brand</span>
                  <button
                    onClick={() => {
                      setSelectedBrands([]);
                      setShowAllBrands(false);
                    }}
                    className="opacity-60 cursor-pointer hover:opacity-100 transition-opacity"
                  >
                    Reset
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto pr-2">
                  {displayBrands.map((brand) => (
                    <label
                      key={brand.name}
                      className="flex justify-between items-center mb-3 cursor-pointer group"
                    >
                      <div className="flex gap-3 items-center">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand.name)}
                          onChange={() =>
                            toggleFilter(brand.name, setSelectedBrands)
                          }
                          className="accent-[#441208] w-4 h-4"
                        />
                        <span className="group-hover:text-[#441208] transition-colors">
                          {brand.name}
                        </span>
                      </div>
                      <span className="text-gray-500 text-sm">
                        {brand.count}
                      </span>
                    </label>
                  ))}

                  {/* Show More/Less Button */}
                  {brandsWithCounts.length > INITIAL_ITEMS_TO_SHOW && (
                    <button
                      onClick={() => setShowAllBrands(!showAllBrands)}
                      className="w-full text-center mt-2 text-[#441208] hover:text-black text-sm py-1"
                    >
                      {showAllBrands
                        ? "Show Less"
                        : `Show More (${brandsWithCounts.length - INITIAL_ITEMS_TO_SHOW})`}
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter - Mobile */}
              <div className="mb-8">
                <div className="flex justify-between mb-3 text-sm font-medium">
                  <span>Category</span>
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                      setShowAllCategories(false);
                    }}
                    className="opacity-60 cursor-pointer hover:opacity-100 transition-opacity"
                  >
                    Reset
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto pr-2">
                  <hr className="mb-3" />
                  {displayCategories.map((category) => (
                    <label
                      key={category.name}
                      className="flex justify-between items-center mb-3 cursor-pointer group"
                    >
                      <div className="flex gap-3 items-center">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.name)}
                          onChange={() =>
                            toggleFilter(category.name, setSelectedCategories)
                          }
                          className="accent-[#441208] w-4 h-4"
                        />
                        <span className="group-hover:text-[#441208] transition-colors">
                          {category.name}
                        </span>
                      </div>
                      <span className="text-gray-500 text-sm">
                        {category.count}
                      </span>
                    </label>
                  ))}

                  {/* Show More/Less Button */}
                  {categoriesWithCounts.length > INITIAL_ITEMS_TO_SHOW && (
                    <button
                      onClick={() => setShowAllCategories(!showAllCategories)}
                      className="w-full text-center mt-2 text-[#441208] hover:text-black text-sm py-1"
                    >
                      {showAllCategories
                        ? "Show Less"
                        : `Show More (${categoriesWithCounts.length - INITIAL_ITEMS_TO_SHOW})`}
                    </button>
                  )}
                </div>
              </div>

              {/* Apply Filters Button - Mobile */}
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-3 bg-[#441208] text-white rounded-lg font-medium mt-6"
              >
                Apply Filters
              </button>
            </aside>
          </>
        )}

        {/* LEFT SIDEBAR - Desktop */}
        <aside className="hidden lg:block lg:w-64 shrink-0 lg:sticky lg:top-24 h-fit rounded-xl p-6">
          <h2 className="font-semibold text-xl mb-6">Filters</h2>

          {/* Brand Filter - Desktop */}
          <div className="mb-8">
            <div className="flex justify-between mb-3 text-sm font-medium">
              <span>Brand</span>
              <button
                onClick={() => {
                  setSelectedBrands([]);
                  setShowAllBrands(false);
                }}
                className="opacity-60 cursor-pointer hover:opacity-100 transition-opacity"
              >
                Reset
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {displayBrands.map((brand) => (
                <label
                  key={brand.name}
                  className="flex justify-between items-center mb-3 cursor-pointer group"
                >
                  <div className="flex gap-3 items-center">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand.name)}
                      onChange={() =>
                        toggleFilter(brand.name, setSelectedBrands)
                      }
                      className="accent-[#441208] w-4 h-4"
                    />
                    <span className="group-hover:text-[#441208] transition-colors">
                      {brand.name}
                    </span>
                  </div>
                  <span className="text-gray-500 text-sm">{brand.count}</span>
                </label>
              ))}

              {/* Show More/Less Button */}
              {brandsWithCounts.length > INITIAL_ITEMS_TO_SHOW && (
                <button
                  onClick={() => setShowAllBrands(!showAllBrands)}
                  className="w-full text-center mt-2 text-[#441208] hover:text-black text-sm py-1"
                >
                  {showAllBrands
                    ? "Show Less"
                    : `Show More (${brandsWithCounts.length - INITIAL_ITEMS_TO_SHOW})`}
                </button>
              )}
            </div>
          </div>

          {/* Category Filter - Desktop */}
          <div className="mb-8">
            <div className="flex justify-between mb-3 text-sm font-medium">
              <span>Category</span>
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setShowAllCategories(false);
                }}
                className="opacity-60 cursor-pointer hover:opacity-100 transition-opacity"
              >
                Reset
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              <hr className="mb-3" />
              {displayCategories.map((category) => (
                <label
                  key={category.name}
                  className="flex justify-between items-center mb-3 cursor-pointer group"
                >
                  <div className="flex gap-3 items-center">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.name)}
                      onChange={() =>
                        toggleFilter(category.name, setSelectedCategories)
                      }
                      className="accent-[#441208] w-4 h-4"
                    />
                    <span className="group-hover:text-[#441208] transition-colors">
                      {category.name}
                    </span>
                  </div>
                  <span className="text-gray-500 text-sm">
                    {category.count}
                  </span>
                </label>
              ))}

              {/* Show More/Less Button */}
              {categoriesWithCounts.length > INITIAL_ITEMS_TO_SHOW && (
                <button
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="w-full text-center mt-2 text-[#441208] hover:text-black text-sm py-1"
                >
                  {showAllCategories
                    ? "Show Less"
                    : `Show More (${categoriesWithCounts.length - INITIAL_ITEMS_TO_SHOW})`}
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <section className="flex-1">
          {/* INFO + SORT */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-base sm:text-lg font-medium">
                Showing {filteredProducts.length} of {products.length} products
              </h1>
              {hasActiveFilters && (
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {selectedBrands.length} brand
                  {selectedBrands.length !== 1 ? "s" : ""},
                  {selectedCategories.length} categor
                  {selectedCategories.length !== 1 ? "ies" : "y"} selected
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-white min-w-35 sm:min-w-45"
              >
                <option value="">Default sorting</option>
                <option value="price-low-high">Price: low to high</option>
                <option value="price-high-low">Price: high to low</option>
              </select>

              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setView(3)}
                  className={`p-2 ${view === 3 ? "bg-black text-white" : "bg-white hover:bg-gray-100"}`}
                  title="3-column view"
                >
                  <ThreeGridIcon />
                </button>
                <button
                  onClick={() => setView(4)}
                  className={`p-2 ${view === 4 ? "bg-black text-white" : "bg-white hover:bg-gray-100"}`}
                  title="4-column view"
                >
                  <HiViewGrid size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* ACTIVE FILTERS */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
                Active filters:
              </span>
              {activeFilters.map((filter) => (
                <span
                  key={filter}
                  className="inline-flex items-center gap-1 bg-[#6F433A] text-white px-3 py-1.5 rounded-full text-xs sm:text-sm cursor-pointer hover:bg-[#5a352d] transition-colors"
                  onClick={() => removeActiveFilter(filter)}
                >
                  {filter}
                  <span className="ml-1">×</span>
                </span>
              ))}
              <button
                onClick={clearAll}
                className="text-[#441208] hover:text-black underline text-xs sm:text-sm font-medium"
              >
                Clear all
              </button>
            </div>
          )}

          {/* PRODUCTS */}
          {loading ? (
            <SkeletonLoader />
          ) : paginatedProducts.length === 0 ? (
            <div className="text-center mt-8 sm:mt-16 py-8 sm:py-12 bg-white/50 rounded-xl">
              <p className="text-lg sm:text-xl text-gray-600 mb-4">
                No products found
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAll}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div
                className={`grid gap-4 sm:gap-6 ${
                  view === 3
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                }`}
              >
                {paginatedProducts.map((product) => (
                  <div key={product.id} className="h-full">
                    <ProductCard
                      id={product.id}
                      photo={product.images?.[0] || "/images/placeholder.png"}
                      name={product.title}
                      description={product.description}
                      amount={parseFloat(product.price)}
                      stock={product.stock}
                      slug={product.slug}
                    />
                  </div>
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 sm:mt-10">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={`px-4 sm:px-5 py-2 sm:py-2.5 border rounded-lg transition-colors text-sm sm:text-base ${
                      page === 1
                        ? "border-gray-300 text-gray-400 cursor-not-allowed"
                        : "border-black text-black hover:bg-black hover:text-white"
                    }`}
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base text-gray-700">
                      Page <span className="font-bold">{page}</span> of{" "}
                      <span className="font-bold">{totalPages}</span>
                    </span>
                    <select
                      value={page}
                      onChange={(e) => setPage(Number(e.target.value))}
                      className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 text-sm sm:text-base outline-none bg-white"
                    >
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className={`px-4 sm:px-5 py-2 sm:py-2.5 border rounded-lg transition-colors text-sm sm:text-base ${
                      page === totalPages
                        ? "border-gray-300 text-gray-400 cursor-not-allowed"
                        : "border-black text-black hover:bg-black hover:text-white"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </section>
    </section>
  );
}
