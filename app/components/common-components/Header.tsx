// // app/components/Header.tsx
// "use client";

// import { useState, useEffect, useRef } from "react";
// // CouponDropdown component
// function CouponDropdown() {
//   const { token } = useAuth();
//   const [open, setOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [coupons, setCoupons] = useState<any[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   const fetchCoupons = async () => {
//     if (!token) return;
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await fetch("https://alpa-be-1.onrender.com/api/admin/coupons", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       if (!res.ok) throw new Error("Failed to fetch coupons");
//       const data = await res.json();
//       setCoupons(Array.isArray(data) ? data : data.coupons || []);
//     } catch (err: any) {
//       setError(err.message || "Error fetching coupons");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleToggle = () => {
//     setOpen((prev) => {
//       const next = !prev;
//       if (next && coupons.length === 0 && !loading) fetchCoupons();
//       return next;
//     });
//   };

//   return (
//     <div className="relative">
//       <button
//         onClick={handleToggle}
//         className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition"
//         aria-haspopup="listbox"
//         aria-expanded={open}
//       >
//         Coupons <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
//       </button>
//       {open && (
//         <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 animate-fadeIn">
//           <div className="p-3">
//             {loading && <div className="text-sm text-gray-500">Loading...</div>}
//             {error && <div className="text-sm text-red-500">{error}</div>}
//             {!loading && !error && coupons.length === 0 && (
//               <div className="text-sm text-gray-500">No coupons found.</div>
//             )}
//             {!loading && !error && coupons.length > 0 && (
//               <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
//                 {coupons.map((coupon) => (
//                   <li key={coupon.id || coupon._id} className="py-2 px-1">
//                     <div className="font-semibold text-gray-800">{coupon.code}</div>
//                     <div className="text-xs text-gray-600">{coupon.description || coupon.discount || "No description"}</div>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// import Link from "next/link";
// import Image from "next/image";
// import { usePathname, useRouter } from "next/navigation";
// import { ShoppingCart, Menu, X, User, LogOut, Package, Settings, ChevronDown, Component } from "lucide-react";
// import MiniCart  from "../cards/MiniCart"
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
//   const mobileMenuRef = useRef<HTMLDivElement>(null);

//   const { user, logout, fetchUser, loading } = useAuth();
//   const { cartItems, fetchCartFromBackend } = useCart();
//   const router = useRouter();

//   // Get cart items and calculate total count
//   const cartItemCount = cartItems.reduce((total, item) => total + item.qty, 0);

//   // Initialize user and cart
//   useEffect(() => {
//     const init = async () => {
//       await fetchUser();
//       // Sync cart when user loads or logs in
//       if (user) {
//         await fetchCartFromBackend();
//       }
//     };
//     init();
//   }, []);

//   // Sync cart when user state changes
//   useEffect(() => {
//     if (user) {
//       fetchCartFromBackend();
//     }
//   }, [user]);

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
//   }, [cartOpen, userMenuOpen, mobileMenuOpen]);

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
//     // After logout, cart should automatically sync to guest cart
//     // because token will be removed and CartContext will handle it
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
//         className={`hidden md:flex fixed -top-3 left-10 right-10 rounded-4xl px-8 lg:px-12 py-3
//           items-center justify-between shadow-xl transition-all duration-500 z-50
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
//         <nav className="flex gap-4 lg:gap-6">
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
//         <div className="flex items-center gap-6">
//           <CouponDropdownIcon />
//           // CouponDropdownIcon component
//           function CouponDropdownIcon() {
//             const { token } = useAuth();
//             const [open, setOpen] = useState(false);
//             const [loading, setLoading] = useState(false);
//             const [coupons, setCoupons] = useState<any[]>([]);
//             const [error, setError] = useState<string | null>(null);

//             const fetchCoupons = async () => {
//               if (!token) return;
//               setLoading(true);
//               setError(null);
//               try {
//                 const res = await fetch("https://alpa-be-1.onrender.com/api/admin/coupons", {
//                   headers: {
//                     Authorization: `Bearer ${token}`,
//                   },
//                 });
//                 if (!res.ok) throw new Error("Failed to fetch coupons");
//                 const data = await res.json();
//                 setCoupons(Array.isArray(data) ? data : data.coupons || []);
//               } catch (err: any) {
//                 setError(err.message || "Error fetching coupons");
//               } finally {
//                 setLoading(false);
//               }
//             };

//             const handleToggle = () => {
//               setOpen((prev) => {
//                 const next = !prev;
//                 if (next && coupons.length === 0 && !loading) fetchCoupons();
//                 return next;
//               });
//             };

//             return (
//               <div className="relative">
//                 <button
//                   onClick={handleToggle}
//                   className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition"
//                   aria-haspopup="listbox"
//                   aria-expanded={open}
//                   title="View Coupons"
//                 >
//                   <Component className="w-6 h-6 text-gray-800" />
//                 </button>
//                 {open && (
//                   <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 animate-fadeIn">
//                     <div className="p-3">
//                       {loading && <div className="text-sm text-gray-500">Loading...</div>}
//                       {error && <div className="text-sm text-red-500">{error}</div>}
//                       {!loading && !error && coupons.length === 0 && (
//                         <div className="text-sm text-gray-500">No coupons found.</div>
//                       )}
//                       {!loading && !error && coupons.length > 0 && (
//                         <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
//                           {coupons.map((coupon) => (
//                             <li key={coupon.id || coupon._id} className="py-2 px-1">
//                               <div className="font-semibold text-gray-800">{coupon.code}</div>
//                               <div className="text-xs text-gray-600">{coupon.description || coupon.discount || "No description"}</div>
//                             </li>
//                           ))}
//                         </ul>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             );
//           }
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
//                 fixed top-0 right-0 bg-[#ead7b7] h-screen w-96 max-w-[90vw] 
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
//                     <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#5A1E12] transition-colors">
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
//                 <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#EAD7B7] to-[#5A1E12] flex items-center justify-center">
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

// app/components/Header.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Menu, X, User, LogOut, Package, Settings, ChevronDown, Component } from "lucide-react";
import MiniCart from "../cards/MiniCart";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "@/app/context/CartContext";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About us", href: "/about-us" },
  { label: "Shop", href: "/shop" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "Privacy", href: "/privacy" },
  { label: "Disclaimer", href: "/disclaimer" },
];

// Coupon Dropdown Component (Desktop - with text)
function CouponDropdown() {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchCoupons = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("https://alpa-be-1.onrender.com/api/admin/coupons", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch coupons");
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : data.coupons || []);
    } catch (err: any) {
      setError(err.message || "Error fetching coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next && coupons.length === 0 && !loading) fetchCoupons();
      return next;
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        Coupons 
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 animate-fadeIn">
          <div className="p-3">
            {loading && <div className="text-sm text-gray-500">Loading...</div>}
            {error && <div className="text-sm text-red-500">{error}</div>}
            {!loading && !error && coupons.length === 0 && (
              <div className="text-sm text-gray-500">No coupons found.</div>
            )}
            {!loading && !error && coupons.length > 0 && (
              <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                {coupons.map((coupon) => (
                  <li key={coupon.id || coupon._id} className="py-2 px-1">
                    <div className="font-semibold text-gray-800">{coupon.code}</div>
                    <div className="text-xs text-gray-600">
                      {coupon.description || coupon.discount || "No description"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Coupon Dropdown Icon Component (Desktop - icon only)
function CouponDropdownIcon() {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchCoupons = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("https://alpa-be-1.onrender.com/api/admin/coupons", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch coupons");
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : data.coupons || []);
    } catch (err: any) {
      setError(err.message || "Error fetching coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next && coupons.length === 0 && !loading) fetchCoupons();
      return next;
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition"
        aria-haspopup="listbox"
        aria-expanded={open}
        title="View Coupons"
      >
        <Component className="w-6 h-6 text-gray-800" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 animate-fadeIn">
          <div className="p-3">
            {loading && <div className="text-sm text-gray-500">Loading...</div>}
            {error && <div className="text-sm text-red-500">{error}</div>}
            {!loading && !error && coupons.length === 0 && (
              <div className="text-sm text-gray-500">No coupons found.</div>
            )}
            {!loading && !error && coupons.length > 0 && (
              <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                {coupons.map((coupon) => (
                  <li key={coupon.id || coupon._id} className="py-2 px-1">
                    <div className="font-semibold text-gray-800">{coupon.code}</div>
                    <div className="text-xs text-gray-600">
                      {coupon.description || coupon.discount || "No description"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const { user, logout, fetchUser, loading } = useAuth();
  const { cartItems, fetchCartFromBackend } = useCart();
  const router = useRouter();

  // Get cart items and calculate total count
  const cartItemCount = cartItems.reduce((total, item) => total + item.qty, 0);

  // Initialize user and cart
  useEffect(() => {
    const init = async () => {
      await fetchUser();
      // Sync cart when user loads or logs in
      if (user) {
        await fetchCartFromBackend();
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync cart when user state changes
  useEffect(() => {
    if (user) {
      fetchCartFromBackend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
  }, [cartOpen, userMenuOpen, mobileMenuOpen]);

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
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const toggleCart = () => {
    setCartOpen(!cartOpen);
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    await logout();
    // After logout, cart should automatically sync to guest cart
    // because token will be removed and CartContext will handle it
  };

  const handleNavigation = (href: string) => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    router.push(href);
  };

  return (
    <div className="">
      {/* Cart Overlay */}
      {cartOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 animate-fadeIn"
          onClick={() => setCartOpen(false)}
        />
      )}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

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
        className={`hidden md:flex fixed -top-3 left-10 right-10 rounded-full px-8 lg:px-12 py-2
          items-center justify-between shadow-xl transition-all duration-500 z-50
          ${scrolled ? "bg-[#EAD7B7]/95 backdrop-blur-md shadow-lg" : "bg-[#EAD7B7]"}
        `}
      >
        {/* Logo */}
        <Link
          href="/"
          className="font-bold transition-transform hover:scale-105 active:scale-95"
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

        {/* Desktop Navigation */}
        <nav className="flex gap-4 lg:gap-6">
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
          {/* Coupon Dropdown Icon */}
          <CouponDropdownIcon />

          {/* Cart Button */}
          <div className="relative">
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

            {/* Mini Cart Panel */}
            <div
              ref={cartRef}
              className={`
                fixed -top-2 right-0 bttom-0 bg-[#ead7b7] h-screen 
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
          </div>

          {/* User Authentication */}
          {loading ? (
            <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse"></div>
          ) : !user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="font-medium text-gray-800 text-sm hover:text-[#5A1E12] transition-colors px-3 py-1.5 rounded-full hover:bg-white/30"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="font-medium bg-[#5A1E12] text-white text-sm hover:bg-[#4a180f] transition-colors px-4 py-1.5 rounded-full"
              >
                Sign Up
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
  );
}