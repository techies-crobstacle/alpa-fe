"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Privacy", href: "/privacy" },
  { label: "Term and Service", href: "/term-and-conditions" },
  { label: "Disclaimer", href: "/disclaimer" },
  { label: "About us", href: "/about-us" },
  { label: "Contact-Us", href: "/contact-us" },
];

export default function Header() {
  const pathname = usePathname();

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="mx-auto rounded-full bg-[#EAD7B7] px-6 py-3 flex items-center justify-between shadow-lg">
      
      {/* Logo */}
      <Link href="/" className="font-bold">
        <Image
          src="/images/navbarLogo.png"
          width={500}
          height={500}
          alt="Logo"
          className="w-15"
          priority
        />
      </Link>

      {/* Desktop Nav */}
      <nav className="hidden md:flex gap-6">
        {NAV_LINKS.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={`animated-underline center slow ${
              isActive(href) ? "active" : ""
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* CTA */}
      <Link
        href="/signup"
        className="rounded-full bg-[#5A1E12] px-8 py-1 text-white"
      >
        Sign Up
      </Link>
    </div>
  );
}
