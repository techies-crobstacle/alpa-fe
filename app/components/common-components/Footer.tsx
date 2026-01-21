
import {
  FaLinkedinIn,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaEnvelope,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#440C03] text-white px-4 sm:px-8 md:px-12 lg:px-20 py-12 md:py-16"> 
      {/* Top Main Section */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 mb-12">
        {/* Left Section - Navigation Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 flex-1">
          {/* Column 1 - Shop */}
          <div className="flex flex-col">
            <h2 className="mb-4 text-lg font-semibold">Shop</h2>
            <Link href="/shop" className="mb-2 hover:text-[#A48068] transition-colors">
              All Products
            </Link>
            <Link href="/shop?category=paintings" className="mb-2 hover:text-[#A48068] transition-colors">
              Paintings
            </Link>
            <Link href="/shop?category=sculptures" className="mb-2 hover:text-[#A48068] transition-colors">
              Sculptures
            </Link>
            <Link href="/shop?category=crafts" className="mb-2 hover:text-[#A48068] transition-colors">
              Traditional Crafts
            </Link>
            <Link href="/shop?featured=true" className="mb-2 hover:text-[#A48068] transition-colors">
              Featured Artists
            </Link>
          </div>

          {/* Column 2 - About */}
          <div className="flex flex-col">
            <h2 className="mb-4 text-lg font-semibold">About</h2>
            <Link href="/about-us" className="mb-2 hover:text-[#A48068] transition-colors">
              About Us
            </Link>
            <Link href="/artists" className="mb-2 hover:text-[#A48068] transition-colors">
              Our Artists
            </Link>
            <Link href="/our-story" className="mb-2 hover:text-[#A48068] transition-colors">
              Our Story
            </Link>
            <Link href="/community" className="mb-2 hover:text-[#A48068] transition-colors">
              Community Impact
            </Link>
            <Link href="/blog" className="mb-2 hover:text-[#A48068] transition-colors">
              Blog
            </Link>
          </div>

          {/* Column 3 - Support */}
          <div className="flex flex-col">
            <h2 className="mb-4 text-lg font-semibold">Support</h2>
            <Link href="/contact-us" className="mb-2 hover:text-[#A48068] transition-colors">
              Contact Us
            </Link>
            <Link href="/faq" className="mb-2 hover:text-[#A48068] transition-colors">
              FAQ
            </Link>
            <Link href="/shipping" className="mb-2 hover:text-[#A48068] transition-colors">
              Shipping & Returns
            </Link>
            <Link href="/privacy" className="mb-2 hover:text-[#A48068] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="mb-2 hover:text-[#A48068] transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>

        {/* Right Section - Newsletter */}
        <div className="lg:w-96">
          <h2 className="mb-4 text-lg font-semibold">Stay Connected</h2>

          <p className="mb-6 text-sm md:text-base">
            Subscribe to our newsletter for exclusive updates on new artworks, artist stories, and special offers.
          </p>

          <div className="bg-[#A48068] px-4 py-3 flex items-center gap-3 rounded-full w-full">
            <input
              type="email"
              placeholder="Enter Email here"
              className="bg-transparent outline-none text-white placeholder-white/80 flex-1 text-sm md:text-base"
            />
            <button 
              type="submit" 
              aria-label="Subscribe to newsletter"
              className="hover:scale-110 transition-transform"
            >
              <FaEnvelope className="w-5 h-5 text-black" />
            </button>
          </div>
        </div>
      </div>

      {/* Address and Copyright Section */}
      <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-4 mb-8 text-sm md:text-base text-center md:text-left">
        <p className="text-white/80">
          12 Shelley Street, Sydney, NSW 2000, Australia.
        </p>
        <p className="text-white/80">
          © 2026 Arnhem Land Marketplace. All rights reserved.
        </p>
      </div>

      {/* Payment Methods */}
      <div className="flex justify-center md:justify-end mb-6">
        <div className="flex items-center gap-4">
          <Image 
            src="/images/paypal.png" 
            width={80} 
            height={40} 
            alt="PayPal accepted" 
            className="w-20 h-auto"
          />
          {/* Add more payment method logos here if needed */}
        </div>
      </div>

      <hr className="border-[#A5816B] mb-6" />

      {/* Logo and Social Icons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Image
            src="/images/navbarLogo.png"
            height={80}
            width={80}
            alt="Arnhem Land Marketplace Logo"
            className="w-16 sm:w-20 h-auto"
          />
        </Link>

        {/* Social Icons */}
        <div className="flex items-center gap-4 md:gap-6">
          <Link 
            href="https://www.instagram.com" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Follow us on Instagram"
            className="hover:scale-110 transition-transform"
          >
            <FaInstagram className="w-5 h-5 md:w-6 md:h-6 text-white hover:text-[#A48068]" />
          </Link>

          <Link 
            href="https://www.facebook.com" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Follow us on Facebook"
            className="hover:scale-110 transition-transform"
          >
            <FaFacebookF className="w-5 h-5 md:w-6 md:h-6 text-white hover:text-[#A48068]" />
          </Link>

          <Link 
            href="https://www.linkedin.com" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Follow us on LinkedIn"
            className="hover:scale-110 transition-transform"
          >
            <FaLinkedinIn className="w-5 h-5 md:w-6 md:h-6 text-white hover:text-[#A48068]" />
          </Link>

          <Link 
            href="https://www.youtube.com" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Subscribe on YouTube"
            className="hover:scale-110 transition-transform"
          >
            <FaYoutube className="w-5 h-5 md:w-6 md:h-6 text-white hover:text-[#A48068]" />
          </Link>

          <Link 
            href="https://x.com" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Follow us on X (Twitter)"
            className="hover:scale-110 transition-transform"
          >
            <FaXTwitter className="w-5 h-5 md:w-6 md:h-6 text-white hover:text-[#A48068]" />
          </Link>
        </div>
      </div>
    </footer>
  );
}

// import {
//   FaLinkedinIn,
//   FaFacebookF,
//   FaInstagram,
//   FaYoutube,
//   FaEnvelope,
// } from "react-icons/fa";
// import { FaXTwitter } from "react-icons/fa6";
// import Image from "next/image";
// import Link from "next/link";
// export default function Page() {
//   return (
//     <section className="bg-[#440C03] text-white px-20 py-16 h-151 flex flex-col"> 
//       {/* Top Main Section */}
//       <div className="flex flex-col lg:flex-row gap-16">
//         {/* Left Section */}
//         <div className="flex gap-16">
//           {[1, 2, 3].map((_, i) => (
//             <div key={i} className="flex flex-col w-72">
//               <h1 className="mb-5 text-lg font-semibold">Heading</h1>
//               <p className="mb-1">Page Title</p>
//               <p className="mb-1">Page Title</p>
//               <p className="mb-1">Page Title</p>
//               <p className="mb-1">Page Title</p>
//               <p className="mb-1">Page Title</p>
//             </div>
//           ))}
//         </div>

//         {/* Right Section */}
//         <div className="flex-1">
//           <h1 className="mb-5 text-lg font-semibold">Heading</h1>

//           <p className="mb-8 max-w-md">
//             Lorem Ipsum is simply dummy text of the printing and typesetting
//             industry.
//           </p>

//           <div className="bg-[#A48068] px-4 py-3 flex items-center gap-3 rounded-full max-w-md">
//             <input
//               type="text"
//               placeholder="Enter Email here"
//               className="bg-transparent outline-none text-white placeholder-white flex-1"
//             />
//             <FaEnvelope className="w-5 h-5 text-black" />
//           </div>
//         </div>
//       </div>

//       {/* Address Section */}
//       <div className="mt-16 flex flex-col md:flex-row justify-between gap-6 mb-10">
//         <p>12 Shelley Street, Sydney, NSW 2000, Australia.</p>
//         <p>© 2026 Arhem Land Marketplace. All rights reserved.</p>
//       </div>

//       <div className="flex justify-end mb-4">
//         <Image src="/images/paypal.png" width={100} height={100} alt="Paypal" />
//       </div>
//       <hr className="text-[#A5816B] mb-5" />
//         {/* Logo and Social icons..... */}

// <div className="flex items-center justify-between">
//   {/* Logo */}
//   <Image
//     src="/images/navbarLogo.png"
//     height={100}
//     width={100}
//     alt="Logo"
//   />

//   {/* Social icons */}
//   <div className="flex items-center gap-4">
//     <Link href="https://www.instagram.com" target="_blank" aria-label="Instagram">
//       <FaInstagram className="w-5 h-5 text-white cursor-pointer hover:opacity-80" />
//     </Link>

//     <Link href="https://www.facebook.com" target="_blank" aria-label="Facebook">
//       <FaFacebookF className="w-5 h-5 text-white cursor-pointer hover:opacity-80" />
//     </Link>

//     <Link href="https://www.linkedin.com" target="_blank" aria-label="LinkedIn">
//       <FaLinkedinIn className="w-5 h-5 text-white cursor-pointer hover:opacity-80" />
//     </Link>

//     <Link href="https://www.youtube.com" target="_blank" aria-label="YouTube">
//       <FaYoutube className="w-5 h-5 text-white cursor-pointer hover:opacity-80" />
//     </Link>

//     <Link href="https://x.com" target="_blank" aria-label="X (Twitter)">
//       <FaXTwitter className="w-5 h-5 text-white cursor-pointer hover:opacity-80" />
//     </Link>
//   </div>
// </div>


//     </section>
//   );
// }




// import {
//   FaLinkedinIn,
//   FaFacebookF,
//   FaInstagram,
//   FaYoutube,
//   FaEnvelope,
// } from "react-icons/fa";
// import { FaXTwitter } from "react-icons/fa6";
// import Image from "next/image";
// import Link from "next/link";

// export default function Page() {
//   return (
//     <section className="bg-[#440C03] text-white px-6 sm:px-12 lg:px-20 py-12 lg:py-16">
//       {/* Top Main Section */}
//       <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
//         {/* Left Section - Keep horizontal layout on desktop, grid on mobile */}
//         <div className="flex flex-col sm:flex-row gap-8 lg:gap-16">
//           {[1, 2, 3].map((_, i) => (
//             <div key={i} className="flex flex-col w-full sm:w-auto">
//               <h1 className="mb-5 text-lg font-semibold">Heading</h1>
//               <p className="mb-1">Page Title</p>
//               <p className="mb-1">Page Title</p>
//               <p className="mb-1">Page Title</p>
//               <p className="mb-1">Page Title</p>
//               <p className="mb-1">Page Title</p>
//             </div>
//           ))}
//         </div>

//         {/* Right Section */}
//         <div className="flex-1">
//           <h1 className="mb-5 text-lg font-semibold">Heading</h1>

//           <p className="mb-8 max-w-md">
//             Lorem Ipsum is simply dummy text of the printing and typesetting
//             industry.
//           </p>

//           <div className="bg-[#A48068] px-4 py-3 flex items-center gap-3 rounded-full max-w-md">
//             <input
//               type="text"
//               placeholder="Enter Email here"
//               className="bg-transparent outline-none text-white placeholder-white flex-1"
//             />
//             <FaEnvelope className="w-5 h-5 text-black" />
//           </div>
//         </div>
//       </div>

//       {/* Address Section */}
//       <div className="mt-12 lg:mt-16 flex flex-col md:flex-row justify-between gap-4 lg:gap-6 mb-8 lg:mb-10">
//         <p>12 Shelley Street, Sydney, NSW 2000, Australia.</p>
//         <p>© 2026 Arhem Land Marketplace. All rights reserved.</p>
//       </div>

//       <div className="flex justify-end mb-4">
//         <Image 
//           src="/images/paypal.png" 
//           width={100} 
//           height={100} 
//           alt="Paypal" 
//           className="w-20 lg:w-24"
//         />
//       </div>
      
//       <hr className="border-[#A5816B] mb-5" />
      
//       {/* Logo and Social icons */}
//       <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
//         {/* Logo */}
//         <Image
//           src="/images/navbarLogo.png"
//           height={100}
//           width={100}
//           alt="Logo"
//           className="w-16 lg:w-20"
//         />

//         {/* Social icons */}
//         <div className="flex items-center gap-4">
//           <Link href="https://www.instagram.com" target="_blank" aria-label="Instagram">
//             <FaInstagram className="w-5 h-5 text-white cursor-pointer hover:opacity-80" />
//           </Link>

//           <Link href="https://www.facebook.com" target="_blank" aria-label="Facebook">
//             <FaFacebookF className="w-5 h-5 text-white cursor-pointer hover:opacity-80" />
//           </Link>

//           <Link href="https://www.linkedin.com" target="_blank" aria-label="LinkedIn">
//             <FaLinkedinIn className="w-5 h-5 text-white cursor-pointer hover:opacity-80" />
//           </Link>

//           <Link href="https://www.youtube.com" target="_blank" aria-label="YouTube">
//             <FaYoutube className="w-5 h-5 text-white cursor-pointer hover:opacity-80" />
//           </Link>

//           <Link href="https://x.com" target="_blank" aria-label="X (Twitter)">
//             <FaXTwitter className="w-5 h-5 text-white cursor-pointer hover:opacity-80" />
//           </Link>
//         </div>
//       </div>
//     </section>
//   );
// }
