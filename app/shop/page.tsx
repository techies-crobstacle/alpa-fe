// app/shop/page.tsx
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
  brand?: string; // Added brand field
  slug?: string; // Added slug for navigation
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

  const { addToCart, getItemQuantity } = useCart();

  /* ---------- DATA FETCH ---------- */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseURL}/api/products/all`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        
        // Extract brand from title if not provided (fallback logic)
        const productsWithBrand = data.products.map((product: Product) => ({
          ...product,
          brand: product.brand || product.title.split(' ')[0], // Extract first word as brand
          slug: product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') // Generate slug
        }));
        
        setProducts(productsWithBrand);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
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
        selectedBrands.includes(product.brand || "");

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

  /* ---------- UNIQUE CATEGORIES ---------- */
  const categories = useMemo(() => 
    Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
    [products]
  );

  /* ---------- UNIQUE BRANDS ---------- */
  const brands = useMemo(() => 
    Array.from(new Set(products.map((p) => p.brand).filter(Boolean))),
    [products]
  );

  const clearAll = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setPage(1);
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
    <div className={`grid gap-8 ${view === 3 ? "grid-cols-3" : "grid-cols-4"}`}>
      {[...Array(PRODUCTS_PER_PAGE)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-300 h-64 rounded-lg mb-4"></div>
          <div className="bg-gray-300 h-4 rounded w-3/4 mb-2"></div>
          <div className="bg-gray-300 h-4 rounded w-1/2 mb-4"></div>
          <div className="bg-gray-300 h-10 rounded"></div>
        </div>
      ))}
    </div>
  );

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
    <section className="bg-[#EBE3D5] min-h-screen">
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
      <section className="mx-auto px-4 md:px-8 lg:px-20 py-10 flex flex-col lg:flex-row gap-8 mt-5">
        {/* LEFT SIDEBAR */}
        <aside className="lg:w-64 shrink-0 lg:sticky lg:top-24 h-fit bg-white/50 rounded-xl p-6 lg:p-0 lg:bg-transparent">
          <h2 className="font-semibold text-xl mb-6">Filters</h2>

          {/* Brand Filter */}
          <div className="mb-8">
            <div className="flex justify-between mb-3 text-sm font-medium">
              <span>Brand</span>
              <button
                onClick={() => setSelectedBrands([])}
                className="opacity-60 cursor-pointer hover:opacity-100 transition-opacity"
              >
                Reset
              </button>
            </div>


{/* check and fix this on monday */}
            {/* <div className="max-h-48 overflow-y-auto pr-2">
              {brands.map((b) => (
                <label key={b} className="flex gap-3 items-center mb-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(b)}
                    onChange={() => toggleFilter(b, setSelectedBrands)}
                    className="accent-[#441208] w-4 h-4"
                  />
                  <span className="group-hover:text-[#441208] transition-colors">{b}</span>
                </label>
              ))}
            </div> */}
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex justify-between mb-3 text-sm font-medium">
              <span>Category</span>
              <button
                onClick={() => setSelectedCategories([])}
                className="opacity-60 cursor-pointer hover:opacity-100 transition-opacity"
              >
                Reset
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto pr-2">
              {categories.map((c) => (
                <label key={c} className="flex gap-3 items-center mb-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(c)}
                    onChange={() => toggleFilter(c, setSelectedCategories)}
                    className="accent-[#441208] w-4 h-4"
                  />
                  <span className="group-hover:text-[#441208] transition-colors">{c}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <section className="flex-1">
          {/* INFO + SORT */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-lg font-medium">
                Showing {filteredProducts.length} of {products.length} products
              </h1>
              {hasActiveFilters && (
                <p className="text-sm text-gray-600 mt-1">
                  {selectedBrands.length} brand{selectedBrands.length !== 1 ? 's' : ''}, 
                  {selectedCategories.length} categor{selectedCategories.length !== 1 ? 'ies' : 'y'} selected
                </p>
              )}
            </div>

            <div className="flex gap-4 items-center">
              <select 
                value={sort} 
                onChange={(e) => setSort(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-white"
              >
                <option value="">Default sorting</option>
                <option value="price-low-high">Price: low to high</option>
                <option value="price-high-low">Price: high to low</option>
              </select>

              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button 
                  onClick={() => setView(3)}
                  className={`p-2 ${view === 3 ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
                  title="3-column view"
                >
                  <ThreeGridIcon />
                </button>
                <button 
                  onClick={() => setView(4)}
                  className={`p-2 ${view === 4 ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
                  title="4-column view"
                >
                  <HiViewGrid size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* ACTIVE FILTERS */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-6">
              {activeFilters.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1 bg-[#6F433A] text-white px-3 py-1.5 rounded-full text-sm cursor-pointer hover:bg-[#5a352d] transition-colors"
                  onClick={() => removeActiveFilter(f)}
                >
                  {f}
                  <span className="ml-1">×</span>
                </span>
              ))}
              <button 
                onClick={clearAll} 
                className="text-[#441208] hover:text-black underline text-sm font-medium"
              >
                Clear all
              </button>
            </div>
          )}

          {/* PRODUCTS */}
          {loading ? (
            <SkeletonLoader />
          ) : paginatedProducts.length === 0 ? (
            <div className="text-center mt-16 py-12 bg-white/50 rounded-xl">
              <p className="text-xl text-gray-600 mb-4">No products found</p>
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
                className={`grid gap-6 ${
                  view === 3 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
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
                    stock={product.stock}
                    slug={product.slug}
                    onAddToCart={() => addToCart({
                      id: product.id,
                      name: product.title,
                      price: Number(product.price),
                      image: product.images?.[0] || "/images/placeholder.png",
                      stock: product.stock,
                      slug: product.slug
                    })}
                    currentQuantity={getItemQuantity(product.id)}
                  />
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={`px-5 py-2.5 border rounded-lg transition-colors ${
                      page === 1 
                        ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                        : 'border-black text-black hover:bg-black hover:text-white'
                    }`}
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-700">
                      Page <span className="font-bold">{page}</span> of <span className="font-bold">{totalPages}</span>
                    </span>
                    <select
                      value={page}
                      onChange={(e) => setPage(Number(e.target.value))}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 outline-none bg-white"
                    >
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className={`px-5 py-2.5 border rounded-lg transition-colors ${
                      page === totalPages 
                        ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                        : 'border-black text-black hover:bg-black hover:text-white'
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