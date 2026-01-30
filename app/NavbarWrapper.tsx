// app/NavbarWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import Navbar from "./components/common-components/Header";

export default function NavbarWrapper() {
  const pathname = usePathname();

  const hideNavbar =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/sellerOnboarding" || 
    pathname === "/login-verify-otp"

    ;

  if (hideNavbar) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full px-6">
      <Navbar />
    </div>
  );
}
