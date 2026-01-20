// app/layout.tsx (SERVER COMPONENT)
import NavbarWrapper from "./NavbarWrapper";
import FooterWrapper from "./FooterWrapper";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

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
        <CartProvider>
          <AuthProvider>
            <NavbarWrapper />
            {children}
            <FooterWrapper />
          </AuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}
