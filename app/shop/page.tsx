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
  const PRODUCTS_PER_PAGE = 8;
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

              {/* Price Slider - Mobile */}
              <div className="mb-8">
                {loading ? (
                  <FilterSkeleton />
                ) : (
                  <>
                    <div className="flex justify-between mb-4 font-medium">
                      <span>Price Range</span>
                      <button
                        onClick={() => {
                          setPriceRange([minPrice, maxPrice]);
                          setPage(1);
                        }}
                        className="opacity-60 cursor-pointer hover:opacity-100 transition-opacity"
                      >
                        Reset
                      </button>
                    </div>

                    {/* Dual Range Slider */}
                    <div className="relative pt-2 pb-6">
                      {/* Range Track Background */}
                      <div className="absolute top-3 left-0 right-0 h-2 bg-gray-300 rounded-full pointer-events-none"></div>
                      
{/* Progress Track (Brown Gradient) */}
                      <div
                        className="absolute top-3 h-2 bg-linear-to-r from-[#973c00] to-[#c94930] rounded-full pointer-events-none"
                        style={{
                          left: `${((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                          right: `${100 - ((priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                        }}
                      ></div>

                      {/* Min Price Input */}
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
                        className="absolute w-full h-2 top-3 pointer-events-none appearance-none bg-transparent cursor-pointer z-30"
                        style={{
                          zIndex: priceRange[0] > (maxPrice - 100) ? 50 : 30,
                        }}
                      />

                      {/* Max Price Input */}
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
                        className="absolute w-full h-2 top-3 pointer-events-none appearance-none bg-transparent cursor-pointer z-40"
                      />

                      <style>{`
                        input[type="range"]::-webkit-slider-thumb {
                          appearance: none;
                          width: 20px;
                          height: 20px;
                          border-radius: 50%;
                          background: #973c00;
                          cursor: pointer;
                          border: 3px solid white;
                          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                          pointer-events: auto;
                        }
                        input[type="range"]::-moz-range-thumb {
                          width: 20px;
                          height: 20px;
                          border-radius: 50%;
                          background: #973c00;
                          cursor: pointer;
                          border: 3px solid white;
                          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                          pointer-events: auto;
                        }
                      `}</style>

                      {/* Labels Below Slider */}
                      <div className="flex justify-between text-xs text-black font-semibold mt-8 px-2">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                      </div>
                    </div>

                    {/* Price Display */}
                    <div className="flex justify-between items-center bg-[#EBE3D5] rounded-lg p-3 mt-4">
                      <div className="text-sm">
                        <span className="text-gray-600">From: </span>
                        <span className="font-bold text-lg text-[#973c00]">${priceRange[0]}</span>
                      </div>
                      <div className="text-gray-400">-</div>
                      <div className="text-sm">
                        <span className="text-gray-600">To: </span>
                        <span className="font-bold text-lg text-[#973c00]">${priceRange[1]}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Artist Filter - Mobile */}
              <div className="mb-8">
                {loading ? (
                  <FilterSkeleton />
                ) : (
                  <>
                    <div className="flex justify-between mb-3 font-medium">
                      <span>Artist</span>
                      <button
                        onClick={() => {
                          setSelectedArtists([]);
                          setShowAllArtists(false);
                        }}
                        className="opacity-60 cursor-pointer hover:opacity-100 transition-opacity"
                      >
                        Reset
                      </button>
                    </div>
                    <div className="max-h-48 overflow-y-auto pr-2">
                      {displayArtists.map((artist) => (
                        <label
                          key={artist.name}
                          className="flex justify-between items-center text-2xl mb-3 cursor-pointer group"
                        >
                          <div className="flex gap-3 items-center">
                            <input
                              type="checkbox"
                              checked={selectedArtists.includes(artist.name)}
                              onChange={() =>
                                toggleFilter(artist.name, setSelectedArtists)
                              }
                              className="accent-[#973c00] w-4 h-4"
                            />
                            <span className="group-hover:text-[#973c00] transition-colors">
                              {artist.name}
                            </span>
                          </div>
                          <span className="text-gray-500 text-sm">
                            {artist.count}
                          </span>
                        </label>
                      ))}

                      {/* Show More/Less Button */}
                      {artistsWithCounts.length > INITIAL_ITEMS_TO_SHOW && (
                        <button
                          onClick={() => setShowAllArtists(!showAllArtists)}
                          className="w-full text-center mt-2 text-[#973c00] hover:text-black text-sm py-1"
                        >
                          {showAllArtists
                            ? "Show Less"
                            : `Show More (${artistsWithCounts.length - INITIAL_ITEMS_TO_SHOW})`}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Category Filter - Mobile */}
              <div className="mb-8">
                {loading ? (
                  <FilterSkeleton />
                ) : (
                  <>
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
                              checked={selectedCategories.includes(
                                category.name,
                              )}
                              onChange={() =>
                                toggleFilter(
                                  category.name,
                                  setSelectedCategories,
                                )
                              }
                              className="accent-[#973c00] w-4 h-4"
                            />
                            <span className="group-hover:text-[#973c00] transition-colors">
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
                          onClick={() =>
                            setShowAllCategories(!showAllCategories)
                          }
                          className="w-full text-center mt-2 text-[#973c00] hover:text-black text-sm py-1"
                        >
                          {showAllCategories
                            ? "Show Less"
                            : `Show More (${categoriesWithCounts.length - INITIAL_ITEMS_TO_SHOW})`}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Apply Filters Button - Mobile */}
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-3 bg-[#973c00] text-white rounded-lg font-medium mt-6"
              >
                Apply Filters
              </button>
            </aside>
          </>
        )}

        {/* LEFT SIDEBAR - Desktop */}
        <aside className="hidden lg:block lg:w-64 shrink-0 lg:sticky lg:top-24 h-fit rounded-xl p-6">
          <h2 className="font-semibold text-xl mb-6">Filters</h2>

          
          <div className="mb-8">
            {loading ? (
              <FilterSkeleton />
            ) : (
              <>
                <div className="flex justify-between mb-4 font-medium">
                  <span>Price Range</span>
                  <button
                    onClick={() => {
                      setPriceRange([minPrice, maxPrice]);
                      setPage(1);
                    }}
                    className="opacity-60 cursor-pointer hover:opacity-100 transition-opacity text-sm underline"
                  >
                    Reset
                  </button>
                </div>

                {/* Dual Range Slider */}
                <div className="relative pt-2 pb-6">
                  {/* Range Track Background */}
                  <div className="absolute top-3 left-0 right-0 h-2 bg-gray-300 rounded-full pointer-events-none"></div>
                  
                  {/* Progress Track (Brown Gradient) */}
                  <div
                className="absolute top-3 h-2 bg-linear-to-r bg-[#973c00] to-[#c94930] rounded-full pointer-events-none"
                    style={{
                      left: `${((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                      right: `${100 - ((priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                    }}
                  ></div>

                  {/* Min Price Input */}
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
                    className="absolute w-full h-2 top-3 pointer-events-none appearance-none bg-transparent cursor-pointer z-30"
                    style={{
                      zIndex: priceRange[0] > ((maxPrice - 100)) ? 50 : 30
                    }}
                  />

                  {/* Max Price Input */}
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
                    className="absolute w-full h-2 top-3 pointer-events-none appearance-none bg-transparent cursor-pointer z-40"
                  />

                  <style>{`
                    input[type="range"]::-webkit-slider-thumb {
                      appearance: none;
                      width: 20px;
                      height: 20px;
                      border-radius: 50%;
                      background: #973c00;
                      cursor: pointer;
                      border: 3px solid white;
                      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                      pointer-events: auto;
                    }
                    input[type="range"]::-moz-range-thumb {
                      width: 20px;
                      height: 20px;
                      border-radius: 50%;
                      background: #973c00;
                      cursor: pointer;
                      border: 3px solid white;
                      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                      pointer-events: auto;
                    }
                  `}</style>

                  {/* Labels Below Slider */}
                  <div className="flex justify-between text-xs text-black font-semibold mt-8 px-2">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Artist Filter - Desktop */}
          <div className="mb-8">
            {loading ? (
              <FilterSkeleton />
            ) : (
              <>
                <div className="flex justify-between mb-3 font-medium">
                  <span>Artist</span>
                  <button
                    onClick={() => {
                      setSelectedArtists([]);
                      setShowAllArtists(false);
                    }}
                    className="opacity-60 cursor-pointer text-sm underline hover:opacity-100 transition-opacity"
                  >
                    Reset
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {displayArtists.map((artist) => (
                    <label
                      key={artist.name}
                      className="flex justify-between items-center text-sm mb-3 cursor-pointer group"
                    >
                      <div className="flex gap-3 items-center">
                        <input
                          type="checkbox"
                          checked={selectedArtists.includes(artist.name)}
                          onChange={() =>
                            toggleFilter(artist.name, setSelectedArtists)
                          }
                          className="accent-[#973c00] w-4 h-4"
                        />
                        <span className="group-hover:text-[#973c00] transition-colors">
                          {artist.name}
                        </span>
                      </div>
                      <span className="text-gray-500 text-sm">
                        {artist.count}
                      </span>
                    </label>
                  ))}

                  {/* Show More/Less Button */}
                  {artistsWithCounts.length > INITIAL_ITEMS_TO_SHOW && (
                    <button
                      onClick={() => setShowAllArtists(!showAllArtists)}
                      className="w-full text-center mt-2 text-[#973c00] hover:text-black text-sm py-1"
                    >
                      {showAllArtists
                        ? "Show Less"
                        : `Show More (${artistsWithCounts.length - INITIAL_ITEMS_TO_SHOW})`}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Category Filter - Desktop */}
          <div className="mb-8">
            {loading ? (
              <FilterSkeleton />
            ) : (
              <>
                <div className="flex justify-between mb-3 font-medium">
                  <span>Category</span>
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                      setShowAllCategories(false);
                    }}
                    className="opacity-60 cursor-pointer hover:opacity-100 transition-opacity text-sm underline"
                  >
                    Reset
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  <hr className="mb-3" />
                  {displayCategories.map((category) => (
                    <label
                      key={category.name}
                      className="flex justify-between items-center mb-3 text-sm cursor-pointer group"
                    >
                      <div className="flex gap-3 items-center">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.name)}
                          onChange={() =>
                            toggleFilter(category.name, setSelectedCategories)
                          }
                          className="accent-[#973c00] w-4 h-4"
                        />
                        <span className="group-hover:text-[#973c00] transition-colors">
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
                      className="w-full text-center mt-2 text-[#973c00] hover:text-black text-sm py-1"
                    >
                      {showAllCategories
                        ? "Show Less"
                        : `Show More (${categoriesWithCounts.length - INITIAL_ITEMS_TO_SHOW})`}
                    </button>
                  )}
                </div>
              </>
            )}
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
          {/* ACTIVE FILTERS */}
          <div className={`flex flex-wrap items-center gap-2 mb-6 min-h-10 transition-all duration-300 ${hasActiveFilters ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            {hasActiveFilters && (
              <>
                <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
                  Active filters:
                </span>
                {debouncedSearchTerm && (
                  <span
                    className="inline-flex items-center gap-1 bg-[#fdf4ef] text-[#973c00] border border-[#973c00]/10 px-3 py-1.5 rounded-full text-xs sm:text-sm cursor-pointer hover:bg-[#fae8de] transition-colors"
                    onClick={clearSearch}
                  >
                    Search: "{debouncedSearchTerm}"<span className="ml-1">×</span>
                  </span>
                )}
                {(priceRange[0] > minPrice || priceRange[1] < maxPrice) && (
                <span
                  className="inline-flex items-center gap-1 bg-[#fdf4ef] text-[#973c00] border border-[#973c00]/10 px-3 py-1.5 rounded-full text-xs sm:text-sm cursor-pointer hover:bg-[#fae8de] transition-colors"
                  onClick={() => {
                    setPriceRange([minPrice, maxPrice]);
                    setPage(1);
                  }}
                >
                  Price: ${priceRange[0]} - ${priceRange[1]}
                  <span className="ml-1">×</span>
                </span>
              )}
                {activeFilters.map((filter) => (
                  <span
                    key={filter}
                    className="inline-flex items-center gap-1 bg-[#fdf4ef] text-[#973c00] border border-[#973c00]/10 px-3 py-1.5 rounded-full text-xs sm:text-sm cursor-pointer hover:bg-[#fae8de] transition-colors"
                    onClick={() => removeActiveFilter(filter)}
                  >
                    {filter}
                    <span className="ml-1">×</span>
                  </span>
                ))}
                <button
                  onClick={clearAll}
                  className="text-[#973c00] hover:text-black underline text-xs sm:text-sm font-medium"
                >
                  Clear all
                </button>
              </>
            )}
          </div>

        

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
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 sm:mt-10">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={`px-4 sm:px-5 py-2 sm:py-2.5 border rounded-lg transition-colors text-sm sm:text-base ${
                      page === 1
                        ? "border-gray-300 text-gray-400 cursor-not-allowed"
                        : "border-[#973c00] text-[#973c00] hover:bg-[#973c00] hover:text-white"
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
                        : "border-[#973c00] text-[#973c00] hover:bg-[#973c00] hover:text-white"
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
