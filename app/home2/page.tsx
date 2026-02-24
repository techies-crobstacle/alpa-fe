"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useProducts } from "@/hooks/useProducts";
import OptimisticProductCard from "@/components/cards/OptimisticProductCard";
import Link from "next/link";
import { motion } from "framer-motion";

const SLIDE_COUNT = 2;

const Page = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const productScrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const limitedProducts = products.slice(0, 12);

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

  const scrollProductByOne = (direction: 1 | -1) => {
    if (productScrollRef.current) {
      const card = productScrollRef.current.children[0] as HTMLElement;
      const gap = 24; // gap-6 = 1.5rem = 24px
      const cardWidth = card ? card.offsetWidth + gap : 300;
      productScrollRef.current.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen bg-[#EAD7B7]">

      {/* ================= HERO ================= */}
      <section>
        <div className="relative min-h-screen overflow-hidden bg-[url('/images/main.png')] bg-cover bg-center bg-fixed">
          {/* Layered gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-b from-amber-900/70 via-amber-900/40 to-black/80" />
          <div className="absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-transparent" />

          {/* Aboriginal waterhole — top right */}
          {/* <svg aria-hidden="true" viewBox="0 0 180 180" fill="none" className="absolute top-6 right-6 md:top-10 md:right-12 w-36 h-36 md:w-52 md:h-52 text-white opacity-[0.08] pointer-events-none">
            {[80,60,42,26,12].map((r, i) => (
              <circle key={r} cx="90" cy="90" r={r} stroke="currentColor" strokeWidth="1.3" strokeDasharray="4 3" opacity={1 - i * 0.15} />
            ))}
            <circle cx="90" cy="90" r="5" fill="currentColor" />
            {[[90,4],[90,176],[4,90],[176,90]].map(([cx,cy],i)=>(<circle key={i} cx={cx} cy={cy} r="3" fill="currentColor" />))}
            {[[90,22],[90,158],[22,90],[158,90]].map(([cx,cy],i)=>(<circle key={i} cx={cx} cy={cy} r="2" fill="currentColor" />))}
            {[[90,40],[90,140],[40,90],[140,90]].map(([cx,cy],i)=>(<circle key={i} cx={cx} cy={cy} r="2" fill="currentColor" />))}
            {[[32,32],[148,32],[32,148],[148,148]].map(([cx,cy],i)=>(<circle key={i} cx={cx} cy={cy} r="2" fill="currentColor" opacity="0.6" />))}
            {[[51,51],[129,51],[51,129],[129,129]].map(([cx,cy],i)=>(<circle key={i} cx={cx} cy={cy} r="1.5" fill="currentColor" opacity="0.5" />))}
          </svg> */}

          {/* Aboriginal spiral — bottom left */}
          {/* <svg aria-hidden="true" viewBox="0 0 120 120" fill="none" className="absolute bottom-20 left-4 md:bottom-28 md:left-10 w-24 h-24 md:w-36 md:h-36 text-amber-200 opacity-[0.10] pointer-events-none">
            <path d="M60,60 C65,60 70,55 70,50 C70,45 65,40 60,40 C50,40 40,50 40,60 C40,72 50,82 62,82 C76,82 90,70 90,56 C90,38 76,24 58,22 C36,20 18,38 18,60 C18,84 38,102 62,102" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="3 2" strokeLinecap="round" />
            <circle cx="60" cy="60" r="4" fill="currentColor" />
            {[{cx:70,cy:50},{cx:40,cy:60},{cx:62,cy:82},{cx:90,cy:56},{cx:18,cy:60},{cx:58,cy:22}].map((d,i)=>(<circle key={i} cx={d.cx} cy={d.cy} r="2" fill="currentColor" opacity="0.7" />))}
          </svg> */}

          {/* Dot field — scattered right side */}
          {/* <svg aria-hidden="true" viewBox="0 0 160 280" fill="none" className="absolute right-0 top-1/4 w-28 md:w-40 h-auto text-amber-100 opacity-[0.07] pointer-events-none">
            {[
              [20,20,3],[50,12,2],[80,28,2.5],[110,16,2],[140,30,3],
              [10,55,2],[45,48,2.5],[78,62,2],[105,50,2.5],[138,58,3],
              [25,88,2.5],[58,80,2],[90,95,3],[118,84,2],[148,92,2.5],
              [15,122,2],[52,115,2.5],[82,128,2],[112,118,3],[145,126,2],
              [30,158,3],[60,148,2],[92,162,2.5],[122,152,2],[150,160,2.5],
              [18,192,2],[55,185,3],[85,198,2],[116,188,2.5],[148,195,2],
            ].map(([cx,cy,r],i)=>(<circle key={i} cx={cx} cy={cy} r={r} fill="currentColor" />))}
          </svg> */}

          {/* Hero content */}
          <div className="relative z-10 flex flex-col justify-center min-h-screen text-white px-6 sm:px-10 lg:px-24 pt-40 pb-24">

            {/* Animated badge */}
            {/* <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-300/40 bg-amber-900/30 backdrop-blur-sm text-amber-200 text-xs font-semibold tracking-[0.18em] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
                Authentic Aboriginal Art &amp; Culture
              </span>
            </motion.div> */}

            {/* Headline */}
            <div className="overflow-hidden mb-2">
              <motion.h1
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight"
              >
                Discover the Spirit of
              </motion.h1>
            </div>
            <div className="overflow-hidden mb-6 md:mb-8">
              <motion.h1
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.75, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight text-amber-200"
              >
                Arnhem Land
              </motion.h1>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.58, ease: "easeOut" }}
              className="text-sm sm:text-base lg:text-lg max-w-lg mb-10 leading-relaxed text-white/75"
            >
              Authentic Aboriginal products and experiences — each carrying
              stories passed down through thousands of generations.
            </motion.p>

            {/* CTA Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.74, ease: "easeOut" }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-16 md:mb-20"
            >
              <Link
                href="/shop"
                className="group relative inline-flex items-center gap-2 px-8 py-3.5 bg-[#803512] hover:bg-[#a0451a] text-white font-semibold text-sm tracking-wide uppercase rounded-sm transition-all duration-300 shadow-[0_8px_24px_rgba(128,53,18,0.45)] hover:shadow-[0_12px_32px_rgba(128,53,18,0.55)] hover:-translate-y-0.5 active:translate-y-0"
              >
                Start Your Journey
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/30 hover:border-white/70 text-white/80 hover:text-white font-medium text-sm tracking-wide uppercase rounded-sm transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                Explore Art
              </Link>
            </motion.div>

            {/* Stats strip */}
            {/* <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9, ease: "easeOut" }}
              className="flex flex-wrap items-center gap-6 sm:gap-10"
            >
              {[
                { value: "8,000+", label: "Happy Customers" },
                { value: "30,000+", label: "Products Listed" },
                { value: "100%", label: "Locally Operated" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  {i > 0 && <div className="hidden sm:block w-px h-8 bg-white/20" />}
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-amber-200 leading-none">{s.value}</p>
                    <p className="text-xs text-white/50 mt-0.5 tracking-wide">{s.label}</p>
                  </div>
                </div>
              ))}
            </motion.div> */}
          </div>

          {/* Scroll indicator */}
          {/* <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40"
          >
            <span className="text-[10px] tracking-[0.2em] uppercase font-medium">Scroll</span>
            <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
          </motion.div> */}
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
      <section className="relative max-w-screen-2xl mx-auto py-20 px-12 overflow-hidden">

        {/* ── ABORIGINAL PATTERN: TOP-RIGHT ── */}
        <div className="absolute top-0 right-0 w-72 h-72 sm:w-96 sm:h-96 pointer-events-none opacity-[0.13]" aria-hidden="true">
          <svg viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {[40,80,120,160,200,240,280,330].map((r, i) => (
              <path
                key={r}
                d={`M ${380} ${380 - r} A ${r} ${r} 0 0 0 ${380 - r} ${380}`}
                stroke="#632013"
                strokeWidth={i % 2 === 0 ? 2.5 : 1.5}
                strokeLinecap="round"
              />
            ))}
            {Array.from({ length: 10 }).map((_, i) => {
              const angle = (Math.PI / 2) * (i / 9);
              const r = 60;
              const cx = 380 - r * Math.cos(angle);
              const cy = 380 - r * Math.sin(angle);
              return <circle key={i} cx={cx} cy={cy} r="4" fill="#803512" />;
            })}
            {Array.from({ length: 14 }).map((_, i) => {
              const angle = (Math.PI / 2) * (i / 13);
              const r = 140;
              const cx = 380 - r * Math.cos(angle);
              const cy = 380 - r * Math.sin(angle);
              return <circle key={i} cx={cx} cy={cy} r="3" fill="#632013" />;
            })}
            {Array.from({ length: 18 }).map((_, i) => {
              const angle = (Math.PI / 2) * (i / 17);
              const r = 220;
              const cx = 380 - r * Math.cos(angle);
              const cy = 380 - r * Math.sin(angle);
              return <circle key={i} cx={cx} cy={cy} r="2.5" fill="#a0451a" />;
            })}
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = (Math.PI / 2) * ((i + 0.5) / 6);
              const r = 100;
              const cx = 380 - r * Math.cos(angle);
              const cy = 380 - r * Math.sin(angle);
              return (
                <g key={i} transform={`translate(${cx},${cy}) rotate(${(angle * 180) / Math.PI - 45})`}>
                  <line x1="-5" y1="0" x2="5" y2="0" stroke="#632013" strokeWidth="2" strokeLinecap="round" />
                  <line x1="0" y1="-5" x2="0" y2="5" stroke="#632013" strokeWidth="2" strokeLinecap="round" />
                </g>
              );
            })}
          </svg>
        </div>

        {/* ── ABORIGINAL PATTERN: BOTTOM-LEFT ── */}
        <div className="absolute bottom-0 left-0 w-72 h-72 sm:w-96 sm:h-96 pointer-events-none opacity-[0.13]" aria-hidden="true">
          <svg viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {[0, 28, 56, 84, 112, 140, 168, 196].map((offset, i) => (
              <path
                key={offset}
                d={`M -20 ${320 - offset} C 40 ${310 - offset}, 90 ${330 - offset}, 150 ${318 - offset} S 240 ${305 - offset}, 300 ${320 - offset} S 370 ${330 - offset}, 410 ${318 - offset}`}
                stroke="#632013"
                strokeWidth={i % 3 === 0 ? 3 : 1.8}
                strokeLinecap="round"
              />
            ))}
            {[
              [30,295],[75,280],[130,300],[190,285],[250,295],[310,278],
              [55,265],[115,252],[175,268],[235,255],[295,265],
              [20,240],[80,228],[145,242],[210,230],[270,244],
              [50,215],[110,200],[170,216],[240,205],[300,218],
              [35,188],[100,175],[165,190],[225,178],[285,192],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r={i % 4 === 0 ? 5 : 3} fill="#803512" />
            ))}
            {[[40,360],[90,355],[140,358]].map(([x, y], i) => (
              <path
                key={i}
                d={`M ${x - 12} ${y - 20} Q ${x} ${y + 8} ${x + 12} ${y - 20}`}
                stroke="#632013"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            ))}
          </svg>
        </div>

        <div>
          <h2 className="text-center text-4xl font-bold text-[#632013] mb-14">
            Explore Our Products
          </h2>
            {/* Exmaple */}
          {/* Product Carousel */}
          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={() => scrollProductByOne(-1)}
              className="absolute -left-6 top-1/2 -translate-y-1/2 z-30 bg-[#632013] hover:bg-[#803512] text-white p-2 rounded-full hidden md:flex items-center justify-center transition-all shadow-lg cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Arrow */}
            <button
              onClick={() => scrollProductByOne(1)}
              className="absolute -right-6 top-1/2 -translate-y-1/2 z-30 bg-[#632013] hover:bg-[#803512] text-white p-2 rounded-full hidden md:flex items-center justify-center transition-all shadow-lg cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Scrollable Cards */}
            <div
              ref={productScrollRef}
              className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {productsLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="shrink-0 snap-start w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] animate-pulse rounded-xl border border-stone-100 shadow-sm overflow-hidden bg-white flex flex-col"
                    >
                      {/* ── IMAGE SECTION ── */}
                      <div className="relative aspect-[6/4 bg-stone-100 overflow-hidden">
                        {/* Logo placeholder (top-left) */}
                        <div className="absolute top-3 left-3 z-10 w-10 h-10 rounded-md bg-stone-200" />
                        {/* Full image wash */}
                        <div className="absolute inset-0 bg-stone-200" />
                      </div>

                      {/* ── DETAILS SECTION ── */}
                      <div className="flex flex-col grow p-4 bg-white gap-y-3">
                        {/* Row: artist label + 5 stars */}
                        <div className="flex justify-between items-center">
                          <div className="h-2.5 w-20 rounded bg-stone-200" />
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <div key={j} className="h-3 w-3 rounded-sm bg-stone-200" />
                            ))}
                          </div>
                        </div>

                        {/* Title */}
                        <div className="space-y-1.5">
                          <div className="h-4 w-4/5 rounded bg-stone-200" />
                          <div className="h-4 w-2/5 rounded bg-stone-200" />
                        </div>

                        {/* Description — 2 lines */}
                        <div className="space-y-1.5">
                          <div className="h-3 w-full rounded bg-stone-200" />
                          <div className="h-3 w-3/4 rounded bg-stone-200" />
                        </div>

                        {/* Tags */}
                        <div className="flex gap-1.5">
                          <div className="h-5 w-14 rounded-sm bg-stone-200" />
                          <div className="h-5 w-16 rounded-sm bg-stone-200" />
                        </div>

                        {/* Footer: price + buttons */}
                        <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between">
                          {/* Price block */}
                          <div className="space-y-1">
                            <div className="h-2.5 w-8 rounded bg-stone-200" />
                            <div className="h-5 w-16 rounded bg-stone-200" />
                          </div>
                          {/* Wishlist circle + Cart pill */}
                          <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-full bg-stone-200" />
                            <div className="h-10 w-24 rounded-full bg-stone-200" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                : limitedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="shrink-0 snap-start w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
                    >
                      <OptimisticProductCard
                        id={product.id}
                        photo={product.featuredImage || product.images?.[0] || "/images/placeholder.png"}
                        name={product.title}
                        description={product.description}
                        amount={parseFloat(product.price)}
                        stock={product.stock}
                        slug={product.slug}
                        rating={product.rating}
                        tags={product.tags}
                        featured={product.featured}
                        artistName={product.artistName}
                      />
                    </div>
                  ))}
            </div>
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

    </main>
  );
};

export default Page;
