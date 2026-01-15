// app/layout.tsx (SERVER COMPONENT)
import NavbarWrapper from "./NavbarWrapper";
import FooterWrapper from "./FooterWrapper";
import "./globals.css";
import { CartProvider } from "./context/CartContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#ECE4D6]">
        <CartProvider>
          <NavbarWrapper />
          {children}
          <FooterWrapper />
        </CartProvider>
      </body>
    </html>
  );
}
