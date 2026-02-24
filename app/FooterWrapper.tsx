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
    pathname === "/order-confirmation" ||
    pathname === "/checkout" ||
    pathname === "/signup-otp";

  if (hideFooter) return null;

  return <Footer />;
}
