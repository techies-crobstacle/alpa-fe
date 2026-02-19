// app/FooterWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/common-components/Footer";

export default function FooterWrapper() {
  const pathname = usePathname();

  const hideFooter =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/login-verify-otp" ||
    pathname === "/cart"|| 
    pathname === "/sellerOnboarding" || 
    pathname === "/cart/single-page" ||
    pathname === "/shop/cart/checkout" ||
    pathname === "/checkout";

  if (hideFooter) return null;

  return <Footer />;
}
