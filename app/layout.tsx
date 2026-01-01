import Navbar from "./components/common-components/Header";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#ECE4D6]">

        {/* GLOBAL FLOATING NAVBAR */}
        <div className="fixed top-6 left-1/2 -translate-x-1/2 
                        z-50 w-full px-6">
          <Navbar />
        </div>

        {/* PAGE CONTENT */}
        {children}

      </body>
    </html>
  );
}
