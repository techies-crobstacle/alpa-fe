"use client";
import Link from "next/link";
import Image from "next/image";


export default function Header() {
  return (
    <div className="mx-auto  
    rounded-full bg-[#EAD7B7]
                    px-6 py-3 flex items-center justify-between shadow-lg">
      <Link href="/" className="font-bold">
        <Image src="/images/navbarLogo.png" width={500} height={500} alt="Logo" className="w-15" />
      </Link>

     

      <div className="hidden md:flex gap-6 text-sm">
        <Link href="/privacy"> Privacy</Link>
        <Link href="/term-and-conditions"> Term and Service</Link>
        <Link href="/disclaimer"> Disclaimer</Link>
        <Link href="/about-us"> About us</Link>
        <Link href="/contact-us"> Contact-Us</Link>
        <span>Experience</span>
        <span>About</span>
        <span>Community</span>
      </div>

      <button className="rounded-full bg-[#5A1E12] px-4 py-1 text-white">
        Signin
      </button>
    </div>
  );
}
