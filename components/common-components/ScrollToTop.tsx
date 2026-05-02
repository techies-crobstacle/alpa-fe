"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { FaArrowUp } from "react-icons/fa";

export default function ScrollToTop() {
  const pathname = usePathname();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const hiddenPaths = ["/cart", "/checkout", "/shop/cart/checkout"];
  if (hiddenPaths.includes(pathname)) return null;
  if (!showScrollTop) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 bg-[#5A1E12] hover:bg-[#4a180f] text-[#EAD7B7] p-4 rounded-full shadow-[0_8px_32px_rgba(90,30,18,0.25)] hover:shadow-[0_12px_40px_rgba(90,30,18,0.35)] transform hover:scale-110 transition-all duration-300 ease-in-out group border-2 border-[#EAD7B7]/20 backdrop-blur-sm"
      aria-label="Scroll to top"
    >
      <FaArrowUp className="w-5 h-5 group-hover:animate-bounce group-hover:scale-110 transition-transform duration-200" />
    </button>
  );
}