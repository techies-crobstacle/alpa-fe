// app/layout.tsx (SERVER COMPONENT)
import NavbarWrapper from "./NavbarWrapper";
import FooterWrapper from "./FooterWrapper";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import QueryProvider from "./providers/QueryProvider";
import { EnhancedCartProvider } from "./hooks/useSharedEnhancedCart";
import { StickyLeftCouponDrawer } from "./components/common-components/StickyLeftCouponDrawer";
import ToastProvider from "./providers/ToastProvider";

export const metadata = {
  title: "Arnhem  ",
  // You can add more meta fields here if needed
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#ECE4D6]">
        <ToastProvider />
        <QueryProvider>
          <CartProvider>
            <EnhancedCartProvider>
              <AuthProvider>
                <StickyLeftCouponDrawer />
                <NavbarWrapper />
                {children}
                <FooterWrapper />
              </AuthProvider>
            </EnhancedCartProvider>
          </CartProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
