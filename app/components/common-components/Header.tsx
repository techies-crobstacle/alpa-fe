// "use client";

// import { useState, useEffect, useRef } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { usePathname } from "next/navigation";
// import { ShoppingCart, Menu, X } from "lucide-react";
// import MiniCart from "../cards/MiniCart";

// const NAV_LINKS = [
//   { label: "Home", href: "/" },
//   { label: "About us", href: "/about-us" },
//   { label: "Shop", href: "/shop" }, 
//   // { label: "Term and Service", href: "/term-and-conditions" },
//   { label: "Contact-Us", href: "/contact-us" },
//   { label: "Privacy", href: "/privacy" },
//   { label: "Disclaimer", href: "/disclaimer" },
// ];

// export default function Header() {
//   const pathname = usePathname();
//   const [cartOpen, setCartOpen] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const cartRef = useRef<HTMLDivElement>(null);
//   const cartButtonRef = useRef<HTMLButtonElement>(null);
//   const cartItemCount = 3;

//   // Close cart when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       // Check if click is outside both cart panel and cart button
//       const isOutsideCartPanel = cartRef.current && !cartRef.current.contains(event.target as Node);
//       const isOutsideCartButton = cartButtonRef.current && !cartButtonRef.current.contains(event.target as Node);
      
//       if (isOutsideCartPanel && isOutsideCartButton) {
//         setCartOpen(false);
//       }
//     };

//     if (cartOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//       document.body.style.overflow = "hidden";
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//       document.body.style.overflow = "unset";
//     };
//   }, [cartOpen]);

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
//       }
//     };

//     if (cartOpen) {
//       document.addEventListener("keydown", handleEscape);
//     }

//     return () => {
//       document.removeEventListener("keydown", handleEscape);
//     };
//   }, [cartOpen]);

//   const isActive = (href: string) => {
//     if (href === "/") return pathname === "/";
//     return pathname === href || pathname.startsWith(`${href}/`);
//   };

//   const toggleCart = () => {
//     setCartOpen(!cartOpen);
//   };

//   return (
//     <>
//       {/* Cart Overlay */}
//       {cartOpen && (
//         <div 
//           className=" inset-0 bg-black/20  z-40 animate-fadeIn"
//           onClick={() => setCartOpen(false)}
//         />
//       )}

//       {/* Main Header */}
//       <header
//         className={`mx-auto rounded-full px-15 py-3 flex items-center justify-between shadow-xl transition-all duration-500 z-50
//           ${scrolled 
//             ? "bg-[#EAD7B7]/95 backdrop-blur-md shadow-lg" 
//             : "bg-[#EAD7B7]"
//           }
//           ${mobileMenuOpen ? "rounded-b-none" : ""}
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
//             className="w-15"
//             priority
//           />
//         </Link>

//         {/* Desktop Navigation */}
//         <nav className="hidden md:flex gap-4">
//           {NAV_LINKS.map(({ label, href }) => (
//             <Link
//               key={href}
//               href={href}
//               className={`group relative px-2 py-1 text-md font-medium transition-all duration-300
//                 ${isActive(href) 
//                   ? "text-[#5A1E12] font-semibold" 
//                   : "text-gray-700"
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
//                   ${isActive(href)
//                     ? "scale-x-100"
//                     : "scale-x-0 group-hover:scale-x-100"
//                   }
//                 `}
//               />
//             </Link>
//           ))}
//         </nav>

//         {/* Right Side Actions */}
//         <div className="flex items-center gap-6">
//           {/* Cart Button - Click Only */}
//           <div className="relative">
//             <button
//               ref={cartButtonRef}
//               onClick={toggleCart}
//               className="relative p-2 rounded-full hover:bg-white/30 transition-all duration-300 group"
//               aria-label={`Shopping cart with ${cartItemCount} items`}
//               aria-expanded={cartOpen}
//             >
//               <ShoppingCart className={`h-6 w-6 text-gray-800 transition-transform duration-300 ${
//                 cartOpen ? "rotate-12 scale-110" : "group-hover:scale-110"
//               }`} />
              
//               {cartItemCount > 0 && (
//                 <>
//                   {/* Outer Pulse Effect - Only pulse when cart is closed */}
//                   {!cartOpen && (
//                     <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-75 p-8" />
//                   )}
//                   {/* Badge */}
//                   <span className={`absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center bg-linear-to-br from-red-500 to-red-600 text-white rounded-full font-bold shadow-sm transition-transform duration-300 ${
//                     cartOpen ? "scale-125" : ""
//                   }`}>
//                     {cartItemCount}
//                   </span>
//                 </>
//               )}
//             </button>

//             {/* Mini Cart Panel */}
//             <div
//               ref={cartRef}
//               className={`
//                 fixed top-0 right-0 h-screen w-150 max-w-[90vw]
//                 bg-linear-to-b from-white to-gray-50/30 rounded-3xl 
//                 border-l border-gray-200/60
//                 shadow-[rgba(0,0,0,0.1)_-10px_0px_30px_0px]
//                 transform transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
//                 z-50
//                 ${cartOpen 
//                   ? "translate-x-0 opacity-100" 
//                   : "translate-x-full opacity-0 pointer-events-none"
//                 }
//               `}
//             >
//               {/* Edge Glow Effect */}
//               <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-[#5A1E12]/60 via-[#EAD7B7]/40 to-[#5A1E12]/60" />
              
//               {/* Close button inside panel */}
//               <div className="absolute top-6 left-6 z-10">
//                 <button
//                   onClick={() => setCartOpen(false)}
//                   className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors hover:shadow-md group"
//                   aria-label="Close cart"
//                 >
//                   <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
//                 </button>
//               </div>
              
//               {/* Panel Header with Close X */}
//               <div className="pt-4 pl-16 pr-6">
//                 <div className="flex items-center justify-between mb-2">
//                   <div>
//                     <h2 className="text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
//                       Your Cart
//                     </h2>
//                     <p className="text-sm text-gray-500 mt-1">
//                       {cartItemCount} items • Click X to close
//                     </p>
//                   </div>
//                   <button
//                     onClick={() => setCartOpen(false)}
//                     className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
//                     aria-label="Close cart"
//                   >
//                     <X size={24} />
//                   </button>
//                 </div>
//               </div>
              
//               <MiniCart onClose={() => setCartOpen(false)} />
//             </div>
//           </div>

//           {/* CTA Button */}
//           <Link
//             href="/signup"
//             className="relative overflow-hidden rounded-full bg-linear-to-r from-[#5A1E12] to-[#7A2E1F] px-8 py-2.5 text-white font-medium shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 group"
//           >
//             <span className="relative z-10">Sign Up</span>
//             {/* Hover effect */}
//             <div className="absolute inset-0 bg-linear-to-r from-[#7A2E1F] to-[#5A1E12] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
//           </Link>

//           {/* Mobile Menu Button */}
//           <button
//             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//             className="md:hidden p-2 rounded-lg hover:bg-white/30 transition-colors"
//             aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
//           >
//             {mobileMenuOpen ? (
//               <X className="h-6 w-6" />
//             ) : (
//               <Menu className="h-6 w-6" />
//             )}
//           </button>
//         </div>
//       </header>

//       {/* Mobile Menu */}
//       {mobileMenuOpen && (
//         <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl bg-[#EAD7B7] rounded-2xl shadow-2xl z-40 animate-slideDown md:hidden">
//           <nav className="flex flex-col p-6 space-y-4">
//             {NAV_LINKS.map(({ label, href }) => (
//               <Link
//                 key={href}
//                 href={href}
//                 onClick={() => setMobileMenuOpen(false)}
//                 className={`
//                   px-4 py-3 rounded-xl text-lg font-medium transition-all duration-300
//                   ${isActive(href) 
//                     ? "bg-white text-[#5A1E12] shadow-md" 
//                     : "text-gray-700 hover:bg-white/50"
//                   }
//                 `}
//               >
//                 {label}
//               </Link>
//             ))}
//           </nav>
//         </div>
//       )}
//     </>
//   );
// }

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X } from "lucide-react";
import MiniCart from "../cards/MiniCart";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About us", href: "/about-us" },
  { label: "Shop", href: "/shop" }, 
  // { label: "Term and Service", href: "/term-and-conditions" },
  { label: "Contact-Us", href: "/contact-us" },
  { label: "Privacy", href: "/privacy" },
  { label: "Disclaimer", href: "/disclaimer" },
];

export default function Header() {
  const pathname = usePathname();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const cartItemCount = 3;

  // Close cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside both cart panel and cart button
      const isOutsideCartPanel = cartRef.current && !cartRef.current.contains(event.target as Node);
      const isOutsideCartButton = cartButtonRef.current && !cartButtonRef.current.contains(event.target as Node);
      
      if (isOutsideCartPanel && isOutsideCartButton) {
        setCartOpen(false);
      }
    };

    if (cartOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [cartOpen]);

  // Scroll effect for header
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
      }
    };

    if (cartOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [cartOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const toggleCart = () => {
    setCartOpen(!cartOpen);
  };

  return (
    <>
      {/* Cart Overlay */}
      {cartOpen && (
        <div 
          className=" inset-0 bg-black/20  z-40 animate-fadeIn"
          onClick={() => setCartOpen(false)}
        />
      )}

      {/* Main Header */}
      <header
        className={`mx-auto rounded-full px-15 py-3 flex items-center justify-between shadow-xl transition-all duration-500 z-50
          ${scrolled 
            ? "bg-[#EAD7B7]/95 backdrop-blur-md shadow-lg" 
            : "bg-[#EAD7B7]"
          }
          ${mobileMenuOpen ? "rounded-b-none" : ""}
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
            className="w-15"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-4">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`group relative px-2 py-1 text-md font-medium transition-all duration-300
                ${isActive(href) 
                  ? "text-[#5A1E12] font-semibold" 
                  : "text-gray-700"
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
                  ${isActive(href)
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
          {/* Cart Button - Click Only */}
          <div className="relative">
            <button
              ref={cartButtonRef}
              onClick={toggleCart}
              className="relative p-2 rounded-full hover:bg-white/30 transition-all duration-300 group"
              aria-label={`Shopping cart with ${cartItemCount} items`}
              aria-expanded={cartOpen}
            >
              <ShoppingCart className={`h-6 w-6 text-gray-800 transition-transform duration-300 ${
                cartOpen ? "rotate-12 scale-110" : "group-hover:scale-110"
              }`} />
              
              {cartItemCount > 0 && (
                <>
                  {/* Outer Pulse Effect - Only pulse when cart is closed */}
                  {!cartOpen && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full animate-ping opacity-75 p-8" />
                  )}
                  {/* Badge */}
                  <span className={`absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center bg-linear-to-br from-red-500 to-red-600 text-white rounded-full font-bold shadow-sm transition-transform duration-300 ${
                    cartOpen ? "scale-125" : ""
                  }`}>
                    {cartItemCount}
                  </span>
                </>
              )}
            </button>

            {/* Mini Cart Panel */}
            <div
              ref={cartRef}
              className={`
                fixed top-0 right-0 bg-[#ead7b7] h-screen w-95 max-w-[90vw] rounded-2xl
                 
                
                
                transform transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                z-50
                ${cartOpen 
                  ? "translate-x-0 opacity-100" 
                  : "translate-x-full opacity-0 pointer-events-none"
                }
              `}
            >
              {/* Edge Glow Effect */}
              {/* <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-[#5A1E12]/60 via-[#EAD7B7]/40 to-[#5A1E12]/60" /> */}
              
              {/* Close button inside panel */}
              {/* <div className="absolute top-6 left-6 z-10">
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors hover:shadow-md group"
                  aria-label="Close cart"
                >
                  <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div> */}
              
              {/* Panel Header with Close X */}
              {/* <div className="pt-4 pl-16 pr-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      Your Cart
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {cartItemCount} items • Click X to close
                    </p>
                  </div>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Close cart"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div> */}
              
              <MiniCart onClose={() => setCartOpen(false)} />
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href="/signup"
            className="relative overflow-hidden rounded-full bg-linear-to-r from-[#5A1E12] to-[#7A2E1F] px-8 py-2.5 text-white font-medium shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 group"
          >
            <span className="relative z-10">Sign Up</span>
            {/* Hover effect */}
            <div className="absolute inset-0 bg-linear-to-r from-[#7A2E1F] to-[#5A1E12] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/30 transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl bg-[#EAD7B7] rounded-2xl shadow-2xl z-40 animate-slideDown md:hidden">
          <nav className="flex flex-col p-6 space-y-4">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  px-4 py-3 rounded-xl text-lg font-medium transition-all duration-300
                  ${isActive(href) 
                    ? "bg-white text-[#5A1E12] shadow-md" 
                    : "text-gray-700 hover:bg-white/50"
                  }
                `}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}