"use client"
import Navbar from "./components/common-components/Header";
import Footer from "./components/common-components/Footer"
import "./globals.css";
import { usePathname } from "next/navigation";



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname = usePathname();
  const hideNavbar =
    pathname === "/login" || pathname === "/signup" || "/shop" ;
  return (
    <html lang="en">
      <body className="bg-[#ECE4D6]">

        {/* GLOBAL FLOATING NAVBAR */}
        <div className="fixed top-6 left-1/2 -translate-x-1/2 
                        z-50 w-full px-6">
          { !hideNavbar && <Navbar />}
        </div>

        {/* PAGE CONTENT */}
        {children}

        <div>
          { !hideNavbar && <Footer/>}
        </div>

      </body>
    </html>
  );
}
