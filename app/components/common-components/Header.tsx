"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Menu, X } from "lucide-react";
import MiniCart from "../cards/MiniCart";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "@/app/context/CartContext";


const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About us", href: "/about-us" },
  { label: "Shop", href: "/shop" },
  { label: "Contact-Us", href: "/contact-us" },
  { label: "Privacy", href: "/privacy" },
  { label: "Disclaimer", href: "/disclaimer" },
];

// for  user profile
type UserProfile = {
  id: string;
  email: string;
  name: string;
  phone: string;
  profileImage: string;
  role: string;
  isVerified: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function Header() {
  const pathname = usePathname();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // ******************User Profile******************************************
  const url = "https://alpa-be-1.onrender.com";
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  // const [token, setToken] = useState<string | null>(null);

  const token = localStorage.getItem("token")
  useEffect(() => {
    if (!token) {
      setUserProfile(null);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${url}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();
        setUserProfile(data.user ?? data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setUserProfile(null);
      }
    };

    fetchProfile();
  }, [token]); // 🔥 THIS IS THE KEY LINE

  console.log(userProfile);
  // ******************User Profile******************************************

  const { user, logout } = useAuth();
  const router = useRouter();

  // Get cart items and calculate total count
  const { cartItems } = useCart();
  const cartItemCount = cartItems.reduce((total, item) => total + item.qty, 0);

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
    localStorage.removeItem("token");
    setUserMenuOpen(false);
    await logout();

    // No need to reload - logout function handles redirection
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
        className={`fixed -top-1 left-10 right-10 rounded-full px-6 md:px-12 py-10
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
            className="w-12 md:w-15"
            priority
          />
        </Link>

        {/* ****************************************************** for checking *************************************************************  */}
        <div>
          {/* <h1 className="bg-amber-700">Hello</h1> */}
          {userProfile && (
            <>
              {userProfile?.profileImage && (
                <Image
                  src={userProfile.profileImage}
                  alt="Profile"
                  width={120}
                  height={120}
                  className="rounded-full"
                />
              )}
            </>
          )}
        </div>
        {/* ****************************************************** for checking *************************************************************  */}

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-4">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`group relative px-2 py-1 text-md font-medium transition-all duration-300
                ${
                  isActive(href)
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
        <div className="flex items-center gap-4 md:gap-6">
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
          {!user ? (
            <>
              <Link
                href="/login"
                className="font-semibold text-gray-800 text-sm md:text-base hover:text-[#5A1E12] transition-colors"
              >
                Login
              </Link>
            </>
          ) : (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="font-semibold text-gray-800 flex items-center gap-1 text-sm md:text-base hover:text-[#5A1E12] transition-colors"
              >
                Hi, {user.name?.split(" ")[0] || "Champ"}
                <svg
                  className={`w-4 h-4 transition-transform ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-100">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      router.push("/profile");
                    }}
                    className="block w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      router.push("/orders");
                    }}
                    className="block w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    Orders
                  </button>

                  <div className="border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/30 transition-colors"
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
                  ${
                    isActive(href)
                      ? "bg-white text-[#5A1E12] shadow-md"
                      : "text-gray-700 hover:bg-white/50"
                  }
                `}
              >
                {label}
              </Link>
            ))}

            {/* Mobile auth buttons */}
            <div className="pt-4 border-t border-white/30">
              {!user ? (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl bg-white/50 text-gray-700 hover:bg-white transition-colors text-center"
                  >
                    Login
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="px-4 py-3 rounded-xl bg-white/50">
                    <p className="font-semibold text-gray-900">
                      Hi, {user.name?.split(" ")[0] || "User"}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {user.email}
                    </p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl bg-white/50 text-gray-700 hover:bg-white transition-colors text-center"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl bg-white/50 text-gray-700 hover:bg-white transition-colors text-center"
                  >
                    Orders
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="px-4 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
