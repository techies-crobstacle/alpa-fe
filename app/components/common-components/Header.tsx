"use client";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <div className="mx-auto rounded-full bg-[#EAD7B7] px-6 py-3 flex items-center justify-between shadow-lg">
      <Link href="/" className="font-bold">
        <Image
          src="/images/navbarLogo.png"
          width={500}
          height={500}
          alt="Logo"
          className="w-15"
        />
      </Link>

      <div className="hidden md:flex gap-6 ">
        <Link href="/privacy" className="animated-underline center slow">
          Privacy
        </Link>
        <Link
          href="/term-and-conditions"
          className="animated-underline center slow"
        >
          {" "}
          Term and Service
        </Link>
        <Link href="/disclaimer" className="animated-underline center slow">
          {" "}
          Disclaimer
        </Link>
        <Link href="/about-us" className="animated-underline center slow">
          {" "}
          About us
        </Link>
        <Link href="/contact-us" className="animated-underline ">
          {" "}
          Contact-Us
        </Link>
        <span>Experience</span>
        <span>About</span>
        <span>Community</span>
      </div>

      <button className="rounded-full bg-[#5A1E12] px-8 py-1 text-white">
        Sign in
      </button>
    </div>
  );
}
