// app/FooterWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import Footer from "./components/common-components/Footer";

export default function FooterWrapper() {
  const pathname = usePathname();

  const hideFooter =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/shop/cart"|| 
    pathname === "/shop/cart/single-page"
    ;

  if (hideFooter) return null;

  return <Footer />;
}
