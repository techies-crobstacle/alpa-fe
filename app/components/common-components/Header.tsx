// app/components/Header.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Menu, X, User, LogOut, Package, Settings } from "lucide-react";
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

export default function Header() {
  const pathname = usePathname();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, logout, fetchUser, loading } = useAuth();
  const router = useRouter();

  // Get cart items and calculate total count
  const { cartItems } = useCart();
  const cartItemCount = cartItems.reduce((total, item) => total + item.qty, 0);

  // Fetch user profile on mount and when auth state changes
  useEffect(() => {
    fetchUser();
  }, []);

  // Close cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside cart panel and cart button
      const isOutsideCartPanel =
        cartRef.current && !cartRef.current.contains(event.target as Node);
      const isOutsideCartButton =
        cartButtonRef.current &&
        !cartButtonRef.current.contains(event.target as Node);

      if (isOutsideCartPanel && isOutsideCartButton) {
        setCartOpen(false);
      }

      // Check if click is outside user menu
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    if (cartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [cartOpen, userMenuOpen]);

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
        setUserMenuOpen(false);
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

      {/* Main Header */}
      <header
        className={`fixed -top-2 left-4 right-4 lg:left-10 lg:right-10 rounded-full px-6 md:px-12 py-3
          flex items-center justify-between shadow-xl transition-all duration-500 z-50
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
            className="w-10 md:w-12"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-4 lg:gap-6">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`group relative px-2 py-1 text-sm lg:text-base font-medium transition-all duration-300
                ${
                  isActive(href)
                    ? "text-[#5A1E12] font-semibold"
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
        <div className="flex items-center gap-3 md:gap-6">
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
                className={`h-5 w-5 md:h-6 md:w-6 text-gray-800 transition-transform duration-300 ${
                  cartOpen ? "rotate-12 scale-110" : "group-hover:scale-110"
                }`}
              />

              {cartItemCount > 0 && (
                <>
                  {!cartOpen && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-75" />
                  )}
                  <span
                    className={`absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center bg-linear-to-br from-red-500 to-red-600 text-white rounded-full font-bold shadow-sm transition-transform duration-300 ${
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
                fixed top-0 right-0 bg-[#ead7b7] h-screen w-96 max-w-[90vw] rounded-2xl
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
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          ) : !user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden md:block font-medium text-gray-800 text-sm hover:text-[#5A1E12] transition-colors px-3 py-1.5 rounded-full hover:bg-white/30"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="hidden md:block font-medium bg-[#5A1E12] text-white text-sm hover:bg-[#4a180f] transition-colors px-4 py-1.5 rounded-full"
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
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#5A1E12] transition-colors">
                      <Image
                        src={user.profileImage}
                        alt={user.name || "User"}
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-[#EAD7B7] to-[#5A1E12] flex items-center justify-center border-2 border-transparent group-hover:border-[#5A1E12] transition-colors">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <span className="hidden md:inline font-medium text-gray-800 text-sm">
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
                  <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-[#EAD7B7]/10 to-transparent">
                    <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => handleNavigation("/profile")}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 text-sm"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => handleNavigation("/orders")}
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-white/30 transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-0 right-0 h-screen w-80 max-w-[85vw] bg-[#EAD7B7] z-40
          transform transition-transform duration-300 ease-out md:hidden
          ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Mobile Header */}
        <div className="p-6 border-b border-white/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#EAD7B7] to-[#5A1E12] flex items-center justify-center">
                  {user.profileImage ? (
                    <Image
                      src={user.profileImage}
                      alt={user.name || "User"}
                      width={40}
                      height={40}
                      className="rounded-full"
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
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex flex-col p-4 space-y-1">
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

          {/* Mobile Auth Buttons */}
          <div className="pt-4 mt-4 border-t border-white/30">
            {!user ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl bg-white/50 text-gray-700 hover:bg-white transition-colors text-center"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl bg-[#5A1E12] text-white hover:bg-[#4a180f] transition-colors text-center"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 text-gray-700 hover:bg-white transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>My Profile</span>
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 text-gray-700 hover:bg-white transition-colors"
                >
                  <Package className="w-4 h-4" />
                  <span>My Orders</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
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