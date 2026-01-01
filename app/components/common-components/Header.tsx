"use client";
import Link from "next/link";

export default function Header() {
  return (
    <div className="mx-auto  
    rounded-full bg-[#EAD7B7]
                    px-6 py-3 flex items-center justify-between shadow-lg">
      <div className="font-bold">
        <img src="/images/navbarLogo.png" alt="Logo" className="w-15" />
      </div>

      <div className="hidden md:flex gap-6 text-sm">
        <Link href="/privacy"> Privacy</Link>
        <Link href="/term-and-conditions"> Term and Service</Link>
        <Link href="/disclaimer"> Disclaimer</Link>
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
