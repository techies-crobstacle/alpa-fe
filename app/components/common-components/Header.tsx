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
  const [scrolledPast5, setScrolledPast5] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [guestMenuOpen, setGuestMenuOpen] = useState(false);
  const [stickyUserMenuOpen, setStickyUserMenuOpen] = useState(false);
  const [stickyGuestMenuOpen, setStickyGuestMenuOpen] = useState(false);
  const stickyUserMenuRef = useRef<HTMLDivElement>(null);
  const stickyGuestMenuRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isStickySearchOpen, setIsStickySearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const guestMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const stickySearchRef = useRef<HTMLDivElement>(null);

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

  // Listen for custom open-cart event
  useEffect(() => {
    const handleOpenCart = () => setCartOpen(true);
    window.addEventListener("open-cart", handleOpenCart);
    return () => window.removeEventListener("open-cart", handleOpenCart);
  }, []);

  // Get cart items and calculate total count (memoized)
  const cartItemCount = useMemo(() => {
    // Priority 1: Use shared enhanced cart data (most up-to-date)
    if (cartData && cartData.cart) {
      return cartData.cart.reduce((total, item) => total + (item.quantity || 0), 0);
    }
    
    // Priority 2: Fallback to context cart items
    return cartItems.reduce((total, item) => total + (item.qty || 0), 0);
  }, [cartData, cartItems, cartData?.cart]);

  // Search functionality with segregated results (Products, Categories, Artists)
  const segregatedSearchResults = useMemo(() => {
    if (searchTerm.trim().length > 1) {
      const searchLower = searchTerm.toLowerCase();
      
      // Filter products
      const matchedProducts = products.filter((product) =>
        product.title.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        (product.brand && product.brand.toLowerCase().includes(searchLower))
      ).slice(0, 5);
      
      // Filter unique categories
      const categories = Array.from(
        new Set(
          products
            .filter(p => p.category.toLowerCase().includes(searchLower))
            .map(p => p.category)
        )
      ).slice(0, 5);
      
      // Filter unique artists
      const artists = Array.from(
        new Set(
          products
            .filter(p => p.artistName && p.artistName.toLowerCase().includes(searchLower))
            .map(p => p.artistName)
            .filter((name): name is string => Boolean(name))
        )
      ).slice(0, 5);
      
      return {
        products: matchedProducts,
        categories,
        artists,
      };
    }
    return { products: [], categories: [], artists: [] };
  }, [searchTerm, products]);

  // Handle search navigation (memoized to prevent re-renders)
  const handleSearchSelect = useCallback((product: Product) => {
    setSearchTerm("");
    setIsSearchModalOpen(false);
    setIsStickySearchOpen(false);
    router.push(`/shop?search=${encodeURIComponent(product.title)}`);
  }, [router]);

  // Handle category filter
  const handleCategorySelect = useCallback((category: string) => {
    setSearchTerm("");
    setIsSearchModalOpen(false);
    setIsStickySearchOpen(false);
    router.push(`/shop?category=${encodeURIComponent(category)}`);
  }, [router]);

  // Handle artist filter
  const handleArtistSelect = useCallback((artist: string) => {
    setSearchTerm("");
    setIsSearchModalOpen(false);
    setIsStickySearchOpen(false);
    router.push(`/shop?artist=${encodeURIComponent(artist)}`);
  }, [router]);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsSearchModalOpen(false);
      setIsStickySearchOpen(false);
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

      // Close guest menu if clicked outside
      if (
        guestMenuOpen &&
        guestMenuRef.current &&
        !guestMenuRef.current.contains(target)
      ) {
        setGuestMenuOpen(false);
      }

      // Close sticky user menu if clicked outside
      if (
        stickyUserMenuOpen &&
        stickyUserMenuRef.current &&
        !stickyUserMenuRef.current.contains(target)
      ) {
        setStickyUserMenuOpen(false);
      }

      // Close sticky guest menu if clicked outside
      if (
        stickyGuestMenuOpen &&
        stickyGuestMenuRef.current &&
        !stickyGuestMenuRef.current.contains(target)
      ) {
        setStickyGuestMenuOpen(false);
      }

      // Close search modal if clicked outside
      if (
        isSearchModalOpen &&
        searchRef.current &&
        !searchRef.current.contains(target)
      ) {
        setIsSearchModalOpen(false);
      }

      // Close sticky search if clicked outside
      if (
        isStickySearchOpen &&
        stickySearchRef.current &&
        !stickySearchRef.current.contains(target)
      ) {
        setIsStickySearchOpen(false);
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
  }, [cartOpen, userMenuOpen, guestMenuOpen, stickyUserMenuOpen, stickyGuestMenuOpen, mobileMenuOpen, isSearchModalOpen, isStickySearchOpen]);

  // Scroll effect for header (desktop only)
  useEffect(() => {
    const handleScroll = () => {
      const threshold = window.innerHeight * 0.05;
      setScrolled(window.scrollY > 20);
      setScrolledPast5(window.scrollY > threshold);
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
        setGuestMenuOpen(false);
        setStickyUserMenuOpen(false);
        setStickyGuestMenuOpen(false);
        setMobileMenuOpen(false);
        setIsSearchModalOpen(false);
        setIsStickySearchOpen(false);
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
    setGuestMenuOpen(false);
    setMobileMenuOpen(false);
    router.push(href);
  }, [router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* Mobile Menu Overlay */}
      {/* {cartOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 animate-fadeIn"
          onClick={() => setCartOpen(false)}
        />
      )} */}

      {/* Mobile/Tablet Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mini Cart Panel - Rendered outside header with portal-like positioning */}
      <div
        ref={cartRef}
        className={`
          fixed top-0 right-0 h-screen w-full sm:w-96
          transform transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          z-70
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
        {/* MOBILE/TABLET: Top bar — Logo left, Cart + Hamburger right */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#EAD7B7]/95 backdrop-blur-md shadow-md px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="font-bold transition-transform hover:scale-105 active:scale-95">
            <Image src="/images/navbarLogo.png" width={500} height={500} alt="Logo" className="w-10" priority />
          </Link>

          {/* Right: Cart + Hamburger */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative p-2 rounded-full hover:bg-white/40 transition-colors"
              aria-label={`Shopping cart with ${cartItemCount} items`}
            >
              <ShoppingCart className="h-6 w-6 text-gray-800" />
              {mounted && cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 text-[10px] flex items-center justify-center bg-[#5A1E12] text-white rounded-full font-bold shadow-sm">
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              )}
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full hover:bg-white/40 transition-colors text-gray-800"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* DESKTOP: Full Header (hidden on mobile/tablet) */}
        <header
          className={`w-full hidden lg:flex rounded-full px-8 lg:px-12 py-2
            items-center shadow-xl transition-all duration-500 z-30 relative
            ${scrolled ? "bg-[#EAD7B7]/95 backdrop-blur-md shadow-lg" : "bg-[#EAD7B7]"}
            ${scrolledPast5 ? "opacity-0 pointer-events-none invisible" : "opacity-100 visible"}
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
          <div className="flex items-center gap-2 justify-end relative">
            {/* Search — Expanding Pill (grows leftward, never shifts nav) */}
            <div ref={searchRef} className="relative w-10 h-9">
              {/* Pill expands absolutely to the left — wrapper stays w-10 in flex flow */}
              <div
                className={`absolute right-0 top-0 h-9 flex items-center overflow-hidden rounded-full border transition-all duration-300 ease-in-out ${
                  isSearchModalOpen
                    ? "border-gray-200 bg-white shadow-lg"
                    : "border-transparent bg-transparent"
                }`}
                style={{ width: isSearchModalOpen ? "300px" : "40px" }}
              >
                <form
                  onSubmit={handleSearchSubmit}
                  className={`flex-1 min-w-0 pl-3 transition-opacity duration-200 ${isSearchModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                >
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                    autoFocus={isSearchModalOpen}
                  />
                </form>
                {/* spacer so input doesn't slide under button */}
                <div className="w-9 shrink-0" />
              </div>
              {/* Toggle button — pinned to right edge of wrapper, always in same spot */}
              <button
                onClick={() => { setIsSearchModalOpen(!isSearchModalOpen); if (isSearchModalOpen) setSearchTerm(""); }}
                className={`absolute right-0 top-0 z-10 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 ${
                  isSearchModalOpen ? "bg-[#5A1E12] text-white" : "hover:bg-white/30 text-gray-800"
                }`}
                aria-label={isSearchModalOpen ? "Close search" : "Open search"}
              >
                {isSearchModalOpen ? <X className="h-4 w-4" /> : <Search className="h-5 w-5" />}
              </button>

              {/* Results dropdown — 300px, polished UI */}
              <div
                className={`
                  absolute top-full right-0 mt-3 bg-white rounded-2xl shadow-2xl overflow-hidden z-50
                  border border-gray-100 transition-all duration-300 origin-top-right
                  ${isSearchModalOpen && searchTerm.trim().length > 1
                    ? "opacity-100 scale-100 translate-y-0 visible"
                    : "opacity-0 scale-95 -translate-y-2 invisible pointer-events-none"}
                `}
                style={{ width: "300px" }}
              >
                {searchTerm.trim().length > 1 && (
                  <>
                    {(segregatedSearchResults.products.length > 0 ||
                      segregatedSearchResults.categories.length > 0 ||
                      segregatedSearchResults.artists.length > 0) ? (
                      <div>
                        {/* Products Section */}
                        {segregatedSearchResults.products.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
                              <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">Products</span>
                              <div className="flex-1 h-px bg-[#5A1E12]/10" />
                            </div>
                            <div className="px-2 pb-1">
                              {segregatedSearchResults.products.map((product) => (
                                <button
                                  key={product.id}
                                  onClick={() => handleSearchSelect(product)}
                                  className="w-full text-left px-2 py-2 rounded-xl hover:bg-[#5A1E12]/5 transition-colors group flex items-center gap-3"
                                >
                                  <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                    {product.images?.[0] ? (
                                      <Image
                                        src={product.images[0]}
                                        alt={product.title}
                                        width={40}
                                        height={40}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Search className="w-4 h-4 text-gray-300" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-800 text-sm group-hover:text-[#5A1E12] truncate transition-colors">
                                      {product.title}
                                    </div>
                                    <div className="text-xs text-[#5A1E12] font-semibold mt-0.5">
                                      ${product.price}
                                    </div>
                                  </div>
                                  <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#5A1E12] transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Categories Section */}
                        {segregatedSearchResults.categories.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 px-4 pt-2 pb-1.5">
                              <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">Categories</span>
                              <div className="flex-1 h-px bg-[#5A1E12]/10" />
                            </div>
                            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                              {segregatedSearchResults.categories.map((category) => (
                                <button
                                  key={category}
                                  onClick={() => handleCategorySelect(category)}
                                  className="text-xs font-medium px-3 py-1.5 rounded-full border border-[#5A1E12]/20 text-[#5A1E12] hover:bg-[#5A1E12] hover:text-white transition-all"
                                >
                                  {category}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Artists Section */}
                        {segregatedSearchResults.artists.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 px-4 pt-2 pb-1.5">
                              <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">Artists</span>
                              <div className="flex-1 h-px bg-[#5A1E12]/10" />
                            </div>
                            <div className="px-2 pb-1">
                              {segregatedSearchResults.artists.map((artist) => (
                                <button
                                  key={artist}
                                  onClick={() => handleArtistSelect(artist)}
                                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#5A1E12]/5 transition-colors group flex items-center gap-2"
                                >
                                  <div className="w-7 h-7 rounded-full bg-[#EAD7B7]/50 flex items-center justify-center shrink-0">
                                    <User className="w-3.5 h-3.5 text-[#5A1E12]" />
                                  </div>
                                  <span className="text-sm text-gray-700 group-hover:text-[#5A1E12] font-medium transition-colors truncate">{artist}</span>
                                  <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#5A1E12] transition-colors shrink-0 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* View All CTA */}
                        <div className="p-3 pt-2">
                          <button
                            onClick={() => { setIsSearchModalOpen(false); router.push(`/shop?search=${encodeURIComponent(searchTerm)}`); }}
                            className="w-full flex items-center justify-between px-4 py-2.5 bg-[#5A1E12] hover:bg-[#4a180f] text-white rounded-xl transition-colors text-sm font-medium"
                          >
                            <span>View all results</span>
                            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                              {segregatedSearchResults.products.length + segregatedSearchResults.categories.length + segregatedSearchResults.artists.length}
                            </span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-10 flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                          <Search className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">No results found</p>
                        <p className="text-xs text-gray-400">Try a different keyword</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

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

              {mounted && cartItemCount > 0 && (
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
                {/* Guest Menu Dropdown */}
                <div className="relative" ref={guestMenuRef}>
                  <button
                    onClick={() => setGuestMenuOpen(!guestMenuOpen)}
                    className={`p-2 rounded-full transition-all duration-300 ${guestMenuOpen ? "bg-[#5A1E12] text-white" : "hover:bg-white/30 text-gray-800"}`}
                    aria-label="Account options"
                    aria-expanded={guestMenuOpen}
                  >
                    <User className="h-6 w-6" />
                  </button>

                  {guestMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-100 animate-fadeIn origin-top-right">
                      <div className="py-1">
                        <button
                          onClick={() => handleNavigation("/login")}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium"
                        >
                          Login
                        </button>
                        <button
                          onClick={() => handleNavigation("/signup")}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium"
                        >
                          Create new account
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href="/sellerOnboarding"
                  className="font-medium bg-[#5A1E12] text-white text-sm hover:bg-[#4a180f] hover:shadow-lg transition-all px-6 py-2 rounded-full shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Register as Seller
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
                      <p className="font-semibold text-gray-900 truncate">Hi {user.name?.split(" ")[0] || "User"}</p>
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

        {/* Mobile/Tablet Menu Drawer */}
        <div
          ref={mobileMenuRef}
          className={`
            fixed top-0 right-0 h-screen w-[320px] max-w-[90vw] z-55
            flex flex-col bg-white lg:hidden
            transform transition-transform duration-300 ease-out
            ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}
          `}
        >
          {/* ── TOP: User / Brand header ── */}
          <div className="shrink-0 bg-[#5A1E12] px-5 pt-4 pb-5">
            <div className="flex items-start justify-between">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/40 shrink-0 bg-[#EAD7B7] flex items-center justify-center">
                    {user.profileImage ? (
                      <Image src={user.profileImage} alt={user.name || "User"} width={48} height={48} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-[#5A1E12]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-base leading-tight">Hi, {user.name?.split(" ")[0] || "User"}</p>
                    <p className="text-xs text-white/60 truncate mt-0.5">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Image src="/images/navbarLogo.png" width={500} height={500} alt="Logo" className="w-9 brightness-0 invert" />
                  <p className="font-bold text-white text-lg">Alpa</p>
                </div>
              )}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0 mt-0.5"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search bar — lives inside the header band */}
            <form
              onSubmit={(e) => { e.preventDefault(); if (searchTerm.trim()) { setMobileMenuOpen(false); setSearchTerm(""); router.push(`/shop?search=${encodeURIComponent(searchTerm.trim())}`); } }}
              className="mt-4 relative"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-white/40 outline-none focus:bg-white/20 focus:border-white/40 transition-all"
              />
            </form>
          </div>

          {/* ── SCROLLABLE BODY ── */}
          <div className="flex-1 overflow-y-auto">

            {/* Search results (only when typing) */}
            {searchTerm.trim().length > 1 && (
              <div className="mx-4 mt-3 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {(segregatedSearchResults.products.length > 0 || segregatedSearchResults.categories.length > 0 || segregatedSearchResults.artists.length > 0) ? (
                  <div>
                    {segregatedSearchResults.products.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                          <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">Products</span>
                          <div className="flex-1 h-px bg-[#5A1E12]/10" />
                        </div>
                        {segregatedSearchResults.products.slice(0, 4).map((product) => (
                          <button key={product.id} onClick={() => { setMobileMenuOpen(false); handleSearchSelect(product); }} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#5A1E12]/5 transition-colors">
                            <div className="w-9 h-9 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                              {product.images?.[0] ? <Image src={product.images[0]} alt={product.title} width={36} height={36} className="w-full h-full object-cover" /> : <Search className="w-4 h-4 text-gray-300 m-2" />}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-sm font-medium text-gray-800 truncate">{product.title}</p>
                              <p className="text-xs text-[#5A1E12] font-semibold">${product.price}</p>
                            </div>
                            <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </button>
                        ))}
                      </div>
                    )}
                    {segregatedSearchResults.categories.length > 0 && (
                      <div className="px-4 pb-3">
                        <div className="flex items-center gap-2 pt-2 pb-1.5">
                          <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">Categories</span>
                          <div className="flex-1 h-px bg-[#5A1E12]/10" />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {segregatedSearchResults.categories.map((cat) => (
                            <button key={cat} onClick={() => { setMobileMenuOpen(false); handleCategorySelect(cat); }} className="text-xs px-3 py-1.5 rounded-full border border-[#5A1E12]/20 text-[#5A1E12] hover:bg-[#5A1E12] hover:text-white transition-all">{cat}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    {segregatedSearchResults.artists.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 px-4 pt-2 pb-1">
                          <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">Artists</span>
                          <div className="flex-1 h-px bg-[#5A1E12]/10" />
                        </div>
                        {segregatedSearchResults.artists.map((artist) => (
                          <button key={artist} onClick={() => { setMobileMenuOpen(false); handleArtistSelect(artist); }} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#5A1E12]/5 transition-colors group">
                            <div className="w-8 h-8 rounded-full bg-[#EAD7B7]/60 flex items-center justify-center shrink-0">
                              <User className="w-3.5 h-3.5 text-[#5A1E12]" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-[#5A1E12] transition-colors truncate flex-1 text-left">{artist}</span>
                            <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#5A1E12] transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </button>
                        ))}
                      </div>
                    )}
                    <button onClick={() => { setMobileMenuOpen(false); setSearchTerm(""); router.push(`/shop?search=${encodeURIComponent(searchTerm)}`); }} className="w-full flex items-center justify-between px-4 py-2.5 bg-[#5A1E12] text-white text-sm font-medium">
                      <span>View all results</span>
                      <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">{segregatedSearchResults.products.length + segregatedSearchResults.categories.length + segregatedSearchResults.artists.length}</span>
                    </button>
                  </div>
                ) : (
                  <div className="py-6 flex flex-col items-center gap-1">
                    <Search className="w-5 h-5 text-gray-300" />
                    <p className="text-sm text-gray-500">No results for &quot;{searchTerm}&quot;</p>
                  </div>
                )}
              </div>
            )}

            {/* ── NAVIGATION ── */}
            <div className="px-4 pt-5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Navigation</p>
              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive(href)
                        ? "bg-[#5A1E12] text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive(href) ? "bg-white" : "bg-[#5A1E12]/40"}`} />
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* ── ACCOUNT ── */}
            <div className="px-4 pt-5 pb-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Account</p>
              {!user ? (
                <div className="flex flex-col gap-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#5A1E12]/30 text-[#5A1E12] text-sm font-medium hover:bg-[#5A1E12]/5 transition-colors">
                    <User className="w-4 h-4" />
                    Login
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#5A1E12] text-white text-sm font-medium hover:bg-[#4a180f] transition-colors">
                    Create Account
                  </Link>
                  <Link href="/sellerOnboarding" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#EAD7B7] text-[#5A1E12] text-sm font-medium hover:bg-[#e0c9a0] transition-colors">
                    Register as Seller
                  </Link>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                  <Link href="https://alpa-dashboard.vercel.app/dashboard/customer/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors text-sm text-gray-700 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-[#EAD7B7] flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-[#5A1E12]" />
                    </div>
                    <span className="font-medium">My Profile</span>
                    <svg className="w-3.5 h-3.5 text-gray-300 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                  <Link href="https://alpa-dashboard.vercel.app/dashboard/customer/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors text-sm text-gray-700 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-[#EAD7B7] flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-[#5A1E12]" />
                    </div>
                    <span className="font-medium">My Orders</span>
                    <svg className="w-3.5 h-3.5 text-gray-300 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                  {user.role === "admin" && (
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors text-sm text-gray-700 border-b border-gray-100">
                      <div className="w-8 h-8 rounded-full bg-[#EAD7B7] flex items-center justify-center shrink-0">
                        <Settings className="w-4 h-4 text-[#5A1E12]" />
                      </div>
                      <span className="font-medium">Admin Dashboard</span>
                      <svg className="w-3.5 h-3.5 text-gray-300 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  )}
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-sm text-red-500">
                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                      <LogOut className="w-4 h-4 text-red-500" />
                    </div>
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECONDARY STICKY HEADER - rendered outside NavbarWrapper's div to avoid visibility/z-index cascade */}
      <header
        className={`
          hidden lg:flex fixed top-0 left-0 right-0 z-60
          px-8 lg:px-16 py-3 items-center
          bg-[#EAD7B7]/95 backdrop-blur-md shadow-lg
          transition-all duration-500
          ${scrolledPast5 ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"}
        `}
      >
        {/* Logo */}
        <Link href="/" className="font-bold transition-transform hover:scale-105 active:scale-95 shrink-0">
          <Image src="/images/navbarLogo.png" width={500} height={500} alt="Logo" className="w-10 md:w-14" priority />
        </Link>

        <div className="flex-1" />

        {/* Nav Links */}
        <nav className="flex gap-4 lg:gap-6 absolute left-1/2 transform -translate-x-1/2">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`group relative px-2 py-1 text-sm lg:text-base font-medium transition-all duration-300
                ${isActive(href) ? "text-[#5A1E12]" : "text-gray-700 hover:text-[#5A1E12]"}
              `}
            >
              {label}
              <span
                className={`pointer-events-none absolute left-0 bottom-0 h-0.5 w-full bg-[#5A1E12] rounded-full
                  transition-transform duration-300 origin-left
                  ${isActive(href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}
                `}
              />
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 justify-end relative">
          {/* Search — Expanding Pill (grows leftward, never shifts nav) */}
          <div ref={stickySearchRef} className="relative w-10 h-9">
            {/* Pill expands absolutely to the left — wrapper stays w-10 in flex flow */}
            <div
              className={`absolute right-0 top-0 h-9 flex items-center overflow-hidden rounded-full border transition-all duration-300 ease-in-out ${
                isStickySearchOpen
                  ? "border-gray-200 bg-white shadow-lg"
                  : "border-transparent bg-transparent"
              }`}
              style={{ width: isStickySearchOpen ? "300px" : "40px" }}
            >
              <form
                onSubmit={handleSearchSubmit}
                className={`flex-1 min-w-0 pl-3 transition-opacity duration-200 ${isStickySearchOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              >
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                  autoFocus={isStickySearchOpen}
                />
              </form>
              {/* spacer so input doesn't slide under button */}
              <div className="w-9 shrink-0" />
            </div>
            {/* Toggle button — pinned to right edge, always same position */}
            <button
              onClick={() => { setIsStickySearchOpen(!isStickySearchOpen); if (isStickySearchOpen) setSearchTerm(""); }}
              className={`absolute right-0 top-0 z-10 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 ${
                isStickySearchOpen ? "bg-[#5A1E12] text-white" : "hover:bg-white/30 text-gray-800"
              }`}
              aria-label={isStickySearchOpen ? "Close search" : "Open search"}
            >
              {isStickySearchOpen ? <X className="h-4 w-4" /> : <Search className="h-5 w-5" />}
            </button>

            {/* Results dropdown */}
            <div
              className={`absolute top-full right-0 mt-3 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 border border-gray-100 transition-all duration-300 origin-top-right ${
                isStickySearchOpen && searchTerm.trim().length > 1
                  ? "opacity-100 scale-100 translate-y-0 visible"
                  : "opacity-0 scale-95 -translate-y-2 invisible pointer-events-none"
              }`}
              style={{ width: "300px" }}
            >
              {searchTerm.trim().length > 1 && (
                <>
                  {(segregatedSearchResults.products.length > 0 ||
                    segregatedSearchResults.categories.length > 0 ||
                    segregatedSearchResults.artists.length > 0) ? (
                    <div>
                      {segregatedSearchResults.products.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
                            <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">Products</span>
                            <div className="flex-1 h-px bg-[#5A1E12]/10" />
                          </div>
                          <div className="px-2 pb-1">
                            {segregatedSearchResults.products.map((product) => (
                              <button
                                key={product.id}
                                onClick={() => handleSearchSelect(product)}
                                className="w-full text-left px-2 py-2 rounded-xl hover:bg-[#5A1E12]/5 transition-colors group flex items-center gap-3"
                              >
                                <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                  {product.images?.[0] ? (
                                    <Image src={product.images[0]} alt={product.title} width={40} height={40} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center"><Search className="w-4 h-4 text-gray-300" /></div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-800 text-sm group-hover:text-[#5A1E12] truncate transition-colors">{product.title}</div>
                                  <div className="text-xs text-[#5A1E12] font-semibold mt-0.5">${product.price}</div>
                                </div>
                                <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#5A1E12] transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {segregatedSearchResults.categories.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 px-4 pt-2 pb-1.5">
                            <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">Categories</span>
                            <div className="flex-1 h-px bg-[#5A1E12]/10" />
                          </div>
                          <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                            {segregatedSearchResults.categories.map((category) => (
                              <button key={category} onClick={() => handleCategorySelect(category)} className="text-xs font-medium px-3 py-1.5 rounded-full border border-[#5A1E12]/20 text-[#5A1E12] hover:bg-[#5A1E12] hover:text-white transition-all">
                                {category}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {segregatedSearchResults.artists.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 px-4 pt-2 pb-1.5">
                            <span className="text-[10px] font-bold text-[#5A1E12] uppercase tracking-widest">Artists</span>
                            <div className="flex-1 h-px bg-[#5A1E12]/10" />
                          </div>
                          <div className="px-2 pb-1">
                            {segregatedSearchResults.artists.map((artist) => (
                              <button key={artist} onClick={() => handleArtistSelect(artist)} className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#5A1E12]/5 transition-colors group flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-[#EAD7B7]/50 flex items-center justify-center shrink-0">
                                  <User className="w-3.5 h-3.5 text-[#5A1E12]" />
                                </div>
                                <span className="text-sm text-gray-700 group-hover:text-[#5A1E12] font-medium transition-colors truncate">{artist}</span>
                                <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#5A1E12] transition-colors shrink-0 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="p-3 pt-2">
                        <button
                          onClick={() => { setIsStickySearchOpen(false); setSearchTerm(""); router.push(`/shop?search=${encodeURIComponent(searchTerm)}`); }}
                          className="w-full flex items-center justify-between px-4 py-2.5 bg-[#5A1E12] hover:bg-[#4a180f] text-white rounded-xl transition-colors text-sm font-medium"
                        >
                          <span>View all results</span>
                          <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                            {segregatedSearchResults.products.length + segregatedSearchResults.categories.length + segregatedSearchResults.artists.length}
                          </span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-10 flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                        <Search className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">No results found</p>
                      <p className="text-xs text-gray-400">Try a different keyword</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Cart */}
          <button
            ref={cartButtonRef}
            onClick={toggleCart}
            className="relative p-2 rounded-full hover:bg-white/30 transition-all duration-300 group"
            aria-label={`Shopping cart with ${cartItemCount} items`}
          >
            <ShoppingCart className={`h-5 w-5 text-gray-800 transition-transform duration-300 ${cartOpen ? "rotate-12 scale-110" : "group-hover:scale-110"}`} />
            {mounted && cartItemCount > 0 && (
              <>
                {!cartOpen && <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75" />}
                <span className={`absolute -top-1 -right-1 h-4 w-4 text-[10px] flex items-center justify-center bg-red-500 text-white rounded-full font-bold shadow-sm transition-transform duration-300 ${cartOpen ? "scale-125" : ""}`}>
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              </>
            )}
          </button>

          {/* Auth */}
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          ) : !user ? (
            <div className="flex items-center gap-3">
              <div className="relative" ref={stickyGuestMenuRef}>
                <button
                  onClick={() => setStickyGuestMenuOpen(!stickyGuestMenuOpen)}
                  className={`p-2 rounded-full transition-all duration-300 ${stickyGuestMenuOpen ? "bg-[#5A1E12] text-white" : "hover:bg-white/30 text-gray-800"}`}
                  aria-label="Account options"
                >
                  <User className="h-5 w-5" />
                </button>
                {stickyGuestMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-100 animate-fadeIn origin-top-right">
                    <div className="py-1">
                      <button onClick={() => { setStickyGuestMenuOpen(false); router.push("/login"); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium">Login</button>
                      <button onClick={() => { setStickyGuestMenuOpen(false); router.push("/signup"); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium">Create new account</button>
                    </div>
                  </div>
                )}
              </div>
              <Link href="/sellerOnboarding" className="font-medium bg-[#5A1E12] text-white text-sm hover:bg-[#4a180f] hover:shadow-lg transition-all px-5 py-2 rounded-full shadow-md transform hover:-translate-y-0.5 active:translate-y-0">
                Register as Seller
              </Link>
            </div>
          ) : (
            <div className="relative" ref={stickyUserMenuRef}>
              <button
                onClick={() => setStickyUserMenuOpen(!stickyUserMenuOpen)}
                className="flex items-center gap-2 group"
                aria-label="User menu"
              >
                <div className="relative">
                  {user.profileImage ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-transparent group-hover:scale-110 transition-colors">
                      <Image src={user.profileImage} alt={user.name || "User"} width={32} height={32} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#EAD7B7] to-[#5A1E12] flex items-center justify-center border-2 border-transparent group-hover:border-[#5A1E12] transition-colors">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <svg className={`w-4 h-4 transition-transform ${stickyUserMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {stickyUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-100 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-gray-100 bg-linear-to-r from-[#EAD7B7]/10 to-transparent">
                    <p className="font-semibold text-gray-900 truncate">Hi {user.name?.split(" ")[0] || "User"}</p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                  <div className="py-2">
                    <button onClick={() => { setStickyUserMenuOpen(false); router.push("https://alpa-dashboard.vercel.app/dashboard/customer/profile"); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 text-sm"><User className="w-4 h-4" /><span>My Profile</span></button>
                    <button onClick={() => { setStickyUserMenuOpen(false); router.push("https://alpa-dashboard.vercel.app/dashboard/customer/orders"); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 text-sm"><Package className="w-4 h-4" /><span>My Orders</span></button>
                    {user.role === "admin" && (
                      <button onClick={() => { setStickyUserMenuOpen(false); router.push("/admin"); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 text-sm"><Settings className="w-4 h-4" /><span>Admin Dashboard</span></button>
                    )}
                    <div className="border-t border-gray-100 mt-2">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600 text-sm"><LogOut className="w-4 h-4" /><span>Logout</span></button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
    </>
  );
}