"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useProducts } from "@/hooks/useProducts";
import OptimisticProductCard from "@/components/cards/OptimisticProductCard";
import Link from "next/link";

const SLIDE_COUNT = 2;

const Page = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const { data: products = [] } = useProducts();
  const limitedProducts = products.slice(0, 4);

  const scrollToSlide = (index: number) => {
    if (scrollRef.current) {
      const slideWidth = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: slideWidth * index,
        behavior: "smooth",
      });
      setActiveSlide(index);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const index = Math.round(el.scrollLeft / el.offsetWidth);
      setActiveSlide(index);
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-[#EAD7B7] ">
      {/* ================= HERO ================= */}
      <section>
        <div className="relative min-h-screen overflow-hidden bg-[url('/images/main.png')] bg-cover bg-center bg-fixed">
          {/* Using standard Tailwind v3 gradient syntax for compatibility */}
          <div className="absolute inset-0 bg-linear-to-b from-amber-900/60 via-amber-900/30 to-black/70"></div>

          <div className="relative z-10 flex flex-col justify-center text-white px-4 sm:px-6 lg:px-24 py-32 md:py-40 lg:py-60">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Discover the Spirit of
            </h1>
            <h1 className="text-3xl sm:text-4xl font-bold mb-6 md:mb-8 text-amber-100">
              Arnhem Land
            </h1>
            <p className="text-sm sm:text-base max-w-2xl mb-8 leading-relaxed text-gray-100/90">
              Discover authentic Aboriginal products and experiences, each
              carrying stories passed down through thousands of generations.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <button className="px-8 py-3 bg-[#803512] hover:bg-[#a0451a] text-white font-medium transition-all duration-300 rounded-sm tracking-wide uppercase text-xs sm:text-sm">
                Start Your Journey
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES & SPONSOR CAROUSEL ================= */}
      <section className="relative bg-[#632013] p-4 sm:p-6 lg:p-8  lg:pt-12 rounded-2xl lg:rounded-4xl mx-2 sm:mx-4 lg:mx-10 -mt-8 sm:-mt-12 lg:-mt-20 ">
        <div className="flex flex-col w-full">
          {/* CAROUSEL WRAPPER */}
          <div className="relative group w-full px-0 sm:px-6">
            {/* Scrolling Container */}
            <div
              ref={scrollRef}
              className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth gap-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {/* SLIDE 1: Australia Post */}
              <div className="min-w-full snap-center px-1">
                <div className="flex flex-col md:flex-row w-full rounded-3xl overflow-hidden bg-[#803512]">
                  <div className="relative w-full md:w-1/2  bg-[url('/images/ap.jpg')] bg-cover bg-right shrink-0">
                    <div className="absolute inset-0 bg-black/5"></div>
                  </div>
                  <div className="relative w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center text-white">
                    <div className="absolute top-0 bottom-0 -left-10 lg:-left-16 w-12 lg:w-20 hidden md:block text-[#803512]">
                      <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="h-full w-full fill-[#803512]"
                      >
                        <path d="M 100 0 L 100 100 L 0 100 Q 50 50 0 0 Z" />
                      </svg>
                    </div>
                    <div className="relative z-10">
                      <div className="mb-6 absolute top-0 right-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-black/20 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-2 animate-pulse"></span>
                          Sponsored
                        </span>
                      </div>
                      <h2 className="text-3xl lg:text-4xl font-bold mb-3 leading-tight">
                        Delivering <br />
                        <span className="text-orange-200">For Australia</span>
                      </h2>
                      <p className="text-orange-50/80 text-sm lg:text-base leading-relaxed mb-8 max-w-md">
                        Connecting you to more of what you love. Making every
                        delivery count across the country.
                      </p>
                      <button className="bg-white text-[#803512] px-8 py-3 rounded-full text-xs font-bold uppercase shadow-lg hover:bg-orange-50 transition-colors">
                        View Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SLIDE 2: Government Services (Medicare / Service Australia) */}
              <div className="min-w-full snap-center px-1">
                <div className="flex flex-col md:flex-row w-full rounded-3xl overflow-hidden bg-[#803512]">
                  <div className="relative w-full md:w-1/2 bg-[url('/images/medicare.jpg')] bg-cover bg-center shrink-0">
                    <div className="absolute inset-0 bg-black/10"></div>
                  </div>
                  <div className="relative w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center text-white">
                    <div className="absolute top-0 bottom-0 -left-10 lg:-left-16 w-12 lg:w-20 hidden md:block text-[#803512]">
                      <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="h-full w-full fill-[#803512]"
                      >
                        <path d="M 100 0 L 100 100 L 0 100 Q 50 50 0 0 Z" />
                      </svg>
                    </div>
                    <div className="relative z-10">
                      <div className="mb-6 absolute top-0 right-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-black/20 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-2 animate-pulse"></span>
                          Government
                        </span>
                      </div>
                      <h2 className="text-3xl lg:text-4xl font-bold mb-3 leading-tight">
                        Support For <br />
                        <span className="text-orange-200">Your Wellbeing</span>
                      </h2>
                      <p className="text-orange-50/80 text-sm lg:text-base leading-relaxed mb-8 max-w-md">
                        Accessing essential healthcare and community services.
                        We're here to support every Australian's health journey.
                      </p>
                      <button className="bg-white text-[#803512] px-8 py-3 rounded-full text-xs font-bold uppercase shadow-lg hover:bg-orange-50 transition-colors">
                        Access Services
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dot Navigation */}
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToSlide(i)}
                  className={`transition-all duration-300 rounded-full ${
                    activeSlide === i
                      ? "w-6 h-2.5 bg-white"
                      : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* STATIC CARDS GRID */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-white">
            <div className="relative col-span-1 h-64 sm:h-72 lg:h-80 rounded-2xl lg:rounded-3xl overflow-hidden bg-[url('/images/woodenfluet.jpg')] bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-500">
              <div className="absolute inset-0 bg-black/30"></div>
              <div className="relative z-10 p-6 h-full flex flex-col justify-end">
                <h1 className="text-xl sm:text-2xl font-bold mb-2">
                  Artisan Crafts
                </h1>
                <p className="text-xs opacity-90">
                  Traditional techniques meets modern design.
                </p>
              </div>
            </div>

            <div className="relative col-span-1 h-64 sm:h-72 lg:h-80 rounded-2xl lg:rounded-3xl overflow-hidden bg-[url('/images/color-rock.jpg')] bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-500">
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
              <div className="relative z-10 p-6 h-full flex flex-col justify-end">
                <h3 className="text-lg font-bold mb-2">Ancient Lore</h3>
                <p className="text-xs opacity-90">
                  Stories passed down through generations.
                </p>
              </div>
            </div>

            <div className="relative col-span-1 md:col-span-2 h-64 sm:h-72 lg:h-80 rounded-2xl lg:rounded-3xl overflow-hidden bg-[url('/images/mid3.jpg')] bg-cover bg-center hover:scale-[1.01] transition-all duration-500">
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
              <div className="relative z-10 p-6 lg:p-10 h-full flex flex-col justify-end">
                <h3 className="text-xl lg:text-3xl font-bold mb-2">
                  Cultural Heritage
                </h3>
                <p className="text-sm opacity-90">
                  Explore the oldest living culture on Earth.
                </p>
              </div>
            </div>
          </div> */}
      </section>

      {/* Fetch the Product cards dynamically  */}
      <section className="max-w-screen-2xl mx-auto py-20 px-12">
        <div>
          <h2 className="text-center text-4xl font-bold text-[#632013] mb-14">
            Explore Our Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {limitedProducts.map((product) => (
              <OptimisticProductCard
                key={product.id}
                id={product.id}
                photo={product.featuredImage || product.images?.[0] || "/images/placeholder.png"}
                name={product.title}
                description={product.description}
                amount={parseFloat(product.price)}
                stock={product.stock}
                slug={product.slug}
                rating={4.5} // Default rating since product doesn't have it
                tags={product.tags}
                featured={product.featured}
                artistName={product.artistName}
              />
            ))}
          </div>
          <div className="flex justify-center mt-10">
            <Link
              href="/shop"
              className="px-8 py-2 bg-amber-900 text-white rounded-lg hover:bg-amber-800 transition"
            >
              View All
            </Link>
          </div>
        </div>
      </section>

      {/* STATIC VIDEO SECTION */}
      <section className="max-w-screen-2xl mx-auto pb-20 px-12">
        <div className="flex flex-col justify-center items-center text-center">
          <h2 className="font-bold text-lg sm:text-xl lg:text-4xl max-w-4xl mb-8 leading-relaxed text-center text-[#762a1b]">
            Journey through the heart of{" "}
            <span className="text-[#52160a]">Arnhem Land.</span>
          </h2>
          <div className="relative w-full max-w-5xl h-48 sm:h-64 lg:h-96 rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/images/video-temp.jpg"
              alt="Video preview"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Cultural Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-20 px-4 sm:px-6 lg:px-16 xl:px-20 py-12 sm:py-16 lg:py-24 items-end mb-12 sm:mb-20">
        <div className="max-w-2xl">
          <p className="text-sm sm:text-base lg:text-lg font-medium leading-relaxed text-gray-700">
            Discover authentic Aboriginal products and experiences, each
            carrying stories passed down through thousands of generations.
          </p>

          <svg
            className="mt-6 lg:mt-8 w-full h-6 lg:h-8"
            viewBox="0 0 400 30"
            fill="none"
          >
            <path
              d="M5 15 C60 5, 120 25, 180 15 C240 5, 300 25, 395 15"
              stroke="#6B2C1A"
              strokeWidth="4"
              strokeLinecap="round"
              className="animate-pulse"
            />
          </svg>

          <p className="mt-6 lg:mt-8 text-lg sm:text-xl lg:text-2xl font-bold text-[#6B2C1A] mb-8 lg:mb-12">
            01/07
          </p>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
            Explore our{" "}
            <span className="text-amber-900">Cultural Categories</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 xl:gap-8">
          {/* Image Cards */}
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="relative h-64 lg:h-80 xl:h-96 rounded-2xl lg:rounded-3xl overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
              <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-3 text-center">
                <h3 className="text-xs font-bold text-gray-900">
                  Category {item}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Page;
