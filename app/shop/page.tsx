"use client";
import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  Suspense,
} from "react";
import { HiViewGrid } from "react-icons/hi";
import { motion } from "framer-motion";
import OptimisticProductCard from "../components/cards/OptimisticProductCard";
import { useCart } from "../context/CartContext";
import { useProducts, Product } from "../hooks/useProducts";
import { useSearchParams } from "next/navigation";

function ShopContent() {
  // Use React Query hook instead of manual fetch
  const {
    data: products = [],
    isLoading: loading,
    error: queryError,
  } = useProducts();
  const searchParams = useSearchParams();

  const error = queryError?.message || null;
  const [sort, setSort] = useState("");
  const [view, setView] = useState<3 | 4>(3);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Price range filter - dual range slider
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showAllArtists, setShowAllArtists] = useState(false);

  const [page, setPage] = useState(1);
  const PRODUCTS_PER_PAGE = 9;
  const [totalPages, setTotalPages] = useState(1);

  // Show more states for filters
  const [showAllCategories, setShowAllCategories] = useState(false);
  const INITIAL_ITEMS_TO_SHOW = 5;

  // Mobile filter drawer state
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { addToCart, getItemQuantity } = useCart();

  /* ---------- DYNAMIC MIN/MAX PRICE ---------- */
  const { minPrice, maxPrice } = useMemo(() => {
    if (products.length === 0) return { minPrice: 0, maxPrice: 1000 };
    
    const prices = products.map(p => parseFloat(p.price));
    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));
    
    // Update price range if it was not set yet
    if (priceRange[0] === 0 && priceRange[1] === 1000) {
      setPriceRange([min, max]);
    }
    
    return { minPrice: min, maxPrice: max };
  }, [products, priceRange]);

  // Handle URL search parameters (search, category, artist)
  useEffect(() => {
    const urlSearchTerm = searchParams.get("search");
    const urlCategory = searchParams.get("category");
    const urlArtist = searchParams.get("artist");
    
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
      setDebouncedSearchTerm(urlSearchTerm);
    }
    
    if (urlCategory) {
      setSelectedCategories([urlCategory]);
      setPage(1);
      setShowMobileFilters(false);
    }
    
    if (urlArtist) {
      setSelectedArtists([urlArtist]);
      setPage(1);
      setShowMobileFilters(false);
    }
  }, [searchParams]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to page 1 when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setPage(1);
  }, []);

  /* ---------- TOGGLE FILTER ---------- */
  const toggleFilter = (
    value: string,
    setState: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setPage(1);
    setActiveTab("all"); // Reset tab when applying manual filters
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
    let filtered = sortedProducts;

    // Apply tab filter first
    switch (activeTab) {
      case "featured":
        filtered = filtered.filter((product) => product.featured === true);
        break;
      case "sale":
        // Filter products that are on sale - either have discount: true or "Sale" in tags
        filtered = filtered.filter(
          (product) =>
            product.discount === true || 
            product.tags?.some(tag => tag.toLowerCase().includes("sale"))
        );
        break;
      case "limited-edition":
        filtered = filtered.filter((product) =>
          product.tags?.includes("Limited Edition"),
        );
        break;
      case "new-arrivals":
        filtered = filtered.filter((product) =>
          product.tags?.includes("New Arrival"),
        );
        break;
      case "all":
      default:
        // No additional filtering
        break;
    }

    // Then apply other filters
    return filtered.filter((product) => {
      const artistMatch =
        selectedArtists.length === 0 ||
        (product.artistName && selectedArtists.includes(product.artistName));

      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category);

      // Price match
      const productPrice = parseFloat(product.price);
      const priceMatch = productPrice >= priceRange[0] && productPrice <= priceRange[1];

      // Search match - check title, description, artist, and category
      const searchMatch =
        !debouncedSearchTerm ||
        product.title
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        product.description
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        (product.artistName &&
          product.artistName
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase())) ||
        product.category
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());

      return artistMatch && categoryMatch && priceMatch && searchMatch;
    });
  }, [
    sortedProducts,
    selectedArtists,
    selectedCategories,
    debouncedSearchTerm,
    activeTab,
    priceRange,
  ]);

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
    () => [...selectedArtists, ...selectedCategories],
    [selectedArtists, selectedCategories],
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

  /* ---------- UNIQUE ARTISTS WITH COUNTS ---------- */
  const artistsWithCounts = useMemo(() => {
    const artistMap = new Map<string, number>();

    products.forEach((product) => {
      const artist = product.artistName;
      if (artist) {
        artistMap.set(artist, (artistMap.get(artist) || 0) + 1);
      }
    });

    return Array.from(artistMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }, [products]);

  const clearAll = () => {
    setSelectedArtists([]);
    setSelectedCategories([]);
    setPriceRange([minPrice, maxPrice]);
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setPage(1);
    setShowMobileFilters(false);
  };

  const removeActiveFilter = (value: string) => {
    setSelectedArtists((prev) => prev.filter((a) => a !== value));
    setSelectedCategories((prev) => prev.filter((c) => c !== value));
    setPage(1);
  };

  const hasActiveFilters =
    selectedArtists.length > 0 ||
    selectedCategories.length > 0 ||
    debouncedSearchTerm.trim().length > 0 ||
    priceRange[0] > minPrice ||
    priceRange[1] < maxPrice;

  const ThreeGridIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="5" height="16" stroke="currentColor" />
      <rect x="9.5" y="4" width="5" height="16" stroke="currentColor" />
      <rect x="17" y="4" width="5" height="16" stroke="currentColor" />
    </svg>
  );

  // Skeleton loader for products
  const SkeletonLoader = () => (
    <div
      className={`grid gap-4 sm:gap-6 ${
        view === 3
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      }`}
    >
      {[...Array(PRODUCTS_PER_PAGE)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-white p-4 rounded-xl shadow-sm"
        >
          <div className="bg-gray-300 h-48 sm:h-56 md:h-64 w-full rounded-lg mb-4"></div>
          <div className="bg-gray-300 h-4 rounded w-3/4 mb-2"></div>
          <div className="bg-gray-300 h-4 rounded w-1/2 mb-4"></div>
          <div className="flex justify-between items-center">
            <div className="bg-gray-300 h-6 rounded w-16"></div>
            <div className="bg-gray-300 h-10 w-24 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Skeleton loader for filter sections
  const FilterSkeleton = () => (
    <div className="animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="bg-gray-300 h-4 rounded w-16"></div>
        <div className="bg-gray-300 h-4 rounded w-12"></div>
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <div className="bg-gray-300 h-4 w-4 rounded"></div>
              <div className="bg-gray-300 h-4 rounded w-20"></div>
            </div>
            <div className="bg-gray-300 h-4 rounded w-6"></div>
          </div>
        ))}
      </div>
    </div>
  );

  // Filter items to display based on showMore state
  const displayArtists = showAllArtists
    ? artistsWithCounts
    : artistsWithCounts.slice(0, INITIAL_ITEMS_TO_SHOW);

  const displayCategories = showAllCategories
    ? categoriesWithCounts
    : categoriesWithCounts.slice(0, INITIAL_ITEMS_TO_SHOW);

  // Show error state without early return to maintain hook order
  if (error) {
    return (
      <section className="bg-[#EBE3D5]">
        <div className="min-h-screen flex items-center justify-center">
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
      </section>
    );
  }

  return (
    <section className=" bg-[#EBE3D5]">
      {/* HERO SECTION */}
      <section className="bg-[#e6e6e6]">
        {/* OUTER FRAME */}
        <div className="max-w-full mx-auto overflow-hidden">
          {/* FULL IMAGE */}
          <div
            className="relative h-[30vh] sm:h-[35vh] md:h-[50vh] lg:h-[65vh]
                   bg-[url('/images/main.png')] bg-cover bg-center"
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Center Text */}
            <div className="relative z-10 pt-6 h-full flex flex-col items-center justify-center text-white text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">
                Shop
              </h1>
               {/* TAB CAROUSEL */}
          <div className="mt-8">
            <div className="flex items-center justify-center overflow-x-auto scrollbar-hide pb-1">
              <div className="flex bg-[#EAD7B7]/90 backdrop-blur-sm rounded-full p-2 border border-[#5A1E12]/10 shadow-xl min-w-fit gap-2 sm:gap-4">
                {[
                  { key: "all", label: "All" },
                  { key: "featured", label: "Featured" },
                  { key: "sale", label: "Sale" },
                  // { key: "limited-edition", label: "Limited Edition", },
                  { key: "new-arrivals", label: "New Arrivals" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setPage(1);
                    }}
                    className={`relative px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors duration-300 whitespace-nowrap flex items-center justify-center gap-1.5 min-w-20 sm:min-w-25 ${
                      activeTab === tab.key
                        ? "text-white"
                        : "text-[#5A1E12] hover:bg-[#5A1E12]/10"
                    }`}
                  >
                    {activeTab === tab.key && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-[#5A1E12] rounded-full shadow-md"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    
                    {/* Label Content */}
                    <span className="relative z-10 hidden sm:inline font-bold tracking-wide">
                      {tab.label}
                    </span>
                    <span className="relative z-10 sm:hidden font-bold tracking-wide">
                      {tab.key === "limited-edition"
                        ? "Limited"
                        : tab.key === "new-arrivals"
                          ? "New"
                          : tab.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab description */}
            <div className="text-center mt-6 h-6">
              <motion.p 
                key={activeTab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-sm font-medium text-white/90 drop-shadow-sm"
              >
                {activeTab === "all" && "Browse all available products"}
                {activeTab === "featured" && "Handpicked premium products"}
                {activeTab === "sale" && "Special offers and discounted items"}
                {activeTab === "limited-edition" &&
                  "Exclusive limited quantity items"}
                {activeTab === "new-arrivals" &&
                  "Latest additions to our collection"}
              </motion.p>
            </div>
          </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* MOBILE FILTER BUTTON */}
      <div className="lg:hidden mx-auto px-4 md:px-8 py-4">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="w-full py-3 bg-[#5A1E12] text-white rounded-xl flex items-center justify-center gap-2 font-medium shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {hasActiveFilters && (
            <span className="bg-white text-[#5A1E12] text-xs font-bold px-2 py-0.5 rounded-full">
              {activeFilters.length}
            </span>
          )}
        </button>
      </div>

      {/* MAIN SHOP LAYOUT */}
      <section className="mx-auto px-4 md:px-8 lg:px-20 py-4 lg:py-10 flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* MOBILE FILTER DRAWER */}
        {showMobileFilters && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setShowMobileFilters(false)}
          />
        )}
        <aside
          className={`
            fixed left-0 top-0 h-screen w-[320px] max-w-[90vw] z-50 flex flex-col bg-white lg:hidden
            transform transition-transform duration-300 ease-out
            ${showMobileFilters ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          {/* ── Header band ── */}
          <div className="shrink-0 bg-[#5A1E12] px-5 pt-10 pb-5 flex items-start justify-between">
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Filters</h2>
              {hasActiveFilters ? (
                <p className="text-white/60 text-xs mt-0.5">{activeFilters.length} active filter{activeFilters.length > 1 ? "s" : ""}</p>
              ) : (
                <p className="text-white/60 text-xs mt-0.5">Narrow down your results</p>
              )}
            </div>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors mt-0.5"
              aria-label="Close filters"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="shrink-0 px-5 py-3 bg-[#EAD7B7]/40 border-b border-gray-100 flex flex-wrap gap-1.5">
              {activeFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => removeActiveFilter(f)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white border border-[#5A1E12]/20 text-[#5A1E12] text-xs rounded-full font-medium hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                >
                  {f}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              ))}
              <button
                onClick={() => { setSelectedArtists([]); setSelectedCategories([]); setPriceRange([minPrice, maxPrice]); setPage(1); }}
                className="px-2.5 py-1 text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
              >
                Clear all
              </button>
            </div>
          )}

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto">

            {/* Price Range */}
            <div className="px-5 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price Range</p>
                <button
                  onClick={() => { setPriceRange([minPrice, maxPrice]); setPage(1); }}
                  className="text-xs text-[#5A1E12] hover:underline"
                >Reset</button>
              </div>
              {loading ? (
                <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
              ) : (
                <>
                  {/* Dual Range Slider */}
                  <div className="relative pt-2 pb-4">
                    <style>{`
                      input[type="range"]::-webkit-slider-thumb {
                        appearance: none; width: 20px; height: 20px;
                        border-radius: 50%; background: #5A1E12;
                        cursor: pointer; border: 3px solid white;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.25); pointer-events: auto;
                      }
                      input[type="range"]::-moz-range-thumb {
                        width: 20px; height: 20px; border-radius: 50%;
                        background: #5A1E12; cursor: pointer; border: 3px solid white;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.25); pointer-events: auto;
                      }
                    `}</style>
                    <div className="absolute top-3 left-0 right-0 h-2 bg-gray-200 rounded-full pointer-events-none" />
                    <div
                      className="absolute top-3 h-2 bg-[#5A1E12] rounded-full pointer-events-none"
                      style={{
                        left: `${((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                        right: `${100 - ((priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                      }}
                    />
                    <input type="range" min={minPrice} max={maxPrice} value={priceRange[0]}
                      onChange={(e) => { const v = Math.min(Number(e.target.value), priceRange[1] - 1); setPriceRange([v, priceRange[1]]); setPage(1); }}
                      className="absolute w-full h-2 top-3 pointer-events-none appearance-none bg-transparent"
                      style={{ zIndex: priceRange[0] > maxPrice - 100 ? 50 : 30 }}
                    />
                    <input type="range" min={minPrice} max={maxPrice} value={priceRange[1]}
                      onChange={(e) => { const v = Math.max(Number(e.target.value), priceRange[0] + 1); setPriceRange([priceRange[0], v]); setPage(1); }}
                      className="absolute w-full h-2 top-3 pointer-events-none appearance-none bg-transparent z-40"
                    />
                    <div className="flex justify-between text-xs font-semibold text-gray-500 mt-8">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                  {/* Price pill */}
                  <div className="flex items-center justify-between bg-[#EAD7B7]/50 rounded-xl px-4 py-2.5 mt-1">
                    <div className="text-center">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide">Min</p>
                      <p className="font-bold text-[#5A1E12]">${priceRange[0]}</p>
                    </div>
                    <div className="w-8 h-px bg-[#5A1E12]/30" />
                    <div className="text-center">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide">Max</p>
                      <p className="font-bold text-[#5A1E12]">${priceRange[1]}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Categories */}
            <div className="px-5 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categories</p>
                {selectedCategories.length > 0 && (
                  <button onClick={() => { setSelectedCategories([]); setShowAllCategories(false); }} className="text-xs text-[#5A1E12] hover:underline">Reset</button>
                )}
              </div>
              {loading ? (
                <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}</div>
              ) : (
                <div className="flex flex-col gap-1">
                  {displayCategories.map((category) => {
                    const active = selectedCategories.includes(category.name);
                    return (
                      <button
                        key={category.name}
                        onClick={() => { toggleFilter(category.name, setSelectedCategories); setPage(1); }}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                          active ? "bg-[#5A1E12] text-white font-medium" : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? "bg-white" : "bg-[#5A1E12]/30"}`} />
                          {category.name}
                        </div>
                        <span className={`text-xs ${active ? "text-white/70" : "text-gray-400"}`}>{category.count}</span>
                      </button>
                    );
                  })}
                  {categoriesWithCounts.length > INITIAL_ITEMS_TO_SHOW && (
                    <button onClick={() => setShowAllCategories(!showAllCategories)} className="text-xs text-[#5A1E12] hover:underline mt-1 text-center py-1">
                      {showAllCategories ? "Show Less" : `+${categoriesWithCounts.length - INITIAL_ITEMS_TO_SHOW} more`}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Artists */}
            <div className="px-5 pt-5 pb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Artists</p>
                {selectedArtists.length > 0 && (
                  <button onClick={() => { setSelectedArtists([]); setShowAllArtists(false); }} className="text-xs text-[#5A1E12] hover:underline">Reset</button>
                )}
              </div>
              {loading ? (
                <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}</div>
              ) : (
                <div className="flex flex-col gap-1">
                  {displayArtists.map((artist) => {
                    const active = selectedArtists.includes(artist.name);
                    return (
                      <button
                        key={artist.name}
                        onClick={() => { toggleFilter(artist.name, setSelectedArtists); setPage(1); }}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                          active ? "bg-[#5A1E12] text-white font-medium" : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${active ? "bg-white/20" : "bg-[#EAD7B7]/60"}`}>
                            <svg className={`w-3 h-3 ${active ? "text-white" : "text-[#5A1E12]"}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                          </div>
                          {artist.name}
                        </div>
                        <span className={`text-xs ${active ? "text-white/70" : "text-gray-400"}`}>{artist.count}</span>
                      </button>
                    );
                  })}
                  {artistsWithCounts.length > INITIAL_ITEMS_TO_SHOW && (
                    <button onClick={() => setShowAllArtists(!showAllArtists)} className="text-xs text-[#5A1E12] hover:underline mt-1 text-center py-1">
                      {showAllArtists ? "Show Less" : `+${artistsWithCounts.length - INITIAL_ITEMS_TO_SHOW} more`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Footer CTA ── */}
          <div className="shrink-0 p-4 bg-white border-t border-gray-100 flex gap-3">
            <button
              onClick={() => { setSelectedArtists([]); setSelectedCategories([]); setPriceRange([minPrice, maxPrice]); setPage(1); }}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Reset All
            </button>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="flex-1 py-3 rounded-xl bg-[#5A1E12] text-white text-sm font-medium hover:bg-[#4a180f] transition-colors"
            >
              Show Results
            </button>
          </div>
        </aside>

        {/* LEFT SIDEBAR - Desktop */}
        {/* LEFT SIDEBAR - Desktop Redesigned */}
        <aside className="hidden lg:flex lg:flex-col lg:w-72 shrink-0 lg:sticky lg:top-24 h-fit rounded-2xl overflow-hidden border border-gray-100 shadow-sm">

          {/* ── Header band ── */}
          <div className="bg-[#5A1E12] px-5 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-base leading-tight">Filters</h2>
              <p className="text-white/60 text-xs mt-0.5">
                {hasActiveFilters
                  ? `${activeFilters.length} active filter${activeFilters.length !== 1 ? "s" : ""}`
                  : "Narrow your results"}
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={() => { clearAll(); setPage(1); }}
                className="text-xs text-white/80 hover:text-white border border-white/30 hover:border-white/60 px-3 py-1.5 rounded-full transition-all"
              >
                Clear all
              </button>
            )}
          </div>

          {/* ── Body ── */}
          <div className="bg-white divide-y divide-gray-100">

            {/* Price Range */}
            <div className="px-5 py-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price Range</p>
                {(priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
                  <button
                    onClick={() => { setPriceRange([minPrice, maxPrice]); setPage(1); }}
                    className="text-xs text-[#5A1E12] hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              {loading ? (
                <FilterSkeleton />
              ) : (
                <>
                  {/* Price pills */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-center">
                      <p className="text-[10px] text-gray-400 mb-0.5">Min</p>
                      <p className="text-sm font-semibold text-gray-800">${priceRange[0]}</p>
                    </div>
                    <div className="w-4 h-px bg-gray-300" />
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-center">
                      <p className="text-[10px] text-gray-400 mb-0.5">Max</p>
                      <p className="text-sm font-semibold text-gray-800">${priceRange[1]}</p>
                    </div>
                  </div>

                  {/* Dual Range Slider */}
                  <div className="relative pt-2 pb-2">
                    <div className="absolute top-3 left-0 right-0 h-1.5 bg-gray-200 rounded-full pointer-events-none"></div>
                    <div
                      className="absolute top-3 h-1.5 bg-[#5A1E12] rounded-full pointer-events-none"
                      style={{
                        left: `${((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                        right: `${100 - ((priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                      }}
                    />
                    <input
                      type="range"
                      min={minPrice}
                      max={maxPrice}
                      value={priceRange[0]}
                      onChange={(e) => {
                        const val = Math.min(Number(e.target.value), priceRange[1] - 1);
                        setPriceRange([val, priceRange[1]]);
                        setPage(1);
                      }}
                      className="desktop-range absolute w-full h-1.5 top-3 pointer-events-none appearance-none bg-transparent cursor-pointer"
                      style={{ zIndex: priceRange[0] > maxPrice - 100 ? 50 : 30 }}
                    />
                    <input
                      type="range"
                      min={minPrice}
                      max={maxPrice}
                      value={priceRange[1]}
                      onChange={(e) => {
                        const val = Math.max(Number(e.target.value), priceRange[0] + 1);
                        setPriceRange([priceRange[0], val]);
                        setPage(1);
                      }}
                      className="desktop-range absolute w-full h-1.5 top-3 pointer-events-none appearance-none bg-transparent cursor-pointer z-40"
                    />
                    <style>{`
                      .desktop-range::-webkit-slider-thumb {
                        appearance: none;
                        width: 18px;
                        height: 18px;
                        border-radius: 50%;
                        background: #5A1E12;
                        cursor: pointer;
                        border: 2.5px solid white;
                        box-shadow: 0 1px 4px rgba(90,30,18,0.35);
                        pointer-events: auto;
                      }
                      .desktop-range::-moz-range-thumb {
                        width: 18px;
                        height: 18px;
                        border-radius: 50%;
                        background: #5A1E12;
                        cursor: pointer;
                        border: 2.5px solid white;
                        box-shadow: 0 1px 4px rgba(90,30,18,0.35);
                        pointer-events: auto;
                      }
                    `}</style>
                    {/* spacer so the relative container has height */}
                    <div className="h-5" />
                  </div>
                </>
              )}
            </div>

            {/* Categories */}
            <div className="px-5 py-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categories</p>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => { setSelectedCategories([]); setShowAllCategories(false); setPage(1); }}
                    className="text-xs text-[#5A1E12] hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              {loading ? (
                <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}</div>
              ) : (
                <div className="flex flex-col gap-1">
                  {displayCategories.map((category) => {
                    const active = selectedCategories.includes(category.name);
                    return (
                      <button
                        key={category.name}
                        onClick={() => { toggleFilter(category.name, setSelectedCategories); setPage(1); }}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                          active ? "bg-[#5A1E12] text-white font-medium" : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${active ? "bg-white/70" : "bg-[#EAD7B7]"}`} />
                          <span className="text-left leading-tight">{category.name}</span>
                        </div>
                        <span className={`text-xs shrink-0 ml-2 ${active ? "text-white/70" : "text-gray-400"}`}>{category.count}</span>
                      </button>
                    );
                  })}
                  {categoriesWithCounts.length > INITIAL_ITEMS_TO_SHOW && (
                    <button
                      onClick={() => setShowAllCategories(!showAllCategories)}
                      className="text-xs text-[#5A1E12] hover:underline mt-1 text-center py-1"
                    >
                      {showAllCategories ? "Show Less" : `+${categoriesWithCounts.length - INITIAL_ITEMS_TO_SHOW} more`}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Artists */}
            <div className="px-5 py-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Artists</p>
                {selectedArtists.length > 0 && (
                  <button
                    onClick={() => { setSelectedArtists([]); setShowAllArtists(false); setPage(1); }}
                    className="text-xs text-[#5A1E12] hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              {loading ? (
                <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}</div>
              ) : (
                <div className="flex flex-col gap-1">
                  {displayArtists.map((artist) => {
                    const active = selectedArtists.includes(artist.name);
                    return (
                      <button
                        key={artist.name}
                        onClick={() => { toggleFilter(artist.name, setSelectedArtists); setPage(1); }}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                          active ? "bg-[#5A1E12] text-white font-medium" : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${active ? "bg-white/20" : "bg-[#EAD7B7]/60"}`}>
                            <svg className={`w-3 h-3 ${active ? "text-white" : "text-[#5A1E12]"}`} fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                            </svg>
                          </div>
                          <span>{artist.name}</span>
                        </div>
                        <span className={`text-xs ${active ? "text-white/70" : "text-gray-400"}`}>{artist.count}</span>
                      </button>
                    );
                  })}
                  {artistsWithCounts.length > INITIAL_ITEMS_TO_SHOW && (
                    <button
                      onClick={() => setShowAllArtists(!showAllArtists)}
                      className="text-xs text-[#5A1E12] hover:underline mt-1 text-center py-1"
                    >
                      {showAllArtists ? "Show Less" : `+${artistsWithCounts.length - INITIAL_ITEMS_TO_SHOW} more`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <section className="flex-1">
          {/* INFO + SORT */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="min-h-14 flex flex-col justify-center">
              <h1 className="text-base sm:text-lg font-medium">
                Showing {filteredProducts.length} of {products.length} products
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 transition-all duration-300">
                {hasActiveFilters ? (
                  <>
                    {selectedArtists.length > 0 && `${selectedArtists.length} artist${selectedArtists.length !== 1 ? "s" : ""}, `}
                    {selectedCategories.length > 0 && `${selectedCategories.length} categor${selectedCategories.length !== 1 ? "ies" : "y"} selected`}
                    {/* If we have active filters but no text yet (e.g. only price/search), show generic text */}
                    {selectedArtists.length === 0 && selectedCategories.length === 0 && "Filters active"}
                  </>
                ) : (
                  "No filters selected"
                )}
              </p>
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
                  className={`p-2 ${view === 3 ? "bg-[#973c00] text-white" : "bg-white hover:bg-gray-100"}`}
                  title="3-column view"
                >
                  <ThreeGridIcon />
                </button>
                <button
                  onClick={() => setView(4)}
                  className={`p-2 ${view === 4 ? "bg-[#973c00] text-white" : "bg-white hover:bg-gray-100"}`}
                  title="4-column view"
                >
                  <HiViewGrid size={20} />
                </button>
              </div>
            </div>
          </div>
          {/* ACTIVE FILTERS — only renders when something is selected; no empty space otherwise */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-5 px-4 py-3 bg-[#5A1E12]/5 rounded-2xl border border-[#5A1E12]/10">
              <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest shrink-0">
                Active filters:
              </span>

              {debouncedSearchTerm && (
                <button
                  onClick={clearSearch}
                  className="inline-flex items-center gap-1 bg-white text-[#5A1E12] border border-[#5A1E12]/20 px-2.5 py-1 rounded-full text-xs hover:bg-[#5A1E12] hover:text-white hover:border-[#5A1E12] transition-all"
                >
                  Search: &quot;{debouncedSearchTerm}&quot;
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}

              {(priceRange[0] > minPrice || priceRange[1] < maxPrice) && (
                <button
                  onClick={() => { setPriceRange([minPrice, maxPrice]); setPage(1); }}
                  className="inline-flex items-center gap-1 bg-white text-[#5A1E12] border border-[#5A1E12]/20 px-2.5 py-1 rounded-full text-xs hover:bg-[#5A1E12] hover:text-white hover:border-[#5A1E12] transition-all"
                >
                  ${priceRange[0]} – ${priceRange[1]}
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}

              {activeFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => removeActiveFilter(filter)}
                  className="inline-flex items-center gap-1 bg-white text-[#5A1E12] border border-[#5A1E12]/20 px-2.5 py-1 rounded-full text-xs hover:bg-[#5A1E12] hover:text-white hover:border-[#5A1E12] transition-all"
                >
                  {filter}
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              ))}

              <button
                onClick={clearAll}
                className="ml-auto text-xs font-semibold text-[#5A1E12] hover:underline"
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
                  <OptimisticProductCard
                    key={product.id}
                    id={product.id}
                    photo={product.images?.[0] || "/images/placeholder.png"}
                    name={product.title}
                    description={product.description}
                    amount={parseFloat(product.price)}
                    stock={product.stock}
                    slug={product.slug}
                    tags={product.tags}
                    featured={product.featured}
                    artistName={product.artistName}
                  />
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="mt-10 flex flex-col items-center gap-3">

                  {/* Controls row */}
                  <div className="flex items-center gap-1">

                    {/* Prev */}
                    <button
                      disabled={page === 1}
                      onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        page === 1
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      <span className="hidden sm:inline">Prev</span>
                    </button>

                    {/* Numbered pages with ellipsis */}
                    {(() => {
                      const pages: (number | "...")[] = [];
                      if (totalPages <= 7) {
                        for (let i = 1; i <= totalPages; i++) pages.push(i);
                      } else {
                        pages.push(1);
                        if (page > 3) pages.push("...");
                        for (
                          let i = Math.max(2, page - 1);
                          i <= Math.min(totalPages - 1, page + 1);
                          i++
                        ) pages.push(i);
                        if (page < totalPages - 2) pages.push("...");
                        pages.push(totalPages);
                      }
                      return pages.map((p, idx) =>
                        p === "..." ? (
                          <span
                            key={`ellipsis-${idx}`}
                            className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm select-none"
                          >
                            …
                          </span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => {
                              setPage(p as number);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                              page === p
                                ? "bg-[#5A1E12] text-white shadow-sm shadow-[#5A1E12]/30"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            }`}
                          >
                            {p}
                          </button>
                        )
                      );
                    })()}

                    {/* Next */}
                    <button
                      disabled={page === totalPages}
                      onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        page === totalPages
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </section>
    </section>
  );
}

/* =======================
   LOADING COMPONENT
======================= */
function ShopLoading() {
  return (
    <section className="min-h-screen bg-[url('/images/main-bg.png')] bg-repeat bg-center">
      <section className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A1E12]"></div>
        </div>
      </section>
    </section>
  );
}

/* =======================
   MAIN PAGE COMPONENT
======================= */
export default function Page() {
  return (
    <Suspense fallback={<ShopLoading />}>
      <ShopContent />
    </Suspense>
  )
}
