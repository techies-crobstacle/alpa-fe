"use client";

import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex overflow-hidden">
      {/* LEFT PANEL */}
      <section
        className="relative w-1/2 flex flex-col justify-center px-20 text-white
        bg-linear-to-r from-[#7A2F12] via-[#8E3A18] to-[#9B3F1A]"
      >
        {/* Logo */}
        <div className="absolute top-8 left-8">
          <Image
            src="/images/navbarLogo.png"
            alt="Logo"
            width={90}
            height={90}
          />
        </div>

        {/* Content */}
        <div className="max-w-md">
          <p className="uppercase text-xs tracking-widest mb-4 opacity-80">
            Start for free
          </p>

          <h1 className="text-4xl font-bold mb-2">Log into your account</h1>

          <p className="text-sm mb-10 opacity-80">
            New here?{" "}
            <Link
              href="/signup"
              className="font-semibold underline hover:opacity-100 transition"
            >
              Sign up
            </Link>
          </p>

          {/* Form */}
          <form className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-full px-5 py-3 bg-black/20 placeholder-white/70 outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-full px-5 py-3 bg-black/20 placeholder-white/70 outline-none"
            />

            <button
              type="submit"
              className="w-full mt-6 bg-white text-[#7A2F12] font-semibold
              rounded-full py-3 flex items-center justify-center gap-2"
            >
              Button CTA →
            </button>
          </form>
        </div>
      </section>

      {/* RIGHT IMAGE PANEL */}
      <section className="relative w-1/2">
        <Image
          src="/images/top2.jpg"
          alt="Auth Visual"
          fill
          className="object-cover"
          priority
        />

        {/* Gradient blend */}
        <div
          className="absolute inset-0 bg-linear-to-r
          from-[#9B3F1A] via-[#9B3F1A]/40 to-transparent"
        ></div>
      </section>
    </main>
  );
}
