// /*
// // app/components/Header.tsx
// "use client";

// import { useState, useEffect, useRef } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { usePathname, useRouter } from "next/navigation";
// import { ShoppingCart, Menu, X, User, LogOut, Package, Settings } from "lucide-react";
// import MiniCart from "../cards/MiniCart";
// import { useAuth } from "../../context/AuthContext";
// import { useCart } from "@/app/context/CartContext";

// const NAV_LINKS = [
//   { label: "Home", href: "/" },
//   { label: "About us", href: "/about-us" },
//   { label: "Shop", href: "/shop" },
//   { label: "Contact Us", href: "/contact-us" },
//   { label: "Privacy", href: "/privacy" },
//   { label: "Disclaimer", href: "/disclaimer" },
// ];

// export default function Header() {
//   const pathname = usePathname();
//   const [cartOpen, setCartOpen] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const [userMenuOpen, setUserMenuOpen] = useState(false);
//   const cartRef = useRef<HTMLDivElement>(null);
//   const cartButtonRef = useRef<HTMLButtonElement>(null);
//   const userMenuRef = useRef<HTMLDivElement>(null);

//   const { user, logout, fetchUser, loading } = useAuth();
//   const router = useRouter();

//   // Get cart items and calculate total count
//   const { cartItems } = useCart();
//   const cartItemCount = cartItems.reduce((total, item) => total + item.qty, 0);

//   // Fetch user profile on mount and when auth state changes
//   useEffect(() => {
//     fetchUser();
//   }, []);

//   // Close cart when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       // Check if click is outside cart panel and cart button
//       const isOutsideCartPanel =
//         cartRef.current && !cartRef.current.contains(event.target as Node);
//       const isOutsideCartButton =
//         cartButtonRef.current &&
//         !cartButtonRef.current.contains(event.target as Node);

//       if (isOutsideCartPanel && isOutsideCartButton) {
//         setCartOpen(false);
//       }

//       // Check if click is outside user menu
//       if (
//         userMenuRef.current &&
//         !userMenuRef.current.contains(event.target as Node)
//       ) {
//         setUserMenuOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);

//     if (cartOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "unset";
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//       document.body.style.overflow = "unset";
//     };
//   }, [cartOpen, userMenuOpen]);

//   // Scroll effect for header
//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 20);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   // Close cart when pressing Escape key
//   useEffect(() => {
//     const handleEscape = (event: KeyboardEvent) => {
//       if (event.key === "Escape") {
//         setCartOpen(false);
//         setUserMenuOpen(false);
//       }
//     };

//     document.addEventListener("keydown", handleEscape);

//     return () => {
//       document.removeEventListener("keydown", handleEscape);
//     };
//   }, []);

//   const isActive = (href: string) => {
//     if (href === "/") return pathname === "/";
//     return pathname === href || pathname.startsWith(`${href}/`);
//   };

//   const toggleCart = () => {
//     setCartOpen(!cartOpen);
//   };

//   const handleLogout = async () => {
//     setUserMenuOpen(false);
//     setMobileMenuOpen(false);
//     await logout();
//   };

//   const handleNavigation = (href: string) => {
//     setUserMenuOpen(false);
//     setMobileMenuOpen(false);
//     router.push(href);
//   };

//   return (
//     <div className="">
//       {/* Cart Overlay */}
//       {cartOpen && (
//         <div
//           className="fixed inset-0 bg-black/20 z-40 animate-fadeIn"
//           onClick={() => setCartOpen(false)}
//         />
//       )}

//       {/* Main Header */}
//       <header
//         className={`fixed -top-2 left-4 right-4 lg:left-10 lg:right-10 rounded-full px-6 md:px-12 py-3
//           flex items-center justify-between shadow-xl transition-all duration-500 z-50
//           ${scrolled ? "bg-[#EAD7B7]/95 backdrop-blur-md shadow-lg" : "bg-[#EAD7B7]"}
//         `}
//       >
//         {/* Logo */}
//         <Link
//           href="/"
//           className="font-bold transition-transform hover:scale-105 active:scale-95"
//         >
//           <Image
//             src="/images/navbarLogo.png"
//             width={500}
//             height={500}
//             alt="Logo"
//             className="w-10 md:w-12"
//             priority
//           />
//         </Link>

//         {/* Desktop Navigation */}
//         <nav className="hidden md:flex gap-4 lg:gap-6">
//           {NAV_LINKS.map(({ label, href }) => (
//             <Link
//               key={href}
//               href={href}
//               className={`group relative px-2 py-1 text-sm lg:text-base font-medium transition-all duration-300
//                 ${
//                   isActive(href)
//                     ? "text-[#5A1E12] font-semibold"
//                     : "text-gray-700 hover:text-[#5A1E12]"
//                 }
//               `}
//             >
//               {label}
//               {/* Animated underline from left to right */}
//               <span
//                 className={`
//                   pointer-events-none
//                   absolute left-0 bottom-0 h-0.5 w-full bg-[#5A1E12] rounded-full
//                   transition-transform duration-300 origin-left
//                   ${
//                     isActive(href)
//                       ? "scale-x-100"
//                       : "scale-x-0 group-hover:scale-x-100"
//                   }
//                 `}
//               />
//             </Link>
//           ))}
//         </nav>

//         {/* Right Side Actions */}
//         <div className="flex items-center gap-3 md:gap-6">
//           {/* Cart Button */}
//           <div className="relative">
//             <button
//               ref={cartButtonRef}
//               onClick={toggleCart}
//               className="relative p-2 rounded-full hover:bg-white/30 transition-all duration-300 group"
//               aria-label={`Shopping cart with ${cartItemCount} items`}
//               aria-expanded={cartOpen}
//             >
//               <ShoppingCart
//                 className={`h-5 w-5 md:h-6 md:w-6 text-gray-800 transition-transform duration-300 ${
//                   cartOpen ? "rotate-12 scale-110" : "group-hover:scale-110"
//                 }`}
//               />

//               {cartItemCount > 0 && (
//                 <>
//                   {!cartOpen && (
//                     <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-75" />
//                   )}
//                   <span
//                     className={`absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center bg-linear-to-br from-red-500 to-red-600 text-white rounded-full font-bold shadow-sm transition-transform duration-300 ${
//                       cartOpen ? "scale-125" : ""
//                     }`}
//                   >
//                     {cartItemCount > 9 ? "9+" : cartItemCount}
//                   </span>
//                 </>
//               )}
//             </button>

//             {/* Mini Cart Panel */}
//             <div
//               ref={cartRef}
//               className={`
//                 fixed top-0 right-0 bg-[#ead7b7] h-screen w-96 max-w-[90vw] rounded-2xl
//                 transform transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
//                 z-50
//                 ${
//                   cartOpen
//                     ? "translate-x-0 opacity-100"
//                     : "translate-x-full opacity-0 pointer-events-none"
//                 }
//               `}
//             >
//               <MiniCart onClose={() => setCartOpen(false)} />
//             </div>
//           </div>

//           {/* User Authentication */}
//           {loading ? (
//             <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
//           ) : !user ? (
//             <div className="flex items-center gap-3">
//               <Link
//                 href="/login"
//                 className="hidden md:block font-medium text-gray-800 text-sm hover:text-[#5A1E12] transition-colors px-3 py-1.5 rounded-full hover:bg-white/30"
//               >
//                 Login
//               </Link>
//               <Link
//                 href="/signup"
//                 className="hidden md:block font-medium bg-[#5A1E12] text-white text-sm hover:bg-[#4a180f] transition-colors px-4 py-1.5 rounded-full"
//               >
//                 Sign Up
//               </Link>
//             </div>
//           ) : (
//             <div className="relative" ref={userMenuRef}>
//               <button
//                 onClick={() => setUserMenuOpen(!userMenuOpen)}
//                 className="flex items-center gap-2 group"
//                 aria-label="User menu"
//                 aria-expanded={userMenuOpen}
//               >
//                 <div className="relative">
//                   {user.profileImage ? (
//                     <div className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#5A1E12] transition-colors">
//                       <Image
//                         src={user.profileImage}
//                         alt={user.name || "User"}
//                         width={36}
//                         height={36}
//                         className="w-full h-full object-cover"
//                       />
//                     </div>
//                   ) : (
//                     <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-[#EAD7B7] to-[#5A1E12] flex items-center justify-center border-2 border-transparent group-hover:border-[#5A1E12] transition-colors">
//                       <User className="w-4 h-4 text-white" />
//                     </div>
//                   )}
//                 </div>
//                 <span className="hidden md:inline font-medium text-gray-800 text-sm">
//                   {user.name?.split(" ")[0] || "User"}
//                 </span>
//                 <svg
//                   className={`w-4 h-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M19 9l-7 7-7-7"
//                   />
//                 </svg>
//               </button>

//               {userMenuOpen && (
//                 <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-100 animate-fadeIn">
//                   {/* User Info */}
//                   <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-[#EAD7B7]/10 to-transparent">
//                     <p className="font-semibold text-gray-900 truncate">{user.name}</p>
//                     <p className="text-sm text-gray-500 truncate">{user.email}</p>
//                   </div>

//                   {/* Menu Items */}
//                   <div className="py-2">
//                     <button
//                       onClick={() => handleNavigation("/profile")}
//                       className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 text-sm"
//                     >
//                       <User className="w-4 h-4" />
//                       <span>My Profile</span>
//                     </button>

//                     <button
//                       onClick={() => handleNavigation("/orders")}
//                       className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 text-sm"
//                     >
//                       <Package className="w-4 h-4" />
//                       <span>My Orders</span>
//                     </button>

//                     {user.role === "admin" && (
//                       <button
//                         onClick={() => handleNavigation("/admin")}
//                         className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 text-sm"
//                       >
//                         <Settings className="w-4 h-4" />
//                         <span>Admin Dashboard</span>
//                       </button>
//                     )}

//                     <div className="border-t border-gray-100 mt-2">
//                       <button
//                         onClick={handleLogout}
//                         className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600 text-sm"
//                       >
//                         <LogOut className="w-4 h-4" />
//                         <span>Logout</span>
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Mobile Menu Button */}
//           <button
//             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//             className="md:hidden p-2 rounded-full hover:bg-white/30 transition-colors"
//             aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
//           >
//             {mobileMenuOpen ? (
//               <X className="h-5 w-5" />
//             ) : (
//               <Menu className="h-5 w-5" />
//             )}
//           </button>
//         </div>
//       </header>

//       {/* Mobile Menu Overlay */}
//       {mobileMenuOpen && (
//         <div
//           className="fixed inset-0 bg-black/30 z-40 md:hidden animate-fadeIn"
//           onClick={() => setMobileMenuOpen(false)}
//         />
//       )}

//       {/* Mobile Menu Panel */}
//       <div
//         className={`fixed top-0 right-0 h-screen w-80 max-w-[85vw] bg-[#EAD7B7] z-40
//           transform transition-transform duration-300 ease-out md:hidden
//           ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}
//         `}
//       >
//         {/* Mobile Header */}
//         <div className="p-6 border-b border-white/30 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             {user ? (
//               <>
//                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#EAD7B7] to-[#5A1E12] flex items-center justify-center">
//                   {user.profileImage ? (
//                     <Image
//                       src={user.profileImage}
//                       alt={user.name || "User"}
//                       width={40}
//                       height={40}
//                       className="rounded-full"
//                     />
//                   ) : (
//                     <User className="w-5 h-5 text-white" />
//                   )}
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-900">{user.name?.split(" ")[0] || "User"}</p>
//                   <p className="text-xs text-gray-600 truncate">{user.email}</p>
//                 </div>
//               </>
//             ) : (
//               <h3 className="font-bold text-lg text-gray-800">Menu</h3>
//             )}
//           </div>
//           <button
//             onClick={() => setMobileMenuOpen(false)}
//             className="p-2 rounded-full hover:bg-white/30"
//           >
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         {/* Mobile Navigation */}
//         <nav className="flex flex-col p-4 space-y-1">
//           {NAV_LINKS.map(({ label, href }) => (
//             <Link
//               key={href}
//               href={href}
//               onClick={() => setMobileMenuOpen(false)}
//               className={`
//                 px-4 py-3 rounded-xl text-base font-medium transition-all
//                 ${
//                   isActive(href)
//                     ? "bg-white text-[#5A1E12] shadow-sm"
//                     : "text-gray-700 hover:bg-white/50"
//                 }
//               `}
//             >
//               {label}
//             </Link>
//           ))}

//           {/* Mobile Auth Buttons */}
//           <div className="pt-4 mt-4 border-t border-white/30">
//             {!user ? (
//               <div className="flex flex-col gap-2">
//                 <Link
//                   href="/login"
//                   onClick={() => setMobileMenuOpen(false)}
//                   className="px-4 py-3 rounded-xl bg-white/50 text-gray-700 hover:bg-white transition-colors text-center"
//                 >
//                   Login
//                 </Link>
//                 <Link
//                   href="/signup"
//                   onClick={() => setMobileMenuOpen(false)}
//                   className="px-4 py-3 rounded-xl bg-[#5A1E12] text-white hover:bg-[#4a180f] transition-colors text-center"
//                 >
//                   Sign Up
//                 </Link>
//               </div>
//             ) : (
//               <div className="flex flex-col gap-2">
//                 <Link
//                   href="/profile"
//                   onClick={() => setMobileMenuOpen(false)}
//                   className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 text-gray-700 hover:bg-white transition-colors"
//                 >
//                   <User className="w-4 h-4" />
//                   <span>My Profile</span>
//                 </Link>
//                 <Link
//                   href="/orders"
//                   onClick={() => setMobileMenuOpen(false)}
//                   className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 text-gray-700 hover:bg-white transition-colors"
//                 >
//                   <Package className="w-4 h-4" />
//                   <span>My Orders</span>
//                 </Link>
//                 <button
//                   onClick={handleLogout}
//                   className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
//                 >
//                   <LogOut className="w-4 h-4" />
//                   <span>Logout</span>
//                 </button>
//               </div>
//             )}
//           </div>
//         </nav>
//       </div>
//     </div>
//   );
// }

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
