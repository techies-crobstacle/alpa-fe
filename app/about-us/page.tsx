"use client";
import React from "react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

// ── Animated counter ──────────────────────────────────────────────────────────
type CounterProps = { end: number; suffix?: string };

function Counter({ end, suffix = "" }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const steps = 60;
          const increment = end / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, 2000 / steps);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ── Stats data ────────────────────────────────────────────────────────────────
const STATS = [
  { end: 8000,  suffix: "+", label: "Happy Customers",   desc: "Customers who trust us and return for our quality products and service." },
  { end: 12000, suffix: "+", label: "Orders Delivered",  desc: "Orders shipped across Australia with care, speed, and reliability." },
  { end: 30000, suffix: "+", label: "Products Listed",   desc: "A curated catalogue spanning hundreds of categories and brands." },
  { end: 50000, suffix: "+", label: "Community Members", desc: "A growing community of shoppers who share our passion for quality." },
];

// ── Values data ───────────────────────────────────────────────────────────────
const VALUES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Trust & Integrity",
    desc: "We operate with full transparency — honest pricing, genuine products, and no hidden surprises.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    title: "Quality First",
    desc: "Every product in our catalogue is hand-picked and held to a high standard before it reaches you.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: "Community Focused",
    desc: "We believe shopping should bring people together — building a community around shared passions.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Fast & Reliable",
    desc: "From checkout to doorstep — we obsess over speed, accuracy, and keeping you in the loop.",
  },
];

export default function Page() {
  return (
    <main className="bg-white text-gray-900 overflow-x-hidden">

      {/* ══════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════ */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-[url('/images/main.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/50 to-black/70" />
        <div className="relative z-10 text-white text-center px-4 max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-white/60 mb-4">Our Story</p>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Built with <span className="text-[#d9a87a]">passion.</span><br />
            Driven by people.
          </h1>
          <p className="text-base md:text-lg text-white/75 max-w-xl mx-auto leading-relaxed">
            We started Alpa to make premium shopping accessible, honest, and
            delightful — for everyone, everywhere in Australia.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/shop" className="px-7 py-3 bg-[#5A1E12] hover:bg-[#441208] text-white rounded-full text-sm font-semibold transition-all shadow-lg hover:shadow-xl">
              Shop Now
            </Link>
            <a href="#our-story" className="px-7 py-3 border border-white/40 hover:border-white text-white rounded-full text-sm font-semibold transition-all">
              Learn More ↓
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          MISSION STRIP
      ══════════════════════════════════════════════════ */}
      <section className="bg-[#5A1E12] py-5 px-4">
        <p className="text-center text-white/80 text-sm font-medium tracking-wide max-w-2xl mx-auto">
          🌿 &nbsp;Sustainably sourced &nbsp;·&nbsp; 🚚 Fast Australia-wide delivery &nbsp;·&nbsp; ⭐ Trusted by 8,000+ customers
        </p>
      </section>

      {/* ══════════════════════════════════════════════════
          OUR STORY
      ══════════════════════════════════════════════════ */}
      <section id="our-story" className="py-20 md:py-28 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Image */}
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-full h-full rounded-2xl bg-[#F4E9DC] -z-10" />
            <Image
              src="/images/about2.png"
              alt="Our story"
              width={800}
              height={600}
              className="w-full h-80 md:h-120 object-cover rounded-2xl shadow-xl"
            />
          </div>

          {/* Text */}
          <div>
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#5A1E12] mb-3">Who We Are</p>
            <h2 className="text-3xl md:text-4xl font-bold leading-snug mb-5">
              A marketplace built on <span className="text-[#5A1E12]">values, not just products.</span>
            </h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              Alpa was born from a simple frustration — finding quality products online shouldn&apos;t feel like a gamble.
              We set out to build a platform where every listing is curated, every seller is vetted, and every customer
              feels looked after.
            </p>
            <p className="text-gray-500 leading-relaxed mb-8">
              From our first sale to thousands of happy deliveries, we&apos;ve stayed true to our founding belief: great
              commerce is built on trust. We&apos;re not just a marketplace — we&apos;re the team behind every package
              that arrives at your door.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F4E9DC] flex items-center justify-center text-[#5A1E12] shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 font-medium">Founded in Australia &middot; 100% locally operated</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════════ */}
      <section className="bg-[#F4E9DC] py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#5A1E12] mb-2">By The Numbers</p>
            <h2 className="text-3xl md:text-4xl font-bold">Growing every day.</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e8d5c0] text-center">
                <p className="text-3xl md:text-4xl font-black text-[#5A1E12] mb-1">
                  <Counter end={s.end} suffix={s.suffix} />
                </p>
                <p className="font-semibold text-sm mb-2">{s.label}</p>
                <p className="text-xs text-gray-400 leading-relaxed hidden md:block">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          WHAT WE OFFER  (two-column challenge section)
      ══════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 px-4 border-t border-gray-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start">
          <div className="lg:sticky lg:top-24">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#5A1E12] mb-3">The Challenge</p>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">What we<br />Offer</h2>
          </div>
          <div className="space-y-6">
            <p className="text-lg md:text-xl font-semibold text-gray-800 leading-relaxed">
              We offer a carefully curated marketplace where quality, convenience, and trust come together in one seamless experience.
            </p>
            <p className="text-gray-500 leading-relaxed">
              From everyday essentials to specialty products, our catalogue is built around real customer needs.
              Every category is managed by a dedicated team who reviews listings, compares pricing, and ensures
              the standards we promise are the standards you receive.
            </p>
            <p className="text-gray-500 leading-relaxed">
              We also partner closely with sellers to provide tools, insights, and support — so the businesses on our
              platform thrive, and in turn, so do you.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          OUR VALUES
      ══════════════════════════════════════════════════ */}
      <section className="bg-[#F4E9DC] py-20 md:py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#5A1E12] mb-2">Our Values</p>
            <h2 className="text-3xl md:text-4xl font-bold">What drives us forward.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-6 border border-[#e8d5c0] shadow-sm hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-[#5A1E12]/10 flex items-center justify-center text-[#5A1E12] mb-4">
                  {v.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          IMAGE + COPY  (What We Offer detail row)
      ══════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Text */}
          <div>
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#5A1E12] mb-3">Why Choose Us</p>
            <h2 className="text-3xl md:text-4xl font-bold leading-snug mb-5">
              Shopping that feels <span className="text-[#5A1E12]">personal.</span>
            </h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              We believe every purchase should feel intentional. That&apos;s why our team works hard to surface products
              that genuinely match what our customers are looking for — not just what&apos;s trending.
            </p>
            <p className="text-gray-500 leading-relaxed mb-8">
              Whether you&apos;re buying for yourself or gifting someone you love, Alpa is built to make it easy,
              enjoyable, and reliable — every single time.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#5A1E12] hover:bg-[#441208] text-white rounded-full py-3 px-8 text-sm font-semibold transition-all shadow-md hover:shadow-lg"
            >
              Explore Our Shop
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="absolute -bottom-4 -right-4 w-full h-full rounded-2xl bg-[#5A1E12]/8 -z-10" />
            <Image
              src="/images/about-us-what-we-offer.jpg"
              alt="What we offer"
              width={800}
              height={600}
              className="w-full h-80 md:h-115 object-cover rounded-2xl shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════════ */}
      <section className="bg-[#5A1E12] py-16 md:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to start shopping?</h2>
          <p className="text-white/65 text-base mb-8 leading-relaxed">
            Join thousands of Australians who trust Alpa for quality products, fast delivery, and genuine service.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/shop" className="px-8 py-3 bg-white text-[#5A1E12] hover:bg-[#F4E9DC] rounded-full text-sm font-bold transition-all shadow-md">
              Shop Now
            </Link>
            <Link href="/contact-us" className="px-8 py-3 border border-white/40 hover:border-white text-white rounded-full text-sm font-semibold transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}