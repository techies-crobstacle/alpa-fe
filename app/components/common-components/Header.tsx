// "use client";

// import { useState, useEffect, useRef, useMemo, useCallback } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { usePathname, useRouter } from "next/navigation";
// import { ShoppingCart, Menu, X, User, LogOut, Package, Settings, Search } from "lucide-react";
// import MiniCart from "../cards/MiniCart";
// import OptimisticMiniCart from "../cards/OptimisticMiniCart";
// import { useAuth } from "../../context/AuthContext";
// import { useCart } from "@/app/context/CartContext";
// import { CouponDropdownIcon } from "./CouponDropdown";
// import { useProducts, Product } from "@/app/hooks/useProducts";


// const NAV_LINKS = [
//   { label: "Home", href: "/" },
//   { label: "About us", href: "/about-us" },
//   { label: "Shop", href: "/shop" },
//   { label: "Contact Us", href: "/contact-us" },
//   // { label: "Privacy", href: "/privacy" },
//   // { label: "Disclaimer", href: "/disclaimer" },
// ];

// export default function Header() {
//   const pathname = usePathname();
//   const [cartOpen, setCartOpen] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const [userMenuOpen, setUserMenuOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchOpen, setSearchOpen] = useState(false);
//   const cartRef = useRef<HTMLDivElement>(null);
//   const cartButtonRef = useRef<HTMLButtonElement>(null);
//   const userMenuRef = useRef<HTMLDivElement>(null);
//   const mobileMenuRef = useRef<HTMLDivElement>(null);
//   const searchRef = useRef<HTMLDivElement>(null);

//   const { user, logout, fetchUser, loading } = useAuth();
//   const { cartItems, fetchCartFromBackend } = useCart();
//   const { data: products = [] } = useProducts();
//   const router = useRouter();

//   // Get cart items and calculate total count (memoized)
//   const cartItemCount = useMemo(() => 
//     cartItems.reduce((total, item) => total + item.qty, 0), 
//     [cartItems]
//   );

//   // Search functionality using useMemo to prevent unnecessary re-computations
//   const searchResults = useMemo(() => {
//     if (searchTerm.trim().length > 1) {
//       const filtered = products.filter((product) =>
//         product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
//         product.category.toLowerCase().includes(searchTerm.toLowerCase())
//       ).slice(0, 6); // Limit to 6 results
//       return filtered;
//     }
//     return [];
//   }, [searchTerm, products]);

//   // Update search open state when search results change
//   useEffect(() => {
//     setSearchOpen(searchTerm.trim().length > 1 && searchResults.length > 0);
//   }, [searchTerm, searchResults]);

//   // Handle search navigation (memoized to prevent re-renders)
//   const handleSearchSelect = useCallback((product: Product) => {
//     setSearchTerm("");
//     setSearchOpen(false);
//     router.push(`/shop?search=${encodeURIComponent(product.title)}`);
//   }, [router]);

//   const handleSearchSubmit = useCallback((e: React.FormEvent) => {
//     e.preventDefault();
//     if (searchTerm.trim()) {
//       setSearchOpen(false);
//       router.push(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
//     }
//   }, [searchTerm, router]);

//   // Initialize user and cart
//   useEffect(() => {
//     fetchUser();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Sync cart when user state changes
//   useEffect(() => {
//     if (user?.id) {
//       fetchCartFromBackend();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user?.id]);

//   // Close cart when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       const target = event.target as Node;
      
//       // Close cart if clicked outside
//       if (
//         cartOpen &&
//         cartRef.current &&
//         !cartRef.current.contains(target) &&
//         cartButtonRef.current &&
//         !cartButtonRef.current.contains(target)
//       ) {
//         setCartOpen(false);
//       }

//       // Close user menu if clicked outside
//       if (
//         userMenuOpen &&
//         userMenuRef.current &&
//         !userMenuRef.current.contains(target)
//       ) {
//         setUserMenuOpen(false);
//       }

//       // Close search dropdown if clicked outside
//       if (
//         searchOpen &&
//         searchRef.current &&
//         !searchRef.current.contains(target)
//       ) {
//         setSearchOpen(false);
//       }

//       // Close mobile menu if clicked outside
//       if (
//         mobileMenuOpen &&
//         mobileMenuRef.current &&
//         !mobileMenuRef.current.contains(target) &&
//         !(target as Element).closest('button[aria-label*="menu"]')
//       ) {
//         setMobileMenuOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);

//     if (cartOpen || mobileMenuOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "unset";
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//       document.body.style.overflow = "unset";
//     };
//   }, [cartOpen, userMenuOpen, mobileMenuOpen, searchOpen]);

//   // Scroll effect for header (desktop only)
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
//         setMobileMenuOpen(false);
//         setSearchOpen(false);
//       }
//     };

//     document.addEventListener("keydown", handleEscape);

//     return () => {
//       document.removeEventListener("keydown", handleEscape);
//     };
//   }, []);

//   const isActive = useCallback((href: string) => {
//     if (href === "/") return pathname === "/";
//     return pathname === href || pathname.startsWith(`${href}/`);
//   }, [pathname]);

//   const toggleCart = useCallback(() => {
//     setCartOpen(!cartOpen);
//   }, [cartOpen]);

//   const handleLogout = useCallback(async () => {
//     setUserMenuOpen(false);
//     setMobileMenuOpen(false);
//     await logout();
//     // After logout, cart should automatically sync to guest cart
//     // because token will be removed and CartContext will handle it
//   }, [logout]);

//   const handleNavigation = useCallback((href: string) => {
//     setUserMenuOpen(false);
//     setMobileMenuOpen(false);
//     router.push(href);
//   }, [router]);

//   return (
//     <div className="">
//       {/* Cart Overlay */}
//       {cartOpen && (
//         <div
//           className="fixed inset-0 bg-black/20 z-40 animate-fadeIn"
//           onClick={() => setCartOpen(false)}
//         />
//       )}

//       {/* Mobile Menu Overlay */}
//       {mobileMenuOpen && (
//         <div
//           className="fixed inset-0 bg-black/30 z-40 md:hidden animate-fadeIn"
//           onClick={() => setMobileMenuOpen(false)}
//         />
//       )}

//       {/* MOBILE/Tablet: Only show menu button */}
//       <div className="md:hidden fixed top-4 right-4 z-50">
//         <button
//           onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//           className="p-3 rounded-full bg-[#5A1E12] text-white shadow-lg hover:bg-[#4a180f] transition-colors"
//           aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
//           aria-expanded={mobileMenuOpen}
//         >
//           {mobileMenuOpen ? (
//             <X className="h-5 w-5" />
//           ) : (
//             <Menu className="h-5 w-5" />
//           )}
//         </button>
//       </div>

//       {/* DESKTOP: Full Header (hidden on mobile/tablet) */}
//       <header
//         className={`w-full hidden md:flex   rounded-full px-8 lg:px-12 py-2
//           items-center shadow-xl transition-all duration-500 z-50
//           ${scrolled ? "bg-[#EAD7B7]/95 backdrop-blur-md shadow-lg" : "bg-[#EAD7B7]"}
//         `}
//       >
//         {/* Logo */}
//         <Link
//           href="/"
//           className="font-bold transition-transform hover:scale-105 active:scale-95 shrink-0"
//         >
//           <Image
//             src="/images/navbarLogo.png"
//             width={500}
//             height={500}
//             alt="Logo"
//             className="w-10 md:w-16"
//             priority
//           />
//         </Link>

//         {/* Spacer */}
//         <div className="flex-1"></div>

//         {/* Desktop Navigation - Centered */}
//         <nav className="flex gap-4 lg:gap-6 absolute left-1/2 transform -translate-x-1/2">
//           {NAV_LINKS.map(({ label, href }) => (
//             <Link
//               key={href}
//               href={href}
//               className={`group relative px-2 py-1 text-sm lg:text-base font-medium transition-all duration-300
//                 ${
//                   isActive(href)
//                     ? "text-[#5A1E12] "
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
//         <div className="flex items-center gap-6">
//           {/* Search Bar */}
//           <div className="relative" ref={searchRef}>
//             <form onSubmit={handleSearchSubmit}>
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                 <input
//                   type="text"
//                   placeholder="Search products..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-60 pl-10 pr-4 py-2.5 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#5A1E12] focus:border-[#5A1E12] outline-none bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-sm transition-all text-sm"
//                 />
//               </div>
//             </form>
            
//             {/* Search Results Dropdown */}
//             {searchOpen && searchResults.length > 0 && (
//               <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
//                 <div className="p-2">
//                   <div className="text-xs text-gray-500 px-3 py-2 border-b">
//                     Found {searchResults.length} results
//                   </div>
//                   {searchResults.map((product) => (
//                     <button
//                       key={product.id}
//                       onClick={() => handleSearchSelect(product)}
//                       className="w-full text-left px-3 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group"
//                     >
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden shrink-0">
//                           {product.images?.[0] && (
//                             <Image
//                               src={product.images[0]}
//                               alt={product.title}
//                               width={40}
//                               height={40}
//                               className="w-full h-full object-cover"
//                             />
//                           )}
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <div className="font-medium text-gray-900 text-sm truncate group-hover:text-[#5A1E12] transition-colors">
//                             {product.title}
//                           </div>
//                           <div className="text-xs text-gray-500 truncate">
//                             {product.category} • ${product.price}
//                           </div>
//                         </div>
//                       </div>
//                     </button>
//                   ))}
//                   {searchTerm && (
//                     <button
//                       onClick={() => {
//                         setSearchOpen(false);
//                         router.push(`/shop?search=${encodeURIComponent(searchTerm)}`);
//                       }}
//                       className="w-full text-left px-3 py-3 hover:bg-[#5A1E12] hover:text-white transition-colors border-t border-gray-200 text-[#5A1E12] font-medium text-sm"
//                     >
//                       See all results for "{searchTerm}"
//                     </button>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//           {/* Coupon Dropdown Icon */}
//           {/* <CouponDropdownIcon /> */}

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
//                 className={`h-6 w-6 text-gray-800 transition-transform duration-300 ${
//                   cartOpen ? "rotate-12 scale-110" : "group-hover:scale-110"
//                 }`}
//               />

//               {cartItemCount > 0 && (
//                 <>
//                   {!cartOpen && (
//                     <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-75" />
//                   )}
//                   <span
//                     className={`absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center bg-red-500 text-white rounded-full font-bold shadow-sm transition-transform duration-300 ${
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
//                 fixed -top-2 right-0 bottom-0 h-[102vh] w-full sm:w-96
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
//             <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse"></div>
//           ) : !user ? (
//             <div className="flex items-center gap-3">
//               <Link
//                 href="/login"
//                 className="font-medium text-gray-800 text-sm hover:text-[#5A1E12] transition-colors px-3 py-1.5 rounded-full hover:bg-white/30"
//               >
//                 Login
//               </Link>
//               <Link
//                 href="/signup"
//                 className="font-medium bg-[#5A1E12] text-white text-sm hover:bg-[#4a180f] transition-colors px-4 py-1.5 rounded-full"
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
//                     <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-transparent group-hover:scale-110  transition-colors">
//                       <Image
//                         src={user.profileImage}
//                         alt={user.name || "User"}
//                         width={36}
//                         height={36}
//                         className="w-full h-full object-cover"
//                       />
//                     </div>
//                   ) : (
//                     <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-linear-to-br from-[#EAD7B7] to-[#5A1E12] flex items-center justify-center border-2 border-transparent group-hover:border-[#5A1E12] transition-colors">
//                       <User className="w-4 h-4 text-white" />
//                     </div>
//                   )}
//                 </div>
//                 <span className="font-medium text-gray-800 text-sm">
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
//                   <div className="px-4 py-3 border-b border-gray-100 bg-linear-to-r from-[#EAD7B7]/10 to-transparent">
//                     <p className="font-semibold text-gray-900 truncate">{user.name}</p>
//                     <p className="text-sm text-gray-500 truncate">{user.email}</p>
//                   </div>

//                   {/* Menu Items */}
//                   <div className="py-2">
//                     <button
//                       onClick={() => handleNavigation("https://alpa-dashboard.vercel.app/dashboard/customer/profile")}
//                       className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 text-sm"
//                     >
//                       <User className="w-4 h-4" />
//                       <span>My Profile</span>
//                     </button>

//                     <button
//                       onClick={() => handleNavigation("https://alpa-dashboard.vercel.app/dashboard/customer/orders")}
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
//         </div>
//       </header>

//       {/* Mobile Menu Panel */}
//       <div
//         ref={mobileMenuRef}
//         className={`
//           fixed top-0 right-0 h-screen w-80 max-w-[85vw] bg-[#EAD7B7] z-40
//           transform transition-transform duration-300 ease-out md:hidden
//           ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}
//         `}
//       >
//         {/* Mobile Header */}
//         <div className="p-6 border-b border-white/30 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             {user ? (
//               <>
//                 <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#EAD7B7] to-[#5A1E12] flex items-center justify-center overflow-hidden">
//                   {user.profileImage ? (
//                     <Image
//                       src={user.profileImage}
//                       alt={user.name || "User"}
//                       width={40}
//                       height={40}
//                       className="rounded-full w-full h-full object-cover"
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
//             aria-label="Close menu"
//           >
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         {/* Mobile Navigation */}
//         <nav className="flex flex-col p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-120px)]">
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

//           {/* Mobile Cart Button */}
//           <button
//             onClick={() => {
//               setMobileMenuOpen(false);
//               setCartOpen(true);
//             }}
//             className="px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-white/50 transition-all flex items-center gap-3"
//           >
//             <ShoppingCart className="w-5 h-5" />
//             <span>Cart ({cartItemCount})</span>
//           </button>

//           {/* Mobile Auth Buttons */}
//           <div className="pt-4 mt-4 border-t border-white/30">
//             {!user ? (
//               <div className="flex flex-col gap-2">
//                 <Link
//                   href="/login"
//                   onClick={() => setMobileMenuOpen(false)}
//                   className="px-4 py-3 rounded-xl bg-white/50 text-gray-700 hover:bg-white transition-colors text-center text-sm"
//                 >
//                   Login
//                 </Link>
//                 <Link
//                   href="/signup"
//                   onClick={() => setMobileMenuOpen(false)}
//                   className="px-4 py-3 rounded-xl bg-[#5A1E12] text-white hover:bg-[#4a180f] transition-colors text-center text-sm"
//                 >
//                   Sign Up
//                 </Link>
//               </div>
//             ) : (
//               <div className="flex flex-col gap-2">
//                 <Link
//                   href="/profile"
//                   onClick={() => setMobileMenuOpen(false)}
//                   className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 text-gray-700 hover:bg-white transition-colors text-sm"
//                 >
//                   <User className="w-4 h-4" />
//                   <span>My Profile</span>
//                 </Link>
//                 <Link
//                   href="/orders"
//                   onClick={() => setMobileMenuOpen(false)}
//                   className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 text-gray-700 hover:bg-white transition-colors text-sm"
//                 >
//                   <Package className="w-4 h-4" />
//                   <span>My Orders</span>
//                 </Link>
//                 {user.role === "admin" && (
//                   <Link
//                     href="/admin"
//                     onClick={() => setMobileMenuOpen(false)}
//                     className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 text-gray-700 hover:bg-white transition-colors text-sm"
//                   >
//                     <Settings className="w-4 h-4" />
//                     <span>Admin Dashboard</span>
//                   </Link>
//                 )}
//                 <button
//                   onClick={handleLogout}
//                   className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm"
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

"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Menu, X, User, LogOut, Package, Settings, Search } from "lucide-react";
import MiniCart from "../cards/MiniCart";
import OptimisticMiniCart from "../cards/OptimisticMiniCart";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "@/app/context/CartContext";
import { useSharedEnhancedCart } from "@/app/hooks/useSharedEnhancedCart";
import { CouponDropdownIcon } from "./CouponDropdown";
import { useProducts, Product } from "@/app/hooks/useProducts";


const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About us", href: "/about-us" },
  { label: "Shop", href: "/shop" },
  { label: "Contact Us", href: "/contact-us" },
  // { label: "Privacy", href: "/privacy" },
  // { label: "Disclaimer", href: "/disclaimer" },
];

export default function Header() {
  const pathname = usePathname();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const { user, logout, fetchUser, loading } = useAuth();
  const { cartItems, fetchCartFromBackend } = useCart();
  const { cartData, subscribeToUpdates } = useSharedEnhancedCart();
  const { data: products = [] } = useProducts();
  const router = useRouter();

  // Local state for real-time cart updates
  const [cartUpdateTrigger, setCartUpdateTrigger] = useState(0);

  // Subscribe to cart updates for real-time header count
  useEffect(() => {
    const unsubscribe = subscribeToUpdates(() => {
      setCartUpdateTrigger(prev => prev + 1);
    });
    return unsubscribe;
  }, [subscribeToUpdates]);

  // Get cart items and calculate total count (memoized)
  const cartItemCount = useMemo(() => {
    if (cartData && cartData.cart && cartData.cart.length > 0) {
      return cartData.cart.reduce((total, item) => total + item.quantity, 0);
    }
    return cartItems.reduce((total, item) => total + item.qty, 0);
  }, [cartData, cartItems, cartUpdateTrigger]);

  // Search functionality using useMemo to prevent unnecessary re-computations
  const searchResults = useMemo(() => {
    if (searchTerm.trim().length > 1) {
      const filtered = products.filter((product) =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 6); // Limit to 6 results
      return filtered;
    }
    return [];
  }, [searchTerm, products]);

  // Update search open state when search results change
  useEffect(() => {
    setSearchOpen(searchTerm.trim().length > 1 && searchResults.length > 0);
  }, [searchTerm, searchResults]);

  // Handle search navigation (memoized to prevent re-renders)
  const handleSearchSelect = useCallback((product: Product) => {
    setSearchTerm("");
    setSearchOpen(false);
    router.push(`/shop?search=${encodeURIComponent(product.title)}`);
  }, [router]);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchOpen(false);
      router.push(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  }, [searchTerm, router]);

  // Initialize user and cart
  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync cart when user state changes
  useEffect(() => {
    if (user?.id) {
      fetchCartFromBackend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Close cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Close cart if clicked outside
      if (
        cartOpen &&
        cartRef.current &&
        !cartRef.current.contains(target) &&
        cartButtonRef.current &&
        !cartButtonRef.current.contains(target)
      ) {
        setCartOpen(false);
      }

      // Close user menu if clicked outside
      if (
        userMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(target)
      ) {
        setUserMenuOpen(false);
      }

      // Close search dropdown if clicked outside
      if (
        searchOpen &&
        searchRef.current &&
        !searchRef.current.contains(target)
      ) {
        setSearchOpen(false);
      }

      // Close mobile menu if clicked outside
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        !(target as Element).closest('button[aria-label*="menu"]')
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    if (cartOpen || mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [cartOpen, userMenuOpen, mobileMenuOpen, searchOpen]);

  // Scroll effect for header (desktop only)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close cart when pressing Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCartOpen(false);
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
        setSearchOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const isActive = useCallback((href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }, [pathname]);

  const toggleCart = useCallback(() => {
    setCartOpen(!cartOpen);
  }, [cartOpen]);

  const handleLogout = useCallback(async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    await logout();
    // After logout, cart should automatically sync to guest cart
    // because token will be removed and CartContext will handle it
  }, [logout]);

  const handleNavigation = useCallback((href: string) => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    router.push(href);
  }, [router]);

  return (
    <>
      {/* Cart Overlay */}
      {/* {cartOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 animate-fadeIn"
          onClick={() => setCartOpen(false)}
        />
      )} */}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mini Cart Panel - Rendered outside header with portal-like positioning */}
      <div
        ref={cartRef}
        className={`
          fixed -top-2 right-0 bottom-0 h-screen w-full sm:w-96
          transform transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          z-50
          ${
            cartOpen
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0 pointer-events-none"
          }
        `}
      >
        <MiniCart onClose={() => setCartOpen(false)} />
      </div>

      <div className="">
        {/* MOBILE/Tablet: Only show menu button */}
        <div className="md:hidden fixed top-4 right-4 z-50">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-3 rounded-full bg-[#5A1E12] text-white shadow-lg hover:bg-[#4a180f] transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* DESKTOP: Full Header (hidden on mobile/tablet) */}
        <header
          className={`w-full hidden md:flex rounded-full px-8 lg:px-12 py-2
            items-center shadow-xl transition-all duration-500 z-30 relative
            ${scrolled ? "bg-[#EAD7B7]/95 backdrop-blur-md shadow-lg" : "bg-[#EAD7B7]"}
          `}
        >
          {/* Logo */}
          <Link
            href="/"
            className="font-bold transition-transform hover:scale-105 active:scale-95 shrink-0"
          >
            <Image
              src="/images/navbarLogo.png"
              width={500}
              height={500}
              alt="Logo"
              className="w-10 md:w-16"
              priority
            />
          </Link>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Desktop Navigation - Centered */}
          <nav className="flex gap-4 lg:gap-6 absolute left-1/2 transform -translate-x-1/2">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`group relative px-2 py-1 text-sm lg:text-base font-medium transition-all duration-300
                  ${
                    isActive(href)
                      ? "text-[#5A1E12] "
                      : "text-gray-700 hover:text-[#5A1E12]"
                  }
                `}
              >
                {label}
                {/* Animated underline from left to right */}
                <span
                  className={`
                    pointer-events-none
                    absolute left-0 bottom-0 h-0.5 w-full bg-[#5A1E12] rounded-full
                    transition-transform duration-300 origin-left
                    ${
                      isActive(href)
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }
                  `}
                />
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-6">
            {/* Search Bar */}
            <div className="relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-60 pl-6 pr-4 py-2.5 border border-gray-300 rounded-full focus:ring-1 focus:ring-[#5A1E12] focus:border-white outline-none bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-sm transition-all text-sm"
                  />
                </div>
              </form>
              
              {/* Search Results Dropdown */}
              {searchOpen && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
                  <div className="p-2">
                    <div className="text-xs text-gray-500 px-3 py-2 border-b">
                      Found {searchResults.length} results
                    </div>
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleSearchSelect(product)}
                        className="w-full text-left px-3 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden shrink-0">
                            {product.images?.[0] && (
                              <Image
                                src={product.images[0]}
                                alt={product.title}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-sm truncate group-hover:text-[#5A1E12] transition-colors">
                              {product.title}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {product.category} • ${product.price}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                    {searchTerm && (
                      <button
                        onClick={() => {
                          setSearchOpen(false);
                          router.push(`/shop?search=${encodeURIComponent(searchTerm)}`);
                        }}
                        className="w-full text-left px-3 py-3 hover:bg-[#5A1E12] hover:text-white transition-colors border-t border-gray-200 text-[#5A1E12] font-medium text-sm"
                      >
                        See all results for "{searchTerm}"
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Coupon Dropdown Icon */}
            {/* <CouponDropdownIcon /> */}

            {/* Cart Button */}
            <button
              ref={cartButtonRef}
              onClick={toggleCart}
              className="relative p-2 rounded-full hover:bg-white/30 transition-all duration-300 group"
              aria-label={`Shopping cart with ${cartItemCount} items`}
              aria-expanded={cartOpen}
            >
              <ShoppingCart
                className={`h-6 w-6 text-gray-800 transition-transform duration-300 ${
                  cartOpen ? "rotate-12 scale-110" : "group-hover:scale-110"
                }`}
              />

              {cartItemCount > 0 && (
                <>
                  {!cartOpen && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-75" />
                  )}
                  <span
                    className={`absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center bg-red-500 text-white rounded-full font-bold shadow-sm transition-transform duration-300 ${
                      cartOpen ? "scale-125" : ""
                    }`}
                  >
                    {cartItemCount > 9 ? "9+" : cartItemCount}
                  </span>
                </>
              )}
            </button>

            {/* User Authentication */}
            {loading ? (
              <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse"></div>
            ) : !user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="font-medium border text-gray-800 text-sm hover:text-[#5A1E12] transition-colors px-3 py-1.5 rounded-full hover:bg-white/30"
                >
                  Login
                </Link>
                <Link
                  href="/sellerOnboarding"
                  className="font-medium bg-[#5A1E12] text-white text-sm hover:bg-[#4a180f] transition-colors px-4 py-1.5 rounded-full"
                >
                  Seller
                </Link>
              </div>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 group"
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                >
                  <div className="relative">
                    {user.profileImage ? (
                      <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-transparent group-hover:scale-110  transition-colors">
                        <Image
                          src={user.profileImage}
                          alt={user.name || "User"}
                          width={36}
                          height={36}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-linear-to-br from-[#EAD7B7] to-[#5A1E12] flex items-center justify-center border-2 border-transparent group-hover:border-[#5A1E12] transition-colors">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-gray-800 text-sm">
                    {user.name?.split(" ")[0] || "User"}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-100 animate-fadeIn">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-linear-to-r from-[#EAD7B7]/10 to-transparent">
                      <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => handleNavigation("https://alpa-dashboard.vercel.app/dashboard/customer/profile")}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 text-sm"
                      >
                        <User className="w-4 h-4" />
                        <span>My Profile</span>
                      </button>

                      <button
                        onClick={() => handleNavigation("https://alpa-dashboard.vercel.app/dashboard/customer/orders")}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 text-sm"
                      >
                        <Package className="w-4 h-4" />
                        <span>My Orders</span>
                      </button>

                      {user.role === "admin" && (
                        <button
                          onClick={() => handleNavigation("/admin")}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 text-sm"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Admin Dashboard</span>
                        </button>
                      )}

                      <div className="border-t border-gray-100 mt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600 text-sm"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Mobile Menu Panel */}
        <div
          ref={mobileMenuRef}
          className={`
            fixed top-0 right-0 h-screen w-80 max-w-[85vw] bg-[#EAD7B7] z-40
            transform transition-transform duration-300 ease-out md:hidden
            ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}
          `}
        >
          {/* Mobile Header */}
          <div className="p-6 border-b border-white/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#EAD7B7] to-[#5A1E12] flex items-center justify-center overflow-hidden">
                    {user.profileImage ? (
                      <Image
                        src={user.profileImage}
                        alt={user.name || "User"}
                        width={40}
                        height={40}
                        className="rounded-full w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user.name?.split(" ")[0] || "User"}</p>
                    <p className="text-xs text-gray-600 truncate">{user.email}</p>
                  </div>
                </>
              ) : (
                <h3 className="font-bold text-lg text-gray-800">Menu</h3>
              )}
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full hover:bg-white/30"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex flex-col p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-120px)]">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  px-4 py-3 rounded-xl text-base font-medium transition-all
                  ${
                    isActive(href)
                      ? "bg-white text-[#5A1E12] shadow-sm"
                      : "text-gray-700 hover:bg-white/50"
                  }
                `}
              >
                {label}
              </Link>
            ))}

            {/* Mobile Cart Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setCartOpen(true);
              }}
              className="px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-white/50 transition-all flex items-center gap-3"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Cart ({cartItemCount})</span>
            </button>

            {/* Mobile Auth Buttons */}
            <div className="pt-4 mt-4 border-t border-white/30">
              {!user ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl bg-white/50 text-gray-700 hover:bg-white transition-colors text-center text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl bg-[#5A1E12] text-white hover:bg-[#4a180f] transition-colors text-center text-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 text-gray-700 hover:bg-white transition-colors text-sm"
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 text-gray-700 hover:bg-white transition-colors text-sm"
                  >
                    <Package className="w-4 h-4" />
                    <span>My Orders</span>
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 text-gray-700 hover:bg-white transition-colors text-sm"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}